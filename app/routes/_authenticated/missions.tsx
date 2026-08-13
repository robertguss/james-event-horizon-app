import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { KidShell } from "@/components/event-horizon/kid-shell";
import { useEh } from "@/lib/eh/data";
import type { MissionDetail } from "@/lib/eh/types";

export const Route = createFileRoute("/_authenticated/missions")({
  component: MissionsPage,
});

function MissionsPage() {
  const { ready, missions, data } = useEh();
  const [details, setDetails] = useState<MissionDetail[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const loaded = await Promise.all(
        missions.map((mission) => data.missions.get(mission.id)),
      );
      if (!cancelled) {
        setDetails(
          loaded.filter((entry): entry is MissionDetail => entry !== null),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [data, missions]);

  if (!ready) {
    return (
      <div className="grid min-h-svh place-items-center bg-eh-neutral text-eh-on-surface">
        <p className="font-extrabold">Loading…</p>
      </div>
    );
  }

  return (
    <KidShell title="Missions">
      <div className="space-y-4">
        {details.length === 0 ? (
          <div className="eh-reading-card rounded-[36px] p-7">
            <p className="text-xl font-semibold leading-relaxed text-eh-on-reading">
              No missions charted yet.
            </p>
          </div>
        ) : (
          details.map((mission) => (
            <div
              key={mission.id}
              className="eh-reading-card rounded-[36px] p-7"
            >
              <p className="text-sm font-bold tracking-wide text-eh-primary uppercase">
                Next up
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-eh-on-reading">
                {mission.title}
              </h2>
              <p className="mt-2 text-eh-on-reading/80">{mission.planet}</p>
              <p className="mt-4 text-lg leading-relaxed text-eh-on-reading">
                {mission.objective}
              </p>
              <p className="mt-3 text-sm font-semibold text-eh-on-reading/70">
                {mission.sentences.length} sentences ·{" "}
                {mission.questions.length} questions · ~
                {mission.estimatedMinutes} min
              </p>
              <Link
                to="/mission/$id"
                params={{ id: mission.id }}
                className="eh-button-check mt-6 inline-flex h-12 items-center justify-center rounded-full px-6 text-base font-extrabold text-white"
              >
                Launch mission
              </Link>
            </div>
          ))
        )}
      </div>
    </KidShell>
  );
}
