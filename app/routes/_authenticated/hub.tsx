import { createFileRoute, Navigate } from "@tanstack/react-router";

import { HubView } from "@/components/event-horizon/hub-view";
import { useEventHorizon } from "@/lib/event-horizon/EventHorizonProvider";

export const Route = createFileRoute("/_authenticated/hub")({
  component: HubPage,
});

function HubPage() {
  const { setup, identity } = useEventHorizon();

  if (setup === undefined) {
    return (
      <div className="grid min-h-svh place-items-center bg-eh-neutral text-eh-on-surface">
        <p className="font-extrabold">Loading hub…</p>
      </div>
    );
  }

  if (!identity.clerkUserId || setup === null) {
    return <Navigate to="/login/$" params={{ _splat: "" }} />;
  }

  if (!setup.onboarded) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <HubView displayName={setup.kid.displayName} xpTotal={setup.kid.xpTotal} />
  );
}
