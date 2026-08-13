import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { internal } from "./_generated/api";
import schema from "./schema";
import { SEED_MISSION_SUMMARIES } from "./seed";
import { modules } from "./test.setup";

describe("seedPublishedMissions", () => {
  it("upserts fixture stub catalog including blackHole kind", async () => {
    const t = convexTest(schema, modules);
    const first = await t.mutation(internal.seed.seedPublishedMissions, {});
    expect(first.upserted).toBe(SEED_MISSION_SUMMARIES.length);

    const rows = await t.run(async (ctx) => {
      return await ctx.db.query("missions").collect();
    });
    expect(rows.length).toBe(SEED_MISSION_SUMMARIES.length);
    expect(rows.some((r) => r.kind === "blackHole")).toBe(true);
    expect(rows.some((r) => r.slug === "mission_01_mars_dust")).toBe(true);

    const second = await t.mutation(internal.seed.seedPublishedMissions, {});
    expect(second.upserted).toBe(SEED_MISSION_SUMMARIES.length);
    const again = await t.run(async (ctx) => {
      return await ctx.db.query("missions").collect();
    });
    expect(again.length).toBe(SEED_MISSION_SUMMARIES.length);
  });
});
