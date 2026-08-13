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
  equippedShipPaintId?: string;
  equippedTelescopeId?: string;
};

export type MissionSummary = {
  id: string;
  title: string;
  planet: string;
  planetId: string;
  gradeBand: "3-5";
  estimatedMinutes: number;
  objective: string;
};

export type EvidenceRule = "exact" | "anyOf";

export type QuestionType =
  | "locate"
  | "main_idea_mc"
  | "vocab_in_context_mc"
  | "infer_mc"
  | "exit_main_idea_mc";

export type XpKind = "question" | "exit";

export type MissionQuestion = {
  id: string;
  order: number;
  type: QuestionType;
  xpKind: XpKind;
  prompt: string;
  choices?: { id: string; text: string }[];
  correctChoiceId?: string;
  correctEvidenceIds: string[];
  evidenceRule: EvidenceRule;
  stemSentenceId?: string;
  requiresChoiceAndEvidence?: boolean;
  hints: [string, string, string, string];
  distractorTraps?: string[];
};

export type MissionDetail = MissionSummary & {
  skillTags: string[];
  status: "draft" | "published";
  sentences: { id: string; text: string }[];
  questions: MissionQuestion[];
  scoring: {
    questionXp: { 0: number; 1: number; 2: number; 3: number };
    exitTicketXp: number;
    missionCompleteXp: number;
    firstDailyXp: number;
  };
};

export type QuestionResult = {
  questionKey: string;
  correct: boolean;
  hintsUsed: number;
  evidenceId?: string;
  choiceId?: string;
  xpAwarded: number;
};

/** First-call `complete()` snapshot — retries must return this unchanged. */
export type CompletionSnapshot = {
  xpBreakdown: {
    questions: number;
    exitTicket: number;
    missionComplete: number;
    firstDaily: number;
    total: number;
  };
  leveledUp: boolean;
  previousLevel: number;
};

export type Attempt = {
  id: string;
  kidId: string;
  missionId: string;
  status: "active" | "completed";
  startedAt: number;
  completedAt?: number;
  currentQuestionIndex: number;
  questionResults: QuestionResult[];
  /** hints used on the current (unanswered) question — mirror of hintsByQuestionKey */
  currentHintsUsed: number;
  /** Per-question hint counts; never reset after a correct lock. */
  hintsByQuestionKey: Record<string, number>;
  xpEarned: number;
  firstDailyBonus: boolean;
  /** Set on first successful complete(); retry returns this snapshot. */
  completionSnapshot?: CompletionSnapshot;
};

export type XpLedgerEntry = {
  id: string;
  kidId: string;
  attemptId?: string;
  reason: "question" | "exit_ticket" | "mission_complete" | "first_daily";
  delta: number;
  balanceAfter: number;
  createdAt: number;
};

export type HintEvent = {
  id: string;
  attemptId: string;
  questionKey: string;
  step: number;
  source: "static" | "grok";
  text: string;
  createdAt: number;
};

export type SubmitAnswerInput = {
  attemptId: string;
  questionKey: string;
  evidenceId?: string;
  choiceId?: string;
  /** Client may claim correct — server/pure grader MUST ignore this. */
  claimedCorrect?: boolean;
};

export type SubmitAnswerResult = {
  correct: boolean;
  xpAwarded: number;
  hintsUsed: number;
  feedback: string;
  attempt: Attempt;
  /** Next question index, or null when all graded correct */
  nextQuestionIndex: number | null;
};

export type HintInput = {
  attemptId: string;
  questionKey: string;
};

export type HintResult = {
  step: number;
  text: string;
  source: "static" | "grok";
  glowEvidenceIds: string[];
  attempt: Attempt;
};

export type CompleteResult = {
  attempt: Attempt;
  kid: EhKid;
  xpBreakdown: {
    questions: number;
    exitTicket: number;
    missionComplete: number;
    firstDaily: number;
    total: number;
  };
  leveledUp: boolean;
  previousLevel: number;
  ledger: XpLedgerEntry[];
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

export type EquipCosmeticInput = {
  kidId: string;
  cosmeticId: string;
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
    getActive(kidId: string, missionId: string): Promise<Attempt | null>;
    start(kidId: string, missionId: string): Promise<Attempt>;
    submitAnswer(input: SubmitAnswerInput): Promise<SubmitAnswerResult>;
    requestHint(input: HintInput): Promise<HintResult>;
    complete(input: { attemptId: string }): Promise<CompleteResult>;
  };
  cosmetics: {
    equipCosmetic(input: EquipCosmeticInput): Promise<EhKid>;
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
