import { Link } from "@tanstack/react-router";

import { HubHitTarget } from "@/components/event-horizon/hub-hit-target";
import { XpBadge } from "@/components/event-horizon/xp-badge";
import { getCosmetic } from "@/lib/cosmetics";
import { cn } from "@/lib/utils";

type HubViewProps = {
  displayName: string;
  xpTotal: number;
  equippedShipPaintId?: string;
};

/** Home hub chrome: docs/design-refs/03-home-hub.jpeg (VISUAL-SOT). */
export function HubView({
  displayName,
  xpTotal,
  equippedShipPaintId,
}: HubViewProps) {
  const paint = getCosmetic(equippedShipPaintId ?? "paint_default");
  const swatch = paint?.swatch ?? "#2EC4B6";

  return (
    <div className="relative min-h-svh overflow-hidden bg-eh-neutral text-eh-on-surface">
      <img
        src="/hub-scene.jpeg"
        alt=""
        className="eh-hub-scene absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        className="eh-hub-drift pointer-events-none absolute inset-0"
        aria-hidden
      />

      <div className="relative z-10 min-h-svh">
        <HubHitTarget
          to="/missions"
          label="Missions"
          className="eh-hub-hotspot top-[4%] left-[3%] h-[26%] w-[22%] max-w-[220px]"
        />
        <HubHitTarget
          to="/hangar"
          label="Hangar"
          className="eh-hub-hotspot top-[4%] right-[3%] h-[26%] w-[22%] max-w-[220px]"
        />
        <HubHitTarget
          to="/library"
          label="Library"
          className="eh-hub-hotspot bottom-[4%] left-[3%] h-[26%] w-[22%] max-w-[220px]"
        />
        <HubHitTarget
          to="/academy"
          label="Academy"
          className="eh-hub-hotspot right-[3%] bottom-[4%] h-[26%] w-[22%] max-w-[220px]"
        />

        <div className="absolute top-[calc(0.75rem+env(safe-area-inset-top))] right-3 z-20 flex items-center gap-2 sm:right-4">
          <ShipPaintChip
            name={paint?.name ?? "Teal Hull"}
            swatch={swatch}
            artSrc={paint?.artSrc}
          />
          <XpBadge xpTotal={xpTotal} />
        </div>

        <nav
          aria-label="Explorer destinations"
          className="eh-hub-destinations absolute inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-20 grid-cols-2 gap-2 landscape:grid-cols-4 sm:inset-x-5 sm:mx-auto sm:max-w-3xl"
        >
          <MobileHubLink to="/missions" label="Missions" tone="teal" />
          <MobileHubLink to="/hangar" label="Hangar" tone="teal" />
          <MobileHubLink to="/library" label="Library" tone="cream" />
          <MobileHubLink to="/academy" label="Academy" tone="cream" />
        </nav>

        <p className="sr-only">
          Welcome, {displayName}. Home hub: Missions top left, Hangar top right,
          Library bottom left, Academy bottom right. Equipped ship paint:{" "}
          {paint?.name ?? "Teal Hull"}.
        </p>
      </div>
    </div>
  );
}

function MobileHubLink({
  to,
  label,
  tone,
}: {
  to: "/missions" | "/hangar" | "/library" | "/academy";
  label: string;
  tone: "teal" | "cream";
}) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex min-h-16 items-center justify-center gap-2 rounded-eh-md border-2 border-white/30 px-3 text-base font-extrabold shadow-[0_8px_20px_rgba(11,8,24,0.4)] outline-none transition-transform active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-eh-tertiary",
        tone === "teal"
          ? "eh-jelly-teal text-eh-on-primary"
          : "eh-jelly-cream text-eh-on-secondary",
      )}
    >
      <span aria-hidden className="text-eh-tertiary">
        ★
      </span>
      {label}
    </Link>
  );
}

function ShipPaintChip({
  name,
  swatch,
  artSrc,
}: {
  name: string;
  swatch: string;
  artSrc?: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-full border-2 border-eh-border-glass bg-eh-surface/80 px-2 py-1 shadow-[0_6px_16px_rgba(11,8,24,0.35)] backdrop-blur-sm"
      title={name}
    >
      <span
        className="inline-flex size-8 items-center justify-center overflow-hidden rounded-full"
        style={{ background: swatch }}
      >
        {artSrc ? (
          <img src={artSrc} alt="" className="size-7 object-contain" />
        ) : null}
      </span>
      <span className="max-w-[7rem] truncate pr-1 text-xs font-extrabold text-eh-on-surface">
        {name}
      </span>
    </div>
  );
}
