import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { L2_SHIP_PAINT_ID } from "../lib/cosmetics";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

const PEPPER = "slice4-test-pepper";

describe("kids.equipCosmetic authz", () => {
  beforeEach(() => {
    process.env.PIN_PEPPER = PEPPER;
  });

  afterEach(() => {
    delete process.env.PIN_PEPPER;
  });

  it("owner can equip an unlocked paint; stranger cannot", async () => {
    const t = convexTest(schema, modules);
    const asParent = t.withIdentity({ subject: "clerk_parent_equip" });
    const { kidId } = await asParent.mutation(api.setup.completeOnboarding, {
      displayName: "James",
      gradeBand: "3-5",
      pin: "1234",
    });

    // L1 default only — nebula paint locked
    await expect(
      asParent.mutation(api.kids.equipCosmetic, {
        kidId,
        cosmeticId: L2_SHIP_PAINT_ID,
      }),
    ).rejects.toThrow(/locked/i);

    // Simulate L2 unlocks on the kid row
    await t.run(async (ctx) => {
      const kid = await ctx.db.get("kids", kidId);
      if (!kid) throw new Error("missing kid");
      await ctx.db.patch("kids", kidId, {
        level: 2,
        xpTotal: 100,
        unlockedCosmeticIds: [...kid.unlockedCosmeticIds, L2_SHIP_PAINT_ID],
      });
    });

    const equipped = await asParent.mutation(api.kids.equipCosmetic, {
      kidId,
      cosmeticId: L2_SHIP_PAINT_ID,
    });
    expect(equipped.equippedShipPaintId).toBe(L2_SHIP_PAINT_ID);

    const asStranger = t.withIdentity({ subject: "clerk_stranger" });
    await asStranger.mutation(api.setup.completeOnboarding, {
      displayName: "Other",
      gradeBand: "3-5",
      pin: "9999",
    });
    await expect(
      asStranger.mutation(api.kids.equipCosmetic, {
        kidId,
        cosmeticId: L2_SHIP_PAINT_ID,
      }),
    ).rejects.toThrow(/Unauthorized|Parent profile/);
  });

  it("unauthenticated equip fails", async () => {
    const t = convexTest(schema, modules);
    const asParent = t.withIdentity({ subject: "clerk_parent_anon" });
    const { kidId } = await asParent.mutation(api.setup.completeOnboarding, {
      displayName: "James",
      gradeBand: "3-5",
      pin: "1234",
    });

    await expect(
      t.mutation(api.kids.equipCosmetic, {
        kidId,
        cosmeticId: "paint_default",
      }),
    ).rejects.toThrow(/Not authenticated/);
  });
});
