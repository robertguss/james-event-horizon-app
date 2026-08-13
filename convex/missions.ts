/**
 * Mission list/get for EhData.
 * Convex rows (slug/lock/kind) merge with detail pack in lib/eh/fixtures.
 */

import { v } from "convex/values";
import { query } from "./_generated/server";
import { getMissionById, listCatalogMissions } from "./lib/missionCatalog";
import { getKidForParent, getParentByClerkUserId } from "./lib/parents";
import {
  missionDetailValidator,
  missionSummaryValidator,
} from "./lib/validators";
import { summarizeMission } from "../lib/eh/pure/missionLock";
import type { MissionDetail } from "../lib/eh/types";

export const list = query({
  args: {
    /** Client clock for BH weekly cap (queries must stay deterministic). */
    nowMs: v.number(),
  },
  returns: v.array(missionSummaryValidator),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    let kid:
      | {
          level: number;
          streakDays: number;
          bhCompletionTimestampsMs: number[];
        }
      | undefined;

    if (identity) {
      const parent = await getParentByClerkUserId(ctx, identity.subject);
      if (parent) {
        const row = parent.activeKidId
          ? await ctx.db.get("kids", parent.activeKidId)
          : await getKidForParent(ctx, parent._id);
        if (row && row.parentId === parent._id) {
          kid = {
            level: row.level,
            streakDays: row.streakDays,
            bhCompletionTimestampsMs: row.bhCompletionTimestampsMs,
          };
        }
      }
    }

    const seeded = await ctx.db.query("missions").collect();
    const catalog = listCatalogMissions();
    const bySlug = new Map(catalog.map((m) => [m.id, m]));

    const sources: MissionDetail[] =
      seeded.length > 0
        ? seeded
            .map((row) => {
              const detail = bySlug.get(row.slug);
              if (detail) {
                return {
                  ...detail,
                  title: row.title,
                  planet: row.planet,
                  planetId: row.planetId,
                  gradeBand: row.gradeBand,
                  estimatedMinutes: row.estimatedMinutes,
                  objective: row.objective,
                  kind: row.kind,
                  skillTags: row.skillTags,
                  status: row.status,
                };
              }
              // Row without detail pack — summary-only stub shell.
              return {
                id: row.slug,
                title: row.title,
                planet: row.planet,
                planetId: row.planetId,
                gradeBand: row.gradeBand,
                estimatedMinutes: row.estimatedMinutes,
                objective: row.objective,
                kind: row.kind,
                skillTags: row.skillTags,
                status: row.status,
                sentences: row.sentences,
                questions: [],
                scoring: catalog[0]!.scoring,
              } satisfies MissionDetail;
            })
            .filter((m) => m.status !== "draft")
        : [...catalog];

    return sources.map((mission) =>
      summarizeMission({
        mission,
        kid,
        bhCompletionTimestampsMs: kid?.bhCompletionTimestampsMs ?? [],
        nowMs: args.nowMs,
      }),
    );
  },
});

export const get = query({
  args: {
    missionId: v.string(),
  },
  returns: v.union(missionDetailValidator, v.null()),
  handler: async (_ctx, args) => {
    // Detail pack is authoritative for questions; fail closed if unknown.
    return getMissionById(args.missionId);
  },
});
