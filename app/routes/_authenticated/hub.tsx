import { createFileRoute, Navigate } from "@tanstack/react-router";

import { HubView } from "@/components/event-horizon/hub-view";
import { useEh } from "@/lib/eh/data";

export const Route = createFileRoute("/_authenticated/hub")({
  component: HubPage,
});

function HubPage() {
  const { ready, kid } = useEh();

  if (!ready) {
    return (
      <div className="grid min-h-svh place-items-center bg-eh-neutral text-eh-on-surface">
        <p className="font-extrabold">Loading hub…</p>
      </div>
    );
  }

  if (!kid) {
    return <Navigate to="/onboarding" />;
  }

  return <HubView displayName={kid.displayName} xpTotal={kid.xp} />;
}
