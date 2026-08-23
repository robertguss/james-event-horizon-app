import { useNavigate } from "@tanstack/react-router";
import { Settings2, Star } from "lucide-react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

type XpBadgeProps = {
  xpTotal: number;
  className?: string;
};

const LONG_PRESS_MS = 650;

export function XpBadge({ xpTotal, className }: XpBadgeProps) {
  const navigate = useNavigate();
  const timerRef = useRef<number | null>(null);

  const goParentGate = () => {
    void navigate({ to: "/parent/gate" });
  };

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-eh-surface-elevated px-4 py-2 text-eh-tertiary shadow-[0_8px_24px_rgba(0,0,0,0.45)] ring-2 ring-eh-tertiary/50"
        aria-label={`${xpTotal} experience points. Press and hold for parent area.`}
        onPointerDown={() => {
          clearTimer();
          timerRef.current = window.setTimeout(goParentGate, LONG_PRESS_MS);
        }}
        onPointerUp={clearTimer}
        onPointerLeave={clearTimer}
        onPointerCancel={clearTimer}
      >
        <Star
          className="size-5 fill-eh-tertiary text-eh-tertiary"
          aria-hidden
        />
        <span className="font-extrabold tabular-nums">{xpTotal} XP</span>
      </button>
      <button
        type="button"
        onClick={goParentGate}
        className="grid size-12 place-items-center rounded-full bg-eh-surface/70 text-eh-on-surface-muted ring-1 ring-eh-border-glass"
        aria-label="Parent settings"
      >
        <Settings2 className="size-4" />
      </button>
    </div>
  );
}
