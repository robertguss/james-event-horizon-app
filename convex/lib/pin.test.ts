import { describe, expect, it } from "vitest";
import { assertValidPin, hashPin, verifyPin } from "./pin";

const PEPPER = "unit-test-pepper";

describe("pin hash + verify", () => {
  it("hashes deterministically for the same pin and pepper", async () => {
    const a = await hashPin("1234", PEPPER);
    const b = await hashPin("1234", PEPPER);
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("accepts the correct pin", async () => {
    const hash = await hashPin("987654", PEPPER);
    await expect(verifyPin("987654", hash, PEPPER)).resolves.toBe(true);
  });

  it("rejects the wrong pin", async () => {
    const hash = await hashPin("1234", PEPPER);
    await expect(verifyPin("1235", hash, PEPPER)).resolves.toBe(false);
    await expect(verifyPin("12", hash, PEPPER)).resolves.toBe(false);
  });

  it("rejects invalid pin shapes on hash", () => {
    expect(() => assertValidPin("12")).toThrow(/4–6 digits/);
    expect(() => assertValidPin("abcdef")).toThrow(/4–6 digits/);
    expect(() => assertValidPin("1234567")).toThrow(/4–6 digits/);
  });
});
