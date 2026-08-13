import { afterEach, describe, expect, it } from "vitest";

import { hostedStackEnabled } from "./mode";
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

  it("PROD unset → does not return fixture_parent", () => {
    process.env.VITE_EH_TEST_PROD = "1";
    delete process.env.VITE_EH_DATA;
    delete process.env.VITE_EH_DATA_MODE;
    expect(hostedStackEnabled()).toBe(true);
    expect(resolveServerUserId(null)).toBeNull();
    expect(resolveServerUserId(null)).not.toBe(FIXTURE_AUTH_USER_ID);
  });

  it("hosted stack passes through real Clerk user id", () => {
    expect(resolveServerUserId("user_abc", { hosted: true })).toBe("user_abc");
  });
});
