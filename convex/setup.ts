import { v } from "convex/values";
import { DEFAULT_SHIP_PAINT_ID, unlocksForLevel } from "../lib/cosmetics";
import { mutation, query } from "./_generated/server";
import { gradeBandValidator } from "./lib/gradeBand";
import { toPublicKid } from "./lib/kidPublic";
import {
  getKidForParent,
  getParentByClerkUserId,
  requireIdentitySubject,
} from "./lib/parents";
import { assertValidPin, hashPin } from "./lib/pin";
import { setupStateValidator } from "./lib/validators";

export const getState = query({
  args: {},
  returns: setupStateValidator,
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const parent = await getParentByClerkUserId(ctx, identity.subject);
    if (!parent) {
      return { onboarded: false as const };
    }

    const kid = await getKidForParent(ctx, parent._id);
    if (!kid) {
      return { onboarded: false as const };
    }

    return {
      onboarded: true as const,
      parentId: parent._id,
      kid: toPublicKid(kid),
    };
  },
});

export const completeOnboarding = mutation({
  args: {
    displayName: v.string(),
    gradeBand: gradeBandValidator,
    pin: v.string(),
  },
  returns: v.object({
    parentId: v.id("parents"),
    kidId: v.id("kids"),
  }),
  handler: async (ctx, args) => {
    const clerkUserId = await requireIdentitySubject(ctx);
    const displayName = args.displayName.trim();
    if (displayName.length < 1 || displayName.length > 40) {
      throw new Error("Display name must be 1–40 characters");
    }
    assertValidPin(args.pin);

    const existing = await getParentByClerkUserId(ctx, clerkUserId);
    if (existing) {
      throw new Error("Already onboarded");
    }

    const now = Date.now();
    const pinHash = await hashPin(args.pin);
    const parentId = await ctx.db.insert("parents", {
      clerkUserId,
      pinHash,
      reminderEnabled: false,
      createdAt: now,
      updatedAt: now,
    });

    const kidId = await ctx.db.insert("kids", {
      parentId,
      displayName,
      gradeBand: args.gradeBand,
      xpTotal: 0,
      level: 1,
      streakDays: 0,
      unlockedCosmeticIds: unlocksForLevel(1),
      equippedShipPaintId: DEFAULT_SHIP_PAINT_ID,
      missionsCompleted: 0,
      bhCompletionTimestampsMs: [],
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch("parents", parentId, {
      activeKidId: kidId,
      updatedAt: now,
    });

    return { parentId, kidId };
  },
});
