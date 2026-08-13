import { v } from "convex/values";
import {
  DEFAULT_SHIP_PAINT_ID,
  equipSlotForKind,
  getCosmetic,
  isCosmeticUnlocked,
  mergeUnlocks,
  unlocksForLevel,
} from "../lib/cosmetics";
import { mutation, query } from "./_generated/server";
import { gradeBandValidator } from "./lib/gradeBand";
import { toPublicKid } from "./lib/kidPublic";
import {
  getKidForParent,
  getParentByClerkUserId,
  requireOwnedKid,
  requireParent,
} from "./lib/parents";
import { kidPublicValidator } from "./lib/validators";

export const list = query({
  args: {},
  returns: v.array(kidPublicValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const parent = await getParentByClerkUserId(ctx, identity.subject);
    if (!parent) {
      return [];
    }
    const kids = await ctx.db
      .query("kids")
      .withIndex("by_parentId", (q) => q.eq("parentId", parent._id))
      .collect();
    return kids.map(toPublicKid);
  },
});

export const get = query({
  args: { kidId: v.id("kids") },
  returns: v.union(kidPublicValidator, v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const parent = await getParentByClerkUserId(ctx, identity.subject);
    if (!parent) {
      return null;
    }
    const kid = await ctx.db.get("kids", args.kidId);
    if (!kid || kid.parentId !== parent._id) {
      return null;
    }
    return toPublicKid(kid);
  },
});

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

    if (parent.activeKidId) {
      const active = await ctx.db.get("kids", parent.activeKidId);
      if (active && active.parentId === parent._id) {
        return toPublicKid(active);
      }
    }

    const kid = await getKidForParent(ctx, parent._id);
    if (!kid) {
      return null;
    }

    return toPublicKid(kid);
  },
});

export const create = mutation({
  args: {
    displayName: v.string(),
    gradeBand: gradeBandValidator,
  },
  returns: kidPublicValidator,
  handler: async (ctx, args) => {
    const parent = await requireParent(ctx);
    const existing = await getKidForParent(ctx, parent._id);
    if (existing) {
      return toPublicKid(existing);
    }

    const displayName = args.displayName.trim();
    if (displayName.length < 1 || displayName.length > 40) {
      throw new Error("Display name must be 1–40 characters");
    }

    const now = Date.now();
    const kidId = await ctx.db.insert("kids", {
      parentId: parent._id,
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

    await ctx.db.patch("parents", parent._id, {
      activeKidId: kidId,
      updatedAt: now,
    });

    const kid = await ctx.db.get("kids", kidId);
    if (!kid) throw new Error("Kid not found");
    return toPublicKid(kid);
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
    const updated = await ctx.db.get("kids", kid._id);
    if (!updated) throw new Error("Kid not found");
    return toPublicKid(updated);
  },
});

export const equipCosmetic = mutation({
  args: {
    kidId: v.id("kids"),
    cosmeticId: v.string(),
  },
  returns: kidPublicValidator,
  handler: async (ctx, args) => {
    const { kid } = await requireOwnedKid(ctx, args.kidId);
    const def = getCosmetic(args.cosmeticId);
    if (!def) throw new Error("Unknown cosmetic");

    const unlocks = mergeUnlocks({
      level: kid.level,
      unlocks: kid.unlockedCosmeticIds,
      missionsCompleted: kid.missionsCompleted,
    });
    if (!isCosmeticUnlocked(def.id, { level: kid.level, unlocks })) {
      throw new Error("Cosmetic locked");
    }

    const slot = equipSlotForKind(def.kind);
    if (!slot) throw new Error("Cosmetic cannot be equipped");

    const now = Date.now();
    await ctx.db.patch("kids", kid._id, {
      unlockedCosmeticIds: unlocks,
      updatedAt: now,
      ...(slot === "equippedShipPaintId"
        ? { equippedShipPaintId: def.id }
        : { equippedTelescopeId: def.id }),
    });
    const updated = await ctx.db.get("kids", kid._id);
    if (!updated) throw new Error("Kid not found");
    return toPublicKid(updated);
  },
});
