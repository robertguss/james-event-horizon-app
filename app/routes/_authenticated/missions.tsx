import { createFileRoute } from "@tanstack/react-router";

import { KidShell } from "@/components/event-horizon/kid-shell";
import { useEventHorizon } from "@/lib/event-horizon/EventHorizonProvider";

export const Route = createFileRoute("/_authenticated/missions")({
  component: MissionsPage,
});

function MissionsPage() {
  const { listMissions } = useEventHorizon();
  const missions = listMissions();

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
              <p className="mt-4 text-sm font-semibold text-eh-on-reading/70">
                Runtime arrives in a later slice — content is ready (
                {mission.sentences.length} sentences, {mission.questions.length}{" "}
                questions).
              </p>
            </div>
          ))
        )}
      </div>
    </KidShell>
  );
}
