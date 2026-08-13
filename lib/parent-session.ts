const STORAGE_KEY = "eh.parentUnlocked";

export function isParentUnlocked(): boolean {
  if (typeof sessionStorage === "undefined") {
    return false;
  }
  return sessionStorage.getItem(STORAGE_KEY) === "1";
}

export function unlockParentSession(): void {
  sessionStorage.setItem(STORAGE_KEY, "1");
}

export function clearParentSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
