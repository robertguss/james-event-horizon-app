import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

const dataMode = process.env.VITE_EH_DATA_MODE ?? "mock";
const clerkKey = process.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";
const clerkReady =
  dataMode === "convex" &&
  clerkKey.startsWith("pk_") &&
  !clerkKey.includes("placeholder");

export const startInstance = createStart(() => {
  return {
    requestMiddleware: clerkReady
      ? [csrfMiddleware, clerkMiddleware()]
      : [csrfMiddleware],
  };
});
