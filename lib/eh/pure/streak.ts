/** Local calendar date YYYY-MM-DD. */
export function localDateString(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1);
}

function daysBetween(a: string, b: string): number {
  const ms = parseLocalDate(b).getTime() - parseLocalDate(a).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

export type StreakUpdate = {
  streakDays: number;
  lastMissionDate: string;
  isFirstDaily: boolean;
};

/**
 * Update streak for a completed mission on `today`.
 * First mission of the day: isFirstDaily=true.
 * Consecutive calendar day: streak +1. Same day: streak unchanged.
 * Gap >1 day: streak resets to 1.
 */
export function nextStreakState(input: {
  lastMissionDate?: string;
  streakDays: number;
  today: string;
}): StreakUpdate {
  const { lastMissionDate, streakDays, today } = input;

  if (!lastMissionDate) {
    return { streakDays: 1, lastMissionDate: today, isFirstDaily: true };
  }

  if (lastMissionDate === today) {
    return {
      streakDays,
      lastMissionDate: today,
      isFirstDaily: false,
    };
  }

  const gap = daysBetween(lastMissionDate, today);
  if (gap === 1) {
    return {
      streakDays: streakDays + 1,
      lastMissionDate: today,
      isFirstDaily: true,
    };
  }

  return { streakDays: 1, lastMissionDate: today, isFirstDaily: true };
}
