import { createFileRoute, Navigate } from "@tanstack/react-router";

import { isFixtureMode, useEh } from "@/lib/eh/data";

export const Route = createFileRoute("/")({
  component: Home,
});

/** Kit dashboard is not home — fixture and live both land kid mode at /hub. */
function Home() {
  const { ready, kid } = useEh();

  if (!ready) {
    return (
      <div className="grid min-h-svh place-items-center bg-eh-neutral text-eh-on-surface">
        <p className="font-extrabold">Loading…</p>
      </div>
    );
  }

  if (isFixtureMode() || kid) {
    return <Navigate to="/hub" />;
  }

  return <Navigate to="/onboarding" />;
}
