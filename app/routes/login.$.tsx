import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { hostedStackEnabled } from "@/lib/eh/mode";
import { safeAppRedirect } from "../lib/redirect";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login/$")({
  validateSearch: loginSearchSchema,
  beforeLoad: () => {
    // No ClerkProvider in fixture mode — never mount <SignIn>.
    if (!hostedStackEnabled()) {
      throw redirect({ to: "/hub" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const forceRedirectUrl = safeAppRedirect(redirectTo);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/signup"
        forceRedirectUrl={forceRedirectUrl}
        fallbackRedirectUrl="/hub"
      />
    </div>
  );
}
