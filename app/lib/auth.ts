import { auth } from "@clerk/tanstack-react-start/server";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { hostedStackEnabled } from "@/lib/eh/mode";
import { resolveServerUserId } from "@/lib/eh/serverUser";
import { safeAppRedirect } from "./redirect";

export { resolveServerUserId } from "@/lib/eh/serverUser";

export const getAuthUserId = createServerFn({ method: "GET" }).handler(
  async () => {
    if (!hostedStackEnabled()) {
      return { userId: resolveServerUserId(null) };
    }
    try {
      const { userId } = await auth();
      return { userId: resolveServerUserId(userId) };
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
