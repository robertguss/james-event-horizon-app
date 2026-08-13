import {
  createFileRoute,
  Link,
  Navigate,
  useNavigate,
} from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { isMockDataMode } from "@/lib/event-horizon/data-mode";
import { useEventHorizon } from "@/lib/event-horizon/EventHorizonProvider";
import { clearParentSession, isParentUnlocked } from "@/lib/parent-session";

const ParentSignOutButton = lazy(async () => {
  const mod = await import("./-sign-out-button");
  return { default: mod.ParentSignOutButton };
});

export const Route = createFileRoute("/_authenticated/parent/")({
  component: ParentPage,
});

function ParentPage() {
  const { setup, identity } = useEventHorizon();
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const mock = isMockDataMode();

  useEffect(() => {
    setUnlocked(isParentUnlocked());
  }, []);

  if (setup === undefined || unlocked === null) {
    return (
      <div className="grid min-h-svh place-items-center bg-eh-neutral text-eh-on-surface">
        <p className="font-extrabold">Loading…</p>
      </div>
    );
  }

  if (!identity.clerkUserId) {
    return <Navigate to="/login/$" params={{ _splat: "" }} />;
  }

  if (!setup || !setup.onboarded) {
    return <Navigate to="/onboarding" />;
  }

  if (!unlocked) {
    return <Navigate to="/parent/gate" />;
  }

  return (
    <div className="min-h-svh bg-eh-neutral text-eh-on-surface">
      <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col gap-6 px-6 py-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold">Parent area</h1>
          <p className="text-eh-on-surface-muted">
            Progress stats arrive in a later slice. Sign-out stays here behind
            the PIN.
          </p>
        </header>

        <section className="rounded-[28px] bg-eh-surface-elevated/90 p-6 ring-1 ring-eh-border-glass">
          <p className="text-sm font-bold text-eh-on-surface-muted uppercase">
            Explorer
          </p>
          <p className="mt-2 text-2xl font-extrabold">
            {setup.kid.displayName}
          </p>
          <p className="mt-1 text-eh-on-surface-muted">
            Grade {setup.kid.gradeBand} · Level {setup.kid.level} ·{" "}
            {setup.kid.xpTotal} XP
          </p>
        </section>

        <div className="mt-auto flex flex-col gap-3">
          <Link to="/hub">
            <Button className="h-14 w-full rounded-full font-extrabold">
              Back to kid hub
            </Button>
          </Link>
          {mock ? (
            <Button
              variant="outline"
              className="h-14 w-full rounded-full font-extrabold"
              onClick={() => {
                clearParentSession();
                void navigate({ to: "/" });
              }}
            >
              Sign out (mock)
            </Button>
          ) : (
            <Suspense fallback={null}>
              <ParentSignOutButton />
            </Suspense>
          )}
          <Button
            type="button"
            variant="ghost"
            className="h-12 w-full rounded-full"
            onClick={() => {
              clearParentSession();
              void navigate({ to: "/hub" });
            }}
          >
            Lock parent area
          </Button>
        </div>
      </main>
    </div>
  );
}
