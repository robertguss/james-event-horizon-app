import type { EhMode } from "./types";

export type EhEnvBag = {
  VITE_EH_DATA?: string;
  VITE_EH_DATA_MODE?: string;
};

function normalizeModeToken(value: string | undefined): EhMode | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }
  if (value === "convex") {
    return "convex";
  }
  // fixture + legacy mock alias
  if (value === "fixture" || value === "mock") {
    return "fixture";
  }
  return undefined;
}

function readEnvVar(name: keyof EhEnvBag): string | undefined {
  if (
    typeof process !== "undefined" &&
    Object.prototype.hasOwnProperty.call(process.env, name)
  ) {
    return process.env[name];
  }
  if (typeof import.meta !== "undefined") {
    const meta = (import.meta.env as Record<string, string | undefined>)[name];
    if (typeof meta === "string") {
      return meta;
    }
  }
  return undefined;
}

/** True for production/preview builds. Tests may force via VITE_EH_TEST_PROD. */
export function isProdBuild(): boolean {
  if (typeof process !== "undefined") {
    if (process.env.VITE_EH_TEST_PROD === "1") {
      return true;
    }
    if (process.env.VITE_EH_TEST_PROD === "0") {
      return false;
    }
  }
  if (typeof import.meta !== "undefined" && import.meta.env.PROD === true) {
    return true;
  }
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return true;
  }
  return false;
}

/**
 * Resolve data mode.
 * - Explicit `convex` on VITE_EH_DATA or alias VITE_EH_DATA_MODE wins (fail-closed).
 * - Explicit fixture/mock → fixture.
 * - Unset: DEV → fixture (overnight); PROD/preview → convex (not fixture).
 */
export function resolveEhMode(
  env: EhEnvBag,
  options: { prod: boolean },
): EhMode {
  const primary = normalizeModeToken(env.VITE_EH_DATA);
  const alias = normalizeModeToken(env.VITE_EH_DATA_MODE);

  // Last explicit convex wins when either var says convex (mixed → convex).
  if (primary === "convex" || alias === "convex") {
    return "convex";
  }
  if (primary === "fixture" || alias === "fixture") {
    return "fixture";
  }

  // Unset / typo: never fixture in production/preview.
  return options.prod ? "convex" : "fixture";
}

export function getEhMode(): EhMode {
  return resolveEhMode(
    {
      VITE_EH_DATA: readEnvVar("VITE_EH_DATA"),
      VITE_EH_DATA_MODE: readEnvVar("VITE_EH_DATA_MODE"),
    },
    { prod: isProdBuild() },
  );
}

export function isFixtureMode(): boolean {
  return getEhMode() === "fixture";
}

/**
 * Single hosted-stack predicate for Clerk / Convex / auth.
 * True only when mode is convex (PROD unset included). Fixture never hosts.
 */
export function hostedStackEnabled(): boolean {
  return getEhMode() === "convex";
}
