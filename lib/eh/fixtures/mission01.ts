import type { MissionDetail } from "../types";

/** Seeded from docs/missions/mission-01.md — content only; no runtime in Slice 1. */
export const mission01: MissionDetail = {
  id: "mission_01_mars_dust",
  title: "Dust Storm on Mars",
  planet: "Rusty Ridge (Mars sector)",
  gradeBand: "3-5",
  estimatedMinutes: 10,
  skillTags: [
    "locate_evidence",
    "main_idea",
    "vocabulary_in_context",
    "simple_inference",
  ],
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
      type: "locate",
      prompt: "Which sentence shows when the dust storm first appeared?",
      correct: "s3",
    },
    {
      id: "q2_main_idea",
      type: "main_idea_mc",
      prompt: "What is this transmission mostly about?",
      choices: [
        { id: "A", text: "Maya builds a new rover on Earth." },
        {
          id: "B",
          text: "A dust storm pauses Maya’s drive on Mars, then she continues.",
        },
        { id: "C", text: "Mars has more oceans than Earth." },
      ],
      correct: "B",
    },
    {
      id: "q3_vocab_grit",
      type: "vocab_in_context_mc",
      prompt: "In the sentence about the cameras, what does grit mean?",
      stemSentenceId: "s4",
      choices: [
        { id: "A", text: "Tiny bits of sand and dust" },
        { id: "B", text: "A brave feeling" },
        { id: "C", text: "A soft blanket" },
      ],
      correct: "A",
    },
    {
      id: "q4_infer_why_park",
      type: "infer_with_evidence_mc",
      prompt: "Why did Maya park the rover?",
      choices: [
        { id: "A", text: "She wanted to take a nap." },
        {
          id: "B",
          text: "The dust storm made it too hard to see the path ahead.",
        },
        { id: "C", text: "The rover ran out of fuel forever." },
      ],
      correct: "B",
    },
  ],
};
