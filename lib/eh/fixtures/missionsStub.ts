import type { MissionDetail } from "../types";
import { mission01 } from "./mission01";
import { WEEK_01_MISSIONS } from "./week01";

const STUB_SCORING = mission01.scoring;

const stubHints = (focus: string): [string, string, string, string] => [
  `Look for a sentence about ${focus}.`,
  "Cross out choices that never appear in the transmission.",
  "Keep the choice that matches the passage.",
  "Telescope glow on the key sentence (still require tap).",
];

/** Extra chart stubs — overnight list + morning Convex seed. */
export const missionStubIceRings: MissionDetail = {
  id: "mission_stub_ice_rings",
  title: "Ice Rings Ahead",
  planet: "Glass Halo (Saturn sector)",
  planetId: "glass_halo",
  gradeBand: "3-5",
  kind: "stub",
  estimatedMinutes: 10,
  skillTags: ["main_idea", "locate_evidence"],
  status: "stub",
  objective:
    "Chart the icy rings transmission. Stub overnight — full passage morning.",
  sentences: [
    {
      id: "s1",
      text: "The rings glittered like frozen lace around the planet.",
    },
    { id: "s2", text: "Tiny ice chips drifted past the ship’s windows." },
  ],
  questions: [],
  scoring: STUB_SCORING,
};

export const missionStubCometTrail: MissionDetail = {
  id: "mission_stub_comet_trail",
  title: "Comet Trail Clues",
  planet: "Silver Wake (Kuiper sector)",
  planetId: "silver_wake",
  gradeBand: "3-5",
  kind: "stub",
  estimatedMinutes: 10,
  skillTags: ["vocabulary_in_context", "simple_inference"],
  status: "stub",
  objective:
    "Follow the comet’s dusty trail. Stub overnight — questions land morning.",
  sentences: [
    { id: "s1", text: "A pale comet left a sparkling trail across the dark." },
  ],
  questions: [],
  scoring: STUB_SCORING,
};

/**
 * One gated black-hole stub. Minimal playable for weekly-cap tests;
 * full BH pack is morning / later.
 */
export const missionStubBlackHole: MissionDetail = {
  id: "mission_stub_black_hole",
  title: "Accretion Whisper",
  planet: "Friendly Horizon (Black-hole sector)",
  planetId: "friendly_horizon",
  gradeBand: "3-5",
  kind: "blackHole",
  estimatedMinutes: 12,
  skillTags: ["simple_inference", "locate_evidence"],
  status: "stub",
  objective:
    "Listen at the bright ring. Harder inference treat — rare and gated.",
  sentences: [
    {
      id: "s1",
      text: "A friendly black hole spun with a bright orange-magenta ring.",
    },
    {
      id: "s2",
      text: "The crew watched from a safe distance and mapped the glow.",
    },
    {
      id: "s3",
      text: "They learned the ring’s light helps explorers stay oriented.",
    },
  ],
  questions: [
    {
      id: "q1_bh_main",
      order: 1,
      type: "main_idea_mc",
      xpKind: "question",
      prompt: "What is this transmission mostly about?",
      choices: [
        { id: "A", text: "A scary hole that eats the ship." },
        {
          id: "B",
          text: "A friendly black hole with a bright ring the crew maps.",
        },
        { id: "C", text: "Building a rocket on Earth." },
      ],
      correctChoiceId: "B",
      evidenceRule: "exact",
      correctEvidenceIds: [],
      hints: stubHints("the bright ring"),
    },
    {
      id: "q2_bh_exit",
      order: 2,
      type: "exit_main_idea_mc",
      xpKind: "exit",
      prompt: "What helps explorers stay oriented near the black hole?",
      choices: [
        { id: "A", text: "The ring’s light." },
        { id: "B", text: "Loud alarms only." },
        { id: "C", text: "Turning off all windows." },
      ],
      correctChoiceId: "A",
      evidenceRule: "exact",
      correctEvidenceIds: ["s3"],
      hints: stubHints("ring’s light"),
    },
  ],
  scoring: STUB_SCORING,
};

export const STUB_MISSIONS: readonly MissionDetail[] = [
  missionStubIceRings,
  missionStubCometTrail,
  missionStubBlackHole,
];

/** All published/stub missions known to the fixture catalog. */
export const ALL_FIXTURE_MISSIONS: readonly MissionDetail[] = [
  ...WEEK_01_MISSIONS,
  mission01,
  ...STUB_MISSIONS,
];

export function fixtureMissionById(id: string): MissionDetail | null {
  return ALL_FIXTURE_MISSIONS.find((m) => m.id === id) ?? null;
}
