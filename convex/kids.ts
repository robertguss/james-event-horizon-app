import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getKidForParent,
  getParentByClerkUserId,
  requireOwnedKid,
} from "./lib/parents";
import { kidPublicValidator } from "./lib/validators";

export const getActive = query({
  args: {},
  returns: v.union(kidPublicValidator, v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const parent = await getParentByClerkUserId(ctx, identity.subject);
    if (!parent) {
      return null;
    }

    const kid = await getKidForParent(ctx, parent._id);
    if (!kid) {
      return null;
    }

    return {
      _id: kid._id,
      displayName: kid.displayName,
      gradeBand: kid.gradeBand,
      xpTotal: kid.xpTotal,
      level: kid.level,
      streakDays: kid.streakDays,
    };
  },
});

export const rename = mutation({
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

    return {
      _id: kid._id,
      displayName,
      gradeBand: kid.gradeBand,
      xpTotal: kid.xpTotal,
      level: kid.level,
      streakDays: kid.streakDays,
    };
  },
});
