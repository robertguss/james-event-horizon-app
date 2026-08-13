import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { hostedStackEnabled } from "@/lib/eh/mode";
import { safeAppRedirect } from "../lib/redirect";

const signupSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/signup/$")({
  validateSearch: signupSearchSchema,
  beforeLoad: () => {
    // No ClerkProvider in fixture mode — never mount <SignUp>.
    if (!hostedStackEnabled()) {
      throw redirect({ to: "/hub" });
    }
  },
  component: SignupPage,
});

function SignupPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const forceRedirectUrl = safeAppRedirect(redirectTo);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <SignUp
        path="/signup"
        routing="path"
        signInUrl="/login"
        forceRedirectUrl={forceRedirectUrl}
        fallbackRedirectUrl="/hub"
      />
    </div>
  );
}
