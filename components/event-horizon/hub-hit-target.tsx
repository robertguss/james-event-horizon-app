import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

type HubHitTargetProps = {
  to: "/missions" | "/hangar" | "/library" | "/academy";
  label: string;
  className?: string;
};

/** Transparent interactive overlay aligned to SoT corner cards in 03-home-hub.jpeg. */
export function HubHitTarget({ to, label, className }: HubHitTargetProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={cn(
        "absolute z-10 min-h-[48px] min-w-[48px] rounded-[28px] outline-none transition-[box-shadow,transform] active:scale-[0.98]",
        "focus-visible:ring-4 focus-visible:ring-eh-tertiary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "hover:bg-white/5",
        className,
      )}
    />
  );
}
