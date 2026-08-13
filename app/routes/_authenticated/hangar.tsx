import { createFileRoute } from "@tanstack/react-router";

import { KidShell } from "@/components/event-horizon/kid-shell";

export const Route = createFileRoute("/_authenticated/hangar")({
  component: HangarPage,
});

function HangarPage() {
  return (
    <KidShell title="Hangar">
      <p className="max-w-prose text-lg text-eh-on-surface-muted">
        Your ship is parked and ready. Cosmetics unlock as you complete missions
        — nothing to equip yet.
      </p>
    </KidShell>
  );
}
