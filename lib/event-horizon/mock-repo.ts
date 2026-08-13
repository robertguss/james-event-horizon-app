import { missionFixtures } from "./fixtures/mission-01";
import { assertValidPin, hashPin, verifyPinHash } from "./pin";
import type {
  EventHorizonRepository,
  KidPublic,
  KidRecord,
  MissionAttempt,
  ParentRecord,
  SetupState,
} from "./types";

const DEFAULT_PEPPER = "eh-mock-pepper";

function toKidPublic(kid: KidRecord): KidPublic {
  return {
    id: kid.id,
    displayName: kid.displayName,
    gradeBand: kid.gradeBand,
    xpTotal: kid.xpTotal,
    level: kid.level,
    streakDays: kid.streakDays,
  };
}

export type MockRepoOptions = {
  pepper?: string;
  now?: () => number;
};

export function createMockRepository(
  options: MockRepoOptions = {},
): EventHorizonRepository {
  const pepper = options.pepper ?? DEFAULT_PEPPER;
  const now = options.now ?? (() => Date.now());

  const parents = new Map<string, ParentRecord>();
  const kids = new Map<string, KidRecord>();
  const attempts = new Map<string, MissionAttempt>();
  let seq = 0;
  const nextId = (prefix: string) => {
    seq += 1;
    return `${prefix}_${seq}`;
  };

  const findParentByClerk = (clerkUserId: string) => {
    for (const parent of parents.values()) {
      if (parent.clerkUserId === clerkUserId) {
        return parent;
      }
    }
    return null;
  };

  const findKidByParent = (parentId: string) => {
    for (const kid of kids.values()) {
      if (kid.parentId === parentId) {
        return kid;
      }
    }
    return null;
  };

  return {
    getSetupState(clerkUserId) {
      if (!clerkUserId) {
        return null;
      }
      const parent = findParentByClerk(clerkUserId);
      if (!parent) {
        return { onboarded: false };
      }
      const kid = findKidByParent(parent.id);
      if (!kid) {
        return { onboarded: false };
      }
      return {
        onboarded: true,
        parentId: parent.id,
        kid: toKidPublic(kid),
      } satisfies SetupState;
    },

    async completeOnboarding(input) {
      const displayName = input.displayName.trim();
      if (displayName.length < 1 || displayName.length > 40) {
        throw new Error("Display name must be 1–40 characters");
      }
      assertValidPin(input.pin);
      if (findParentByClerk(input.clerkUserId)) {
        throw new Error("Already onboarded");
      }

      const timestamp = now();
      const parentId = nextId("parent");
      const kidId = nextId("kid");
      const pinHash = await hashPin(input.pin, pepper);

      parents.set(parentId, {
        id: parentId,
        clerkUserId: input.clerkUserId,
        pinHash,
        reminderEnabled: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      kids.set(kidId, {
        id: kidId,
        parentId,
        displayName,
        gradeBand: input.gradeBand,
        xpTotal: 0,
        level: 1,
        streakDays: 0,
        unlockedCosmeticIds: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      return { parentId, kidId };
    },

    async verifyPin(input) {
      const parent = findParentByClerk(input.clerkUserId);
      if (!parent) {
        throw new Error("Parent profile not found");
      }
      const ok = await verifyPinHash(input.pin, parent.pinHash, pepper);
      return { ok };
    },

    async renameKid(input) {
      if (!input.clerkUserId) {
        throw new Error("Not authenticated");
      }
      const parent = findParentByClerk(input.clerkUserId);
      if (!parent) {
        throw new Error("Not authenticated");
      }
      const kid = kids.get(input.kidId);
      if (!kid) {
        throw new Error("Kid not found");
      }
      if (kid.parentId !== parent.id) {
        throw new Error("Unauthorized");
      }
      const displayName = input.displayName.trim();
      if (displayName.length < 1 || displayName.length > 40) {
        throw new Error("Display name must be 1–40 characters");
      }
      const updated: KidRecord = {
        ...kid,
        displayName,
        updatedAt: now(),
      };
      kids.set(kid.id, updated);
      return toKidPublic(updated);
    },

    listMissions() {
      return missionFixtures;
    },

    listAttempts(kidId) {
      return [...attempts.values()].filter(
        (attempt) => attempt.kidId === kidId,
      );
    },
  };
}
