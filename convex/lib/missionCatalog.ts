/**
 * Server-side mission catalog for hint loading.
 * UI must not supply question prompts / choices / fallbacks.
 */

import { mission01 } from "../../lib/eh/fixtures/mission01";
import type { MissionDetail, MissionQuestion } from "../../lib/eh/types";

const BY_ID: Record<string, MissionDetail> = {
  [mission01.id]: mission01,
};

export function getMissionById(missionId: string): MissionDetail | null {
  return BY_ID[missionId] ?? null;
}

export function getQuestion(
  mission: MissionDetail,
  questionKey: string,
): MissionQuestion | null {
  return mission.questions.find((q) => q.id === questionKey) ?? null;
}

export function passageExcerptFor(mission: MissionDetail): string {
  return mission.sentences.map((s) => s.text).join(" ");
}

export function correctEvidenceTexts(
  mission: MissionDetail,
  question: MissionQuestion,
): string[] {
  return question.correctEvidenceIds
    .map((id) => mission.sentences.find((s) => s.id === id)?.text)
    .filter((t): t is string => typeof t === "string" && t.length > 0);
}
