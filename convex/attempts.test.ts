import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mission01 } from "../lib/eh/fixtures/mission01";
import { missionStubBlackHole } from "../lib/eh/fixtures/missionsStub";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

const PEPPER = "morning-attempts-test-pepper";

async function onboard(t: ReturnType<typeof convexTest>, subject: string) {
  const asParent = t.withIdentity({ subject });
  const created = await asParent.mutation(api.setup.completeOnboarding, {
    displayName: "James",
    gradeBand: "3-5",
    pin: "1234",
  });
  return { asParent, ...created };
}

describe("attempts lifecycle", () => {
  beforeEach(() => {
    process.env.PIN_PEPPER = PEPPER;
  });

  afterEach(() => {
    delete process.env.PIN_PEPPER;
  });

  it("start + submitAnswer freezes score once correct; ignores claimedCorrect", async () => {
    const t = convexTest(schema, modules);
    const { asParent, kidId } = await onboard(t, "clerk_attempt_submit");

    const attempt = await asParent.mutation(api.attempts.start, {
      kidId,
      missionId: mission01.id,
    });
    expect(attempt.status).toBe("active");

    const q1 = mission01.questions[0]!;
    const wrong = await asParent.mutation(api.attempts.submitAnswer, {
      attemptId: attempt._id,
      questionKey: q1.id,
      choiceId: "Z",
      evidenceId: "nope",
      claimedCorrect: true,
    });
    expect(wrong.correct).toBe(false);
    expect(wrong.xpAwarded).toBe(0);

    const first = await asParent.mutation(api.attempts.submitAnswer, {
      attemptId: attempt._id,
      questionKey: q1.id,
      choiceId: q1.correctChoiceId,
      evidenceId: q1.correctEvidenceIds[0],
    });
    expect(first.correct).toBe(true);
    expect(first.xpAwarded).toBeGreaterThan(0);
    const frozenXp = first.xpAwarded;

    const replay = await asParent.mutation(api.attempts.submitAnswer, {
      attemptId: attempt._id,
      questionKey: q1.id,
      choiceId: "wrong",
      claimedCorrect: false,
    });
    expect(replay.correct).toBe(true);
    expect(replay.xpAwarded).toBe(frozenXp);
    expect(replay.feedback).toMatch(/frozen/i);
  });

  it("complete is idempotent — retry returns first-call xpBreakdown/leveledUp", async () => {
    const t = convexTest(schema, modules);
    const { asParent, kidId } = await onboard(t, "clerk_attempt_complete");

    const attempt = await asParent.mutation(api.attempts.start, {
      kidId,
      missionId: mission01.id,
    });

    for (const question of mission01.questions) {
      await asParent.mutation(api.attempts.submitAnswer, {
        attemptId: attempt._id,
        questionKey: question.id,
        choiceId: question.correctChoiceId,
        evidenceId: question.correctEvidenceIds[0],
      });
    }

    const first = await asParent.mutation(api.attempts.complete, {
      attemptId: attempt._id,
    });
    expect(first.attempt.status).toBe("completed");
    expect(first.xpBreakdown.total).toBeGreaterThan(0);
    expect(first.kid.xpTotal).toBe(first.xpBreakdown.total);

    const second = await asParent.mutation(api.attempts.complete, {
      attemptId: attempt._id,
    });
    expect(second.xpBreakdown).toEqual(first.xpBreakdown);
    expect(second.leveledUp).toBe(first.leveledUp);
    expect(second.previousLevel).toBe(first.previousLevel);
    expect(second.kid.xpTotal).toBe(first.kid.xpTotal);
    expect(second.newSectorStamps).toEqual([]);
  });

  it("BH gate throws on start of locked black-hole mission", async () => {
    const t = convexTest(schema, modules);
    const { asParent, kidId } = await onboard(t, "clerk_attempt_bh");

    await expect(
      asParent.mutation(api.attempts.start, {
        kidId,
        missionId: missionStubBlackHole.id,
      }),
    ).rejects.toThrow(/level 5|5-day streak|black hole/i);
  });

  it("hintRequests.requestHint remains auth-gated", async () => {
    const t = convexTest(schema, modules);
    const { asParent, kidId } = await onboard(t, "clerk_attempt_hint_gate");

    const attempt = await asParent.mutation(api.attempts.start, {
      kidId,
      missionId: mission01.id,
    });

    await expect(
      t.action(api.hintRequests.requestHint, {
        attemptId: attempt._id,
        questionKey: mission01.questions[0]!.id,
      }),
    ).rejects.toThrow(/Not authenticated/);
  });
});
