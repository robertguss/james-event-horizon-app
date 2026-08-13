/**
 * Socratic Grok prompt builders for Event Horizon hints.
 * Pure module — no Convex runtime imports.
 */

export type GrokHintRequest = {
  step: number; // 1..4
  questionPrompt: string;
  questionType: string;
  passageExcerpt: string;
  /** Choice texts only — NEVER mark which is correct, never include choice ids. */
  choiceTexts: string[];
  alreadyShownHintTexts: string[];
};

export type GrokHintResponse = {
  text: string;
  source: "grok" | "static";
};

export type GrokMessage = {
  role: "system" | "user";
  content: string;
};

/**
 * Locked system prompt: grades 3–5 socratic tutor.
 * Never give the answer; never name the correct letter or quote the exact
 * evidence sentence as “the answer”; short; push back to the text;
 * age-appropriate; no shame; step-aware (steps 1–2 must not mention letters
 * or sentence ids).
 */
export const SOCRATIC_SYSTEM_PROMPT = `You are a friendly reading coach for grades 3–5 (ages about 8–11).

Your job is to give ONE short socratic hint that helps the student think — you must never give the answer.

Hard rules:
- Never give the answer.
- Never name the correct letter (A, B, C, …) or tell them which choice is right.
- Never quote the exact evidence sentence as “the answer” or say a sentence id is correct.
- Keep it short: 1–3 sentences.
- Push the student back to the passage / the text and what the question asks.
- Be age-appropriate, warm, and encouraging — no shame, no “you should know this.”
- Step-aware: for hint steps 1–2, do not mention answer letters or sentence ids at all. Steps 3–4 may gently narrow attention (e.g. “look near the start”) but still must never reveal the answer.`;

export function buildGrokMessages(req: GrokHintRequest): GrokMessage[] {
  const choicesBlock =
    req.choiceTexts.length === 0
      ? "(no multiple-choice options for this question)"
      : req.choiceTexts.map((text, i) => `${i + 1}. ${text}`).join("\n");

  const alreadyShown =
    req.alreadyShownHintTexts.length === 0
      ? "(none yet)"
      : req.alreadyShownHintTexts.map((t, i) => `${i + 1}. ${t}`).join("\n");

  const userContent = [
    `Hint step: ${req.step} (of 4)`,
    `Question type: ${req.questionType}`,
    `Question prompt: ${req.questionPrompt}`,
    "",
    "Passage excerpt:",
    req.passageExcerpt,
    "",
    "Choice texts (unlabeled — do NOT treat any as correct):",
    choicesBlock,
    "",
    "Hints already shown to the student (do not repeat them):",
    alreadyShown,
    "",
    "Write the next socratic hint only. Follow the system rules.",
  ].join("\n");

  return [
    { role: "system", content: SOCRATIC_SYSTEM_PROMPT },
    { role: "user", content: userContent },
  ];
}
