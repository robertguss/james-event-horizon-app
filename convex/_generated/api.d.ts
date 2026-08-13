/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as grokPrompt from "../grokPrompt.js";
import type * as hintContext from "../hintContext.js";
import type * as hintRequests from "../hintRequests.js";
import type * as hints from "../hints.js";
import type * as http from "../http.js";
import type * as kids from "../kids.js";
import type * as lib_gradeBand from "../lib/gradeBand.js";
import type * as lib_hintCaps from "../lib/hintCaps.js";
import type * as lib_hintLeak from "../lib/hintLeak.js";
import type * as lib_kidPublic from "../lib/kidPublic.js";
import type * as lib_missionCatalog from "../lib/missionCatalog.js";
import type * as lib_parents from "../lib/parents.js";
import type * as lib_pin from "../lib/pin.js";
import type * as lib_validators from "../lib/validators.js";
import type * as lib_xaiHint from "../lib/xaiHint.js";
import type * as parents from "../parents.js";
import type * as seed from "../seed.js";
import type * as setup from "../setup.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  grokPrompt: typeof grokPrompt;
  hintContext: typeof hintContext;
  hintRequests: typeof hintRequests;
  hints: typeof hints;
  http: typeof http;
  kids: typeof kids;
  "lib/gradeBand": typeof lib_gradeBand;
  "lib/hintCaps": typeof lib_hintCaps;
  "lib/hintLeak": typeof lib_hintLeak;
  "lib/kidPublic": typeof lib_kidPublic;
  "lib/missionCatalog": typeof lib_missionCatalog;
  "lib/parents": typeof lib_parents;
  "lib/pin": typeof lib_pin;
  "lib/validators": typeof lib_validators;
  "lib/xaiHint": typeof lib_xaiHint;
  parents: typeof parents;
  seed: typeof seed;
  setup: typeof setup;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
