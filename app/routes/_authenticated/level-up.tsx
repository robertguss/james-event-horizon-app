import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { LevelUpView } from "@/components/event-horizon/level-up-view";
import { useEh } from "@/lib/eh/data";

export const Route = createFileRoute("/_authenticated/level-up")({
  component: LevelUpPage,
});

function LevelUpPage() {
  const { kid, ready } = useEh();
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    const raw = sessionStorage.getItem("eh.lastComplete");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { previousLevel?: number };
      if (typeof parsed.previousLevel === "number") {
        setPreviousLevel(parsed.previousLevel);
      }
    } catch {
      setPreviousLevel(null);
    }
  }, []);

  if (!ready) {
    return (
      <div className="grid min-h-svh place-items-center bg-eh-neutral text-eh-on-surface">
        <p className="font-extrabold">Loading…</p>
      </div>
    );
  }

  if (!kid) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <LevelUpView
      level={kid.level}
      previousLevel={previousLevel ?? Math.max(1, kid.level - 1)}
      xpTotal={kid.xp}
    />
  );
}
