import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { gradeBandValidator } from "./lib/gradeBand";

const questionResultValidator = v.object({
  questionKey: v.string(),
  correct: v.boolean(),
  hintsUsed: v.number(),
  evidenceId: v.optional(v.string()),
  choiceId: v.optional(v.string()),
  xpAwarded: v.number(),
});

const completionSnapshotValidator = v.object({
  xpBreakdown: v.object({
    questions: v.number(),
    exitTicket: v.number(),
    missionComplete: v.number(),
    firstDaily: v.number(),
    total: v.number(),
  }),
  leveledUp: v.boolean(),
  previousLevel: v.number(),
});

export default defineSchema({
  parents: defineTable({
    clerkUserId: v.string(),
    pinHash: v.string(),
    reminderEnabled: v.boolean(),
    activeKidId: v.optional(v.id("kids")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  kids: defineTable({
    parentId: v.id("parents"),
    displayName: v.string(),
    gradeBand: gradeBandValidator,
    xpTotal: v.number(),
    level: v.number(),
    streakDays: v.number(),
    lastMissionDate: v.optional(v.string()),
    unlockedCosmeticIds: v.array(v.string()),
    equippedShipPaintId: v.optional(v.string()),
    equippedTelescopeId: v.optional(v.string()),
    blackHoleUnlockedAt: v.optional(v.number()),
    /** Mission clears — sector stamps + parent stats. */
    missionsCompleted: v.number(),
    /** BH complete timestamps (ms) for weekly cap. */
    bhCompletionTimestampsMs: v.array(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_parentId", ["parentId"]),

  /**
   * Full attempt lifecycle + scoring (morning).
   * missionId is the catalog slug (e.g. mission_01_mars_dust).
   */
  attempts: defineTable({
    kidId: v.id("kids"),
    missionId: v.string(),
    status: v.union(v.literal("active"), v.literal("completed")),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    currentQuestionIndex: v.number(),
    questionResults: v.array(questionResultValidator),
    currentHintsUsed: v.number(),
    hintsByQuestionKey: v.record(v.string(), v.number()),
    xpEarned: v.number(),
    firstDailyBonus: v.boolean(),
    completionSnapshot: v.optional(completionSnapshotValidator),
  })
    .index("by_kidId", ["kidId"])
    .index("by_kid_mission", ["kidId", "missionId"])
    .index("by_kid_status", ["kidId", "status"]),

  hintEvents: defineTable({
    attemptId: v.id("attempts"),
    questionKey: v.string(),
    step: v.number(),
    source: v.union(v.literal("static"), v.literal("grok")),
    text: v.string(),
    createdAt: v.number(),
  })
    .index("by_attemptId", ["attemptId"])
    .index("by_attempt_question", ["attemptId", "questionKey"]),

  xpLedger: defineTable({
    kidId: v.id("kids"),
    attemptId: v.optional(v.id("attempts")),
    reason: v.union(
      v.literal("question"),
      v.literal("exit_ticket"),
      v.literal("mission_complete"),
      v.literal("first_daily"),
    ),
    delta: v.number(),
    balanceAfter: v.number(),
    createdAt: v.number(),
  })
    .index("by_kidId", ["kidId"])
    .index("by_kidId_createdAt", ["kidId", "createdAt"])
    .index("by_attemptId", ["attemptId"]),

  /** Slice 5 stub catalog — questions stay fixture/morning detail pack. */
  missions: defineTable({
    slug: v.string(),
    title: v.string(),
    planet: v.string(),
    planetId: v.string(),
    gradeBand: gradeBandValidator,
    estimatedMinutes: v.number(),
    skillTags: v.array(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("stub"),
    ),
    kind: v.union(
      v.literal("standard"),
      v.literal("stub"),
      v.literal("blackHole"),
    ),
    objective: v.string(),
    sentences: v.array(
      v.object({
        id: v.string(),
        text: v.string(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),
});
