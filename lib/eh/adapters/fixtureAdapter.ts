import {
  FIXTURE_KID_ID,
  FIXTURE_KID_NAME,
  FIXTURE_PARENT_ID,
  FIXTURE_PARENT_PIN,
  fixtureSignInAsParent,
  getFixtureSession,
} from "../auth/fixtureAuth";
import { mission01 } from "../fixtures/mission01";
import { reduceComplete, reduceHint, reduceSubmit } from "../pure/attempt";
import { levelForXp } from "../pure/level";
import { localDateString } from "../pure/streak";
import type {
  Attempt,
  CompleteResult,
  EhData,
  EhKid,
  HintEvent,
  MissionDetail,
  XpLedgerEntry,
} from "../types";

type Store = {
  pin: string;
  kids: Map<string, EhKid>;
  attempts: Map<string, Attempt>;
  ledger: XpLedgerEntry[];
  hintEvents: HintEvent[];
  missionsCompleted: Map<string, number>;
};

const globalStore = globalThis as typeof globalThis & {
  __ehFixtureStore?: Store;
};

function createDefaultKid(overrides?: Partial<EhKid>): EhKid {
  const xp = overrides?.xp ?? 0;
  return {
    id: FIXTURE_KID_ID,
    displayName: overrides?.displayName ?? FIXTURE_KID_NAME,
    gradeBand: "3-5",
    xp,
    level: overrides?.level ?? levelForXp(xp),
    streakDays: overrides?.streakDays ?? 0,
    lastMissionDate: overrides?.lastMissionDate,
    unlocks: overrides?.unlocks ?? [],
  };
}

function emptyStore(): Store {
  return {
    pin: FIXTURE_PARENT_PIN,
    kids: new Map(),
    attempts: new Map(),
    ledger: [],
    hintEvents: [],
    missionsCompleted: new Map(),
  };
}

function getStore(): Store {
  if (!globalStore.__ehFixtureStore) {
    const store = emptyStore();
    store.kids.set(FIXTURE_KID_ID, createDefaultKid());
    globalStore.__ehFixtureStore = store;
  }
  return globalStore.__ehFixtureStore;
}

export type ResetFixtureOptions = {
  /** When false, start with no kids so onboarding/complete can run. Default true. */
  seedDefaultKid?: boolean;
  /** Seed kid XP (e.g. 90 to cross L2 after first-daily or mission XP). */
  xpTotal?: number;
  streakDays?: number;
  lastMissionDate?: string;
};

/** Reset in-memory fixture state (tests / level-up demos / onboarding). */
export function resetFixture(options: ResetFixtureOptions = {}): void {
  const seed = options.seedDefaultKid !== false;
  if (!seed) {
    globalStore.__ehFixtureStore = emptyStore();
    return;
  }
  globalStore.__ehFixtureStore = undefined;
  const store = getStore();
  if (
    options.xpTotal !== undefined ||
    options.streakDays !== undefined ||
    options.lastMissionDate !== undefined
  ) {
    store.kids.set(
      FIXTURE_KID_ID,
      createDefaultKid({
        xp: options.xpTotal ?? 0,
        streakDays: options.streakDays,
        lastMissionDate: options.lastMissionDate,
      }),
    );
  }
}

/** Alias for Slice 1 tests — same options as resetFixture. */
export function resetFixtureAdapter(options?: ResetFixtureOptions): void {
  resetFixture(options ?? {});
}

function missionById(missionId: string): MissionDetail | null {
  if (missionId === mission01.id) return mission01;
  return null;
}

function getAttemptOrThrow(attemptId: string): Attempt {
  const attempt = getStore().attempts.get(attemptId);
  if (!attempt) throw new Error("Attempt not found");
  return attempt;
}

function nextId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function appendLedger(entry: Omit<XpLedgerEntry, "id">): XpLedgerEntry {
  const full: XpLedgerEntry = { ...entry, id: nextId("xp") };
  getStore().ledger.push(full);
  return full;
}

export const fixtureAdapter: EhData = {
  mode: "fixture",
  auth: {
    async getSession() {
      return getFixtureSession();
    },
    async fixtureSignInAsParent() {
      await fixtureSignInAsParent();
    },
    async selectKid(kidId) {
      const store = getStore();
      if (!store.kids.has(kidId)) {
        throw new Error("Kid not found");
      }
      const session = await getFixtureSession();
      await fixtureSignInAsParent();
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(
          "eh.fixture.session",
          JSON.stringify({
            signedIn: true,
            parentId: session.parentId ?? FIXTURE_PARENT_ID,
            activeKidId: kidId,
          }),
        );
      }
    },
  },
  kids: {
    async list() {
      return [...getStore().kids.values()];
    },
    async get(kidId) {
      return getStore().kids.get(kidId) ?? null;
    },
    async create(input) {
      const store = getStore();
      const existing = store.kids.get(FIXTURE_KID_ID);
      if (existing) {
        return existing;
      }
      const kid = createDefaultKid({
        displayName: input.displayName.trim() || FIXTURE_KID_NAME,
      });
      store.kids.set(kid.id, kid);
      return kid;
    },
  },
  missions: {
    async list() {
      return [
        {
          id: mission01.id,
          title: mission01.title,
          planet: mission01.planet,
          planetId: mission01.planetId,
          gradeBand: mission01.gradeBand,
          estimatedMinutes: mission01.estimatedMinutes,
          objective: mission01.objective,
        },
      ];
    },
    async get(missionId) {
      return missionById(missionId);
    },
  },
  attempts: {
    async getActive(kidId, missionId) {
      for (const attempt of getStore().attempts.values()) {
        if (
          attempt.kidId === kidId &&
          attempt.missionId === missionId &&
          attempt.status === "active"
        ) {
          return attempt;
        }
      }
      return null;
    },
    async start(kidId, missionId) {
      const store = getStore();
      if (!store.kids.has(kidId)) throw new Error("Kid not found");
      const mission = missionById(missionId);
      if (!mission) throw new Error("Mission not found");

      const existing = await fixtureAdapter.attempts.getActive(
        kidId,
        missionId,
      );
      if (existing) return existing;

      const attempt: Attempt = {
        id: nextId("att"),
        kidId,
        missionId,
        status: "active",
        startedAt: Date.now(),
        currentQuestionIndex: 0,
        questionResults: [],
        currentHintsUsed: 0,
        hintsByQuestionKey: {},
        xpEarned: 0,
        firstDailyBonus: false,
      };
      store.attempts.set(attempt.id, attempt);
      return attempt;
    },
    async submitAnswer(input) {
      const store = getStore();
      const attempt = getAttemptOrThrow(input.attemptId);
      const mission = missionById(attempt.missionId);
      if (!mission) throw new Error("Mission not found");

      const reduced = reduceSubmit({
        attempt,
        mission,
        questionKey: input.questionKey,
        evidenceId: input.evidenceId,
        choiceId: input.choiceId,
        claimedCorrect: input.claimedCorrect,
      });
      store.attempts.set(reduced.attempt.id, reduced.attempt);

      return {
        correct: reduced.correct,
        xpAwarded: reduced.xpAwarded,
        hintsUsed: reduced.hintsUsed,
        feedback: reduced.feedback,
        attempt: reduced.attempt,
        nextQuestionIndex: reduced.nextQuestionIndex,
      };
    },
    async requestHint(input) {
      const store = getStore();
      const attempt = getAttemptOrThrow(input.attemptId);
      const mission = missionById(attempt.missionId);
      if (!mission) throw new Error("Mission not found");

      // Overnight: static only (no network / no Convex Grok path).
      const reduced = reduceHint({
        attempt,
        mission,
        questionKey: input.questionKey,
      });
      store.attempts.set(reduced.attempt.id, reduced.attempt);

      const event: HintEvent = {
        id: nextId("hint"),
        attemptId: attempt.id,
        questionKey: input.questionKey,
        step: reduced.step,
        source: "static",
        text: reduced.text,
        createdAt: Date.now(),
      };
      store.hintEvents.push(event);

      return {
        step: reduced.step,
        text: reduced.text,
        source: "static" as const,
        glowEvidenceIds: reduced.glowEvidenceIds,
        attempt: reduced.attempt,
      };
    },
    async complete(input): Promise<CompleteResult> {
      const store = getStore();
      const attempt = getAttemptOrThrow(input.attemptId);
      const mission = missionById(attempt.missionId);
      if (!mission) throw new Error("Mission not found");

      const kid = store.kids.get(attempt.kidId);
      if (!kid) throw new Error("Kid not found");

      const reduced = reduceComplete({
        attempt,
        mission,
        kid,
        today: localDateString(),
      });

      if (reduced.kind === "fresh") {
        for (const delta of reduced.ledgerDeltas) {
          appendLedger(delta);
        }
        store.kids.set(reduced.kid.id, reduced.kid);
        store.attempts.set(reduced.attempt.id, reduced.attempt);
        const completedCount =
          (store.missionsCompleted.get(reduced.kid.id) ?? 0) + 1;
        store.missionsCompleted.set(reduced.kid.id, completedCount);
      }

      return {
        attempt: reduced.attempt,
        kid: reduced.kid,
        xpBreakdown: reduced.xpBreakdown,
        leveledUp: reduced.leveledUp,
        previousLevel: reduced.previousLevel,
        ledger: store.ledger.filter((e) => e.attemptId === attempt.id),
      };
    },
  },
  parent: {
    async verifyPin(pin) {
      return pin === getStore().pin;
    },
    async setPin(pin) {
      if (!/^\d{4,6}$/.test(pin)) {
        throw new Error("PIN must be 4–6 digits");
      }
      getStore().pin = pin;
    },
    async progress(kidId) {
      const store = getStore();
      const kid = store.kids.get(kidId);
      if (!kid) {
        throw new Error("Kid not found");
      }
      return {
        kidId: kid.id,
        displayName: kid.displayName,
        xp: kid.xp,
        level: kid.level,
        streakDays: kid.streakDays,
        missionsCompleted: store.missionsCompleted.get(kidId) ?? 0,
      };
    },
  },
  setup: {
    async complete(input) {
      await fixtureAdapter.parent.setPin(input.pin);
      const kids = await fixtureAdapter.kids.list();
      if (kids[0]) {
        return kids[0];
      }
      return fixtureAdapter.kids.create({
        displayName: input.displayName,
        gradeBand: input.gradeBand,
      });
    },
  },
};

/** Test helper: expose ledger / hints without widening EhData. */
export function getFixtureDebugState() {
  const store = getStore();
  return {
    ledger: [...store.ledger],
    hintEvents: [...store.hintEvents],
    attempts: [...store.attempts.values()],
    kids: [...store.kids.values()],
  };
}
