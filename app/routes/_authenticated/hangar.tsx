import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";

import { HangarView } from "@/components/event-horizon/hangar-view";
import { useEh } from "@/lib/eh/data";

export const Route = createFileRoute("/_authenticated/hangar")({
  component: HangarPage,
});

function HangarPage() {
  const { ready, kid, data, refresh } = useEh();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!ready) {
    return (
      <div className="grid min-h-svh place-items-center bg-eh-neutral text-eh-on-surface">
        <p className="font-extrabold">Loading hangar…</p>
      </div>
    );
  }

  if (!kid) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <HangarView
      kid={kid}
      busyId={busyId}
      error={error}
      onEquip={(cosmeticId) => {
        setError(null);
        setBusyId(cosmeticId);
        void data.cosmetics
          .equipCosmetic({ kidId: kid.id, cosmeticId })
          .then(() => refresh())
          .catch((err) => {
            setError(err instanceof Error ? err.message : "Could not equip");
          })
          .finally(() => setBusyId(null));
      }}
    />
  );
}
