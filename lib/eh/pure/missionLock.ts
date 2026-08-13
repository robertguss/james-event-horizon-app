import type { MissionLockReason } from "../types";
import { canStartBlackHole } from "./bhGate";
import type { MissionDetail, MissionSummary, EhKid } from "../types";

export function lockCopy(reason: MissionLockReason): {
  lockReason: MissionLockReason;
  lockMessage: string;
} {
  switch (reason) {
    case "coming_soon":
      return {
        lockReason: reason,
        lockMessage: "Coming soon — chart more sectors first.",
      };
    case "black_hole_gate":
      return {
        lockReason: reason,
        lockMessage: "Reach level 5 or a 5-day streak to open black holes.",
      };
    case "black_hole_weekly_cap":
      return {
        lockReason: reason,
        lockMessage: "Black-hole mission used this week — come back later.",
      };
    default: {
      const _exhaustive: never = reason;
      return _exhaustive;
    }
  }
}

export function summarizeMission(input: {
  mission: Pick<
    MissionDetail,
    | "id"
    | "title"
    | "planet"
    | "planetId"
    | "gradeBand"
    | "estimatedMinutes"
    | "objective"
    | "kind"
  >;
  kid?: Pick<EhKid, "level" | "streakDays">;
  bhCompletionTimestampsMs?: readonly number[];
  nowMs: number;
}): MissionSummary {
  const { mission, kid, nowMs } = input;
  const base = {
    id: mission.id,
    title: mission.title,
    planet: mission.planet,
    planetId: mission.planetId,
    gradeBand: mission.gradeBand,
    estimatedMinutes: mission.estimatedMinutes,
    objective: mission.objective,
    kind: mission.kind,
  };

  if (mission.kind === "stub") {
    return { ...base, locked: true, ...lockCopy("coming_soon") };
  }

  if (mission.kind === "blackHole") {
    const gate = canStartBlackHole({
      level: kid?.level ?? 1,
      streakDays: kid?.streakDays ?? 0,
      bhCompletionTimestampsMs: input.bhCompletionTimestampsMs ?? [],
      nowMs,
    });
    if (!gate.ok) {
      const reason =
        gate.reason === "gate" ? "black_hole_gate" : "black_hole_weekly_cap";
      return { ...base, locked: true, ...lockCopy(reason) };
    }
    return { ...base, locked: false };
  }

  return { ...base, locked: false };
}

export function assertMissionPlayable(input: {
  mission: Pick<MissionDetail, "kind" | "questions">;
  kid: Pick<EhKid, "level" | "streakDays">;
  bhCompletionTimestampsMs: readonly number[];
  nowMs: number;
}): void {
  const { mission, kid, bhCompletionTimestampsMs, nowMs } = input;
  if (mission.kind === "stub") {
    throw new Error("Mission coming soon");
  }
  if (mission.kind === "blackHole") {
    const gate = canStartBlackHole({
      level: kid.level,
      streakDays: kid.streakDays,
      bhCompletionTimestampsMs,
      nowMs,
    });
    if (!gate.ok) {
      const { lockMessage } = lockCopy(
        gate.reason === "gate" ? "black_hole_gate" : "black_hole_weekly_cap",
      );
      throw new Error(lockMessage);
    }
  }
  if (mission.questions.length === 0) {
    throw new Error("Mission coming soon");
  }
}
