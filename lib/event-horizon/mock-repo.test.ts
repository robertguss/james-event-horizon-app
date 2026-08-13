import { describe, expect, it } from "vitest";
import { createMockRepository } from "./mock-repo";
import { hashPin, verifyPinHash } from "./pin";

describe("event-horizon mock repository", () => {
  it("hashes and verifies PIN correctly / incorrectly", async () => {
    const pepper = "test-pepper";
    const hash = await hashPin("4242", pepper);
    await expect(verifyPinHash("4242", hash, pepper)).resolves.toBe(true);
    await expect(verifyPinHash("0000", hash, pepper)).resolves.toBe(false);
  });

  it("onboards parent+kid and verifies PIN", async () => {
    const repo = createMockRepository({ pepper: "p" });
    expect(repo.getSetupState(null)).toBeNull();
    expect(repo.getSetupState("clerk_1")).toEqual({ onboarded: false });

    await repo.completeOnboarding({
      clerkUserId: "clerk_1",
      displayName: "James",
      gradeBand: "3-5",
      pin: "1234",
    });

    const state = repo.getSetupState("clerk_1");
    expect(state).toMatchObject({
      onboarded: true,
      kid: { displayName: "James", xpTotal: 0, level: 1, gradeBand: "3-5" },
    });

    await expect(
      repo.verifyPin({ clerkUserId: "clerk_1", pin: "1234" }),
    ).resolves.toEqual({ ok: true });
    await expect(
      repo.verifyPin({ clerkUserId: "clerk_1", pin: "9999" }),
    ).resolves.toEqual({ ok: false });
  });

  it("rejects kid mutations without identity and for wrong parent", async () => {
    const repo = createMockRepository({ pepper: "p" });
    const { kidId } = await repo.completeOnboarding({
      clerkUserId: "parent_a",
      displayName: "A",
      gradeBand: "3-5",
      pin: "1111",
    });
    await repo.completeOnboarding({
      clerkUserId: "parent_b",
      displayName: "B",
      gradeBand: "3-5",
      pin: "2222",
    });

    await expect(
      repo.renameKid({
        clerkUserId: "",
        kidId,
        displayName: "Nope",
      }),
    ).rejects.toThrow(/Not authenticated/);

    await expect(
      repo.renameKid({
        clerkUserId: "parent_b",
        kidId,
        displayName: "Stolen",
      }),
    ).rejects.toThrow(/Unauthorized/);
  });

  it("seeds Mission 1 fixture for the missions list", () => {
    const repo = createMockRepository();
    const missions = repo.listMissions();
    expect(missions[0]?.id).toBe("mission_01_mars_dust");
    expect(missions[0]?.title).toBe("Dust Storm on Mars");
    expect(missions[0]?.sentences).toHaveLength(8);
  });
});
