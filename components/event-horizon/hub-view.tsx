import {
  AcademyIcon,
  HangarIcon,
  LibraryIcon,
  MissionsIcon,
} from "@/components/event-horizon/hub-icons";
import { HubChip } from "@/components/event-horizon/hub-chip";
import { XpBadge } from "@/components/event-horizon/xp-badge";

type HubViewProps = {
  displayName: string;
  xpTotal: number;
};

export function HubView({ displayName, xpTotal }: HubViewProps) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-eh-neutral text-eh-on-surface">
      <img
        src="/hub-scene.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-eh-neutral/20 via-transparent to-eh-neutral/35"
        aria-hidden
      />

      <div className="relative z-10 min-h-svh p-4 sm:p-6">
        <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 gap-4 p-4 sm:p-6">
          <div className="pointer-events-auto flex items-start justify-start">
            <HubChip
              to="/missions"
              label="Missions"
              tone="teal"
              icon={<MissionsIcon />}
            />
          </div>
          <div className="pointer-events-auto flex items-start justify-end pt-14">
            <HubChip
              to="/hangar"
              label="Hangar"
              tone="teal"
              icon={<HangarIcon />}
            />
          </div>
          <div className="pointer-events-auto flex items-end justify-start">
            <HubChip
              to="/library"
              label="Library"
              tone="cream"
              icon={<LibraryIcon />}
            />
          </div>
          <div className="pointer-events-auto flex items-end justify-end">
            <HubChip
              to="/academy"
              label="Academy"
              tone="cream"
              icon={<AcademyIcon />}
            />
          </div>
        </div>

        <div className="relative z-20 flex justify-end">
          <XpBadge xpTotal={xpTotal} />
        </div>

        <p className="sr-only">
          Welcome, {displayName}. Explore Missions, Hangar, Library, or Academy.
        </p>
      </div>
    </div>
  );
}
