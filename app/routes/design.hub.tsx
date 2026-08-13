import { createFileRoute } from "@tanstack/react-router";

import { HubView } from "@/components/event-horizon/hub-view";

export const Route = createFileRoute("/design/hub")({
  component: DesignHubPreview,
});

/** Unauthenticated hub chrome preview for design-ref validation (no Clerk/Convex). */
function DesignHubPreview() {
  return <HubView displayName="Explorer" xpTotal={0} />;
}
