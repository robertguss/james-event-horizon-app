import { describe, expect, it } from "vitest";
import {
  SOCRATIC_SYSTEM_PROMPT,
  buildGrokMessages,
  type GrokHintRequest,
} from "./grokPrompt";

const sampleRequest: GrokHintRequest = {
  step: 2,
  questionPrompt: "What is this transmission mostly about?",
  questionType: "main_idea_mc",
  passageExcerpt: "Maya’s rover rolled across the red sand of Mars.",
  choiceTexts: [
    "Maya builds a new rover on Earth.",
    "A dust storm pauses Maya’s drive on Mars, then she continues.",
    "Mars has more oceans than Earth.",
  ],
  alreadyShownHintTexts: ["Ask: what happens from start to finish?"],
};

describe("SOCRATIC_SYSTEM_PROMPT", () => {
  it("locks key safety phrases for grades 3–5", () => {
    const prompt = SOCRATIC_SYSTEM_PROMPT.toLowerCase();
    expect(prompt).toMatch(/never give the answer/);
    expect(prompt).toMatch(/grades 3[–-]5/);
    expect(prompt).toMatch(/never name the correct letter/);
    expect(prompt).toMatch(/push .+ back to the (passage|text)/);
    expect(prompt).toMatch(/1[–-]3 sentences|short/);
    expect(prompt).toMatch(/no shame|shame/);
    expect(prompt).toMatch(/steps? 1[–-]2/);
  });
});

describe("buildGrokMessages", () => {
  it("includes step, prompt, choices as texts, and already-shown hints", () => {
    const messages = buildGrokMessages(sampleRequest);
    expect(messages).toHaveLength(2);
    expect(messages[0]?.role).toBe("system");
    expect(messages[1]?.role).toBe("user");

    const user = messages[1]?.content ?? "";
    expect(user).toContain("Hint step: 2");
    expect(user).toContain(sampleRequest.questionPrompt);
    expect(user).toContain(sampleRequest.questionType);
    expect(user).toContain(sampleRequest.passageExcerpt);
    for (const choice of sampleRequest.choiceTexts) {
      expect(user).toContain(choice);
    }
    expect(user).toContain(sampleRequest.alreadyShownHintTexts[0]);
  });

  it("must NOT include a correctChoice marker or correct letter field", () => {
    const serialized = JSON.stringify(buildGrokMessages(sampleRequest));
    expect(serialized).not.toMatch(/correctChoice/i);
    expect(serialized).not.toMatch(/correctChoiceId/i);
    expect(serialized).not.toMatch(/"correctLetter"/i);
    expect(serialized).not.toMatch(/correct letter is/i);
  });
});
