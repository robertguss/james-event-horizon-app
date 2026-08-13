/**
 * Post-Grok leak detector: never show a model reply that names a letter,
 * quotes the correct evidence sentence, or equals a choice text.
 */

export function hintLeaksAnswer(
  text: string,
  opts: {
    choiceTexts: string[];
    correctEvidenceTexts: string[];
  },
): boolean {
  if (/\b[A-C]\b/.test(text)) {
    return true;
  }

  const trimmed = text.trim();
  for (const choice of opts.choiceTexts) {
    const c = choice.trim();
    if (c.length > 0 && trimmed === c) {
      return true;
    }
  }

  for (const evidence of opts.correctEvidenceTexts) {
    const e = evidence.trim();
    if (e.length > 0 && text.includes(e)) {
      return true;
    }
  }

  return false;
}
