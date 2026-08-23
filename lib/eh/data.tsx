import { useConvex, useConvexAuth } from "convex/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createConvexAdapter,
  type ConvexEhClient,
} from "./adapters/convexAdapter";
import { fixtureAdapter } from "./adapters/fixtureAdapter";
import { FIXTURE_PARENT_PIN } from "./auth/fixtureAuth";
import { getEhMode, hostedStackEnabled } from "./mode";
import type {
  CompleteOnboardingInput,
  EhData,
  EhKid,
  EhMode,
  MissionSummary,
} from "./types";

export type {
  CompleteOnboardingInput,
  EhData,
  EhKid,
  EhMode,
  EquipCosmeticInput,
  MissionSummary,
  ParentRecording,
  ParentStats,
} from "./types";
export { FIXTURE_PARENT_PIN } from "./auth/fixtureAuth";
export {
  resetFixture,
  seedFixtureWrongAnswers,
} from "./adapters/fixtureAdapter";
export { createConvexAdapter } from "./adapters/convexAdapter";
export {
  assertEhModeBootable,
  getEhMode,
  hostedStackEnabled,
  isFixtureMode,
  isProdBuild,
  showFixturePinHint,
} from "./mode";

/**
 * Sole factory for product data outside React.
 * Fixture mode returns the in-memory adapter. Convex mode requires
 * createConvexAdapter(useConvex()) via EhProvider — do not call this
 * for live I/O without an injected client.
 */
export function getEhData(): EhData {
  return getEhMode() === "convex"
    ? createConvexAdapter({
        query: async () => {
          throw new Error(
            "getEhData(convex): use useEh().data from EhProvider (injected Convex client)",
          );
        },
        mutation: async () => {
          throw new Error(
            "getEhData(convex): use useEh().data from EhProvider (injected Convex client)",
          );
        },
        action: async () => {
          throw new Error(
            "getEhData(convex): use useEh().data from EhProvider (injected Convex client)",
          );
        },
      })
    : fixtureAdapter;
}

type EhContextValue = {
  mode: EhMode;
  ready: boolean;
  kid: EhKid | null;
  missions: MissionSummary[];
  refresh: () => Promise<void>;
  ensureKid: (input?: {
    displayName: string;
    gradeBand: "3-5";
  }) => Promise<EhKid>;
  completeOnboarding: (input: CompleteOnboardingInput) => Promise<EhKid>;
  verifyPin: (pin: string) => Promise<boolean>;
  data: EhData;
};

const EhContext = createContext<EhContextValue | null>(null);

function useEhState(
  data: EhData,
  authenticated: boolean | null = true,
): EhContextValue {
  const [ready, setReady] = useState(false);
  const [kid, setKid] = useState<EhKid | null>(null);
  const [missions, setMissions] = useState<MissionSummary[]>([]);

  const refresh = useCallback(async () => {
    if (data.mode === "fixture" && data.auth.fixtureSignInAsParent) {
      await data.auth.fixtureSignInAsParent();
    }
    const session = await data.auth.getSession();
    const kids = await data.kids.list();
    const active =
      (session.activeKidId
        ? kids.find((entry) => entry.id === session.activeKidId)
        : null) ??
      kids[0] ??
      null;
    setKid(active);
    setMissions(await data.missions.list());
    setReady(true);
  }, [data]);

  useEffect(() => {
    if (authenticated === null) {
      setReady(false);
      return;
    }
    void refresh();
  }, [authenticated, refresh]);

  const ensureKid = useCallback(
    async (input?: { displayName: string; gradeBand: "3-5" }) => {
      const kids = await data.kids.list();
      if (kids[0]) {
        setKid(kids[0]);
        return kids[0];
      }
      const created = await data.kids.create(
        input ?? { displayName: "James", gradeBand: "3-5" },
      );
      setKid(created);
      return created;
    },
    [data],
  );

  const completeOnboarding = useCallback(
    async (input: CompleteOnboardingInput) => {
      const kidResult = await data.setup.complete(input);
      setKid(kidResult);
      return kidResult;
    },
    [data],
  );

  const verifyPin = useCallback(
    async (pin: string) => data.parent.verifyPin(pin),
    [data],
  );

  return useMemo(
    () => ({
      mode: data.mode,
      ready,
      kid,
      missions,
      refresh,
      ensureKid,
      completeOnboarding,
      verifyPin,
      data,
    }),
    [
      data,
      ready,
      kid,
      missions,
      refresh,
      ensureKid,
      completeOnboarding,
      verifyPin,
    ],
  );
}

/** Fixture path — never calls useConvex (provider not mounted). */
function FixtureEhProvider({ children }: { children: ReactNode }) {
  const value = useEhState(fixtureAdapter);
  return <EhContext.Provider value={value}>{children}</EhContext.Provider>;
}

/** Hosted path — must render under ConvexProviderWithClerk. */
function ConvexEhProvider({ children }: { children: ReactNode }) {
  const convex = useConvex();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const data = useMemo(
    () => createConvexAdapter(convex as unknown as ConvexEhClient),
    [convex],
  );
  const value = useEhState(data, isLoading ? null : isAuthenticated);
  return <EhContext.Provider value={value}>{children}</EhContext.Provider>;
}

export function EhProvider({ children }: { children: ReactNode }) {
  if (hostedStackEnabled()) {
    return <ConvexEhProvider>{children}</ConvexEhProvider>;
  }
  return <FixtureEhProvider>{children}</FixtureEhProvider>;
}

/** React access to EhData. Routes/components import this from `lib/eh/data` only. */
export function useEh(): EhContextValue {
  const ctx = useContext(EhContext);
  if (!ctx) {
    throw new Error("useEh must be used within EhProvider");
  }
  return ctx;
}

/** @deprecated alias — prefer FIXTURE_PARENT_PIN from this module */
export const DEV_FIXTURE_PIN = FIXTURE_PARENT_PIN;
