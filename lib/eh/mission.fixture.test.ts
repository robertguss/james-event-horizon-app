import { afterEach, describe, expect, it } from "vitest";
import { getFixtureDebugState, resetFixture } from "./adapters/fixtureAdapter";
import { FIXTURE_KID_ID } from "./auth/fixtureAuth";
import { getEhData } from "./data";
import { mission01 } from "./fixtures/mission01";

describe("fixture Mission 1 E2E", () => {
  afterEach(() => {
    resetFixture();
  });

  it("plays start → answer → complete with XP ledger", async () => {
    const eh = getEhData();
    await eh.auth.fixtureSignInAsParent?.();
    const attempt = await eh.attempts.start(FIXTURE_KID_ID, mission01.id);
    expect(attempt.status).toBe("active");

    const answers: Array<{
      questionKey: string;
      evidenceId?: string;
      choiceId?: string;
    }> = [
      { questionKey: "q1_locate_wall", evidenceId: "s3" },
      { questionKey: "q2_main_idea", choiceId: "B" },
      { questionKey: "q3_vocab_grit", choiceId: "A" },
      {
        questionKey: "q4_infer_why_park",
        choiceId: "B",
        evidenceId: "s5",
      },
      { questionKey: "q5_exit_ticket", choiceId: "A" },
    ];

    for (const answer of answers) {
      const result = await eh.attempts.submitAnswer({
        attemptId: attempt.id,
        ...answer,
        claimedCorrect: true,
      });
      expect(result.correct).toBe(true);
    }

    const done = await eh.attempts.complete({ attemptId: attempt.id });
    // q1–q4 clean 20*4=80 + exit 25 + mission 15 + first daily 20 = 140
    expect(done.xpBreakdown.questions).toBe(80);
    expect(done.xpBreakdown.exitTicket).toBe(25);
    expect(done.xpBreakdown.missionComplete).toBe(15);
    expect(done.xpBreakdown.firstDaily).toBe(20);
    expect(done.xpBreakdown.total).toBe(140);
    expect(done.kid.xp).toBe(140);
    expect(done.kid.level).toBe(2);
    expect(done.leveledUp).toBe(true);
    expect(done.kid.streakDays).toBe(1);

    const { ledger } = getFixtureDebugState();
    expect(ledger.some((e) => e.reason === "first_daily")).toBe(true);
    expect(ledger.some((e) => e.reason === "mission_complete")).toBe(true);
  });

  it("static hint ladder never auto-fills; wrong then hint then correct", async () => {
    const eh = getEhData();
    const attempt = await eh.attempts.start(FIXTURE_KID_ID, mission01.id);

    const wrong = await eh.attempts.submitAnswer({
      attemptId: attempt.id,
      questionKey: "q1_locate_wall",
      evidenceId: "s4",
      claimedCorrect: true,
    });
    expect(wrong.correct).toBe(false);
    expect(wrong.xpAwarded).toBe(0);

    const hint1 = await eh.attempts.requestHint({
      attemptId: attempt.id,
      questionKey: "q1_locate_wall",
    });
    expect(hint1.step).toBe(1);
    expect(hint1.source).toBe("static");
    expect(hint1.text.toLowerCase()).not.toContain("answer is");
    expect(hint1.text).not.toMatch(/\bs3\b/);
    expect(hint1.text).not.toContain(
      "Then a wall of dust rose in the distance.",
    );

    const hint2 = await eh.attempts.requestHint({
      attemptId: attempt.id,
      questionKey: "q1_locate_wall",
    });
    expect(hint2.step).toBe(2);
    expect(hint2.source).toBe("static");
    expect(hint2.text).not.toMatch(/\bs3\b/);
    expect(hint2.text).not.toContain(
      "Then a wall of dust rose in the distance.",
    );

    const ok = await eh.attempts.submitAnswer({
      attemptId: attempt.id,
      questionKey: "q1_locate_wall",
      evidenceId: "s3",
    });
    expect(ok.correct).toBe(true);
    // 2 hints used → 10 XP (plan §7)
    expect(ok.xpAwarded).toBe(10);
    expect(ok.attempt.questionResults[0]?.hintsUsed).toBe(2);

    const { hintEvents } = getFixtureDebugState();
    expect(hintEvents.every((e) => e.source === "static")).toBe(true);
  });

  it("requestHint returns source static without any key", async () => {
    const eh = getEhData();
    const attempt = await eh.attempts.start(FIXTURE_KID_ID, mission01.id);
    const hint = await eh.attempts.requestHint({
      attemptId: attempt.id,
      questionKey: "q1_locate_wall",
    });
    expect(hint.source).toBe("static");
    expect(hint.text.length).toBeGreaterThan(0);
  });

  it("Q1 steps 1–2 hint texts do not leak s3 or the exact correct sentence", () => {
    const q1 = mission01.questions.find((q) => q.id === "q1_locate_wall");
    expect(q1).toBeTruthy();
    for (const text of q1!.hints.slice(0, 2)) {
      expect(text).not.toMatch(/\bs3\b/);
      expect(text).not.toContain("Then a wall of dust rose in the distance.");
    }
  });

  it("Q2 hint ladder texts do not contain answer letter B", () => {
    const q2 = mission01.questions.find((q) => q.id === "q2_main_idea");
    expect(q2).toBeTruthy();
    for (const text of q2!.hints) {
      expect(text).not.toMatch(/\bB\b/);
    }
  });

  it("H2: freeze score once correct — re-submit stays 10 XP not 20", async () => {
    const eh = getEhData();
    const attempt = await eh.attempts.start(FIXTURE_KID_ID, mission01.id);

    await eh.attempts.requestHint({
      attemptId: attempt.id,
      questionKey: "q1_locate_wall",
    });
    await eh.attempts.requestHint({
      attemptId: attempt.id,
      questionKey: "q1_locate_wall",
    });

    const ok = await eh.attempts.submitAnswer({
      attemptId: attempt.id,
      questionKey: "q1_locate_wall",
      evidenceId: "s3",
    });
    expect(ok.xpAwarded).toBe(10);

    const again = await eh.attempts.submitAnswer({
      attemptId: attempt.id,
      questionKey: "q1_locate_wall",
      evidenceId: "s3",
    });
    expect(again.xpAwarded).toBe(10);
    expect(again.attempt.questionResults[0]?.xpAwarded).toBe(10);
    expect(again.attempt.xpEarned).toBe(10);
  });

  it("H1: complete() retry returns first-call snapshot (140 / level-up)", async () => {
    const eh = getEhData();
    await eh.auth.fixtureSignInAsParent?.();
    const attempt = await eh.attempts.start(FIXTURE_KID_ID, mission01.id);

    for (const answer of [
      { questionKey: "q1_locate_wall", evidenceId: "s3" },
      { questionKey: "q2_main_idea", choiceId: "B" },
      { questionKey: "q3_vocab_grit", choiceId: "A" },
      {
        questionKey: "q4_infer_why_park",
        choiceId: "B",
        evidenceId: "s5",
      },
      { questionKey: "q5_exit_ticket", choiceId: "A" },
    ] as const) {
      await eh.attempts.submitAnswer({ attemptId: attempt.id, ...answer });
    }

    const first = await eh.attempts.complete({ attemptId: attempt.id });
    expect(first.xpBreakdown.total).toBe(140);
    expect(first.leveledUp).toBe(true);
    expect(first.previousLevel).toBe(1);

    const { ledger: ledgerAfterFirst } = getFixtureDebugState();
    const ledgerLen = ledgerAfterFirst.length;

    const second = await eh.attempts.complete({ attemptId: attempt.id });
    expect(second.xpBreakdown).toEqual(first.xpBreakdown);
    expect(second.leveledUp).toBe(first.leveledUp);
    expect(second.previousLevel).toBe(first.previousLevel);
    expect(second.kid.xp).toBe(first.kid.xp);
    expect(second.kid.level).toBe(first.kid.level);

    const { ledger: ledgerAfterSecond } = getFixtureDebugState();
    expect(ledgerAfterSecond.length).toBe(ledgerLen);
  });

  it("rejects forged correct without matching exact-set evidence", async () => {
    const eh = getEhData();
    const attempt = await eh.attempts.start(FIXTURE_KID_ID, mission01.id);
    const forged = await eh.attempts.submitAnswer({
      attemptId: attempt.id,
      questionKey: "q1_locate_wall",
      evidenceId: "s1",
      claimedCorrect: true,
    });
    expect(forged.correct).toBe(false);

    const forgedMc = await eh.attempts.submitAnswer({
      attemptId: attempt.id,
      questionKey: "q2_main_idea",
      choiceId: "A",
      claimedCorrect: true,
    });
    // Still on q1 until answered — questionKey mismatch for current index is ok;
    // grader still rejects wrong choice for q2.
    expect(forgedMc.correct).toBe(false);
  });

  it("level-up path from resetFixture({ xpTotal: 90 })", async () => {
    resetFixture({ xpTotal: 90 });
    const eh = getEhData();
    const kidBefore = await eh.kids.get(FIXTURE_KID_ID);
    expect(kidBefore?.xp).toBe(90);
    expect(kidBefore?.level).toBe(1);

    const attempt = await eh.attempts.start(FIXTURE_KID_ID, mission01.id);
    for (const answer of [
      { questionKey: "q1_locate_wall", evidenceId: "s3" },
      { questionKey: "q2_main_idea", choiceId: "B" },
      { questionKey: "q3_vocab_grit", choiceId: "A" },
      {
        questionKey: "q4_infer_why_park",
        choiceId: "B",
        evidenceId: "s6",
      },
      { questionKey: "q5_exit_ticket", choiceId: "A" },
    ] as const) {
      await eh.attempts.submitAnswer({ attemptId: attempt.id, ...answer });
    }
    const done = await eh.attempts.complete({ attemptId: attempt.id });
    expect(done.previousLevel).toBe(1);
    expect(done.kid.level).toBeGreaterThanOrEqual(2);
    expect(done.leveledUp).toBe(true);
    expect(done.kid.xp).toBeGreaterThanOrEqual(100);
  });
});
