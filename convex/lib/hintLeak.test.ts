import { describe, expect, it } from "vitest";
import { hintLeaksAnswer } from "./hintLeak";

describe("hintLeaksAnswer", () => {
  const choiceTexts = [
    "Maya builds a new rover on Earth.",
    "A dust storm pauses Maya’s drive on Mars, then she continues.",
    "Mars has more oceans than Earth.",
  ];
  const correctEvidenceTexts = ["Then a wall of dust rose in the distance."];

  it("flags answer-letter replies", () => {
    expect(
      hintLeaksAnswer("The answer is B", { choiceTexts, correctEvidenceTexts }),
    ).toBe(true);
  });

  it("flags equality with a choice", () => {
    expect(
      hintLeaksAnswer(choiceTexts[1]!, { choiceTexts, correctEvidenceTexts }),
    ).toBe(true);
  });

  it("flags quoting the correct evidence sentence", () => {
    expect(
      hintLeaksAnswer(`Look: "${correctEvidenceTexts[0]}" is when it starts.`, {
        choiceTexts,
        correctEvidenceTexts,
      }),
    ).toBe(true);
  });

  it("allows a safe socratic nudge", () => {
    expect(
      hintLeaksAnswer("Look near the beginning — what in the sky changes?", {
        choiceTexts,
        correctEvidenceTexts,
      }),
    ).toBe(false);
  });
});
