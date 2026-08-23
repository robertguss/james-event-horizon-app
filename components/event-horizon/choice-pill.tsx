import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ChoicePillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  accent: "gold" | "teal";
  label?: string;
};

/** Mid-bar choice pill — gold/teal rhythm matching reader ref five-pill row. */
export function ChoicePill({
  selected,
  accent,
  label,
  className,
  children,
  ...props
}: ChoicePillProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-12 min-w-12 max-w-[9rem] items-center justify-center truncate rounded-full px-3 text-sm font-extrabold transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.98] sm:min-w-[4.5rem] sm:px-4",
        accent === "gold" ? "eh-button-hint" : "eh-button-check text-white",
        selected && "ring-2 ring-white ring-offset-2 ring-offset-eh-neutral",
        className,
      )}
      {...props}
    >
      {children ?? label}
    </button>
  );
}
