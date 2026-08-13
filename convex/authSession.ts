/**
 * EhData auth surface for hosted Clerk + Convex.
 * Fail-closed: missing identity → empty session / throw on selectKid.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getKidForParent,
  getParentByClerkUserId,
  requireOwnedKid,
  requireParent,
} from "./lib/parents";
import { sessionValidator } from "./lib/validators";

export const getSession = query({
  args: {},
  returns: sessionValidator,
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { parentId: null, activeKidId: null };
    }

    const parent = await getParentByClerkUserId(ctx, identity.subject);
    if (!parent) {
      return { parentId: null, activeKidId: null };
    }

    let activeKidId = parent.activeKidId ?? null;
    if (activeKidId) {
      const kid = await ctx.db.get("kids", activeKidId);
      if (!kid || kid.parentId !== parent._id) {
        activeKidId = null;
      }
    }
    if (!activeKidId) {
      const kid = await getKidForParent(ctx, parent._id);
      activeKidId = kid?._id ?? null;
    }

    return {
      parentId: parent._id,
      activeKidId,
    };
  },
});

export const selectKid = mutation({
  args: {
    kidId: v.id("kids"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const parent = await requireParent(ctx);
    await requireOwnedKid(ctx, args.kidId);
    await ctx.db.patch("parents", parent._id, {
      activeKidId: args.kidId,
      updatedAt: Date.now(),
    });
    return null;
  },
});
