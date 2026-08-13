import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { gradeBandValidator } from "./lib/gradeBand";

export default defineSchema({
  parents: defineTable({
    clerkUserId: v.string(),
    pinHash: v.string(),
    reminderEnabled: v.boolean(),
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
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_parentId", ["parentId"]),

  /**
   * Minimal attempt row for authenticated hint requests (morning).
   * Full attempt lifecycle / scoring stays on the fixture adapter overnight.
   */
  attempts: defineTable({
    kidId: v.id("kids"),
    /** Mission slug (e.g. mission_01_mars_dust) until full missions table lands. */
    missionId: v.string(),
    status: v.union(v.literal("active"), v.literal("completed")),
    hintsByQuestionKey: v.record(v.string(), v.number()),
    startedAt: v.number(),
  })
    .index("by_kidId", ["kidId"])
    .index("by_kid_mission", ["kidId", "missionId"]),

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
