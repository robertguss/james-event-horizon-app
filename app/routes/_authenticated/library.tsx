import { createFileRoute } from "@tanstack/react-router";

import { KidShell } from "@/components/event-horizon/kid-shell";

export const Route = createFileRoute("/_authenticated/library")({
  component: LibraryPage,
});

function LibraryPage() {
  return (
    <KidShell title="Library">
      <p className="max-w-prose text-lg text-eh-on-surface-muted">
        Story transmissions will collect here after you chart planets. The
        shelves are quiet for now.
      </p>
    </KidShell>
  );
}
