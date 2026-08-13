export type CosmeticKind = "ship_paint" | "telescope" | "planet_stamp";

export type CosmeticDef = {
  id: string;
  kind: CosmeticKind;
  name: string;
  /** Level gate (use a high value when unlockClears is the real gate). */
  unlockLevel: number;
  /** Sector stamps: unlock after this many mission clears (every 3). */
  unlockClears?: number;
  artSrc: string;
  swatch: string;
};

export const DESIGN_SWATCHES = {
  primary: "#2EC4B6",
  tertiary: "#F0C75E",
  nebulaMagenta: "#E056A0",
  nebulaPink: "#C77DFF",
  accretion: "#FF8A4C",
  secondary: "#F5E6D3",
  success: "#3DDC97",
} as const;

export const COSMETICS: readonly CosmeticDef[] = [
  {
    id: "paint_default",
    kind: "ship_paint",
    name: "Teal Hull",
    unlockLevel: 1,
    artSrc: "/art/paint_default.webp",
    swatch: DESIGN_SWATCHES.primary,
  },
  {
    id: "paint_nebula_01",
    kind: "ship_paint",
    name: "Nebula Streak",
    unlockLevel: 2,
    artSrc: "/art/paint_nebula_01.webp",
    swatch: DESIGN_SWATCHES.nebulaMagenta,
  },
  {
    id: "paint_solar_01",
    kind: "ship_paint",
    name: "Solar Gold",
    unlockLevel: 3,
    artSrc: "/art/paint_solar_01.webp",
    swatch: DESIGN_SWATCHES.tertiary,
  },
  {
    id: "scope_teal_01",
    kind: "telescope",
    name: "Teal Scope",
    unlockLevel: 4,
    artSrc: "/art/scope_teal_01.webp",
    swatch: DESIGN_SWATCHES.primary,
  },
  {
    id: "planet_rocky_01",
    kind: "planet_stamp",
    name: "Rocky Ridge",
    unlockLevel: 2,
    artSrc: "/art/planet_rocky_01.webp",
    swatch: DESIGN_SWATCHES.accretion,
  },
  {
    id: "sector_stamp_01",
    kind: "planet_stamp",
    name: "Sector Alpha",
    unlockLevel: 99,
    unlockClears: 3,
    artSrc: "/art/planet_rocky_01.webp",
    swatch: DESIGN_SWATCHES.success,
  },
  {
    id: "sector_stamp_02",
    kind: "planet_stamp",
    name: "Sector Beta",
    unlockLevel: 99,
    unlockClears: 6,
    artSrc: "/art/bh_unlock_01.webp",
    swatch: DESIGN_SWATCHES.nebulaPink,
  },
] as const;

export const DEFAULT_SHIP_PAINT_ID = "paint_default";
export const L2_SHIP_PAINT_ID = "paint_nebula_01";

const byId = new Map(COSMETICS.map((c) => [c.id, c]));

export function getCosmetic(id: string): CosmeticDef | undefined {
  return byId.get(id);
}

export function unlocksForLevel(level: number): string[] {
  return COSMETICS.filter(
    (c) => c.unlockClears === undefined && c.unlockLevel <= level,
  ).map((c) => c.id);
}

/** Sector stamps every 3 mission clears (PRODUCT-BRIEF). */
export function sectorStampsForClears(clears: number): string[] {
  return COSMETICS.filter(
    (c) =>
      c.kind === "planet_stamp" &&
      c.unlockClears !== undefined &&
      clears >= c.unlockClears,
  ).map((c) => c.id);
}

export function isCosmeticUnlocked(
  cosmeticId: string,
  kid: { level: number; unlocks: string[] },
): boolean {
  const def = getCosmetic(cosmeticId);
  if (!def) return false;
  if (kid.unlocks.includes(cosmeticId)) return true;
  if (def.unlockClears !== undefined) return false;
  return kid.level >= def.unlockLevel;
}

export function mergeUnlocks(kid: {
  level: number;
  unlocks: string[];
  missionsCompleted?: number;
}): string[] {
  return [
    ...new Set([
      ...kid.unlocks,
      ...unlocksForLevel(kid.level),
      ...sectorStampsForClears(kid.missionsCompleted ?? 0),
    ]),
  ];
}

export function shipPaints(): CosmeticDef[] {
  return COSMETICS.filter((c) => c.kind === "ship_paint");
}

export function equipSlotForKind(
  kind: CosmeticKind,
): "equippedShipPaintId" | "equippedTelescopeId" | null {
  switch (kind) {
    case "ship_paint":
      return "equippedShipPaintId";
    case "telescope":
      return "equippedTelescopeId";
    case "planet_stamp":
      return null;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
