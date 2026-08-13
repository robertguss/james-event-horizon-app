export type DataMode = "mock" | "convex";

/** Overnight / agent default is mock so Vitest and UI need no Convex cloud. */
export function getDataMode(): DataMode {
  const explicit = import.meta.env.VITE_EH_DATA_MODE;
  if (explicit === "convex") {
    return "convex";
  }
  if (explicit === "mock") {
    return "mock";
  }
  if (!import.meta.env.VITE_CONVEX_URL) {
    return "mock";
  }
  // Prefer mock unless explicitly opting into Convex.
  return "mock";
}

export function isMockDataMode(): boolean {
  return getDataMode() === "mock";
}
