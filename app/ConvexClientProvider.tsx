import { useAuth } from "@clerk/tanstack-react-start";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { type ReactNode } from "react";

import { isFixtureMode } from "@/lib/eh/data";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

let convex: ConvexReactClient | null = null;

function getConvexClient(): ConvexReactClient | null {
  if (isFixtureMode() || !convexUrl) {
    return null;
  }
  if (!convex) {
    convex = new ConvexReactClient(convexUrl);
  }
  return convex;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = getConvexClient();
  if (!client) {
    return children;
  }
  return (
    <ConvexProviderWithClerk client={client} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
