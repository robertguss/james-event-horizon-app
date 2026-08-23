import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

async function onboard(t: ReturnType<typeof convexTest>, subject: string) {
  const user = t.withIdentity({ subject });
  const setup = await user.mutation(api.setup.completeOnboarding, {
    displayName: "James",
    gradeBand: "3-5",
    pin: "4242",
  });
  return { user, ...setup };
}

describe("mission reflections", () => {
  beforeEach(() => {
    process.env.PIN_PEPPER = "reflection-test-pepper";
  });

  afterEach(() => {
    delete process.env.PIN_PEPPER;
  });

  it("stores only an authored connection map owned by the current family", async () => {
    const t = convexTest(schema, modules);
    const owner = await onboard(t, "clerk_reflection_owner");
    const other = await onboard(t, "clerk_reflection_other");
    const missionId = "mission_w1_d1_light_collector";
    const attempt = await owner.user.mutation(api.attempts.start, {
      kidId: owner.kidId,
      missionId,
    });

    await expect(
      owner.user.mutation(api.reflections.save, {
        attemptId: attempt._id,
        missionId,
        mapCardIds: ["pull"],
      }),
    ).rejects.toThrow(/not complete/);

    await owner.user.mutation(api.reflections.save, {
      attemptId: attempt._id,
      missionId,
      mapCardIds: ["source", "gather", "focus", "image"],
    });

    const rows = await t.run(async (ctx) =>
      ctx.db.query("missionReflections").collect(),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      kidId: owner.kidId,
      missionId,
      mapCardIds: ["source", "gather", "focus", "image"],
    });
    await expect(
      owner.user.query(api.reflections.listRecordings, {
        kidId: owner.kidId,
      }),
    ).resolves.toEqual([]);
    await expect(
      other.user.query(api.reflections.listRecordings, {
        kidId: owner.kidId,
      }),
    ).rejects.toThrow(/Unauthorized/);
  });
});
