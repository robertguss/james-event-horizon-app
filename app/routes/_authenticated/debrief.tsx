import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { KidShell } from "@/components/event-horizon/kid-shell";
import { getCosmetic } from "@/lib/cosmetics";
import { useEh } from "@/lib/eh/data";

type CompleteSnapshot = {
  missionId: string;
  missionTitle?: string;
  breakdown: {
    questions: number;
    exitTicket: number;
    missionComplete: number;
    firstDaily: number;
    total: number;
  };
  leveledUp: boolean;
  previousLevel: number;
  level: number;
  xp: number;
  streakDays: number;
  newSectorStamps?: string[];
  reflectionReward?: {
    title: string;
    description: string;
    presentation?: "adventure" | "scripture";
  };
};

export const Route = createFileRoute("/_authenticated/debrief")({
  component: DebriefPage,
});

function DebriefPage() {
  const { kid, ready } = useEh();
  const [snap, setSnap] = useState<CompleteSnapshot | null>(null);

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    const raw = sessionStorage.getItem("eh.lastComplete");
    if (!raw) return;
    try {
      setSnap(JSON.parse(raw) as CompleteSnapshot);
    } catch {
      setSnap(null);
    }
  }, []);

  if (!ready) {
    return (
      <div className="grid min-h-svh place-items-center bg-eh-neutral text-eh-on-surface">
        <p className="font-extrabold">Loading…</p>
      </div>
    );
  }

  const breakdown = snap?.breakdown;
  const sectorChips = snap?.newSectorStamps ?? [];

  return (
    <KidShell title="Debrief">
      <div className="eh-reading-card space-y-4 rounded-[36px] p-7">
        <p className="text-sm font-bold tracking-wide text-eh-primary uppercase">
          Mission complete
        </p>
        <h2 className="text-2xl font-extrabold text-eh-on-reading">
          {snap?.missionTitle ?? "Dust Storm on Mars"}
        </h2>
        <p className="text-lg text-eh-on-reading/80">
          {kid?.displayName ?? "Explorer"}, you charted another sector.
        </p>

        {breakdown ? (
          <ul className="mt-4 space-y-2 text-base font-semibold text-eh-on-reading">
            <li>Questions: +{breakdown.questions} XP</li>
            <li>Exit ticket: +{breakdown.exitTicket} XP</li>
            <li>Mission complete: +{breakdown.missionComplete} XP</li>
            {breakdown.firstDaily > 0 ? (
              <li>First daily bonus: +{breakdown.firstDaily} XP</li>
            ) : null}
            <li className="pt-2 text-xl font-extrabold text-eh-primary">
              Total this run: +{breakdown.total} XP
            </li>
          </ul>
        ) : (
          <p className="text-eh-on-reading/70">
            Finish a mission to see your XP breakdown here.
          </p>
        )}

        {sectorChips.length > 0 ? (
          <div className="mt-4" data-testid="sector-stamp-chips">
            <p className="text-sm font-bold tracking-wide text-eh-primary uppercase">
              Sector stamps
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sectorChips.map((id) => {
                const def = getCosmetic(id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center rounded-full px-3 py-1 text-sm font-extrabold text-white"
                    style={{ backgroundColor: def?.swatch ?? "#2EC4B6" }}
                  >
                    {def?.name ?? id}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}

        {snap?.reflectionReward ? (
          <div className="mt-4 rounded-2xl border-2 border-eh-tertiary bg-[#FFF1BE] p-4 text-eh-on-reading">
            <p className="text-sm font-extrabold tracking-wide text-[#6D5517] uppercase">
              {snap.reflectionReward.presentation === "scripture"
                ? "Scripture Archive"
                : "Observatory part restored"}
            </p>
            <p className="mt-1 text-xl font-extrabold">
              {snap.reflectionReward.title}
            </p>
            <p className="mt-1 font-semibold text-eh-on-reading/75">
              {snap.reflectionReward.description}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {snap?.leveledUp ? (
            <Link
              to="/level-up"
              className="eh-button-hint inline-flex h-12 items-center justify-center rounded-full px-6 font-extrabold"
            >
              Level Up
            </Link>
          ) : null}
          <Link
            to="/hub"
            className="eh-button-check inline-flex h-12 items-center justify-center rounded-full px-6 font-extrabold text-white"
          >
            Hub
          </Link>
          <Link
            to="/missions"
            className="inline-flex h-12 items-center justify-center rounded-full bg-eh-secondary px-6 font-extrabold text-eh-on-secondary"
          >
            Missions
          </Link>
        </div>

        {kid ? (
          <p className="mt-4 text-sm font-semibold text-eh-on-reading/70">
            Level {kid.level} · {kid.xp} XP · streak {kid.streakDays} day
            {kid.streakDays === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>
    </KidShell>
  );
}
