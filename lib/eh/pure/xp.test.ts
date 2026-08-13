import { describe, expect, it } from "vitest";
import {
  EXIT_TICKET_XP,
  FIRST_DAILY_XP,
  MISSION_COMPLETE_XP,
  questionXpForHints,
  xpForCorrectAnswer,
} from "./xp";
import { levelForXp } from "./level";
import { isBlackHoleUnlocked } from "./bhGate";
import { nextStreakState } from "./streak";

describe("XP tiers (plan §7)", () => {
  it("awards 20/14/10/6 by hints used", () => {
    expect(questionXpForHints(0)).toBe(20);
    expect(questionXpForHints(1)).toBe(14);
    expect(questionXpForHints(2)).toBe(10);
    expect(questionXpForHints(3)).toBe(6);
    expect(questionXpForHints(9)).toBe(6);
  });

  it("keeps exit ticket flat at 25 regardless of hints", () => {
    expect(xpForCorrectAnswer({ xpKind: "exit", hintsUsed: 0 })).toBe(
      EXIT_TICKET_XP,
    );
    expect(xpForCorrectAnswer({ xpKind: "exit", hintsUsed: 3 })).toBe(25);
  });

  it("exports mission complete and first-daily constants", () => {
    expect(MISSION_COMPLETE_XP).toBe(15);
    expect(FIRST_DAILY_XP).toBe(20);
  });
});

describe("level thresholds", () => {
  it("maps cumulative XP to levels", () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(99)).toBe(1);
    expect(levelForXp(100)).toBe(2);
    expect(levelForXp(249)).toBe(2);
    expect(levelForXp(250)).toBe(3);
    expect(levelForXp(450)).toBe(4);
    expect(levelForXp(700)).toBe(5);
  });
});

describe("daily first-mission bonus + streak", () => {
  it("marks first mission of day and starts streak", () => {
    expect(nextStreakState({ streakDays: 0, today: "2026-08-13" })).toEqual({
      streakDays: 1,
      lastMissionDate: "2026-08-13",
      isFirstDaily: true,
    });
  });

  it("does not re-award first-daily same day", () => {
    expect(
      nextStreakState({
        streakDays: 2,
        lastMissionDate: "2026-08-13",
        today: "2026-08-13",
      }),
    ).toEqual({
      streakDays: 2,
      lastMissionDate: "2026-08-13",
      isFirstDaily: false,
    });
  });

  it("increments streak on consecutive day", () => {
    expect(
      nextStreakState({
        streakDays: 2,
        lastMissionDate: "2026-08-12",
        today: "2026-08-13",
      }),
    ).toEqual({
      streakDays: 3,
      lastMissionDate: "2026-08-13",
      isFirstDaily: true,
    });
  });

  it("resets streak after a gap", () => {
    expect(
      nextStreakState({
        streakDays: 4,
        lastMissionDate: "2026-08-10",
        today: "2026-08-13",
      }),
    ).toEqual({
      streakDays: 1,
      lastMissionDate: "2026-08-13",
      isFirstDaily: true,
    });
  });
});

describe("BH gate predicate", () => {
  it("unlocks at level >= 5 or streak >= 5", () => {
    expect(isBlackHoleUnlocked({ level: 5, streakDays: 0 })).toBe(true);
    expect(isBlackHoleUnlocked({ level: 1, streakDays: 5 })).toBe(true);
    expect(isBlackHoleUnlocked({ level: 4, streakDays: 4 })).toBe(false);
  });
});
