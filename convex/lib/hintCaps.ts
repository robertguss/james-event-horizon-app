/** Caps for server-built Grok payloads (never trust client string sizes). */

export const HINT_CAPS = {
  questionKey: 64,
  questionPrompt: 500,
  passageExcerpt: 2000,
  choiceText: 300,
  maxChoices: 6,
  alreadyShownHint: 500,
  maxAlreadyShown: 4,
  staticFallback: 500,
  evidenceSentence: 500,
} as const;

export function clampString(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max);
}

export function clampStringList(
  values: string[],
  maxItems: number,
  maxItemLen: number,
): string[] {
  return values.slice(0, maxItems).map((v) => clampString(v, maxItemLen));
}
