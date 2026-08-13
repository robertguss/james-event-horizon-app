const PIN_PATTERN = /^\d{4,6}$/;

export function assertValidPin(pin: string): void {
  if (!PIN_PATTERN.test(pin)) {
    throw new Error("PIN must be 4–6 digits");
  }
}

export async function hashPin(pin: string, pepper: string): Promise<string> {
  assertValidPin(pin);
  const data = new TextEncoder().encode(`${pepper}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPinHash(
  pin: string,
  pinHash: string,
  pepper: string,
): Promise<boolean> {
  if (!PIN_PATTERN.test(pin)) {
    return false;
  }
  const candidate = await hashPin(pin, pepper);
  if (candidate.length !== pinHash.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < candidate.length; i += 1) {
    mismatch |= candidate.charCodeAt(i) ^ pinHash.charCodeAt(i);
  }
  return mismatch === 0;
}
