import { afterEach, describe, expect, it } from "vitest";
import { resetFixture } from "./adapters/fixtureAdapter";
import { FIXTURE_KID_ID } from "./auth/fixtureAuth";
import { WEEK_01_MISSIONS } from "./fixtures/week01";
import { getEhData } from "./data";

describe("Week 1 mission catalog", () => {
  afterEach(() => resetFixture());

  it("contains five complete, playable mission packs", async () => {
    expect(WEEK_01_MISSIONS).toHaveLength(5);

    for (const mission of WEEK_01_MISSIONS) {
      resetFixture();
      expect(mission.status).toBe("published");
      expect(mission.sentences.length).toBeGreaterThanOrEqual(8);
      expect(mission.questions).toHaveLength(5);
      expect(mission.reflection).toBeDefined();

      const sentenceIds = new Set(
        mission.sentences.map((sentence) => sentence.id),
      );
      const cardIds = new Set(
        mission.reflection?.cards.map((card) => card.id) ?? [],
      );
      for (const question of mission.questions) {
        expect(question.hints).toHaveLength(4);
        expect(
          question.correctEvidenceIds.every((id) => sentenceIds.has(id)),
        ).toBe(true);
        if (question.correctChoiceId) {
          expect(
            question.choices?.some(
              (choice) => choice.id === question.correctChoiceId,
            ),
          ).toBe(true);
        }
      }
      expect(
        mission.reflection?.correctOrder.every((id) => cardIds.has(id)),
      ).toBe(true);

      const data = getEhData();
      let attempt = await data.attempts.start(FIXTURE_KID_ID, mission.id);
      for (const question of mission.questions) {
        const result = await data.attempts.submitAnswer({
          attemptId: attempt.id,
          questionKey: question.id,
          choiceId: question.correctChoiceId,
          evidenceId: question.correctEvidenceIds[0],
        });
        expect(result.correct, `${mission.id}:${question.id}`).toBe(true);
        attempt = result.attempt;
      }
      await data.reflections.save({
        attemptId: attempt.id,
        missionId: mission.id,
        mapCardIds: mission.reflection!.correctOrder,
      });
      const completed = await data.attempts.complete({ attemptId: attempt.id });
      expect(completed.attempt.status).toBe("completed");
    }
  });
});
