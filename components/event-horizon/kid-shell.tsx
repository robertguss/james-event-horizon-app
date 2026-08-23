import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type KidShellProps = {
  title: string;
  children: ReactNode;
};

export function KidShell({ title, children }: KidShellProps) {
  return (
    <div className="relative min-h-svh overflow-x-clip bg-eh-neutral text-eh-on-surface">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#C77DFF55,transparent_45%),radial-gradient(circle_at_80%_30%,#E056A055,transparent_40%),linear-gradient(180deg,#1B1430,#241B3D)]"
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <h1 className="min-w-0 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <Link
            to="/hub"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-eh-primary px-5 py-2 text-sm font-extrabold text-eh-on-primary"
          >
            Hub
          </Link>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
