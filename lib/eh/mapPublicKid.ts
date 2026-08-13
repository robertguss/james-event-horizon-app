import type { EhKid } from "./types";

/** Convex public kid shape → EhKid (string ids, xp vs xpTotal). */
export type ConvexPublicKid = {
  _id: string;
  displayName: string;
  gradeBand: "3-5";
  xpTotal: number;
  level: number;
  streakDays: number;
  lastMissionDate?: string;
  unlockedCosmeticIds: string[];
  equippedShipPaintId?: string;
  equippedTelescopeId?: string;
  blackHoleUnlockedAt?: number;
  missionsCompleted?: number;
};

export function mapPublicKid(kid: ConvexPublicKid): EhKid {
  return {
    id: kid._id,
    displayName: kid.displayName,
    gradeBand: kid.gradeBand,
    xp: kid.xpTotal,
    level: kid.level,
    streakDays: kid.streakDays,
    lastMissionDate: kid.lastMissionDate,
    unlocks: kid.unlockedCosmeticIds,
    equippedShipPaintId: kid.equippedShipPaintId,
    equippedTelescopeId: kid.equippedTelescopeId,
    blackHoleUnlockedAt: kid.blackHoleUnlockedAt,
  };
}
