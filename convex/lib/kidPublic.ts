import type { Doc } from "../_generated/dataModel";

export function toPublicKid(kid: Doc<"kids">) {
  return {
    _id: kid._id,
    displayName: kid.displayName,
    gradeBand: kid.gradeBand,
    xpTotal: kid.xpTotal,
    level: kid.level,
    streakDays: kid.streakDays,
    unlockedCosmeticIds: kid.unlockedCosmeticIds,
    equippedShipPaintId: kid.equippedShipPaintId,
    equippedTelescopeId: kid.equippedTelescopeId,
  };
}
