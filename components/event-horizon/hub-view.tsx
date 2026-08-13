import { HubHitTarget } from "@/components/event-horizon/hub-hit-target";
import { XpBadge } from "@/components/event-horizon/xp-badge";

type HubViewProps = {
  displayName: string;
  xpTotal: number;
};

/**
 * Home hub chrome matches docs/design-refs/03-home-hub.jpeg (VISUAL-SOT).
 * Full-bleed SoT still + corner hit-targets; XP badge is Slice 1 overlay (not in JPEG).
 */
export function HubView({ displayName, xpTotal }: HubViewProps) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-eh-neutral text-eh-on-surface">
      <img
        src="/hub-scene.jpeg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="relative z-10 min-h-svh">
        {/* Corner hit-targets over SoT jelly cards (TL/TR teal, BL/BR cream). */}
        <HubHitTarget
          to="/missions"
          label="Missions"
          className="top-[3%] left-[2.5%] h-[26%] w-[22%] max-w-[220px] sm:top-[4%] sm:left-[3%]"
        />
        <HubHitTarget
          to="/hangar"
          label="Hangar"
          className="top-[3%] right-[2.5%] h-[26%] w-[22%] max-w-[220px] sm:top-[4%] sm:right-[3%]"
        />
        <HubHitTarget
          to="/library"
          label="Library"
          className="bottom-[3%] left-[2.5%] h-[26%] w-[22%] max-w-[220px] sm:bottom-[4%] sm:left-[3%]"
        />
        <HubHitTarget
          to="/academy"
          label="Academy"
          className="bottom-[3%] right-[2.5%] h-[26%] w-[22%] max-w-[220px] sm:bottom-[4%] sm:right-[3%]"
        />

        <div className="absolute top-3 right-3 z-20 sm:top-4 sm:right-4">
          <XpBadge xpTotal={xpTotal} />
        </div>

        <p className="sr-only">
          Welcome, {displayName}. Home hub: Missions top left, Hangar top right,
          Library bottom left, Academy bottom right.
        </p>
      </div>
    </div>
  );
}
