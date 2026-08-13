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
        "eh-button-hint inline-flex h-12 min-w-[5.5rem] items-center justify-center rounded-full px-5 text-base font-extrabold transition-transform duration-200 ease-out enabled:hover:scale-[1.03] enabled:active:scale-[0.98] disabled:opacity-50",
        className,
      )}
      {...props}
    >
      Hint
    </button>
  );
}
