export type GradeBand = "3-5";

export type ParentRecord = {
  id: string;
  clerkUserId: string;
  pinHash: string;
  reminderEnabled: boolean;
  createdAt: number;
  updatedAt: number;
};

export type KidRecord = {
  id: string;
  parentId: string;
  displayName: string;
  gradeBand: GradeBand;
  xpTotal: number;
  level: number;
  streakDays: number;
  lastMissionDate?: string;
  unlockedCosmeticIds: string[];
  equippedShipPaintId?: string;
  equippedTelescopeId?: string;
  blackHoleUnlockedAt?: number;
  createdAt: number;
  updatedAt: number;
};

export type KidPublic = {
  id: string;
  displayName: string;
  gradeBand: GradeBand;
  xpTotal: number;
  level: number;
  streakDays: number;
};

export type SetupState =
  | { onboarded: false }
  | { onboarded: true; parentId: string; kid: KidPublic }
  | null;

export type MissionSentence = {
  id: string;
  text: string;
};

export type MissionQuestion =
  | {
      id: string;
      type: "locate";
      prompt: string;
      correct: string;
    }
  | {
      id: string;
      type: "main_idea_mc" | "vocab_in_context_mc" | "infer_with_evidence_mc";
      prompt: string;
      choices: { id: string; text: string }[];
      correct: string;
      stemSentenceId?: string;
    };

export type MissionFixture = {
  id: string;
  title: string;
  planet: string;
  gradeBand: GradeBand;
  estimatedMinutes: number;
  skillTags: string[];
  objective: string;
  sentences: MissionSentence[];
  questions: MissionQuestion[];
};

export type MissionAttempt = {
  id: string;
  kidId: string;
  missionId: string;
  status: "not_started" | "in_progress" | "completed";
  hintsUsed: number;
  xpEarned: number;
  createdAt: number;
  updatedAt: number;
};

export type EventHorizonRepository = {
  getSetupState(clerkUserId: string | null): SetupState;
  completeOnboarding(input: {
    clerkUserId: string;
    displayName: string;
    gradeBand: GradeBand;
    pin: string;
  }): Promise<{ parentId: string; kidId: string }>;
  verifyPin(input: {
    clerkUserId: string;
    pin: string;
  }): Promise<{ ok: boolean }>;
  renameKid(input: {
    clerkUserId: string;
    kidId: string;
    displayName: string;
  }): Promise<KidPublic>;
  listMissions(): MissionFixture[];
  listAttempts(kidId: string): MissionAttempt[];
};
