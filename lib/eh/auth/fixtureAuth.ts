import type { EhSession } from "../types";

const SESSION_KEY = "eh.fixture.session";

/** Dev-only fixture PIN (never use in production). */
export const FIXTURE_PARENT_PIN = "1234";

export const FIXTURE_PARENT_ID = "parent_fixture";
export const FIXTURE_KID_ID = "kid_james";
export const FIXTURE_KID_NAME = "James";

export type FixtureSession = EhSession & {
  signedIn: boolean;
};

export function readFixtureSession(): FixtureSession {
  if (typeof sessionStorage === "undefined") {
    return {
      signedIn: true,
      parentId: FIXTURE_PARENT_ID,
      activeKidId: FIXTURE_KID_ID,
    };
  }
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    return {
      signedIn: true,
      parentId: FIXTURE_PARENT_ID,
      activeKidId: FIXTURE_KID_ID,
    };
  }
  try {
    return JSON.parse(raw) as FixtureSession;
  } catch {
    return {
      signedIn: true,
      parentId: FIXTURE_PARENT_ID,
      activeKidId: FIXTURE_KID_ID,
    };
  }
}

export function writeFixtureSession(session: FixtureSession): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Skips live Clerk. Ensures a signed-in fixture parent with James selected. */
export async function fixtureSignInAsParent(): Promise<FixtureSession> {
  const session: FixtureSession = {
    signedIn: true,
    parentId: FIXTURE_PARENT_ID,
    activeKidId: FIXTURE_KID_ID,
  };
  writeFixtureSession(session);
  return session;
}

export async function getFixtureSession(): Promise<EhSession> {
  const session = readFixtureSession();
  if (!session.signedIn) {
    return fixtureSignInAsParent();
  }
  return {
    parentId: session.parentId,
    activeKidId: session.activeKidId,
  };
}
