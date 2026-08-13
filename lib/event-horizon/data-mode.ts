export type DataMode = "mock" | "convex";

function readDataModeEnv(): string | undefined {
  if (typeof process !== "undefined" && process.env) {
    return (
      process.env.VITE_EH_DATA_MODE ?? process.env.VITE_EH_DATA ?? undefined
    );
  }
  return undefined;
}

/**
 * Overnight / agent default is mock/fixture so Vitest and UI need no Convex cloud.
 * Mac morning: VITE_EH_DATA_MODE=convex or VITE_EH_DATA=convex (plan §13).
 * Plan alias: VITE_EH_DATA=fixture → mock.
 */
export function getDataMode(
  envValue: string | undefined = typeof import.meta !== "undefined"
    ? (import.meta.env.VITE_EH_DATA_MODE ??
      import.meta.env.VITE_EH_DATA ??
      readDataModeEnv())
    : readDataModeEnv(),
): DataMode {
  if (envValue === "convex") {
    return "convex";
  }
  if (
    envValue === "mock" ||
    envValue === "fixture" ||
    envValue === "fixtures"
  ) {
    return "mock";
  }
  return "mock";
}

export function isMockDataMode(): boolean {
  return getDataMode() === "mock";
}
