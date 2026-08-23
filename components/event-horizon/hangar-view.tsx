import { Link } from "@tanstack/react-router";
import { Check, LockKeyhole, Orbit, Rocket, Telescope } from "lucide-react";

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
  const telescopes = COSMETICS.filter((c) => c.kind === "telescope");
  const stamps = COSMETICS.filter((c) => c.kind === "planet_stamp");

  return (
    <div className="relative min-h-svh overflow-x-clip bg-eh-neutral text-eh-on-surface">
      <div
        className="eh-hangar-nebula pointer-events-none absolute inset-0"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Hangar
          </h1>
          <Link
            to="/hub"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-eh-primary px-5 py-2 text-sm font-extrabold text-eh-on-primary"
          >
            Hub
          </Link>
        </header>

        <section className="relative overflow-hidden rounded-[28px] border border-eh-border-glass bg-eh-surface/90 px-4 py-5 shadow-[0_18px_50px_rgba(11,8,24,0.45)] sm:rounded-[36px] sm:px-6 sm:py-7">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,#2EC4B633,transparent_38%),radial-gradient(circle_at_15%_80%,#C77DFF22,transparent_32%)]"
            aria-hidden
          />
          <div className="relative flex flex-col items-center gap-2 text-center">
            <p className="text-xs font-extrabold tracking-[0.2em] text-eh-primary uppercase">
              Dock 01
            </p>
            <h2 className="text-xl font-extrabold sm:text-2xl">
              {kid.displayName}’s explorer ship
            </h2>
            <p className="text-sm font-semibold text-eh-on-surface-muted sm:text-base">
              Complete missions to unlock new colors and equipment.
            </p>
            <ShipPreview paint={equippedPaint} />
            {equippedPaint ? (
              <p className="inline-flex min-h-10 items-center gap-2 rounded-full border border-eh-tertiary/50 bg-eh-tertiary/10 px-4 py-2 text-sm font-extrabold text-eh-tertiary">
                <Check aria-hidden className="size-4" strokeWidth={3} />
                {equippedPaint.name} equipped
              </p>
            ) : null}
          </div>
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
          <h2 className="text-xl font-extrabold">Telescope gear</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {telescopes.map((cosmetic) => (
              <CosmeticTile
                key={cosmetic.id}
                cosmetic={cosmetic}
                kid={kid}
                busy={busyId === cosmetic.id}
                equipped={kid.equippedTelescopeId === cosmetic.id}
                onEquip={onEquip}
              />
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-xl font-extrabold">Mission stamps</h2>
            <p className="mt-1 text-sm font-semibold text-eh-on-surface-muted">
              Add a new stamp to your collection every three missions.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {stamps.map((cosmetic) => (
              <CosmeticTile
                key={cosmetic.id}
                cosmetic={cosmetic}
                kid={kid}
                busy={false}
                equipped={false}
                onEquip={onEquip}
              />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function ShipPreview({ paint }: { paint: CosmeticDef | undefined }) {
  const swatch = paint?.swatch ?? "#2EC4B6";
  return (
    <svg
      viewBox="0 0 420 230"
      role="img"
      aria-label={`Explorer ship painted ${paint?.name ?? "teal"}`}
      className="h-48 w-full max-w-xl drop-shadow-[0_18px_24px_rgba(11,8,24,0.55)] sm:h-56"
    >
      <defs>
        <linearGradient id="hangar-hull" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4F0FF" />
          <stop offset="0.22" stopColor={swatch} />
          <stop offset="1" stopColor={swatch} stopOpacity="0.62" />
        </linearGradient>
        <linearGradient id="hangar-window" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D8FAFF" />
          <stop offset="0.5" stopColor="#4CC9F0" />
          <stop offset="1" stopColor="#19345C" />
        </linearGradient>
        <radialGradient id="hangar-glow">
          <stop offset="0" stopColor={swatch} stopOpacity="0.42" />
          <stop offset="1" stopColor={swatch} stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="215" cy="122" rx="186" ry="94" fill="url(#hangar-glow)" />
      <path
        d="M44 184 Q210 215 376 184"
        fill="none"
        stroke="#F0C75E"
        strokeOpacity="0.25"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M75 174 Q210 198 345 174"
        fill="none"
        stroke={swatch}
        strokeOpacity="0.55"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <g transform="rotate(-5 215 112)">
        <path
          d="M65 111 L25 87 L42 111 L25 135 Z"
          fill="#FF8A4C"
          opacity="0.7"
        />
        <path d="M70 111 L38 98 L48 111 L38 124 Z" fill="#FFE8A3" />
        <rect x="63" y="90" width="35" height="42" rx="9" fill="#263858" />
        <rect x="69" y="96" width="20" height="30" rx="6" fill="#4B6284" />

        <path
          d="M104 101 C142 61 250 54 326 91 L370 111 L326 131 C250 168 142 161 104 121 Z"
          fill="url(#hangar-hull)"
          stroke="#F4F0FF"
          strokeOpacity="0.42"
          strokeWidth="3"
        />
        <path
          d="M326 91 L370 111 L326 131 Q345 111 326 91 Z"
          fill="#F0C75E"
          stroke="#FFE8A3"
          strokeWidth="2"
        />
        <path
          d="M169 91 Q205 34 248 49 L267 76 Q219 72 169 91 Z"
          fill={swatch}
          stroke="#F4F0FF"
          strokeOpacity="0.35"
          strokeWidth="3"
        />
        <path
          d="M169 131 Q205 188 248 173 L267 146 Q219 150 169 131 Z"
          fill={swatch}
          fillOpacity="0.72"
          stroke="#F4F0FF"
          strokeOpacity="0.3"
          strokeWidth="3"
        />
        <ellipse
          cx="248"
          cy="105"
          rx="31"
          ry="23"
          fill="url(#hangar-window)"
          stroke="#F0C75E"
          strokeWidth="5"
        />
        <ellipse cx="240" cy="98" rx="10" ry="7" fill="white" opacity="0.5" />
        <path
          d="M121 111 H202"
          stroke="#17314F"
          strokeOpacity="0.45"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="137" cy="111" r="7" fill="#F0C75E" />
        <circle cx="164" cy="111" r="5" fill="#F4F0FF" opacity="0.75" />
      </g>
    </svg>
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
  const unlockText = unlocked
    ? equipped
      ? "Currently equipped"
      : cosmetic.kind === "planet_stamp"
        ? "Collected"
        : "Unlocked"
    : cosmetic.unlockClears !== undefined
      ? `Unlock after ${cosmetic.unlockClears} missions`
      : `Unlock at level ${cosmetic.unlockLevel}`;

  return (
    <li
      className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-3xl border border-eh-border-glass bg-eh-surface-elevated/80 px-3 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
      style={{ borderColor: unlocked ? `${cosmetic.swatch}88` : undefined }}
    >
      <CosmeticArtwork cosmetic={cosmetic} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-extrabold">{cosmetic.name}</p>
        <p className="text-sm font-semibold text-eh-on-surface-muted">
          {unlockText}
        </p>
      </div>
      {equipped ? (
        <span className="col-span-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-eh-primary/50 bg-eh-primary/15 px-4 py-2 text-sm font-extrabold text-eh-primary sm:col-span-1 sm:w-auto">
          <Check aria-hidden className="size-4" strokeWidth={3} />
          On
        </span>
      ) : equippable && unlocked ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => onEquip(cosmetic.id)}
          className="eh-button-check col-span-2 min-h-12 w-full rounded-full px-4 py-2 text-sm font-extrabold text-white disabled:opacity-40 sm:col-span-1 sm:min-h-0 sm:w-auto"
        >
          {busy ? "Equipping…" : "Equip"}
        </button>
      ) : (
        <span className="col-span-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-eh-border-glass bg-eh-surface px-3 py-2 text-xs font-extrabold text-eh-on-surface-muted sm:col-span-1 sm:w-auto">
          {unlocked ? (
            <Check aria-hidden className="size-4" strokeWidth={3} />
          ) : (
            <LockKeyhole aria-hidden className="size-4" />
          )}
          {unlocked ? "Earned" : "Locked"}
        </span>
      )}
    </li>
  );
}

function CosmeticArtwork({ cosmetic }: { cosmetic: CosmeticDef }) {
  return (
    <div
      className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.25),0_6px_14px_rgba(11,8,24,0.3)]"
      style={{
        background: `radial-gradient(circle at 28% 22%, rgba(255,255,255,0.5), transparent 24%), linear-gradient(145deg, ${cosmetic.swatch}, #241B3D)`,
      }}
      aria-hidden
    >
      {cosmetic.kind === "ship_paint" ? (
        <Rocket className="size-8" strokeWidth={2.5} />
      ) : cosmetic.kind === "telescope" ? (
        <Telescope className="size-8" strokeWidth={2.5} />
      ) : (
        <Orbit className="size-8" strokeWidth={2.5} />
      )}
    </div>
  );
}
