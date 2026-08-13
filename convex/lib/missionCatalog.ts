/**
 * Server-side mission catalog for hint loading + attempt scoring.
 * UI must not supply question prompts / choices / fallbacks.
 * Detail pack lives in lib/eh/fixtures — Convex mission rows hold slug/lock/kind.
 */

import {
  ALL_FIXTURE_MISSIONS,
  fixtureMissionById,
} from "../../lib/eh/fixtures/missionsStub";
import type { MissionDetail, MissionQuestion } from "../../lib/eh/types";

export function getMissionById(missionId: string): MissionDetail | null {
  return fixtureMissionById(missionId);
}

export function listCatalogMissions(): readonly MissionDetail[] {
  return ALL_FIXTURE_MISSIONS;
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
