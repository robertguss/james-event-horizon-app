import { hostedStackEnabled } from "./mode";

export const FIXTURE_AUTH_USER_ID = "fixture_parent";

/**
 * Resolve the server user id. Fixture mode may impersonate; hosted stack never
 * returns fixture_parent without a real Clerk session.
 */
export function resolveServerUserId(
  clerkUserId: string | null,
  options?: { hosted?: boolean },
): string | null {
  const hosted = options?.hosted ?? hostedStackEnabled();
  if (!hosted) {
    return FIXTURE_AUTH_USER_ID;
  }
  return clerkUserId;
}
