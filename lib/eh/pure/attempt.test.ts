import { describe, expect, it } from "vitest";
import { mission01 } from "../fixtures/mission01";
import type { Attempt, EhKid } from "../types";
import { reduceComplete, reduceHint, reduceSubmit } from "./attempt";

function baseAttempt(overrides?: Partial<Attempt>): Attempt {
  return {
    id: "att_test",
    kidId: "kid_james",
    missionId: mission01.id,
    status: "active",
    startedAt: 1,
    currentQuestionIndex: 0,
    questionResults: [],
    currentHintsUsed: 0,
    hintsByQuestionKey: {},
    xpEarned: 0,
    firstDailyBonus: false,
    ...overrides,
  };
}

function baseKid(overrides?: Partial<EhKid>): EhKid {
  return {
    id: "kid_james",
    displayName: "James",
    gradeBand: "3-5",
    xp: 0,
    level: 1,
    streakDays: 0,
    unlocks: [],
    ...overrides,
  };
}

describe("reduceSubmit / reduceHint (H2 freeze score)", () => {
  it("two hints then correct → 10 XP; re-submit same key stays 10", () => {
    let attempt = baseAttempt();

    const h1 = reduceHint({
      attempt,
      mission: mission01,
      questionKey: "q1_locate_wall",
    });
    attempt = h1.attempt;
    expect(h1.step).toBe(1);

    const h2 = reduceHint({
      attempt,
      mission: mission01,
      questionKey: "q1_locate_wall",
    });
    attempt = h2.attempt;
    expect(h2.step).toBe(2);
    expect(attempt.hintsByQuestionKey.q1_locate_wall).toBe(2);

    const first = reduceSubmit({
      attempt,
      mission: mission01,
      questionKey: "q1_locate_wall",
      evidenceId: "s3",
    });
    expect(first.correct).toBe(true);
    expect(first.xpAwarded).toBe(10);
    expect(first.attempt.currentHintsUsed).toBe(0);

    const retry = reduceSubmit({
      attempt: first.attempt,
      mission: mission01,
      questionKey: "q1_locate_wall",
      evidenceId: "s3",
    });
    expect(retry.correct).toBe(true);
    expect(retry.xpAwarded).toBe(10);
    expect(retry.attempt.questionResults[0]?.xpAwarded).toBe(10);
    expect(retry.attempt.xpEarned).toBe(first.attempt.xpEarned);
  });
});

describe("reduceComplete (H1 snapshot replay)", () => {
  it("second complete returns identical breakdown + leveledUp + previousLevel", () => {
    let attempt = baseAttempt();
    const answers = [
      { questionKey: "q1_locate_wall", evidenceId: "s3" },
      { questionKey: "q2_main_idea", choiceId: "B" },
      { questionKey: "q3_vocab_grit", choiceId: "A" },
      {
        questionKey: "q4_infer_why_park",
        choiceId: "B",
        evidenceId: "s5",
      },
      { questionKey: "q5_exit_ticket", choiceId: "A" },
    ] as const;

    for (const answer of answers) {
      const step = reduceSubmit({
        attempt,
        mission: mission01,
        ...answer,
      });
      expect(step.correct).toBe(true);
      attempt = step.attempt;
    }

    const first = reduceComplete({
      attempt,
      mission: mission01,
      kid: baseKid(),
      today: "2026-08-13",
      now: 1000,
    });
    expect(first.kind).toBe("fresh");
    expect(first.xpBreakdown).toEqual({
      questions: 80,
      exitTicket: 25,
      missionComplete: 15,
      firstDaily: 20,
      total: 140,
    });
    expect(first.leveledUp).toBe(true);
    expect(first.previousLevel).toBe(1);
    expect(first.kid.xp).toBe(140);
    expect(first.ledgerDeltas.length).toBeGreaterThan(0);

    const second = reduceComplete({
      attempt: first.attempt,
      mission: mission01,
      kid: first.kid,
      today: "2026-08-13",
      now: 2000,
    });
    expect(second.kind).toBe("replay");
    expect(second.xpBreakdown).toEqual(first.xpBreakdown);
    expect(second.leveledUp).toBe(first.leveledUp);
    expect(second.previousLevel).toBe(first.previousLevel);
    expect(second.kid.xp).toBe(140);
    expect(second.ledgerDeltas).toEqual([]);
  });
});
