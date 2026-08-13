import {
  FIXTURE_KID_ID,
  FIXTURE_KID_NAME,
  FIXTURE_PARENT_ID,
  FIXTURE_PARENT_PIN,
  fixtureSignInAsParent,
  getFixtureSession,
} from "../auth/fixtureAuth";
import { mission01 } from "../fixtures/mission01";
import type { EhData, EhKid } from "../types";

type Store = {
  pin: string;
  kids: Map<string, EhKid>;
};

const globalStore = globalThis as typeof globalThis & {
  __ehFixtureStore?: Store;
};

function getStore(): Store {
  if (!globalStore.__ehFixtureStore) {
    const kids = new Map<string, EhKid>();
    kids.set(FIXTURE_KID_ID, {
      id: FIXTURE_KID_ID,
      displayName: FIXTURE_KID_NAME,
      gradeBand: "3-5",
      xp: 0,
      level: 1,
      streakDays: 0,
      unlocks: [],
    });
    globalStore.__ehFixtureStore = {
      pin: FIXTURE_PARENT_PIN,
      kids,
    };
  }
  return globalStore.__ehFixtureStore;
}

/** Reset in-memory fixture state (tests). */
export function resetFixtureAdapter(): void {
  globalStore.__ehFixtureStore = undefined;
}

export const fixtureAdapter: EhData = {
  mode: "fixture",
  auth: {
    async getSession() {
      return getFixtureSession();
    },
    async fixtureSignInAsParent() {
      await fixtureSignInAsParent();
    },
    async selectKid(kidId) {
      const store = getStore();
      if (!store.kids.has(kidId)) {
        throw new Error("Kid not found");
      }
      const session = await getFixtureSession();
      await fixtureSignInAsParent();
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(
          "eh.fixture.session",
          JSON.stringify({
            signedIn: true,
            parentId: session.parentId ?? FIXTURE_PARENT_ID,
            activeKidId: kidId,
          }),
        );
      }
    },
  },
  kids: {
    async list() {
      return [...getStore().kids.values()];
    },
    async get(kidId) {
      return getStore().kids.get(kidId) ?? null;
    },
    async create(input) {
      const store = getStore();
      const existing = store.kids.get(FIXTURE_KID_ID);
      if (existing) {
        return existing;
      }
      const kid: EhKid = {
        id: FIXTURE_KID_ID,
        displayName: input.displayName.trim() || FIXTURE_KID_NAME,
        gradeBand: input.gradeBand,
        xp: 0,
        level: 1,
        streakDays: 0,
        unlocks: [],
      };
      store.kids.set(kid.id, kid);
      return kid;
    },
  },
  missions: {
    async list() {
      return [
        {
          id: mission01.id,
          title: mission01.title,
          planet: mission01.planet,
          gradeBand: mission01.gradeBand,
          estimatedMinutes: mission01.estimatedMinutes,
          objective: mission01.objective,
        },
      ];
    },
    async get(missionId) {
      if (missionId !== mission01.id) {
        return null;
      }
      return mission01;
    },
  },
  attempts: {
    async getActive() {
      return null;
    },
  },
  parent: {
    async verifyPin(pin) {
      return pin === getStore().pin;
    },
    async setPin(pin) {
      if (!/^\d{4,6}$/.test(pin)) {
        throw new Error("PIN must be 4–6 digits");
      }
      getStore().pin = pin;
    },
    async progress(kidId) {
      const kid = getStore().kids.get(kidId);
      if (!kid) {
        throw new Error("Kid not found");
      }
      return {
        kidId: kid.id,
        displayName: kid.displayName,
        xp: kid.xp,
        level: kid.level,
        streakDays: kid.streakDays,
        missionsCompleted: 0,
      };
    },
  },
};
