import { HubHitTarget } from "@/components/event-horizon/hub-hit-target";
import { XpBadge } from "@/components/event-horizon/xp-badge";
import { getCosmetic } from "@/lib/cosmetics";

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
          className="top-[3%] left-[2.5%] h-[26%] w-[22%] max-w-[220px] sm:top-[4%] sm:left-[3%]"
        />
        <HubHitTarget
          to="/hangar"
          label="Hangar"
          className="top-[3%] right-[2.5%] h-[26%] w-[22%] max-w-[220px] sm:top-[4%] sm:right-[3%]"
        />
        <HubHitTarget
          to="/library"
          label="Library"
          className="bottom-[3%] left-[2.5%] h-[26%] w-[22%] max-w-[220px] sm:bottom-[4%] sm:left-[3%]"
        />
        <HubHitTarget
          to="/academy"
          label="Academy"
          className="bottom-[3%] right-[2.5%] h-[26%] w-[22%] max-w-[220px] sm:bottom-[4%] sm:right-[3%]"
        />

        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 sm:top-4 sm:right-4">
          <ShipPaintChip
            name={paint?.name ?? "Teal Hull"}
            swatch={swatch}
            artSrc={paint?.artSrc}
          />
          <XpBadge xpTotal={xpTotal} />
        </div>

        <p className="sr-only">
          Welcome, {displayName}. Home hub: Missions top left, Hangar top right,
          Library bottom left, Academy bottom right. Equipped ship paint:{" "}
          {paint?.name ?? "Teal Hull"}.
        </p>
      </div>
    </div>
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
        className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full"
        style={{ background: swatch }}
      >
        {artSrc ? (
          <img src={artSrc} alt="" className="h-7 w-7 object-contain" />
        ) : null}
      </span>
      <span className="max-w-[7rem] truncate pr-1 text-xs font-extrabold text-eh-on-surface">
        {name}
      </span>
    </div>
  );
}
