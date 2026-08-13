import { createFileRoute, Link } from "@tanstack/react-router";

import { KidShell } from "@/components/event-horizon/kid-shell";
import { useEh } from "@/lib/eh/data";
import type { MissionSummary } from "@/lib/eh/types";

export const Route = createFileRoute("/_authenticated/missions")({
  component: MissionsPage,
});

function kindLabel(mission: MissionSummary): string {
  switch (mission.kind) {
    case "blackHole":
      return "Black hole";
    case "stub":
      return "Chart stub";
    case "standard":
      return "Next up";
    default: {
      const _exhaustive: never = mission.kind;
      return _exhaustive;
    }
  }
}

function MissionsPage() {
  const { ready, missions } = useEh();

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
        {missions.length === 0 ? (
          <div className="eh-reading-card rounded-[36px] p-7">
            <p className="text-xl font-semibold leading-relaxed text-eh-on-reading">
              No missions charted yet.
            </p>
          </div>
        ) : (
          missions.map((mission) => (
            <div
              key={mission.id}
              data-testid={`mission-row-${mission.id}`}
              data-locked={mission.locked ? "true" : "false"}
              data-kind={mission.kind}
              className="eh-reading-card rounded-[36px] p-7"
            >
              <p className="text-sm font-bold tracking-wide text-eh-primary uppercase">
                {kindLabel(mission)}
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-eh-on-reading">
                {mission.title}
              </h2>
              <p className="mt-2 text-eh-on-reading/80">{mission.planet}</p>
              <p className="mt-4 text-lg leading-relaxed text-eh-on-reading">
                {mission.objective}
              </p>
              <p className="mt-3 text-sm font-semibold text-eh-on-reading/70">
                ~{mission.estimatedMinutes} min
              </p>

              {mission.locked ? (
                <div
                  className="mt-6 rounded-2xl bg-eh-secondary/80 px-5 py-4"
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-base font-extrabold text-eh-on-secondary">
                    Locked — not a dead end
                  </p>
                  <p className="mt-1 text-sm font-semibold text-eh-on-secondary/80">
                    {mission.lockMessage ?? "Keep exploring to unlock."}
                  </p>
                </div>
              ) : (
                <Link
                  to="/mission/$id"
                  params={{ id: mission.id }}
                  className="eh-button-check mt-6 inline-flex h-12 items-center justify-center rounded-full px-6 text-base font-extrabold text-white"
                >
                  Launch mission
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </KidShell>
  );
}
