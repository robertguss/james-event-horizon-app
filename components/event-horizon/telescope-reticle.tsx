import { cn } from "@/lib/utils";

type TelescopeReticleProps = {
  className?: string;
  active?: boolean;
};

/** Soft teal glow telescope prop — CSS only, no WebGL. */
export function TelescopeReticle({ className, active }: TelescopeReticleProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute right-3 bottom-3 flex h-16 w-16 items-end justify-end sm:right-6 sm:bottom-4 sm:h-20 sm:w-20",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 80 80"
        className={cn(
          "h-full w-full drop-shadow-[0_0_12px_rgba(46,196,182,0.55)] transition-opacity duration-300",
          active ? "opacity-100" : "opacity-80",
        )}
      >
        <ellipse cx="40" cy="62" rx="18" ry="6" fill="#2A1F14" opacity="0.45" />
        <path
          d="M28 58 L40 22 L52 58 Z"
          fill="#F0C75E"
          stroke="#2EC4B6"
          strokeWidth="2"
        />
        <circle
          cx="40"
          cy="20"
          r="10"
          fill="#5EEAD4"
          stroke="#2EC4B6"
          strokeWidth="3"
          className={active ? "animate-pulse" : undefined}
        />
        <circle cx="40" cy="20" r="4" fill="#FFF8F0" />
        <line
          x1="34"
          y1="58"
          x2="28"
          y2="70"
          stroke="#2EC4B6"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="46"
          y1="58"
          x2="52"
          y2="70"
          stroke="#2EC4B6"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
