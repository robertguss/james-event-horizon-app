/// <reference types="vite/client" />
import { ClerkProvider } from "@clerk/tanstack-react-start";
import { ThemeProvider } from "next-themes";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import * as React from "react";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { EhProvider } from "@/lib/eh/data";
import { hostedStackEnabled } from "@/lib/eh/mode";
import { registerServiceWorker } from "@/lib/pwa";
import { ConvexClientProvider } from "../ConvexClientProvider";
import appCss from "../globals.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "Event Horizon" },
      {
        name: "description",
        content: "Read to explore — space reading adventures for grades 3–5",
      },
      { name: "theme-color", content: "#2EC4B6" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Event Horizon" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
});

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientProvider>
      <EhProvider>
        <RootDocument>{children}</RootDocument>
      </EhProvider>
    </ConvexClientProvider>
  );
}

function RootComponent() {
  React.useEffect(() => {
    registerServiceWorker();
  }, []);

  // Binding: do not mount hosted Clerk unless hosted stack is enabled.
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
    string | undefined;

  if (!hostedStackEnabled() || !publishableKey) {
    return (
      <AppShell>
        <Outlet />
      </AppShell>
    );
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInFallbackRedirectUrl={
        import.meta.env.VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? "/hub"
      }
      signUpFallbackRedirectUrl={
        import.meta.env.VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ?? "/hub"
      }
    >
      <AppShell>
        <Outlet />
      </AppShell>
    </ClerkProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {import.meta.env.DEV ? (
          <TanStackRouterDevtools position="bottom-right" />
        ) : null}
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-eh-neutral font-sans text-eh-on-surface">
      <main className="flex w-full max-w-xl flex-col items-center gap-6 px-8 py-24 text-center sm:items-start sm:text-left">
        <p className="text-sm font-semibold tracking-[0.2em] text-eh-primary uppercase">
          404
        </p>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Page not found
          </h1>
          <p className="max-w-md text-lg leading-8 text-eh-on-surface-muted">
            That path is off the map. Head back to the hub or home.
          </p>
        </div>
        <Link to="/hub">
          <Button size="lg" className="rounded-full font-extrabold">
            Back to hub
          </Button>
        </Link>
      </main>
    </div>
  );
}
