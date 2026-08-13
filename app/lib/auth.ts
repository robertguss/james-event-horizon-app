import { auth } from "@clerk/tanstack-react-start/server";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { safeAppRedirect } from "./redirect";

const dataMode = import.meta.env.VITE_EH_DATA_MODE ?? "mock";
const demoUserId = import.meta.env.VITE_EH_DEMO_CLERK_USER_ID ?? "demo_parent";

export const getAuthUserId = createServerFn({ method: "GET" }).handler(
  async () => {
    if (dataMode !== "convex") {
      return { userId: demoUserId as string | null };
    }
    try {
      const { userId } = await auth();
      return { userId };
    } catch {
      return { userId: null };
    }
  },
);

export async function requireAuth(returnPath: string) {
  const { userId } = await getAuthUserId();
  if (!userId) {
    throw redirect({
      to: "/login/$",
      params: { _splat: "" },
      search: { redirect: safeAppRedirect(returnPath) ?? "/hub" },
    });
  }
  return { userId };
}
