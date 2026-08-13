/** Black-hole gate predicate. Plan §7 — Mission 1 does not touch BH content. */
export function isBlackHoleUnlocked(kid: {
  level: number;
  streakDays: number;
}): boolean {
  return kid.level >= 5 || kid.streakDays >= 5;
}
