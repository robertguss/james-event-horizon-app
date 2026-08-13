import type { MissionDetail } from "../types";

/** Seeded verbatim from docs/missions/mission-01.md + plan §9. */
export const mission01: MissionDetail = {
  id: "mission_01_mars_dust",
  title: "Dust Storm on Mars",
  planet: "Rusty Ridge (Mars sector)",
  planetId: "rusty_ridge",
  gradeBand: "3-5",
  estimatedMinutes: 10,
  skillTags: [
    "locate_evidence",
    "main_idea",
    "vocabulary_in_context",
    "simple_inference",
  ],
  status: "published",
  objective:
    "Scan the Mars transmission. Use your telescope to find the clues that prove what the dust storm did.",
  sentences: [
    { id: "s1", text: "Maya’s rover rolled across the red sand of Mars." },
    { id: "s2", text: "The sky looked pale and calm at first." },
    { id: "s3", text: "Then a wall of dust rose in the distance." },
    {
      id: "s4",
      text: "The wind grew stronger and pushed grit against the rover’s cameras.",
    },
    { id: "s5", text: "Maya could not see the rocks ahead." },
    { id: "s6", text: "She parked the rover and waited inside." },
    {
      id: "s7",
      text: "After two hours, the air cleared enough to drive again.",
    },
    {
      id: "s8",
      text: "Maya learned that dust storms on Mars can stop a trip for a while, but they do not last forever.",
    },
  ],
  questions: [
    {
      id: "q1_locate_wall",
      order: 1,
      type: "locate",
      xpKind: "question",
      prompt: "Which sentence shows when the dust storm **first appeared**?",
      evidenceRule: "exact",
      correctEvidenceIds: ["s3"],
      distractorTraps: ["s4", "s2", "s7"],
      hints: [
        "Look near the beginning — something in the sky **changes**.",
        "Find the sentence where the dust **shows up**, not where it bothers the cameras.",
        "It’s one of these ideas: the calm sky · **a wall of dust rises** · grit on the cameras. Which one is the *start*?",
        "Telescope glow on the wall-of-dust sentence (still require tap).",
      ],
    },
    {
      id: "q2_main_idea",
      order: 2,
      type: "main_idea_mc",
      xpKind: "question",
      prompt: "What is this transmission mostly about?",
      choices: [
        { id: "A", text: "Maya builds a new rover on Earth." },
        {
          id: "B",
          text: "A dust storm pauses Maya’s drive on Mars, then she continues.",
        },
        { id: "C", text: "Mars has more oceans than Earth." },
      ],
      correctChoiceId: "B",
      evidenceRule: "exact",
      correctEvidenceIds: [],
      hints: [
        "Ask: what happens from start to finish?",
        "Cross out choices that never appear in the transmission.",
        "Keep the choice that includes **storm → wait → drive again**.",
        "Soft highlight the whole transmission; still require your Check.",
      ],
    },
    {
      id: "q3_vocab_grit",
      order: 3,
      type: "vocab_in_context_mc",
      xpKind: "question",
      prompt: "In the sentence about the cameras, what does **grit** mean?",
      stemSentenceId: "s4",
      choices: [
        { id: "A", text: "Tiny bits of sand and dust" },
        { id: "B", text: "A brave feeling" },
        { id: "C", text: "A soft blanket" },
      ],
      correctChoiceId: "A",
      evidenceRule: "exact",
      correctEvidenceIds: ["s4"],
      hints: [
        "Reread the camera sentence. What is the wind pushing?",
        "In a dust storm, what tiny stuff would hit a camera?",
        "Courage is another meaning of “grit,” but does that fit **pushed against cameras**?",
        "Spotlight the cameras sentence; still require your Check.",
      ],
    },
    {
      id: "q4_infer_why_park",
      order: 4,
      type: "infer_mc",
      xpKind: "question",
      prompt: "Why did Maya park the rover?",
      choices: [
        { id: "A", text: "She wanted to take a nap for fun." },
        {
          id: "B",
          text: "She could not see safely, so she waited for the storm to ease.",
        },
        { id: "C", text: "The rover ran out of snacks." },
      ],
      correctChoiceId: "B",
      evidenceRule: "anyOf",
      correctEvidenceIds: ["s5", "s6"],
      requiresChoiceAndEvidence: true,
      hints: [
        "What problem did Maya have right before she parked?",
        "Connect “could not see” with what she did next.",
        "Evidence is probably the seeing problem or the parking sentence — not the “two hours later” sentence alone.",
        "Glow the seeing / parking sentences; still require choice + evidence tap.",
      ],
    },
    {
      id: "q5_exit_ticket",
      order: 5,
      type: "exit_main_idea_mc",
      xpKind: "exit",
      prompt:
        "Chart this planet: What should explorers remember about Mars dust storms from this report?",
      choices: [
        {
          id: "A",
          text: "They can block a trip for a time, but they end and travel can start again.",
        },
        { id: "B", text: "They melt the rover’s wheels every time." },
        { id: "C", text: "They only happen on Earth." },
      ],
      correctChoiceId: "A",
      evidenceRule: "exact",
      correctEvidenceIds: ["s8"],
      hints: [
        "What lesson does the last sentence teach?",
        "Do storms here destroy everything forever, or pause a trip?",
        "Match the choice to “stop for a while” / “do not last forever.”",
        "Glow the last sentence; still require your Check.",
      ],
    },
  ],
  scoring: {
    questionXp: { 0: 20, 1: 14, 2: 10, 3: 6 },
    exitTicketXp: 25,
    missionCompleteXp: 15,
    firstDailyXp: 20,
  },
};
