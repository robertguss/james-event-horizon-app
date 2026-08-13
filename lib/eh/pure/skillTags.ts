import type { Attempt, MissionDetail, QuestionType } from "../types";

export function skillTagForQuestionType(type: QuestionType): string {
  switch (type) {
    case "locate":
      return "locate_evidence";
    case "main_idea_mc":
      return "main_idea";
    case "vocab_in_context_mc":
      return "vocabulary_in_context";
    case "infer_mc":
      return "simple_inference";
    case "exit_main_idea_mc":
      return "main_idea";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function computeWeakSkillTags(
  attempts: Attempt[],
  missionById: (missionId: string) => MissionDetail | null | undefined,
): string[] {
  const wrongCounts = new Map<string, number>();

  for (const attempt of attempts) {
    const mission = missionById(attempt.missionId);
    if (!mission) continue;

    for (const result of attempt.questionResults) {
      if (result.correct) continue;
      const question = mission.questions.find(
        (q) => q.id === result.questionKey,
      );
      if (!question) continue;
      const tag = skillTagForQuestionType(question.type);
      wrongCounts.set(tag, (wrongCounts.get(tag) ?? 0) + 1);
    }
  }

  return [...wrongCounts.entries()]
    .filter(([, count]) => count >= 1)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .map(([tag]) => tag);
}
