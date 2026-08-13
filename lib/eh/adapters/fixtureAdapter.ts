import {
  FIXTURE_KID_ID,
  FIXTURE_KID_NAME,
  FIXTURE_PARENT_ID,
  FIXTURE_PARENT_PIN,
  fixtureSignInAsParent,
  getFixtureSession,
} from "../auth/fixtureAuth";
import { mission01 } from "../fixtures/mission01";
import { glowIdsForHint, gradeAnswer } from "../pure/grade";
import { levelForXp } from "../pure/level";
import { localDateString, nextStreakState } from "../pure/streak";
import {
  FIRST_DAILY_XP,
  MISSION_COMPLETE_XP,
  xpForCorrectAnswer,
} from "../pure/xp";
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

function applyXp(kid: EhKid, delta: number): EhKid {
  const xp = kid.xp + delta;
  const updated: EhKid = { ...kid, xp, level: levelForXp(xp) };
  getStore().kids.set(kid.id, updated);
  return updated;
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
        xpEarned: 0,
        firstDailyBonus: false,
      };
      store.attempts.set(attempt.id, attempt);
      return attempt;
    },
    async submitAnswer(input) {
      const store = getStore();
      const attempt = getAttemptOrThrow(input.attemptId);
      if (attempt.status !== "active") {
        throw new Error("Attempt already completed");
      }
      const mission = missionById(attempt.missionId);
      if (!mission) throw new Error("Mission not found");

      const question = mission.questions.find(
        (q) => q.id === input.questionKey,
      );
      if (!question) throw new Error("Question not found");

      // Reject forged "correct" — grader ignores claimedCorrect
      const graded = gradeAnswer({
        question,
        evidenceId: input.evidenceId,
        choiceId: input.choiceId,
        claimedCorrect: input.claimedCorrect,
      });

      if (!graded.correct) {
        return {
          correct: false,
          xpAwarded: 0,
          hintsUsed: attempt.currentHintsUsed,
          feedback: graded.reason,
          attempt,
          nextQuestionIndex: attempt.currentQuestionIndex,
        };
      }

      const hintsUsed = attempt.currentHintsUsed;
      const xpAwarded = xpForCorrectAnswer({
        xpKind: question.xpKind,
        hintsUsed,
      });

      const result = {
        questionKey: question.id,
        correct: true,
        hintsUsed,
        evidenceId: input.evidenceId,
        choiceId: input.choiceId,
        xpAwarded,
      };

      const withoutPrior = attempt.questionResults.filter(
        (r) => r.questionKey !== question.id,
      );
      const questionResults = [...withoutPrior, result];
      const nextIndex = mission.questions.findIndex(
        (q) =>
          !questionResults.some((r) => r.questionKey === q.id && r.correct),
      );

      const updated: Attempt = {
        ...attempt,
        questionResults,
        currentHintsUsed: 0,
        currentQuestionIndex:
          nextIndex === -1 ? mission.questions.length : nextIndex,
        xpEarned: questionResults.reduce((sum, r) => sum + r.xpAwarded, 0),
      };
      store.attempts.set(updated.id, updated);

      return {
        correct: true,
        xpAwarded,
        hintsUsed,
        feedback: graded.reason,
        attempt: updated,
        nextQuestionIndex: nextIndex === -1 ? null : nextIndex,
      };
    },
    async requestHint(input) {
      const store = getStore();
      const attempt = getAttemptOrThrow(input.attemptId);
      if (attempt.status !== "active") {
        throw new Error("Attempt already completed");
      }
      const mission = missionById(attempt.missionId);
      if (!mission) throw new Error("Mission not found");
      const question = mission.questions.find(
        (q) => q.id === input.questionKey,
      );
      if (!question) throw new Error("Question not found");

      const nextStep = Math.min(4, attempt.currentHintsUsed + 1);
      const text = question.hints[nextStep - 1] ?? question.hints[3];
      const updated: Attempt = {
        ...attempt,
        currentHintsUsed: nextStep,
      };
      store.attempts.set(updated.id, updated);

      const event: HintEvent = {
        id: nextId("hint"),
        attemptId: attempt.id,
        questionKey: question.id,
        step: nextStep,
        source: "static",
        text,
        createdAt: Date.now(),
      };
      store.hintEvents.push(event);

      return {
        step: nextStep,
        text,
        source: "static" as const,
        glowEvidenceIds: glowIdsForHint(question, nextStep),
        attempt: updated,
      };
    },
    async complete(input): Promise<CompleteResult> {
      const store = getStore();
      const attempt = getAttemptOrThrow(input.attemptId);
      if (attempt.status === "completed") {
        const kid = store.kids.get(attempt.kidId);
        if (!kid) throw new Error("Kid not found");
        return {
          attempt,
          kid,
          xpBreakdown: {
            questions: 0,
            exitTicket: 0,
            missionComplete: 0,
            firstDaily: 0,
            total: attempt.xpEarned,
          },
          leveledUp: false,
          previousLevel: kid.level,
          ledger: store.ledger.filter((e) => e.attemptId === attempt.id),
        };
      }

      const mission = missionById(attempt.missionId);
      if (!mission) throw new Error("Mission not found");

      const allCorrect = mission.questions.every((q) =>
        attempt.questionResults.some(
          (r) => r.questionKey === q.id && r.correct,
        ),
      );
      if (!allCorrect) {
        throw new Error("Mission incomplete — answer every question first");
      }

      let kid = store.kids.get(attempt.kidId);
      if (!kid) throw new Error("Kid not found");
      const previousLevel = kid.level;
      const today = localDateString();
      const streak = nextStreakState({
        lastMissionDate: kid.lastMissionDate,
        streakDays: kid.streakDays,
        today,
      });

      const questionsXp = attempt.questionResults
        .filter((r) => {
          const q = mission.questions.find((mq) => mq.id === r.questionKey);
          return q?.xpKind === "question";
        })
        .reduce((sum, r) => sum + r.xpAwarded, 0);

      const exitTicket = attempt.questionResults
        .filter((r) => {
          const q = mission.questions.find((mq) => mq.id === r.questionKey);
          return q?.xpKind === "exit";
        })
        .reduce((sum, r) => sum + r.xpAwarded, 0);

      // Award per-question XP to profile (was held on attempt until complete)
      let balance = kid.xp;
      for (const r of attempt.questionResults) {
        const q = mission.questions.find((mq) => mq.id === r.questionKey);
        if (!q || r.xpAwarded <= 0) continue;
        balance += r.xpAwarded;
        appendLedger({
          kidId: kid.id,
          attemptId: attempt.id,
          reason: q.xpKind === "exit" ? "exit_ticket" : "question",
          delta: r.xpAwarded,
          balanceAfter: balance,
          createdAt: Date.now(),
        });
      }
      kid = applyXp(kid, attempt.xpEarned);

      const missionComplete = MISSION_COMPLETE_XP;
      kid = applyXp(kid, missionComplete);
      appendLedger({
        kidId: kid.id,
        attemptId: attempt.id,
        reason: "mission_complete",
        delta: missionComplete,
        balanceAfter: kid.xp,
        createdAt: Date.now(),
      });

      let firstDaily = 0;
      if (streak.isFirstDaily) {
        firstDaily = FIRST_DAILY_XP;
        kid = applyXp(kid, firstDaily);
        appendLedger({
          kidId: kid.id,
          attemptId: attempt.id,
          reason: "first_daily",
          delta: firstDaily,
          balanceAfter: kid.xp,
          createdAt: Date.now(),
        });
      }

      kid = {
        ...kid,
        streakDays: streak.streakDays,
        lastMissionDate: streak.lastMissionDate,
        level: levelForXp(kid.xp),
      };
      store.kids.set(kid.id, kid);

      const total = questionsXp + exitTicket + missionComplete + firstDaily;
      const completed: Attempt = {
        ...attempt,
        status: "completed",
        completedAt: Date.now(),
        xpEarned: total,
        firstDailyBonus: firstDaily > 0,
        currentQuestionIndex: mission.questions.length,
      };
      store.attempts.set(completed.id, completed);

      const completedCount = (store.missionsCompleted.get(kid.id) ?? 0) + 1;
      store.missionsCompleted.set(kid.id, completedCount);

      return {
        attempt: completed,
        kid,
        xpBreakdown: {
          questions: questionsXp,
          exitTicket,
          missionComplete,
          firstDaily,
          total,
        },
        leveledUp: kid.level > previousLevel,
        previousLevel,
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
