import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEventHorizon } from "@/lib/event-horizon/EventHorizonProvider";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const { setup, identity, completeOnboarding } = useEventHorizon();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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

  if (setup?.onboarded) {
    return <Navigate to="/hub" />;
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }
    setPending(true);
    try {
      await completeOnboarding({
        displayName,
        gradeBand: "3-5",
        pin,
      });
      await navigate({ to: "/hub" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not finish setup");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="relative min-h-svh bg-eh-neutral text-eh-on-surface">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#C77DFF44,transparent_50%),linear-gradient(180deg,#1B1430,#241B3D)]"
        aria-hidden
      />
      <main className="relative mx-auto flex min-h-svh w-full max-w-lg flex-col justify-center gap-8 px-6 py-12">
        <div className="space-y-3">
          <p className="text-sm font-bold tracking-wide text-eh-primary uppercase">
            Event Horizon
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Create your explorer
          </h1>
          <p className="text-eh-on-surface-muted">
            One kid profile and a parent PIN. Grade band is 3–5 for this
            adventure.
          </p>
        </div>

        <form
          onSubmit={(event) => void onSubmit(event)}
          className="space-y-5 rounded-[28px] bg-eh-surface-elevated/90 p-6 ring-1 ring-eh-border-glass"
        >
          <div className="space-y-2">
            <Label htmlFor="displayName">Explorer name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
              maxLength={40}
              autoComplete="nickname"
              className="h-12 rounded-full bg-eh-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gradeBand">Grade band</Label>
            <Input
              id="gradeBand"
              value="3–5"
              readOnly
              className="h-12 rounded-full bg-eh-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">Parent PIN (4–6 digits)</Label>
            <Input
              id="pin"
              inputMode="numeric"
              pattern="\d{4,6}"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              required
              autoComplete="new-password"
              className="h-12 rounded-full bg-eh-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPin">Confirm PIN</Label>
            <Input
              id="confirmPin"
              inputMode="numeric"
              pattern="\d{4,6}"
              value={confirmPin}
              onChange={(event) => setConfirmPin(event.target.value)}
              required
              autoComplete="new-password"
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
            className="h-14 w-full rounded-full text-lg font-extrabold"
          >
            {pending ? "Launching…" : "Enter the hub"}
          </Button>
        </form>
      </main>
    </div>
  );
}
