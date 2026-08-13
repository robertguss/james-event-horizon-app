import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

import { assertEhModeBootable, hostedStackEnabled } from "@/lib/eh/mode";

// PROD without VITE_EH_DATA=convex must refuse to boot (clear operator error).
assertEhModeBootable();

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => {
  return {
    requestMiddleware: hostedStackEnabled()
      ? [
          csrfMiddleware,
          clerkMiddleware({
            secretKey: process.env["CLERK_SECRET_KEY"],
            publishableKey: process.env["VITE_CLERK_PUBLISHABLE_KEY"],
          }),
        ]
      : [csrfMiddleware],
  };
});
