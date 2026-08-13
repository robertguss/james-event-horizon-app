import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

const PEPPER = "slice1-test-pepper";

describe("onboarding + pin verify + kid authz", () => {
  beforeEach(() => {
    process.env.PIN_PEPPER = PEPPER;
  });

  afterEach(() => {
    delete process.env.PIN_PEPPER;
  });

  it("completeOnboarding creates parent + kid and verifyPin accepts the PIN", async () => {
    const t = convexTest(schema, modules);
    const asParent = t.withIdentity({ subject: "clerk_parent_1" });

    const created = await asParent.mutation(api.setup.completeOnboarding, {
      displayName: "James",
      gradeBand: "3-5",
      pin: "4242",
    });

    expect(created.parentId).toBeTruthy();
    expect(created.kidId).toBeTruthy();

    const state = await asParent.query(api.setup.getState, {});
    expect(state).toMatchObject({
      onboarded: true,
      kid: {
        displayName: "James",
        gradeBand: "3-5",
        xpTotal: 0,
        level: 1,
      },
    });

    const ok = await asParent.mutation(api.parents.verifyPin, { pin: "4242" });
    expect(ok).toEqual({ ok: true });

    const bad = await asParent.mutation(api.parents.verifyPin, { pin: "0000" });
    expect(bad).toEqual({ ok: false });
  });

  it("kid mutations fail without identity", async () => {
    const t = convexTest(schema, modules);
    const asParent = t.withIdentity({ subject: "clerk_parent_2" });
    const { kidId } = await asParent.mutation(api.setup.completeOnboarding, {
      displayName: "Sam",
      gradeBand: "3-5",
      pin: "1111",
    });

    await expect(
      t.mutation(api.kids.rename, { kidId, displayName: "Nope" }),
    ).rejects.toThrow(/Not authenticated/);
  });

  it("kid mutations fail for the wrong parent", async () => {
    const t = convexTest(schema, modules);
    const asParentA = t.withIdentity({ subject: "clerk_parent_a" });
    const asParentB = t.withIdentity({ subject: "clerk_parent_b" });

    const { kidId } = await asParentA.mutation(api.setup.completeOnboarding, {
      displayName: "KidA",
      gradeBand: "3-5",
      pin: "2222",
    });

    await asParentB.mutation(api.setup.completeOnboarding, {
      displayName: "KidB",
      gradeBand: "3-5",
      pin: "3333",
    });

    await expect(
      asParentB.mutation(api.kids.rename, {
        kidId,
        displayName: "Stolen",
      }),
    ).rejects.toThrow(/Unauthorized/);
  });
});
