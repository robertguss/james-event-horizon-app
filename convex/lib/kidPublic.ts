import type { Doc } from "../_generated/dataModel";
import { mergeUnlocks } from "../../lib/cosmetics";

export function toPublicKid(kid: Doc<"kids">) {
  const unlocks = mergeUnlocks({
    level: kid.level,
    unlocks: kid.unlockedCosmeticIds,
    missionsCompleted: kid.missionsCompleted,
  });
  return {
    _id: kid._id,
    displayName: kid.displayName,
    gradeBand: kid.gradeBand,
    xpTotal: kid.xpTotal,
    level: kid.level,
    streakDays: kid.streakDays,
    lastMissionDate: kid.lastMissionDate,
    unlockedCosmeticIds: unlocks,
    equippedShipPaintId: kid.equippedShipPaintId,
    equippedTelescopeId: kid.equippedTelescopeId,
    blackHoleUnlockedAt: kid.blackHoleUnlockedAt,
    missionsCompleted: kid.missionsCompleted,
  };
}
