import { v } from "convex/values";
import { gradeBandValidator } from "./gradeBand";

export const kidPublicValidator = v.object({
  _id: v.id("kids"),
  displayName: v.string(),
  gradeBand: gradeBandValidator,
  xpTotal: v.number(),
  level: v.number(),
  streakDays: v.number(),
});

export const setupStateValidator = v.union(
  v.object({
    onboarded: v.literal(false),
  }),
  v.object({
    onboarded: v.literal(true),
    parentId: v.id("parents"),
    kid: kidPublicValidator,
  }),
  v.null(),
);
