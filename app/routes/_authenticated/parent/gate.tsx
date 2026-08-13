import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEventHorizon } from "@/lib/event-horizon/EventHorizonProvider";
import { isParentUnlocked, unlockParentSession } from "@/lib/parent-session";

export const Route = createFileRoute("/_authenticated/parent/gate")({
  component: ParentGatePage,
});

function ParentGatePage() {
  const { setup, identity, verifyPin } = useEventHorizon();
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [alreadyUnlocked, setAlreadyUnlocked] = useState(false);

  useEffect(() => {
    setAlreadyUnlocked(isParentUnlocked());
  }, []);

  if (setup === undefined) {
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

  if (alreadyUnlocked) {
    return <Navigate to="/parent" />;
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await verifyPin(pin);
      if (!result.ok) {
        setError("Wrong PIN. Try again.");
        return;
      }
      unlockParentSession();
      await navigate({ to: "/parent" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify PIN");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="relative min-h-svh bg-eh-neutral text-eh-on-surface">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,#2EC4B633,transparent_45%),linear-gradient(180deg,#1B1430,#241B3D)]"
        aria-hidden
      />
      <main className="relative mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-6 px-6 py-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold">Parent gate</h1>
          <p className="text-eh-on-surface-muted">
            Enter your PIN to open the parent area.
          </p>
        </div>
        <form
          onSubmit={(event) => void onSubmit(event)}
          className="space-y-4 rounded-[28px] bg-eh-surface-elevated/90 p-6 ring-1 ring-eh-border-glass"
        >
          <div className="space-y-2">
            <Label htmlFor="parentPin">PIN</Label>
            <Input
              id="parentPin"
              inputMode="numeric"
              pattern="\d{4,6}"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              required
              autoComplete="current-password"
              className="h-12 rounded-full bg-eh-surface"
            />
          </div>
          {error ? (
            <p className="text-sm font-semibold text-[#FF6B8A]" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={pending}
            className="h-14 w-full rounded-full font-extrabold"
          >
            {pending ? "Checking…" : "Unlock"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-full"
            onClick={() => void navigate({ to: "/hub" })}
          >
            Back to hub
          </Button>
        </form>
      </main>
    </div>
  );
}
