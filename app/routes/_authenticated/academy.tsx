import { createFileRoute } from "@tanstack/react-router";

import { KidShell } from "@/components/event-horizon/kid-shell";

export const Route = createFileRoute("/_authenticated/academy")({
  component: AcademyPage,
});

function AcademyPage() {
  return (
    <KidShell title="Academy">
      <p className="max-w-prose text-lg text-eh-on-surface-muted">
        Practice drills and telescope tips arrive later. Stretch your legs on
        the hub for now.
      </p>
    </KidShell>
  );
}
