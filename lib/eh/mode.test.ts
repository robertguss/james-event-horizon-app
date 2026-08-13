import { afterEach, describe, expect, it } from "vitest";

import {
  EhModeConfigError,
  PROD_MODE_REQUIRED_MESSAGE,
  getEhMode,
  hostedStackEnabled,
  isFixtureMode,
  isProdBuild,
  resolveEhMode,
  showFixturePinHint,
} from "./mode";

describe("lib/eh mode (H1 prod refuses boot without convex)", () => {
  afterEach(() => {
    delete process.env.VITE_EH_DATA;
    delete process.env.VITE_EH_DATA_MODE;
    delete process.env.VITE_EH_TEST_PROD;
    delete process.env.VITE_EH_TEST_DEV;
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

  it("PROD + unset env → hard error (not fixture, not silent convex)", () => {
    delete process.env.VITE_EH_DATA;
    delete process.env.VITE_EH_DATA_MODE;
    process.env.VITE_EH_TEST_PROD = "1";
    expect(() => resolveEhMode({}, { prod: true })).toThrow(EhModeConfigError);
    expect(() => resolveEhMode({}, { prod: true })).toThrow(
      PROD_MODE_REQUIRED_MESSAGE,
    );
    expect(() => getEhMode()).toThrow(EhModeConfigError);
    expect(() => hostedStackEnabled()).toThrow(EhModeConfigError);
    expect(() => isFixtureMode()).toThrow(EhModeConfigError);
  });

  it("PROD + VITE_EH_DATA=fixture → hard error", () => {
    expect(() =>
      resolveEhMode({ VITE_EH_DATA: "fixture" }, { prod: true }),
    ).toThrow(EhModeConfigError);
  });

  it("PROD + VITE_EH_DATA=convex → convex / hosted", () => {
    process.env.VITE_EH_TEST_PROD = "1";
    process.env.VITE_EH_DATA = "convex";
    expect(getEhMode()).toBe("convex");
    expect(hostedStackEnabled()).toBe(true);
    expect(isFixtureMode()).toBe(false);
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

  it("PROD typo → hard error (not silent convex)", () => {
    expect(() =>
      resolveEhMode({ VITE_EH_DATA: "fixure" }, { prod: true }),
    ).toThrow(EhModeConfigError);
  });

  it("fixture PIN hint only in DEV + fixture", () => {
    process.env.VITE_EH_TEST_PROD = "0";
    process.env.VITE_EH_TEST_DEV = "1";
    process.env.VITE_EH_DATA = "fixture";
    expect(showFixturePinHint()).toBe(true);

    process.env.VITE_EH_TEST_DEV = "0";
    expect(showFixturePinHint()).toBe(false);

    process.env.VITE_EH_TEST_DEV = "1";
    process.env.VITE_EH_DATA = "convex";
    expect(showFixturePinHint()).toBe(false);
  });
});
