import { v } from "convex/values";
import {
  equipSlotForKind,
  getCosmetic,
  isCosmeticUnlocked,
  mergeUnlocks,
} from "../lib/cosmetics";
import { mutation, query } from "./_generated/server";
import { toPublicKid } from "./lib/kidPublic";
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
