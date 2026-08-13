import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { mapPublicKid, type ConvexPublicKid } from "../mapPublicKid";
import type {
  Attempt,
  CompleteOnboardingInput,
  CompleteResult,
  EhData,
  EhKid,
  EhSession,
  EquipCosmeticInput,
  HintInput,
  HintResult,
  MissionDetail,
  MissionSummary,
  ParentStats,
  SubmitAnswerInput,
  SubmitAnswerResult,
  XpLedgerEntry,
} from "../types";

/** Minimal Convex client surface used by the adapter (query / mutation / action). */
export type ConvexEhClient = {
  query: (ref: unknown, args: Record<string, unknown>) => Promise<unknown>;
  mutation: (ref: unknown, args: Record<string, unknown>) => Promise<unknown>;
  action: (ref: unknown, args: Record<string, unknown>) => Promise<unknown>;
};

type ConvexAttempt = {
  _id: string;
  kidId: string;
  missionId: string;
  status: "active" | "completed";
  startedAt: number;
  completedAt?: number;
  currentQuestionIndex: number;
  questionResults: Attempt["questionResults"];
  currentHintsUsed: number;
  hintsByQuestionKey: Record<string, number>;
  xpEarned: number;
  firstDailyBonus: boolean;
  completionSnapshot?: Attempt["completionSnapshot"];
};

function mapAttempt(doc: ConvexAttempt): Attempt {
  return {
    id: doc._id,
    kidId: doc.kidId,
    missionId: doc.missionId,
    status: doc.status,
    startedAt: doc.startedAt,
    completedAt: doc.completedAt,
    currentQuestionIndex: doc.currentQuestionIndex,
    questionResults: doc.questionResults,
    currentHintsUsed: doc.currentHintsUsed,
    hintsByQuestionKey: doc.hintsByQuestionKey,
    xpEarned: doc.xpEarned,
    firstDailyBonus: doc.firstDailyBonus,
    completionSnapshot: doc.completionSnapshot,
  };
}

function asKidId(kidId: string): Id<"kids"> {
  return kidId as Id<"kids">;
}

function asAttemptId(attemptId: string): Id<"attempts"> {
  return attemptId as Id<"attempts">;
}

/**
 * Live EhData against Convex + Clerk JWT (via ConvexProviderWithClerk).
 * Fail-closed: missing identity → empty session / mutations throw.
 */
export function createConvexAdapter(client: ConvexEhClient): EhData {
  return {
    mode: "convex",
    auth: {
      async getSession(): Promise<EhSession> {
        const session = (await client.query(
          api.authSession.getSession,
          {},
        )) as {
          parentId: string | null;
          activeKidId: string | null;
        };
        return {
          parentId: session.parentId,
          activeKidId: session.activeKidId,
        };
      },
      async selectKid(kidId: string): Promise<void> {
        await client.mutation(api.authSession.selectKid, {
          kidId: asKidId(kidId),
        });
      },
    },
    kids: {
      async list(): Promise<EhKid[]> {
        const kids = (await client.query(
          api.kids.list,
          {},
        )) as ConvexPublicKid[];
        return kids.map(mapPublicKid);
      },
      async get(kidId: string): Promise<EhKid | null> {
        const kid = (await client.query(api.kids.get, {
          kidId: asKidId(kidId),
        })) as ConvexPublicKid | null;
        return kid ? mapPublicKid(kid) : null;
      },
      async create(input: {
        displayName: string;
        gradeBand: "3-5";
      }): Promise<EhKid> {
        const kid = (await client.mutation(api.kids.create, {
          displayName: input.displayName,
          gradeBand: input.gradeBand,
        })) as ConvexPublicKid;
        return mapPublicKid(kid);
      },
    },
    missions: {
      async list(): Promise<MissionSummary[]> {
        return (await client.query(api.missions.list, {
          nowMs: Date.now(),
        })) as MissionSummary[];
      },
      async get(missionId: string): Promise<MissionDetail | null> {
        return (await client.query(api.missions.get, {
          missionId,
        })) as MissionDetail | null;
      },
    },
    attempts: {
      async getActive(
        kidId: string,
        missionId: string,
      ): Promise<Attempt | null> {
        const doc = (await client.query(api.attempts.getActive, {
          kidId: asKidId(kidId),
          missionId,
        })) as ConvexAttempt | null;
        return doc ? mapAttempt(doc) : null;
      },
      async start(kidId: string, missionId: string): Promise<Attempt> {
        const doc = (await client.mutation(api.attempts.start, {
          kidId: asKidId(kidId),
          missionId,
        })) as ConvexAttempt;
        return mapAttempt(doc);
      },
      async submitAnswer(
        input: SubmitAnswerInput,
      ): Promise<SubmitAnswerResult> {
        const result = (await client.mutation(api.attempts.submitAnswer, {
          attemptId: asAttemptId(input.attemptId),
          questionKey: input.questionKey,
          evidenceId: input.evidenceId,
          choiceId: input.choiceId,
          claimedCorrect: input.claimedCorrect,
        })) as {
          correct: boolean;
          xpAwarded: number;
          hintsUsed: number;
          feedback: string;
          attempt: ConvexAttempt;
          nextQuestionIndex: number | null;
        };
        return {
          correct: result.correct,
          xpAwarded: result.xpAwarded,
          hintsUsed: result.hintsUsed,
          feedback: result.feedback,
          attempt: mapAttempt(result.attempt),
          nextQuestionIndex: result.nextQuestionIndex,
        };
      },
      async requestHint(input: HintInput): Promise<HintResult> {
        const hint = (await client.action(api.hintRequests.requestHint, {
          attemptId: asAttemptId(input.attemptId),
          questionKey: input.questionKey,
        })) as {
          step: number;
          text: string;
          source: "static" | "grok";
          glowEvidenceIds: string[];
        };
        const attemptDoc = (await client.query(api.attempts.get, {
          attemptId: asAttemptId(input.attemptId),
        })) as ConvexAttempt | null;
        if (!attemptDoc) throw new Error("Attempt not found");
        return {
          step: hint.step,
          text: hint.text,
          source: hint.source,
          glowEvidenceIds: hint.glowEvidenceIds,
          attempt: mapAttempt(attemptDoc),
        };
      },
      async complete(input: { attemptId: string }): Promise<CompleteResult> {
        const result = (await client.mutation(api.attempts.complete, {
          attemptId: asAttemptId(input.attemptId),
        })) as {
          attempt: ConvexAttempt;
          kid: ConvexPublicKid;
          xpBreakdown: CompleteResult["xpBreakdown"];
          leveledUp: boolean;
          previousLevel: number;
          ledger: Array<{
            _id: string;
            kidId: string;
            attemptId?: string;
            reason: XpLedgerEntry["reason"];
            delta: number;
            balanceAfter: number;
            createdAt: number;
          }>;
          newSectorStamps: string[];
        };
        return {
          attempt: mapAttempt(result.attempt),
          kid: mapPublicKid(result.kid),
          xpBreakdown: result.xpBreakdown,
          leveledUp: result.leveledUp,
          previousLevel: result.previousLevel,
          ledger: result.ledger.map((entry) => ({
            id: entry._id,
            kidId: entry.kidId,
            attemptId: entry.attemptId,
            reason: entry.reason,
            delta: entry.delta,
            balanceAfter: entry.balanceAfter,
            createdAt: entry.createdAt,
          })),
          newSectorStamps: result.newSectorStamps,
        };
      },
    },
    cosmetics: {
      async equipCosmetic(input: EquipCosmeticInput): Promise<EhKid> {
        const kid = (await client.mutation(api.kids.equipCosmetic, {
          kidId: asKidId(input.kidId),
          cosmeticId: input.cosmeticId,
        })) as ConvexPublicKid;
        return mapPublicKid(kid);
      },
    },
    parent: {
      async verifyPin(pin: string): Promise<boolean> {
        const result = (await client.mutation(api.parents.verifyPin, {
          pin,
        })) as { ok: boolean };
        return result.ok;
      },
      async setPin(pin: string): Promise<void> {
        await client.mutation(api.parents.setPin, { pin });
      },
      async getParentStats(kidId: string): Promise<ParentStats> {
        const stats = (await client.query(api.parents.getParentStats, {
          kidId: asKidId(kidId),
        })) as {
          kidId: string;
          displayName: string;
          xp: number;
          level: number;
          streakDays: number;
          missionsCompleted: number;
          weakSkillTags: string[];
          reminderEnabled: boolean;
        };
        return {
          kidId: stats.kidId,
          displayName: stats.displayName,
          xp: stats.xp,
          level: stats.level,
          streakDays: stats.streakDays,
          missionsCompleted: stats.missionsCompleted,
          weakSkillTags: stats.weakSkillTags,
          reminderEnabled: stats.reminderEnabled,
        };
      },
      async updateKidName(kidId: string, displayName: string): Promise<EhKid> {
        const kid = (await client.mutation(api.parents.updateKidName, {
          kidId: asKidId(kidId),
          displayName,
        })) as ConvexPublicKid;
        return mapPublicKid(kid);
      },
      async setReminderEnabled(enabled: boolean): Promise<void> {
        await client.mutation(api.parents.setReminderEnabled, { enabled });
      },
    },
    setup: {
      async complete(input: CompleteOnboardingInput): Promise<EhKid> {
        const created = (await client.mutation(api.setup.completeOnboarding, {
          displayName: input.displayName,
          gradeBand: input.gradeBand,
          pin: input.pin,
        })) as { parentId: string; kidId: string };
        const kid = (await client.query(api.kids.get, {
          kidId: asKidId(created.kidId),
        })) as ConvexPublicKid | null;
        if (!kid) throw new Error("Kid not found after onboarding");
        return mapPublicKid(kid);
      },
    },
  };
}

/**
 * @deprecated Use createConvexAdapter(useConvex()) from EhProvider.
 * Kept so accidental imports fail loudly instead of silent fixture drift.
 */
export const convexAdapter: EhData = createConvexAdapter({
  query: async () => {
    throw new Error(
      "convexAdapter: call createConvexAdapter(useConvex()) inside EhProvider when VITE_EH_DATA=convex",
    );
  },
  mutation: async () => {
    throw new Error(
      "convexAdapter: call createConvexAdapter(useConvex()) inside EhProvider when VITE_EH_DATA=convex",
    );
  },
  action: async () => {
    throw new Error(
      "convexAdapter: call createConvexAdapter(useConvex()) inside EhProvider when VITE_EH_DATA=convex",
    );
  },
});
