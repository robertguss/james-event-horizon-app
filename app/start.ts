import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

import { getDataMode } from "../lib/event-horizon/data-mode";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

const dataMode = getDataMode(
  process.env.VITE_EH_DATA_MODE ?? process.env.VITE_EH_DATA,
);
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
