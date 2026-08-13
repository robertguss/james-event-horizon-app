import { afterEach, describe, expect, it } from "vitest";
import { L2_SHIP_PAINT_ID } from "../cosmetics";
import { resetFixture } from "./adapters/fixtureAdapter";
import { getEhData } from "./data";

describe("fixture cosmetics equip + L2 unlock", () => {
  afterEach(() => {
    resetFixture();
  });

  it("resetFixture to L2+ unlocks nebula paint", async () => {
    resetFixture({ xpTotal: 100 });
    const eh = getEhData();
    const kids = await eh.kids.list();
    const kid = kids[0];
    expect(kid?.level).toBeGreaterThanOrEqual(2);
    expect(kid?.unlocks).toContain(L2_SHIP_PAINT_ID);
  });

  it("equipCosmetic persists equippedShipPaintId on fixture store", async () => {
    resetFixture({ xpTotal: 100 });
    const eh = getEhData();
    const kid = (await eh.kids.list())[0];
    expect(kid).toBeTruthy();
    if (!kid) return;

    const next = await eh.cosmetics.equipCosmetic({
      kidId: kid.id,
      cosmeticId: L2_SHIP_PAINT_ID,
    });
    expect(next.equippedShipPaintId).toBe(L2_SHIP_PAINT_ID);

    const again = await eh.kids.get(kid.id);
    expect(again?.equippedShipPaintId).toBe(L2_SHIP_PAINT_ID);
  });

  it("equipCosmetic rejects locked paint", async () => {
    resetFixture({ xpTotal: 0 });
    const eh = getEhData();
    const kid = (await eh.kids.list())[0];
    expect(kid).toBeTruthy();
    if (!kid) return;

    await expect(
      eh.cosmetics.equipCosmetic({
        kidId: kid.id,
        cosmeticId: L2_SHIP_PAINT_ID,
      }),
    ).rejects.toThrow(/locked/i);
  });
});
