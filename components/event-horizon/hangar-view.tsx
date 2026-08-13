import { Link } from "@tanstack/react-router";

import {
  COSMETICS,
  DEFAULT_SHIP_PAINT_ID,
  getCosmetic,
  isCosmeticUnlocked,
  shipPaints,
  type CosmeticDef,
} from "@/lib/cosmetics";
import type { EhKid } from "@/lib/eh/data";

type HangarViewProps = {
  kid: EhKid;
  busyId: string | null;
  error: string | null;
  onEquip: (cosmeticId: string) => void;
};

export function HangarView({ kid, busyId, error, onEquip }: HangarViewProps) {
  const equippedPaint = getCosmetic(
    kid.equippedShipPaintId ?? DEFAULT_SHIP_PAINT_ID,
  );

  return (
    <div className="relative min-h-svh overflow-hidden bg-eh-neutral text-eh-on-surface">
      <div
        className="eh-hangar-nebula pointer-events-none absolute inset-0"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-6 px-5 py-8">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight">Hangar</h1>
          <Link
            to="/hub"
            className="rounded-full bg-eh-primary px-4 py-2 text-sm font-extrabold text-eh-on-primary"
          >
            Hub
          </Link>
        </header>

        <section className="flex flex-col items-center gap-4">
          <p className="text-base font-semibold text-eh-on-surface-muted">
            Your ship · paint unlocks with levels
          </p>
          <ShipPreview paint={equippedPaint} />
          {equippedPaint ? (
            <p className="text-lg font-extrabold text-eh-tertiary">
              Equipped: {equippedPaint.name}
            </p>
          ) : null}
        </section>

        {error ? (
          <p className="rounded-eh-md bg-[#FF6B8A33] px-4 py-2 text-sm font-bold text-[#FF6B8A]">
            {error}
          </p>
        ) : null}

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-extrabold">Ship paints</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {shipPaints().map((cosmetic) => (
              <CosmeticTile
                key={cosmetic.id}
                cosmetic={cosmetic}
                kid={kid}
                busy={busyId === cosmetic.id}
                equipped={kid.equippedShipPaintId === cosmetic.id}
                onEquip={onEquip}
              />
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-extrabold">Stamps</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {COSMETICS.filter((c) => c.kind !== "ship_paint").map(
              (cosmetic) => (
                <CosmeticTile
                  key={cosmetic.id}
                  cosmetic={cosmetic}
                  kid={kid}
                  busy={false}
                  equipped={false}
                  onEquip={onEquip}
                />
              ),
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function ShipPreview({ paint }: { paint: CosmeticDef | undefined }) {
  const swatch = paint?.swatch ?? "#2EC4B6";
  return (
    <div
      className="relative flex h-44 w-44 items-center justify-center rounded-full border-4 border-eh-border-glass shadow-[0_16px_40px_rgba(11,8,24,0.45)]"
      style={{
        background: `radial-gradient(circle at 35% 30%, ${swatch}aa, #2E2450 70%)`,
      }}
    >
      <img
        src={paint?.artSrc ?? "/art/ship_base.webp"}
        alt=""
        className="h-28 w-28 object-contain drop-shadow-[0_8px_16px_rgba(11,8,24,0.5)]"
      />
    </div>
  );
}

function CosmeticTile({
  cosmetic,
  kid,
  busy,
  equipped,
  onEquip,
}: {
  cosmetic: CosmeticDef;
  kid: EhKid;
  busy: boolean;
  equipped: boolean;
  onEquip: (id: string) => void;
}) {
  const unlocked = isCosmeticUnlocked(cosmetic.id, kid);
  const equippable =
    cosmetic.kind === "ship_paint" || cosmetic.kind === "telescope";

  return (
    <li
      className="flex items-center gap-3 rounded-3xl border border-eh-border-glass bg-eh-surface-elevated/80 px-3 py-3"
      style={{ borderColor: unlocked ? `${cosmetic.swatch}88` : undefined }}
    >
      <img
        src={cosmetic.artSrc}
        alt=""
        className="h-14 w-14 shrink-0 rounded-2xl object-cover"
        style={{ background: cosmetic.swatch }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-extrabold">{cosmetic.name}</p>
        <p className="text-sm font-semibold text-eh-on-surface-muted">
          {unlocked
            ? `Level ${cosmetic.unlockLevel}+`
            : `Locks at L${cosmetic.unlockLevel}`}
        </p>
      </div>
      {equippable ? (
        <button
          type="button"
          disabled={!unlocked || equipped || busy}
          onClick={() => onEquip(cosmetic.id)}
          className="eh-button-check shrink-0 rounded-full px-4 py-2 text-sm font-extrabold text-white disabled:opacity-40"
        >
          {equipped ? "On" : busy ? "…" : "Equip"}
        </button>
      ) : (
        <span className="shrink-0 rounded-full bg-eh-secondary px-3 py-1 text-xs font-extrabold text-eh-on-secondary">
          {unlocked ? "Stamp" : "Locked"}
        </span>
      )}
    </li>
  );
}
