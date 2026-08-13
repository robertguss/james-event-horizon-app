import { describe, expect, it, vi } from "vitest";
import { createConvexAdapter, type ConvexEhClient } from "./convexAdapter";

function mockClient(handlers: {
  query?: (ref: unknown, args: Record<string, unknown>) => Promise<unknown>;
  mutation?: (ref: unknown, args: Record<string, unknown>) => Promise<unknown>;
  action?: (ref: unknown, args: Record<string, unknown>) => Promise<unknown>;
}): ConvexEhClient {
  return {
    query: handlers.query ?? (async () => null),
    mutation: handlers.mutation ?? (async () => null),
    action: handlers.action ?? (async () => null),
  };
}

describe("createConvexAdapter", () => {
  it("maps public kid + empty session fail-closed", async () => {
    // Route by inspecting call count: first getSession, then kids.list
    let calls = 0;
    const sequenced = mockClient({
      query: async () => {
        calls += 1;
        if (calls === 1) {
          return { parentId: null, activeKidId: null };
        }
        return [
          {
            _id: "kid_1",
            displayName: "James",
            gradeBand: "3-5",
            xpTotal: 40,
            level: 2,
            streakDays: 1,
            unlockedCosmeticIds: ["paint_default"],
            missionsCompleted: 1,
          },
        ];
      },
    });

    const eh = createConvexAdapter(sequenced);
    expect(eh.mode).toBe("convex");
    const session = await eh.auth.getSession();
    expect(session).toEqual({ parentId: null, activeKidId: null });

    const kids = await eh.kids.list();
    expect(kids[0]).toMatchObject({
      id: "kid_1",
      displayName: "James",
      xp: 40,
      unlocks: ["paint_default"],
    });
  });

  it("setup.complete fetches public kid after onboarding ids", async () => {
    const mutation = vi.fn(async () => ({
      parentId: "parent_1",
      kidId: "kid_1",
    }));
    const query = vi.fn(async () => ({
      _id: "kid_1",
      displayName: "Jamie",
      gradeBand: "3-5" as const,
      xpTotal: 0,
      level: 1,
      streakDays: 0,
      unlockedCosmeticIds: ["paint_default"],
      missionsCompleted: 0,
    }));

    const eh = createConvexAdapter(mockClient({ mutation, query }));
    const kid = await eh.setup.complete({
      displayName: "Jamie",
      gradeBand: "3-5",
      pin: "4242",
    });
    expect(mutation).toHaveBeenCalled();
    expect(query).toHaveBeenCalled();
    expect(kid).toMatchObject({ id: "kid_1", displayName: "Jamie", xp: 0 });
  });

  it("requestHint uses action then reloads attempt", async () => {
    const action = vi.fn(async () => ({
      step: 1,
      text: "Look closer.",
      source: "static" as const,
      glowEvidenceIds: ["s1"],
    }));
    const query = vi.fn(async () => ({
      _id: "att_1",
      kidId: "kid_1",
      missionId: "mission_01_mars_dust",
      status: "active" as const,
      startedAt: 1,
      currentQuestionIndex: 0,
      questionResults: [],
      currentHintsUsed: 1,
      hintsByQuestionKey: { q1: 1 },
      xpEarned: 0,
      firstDailyBonus: false,
    }));

    const eh = createConvexAdapter(mockClient({ action, query }));
    const result = await eh.attempts.requestHint({
      attemptId: "att_1",
      questionKey: "q1",
    });
    expect(action).toHaveBeenCalled();
    expect(result.source).toBe("static");
    expect(result.attempt.currentHintsUsed).toBe(1);
  });
});
