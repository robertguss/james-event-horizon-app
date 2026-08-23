import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type HintButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** GOLD assist per DESIGN.md button-hint — never teal. */
export function HintButton({ className, disabled, ...props }: HintButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "eh-button-hint inline-flex h-12 min-w-16 items-center justify-center rounded-full px-2 text-base font-extrabold transition-transform duration-200 ease-out enabled:hover:scale-[1.03] enabled:active:scale-[0.98] disabled:opacity-50 min-[360px]:min-w-20 min-[360px]:px-4 sm:min-w-[5.5rem] sm:px-5",
        className,
      )}
      {...props}
    >
      Hint
    </button>
  );
}
