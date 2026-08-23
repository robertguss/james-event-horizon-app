import { describe, expect, it } from "vitest";
import { missionWeek1Day1 } from "../fixtures/week01";
import {
  assertCorrectConnectionMap,
  isCorrectConnectionMap,
} from "./reflection";

describe("connection map validation", () => {
  it("accepts only the authored cards in the authored order", () => {
    expect(
      isCorrectConnectionMap(missionWeek1Day1, [
        "source",
        "gather",
        "focus",
        "image",
      ]),
    ).toBe(true);
    expect(
      isCorrectConnectionMap(missionWeek1Day1, [
        "source",
        "focus",
        "gather",
        "image",
      ]),
    ).toBe(false);
    expect(isCorrectConnectionMap(missionWeek1Day1, ["source"])).toBe(false);
  });

  it("rejects missions without a reflection pack", () => {
    expect(
      isCorrectConnectionMap(
        { ...missionWeek1Day1, reflection: undefined },
        [],
      ),
    ).toBe(false);
    expect(() =>
      assertCorrectConnectionMap(missionWeek1Day1, ["pull"]),
    ).toThrow(/not complete/);
  });
});
