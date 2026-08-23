import type { MissionDetail } from "../types";

export function isCorrectConnectionMap(
  mission: MissionDetail,
  cardIds: readonly string[],
): boolean {
  const correctOrder = mission.reflection?.correctOrder;
  if (!correctOrder || cardIds.length !== correctOrder.length) {
    return false;
  }
  return correctOrder.every((cardId, index) => cardIds[index] === cardId);
}

export function assertCorrectConnectionMap(
  mission: MissionDetail,
  cardIds: readonly string[],
): void {
  if (!isCorrectConnectionMap(mission, cardIds)) {
    throw new Error("Connection map is not complete yet");
  }
}
