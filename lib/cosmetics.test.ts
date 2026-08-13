import { describe, expect, it } from "vitest";
import {
  COSMETICS,
  DESIGN_SWATCHES,
  L2_SHIP_PAINT_ID,
  getCosmetic,
  isCosmeticUnlocked,
  unlocksForLevel,
} from "./cosmetics";

describe("cosmetics unlock predicates", () => {
  it("L2 unlocks paint_nebula_01", () => {
    const ids = unlocksForLevel(2);
    expect(ids).toContain(L2_SHIP_PAINT_ID);
    expect(ids).toContain("paint_default");
    expect(ids).toContain("planet_rocky_01");
    expect(ids).not.toContain("paint_solar_01");
  });

  it("isCosmeticUnlocked respects level and persisted unlocks", () => {
    expect(
      isCosmeticUnlocked(L2_SHIP_PAINT_ID, { level: 1, unlocks: [] }),
    ).toBe(false);
    expect(
      isCosmeticUnlocked(L2_SHIP_PAINT_ID, { level: 2, unlocks: [] }),
    ).toBe(true);
    expect(
      isCosmeticUnlocked(L2_SHIP_PAINT_ID, {
        level: 1,
        unlocks: [L2_SHIP_PAINT_ID],
      }),
    ).toBe(true);
  });

  it("catalog swatches stay on DESIGN tokens", () => {
    const allowed = new Set(Object.values(DESIGN_SWATCHES));
    for (const cosmetic of COSMETICS) {
      expect(
        allowed.has(
          cosmetic.swatch as (typeof DESIGN_SWATCHES)[keyof typeof DESIGN_SWATCHES],
        ),
      ).toBe(true);
      expect(getCosmetic(cosmetic.id)?.artSrc).toMatch(/^\/art\/.+\.webp$/);
    }
  });
});
