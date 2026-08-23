import {
  DEFAULT_SHIP_PAINT_ID,
  equipSlotForKind,
  getCosmetic,
  isCosmeticUnlocked,
  mergeUnlocks,
  sectorStampsForClears,
  unlocksForLevel,
} from "../../cosmetics";
import {
  FIXTURE_KID_ID,
  FIXTURE_KID_NAME,
  FIXTURE_PARENT_ID,
  FIXTURE_PARENT_PIN,
  fixtureSignInAsParent,
  getFixtureSession,
} from "../auth/fixtureAuth";
import {
  ALL_FIXTURE_MISSIONS,
  fixtureMissionById,
} from "../fixtures/missionsStub";
import {
  blackHoleUnlocked,
  maybeStampBlackHoleUnlockedAt,
} from "../pure/bhGate";
import { reduceComplete, reduceHint, reduceSubmit } from "../pure/attempt";
import { levelForXp, xpFloorForLevel } from "../pure/level";
import { assertMissionPlayable, summarizeMission } from "../pure/missionLock";
import { assertCorrectConnectionMap } from "../pure/reflection";
import {
  computeWeakSkillTags,
  skillTagForQuestionType,
} from "../pure/skillTags";
import { localDateString } from "../pure/streak";
import type {
  Attempt,
  CompleteResult,
  EhData,
  EhKid,
  HintEvent,
  MissionDetail,
  ParentRecording,
  QuestionResult,
  XpLedgerEntry,
} from "../types";

type FixtureRecording = ParentRecording & { attemptId: string };

type Store = {
  pin: string;
  kids: Map<string, EhKid>;
  attempts: Map<string, Attempt>;
  ledger: XpLedgerEntry[];
  hintEvents: HintEvent[];
  missionsCompleted: Map<string, number>;
  /** BH completion timestamps (ms) per kid — weekly cap window. */
  bhCompletions: Map<string, number[]>;
  recordings: Map<string, FixtureRecording>;
  reminderEnabled: boolean;
  /** Injectable clock for weekly-cap tests. */
  nowMs?: number;
};

const globalStore = globalThis as typeof globalThis & {
  __ehFixtureStore?: Store;
};

function now(): number {
  // Avoid recurse during first getStore() seed (createDefaultKid → now).
  return globalStore.__ehFixtureStore?.nowMs ?? Date.now();
}

/** Test helper: advance fixture clock without wiping kid state. */
export function setFixtureNowMs(ms: number): void {
  getStore().nowMs = ms;
}

function createDefaultKid(overrides?: Partial<EhKid>): EhKid {
  const xp = overrides?.xp ?? 0;
  const level = overrides?.level ?? levelForXp(xp);
  const streakDays = overrides?.streakDays ?? 0;
  const unlocks = overrides?.unlocks ?? unlocksForLevel(level);
  const blackHoleUnlockedAt =
    overrides?.blackHoleUnlockedAt ??
    maybeStampBlackHoleUnlockedAt(
      undefined,
      blackHoleUnlocked(level, streakDays),
      now(),
    );
  return {
    id: FIXTURE_KID_ID,
    displayName: overrides?.displayName ?? FIXTURE_KID_NAME,
    gradeBand: "3-5",
    xp,
    level,
    streakDays,
    lastMissionDate: overrides?.lastMissionDate,
    unlocks,
    equippedShipPaintId:
      overrides?.equippedShipPaintId ?? DEFAULT_SHIP_PAINT_ID,
    equippedTelescopeId: overrides?.equippedTelescopeId,
    blackHoleUnlockedAt,
  };
}

function syncKidUnlocks(kid: EhKid, missionsCompleted = 0): EhKid {
  const unlocked = blackHoleUnlocked(kid.level, kid.streakDays);
  const blackHoleUnlockedAt = maybeStampBlackHoleUnlockedAt(
    kid.blackHoleUnlockedAt,
    unlocked,
    now(),
  );
  return {
    ...kid,
    unlocks: mergeUnlocks({ ...kid, missionsCompleted }),
    blackHoleUnlockedAt,
  };
}

function emptyStore(reminderEnabled = false): Store {
  return {
    pin: FIXTURE_PARENT_PIN,
    kids: new Map(),
    attempts: new Map(),
    ledger: [],
    hintEvents: [],
    missionsCompleted: new Map(),
    bhCompletions: new Map(),
    recordings: new Map(),
    reminderEnabled,
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
  /** Seed by level floor XP (Slice 5 BH unlock demos). */
  level?: number;
  streakDays?: number;
  lastMissionDate?: string;
  missionsCompleted?: number;
  bhCompletionTimestampsMs?: number[];
  nowMs?: number;
  /** Parent reminder flag (default false). */
  reminderEnabled?: boolean;
};

/** Reset in-memory fixture state (tests / level-up demos / onboarding). */
export function resetFixture(options: ResetFixtureOptions = {}): void {
  const reminderEnabled = options.reminderEnabled ?? false;
  const seed = options.seedDefaultKid !== false;
  if (!seed) {
    globalStore.__ehFixtureStore = emptyStore(reminderEnabled);
    if (options.nowMs !== undefined) {
      globalStore.__ehFixtureStore.nowMs = options.nowMs;
    }
    return;
  }
  // Seed clock before first kid create so blackHoleUnlockedAt is deterministic.
  const store = emptyStore(reminderEnabled);
  if (options.nowMs !== undefined) {
    store.nowMs = options.nowMs;
  }
  globalStore.__ehFixtureStore = store;

  const xpFromLevel =
    options.level !== undefined ? xpFloorForLevel(options.level) : undefined;
  const xp = options.xpTotal ?? xpFromLevel;
  // When seeding a non-zero streak without an explicit date, stamp yesterday
  // (real local calendar — same clock complete() uses) so the next complete()
  // continues the streak instead of resetting to 1.
  let lastMissionDate = options.lastMissionDate;
  if (lastMissionDate === undefined && (options.streakDays ?? 0) > 0) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    lastMissionDate = localDateString(yesterday);
  }
  const hasKidOverrides =
    xp !== undefined ||
    options.streakDays !== undefined ||
    lastMissionDate !== undefined ||
    options.level !== undefined;

  store.kids.set(
    FIXTURE_KID_ID,
    createDefaultKid(
      hasKidOverrides
        ? {
            xp: xp ?? 0,
            level: options.level,
            streakDays: options.streakDays,
            lastMissionDate,
          }
        : undefined,
    ),
  );

  if (options.missionsCompleted !== undefined) {
    store.missionsCompleted.set(FIXTURE_KID_ID, options.missionsCompleted);
    const kid = store.kids.get(FIXTURE_KID_ID);
    if (kid) {
      store.kids.set(
        FIXTURE_KID_ID,
        syncKidUnlocks(kid, options.missionsCompleted),
      );
    }
  }

  if (options.bhCompletionTimestampsMs) {
    store.bhCompletions.set(FIXTURE_KID_ID, [
      ...options.bhCompletionTimestampsMs,
    ]);
  }
}

/** Alias for Slice 1 tests — same options as resetFixture. */
export function resetFixtureAdapter(options?: ResetFixtureOptions): void {
  resetFixture(options ?? {});
}

function missionById(missionId: string): MissionDetail | null {
  return fixtureMissionById(missionId);
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

function playableOrThrow(mission: MissionDetail, kid: EhKid): void {
  assertMissionPlayable({
    mission,
    kid,
    bhCompletionTimestampsMs: getStore().bhCompletions.get(kid.id) ?? [],
    nowMs: now(),
  });
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
      const store = getStore();
      return [...store.kids.values()].map((kid) =>
        syncKidUnlocks(kid, store.missionsCompleted.get(kid.id) ?? 0),
      );
    },
    async get(kidId) {
      const store = getStore();
      const kid = store.kids.get(kidId);
      return kid
        ? syncKidUnlocks(kid, store.missionsCompleted.get(kidId) ?? 0)
        : null;
    },
    async create(input) {
      const store = getStore();
      const existing = store.kids.get(FIXTURE_KID_ID);
      if (existing) {
        return syncKidUnlocks(
          existing,
          store.missionsCompleted.get(existing.id) ?? 0,
        );
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
      const store = getStore();
      const kid = store.kids.get(FIXTURE_KID_ID) ?? [...store.kids.values()][0];
      const synced = kid
        ? syncKidUnlocks(kid, store.missionsCompleted.get(kid.id) ?? 0)
        : undefined;
      return ALL_FIXTURE_MISSIONS.map((mission) =>
        summarizeMission({
          mission,
          kid: synced,
          bhCompletionTimestampsMs: synced
            ? (store.bhCompletions.get(synced.id) ?? [])
            : [],
          nowMs: now(),
        }),
      );
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
      const kid = store.kids.get(kidId);
      if (!kid) throw new Error("Kid not found");
      const mission = missionById(missionId);
      if (!mission) throw new Error("Mission not found");

      playableOrThrow(
        mission,
        syncKidUnlocks(kid, store.missionsCompleted.get(kidId) ?? 0),
      );

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
        startedAt: now(),
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
        createdAt: now(),
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

      if (attempt.status !== "completed" && mission.kind === "blackHole") {
        playableOrThrow(
          mission,
          syncKidUnlocks(kid, store.missionsCompleted.get(kid.id) ?? 0),
        );
      }

      const reduced = reduceComplete({
        attempt,
        mission,
        kid,
        today: localDateString(),
        now: now(),
      });

      const priorCompleted = store.missionsCompleted.get(kid.id) ?? 0;
      let kidWithUnlocks = syncKidUnlocks(reduced.kid, priorCompleted);
      let newSectorStamps: string[] = [];

      if (reduced.kind === "fresh") {
        for (const delta of reduced.ledgerDeltas) {
          appendLedger(delta);
        }

        const completedCount = priorCompleted + 1;
        store.missionsCompleted.set(kidWithUnlocks.id, completedCount);

        const beforeStamps = new Set(sectorStampsForClears(priorCompleted));
        const afterStamps = sectorStampsForClears(completedCount);
        newSectorStamps = afterStamps.filter((id) => !beforeStamps.has(id));

        kidWithUnlocks = syncKidUnlocks(kidWithUnlocks, completedCount);
        // Persist newly earned sector stamps into unlocks (streak break safe).
        kidWithUnlocks = {
          ...kidWithUnlocks,
          unlocks: [...new Set([...kidWithUnlocks.unlocks, ...afterStamps])],
        };

        if (mission.kind === "blackHole") {
          const prev = store.bhCompletions.get(kidWithUnlocks.id) ?? [];
          store.bhCompletions.set(kidWithUnlocks.id, [
            ...prev,
            reduced.attempt.completedAt ?? now(),
          ]);
        }

        store.kids.set(kidWithUnlocks.id, kidWithUnlocks);
        store.attempts.set(reduced.attempt.id, reduced.attempt);
      }

      return {
        attempt: reduced.attempt,
        kid: kidWithUnlocks,
        xpBreakdown: reduced.xpBreakdown,
        leveledUp: reduced.leveledUp,
        previousLevel: reduced.previousLevel,
        ledger: store.ledger.filter((e) => e.attemptId === attempt.id),
        newSectorStamps,
      };
    },
  },
  reflections: {
    async save(input) {
      const store = getStore();
      const attempt = getAttemptOrThrow(input.attemptId);
      if (attempt.missionId !== input.missionId) {
        throw new Error("Reflection does not match this mission");
      }
      const mission = missionById(input.missionId);
      if (!mission) throw new Error("Mission not found");
      assertCorrectConnectionMap(mission, input.mapCardIds);

      const previous = [...store.recordings.values()].find(
        (recording) => recording.attemptId === input.attemptId,
      );
      if (previous) {
        URL.revokeObjectURL(previous.audioUrl);
        store.recordings.delete(previous.id);
      }

      if (!input.recording) return;
      const recordingId = nextId("recording");
      store.recordings.set(recordingId, {
        id: recordingId,
        attemptId: attempt.id,
        kidId: attempt.kidId,
        missionId: mission.id,
        missionTitle: mission.title,
        createdAt: now(),
        durationSeconds: input.recording.durationSeconds,
        mimeType: input.recording.mimeType,
        audioUrl: URL.createObjectURL(input.recording.blob),
        parentGuide: mission.reflection?.parentGuide ?? "",
      });
    },
  },
  cosmetics: {
    async equipCosmetic(input) {
      const store = getStore();
      const kid = store.kids.get(input.kidId);
      if (!kid) throw new Error("Kid not found");

      const def = getCosmetic(input.cosmeticId);
      if (!def) throw new Error("Unknown cosmetic");

      const unlocked = syncKidUnlocks(
        kid,
        store.missionsCompleted.get(kid.id) ?? 0,
      );
      if (!isCosmeticUnlocked(def.id, unlocked)) {
        throw new Error("Cosmetic locked");
      }

      const slot = equipSlotForKind(def.kind);
      if (!slot) throw new Error("Cosmetic cannot be equipped");

      const next: EhKid = { ...unlocked, [slot]: def.id };
      store.kids.set(next.id, next);
      return next;
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
    async getParentStats(kidId) {
      const store = getStore();
      const kid = store.kids.get(kidId);
      if (!kid) {
        throw new Error("Kid not found");
      }
      const synced = syncKidUnlocks(
        kid,
        store.missionsCompleted.get(kidId) ?? 0,
      );
      const kidAttempts = [...store.attempts.values()].filter(
        (attempt) => attempt.kidId === kidId,
      );
      return {
        kidId: synced.id,
        displayName: synced.displayName,
        xp: synced.xp,
        level: synced.level,
        streakDays: synced.streakDays,
        missionsCompleted: store.missionsCompleted.get(kidId) ?? 0,
        weakSkillTags: computeWeakSkillTags(kidAttempts, missionById),
        reminderEnabled: store.reminderEnabled,
      };
    },
    async updateKidName(kidId, displayName) {
      const store = getStore();
      const kid = store.kids.get(kidId);
      if (!kid) {
        throw new Error("Kid not found");
      }
      const trimmed = displayName.trim();
      if (trimmed.length < 1 || trimmed.length > 40) {
        throw new Error("Display name must be 1–40 characters");
      }
      const next = syncKidUnlocks(
        { ...kid, displayName: trimmed },
        store.missionsCompleted.get(kidId) ?? 0,
      );
      store.kids.set(kidId, next);
      return next;
    },
    async setReminderEnabled(enabled) {
      getStore().reminderEnabled = enabled;
    },
    async listRecordings(kidId) {
      return [...getStore().recordings.values()]
        .filter((recording) => recording.kidId === kidId)
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(({ attemptId: _attemptId, ...recording }) => recording);
    },
    async deleteRecording(recordingId) {
      const store = getStore();
      const recording = store.recordings.get(recordingId);
      if (!recording) return;
      URL.revokeObjectURL(recording.audioUrl);
      store.recordings.delete(recordingId);
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

export type SeedFixtureWrongAnswersOptions = {
  skillTag: string;
  count?: number;
  kidId?: string;
  missionId?: string;
};

/** Test helper: seed incorrect results for a skillTag (no XP / mission bumps). */
export function seedFixtureWrongAnswers(
  options: SeedFixtureWrongAnswersOptions,
): void {
  const store = getStore();
  const kidId = options.kidId ?? FIXTURE_KID_ID;
  const missionId = options.missionId ?? "mission_01_mars_dust";
  const count = options.count ?? 2;

  if (!store.kids.has(kidId)) {
    throw new Error("Kid not found");
  }
  const mission = missionById(missionId);
  if (!mission) {
    throw new Error("Mission not found");
  }

  const matchingQuestions = mission.questions.filter(
    (question) => skillTagForQuestionType(question.type) === options.skillTag,
  );
  if (matchingQuestions.length === 0) {
    throw new Error(`No questions for skill tag ${options.skillTag}`);
  }

  let attempt: Attempt | undefined;
  for (const existing of store.attempts.values()) {
    if (existing.kidId === kidId && existing.missionId === missionId) {
      attempt = existing;
      break;
    }
  }

  if (!attempt) {
    attempt = {
      id: nextId("att"),
      kidId,
      missionId,
      status: "completed",
      startedAt: now(),
      completedAt: now(),
      currentQuestionIndex: mission.questions.length,
      questionResults: [],
      currentHintsUsed: 0,
      hintsByQuestionKey: {},
      xpEarned: 0,
      firstDailyBonus: false,
    };
    store.attempts.set(attempt.id, attempt);
  }

  const wrongs: QuestionResult[] = [];
  for (let i = 0; i < count; i += 1) {
    const question = matchingQuestions[i % matchingQuestions.length]!;
    wrongs.push({
      questionKey: question.id,
      correct: false,
      hintsUsed: 0,
      xpAwarded: 0,
    });
  }

  const next: Attempt = {
    ...attempt,
    questionResults: [...attempt.questionResults, ...wrongs],
  };
  store.attempts.set(next.id, next);
}

/** Test helper: expose ledger / hints without widening EhData. */
export function getFixtureDebugState() {
  const store = getStore();
  return {
    ledger: [...store.ledger],
    hintEvents: [...store.hintEvents],
    attempts: [...store.attempts.values()],
    kids: [...store.kids.values()],
    missionsCompleted: Object.fromEntries(store.missionsCompleted),
    bhCompletions: Object.fromEntries(
      [...store.bhCompletions.entries()].map(([k, v]) => [k, [...v]]),
    ),
    recordings: [...store.recordings.values()],
    reminderEnabled: store.reminderEnabled,
  };
}
