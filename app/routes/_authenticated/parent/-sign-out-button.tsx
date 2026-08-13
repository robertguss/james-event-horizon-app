import { SignOutButton } from "@clerk/tanstack-react-start";

import { Button } from "@/components/ui/button";
import { clearParentSession } from "@/lib/parent-session";

export function ParentSignOutButton() {
  return (
    <SignOutButton redirectUrl="/">
      <Button
        variant="outline"
        className="h-14 w-full rounded-full font-extrabold"
        onClick={() => {
          clearParentSession();
        }}
      >
        Sign out
      </Button>
    </SignOutButton>
  );
}
