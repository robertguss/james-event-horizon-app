export type EhMode = "fixture" | "convex";

export type EhKid = {
  id: string;
  displayName: string;
  gradeBand: "3-5";
  xp: number;
  level: number;
  streakDays: number;
  lastMissionDate?: string;
  unlocks: string[];
};

export type MissionSummary = {
  id: string;
  title: string;
  planet: string;
  gradeBand: "3-5";
  estimatedMinutes: number;
  objective: string;
};

export type MissionDetail = MissionSummary & {
  skillTags: string[];
  sentences: { id: string; text: string }[];
  questions: Array<{
    id: string;
    type: string;
    prompt: string;
    correct?: string;
    choices?: { id: string; text: string }[];
    stemSentenceId?: string;
  }>;
};

export type ParentProgress = {
  kidId: string;
  displayName: string;
  xp: number;
  level: number;
  streakDays: number;
  missionsCompleted: number;
};

export type EhSession = {
  parentId: string | null;
  activeKidId: string | null;
};

export type CompleteOnboardingInput = {
  displayName: string;
  gradeBand: "3-5";
  pin: string;
};

export type EhData = {
  mode: EhMode;
  auth: {
    getSession(): Promise<EhSession>;
    fixtureSignInAsParent?(): Promise<void>;
    selectKid(kidId: string): Promise<void>;
  };
  kids: {
    list(): Promise<EhKid[]>;
    get(kidId: string): Promise<EhKid | null>;
    create(input: { displayName: string; gradeBand: "3-5" }): Promise<EhKid>;
  };
  missions: {
    list(): Promise<MissionSummary[]>;
    get(missionId: string): Promise<MissionDetail | null>;
  };
  attempts: {
    // Slice 1: stubs only (no mission runtime)
    getActive(kidId: string, missionId: string): Promise<null>;
  };
  parent: {
    verifyPin(pin: string): Promise<boolean>;
    setPin(pin: string): Promise<void>;
    progress(kidId: string): Promise<ParentProgress>;
  };
  setup: {
    /** Create kid if needed + set parent PIN (fixture setPin / Convex completeOnboarding). */
    complete(input: CompleteOnboardingInput): Promise<EhKid>;
  };
};
