/** Cumulative XP thresholds. Plan §7 — L2@100, L3@250, L4@450, L5@700. */
export const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700] as const;

export function levelForXp(xp: number): number {
  const thresholds = LEVEL_THRESHOLDS;
  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    const threshold = thresholds[i];
    if (threshold !== undefined && xp >= threshold) {
      level = i + 1;
    }
  }
  // Beyond L5: continue +50 pattern if needed later; overnight may cap display at L5+.
  return level;
}

/** Minimum cumulative XP required to be at `level` (for resetFixture seeds). */
export function xpFloorForLevel(level: number): number {
  if (level <= 1) return 0;
  const idx = Math.min(level - 1, LEVEL_THRESHOLDS.length - 1);
  const floor = LEVEL_THRESHOLDS[idx];
  return floor ?? 0;
}
