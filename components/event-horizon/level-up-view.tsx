import { Link } from "@tanstack/react-router";

type LevelUpViewProps = {
  level: number;
  previousLevel: number;
  xpTotal: number;
};

/** Dedicated Level Up celebration — CSS/motion only, honors reduced-motion. */
export function LevelUpView({
  level,
  previousLevel,
  xpTotal,
}: LevelUpViewProps) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-eh-neutral text-eh-on-surface">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,#C77DFF77,transparent_45%),radial-gradient(circle_at_70%_30%,#E056A066,transparent_40%),linear-gradient(180deg,#1B1430,#2E2450_50%,#1B1430)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[radial-gradient(ellipse_at_center,#E056A044,transparent_70%)]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center gap-8 px-6 py-10 text-center">
        <div className="eh-level-up-banner inline-flex items-center gap-3 rounded-full border-4 border-eh-tertiary bg-eh-primary px-8 py-3 text-2xl font-extrabold text-white shadow-[0_10px_28px_rgba(11,8,24,0.45)] motion-safe:animate-[popIn_500ms_ease-out]">
          <span aria-hidden className="text-eh-tertiary">
            ★
          </span>
          Level Up
          <span aria-hidden className="text-eh-tertiary">
            ★
          </span>
        </div>

        <div className="motion-safe:animate-[rise_900ms_ease-out]">
          <RocketMark />
        </div>

        <div>
          <p className="text-lg font-bold text-eh-on-surface-muted">
            Explorer advanced
          </p>
          <p className="mt-2 text-4xl font-extrabold text-eh-tertiary">
            Level {previousLevel} → {level}
          </p>
          <p className="mt-2 text-base font-semibold text-eh-on-surface">
            {xpTotal} XP total
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/debrief"
            className="eh-button-check inline-flex h-12 items-center justify-center rounded-full px-6 text-base font-extrabold text-white"
          >
            See debrief
          </Link>
          <Link
            to="/hub"
            className="eh-button-hint inline-flex h-12 items-center justify-center rounded-full px-6 text-base font-extrabold"
          >
            Back to hub
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes rise {
          from { opacity: 0; transform: translateY(24px) rotate(-6deg); }
          to { opacity: 1; transform: translateY(0) rotate(0deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .eh-level-up-banner,
          .motion-safe\\:animate-\\[popIn_500ms_ease-out\\],
          .motion-safe\\:animate-\\[rise_900ms_ease-out\\] {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function RocketMark() {
  return (
    <svg
      viewBox="0 0 160 160"
      className="h-40 w-40 drop-shadow-[0_12px_24px_rgba(240,199,94,0.35)]"
      aria-hidden
    >
      <path
        d="M40 120 C70 90, 100 60, 130 40"
        stroke="url(#trail)"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
        opacity="0.9"
      />
      <defs>
        <linearGradient id="trail" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF6B8A" />
          <stop offset="35%" stopColor="#F0C75E" />
          <stop offset="65%" stopColor="#3DDC97" />
          <stop offset="100%" stopColor="#2EC4B6" />
        </linearGradient>
      </defs>
      <ellipse
        cx="108"
        cy="52"
        rx="22"
        ry="36"
        fill="#F4F0FF"
        transform="rotate(35 108 52)"
      />
      <circle
        cx="108"
        cy="48"
        r="10"
        fill="#2EC4B6"
        stroke="#F0C75E"
        strokeWidth="3"
      />
      <path d="M92 70 L108 95 L124 70 Z" fill="#F0C75E" />
    </svg>
  );
}
