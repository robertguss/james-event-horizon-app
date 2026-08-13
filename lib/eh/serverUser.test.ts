import { afterEach, describe, expect, it } from "vitest";

import { EhModeConfigError, hostedStackEnabled } from "./mode";
import { FIXTURE_AUTH_USER_ID, resolveServerUserId } from "./serverUser";

describe("resolveServerUserId (H1 no fixture_parent in prod)", () => {
  afterEach(() => {
    delete process.env.VITE_EH_DATA;
    delete process.env.VITE_EH_DATA_MODE;
    delete process.env.VITE_EH_TEST_PROD;
  });

  it("DEV unset → may resolve fixture_parent", () => {
    process.env.VITE_EH_TEST_PROD = "0";
    delete process.env.VITE_EH_DATA;
    delete process.env.VITE_EH_DATA_MODE;
    expect(hostedStackEnabled()).toBe(false);
    expect(resolveServerUserId(null)).toBe(FIXTURE_AUTH_USER_ID);
  });

  it("PROD unset → throws; does not return fixture_parent", () => {
    process.env.VITE_EH_TEST_PROD = "1";
    delete process.env.VITE_EH_DATA;
    delete process.env.VITE_EH_DATA_MODE;
    expect(() => hostedStackEnabled()).toThrow(EhModeConfigError);
    expect(() => resolveServerUserId(null)).toThrow(EhModeConfigError);
    let resolved: string | null | undefined = FIXTURE_AUTH_USER_ID;
    try {
      resolved = resolveServerUserId(null);
    } catch {
      resolved = undefined;
    }
    expect(resolved).toBeUndefined();
  });

  it("hosted stack passes through real Clerk user id", () => {
    expect(resolveServerUserId("user_abc", { hosted: true })).toBe("user_abc");
  });
});
