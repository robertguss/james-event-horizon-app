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
 * Server-side grader. Never trusts `claimedCorrect`.
 * Locate: evidence exact/anyOf.
 * MC: choice id match; optional evidence when required.
 * Q4 infer: choice B AND anyOf evidence [s5,s6].
 */
export function gradeAnswer(input: GradeAnswerInput): GradeAnswerResult {
  const { question, evidenceId, choiceId } = input;
  // Explicitly ignore forged claims
  void input.claimedCorrect;

  const needsEvidence =
    question.type === "locate" ||
    question.requiresChoiceAndEvidence === true ||
    (question.correctEvidenceIds.length > 0 &&
      question.type !== "main_idea_mc");

  const needsChoice =
    question.type !== "locate" || question.correctChoiceId !== undefined;

  if (question.type === "locate") {
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

  if (needsChoice && question.correctChoiceId) {
    if (!choiceId) {
      return { correct: false, reason: "Pick one of the choices, then Check." };
    }
    const choiceOk = choiceId === question.correctChoiceId;

    if (question.requiresChoiceAndEvidence) {
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

    // Optional evidence for vocab/exit: if evidence provided, must match when required ids exist
    if (
      question.correctEvidenceIds.length > 0 &&
      evidenceId &&
      !gradeEvidence(
        question.evidenceRule,
        evidenceId,
        question.correctEvidenceIds,
      )
    ) {
      return {
        correct: false,
        reason: "That evidence doesn’t match. Try again or Hint.",
      };
    }

    // For MC without requiresChoiceAndEvidence, choice alone grades (main idea / vocab / exit)
    if (
      question.type === "main_idea_mc" ||
      question.correctEvidenceIds.length === 0
    ) {
      return {
        correct: choiceOk,
        reason: choiceOk
          ? "That’s the big idea — stamped."
          : "Not the best match. Read again or tap Hint.",
      };
    }

    // Vocab / exit: prefer choice; evidence optional unless UI collected it
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

  if (needsEvidence) {
    if (!evidenceId) {
      return { correct: false, reason: "Select evidence first." };
    }
    const ok = gradeEvidence(
      question.evidenceRule,
      evidenceId,
      question.correctEvidenceIds,
    );
    return {
      correct: ok,
      reason: ok ? "Evidence locked in." : "Keep scanning.",
    };
  }

  return { correct: false, reason: "Unable to grade." };
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
