import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { KidShell } from "@/components/event-horizon/kid-shell";
import { useEh } from "@/lib/eh/data";

type CompleteSnapshot = {
  missionId: string;
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

  return (
    <KidShell title="Debrief">
      <div className="eh-reading-card space-y-4 rounded-[36px] p-7">
        <p className="text-sm font-bold tracking-wide text-eh-primary uppercase">
          Mission complete
        </p>
        <h2 className="text-2xl font-extrabold text-eh-on-reading">
          Dust Storm on Mars
        </h2>
        <p className="text-lg text-eh-on-reading/80">
          {kid?.displayName ?? "Explorer"}, you charted Rusty Ridge.
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
