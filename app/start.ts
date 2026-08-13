import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createStart } from "@tanstack/react-start";
import { isFixtureMode } from "@/lib/eh/data";

const requestMiddleware = isFixtureMode() ? [] : [clerkMiddleware()];

export const startInstance = createStart(() => {
  return {
    requestMiddleware,
  };
});
