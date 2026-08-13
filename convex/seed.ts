/**
 * Morning Convex seed — stub mission catalog from fixture sources.
 * Overnight CI does not require a live deployment; call after schema tables land.
 */
import { v } from "convex/values";
import { ALL_FIXTURE_MISSIONS } from "../lib/eh/fixtures/missionsStub";
import { internalMutation } from "./_generated/server";

export const SEED_MISSION_SUMMARIES = ALL_FIXTURE_MISSIONS.map((m) => ({
  slug: m.id,
  title: m.title,
  planet: m.planet,
  planetId: m.planetId,
  gradeBand: m.gradeBand,
  estimatedMinutes: m.estimatedMinutes,
  skillTags: m.skillTags,
  status: m.status,
  kind: m.kind,
  objective: m.objective,
  sentences: m.sentences,
}));

/**
 * Upsert published/stub mission rows for morning Convex.
 * Requires `missions` table (Slice 5 schema stub). Idempotent by slug.
 */
export const seedPublishedMissions = internalMutation({
  args: {},
  returns: v.object({
    upserted: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    let upserted = 0;
    for (const mission of SEED_MISSION_SUMMARIES) {
      const existing = await ctx.db
        .query("missions")
        .withIndex("by_slug", (q) => q.eq("slug", mission.slug))
        .unique();
      if (existing) {
        await ctx.db.patch("missions", existing._id, {
          title: mission.title,
          planet: mission.planet,
          planetId: mission.planetId,
          gradeBand: mission.gradeBand,
          estimatedMinutes: mission.estimatedMinutes,
          skillTags: mission.skillTags,
          status: mission.status,
          kind: mission.kind,
          objective: mission.objective,
          sentences: mission.sentences,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("missions", {
          ...mission,
          createdAt: now,
          updatedAt: now,
        });
      }
      upserted += 1;
    }
    return { upserted };
  },
});
