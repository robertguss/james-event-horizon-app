import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

import { hostedStackEnabled } from "@/lib/eh/mode";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => {
  return {
    requestMiddleware: hostedStackEnabled()
      ? [csrfMiddleware, clerkMiddleware()]
      : [csrfMiddleware],
  };
});
