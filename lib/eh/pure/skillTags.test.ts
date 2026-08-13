import { describe, expect, it } from "vitest";
import { mission01 } from "../fixtures/mission01";
import type { Attempt, QuestionType } from "../types";
import { computeWeakSkillTags, skillTagForQuestionType } from "./skillTags";

describe("skillTagForQuestionType", () => {
  it("maps every QuestionType exhaustively", () => {
    const cases: Array<[QuestionType, string]> = [
      ["locate", "locate_evidence"],
      ["main_idea_mc", "main_idea"],
      ["vocab_in_context_mc", "vocabulary_in_context"],
      ["infer_mc", "simple_inference"],
      ["exit_main_idea_mc", "main_idea"],
    ];
    for (const [type, tag] of cases) {
      expect(skillTagForQuestionType(type)).toBe(tag);
    }
  });
});

describe("computeWeakSkillTags", () => {
  const missionById = (id: string) => (id === mission01.id ? mission01 : null);

  function attemptWithWrongs(
    keys: string[],
    status: Attempt["status"] = "completed",
  ): Attempt {
    return {
      id: "att_test",
      kidId: "kid_james",
      missionId: mission01.id,
      status,
      startedAt: 1,
      completedAt: status === "completed" ? 2 : undefined,
      currentQuestionIndex: 0,
      questionResults: keys.map((questionKey) => ({
        questionKey,
        correct: false,
        hintsUsed: 0,
        xpAwarded: 0,
      })),
      currentHintsUsed: 0,
      hintsByQuestionKey: {},
      xpEarned: 0,
      firstDailyBonus: false,
    };
  }

  it("returns tags with wrongCount >= 1, sorted by count desc then tag asc", () => {
    const attempt = attemptWithWrongs([
      "q1_locate_wall",
      "q1_locate_wall",
      "q2_main_idea",
      "q3_vocab_grit",
    ]);
    expect(computeWeakSkillTags([attempt], missionById)).toEqual([
      "locate_evidence",
      "main_idea",
      "vocabulary_in_context",
    ]);
  });

  it("includes active attempts and ignores correct results", () => {
    const attempt = attemptWithWrongs(["q4_infer_why_park"], "active");
    attempt.questionResults.push({
      questionKey: "q1_locate_wall",
      correct: true,
      hintsUsed: 0,
      xpAwarded: 10,
    });
    expect(computeWeakSkillTags([attempt], missionById)).toEqual([
      "simple_inference",
    ]);
  });

  it("breaks ties alphabetically", () => {
    const attempt = attemptWithWrongs(["q2_main_idea", "q1_locate_wall"]);
    expect(computeWeakSkillTags([attempt], missionById)).toEqual([
      "locate_evidence",
      "main_idea",
    ]);
  });
});
