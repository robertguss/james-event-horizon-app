import { createFileRoute } from "@tanstack/react-router";

import { MissionReader } from "@/components/event-horizon/mission-reader";

export const Route = createFileRoute("/_authenticated/mission/$id")({
  component: MissionPage,
});

function MissionPage() {
  const { id } = Route.useParams();
  return <MissionReader missionId={id} />;
}
