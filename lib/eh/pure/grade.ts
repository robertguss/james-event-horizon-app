import type { MissionQuestion } from "../types";
import { gradeEvidence } from "./evidence";

export type GradeAnswerInput = {
  question: MissionQuestion;
  evidenceId?: string;
  choiceId?: string;
  /** Ignored — forged client claims never grant XP. */
  claimedCorrect?: boolean;
};

export type GradeAnswerResult = {
  correct: boolean;
  reason: string;
};

/**
 * How the question uses passage evidence.
 * - evidence_only: locate (telescope tap)
 * - choice_and_evidence: MC + required evidence (Q4)
 * - choice_only: MC graded by choice alone (main idea / vocab / exit) —
 *   even if correctEvidenceIds exist for hints/glow
 */
export type EvidenceMode =
  "evidence_only" | "choice_and_evidence" | "choice_only";

export function evidenceMode(question: MissionQuestion): EvidenceMode {
  if (question.type === "locate") {
    return "evidence_only";
  }
  if (question.requiresChoiceAndEvidence === true) {
    return "choice_and_evidence";
  }
  return "choice_only";
}

/**
 * Server-side grader. Never trusts `claimedCorrect`.
 * Locate: evidence exact/anyOf.
 * Choice+evidence: both required (Q4).
 * Choice-only: ignores evidenceId (vocab/exit may carry ids for glow only).
 */
export function gradeAnswer(input: GradeAnswerInput): GradeAnswerResult {
  const { question, evidenceId, choiceId } = input;
  // Explicitly ignore forged claims
  void input.claimedCorrect;

  const mode = evidenceMode(question);

  if (mode === "evidence_only") {
    if (!evidenceId) {
      return {
        correct: false,
        reason: "Select a sentence with your telescope.",
      };
    }
    const ok = gradeEvidence(
      question.evidenceRule,
      evidenceId,
      question.correctEvidenceIds,
    );
    return {
      correct: ok,
      reason: ok
        ? "Nice find — that sentence shows the first sign of the storm."
        : "Not that one. Try another sentence, or tap Hint.",
    };
  }

  if (!question.correctChoiceId) {
    return { correct: false, reason: "Unable to grade." };
  }

  if (!choiceId) {
    return { correct: false, reason: "Pick one of the choices, then Check." };
  }

  const choiceOk = choiceId === question.correctChoiceId;

  if (mode === "choice_and_evidence") {
    if (!evidenceId) {
      return {
        correct: false,
        reason: "Tap evidence in the passage and pick a choice.",
      };
    }
    const evidenceOk = gradeEvidence(
      question.evidenceRule,
      evidenceId,
      question.correctEvidenceIds,
    );
    const ok = choiceOk && evidenceOk;
    return {
      correct: ok,
      reason: ok
        ? "You connected the clue to the reason — sharp explorer work."
        : !choiceOk
          ? "That choice isn’t quite right. Hint can help."
          : "Your choice needs matching evidence. Tap the seeing or parking sentence.",
    };
  }

  // choice_only — ignore evidenceId entirely (vocab / exit / main idea)
  if (question.type === "main_idea_mc") {
    return {
      correct: choiceOk,
      reason: choiceOk
        ? "That’s the big idea — stamped."
        : "Not the best match. Read again or tap Hint.",
    };
  }

  if (!choiceOk) {
    return {
      correct: false,
      reason: "Not quite. Use a Hint if you want a nudge.",
    };
  }
  return {
    correct: true,
    reason:
      question.xpKind === "exit"
        ? "Planet charted — explorers will remember that."
        : "Correct — grit means tiny bits of sand and dust here.",
  };
}

/** Glow targets for hint step 4 (and soft hints). Never auto-fills the answer. */
export function glowIdsForHint(
  question: MissionQuestion,
  step: number,
): string[] {
  if (step < 4) {
    if (step === 3 && question.stemSentenceId) {
      return [question.stemSentenceId];
    }
    return [];
  }
  if (question.correctEvidenceIds.length > 0) {
    return [...question.correctEvidenceIds];
  }
  if (question.stemSentenceId) {
    return [question.stemSentenceId];
  }
  return [];
}
