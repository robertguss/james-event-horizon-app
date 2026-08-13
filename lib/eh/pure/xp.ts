/** Question XP by hints used before correct (q1–q4). Plan §7. */
export const QUESTION_XP_BY_HINTS = {
  0: 20,
  1: 14,
  2: 10,
  3: 6,
} as const;

export const EXIT_TICKET_XP = 25;
export const MISSION_COMPLETE_XP = 15;
export const FIRST_DAILY_XP = 20;

export function questionXpForHints(hintsUsed: number): number {
  if (hintsUsed <= 0) return QUESTION_XP_BY_HINTS[0];
  if (hintsUsed === 1) return QUESTION_XP_BY_HINTS[1];
  if (hintsUsed === 2) return QUESTION_XP_BY_HINTS[2];
  return QUESTION_XP_BY_HINTS[3];
}

export function xpForCorrectAnswer(input: {
  xpKind: "question" | "exit";
  hintsUsed: number;
}): number {
  if (input.xpKind === "exit") {
    return EXIT_TICKET_XP;
  }
  return questionXpForHints(input.hintsUsed);
}
