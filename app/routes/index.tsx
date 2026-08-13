import { createFileRoute, Link, Navigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { isMockDataMode } from "@/lib/event-horizon/data-mode";
import { useEventHorizon } from "@/lib/event-horizon/EventHorizonProvider";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { setup, identity } = useEventHorizon();
  const mock = isMockDataMode();
  const isSignedIn = Boolean(identity.clerkUserId);

  if (!mock && setup === undefined) {
    return (
      <div className="grid min-h-svh place-items-center bg-eh-neutral text-eh-on-surface">
        <p className="font-extrabold">Loading…</p>
      </div>
    );
  }

  if (isSignedIn && setup?.onboarded) {
    return <Navigate to="/hub" />;
  }

  if (isSignedIn && setup && !setup.onboarded) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-eh-neutral font-sans text-eh-on-surface">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#C77DFF55,transparent_40%),radial-gradient(circle_at_80%_20%,#2EC4B644,transparent_35%),linear-gradient(180deg,#1B1430,#241B3D)]"
        aria-hidden
      />
      <main className="relative flex w-full max-w-3xl flex-col items-center gap-8 px-8 py-24 text-center sm:items-start sm:text-left">
        <p className="text-sm font-extrabold tracking-[0.2em] text-eh-primary uppercase">
          Event Horizon
        </p>
        <div className="flex flex-col gap-4">
          <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Read to explore
          </h1>
          <p className="max-w-md text-lg text-eh-on-surface-muted">
            A space reading adventure for grades 3–5. Parents set up once; kids
            land in the hub.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {mock ? (
            <Link to="/onboarding">
              <Button
                size="lg"
                className="h-14 w-full rounded-full px-8 font-extrabold sm:w-auto"
              >
                Start setup (mock)
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/signup/$" params={{ _splat: "" }}>
                <Button
                  size="lg"
                  className="h-14 w-full rounded-full px-8 font-extrabold sm:w-auto"
                >
                  Sign up
                </Button>
              </Link>
              <Link to="/login/$" params={{ _splat: "" }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-full rounded-full px-8 font-extrabold sm:w-auto"
                >
                  Sign in
                </Button>
              </Link>
            </>
          )}
          <Link to="/design/hub">
            <Button
              size="lg"
              variant="ghost"
              className="h-14 w-full rounded-full px-8 font-extrabold sm:w-auto"
            >
              Hub preview
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
