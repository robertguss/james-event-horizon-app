import { v } from "convex/values";
import { assertCorrectConnectionMap } from "../lib/eh/pure/reflection";
import { mutation, query } from "./_generated/server";
import { getMissionById } from "./lib/missionCatalog";
import { requireOwnedKid, requireParent } from "./lib/parents";
import { parentRecordingValidator } from "./lib/validators";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireParent(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const save = mutation({
  args: {
    attemptId: v.id("attempts"),
    missionId: v.string(),
    mapCardIds: v.array(v.string()),
    audioStorageId: v.optional(v.id("_storage")),
    audioMimeType: v.optional(v.string()),
    audioDurationSeconds: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const attempt = await ctx.db.get("attempts", args.attemptId);
    if (!attempt) throw new Error("Attempt not found");
    await requireOwnedKid(ctx, attempt.kidId);
    if (attempt.missionId !== args.missionId) {
      throw new Error("Reflection does not match this mission");
    }

    const mission = getMissionById(args.missionId);
    if (!mission) throw new Error("Mission not found");
    assertCorrectConnectionMap(mission, args.mapCardIds);

    if (args.audioStorageId) {
      if (
        !args.audioMimeType ||
        args.audioMimeType.length > 100 ||
        !args.audioDurationSeconds ||
        args.audioDurationSeconds < 1 ||
        args.audioDurationSeconds > 90
      ) {
        throw new Error("Invalid recording metadata");
      }
      const metadata = await ctx.storage.getMetadata(args.audioStorageId);
      if (!metadata || metadata.size > MAX_AUDIO_BYTES) {
        throw new Error("Recording is missing or too large");
      }
    } else if (args.audioMimeType || args.audioDurationSeconds) {
      throw new Error("Recording file is missing");
    }

    const now = Date.now();
    const existing = await ctx.db
      .query("missionReflections")
      .withIndex("by_attemptId", (q) => q.eq("attemptId", args.attemptId))
      .unique();
    if (existing) {
      if (
        existing.audioStorageId &&
        existing.audioStorageId !== args.audioStorageId
      ) {
        await ctx.storage.delete(existing.audioStorageId);
      }
      await ctx.db.patch("missionReflections", existing._id, {
        mapCardIds: args.mapCardIds,
        audioStorageId: args.audioStorageId,
        audioMimeType: args.audioMimeType,
        audioDurationSeconds: args.audioDurationSeconds,
        updatedAt: now,
      });
      return null;
    }

    await ctx.db.insert("missionReflections", {
      kidId: attempt.kidId,
      attemptId: attempt._id,
      missionId: attempt.missionId,
      mapCardIds: args.mapCardIds,
      audioStorageId: args.audioStorageId,
      audioMimeType: args.audioMimeType,
      audioDurationSeconds: args.audioDurationSeconds,
      createdAt: now,
      updatedAt: now,
    });
    return null;
  },
});

export const listRecordings = query({
  args: {
    kidId: v.id("kids"),
  },
  returns: v.array(parentRecordingValidator),
  handler: async (ctx, args) => {
    await requireOwnedKid(ctx, args.kidId);
    const rows = await ctx.db
      .query("missionReflections")
      .withIndex("by_kid_createdAt", (q) => q.eq("kidId", args.kidId))
      .order("desc")
      .collect();

    const recordings = await Promise.all(
      rows.map(async (row) => {
        if (
          !row.audioStorageId ||
          !row.audioDurationSeconds ||
          !row.audioMimeType
        ) {
          return null;
        }
        const audioUrl = await ctx.storage.getUrl(row.audioStorageId);
        if (!audioUrl) return null;
        const mission = getMissionById(row.missionId);
        return {
          id: row._id,
          kidId: row.kidId,
          missionId: row.missionId,
          missionTitle: mission?.title ?? "Mission",
          createdAt: row.createdAt,
          durationSeconds: row.audioDurationSeconds,
          mimeType: row.audioMimeType,
          audioUrl,
          parentGuide: mission?.reflection?.parentGuide ?? "",
        };
      }),
    );

    return recordings.filter((recording) => recording !== null);
  },
});

export const deleteRecording = mutation({
  args: {
    recordingId: v.id("missionReflections"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const recording = await ctx.db.get("missionReflections", args.recordingId);
    if (!recording) return null;
    await requireOwnedKid(ctx, recording.kidId);
    if (recording.audioStorageId) {
      await ctx.storage.delete(recording.audioStorageId);
    }
    await ctx.db.delete("missionReflections", recording._id);
    return null;
  },
});
