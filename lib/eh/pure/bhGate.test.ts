import { describe, expect, it } from "vitest";
import {
  BH_WEEKLY_CAP,
  BH_WINDOW_MS,
  blackHoleUnlocked,
  blackHoleWeeklyCapReached,
  canStartBlackHole,
  isBlackHoleUnlocked,
  maybeStampBlackHoleUnlockedAt,
} from "./bhGate";

describe("blackHoleUnlocked", () => {
  it("unlocks at level >= 5 or streakDays >= 5", () => {
    expect(blackHoleUnlocked(5, 0)).toBe(true);
    expect(blackHoleUnlocked(1, 5)).toBe(true);
    expect(blackHoleUnlocked(4, 4)).toBe(false);
    expect(blackHoleUnlocked(1, 0)).toBe(false);
  });

  it("keeps object-form alias in sync", () => {
    expect(isBlackHoleUnlocked({ level: 5, streakDays: 0 })).toBe(true);
    expect(isBlackHoleUnlocked({ level: 1, streakDays: 0 })).toBe(false);
  });
});

describe("blackHoleWeeklyCap", () => {
  const now = 1_700_000_000_000;

  it(`caps at ${BH_WEEKLY_CAP} complete per rolling 7 days`, () => {
    expect(blackHoleWeeklyCapReached([], now)).toBe(false);
    expect(blackHoleWeeklyCapReached([now - 1000], now)).toBe(true);
    expect(blackHoleWeeklyCapReached([now - BH_WINDOW_MS - 1], now)).toBe(
      false,
    );
  });

  it("canStartBlackHole combines gate + weekly cap", () => {
    expect(
      canStartBlackHole({
        level: 1,
        streakDays: 0,
        bhCompletionTimestampsMs: [],
        nowMs: now,
      }),
    ).toEqual({ ok: false, reason: "gate" });

    expect(
      canStartBlackHole({
        level: 5,
        streakDays: 0,
        bhCompletionTimestampsMs: [now - 60_000],
        nowMs: now,
      }),
    ).toEqual({ ok: false, reason: "weekly_cap" });

    expect(
      canStartBlackHole({
        level: 5,
        streakDays: 0,
        bhCompletionTimestampsMs: [],
        nowMs: now,
      }),
    ).toEqual({ ok: true });
  });
});

describe("maybeStampBlackHoleUnlockedAt", () => {
  it("stamps once and never overwrites", () => {
    expect(maybeStampBlackHoleUnlockedAt(undefined, false, 100)).toBe(
      undefined,
    );
    expect(maybeStampBlackHoleUnlockedAt(undefined, true, 100)).toBe(100);
    expect(maybeStampBlackHoleUnlockedAt(50, true, 100)).toBe(50);
    expect(maybeStampBlackHoleUnlockedAt(50, false, 100)).toBe(50);
  });
});
