import { afterEach, describe, expect, it } from "vitest";
import { resetFixtureAdapter } from "./adapters/fixtureAdapter";
import { FIXTURE_PARENT_PIN } from "./auth/fixtureAuth";
import { getEhData, getEhMode } from "./data";

describe("lib/eh fixture-first data API", () => {
  afterEach(() => {
    resetFixtureAdapter();
    delete process.env.VITE_EH_DATA;
    delete process.env.VITE_EH_DATA_MODE;
    delete process.env.VITE_EH_TEST_PROD;
  });

  it("DEV unset → fixture (overnight)", () => {
    delete process.env.VITE_EH_DATA;
    delete process.env.VITE_EH_DATA_MODE;
    process.env.VITE_EH_TEST_PROD = "0";
    expect(getEhMode()).toBe("fixture");
    expect(getEhData().mode).toBe("fixture");
  });

  it("lands fixture session with James and PIN 1234", async () => {
    const eh = getEhData();
    await eh.auth.fixtureSignInAsParent?.();
    const session = await eh.auth.getSession();
    expect(session.parentId).toBeTruthy();
    expect(session.activeKidId).toBe("kid_james");

    const kids = await eh.kids.list();
    expect(kids[0]?.displayName).toBe("James");
    expect(kids[0]?.xp).toBe(0);

    await expect(eh.parent.verifyPin(FIXTURE_PARENT_PIN)).resolves.toBe(true);
    await expect(eh.parent.verifyPin("0000")).resolves.toBe(false);
  });

  it("skips onboarding create when kid already exists", async () => {
    const eh = getEhData();
    const first = await eh.kids.create({
      displayName: "Other",
      gradeBand: "3-5",
    });
    const second = await eh.kids.create({
      displayName: "Other",
      gradeBand: "3-5",
    });
    expect(second.id).toBe(first.id);
    expect(second.displayName).toBe("James");
  });

  it("lists Mission 1 fixture without runtime", async () => {
    const missions = await getEhData().missions.list();
    expect(missions[0]?.id).toBe("mission_01_mars_dust");
  });

  it("custom onboarding PIN is accepted; default 1234 rejected after set", async () => {
    resetFixtureAdapter({ seedDefaultKid: false });
    const eh = getEhData();
    expect(await eh.kids.list()).toHaveLength(0);

    const kid = await eh.setup.complete({
      displayName: "Jamie",
      gradeBand: "3-5",
      pin: "5678",
    });
    expect(kid.displayName).toBe("Jamie");
    await expect(eh.parent.verifyPin("5678")).resolves.toBe(true);
    await expect(eh.parent.verifyPin(FIXTURE_PARENT_PIN)).resolves.toBe(false);
  });
});
