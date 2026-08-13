import { useAuth, useUser } from "@clerk/tanstack-react-start";
import { useEffect, type ReactNode } from "react";

import { isMockDataMode } from "./data-mode";
import { useEventHorizon } from "./EventHorizonProvider";

function DemoIdentityBridge({ children }: { children: ReactNode }) {
  const { setIdentity, refreshSetup } = useEventHorizon();
  const demoUserId =
    import.meta.env.VITE_EH_DEMO_CLERK_USER_ID ?? "demo_parent";

  useEffect(() => {
    setIdentity({ clerkUserId: demoUserId });
  }, [demoUserId, setIdentity]);

  useEffect(() => {
    refreshSetup();
  }, [refreshSetup, demoUserId]);

  return children;
}

function ClerkIdentityBridge({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { setIdentity, refreshSetup } = useEventHorizon();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    const clerkUserId = isSignedIn && user?.id ? user.id : null;
    setIdentity({ clerkUserId });
  }, [isLoaded, isSignedIn, user?.id, setIdentity]);

  useEffect(() => {
    refreshSetup();
  }, [refreshSetup]);

  return children;
}

/** Syncs auth identity into the Event Horizon repository layer. */
export function MockAuthBridge({ children }: { children: ReactNode }) {
  if (isMockDataMode()) {
    return <DemoIdentityBridge>{children}</DemoIdentityBridge>;
  }
  return <ClerkIdentityBridge>{children}</ClerkIdentityBridge>;
}
