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
        "eh-button-check inline-flex h-12 min-w-[5.5rem] items-center justify-center rounded-full px-5 text-base font-extrabold text-white transition-transform duration-200 ease-out enabled:hover:scale-[1.03] enabled:active:scale-[0.98] disabled:opacity-50",
        className,
      )}
      {...props}
    >
      Check
    </button>
  );
}
