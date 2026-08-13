import type { EhMode } from "./types";

export type EhEnvBag = {
  VITE_EH_DATA?: string;
  VITE_EH_DATA_MODE?: string;
};

/** Operator-facing message when a production/preview build lacks explicit convex. */
export const PROD_MODE_REQUIRED_MESSAGE =
  "Event Horizon production/preview builds require VITE_EH_DATA=convex. " +
  "Unset, fixture, mock, or typos are not allowed — set VITE_EH_DATA=convex " +
  "and configure Clerk + Convex before starting the app.";

export class EhModeConfigError extends Error {
  constructor(message: string = PROD_MODE_REQUIRED_MESSAGE) {
    super(message);
    this.name = "EhModeConfigError";
  }
}

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

function readEhEnvBag(): EhEnvBag {
  return {
    VITE_EH_DATA: readEnvVar("VITE_EH_DATA"),
    VITE_EH_DATA_MODE: readEnvVar("VITE_EH_DATA_MODE"),
  };
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

/** Vite DEV. Tests may force via VITE_EH_TEST_DEV. */
export function isDevBuild(): boolean {
  if (typeof process !== "undefined") {
    if (process.env.VITE_EH_TEST_DEV === "1") {
      return true;
    }
    if (process.env.VITE_EH_TEST_DEV === "0") {
      return false;
    }
  }
  if (typeof import.meta !== "undefined" && import.meta.env.DEV === true) {
    return true;
  }
  return !isProdBuild();
}

/**
 * Resolve data mode (single SSR/client source).
 * - Explicit `convex` on VITE_EH_DATA or alias VITE_EH_DATA_MODE → convex.
 * - DEV: unset / fixture / mock → fixture.
 * - PROD/preview: only explicit convex is allowed; anything else throws.
 */
export function resolveEhMode(
  env: EhEnvBag,
  options: { prod: boolean },
): EhMode {
  const primary = normalizeModeToken(env.VITE_EH_DATA);
  const alias = normalizeModeToken(env.VITE_EH_DATA_MODE);

  // Either var saying convex wins (mixed → convex).
  if (primary === "convex" || alias === "convex") {
    return "convex";
  }

  if (options.prod) {
    // Refuse to boot: not fixture, not silent convex.
    throw new EhModeConfigError();
  }

  // Non-prod overnight: unset / fixture / unrecognized → fixture.
  return "fixture";
}

export function getEhMode(): EhMode {
  return resolveEhMode(readEhEnvBag(), { prod: isProdBuild() });
}

/** Call at boot (start + root). Throws EhModeConfigError when PROD is misconfigured. */
export function assertEhModeBootable(): void {
  getEhMode();
}

export function isFixtureMode(): boolean {
  return getEhMode() === "fixture";
}

/**
 * Single hosted-stack predicate for Clerk / Convex / auth.
 * True only when mode successfully resolves to convex.
 */
export function hostedStackEnabled(): boolean {
  return getEhMode() === "convex";
}

/** Dev-only fixture PIN helper/prefill (never in production builds). */
export function showFixturePinHint(): boolean {
  return isDevBuild() && isFixtureMode();
}
