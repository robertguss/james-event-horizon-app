const PIN_PATTERN = /^\d{4,6}$/;

export function assertValidPin(pin: string): void {
  if (!PIN_PATTERN.test(pin)) {
    throw new Error("PIN must be 4–6 digits");
  }
}

export function getPinPepper(): string {
  const pepper = process.env.PIN_PEPPER;
  if (!pepper) {
    throw new Error("PIN_PEPPER is not configured");
  }
  return pepper;
}

export async function hashPin(
  pin: string,
  pepper = getPinPepper(),
): Promise<string> {
  assertValidPin(pin);
  const data = new TextEncoder().encode(`${pepper}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(digest);
}

export async function verifyPin(
  pin: string,
  pinHash: string,
  pepper = getPinPepper(),
): Promise<boolean> {
  if (!PIN_PATTERN.test(pin)) {
    return false;
  }
  const candidate = await hashPin(pin, pepper);
  return timingSafeEqualHex(candidate, pinHash);
}

function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
