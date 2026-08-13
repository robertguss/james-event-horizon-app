import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";
import { mission01 } from "../lib/eh/fixtures/mission01";

const PEPPER = "slice3-hint-test-pepper";

describe("hintRequests.requestHint", () => {
  beforeEach(() => {
    process.env.PIN_PEPPER = PEPPER;
    delete process.env.XAI_API_KEY;
  });

  afterEach(() => {
    delete process.env.PIN_PEPPER;
    delete process.env.XAI_API_KEY;
  });

  it("fails closed when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    const asParent = t.withIdentity({ subject: "clerk_hint_unauth" });
    const { kidId } = await asParent.mutation(api.setup.completeOnboarding, {
      displayName: "James",
      gradeBand: "3-5",
      pin: "1234",
    });

    const attemptId = await t.run(async (ctx) => {
      return await ctx.db.insert("attempts", {
        kidId,
        missionId: mission01.id,
        status: "active",
        hintsByQuestionKey: {},
        startedAt: Date.now(),
        currentQuestionIndex: 0,
        questionResults: [],
        currentHintsUsed: 0,
        xpEarned: 0,
        firstDailyBonus: false,
      });
    });

    await expect(
      t.action(api.hintRequests.requestHint, {
        attemptId,
        questionKey: "q1_locate_wall",
      }),
    ).rejects.toThrow(/Not authenticated/);
  });

  it("returns static hint without XAI_API_KEY for owned attempt", async () => {
    const t = convexTest(schema, modules);
    const asParent = t.withIdentity({ subject: "clerk_hint_ok" });
    const { kidId } = await asParent.mutation(api.setup.completeOnboarding, {
      displayName: "James",
      gradeBand: "3-5",
      pin: "1234",
    });

    const attemptId = await t.run(async (ctx) => {
      return await ctx.db.insert("attempts", {
        kidId,
        missionId: mission01.id,
        status: "active",
        hintsByQuestionKey: {},
        startedAt: Date.now(),
        currentQuestionIndex: 0,
        questionResults: [],
        currentHintsUsed: 0,
        xpEarned: 0,
        firstDailyBonus: false,
      });
    });

    const result = await asParent.action(api.hintRequests.requestHint, {
      attemptId,
      questionKey: "q1_locate_wall",
    });

    expect(result.source).toBe("static");
    expect(result.step).toBe(1);
    expect(result.text.length).toBeGreaterThan(0);
    expect(result.text).not.toMatch(/\bB\b/);
  });
});
