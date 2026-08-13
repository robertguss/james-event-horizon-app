import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createMockRepository } from "./mock-repo";
import type {
  EventHorizonRepository,
  GradeBand,
  MissionFixture,
  SetupState,
} from "./types";

type AuthIdentity = {
  clerkUserId: string | null;
};

type EventHorizonContextValue = {
  identity: AuthIdentity;
  setIdentity: (identity: AuthIdentity) => void;
  setup: SetupState | undefined;
  refreshSetup: () => void;
  completeOnboarding: (input: {
    displayName: string;
    gradeBand: GradeBand;
    pin: string;
  }) => Promise<void>;
  verifyPin: (pin: string) => Promise<{ ok: boolean }>;
  listMissions: () => MissionFixture[];
  repository: EventHorizonRepository;
};

const EventHorizonContext = createContext<EventHorizonContextValue | null>(
  null,
);

type ProviderProps = {
  children: ReactNode;
  repository?: EventHorizonRepository;
  initialClerkUserId?: string | null;
};

export function EventHorizonProvider({
  children,
  repository: repositoryProp,
  initialClerkUserId = null,
}: ProviderProps) {
  const repository = useMemo(
    () => repositoryProp ?? createMockRepository(),
    [repositoryProp],
  );
  const [identity, setIdentity] = useState<AuthIdentity>({
    clerkUserId: initialClerkUserId,
  });
  const [setup, setSetup] = useState<SetupState | undefined>(() =>
    repository.getSetupState(initialClerkUserId),
  );

  const refreshSetup = useCallback(() => {
    setSetup(repository.getSetupState(identity.clerkUserId));
  }, [identity.clerkUserId, repository]);

  const completeOnboarding = useCallback(
    async (input: {
      displayName: string;
      gradeBand: GradeBand;
      pin: string;
    }) => {
      if (!identity.clerkUserId) {
        throw new Error("Not authenticated");
      }
      await repository.completeOnboarding({
        clerkUserId: identity.clerkUserId,
        ...input,
      });
      setSetup(repository.getSetupState(identity.clerkUserId));
    },
    [identity.clerkUserId, repository],
  );

  const verifyPin = useCallback(
    async (pin: string) => {
      if (!identity.clerkUserId) {
        throw new Error("Not authenticated");
      }
      return await repository.verifyPin({
        clerkUserId: identity.clerkUserId,
        pin,
      });
    },
    [identity.clerkUserId, repository],
  );

  const listMissions = useCallback(
    () => repository.listMissions(),
    [repository],
  );

  const value = useMemo(
    () => ({
      identity,
      setIdentity,
      setup,
      refreshSetup,
      completeOnboarding,
      verifyPin,
      listMissions,
      repository,
    }),
    [
      identity,
      setup,
      refreshSetup,
      completeOnboarding,
      verifyPin,
      listMissions,
      repository,
    ],
  );

  return (
    <EventHorizonContext.Provider value={value}>
      {children}
    </EventHorizonContext.Provider>
  );
}

export function useEventHorizon(): EventHorizonContextValue {
  const ctx = useContext(EventHorizonContext);
  if (!ctx) {
    throw new Error("useEventHorizon must be used within EventHorizonProvider");
  }
  return ctx;
}
