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
});
