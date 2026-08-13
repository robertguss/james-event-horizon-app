import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearParentSession,
  isParentUnlocked,
  unlockParentSession,
} from "../parent-session";
import {
  getFixtureDebugState,
  resetFixture,
  seedFixtureWrongAnswers,
} from "./adapters/fixtureAdapter";
import { FIXTURE_KID_ID, FIXTURE_PARENT_PIN } from "./auth/fixtureAuth";
import { getEhData } from "./data";

describe("parent stats fixture adapter", () => {
  afterEach(() => {
    resetFixture({ reminderEnabled: false });
  });

  it("getParentStats returns missions, streak, and seeded weak tags", async () => {
    resetFixture({
      missionsCompleted: 2,
      streakDays: 3,
      reminderEnabled: false,
    });
    seedFixtureWrongAnswers({ skillTag: "locate_evidence" });

    const eh = getEhData();
    const stats = await eh.parent.getParentStats(FIXTURE_KID_ID);

    expect(stats.missionsCompleted).toBe(2);
    expect(stats.streakDays).toBe(3);
    expect(stats.weakSkillTags).toContain("locate_evidence");
    expect(stats.reminderEnabled).toBe(false);
  });

  it("updateKidName and setReminderEnabled persist", async () => {
    resetFixture({ reminderEnabled: false });
    const eh = getEhData();

    const renamed = await eh.parent.updateKidName(FIXTURE_KID_ID, "  Nova  ");
    expect(renamed.displayName).toBe("Nova");

    await eh.parent.setReminderEnabled(true);
    const stats = await eh.parent.getParentStats(FIXTURE_KID_ID);
    expect(stats.displayName).toBe("Nova");
    expect(stats.reminderEnabled).toBe(true);
    expect(getFixtureDebugState().reminderEnabled).toBe(true);

    await expect(eh.parent.updateKidName(FIXTURE_KID_ID, "")).rejects.toThrow(
      /1–40/,
    );
  });

  it("seedFixtureWrongAnswers does not inflate missionsCompleted or XP", async () => {
    resetFixture({ missionsCompleted: 2, xpTotal: 40, reminderEnabled: false });
    seedFixtureWrongAnswers({ skillTag: "locate_evidence", count: 3 });

    const eh = getEhData();
    const kid = await eh.kids.get(FIXTURE_KID_ID);
    const stats = await eh.parent.getParentStats(FIXTURE_KID_ID);
    expect(kid?.xp).toBe(40);
    expect(stats.missionsCompleted).toBe(2);
    expect(stats.weakSkillTags[0]).toBe("locate_evidence");
  });
});

describe("parent PIN unlock gate helpers", () => {
  const memory = new Map<string, string>();

  beforeEach(() => {
    memory.clear();
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => memory.get(key) ?? null,
        setItem: (key: string, value: string) => {
          memory.set(key, value);
        },
        removeItem: (key: string) => {
          memory.delete(key);
        },
      },
    });
    clearParentSession();
  });

  afterEach(() => {
    clearParentSession();
    resetFixture({ reminderEnabled: false });
    Reflect.deleteProperty(globalThis, "sessionStorage");
  });

  it("isParentUnlocked stays false until unlock after verifyPin success", async () => {
    expect(isParentUnlocked()).toBe(false);

    const eh = getEhData();
    const ok = await eh.parent.verifyPin(FIXTURE_PARENT_PIN);
    expect(ok).toBe(true);
    // Data layer auth is separate from UI session unlock.
    expect(isParentUnlocked()).toBe(false);

    unlockParentSession();
    expect(isParentUnlocked()).toBe(true);

    clearParentSession();
    expect(isParentUnlocked()).toBe(false);
  });

  it("verifyPin rejects wrong PIN; getParentStats remains data-layer only", async () => {
    const eh = getEhData();
    await expect(eh.parent.verifyPin("0000")).resolves.toBe(false);
    expect(isParentUnlocked()).toBe(false);

    const stats = await eh.parent.getParentStats(FIXTURE_KID_ID);
    expect(stats.kidId).toBe(FIXTURE_KID_ID);
  });
});
