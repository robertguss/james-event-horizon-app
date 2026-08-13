import { afterEach, describe, expect, it } from "vitest";

import {
  getEhMode,
  hostedStackEnabled,
  isFixtureMode,
  isProdBuild,
  resolveEhMode,
} from "./mode";

describe("lib/eh mode (H1 prod fail-closed)", () => {
  afterEach(() => {
    delete process.env.VITE_EH_DATA;
    delete process.env.VITE_EH_DATA_MODE;
    delete process.env.VITE_EH_TEST_PROD;
  });

  it("DEV + unset env → fixture (overnight)", () => {
    delete process.env.VITE_EH_DATA;
    delete process.env.VITE_EH_DATA_MODE;
    process.env.VITE_EH_TEST_PROD = "0";
    expect(isProdBuild()).toBe(false);
    expect(getEhMode()).toBe("fixture");
    expect(isFixtureMode()).toBe(true);
    expect(hostedStackEnabled()).toBe(false);
  });

  it("DEV + VITE_EH_DATA=fixture → fixture", () => {
    process.env.VITE_EH_TEST_PROD = "0";
    process.env.VITE_EH_DATA = "fixture";
    expect(getEhMode()).toBe("fixture");
    expect(hostedStackEnabled()).toBe(false);
  });

  it("PROD + unset env → not fixture (fail-closed)", () => {
    delete process.env.VITE_EH_DATA;
    delete process.env.VITE_EH_DATA_MODE;
    process.env.VITE_EH_TEST_PROD = "1";
    expect(resolveEhMode({}, { prod: true })).toBe("convex");
    expect(getEhMode()).toBe("convex");
    expect(isFixtureMode()).toBe(false);
    expect(hostedStackEnabled()).toBe(true);
  });

  it("alias: VITE_EH_DATA=fixture + VITE_EH_DATA_MODE=convex → convex", () => {
    expect(
      resolveEhMode(
        { VITE_EH_DATA: "fixture", VITE_EH_DATA_MODE: "convex" },
        { prod: false },
      ),
    ).toBe("convex");
    process.env.VITE_EH_DATA = "fixture";
    process.env.VITE_EH_DATA_MODE = "convex";
    process.env.VITE_EH_TEST_PROD = "0";
    expect(getEhMode()).toBe("convex");
    expect(hostedStackEnabled()).toBe(true);
  });

  it("PROD typo / unrecognized token → not fixture", () => {
    expect(resolveEhMode({ VITE_EH_DATA: "fixure" }, { prod: true })).toBe(
      "convex",
    );
  });
});
