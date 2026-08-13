import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ReadingCardProps = {
  children: ReactNode;
  className?: string;
};

/** Teal + gold framed cream reading panel (DESIGN.md reading-panel). */
export function ReadingCard({ children, className }: ReadingCardProps) {
  return (
    <div
      className={cn(
        "eh-reading-card w-full max-w-2xl rounded-[36px] px-6 py-7 sm:px-8 sm:py-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
