import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

import { isFixtureMode } from "@/lib/eh/data";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

const clerkKey = process.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";
const clerkReady =
  !isFixtureMode() &&
  clerkKey.startsWith("pk_") &&
  !clerkKey.includes("placeholder");

export const startInstance = createStart(() => {
  return {
    requestMiddleware: clerkReady
      ? [csrfMiddleware, clerkMiddleware()]
      : [csrfMiddleware],
  };
});
