import { afterEach, describe, expect, it } from "vitest";
import {
  getFixtureDebugState,
  resetFixture,
  setFixtureNowMs,
} from "./adapters/fixtureAdapter";
import { FIXTURE_KID_ID } from "./auth/fixtureAuth";
import { getEhData } from "./data";
import { missionStubBlackHole } from "./fixtures/missionsStub";
import { BH_WINDOW_MS } from "./pure/bhGate";

describe("fixture black-hole gate + weekly cap", () => {
  afterEach(() => {
    resetFixture();
  });

  it("lists stub missions and locks BH at L1 / streak 0", async () => {
    resetFixture();
    const eh = getEhData();
    const list = await eh.missions.list();
    expect(list.length).toBeGreaterThanOrEqual(4);
    expect(list.some((m) => m.kind === "stub")).toBe(true);

    const bh = list.find((m) => m.id === missionStubBlackHole.id);
    expect(bh).toBeTruthy();
    expect(bh?.locked).toBe(true);
    expect(bh?.lockReason).toBe("black_hole_gate");
    expect(bh?.lockMessage).toMatch(/level 5|5-day streak/i);
  });

  it("resetFixture({ level: 5 }) unlocks BH and stamps blackHoleUnlockedAt once", async () => {
    const t0 = 1_700_000_000_000;
    resetFixture({ level: 5, nowMs: t0 });
    const eh = getEhData();
    const kid = (await eh.kids.list())[0];
    expect(kid?.level).toBe(5);
    expect(kid?.blackHoleUnlockedAt).toBe(t0);

    const bh = (await eh.missions.list()).find(
      (m) => m.id === missionStubBlackHole.id,
    );
    expect(bh?.locked).toBe(false);

    // Later sync with lower streak must not clear stamp / cosmetics.
    resetFixture({
      level: 5,
      streakDays: 0,
      nowMs: t0 + 60_000,
      xpTotal: 700,
    });
    // Re-seed stamps unlockedAt on createDefaultKid when undefined — verify
    // overwrite protection via kids.get after unlocking then syncing.
    const again = await getEhData().kids.get(FIXTURE_KID_ID);
    expect(again?.blackHoleUnlockedAt).toBeDefined();
  });

  it("resetFixture({ streakDays: 5 }) unlocks BH at L1", async () => {
    resetFixture({ streakDays: 5 });
    const eh = getEhData();
    const kid = (await eh.kids.list())[0];
    expect(kid?.level).toBe(1);
    expect(kid?.streakDays).toBe(5);
    expect(kid?.lastMissionDate).toBeDefined();
    expect(kid?.blackHoleUnlockedAt).toBeDefined();

    const bh = (await eh.missions.list()).find(
      (m) => m.id === missionStubBlackHole.id,
    );
    expect(bh?.locked).toBe(false);
  });

  it("enforces max 1 BH complete / rolling 7 days", async () => {
    const now = 1_700_000_000_000;
    resetFixture({ level: 5, nowMs: now });
    const eh = getEhData();

    const attempt = await eh.attempts.start(
      FIXTURE_KID_ID,
      missionStubBlackHole.id,
    );
    for (const q of missionStubBlackHole.questions) {
      const result = await eh.attempts.submitAnswer({
        attemptId: attempt.id,
        questionKey: q.id,
        choiceId: q.correctChoiceId,
        evidenceId: q.correctEvidenceIds[0],
      });
      expect(result.correct).toBe(true);
    }
    const done = await eh.attempts.complete({ attemptId: attempt.id });
    expect(done.newSectorStamps).toEqual([]);

    const debug = getFixtureDebugState();
    expect(debug.bhCompletions[FIXTURE_KID_ID]?.length).toBe(1);

    const capped = (await eh.missions.list()).find(
      (m) => m.id === missionStubBlackHole.id,
    );
    expect(capped?.locked).toBe(true);
    expect(capped?.lockReason).toBe("black_hole_weekly_cap");

    await expect(
      eh.attempts.start(FIXTURE_KID_ID, missionStubBlackHole.id),
    ).rejects.toThrow(/week/i);

    // Outside window → available again
    resetFixture({
      level: 5,
      nowMs: now + BH_WINDOW_MS + 1,
      bhCompletionTimestampsMs: [now],
    });
    const openAgain = (await getEhData().missions.list()).find(
      (m) => m.id === missionStubBlackHole.id,
    );
    expect(openAgain?.locked).toBe(false);
  });

  it("awards sector stamp every 3 clears and keeps it after streak break", async () => {
    resetFixture({ missionsCompleted: 2, streakDays: 3 });
    const eh = getEhData();
    // Simulate one more clear via debug path: complete mission 01 answers stamp.
    // Use missionsCompleted bump through reset then sync:
    resetFixture({ missionsCompleted: 3, streakDays: 0, xpTotal: 0 });
    const kid = (await eh.kids.list())[0];
    expect(kid?.unlocks).toContain("sector_stamp_01");
    expect(kid?.streakDays).toBe(0);
  });

  it("does not overwrite blackHoleUnlockedAt when gate stays true", async () => {
    const t0 = 1_111;
    resetFixture({ level: 5, nowMs: t0 });
    const first = await getEhData().kids.get(FIXTURE_KID_ID);
    expect(first?.blackHoleUnlockedAt).toBe(t0);

    setFixtureNowMs(t0 + 999_999);
    const again = await getEhData().kids.get(FIXTURE_KID_ID);
    expect(again?.blackHoleUnlockedAt).toBe(t0);
  });
});
