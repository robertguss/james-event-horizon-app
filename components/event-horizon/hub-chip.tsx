import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type HubChipTone = "teal" | "cream";

type HubChipProps = {
  to: "/missions" | "/hangar" | "/library" | "/academy";
  label: string;
  tone: HubChipTone;
  icon: ReactNode;
  className?: string;
};

export function HubChip({ to, label, tone, icon, className }: HubChipProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group relative flex min-h-16 min-w-[9.5rem] items-center gap-3 rounded-[28px] px-4 py-3 text-left outline-none transition-transform active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-eh-tertiary/70",
        tone === "teal"
          ? "eh-jelly-teal text-white"
          : "eh-jelly-cream text-eh-on-secondary",
        className,
      )}
      aria-label={label}
    >
      <span
        className="grid size-12 place-items-center drop-shadow-sm"
        aria-hidden
      >
        {icon}
      </span>
      <span className="flex flex-1 flex-col">
        <span
          className={cn(
            "text-lg font-extrabold leading-tight tracking-tight drop-shadow-sm",
            tone === "teal" ? "text-white" : "text-eh-on-secondary",
          )}
        >
          {label}
        </span>
      </span>
      <span
        className={cn(
          "pr-1 font-extrabold tracking-widest",
          tone === "teal" ? "text-white/90" : "text-eh-on-secondary/80",
        )}
        aria-hidden
      >
        {">>>"}
      </span>
      <span
        className="absolute bottom-1.5 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-eh-tertiary shadow-[0_0_8px_var(--eh-tertiary-glow)]"
        aria-hidden
      />
    </Link>
  );
}
