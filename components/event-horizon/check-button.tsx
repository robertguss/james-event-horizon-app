import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type CheckButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** Primary teal CTA — label is Check (not Scan). */
export function CheckButton({
  className,
  disabled,
  ...props
}: CheckButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "eh-button-check inline-flex h-12 min-w-16 items-center justify-center rounded-full px-2 text-base font-extrabold text-white transition-transform duration-200 ease-out enabled:hover:scale-[1.03] enabled:active:scale-[0.98] disabled:opacity-50 min-[360px]:min-w-20 min-[360px]:px-4 sm:min-w-[5.5rem] sm:px-5",
        className,
      )}
      {...props}
    >
      Check
    </button>
  );
}
