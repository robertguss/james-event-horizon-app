import type {
  Attempt,
  CompletionSnapshot,
  EhKid,
  MissionDetail,
  QuestionResult,
  XpLedgerEntry,
} from "../types";
import { glowIdsForHint, gradeAnswer } from "./grade";
import { levelForXp } from "./level";
import { nextStreakState } from "./streak";
import { FIRST_DAILY_XP, MISSION_COMPLETE_XP, xpForCorrectAnswer } from "./xp";

export type ReduceSubmitInput = {
  attempt: Attempt;
  mission: MissionDetail;
  questionKey: string;
  evidenceId?: string;
  choiceId?: string;
  claimedCorrect?: boolean;
};

export type ReduceSubmitOutput = {
  attempt: Attempt;
  correct: boolean;
  xpAwarded: number;
  hintsUsed: number;
  feedback: string;
  nextQuestionIndex: number | null;
};

export type ReduceHintInput = {
  attempt: Attempt;
  mission: MissionDetail;
  questionKey: string;
};

export type ReduceHintOutput = {
  attempt: Attempt;
  step: number;
  text: string;
  glowEvidenceIds: string[];
};

export type LedgerDelta = Omit<XpLedgerEntry, "id">;

export type ReduceCompleteInput = {
  attempt: Attempt;
  mission: MissionDetail;
  kid: EhKid;
  today: string;
  now?: number;
};

export type ReduceCompleteOutput = {
  /** `replay` = already completed; XP must not be applied again. */
  kind: "fresh" | "replay";
  attempt: Attempt;
  kid: EhKid;
  xpBreakdown: CompletionSnapshot["xpBreakdown"];
  leveledUp: boolean;
  previousLevel: number;
  ledgerDeltas: LedgerDelta[];
};

function hintsForQuestion(attempt: Attempt, questionKey: string): number {
  return attempt.hintsByQuestionKey[questionKey] ?? 0;
}

function nextUnansweredIndex(
  mission: MissionDetail,
  questionResults: QuestionResult[],
): number {
  return mission.questions.findIndex(
    (q) => !questionResults.some((r) => r.questionKey === q.id && r.correct),
  );
}

/** Freeze score once correct; key hints per questionKey. */
export function reduceSubmit(input: ReduceSubmitInput): ReduceSubmitOutput {
  const { attempt, mission, questionKey } = input;
  if (attempt.status !== "active") {
    throw new Error("Attempt already completed");
  }

  const question = mission.questions.find((q) => q.id === questionKey);
  if (!question) throw new Error("Question not found");

  const locked = attempt.questionResults.find(
    (r) => r.questionKey === questionKey && r.correct,
  );
  if (locked) {
    const nextIndex = nextUnansweredIndex(mission, attempt.questionResults);
    return {
      attempt,
      correct: true,
      xpAwarded: locked.xpAwarded,
      hintsUsed: locked.hintsUsed,
      feedback: "Already locked in — score frozen.",
      nextQuestionIndex: nextIndex === -1 ? null : nextIndex,
    };
  }

  const graded = gradeAnswer({
    question,
    evidenceId: input.evidenceId,
    choiceId: input.choiceId,
    claimedCorrect: input.claimedCorrect,
  });

  const hintsUsed = hintsForQuestion(attempt, questionKey);

  if (!graded.correct) {
    return {
      attempt: {
        ...attempt,
        currentHintsUsed: hintsUsed,
      },
      correct: false,
      xpAwarded: 0,
      hintsUsed,
      feedback: graded.reason,
      nextQuestionIndex: attempt.currentQuestionIndex,
    };
  }

  const xpAwarded = xpForCorrectAnswer({
    xpKind: question.xpKind,
    hintsUsed,
  });

  const result: QuestionResult = {
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
  const nextIndex = nextUnansweredIndex(mission, questionResults);

  const updated: Attempt = {
    ...attempt,
    questionResults,
    currentHintsUsed: 0,
    currentQuestionIndex:
      nextIndex === -1 ? mission.questions.length : nextIndex,
    xpEarned: questionResults.reduce((sum, r) => sum + r.xpAwarded, 0),
  };

  return {
    attempt: updated,
    correct: true,
    xpAwarded,
    hintsUsed,
    feedback: graded.reason,
    nextQuestionIndex: nextIndex === -1 ? null : nextIndex,
  };
}

export function reduceHint(input: ReduceHintInput): ReduceHintOutput {
  const { attempt, mission, questionKey } = input;
  if (attempt.status !== "active") {
    throw new Error("Attempt already completed");
  }

  const question = mission.questions.find((q) => q.id === questionKey);
  if (!question) throw new Error("Question not found");

  const prior = hintsForQuestion(attempt, questionKey);
  const nextStep = Math.min(4, prior + 1);
  const text = question.hints[nextStep - 1] ?? question.hints[3] ?? "";

  const hintsByQuestionKey = {
    ...attempt.hintsByQuestionKey,
    [questionKey]: nextStep,
  };

  const updated: Attempt = {
    ...attempt,
    hintsByQuestionKey,
    currentHintsUsed: nextStep,
  };

  return {
    attempt: updated,
    step: nextStep,
    text,
    glowEvidenceIds: glowIdsForHint(question, nextStep),
  };
}

/**
 * First complete applies XP + snapshot; later calls replay the snapshot
 * without mutating kid XP / ledger.
 */
export function reduceComplete(
  input: ReduceCompleteInput,
): ReduceCompleteOutput {
  const { attempt, mission, today } = input;
  const now = input.now ?? Date.now();

  if (attempt.status === "completed") {
    const snap = attempt.completionSnapshot;
    if (!snap) {
      throw new Error("Completed attempt missing completionSnapshot");
    }
    return {
      kind: "replay",
      attempt,
      kid: input.kid,
      xpBreakdown: snap.xpBreakdown,
      leveledUp: snap.leveledUp,
      previousLevel: snap.previousLevel,
      ledgerDeltas: [],
    };
  }

  const allCorrect = mission.questions.every((q) =>
    attempt.questionResults.some((r) => r.questionKey === q.id && r.correct),
  );
  if (!allCorrect) {
    throw new Error("Mission incomplete — answer every question first");
  }

  let kid = input.kid;
  const previousLevel = kid.level;
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

  const ledgerDeltas: LedgerDelta[] = [];
  let balance = kid.xp;

  for (const r of attempt.questionResults) {
    const q = mission.questions.find((mq) => mq.id === r.questionKey);
    if (!q || r.xpAwarded <= 0) continue;
    balance += r.xpAwarded;
    ledgerDeltas.push({
      kidId: kid.id,
      attemptId: attempt.id,
      reason: q.xpKind === "exit" ? "exit_ticket" : "question",
      delta: r.xpAwarded,
      balanceAfter: balance,
      createdAt: now,
    });
  }

  let xp = kid.xp + attempt.xpEarned;

  const missionComplete = MISSION_COMPLETE_XP;
  xp += missionComplete;
  ledgerDeltas.push({
    kidId: kid.id,
    attemptId: attempt.id,
    reason: "mission_complete",
    delta: missionComplete,
    balanceAfter: xp,
    createdAt: now,
  });

  let firstDaily = 0;
  if (streak.isFirstDaily) {
    firstDaily = FIRST_DAILY_XP;
    xp += firstDaily;
    ledgerDeltas.push({
      kidId: kid.id,
      attemptId: attempt.id,
      reason: "first_daily",
      delta: firstDaily,
      balanceAfter: xp,
      createdAt: now,
    });
  }

  kid = {
    ...kid,
    xp,
    streakDays: streak.streakDays,
    lastMissionDate: streak.lastMissionDate,
    level: levelForXp(xp),
  };

  const total = questionsXp + exitTicket + missionComplete + firstDaily;
  const xpBreakdown: CompletionSnapshot["xpBreakdown"] = {
    questions: questionsXp,
    exitTicket,
    missionComplete,
    firstDaily,
    total,
  };
  const leveledUp = kid.level > previousLevel;
  const completionSnapshot: CompletionSnapshot = {
    xpBreakdown,
    leveledUp,
    previousLevel,
  };

  const completed: Attempt = {
    ...attempt,
    status: "completed",
    completedAt: now,
    xpEarned: total,
    firstDailyBonus: firstDaily > 0,
    currentQuestionIndex: mission.questions.length,
    completionSnapshot,
  };

  return {
    kind: "fresh",
    attempt: completed,
    kid,
    xpBreakdown,
    leveledUp,
    previousLevel,
    ledgerDeltas,
  };
}
