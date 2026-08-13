/**
 * Attempt lifecycle — thin I/O over lib/eh/pure/attempt reducers.
 */

import { v } from "convex/values";
import { mergeUnlocks, sectorStampsForClears } from "../lib/cosmetics";
import { reduceComplete, reduceSubmit } from "../lib/eh/pure/attempt";
import {
  blackHoleUnlocked,
  maybeStampBlackHoleUnlockedAt,
} from "../lib/eh/pure/bhGate";
import { assertMissionPlayable } from "../lib/eh/pure/missionLock";
import { localDateString } from "../lib/eh/pure/streak";
import { mutation, query } from "./_generated/server";
import {
  kidDocToEhKid,
  toAttempt,
  toPublicAttempt,
  toPublicLedgerEntry,
} from "./lib/attemptMap";
import { toPublicKid } from "./lib/kidPublic";
import { getMissionById } from "./lib/missionCatalog";
import { requireOwnedKid } from "./lib/parents";
import {
  attemptPublicValidator,
  kidPublicValidator,
  xpLedgerEntryValidator,
} from "./lib/validators";

export const getActive = query({
  args: {
    kidId: v.id("kids"),
    missionId: v.string(),
  },
  returns: v.union(attemptPublicValidator, v.null()),
  handler: async (ctx, args) => {
    await requireOwnedKid(ctx, args.kidId);
    const rows = await ctx.db
      .query("attempts")
      .withIndex("by_kid_mission", (q) =>
        q.eq("kidId", args.kidId).eq("missionId", args.missionId),
      )
      .collect();
    const active = rows.find((r) => r.status === "active");
    return active ? toPublicAttempt(active) : null;
  },
});

export const get = query({
  args: {
    attemptId: v.id("attempts"),
  },
  returns: v.union(attemptPublicValidator, v.null()),
  handler: async (ctx, args) => {
    const attempt = await ctx.db.get("attempts", args.attemptId);
    if (!attempt) return null;
    await requireOwnedKid(ctx, attempt.kidId);
    return toPublicAttempt(attempt);
  },
});

export const start = mutation({
  args: {
    kidId: v.id("kids"),
    missionId: v.string(),
  },
  returns: attemptPublicValidator,
  handler: async (ctx, args) => {
    const { kid } = await requireOwnedKid(ctx, args.kidId);
    const mission = getMissionById(args.missionId);
    if (!mission) throw new Error("Mission not found");

    const now = Date.now();
    assertMissionPlayable({
      mission,
      kid: kidDocToEhKid(kid),
      bhCompletionTimestampsMs: kid.bhCompletionTimestampsMs,
      nowMs: now,
    });

    const existing = await ctx.db
      .query("attempts")
      .withIndex("by_kid_mission", (q) =>
        q.eq("kidId", args.kidId).eq("missionId", args.missionId),
      )
      .collect();
    const active = existing.find((r) => r.status === "active");
    if (active) return toPublicAttempt(active);

    const attemptId = await ctx.db.insert("attempts", {
      kidId: args.kidId,
      missionId: args.missionId,
      status: "active",
      startedAt: now,
      currentQuestionIndex: 0,
      questionResults: [],
      currentHintsUsed: 0,
      hintsByQuestionKey: {},
      xpEarned: 0,
      firstDailyBonus: false,
    });

    const created = await ctx.db.get("attempts", attemptId);
    if (!created) throw new Error("Attempt not found");
    return toPublicAttempt(created);
  },
});

export const submitAnswer = mutation({
  args: {
    attemptId: v.id("attempts"),
    questionKey: v.string(),
    evidenceId: v.optional(v.string()),
    choiceId: v.optional(v.string()),
    /** Ignored by grader — accepted only so clients cannot spoof via schema. */
    claimedCorrect: v.optional(v.boolean()),
  },
  returns: v.object({
    correct: v.boolean(),
    xpAwarded: v.number(),
    hintsUsed: v.number(),
    feedback: v.string(),
    attempt: attemptPublicValidator,
    nextQuestionIndex: v.union(v.number(), v.null()),
  }),
  handler: async (ctx, args) => {
    const attemptDoc = await ctx.db.get("attempts", args.attemptId);
    if (!attemptDoc) throw new Error("Attempt not found");
    await requireOwnedKid(ctx, attemptDoc.kidId);

    const mission = getMissionById(attemptDoc.missionId);
    if (!mission) throw new Error("Mission not found");

    const reduced = reduceSubmit({
      attempt: toAttempt(attemptDoc),
      mission,
      questionKey: args.questionKey,
      evidenceId: args.evidenceId,
      choiceId: args.choiceId,
      claimedCorrect: args.claimedCorrect,
    });

    await ctx.db.patch("attempts", args.attemptId, {
      questionResults: reduced.attempt.questionResults,
      currentHintsUsed: reduced.attempt.currentHintsUsed,
      currentQuestionIndex: reduced.attempt.currentQuestionIndex,
      xpEarned: reduced.attempt.xpEarned,
      hintsByQuestionKey: reduced.attempt.hintsByQuestionKey,
    });

    const updated = await ctx.db.get("attempts", args.attemptId);
    if (!updated) throw new Error("Attempt not found");

    return {
      correct: reduced.correct,
      xpAwarded: reduced.xpAwarded,
      hintsUsed: reduced.hintsUsed,
      feedback: reduced.feedback,
      attempt: toPublicAttempt(updated),
      nextQuestionIndex: reduced.nextQuestionIndex,
    };
  },
});

export const complete = mutation({
  args: {
    attemptId: v.id("attempts"),
  },
  returns: v.object({
    attempt: attemptPublicValidator,
    kid: kidPublicValidator,
    xpBreakdown: v.object({
      questions: v.number(),
      exitTicket: v.number(),
      missionComplete: v.number(),
      firstDaily: v.number(),
      total: v.number(),
    }),
    leveledUp: v.boolean(),
    previousLevel: v.number(),
    ledger: v.array(xpLedgerEntryValidator),
    newSectorStamps: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const attemptDoc = await ctx.db.get("attempts", args.attemptId);
    if (!attemptDoc) throw new Error("Attempt not found");
    const { kid } = await requireOwnedKid(ctx, attemptDoc.kidId);

    const mission = getMissionById(attemptDoc.missionId);
    if (!mission) throw new Error("Mission not found");

    const now = Date.now();
    if (attemptDoc.status !== "completed" && mission.kind === "blackHole") {
      assertMissionPlayable({
        mission,
        kid: kidDocToEhKid(kid),
        bhCompletionTimestampsMs: kid.bhCompletionTimestampsMs,
        nowMs: now,
      });
    }

    const reduced = reduceComplete({
      attempt: toAttempt(attemptDoc),
      mission,
      kid: kidDocToEhKid(kid),
      today: localDateString(new Date(now)),
      now,
    });

    let newSectorStamps: string[] = [];
    let kidAfter = kid;

    if (reduced.kind === "fresh") {
      for (const delta of reduced.ledgerDeltas) {
        await ctx.db.insert("xpLedger", {
          kidId: kid._id,
          attemptId: args.attemptId,
          reason: delta.reason,
          delta: delta.delta,
          balanceAfter: delta.balanceAfter,
          createdAt: delta.createdAt,
        });
      }

      const priorCompleted = kid.missionsCompleted;
      const completedCount = priorCompleted + 1;
      const beforeStamps = new Set(sectorStampsForClears(priorCompleted));
      const afterStamps = sectorStampsForClears(completedCount);
      newSectorStamps = afterStamps.filter((id) => !beforeStamps.has(id));

      const unlocks = [
        ...new Set([
          ...mergeUnlocks({
            level: reduced.kid.level,
            unlocks: kid.unlockedCosmeticIds,
            missionsCompleted: completedCount,
          }),
          ...afterStamps,
        ]),
      ];

      const bhUnlocked = blackHoleUnlocked(
        reduced.kid.level,
        reduced.kid.streakDays,
      );
      const blackHoleUnlockedAt = maybeStampBlackHoleUnlockedAt(
        kid.blackHoleUnlockedAt,
        bhUnlocked,
        now,
      );

      let bhCompletionTimestampsMs = kid.bhCompletionTimestampsMs;
      if (mission.kind === "blackHole") {
        bhCompletionTimestampsMs = [
          ...bhCompletionTimestampsMs,
          reduced.attempt.completedAt ?? now,
        ];
      }

      await ctx.db.patch("kids", kid._id, {
        xpTotal: reduced.kid.xp,
        level: reduced.kid.level,
        streakDays: reduced.kid.streakDays,
        lastMissionDate: reduced.kid.lastMissionDate,
        unlockedCosmeticIds: unlocks,
        missionsCompleted: completedCount,
        bhCompletionTimestampsMs,
        blackHoleUnlockedAt,
        updatedAt: now,
      });

      await ctx.db.patch("attempts", args.attemptId, {
        status: "completed",
        completedAt: reduced.attempt.completedAt,
        currentQuestionIndex: reduced.attempt.currentQuestionIndex,
        xpEarned: reduced.attempt.xpEarned,
        firstDailyBonus: reduced.attempt.firstDailyBonus,
        completionSnapshot: reduced.attempt.completionSnapshot,
        questionResults: reduced.attempt.questionResults,
        currentHintsUsed: reduced.attempt.currentHintsUsed,
        hintsByQuestionKey: reduced.attempt.hintsByQuestionKey,
      });

      const refreshed = await ctx.db.get("kids", kid._id);
      if (!refreshed) throw new Error("Kid not found");
      kidAfter = refreshed;
    }

    const attemptAfter = await ctx.db.get("attempts", args.attemptId);
    if (!attemptAfter) throw new Error("Attempt not found");

    const ledger = await ctx.db
      .query("xpLedger")
      .withIndex("by_attemptId", (q) => q.eq("attemptId", args.attemptId))
      .collect();

    return {
      attempt: toPublicAttempt(attemptAfter),
      kid: toPublicKid(kidAfter),
      xpBreakdown: reduced.xpBreakdown,
      leveledUp: reduced.leveledUp,
      previousLevel: reduced.previousLevel,
      ledger: ledger.map(toPublicLedgerEntry),
      newSectorStamps,
    };
  },
});
