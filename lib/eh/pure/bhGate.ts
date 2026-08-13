/** Black-hole gate + weekly cap. Plan §7 / PRODUCT-BRIEF unlocks. */

export const BH_WEEKLY_CAP = 1;
export const BH_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** Prefer this name in Slice 5+ call sites. */
export function blackHoleUnlocked(level: number, streakDays: number): boolean {
  return level >= 5 || streakDays >= 5;
}

/** Object form kept for existing XP tests / call sites. */
export function isBlackHoleUnlocked(kid: {
  level: number;
  streakDays: number;
}): boolean {
  return blackHoleUnlocked(kid.level, kid.streakDays);
}

/** Max 1 BH complete per rolling 7-day window. */
export function blackHoleWeeklyCapReached(
  completionTimestampsMs: readonly number[],
  nowMs: number,
): boolean {
  const windowStart = nowMs - BH_WINDOW_MS;
  let recent = 0;
  for (const ts of completionTimestampsMs) {
    if (ts >= windowStart && ts <= nowMs) recent += 1;
    if (recent >= BH_WEEKLY_CAP) return true;
  }
  return false;
}

export function canStartBlackHole(input: {
  level: number;
  streakDays: number;
  bhCompletionTimestampsMs: readonly number[];
  nowMs: number;
}): { ok: true } | { ok: false; reason: "gate" | "weekly_cap" } {
  if (!blackHoleUnlocked(input.level, input.streakDays)) {
    return { ok: false, reason: "gate" };
  }
  if (blackHoleWeeklyCapReached(input.bhCompletionTimestampsMs, input.nowMs)) {
    return { ok: false, reason: "weekly_cap" };
  }
  return { ok: true };
}

/**
 * Stamp `blackHoleUnlockedAt` the first time the gate is true.
 * Never overwrite an existing stamp (streak break keeps cosmetics).
 */
export function maybeStampBlackHoleUnlockedAt(
  existing: number | undefined,
  unlocked: boolean,
  nowMs: number,
): number | undefined {
  if (existing !== undefined) return existing;
  if (!unlocked) return undefined;
  return nowMs;
}
