import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { kidDocToEhKid, toAttempt } from "./lib/attemptMap";
import { getMissionById } from "./lib/missionCatalog";
import { requireOwnedKid, requireParent } from "./lib/parents";
import { assertValidPin, hashPin, verifyPin as verifyPinHash } from "./lib/pin";
import { kidPublicValidator, parentStatsValidator } from "./lib/validators";
import { toPublicKid } from "./lib/kidPublic";
import { computeWeakSkillTags } from "../lib/eh/pure/skillTags";

export const verifyPin = mutation({
  args: {
    pin: v.string(),
  },
  returns: v.object({
    ok: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const parent = await requireParent(ctx);
    const ok = await verifyPinHash(args.pin, parent.pinHash);
    return { ok };
  },
});

export const setPin = mutation({
  args: {
    pin: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const parent = await requireParent(ctx);
    assertValidPin(args.pin);
    const pinHash = await hashPin(args.pin);
    await ctx.db.patch("parents", parent._id, {
      pinHash,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const setReminderEnabled = mutation({
  args: {
    enabled: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const parent = await requireParent(ctx);
    await ctx.db.patch("parents", parent._id, {
      reminderEnabled: args.enabled,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const getParentStats = query({
  args: {
    kidId: v.id("kids"),
  },
  returns: parentStatsValidator,
  handler: async (ctx, args) => {
    const { parent, kid } = await requireOwnedKid(ctx, args.kidId);
    const attemptDocs = await ctx.db
      .query("attempts")
      .withIndex("by_kidId", (q) => q.eq("kidId", kid._id))
      .collect();
    const attempts = attemptDocs.map(toAttempt);
    const ehKid = kidDocToEhKid(kid);
    return {
      kidId: kid._id,
      displayName: ehKid.displayName,
      xp: ehKid.xp,
      level: ehKid.level,
      streakDays: ehKid.streakDays,
      missionsCompleted: kid.missionsCompleted,
      weakSkillTags: computeWeakSkillTags(attempts, getMissionById),
      reminderEnabled: parent.reminderEnabled,
    };
  },
});

/** Alias for EhData.parent.updateKidName → kids.rename */
export const updateKidName = mutation({
  args: {
    kidId: v.id("kids"),
    displayName: v.string(),
  },
  returns: kidPublicValidator,
  handler: async (ctx, args) => {
    const displayName = args.displayName.trim();
    if (displayName.length < 1 || displayName.length > 40) {
      throw new Error("Display name must be 1–40 characters");
    }
    const { kid } = await requireOwnedKid(ctx, args.kidId);
    const now = Date.now();
    await ctx.db.patch("kids", kid._id, { displayName, updatedAt: now });
    const updated = await ctx.db.get("kids", kid._id);
    if (!updated) throw new Error("Kid not found");
    return toPublicKid(updated);
  },
});
