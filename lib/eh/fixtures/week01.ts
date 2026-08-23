import type { MissionDetail } from "../types";
import { mission01 } from "./mission01";

const scoring = mission01.scoring;

export const missionWeek1Day1: MissionDetail = {
  id: "mission_w1_d1_light_collector",
  title: "The Telescope’s Light Collector",
  planet: "Week 1 · Day 1 · Great Observatory",
  planetId: "great_observatory_lens",
  gradeBand: "3-5",
  kind: "standard",
  presentation: "adventure",
  estimatedMinutes: 15,
  skillTags: [
    "locate_evidence",
    "main_idea",
    "vocabulary_in_context",
    "simple_inference",
  ],
  status: "published",
  objective:
    "Restore the observatory’s light collector and discover how telescopes reveal faint objects.",
  sourceNote: "Science source: NASA, Telescopes 101.",
  sentences: [
    {
      id: "s1",
      text: "Astronomers sometimes aim a telescope at a galaxy so faint that it looks like a tiny smudge, even under a clear night sky.",
    },
    {
      id: "s2",
      text: "A telescope does not pull the galaxy closer; instead, it helps the observer use more of the light that has traveled across space.",
    },
    {
      id: "s3",
      text: "Its main lens or mirror gathers light over an area much larger than the opening of a human eye.",
    },
    {
      id: "s4",
      text: "The curved lens or mirror then directs those light rays toward one place, called the focus, where an image forms.",
    },
    {
      id: "s5",
      text: "A larger main lens or mirror collects more light than a smaller one, so it can reveal fainter objects and details.",
    },
    {
      id: "s6",
      text: "A refracting telescope bends light through lenses, while a reflecting telescope bounces light from mirrors.",
    },
    {
      id: "s7",
      text: "An eyepiece enlarges the focused image for an observer, and a camera can record the light for scientists to study.",
    },
    {
      id: "s8",
      text: "To find the observatory’s faint target, the crew needs a telescope that gathers plenty of light and focuses it accurately.",
    },
  ],
  questions: [
    {
      id: "q1_locate_focus",
      order: 1,
      type: "locate",
      xpKind: "question",
      prompt:
        "Which sentence explains how a telescope forms an image from the light it gathers?",
      evidenceRule: "exact",
      correctEvidenceIds: ["s4"],
      distractorTraps: ["s3", "s5", "s7"],
      hints: [
        "Look for what happens to the light after it is gathered.",
        "Find the sentence describing where the curved lens or mirror sends the light.",
        "Decide between gathering light, directing light to one place, and recording the finished image.",
        "Telescope glow on the sentence about the focus (still require tap).",
      ],
    },
    {
      id: "q2_main_idea",
      order: 2,
      type: "main_idea_mc",
      xpKind: "question",
      prompt: "What is this transmission mostly about?",
      choices: [
        { id: "A", text: "Telescopes pull distant galaxies closer to Earth." },
        {
          id: "B",
          text: "Telescopes gather and focus light so faint, distant objects can be observed.",
        },
        { id: "C", text: "Cameras create the light that astronomers see." },
      ],
      correctChoiceId: "B",
      evidenceRule: "exact",
      correctEvidenceIds: [],
      hints: [
        "Ask what the lens or mirror does in several parts of the transmission.",
        "The best main idea should include both gathering and focusing.",
        "Cross out choices claiming that a telescope moves an object or creates light.",
        "Soft-highlight the gathering-and-focusing sentences; still require your Check.",
      ],
    },
    {
      id: "q3_vocab_focus",
      order: 3,
      type: "vocab_in_context_mc",
      xpKind: "question",
      prompt: "In this transmission, what does **focus** mean?",
      stemSentenceId: "s4",
      choices: [
        {
          id: "A",
          text: "The place where gathered light comes together and forms an image",
        },
        { id: "B", text: "The handle used to carry a telescope" },
        { id: "C", text: "A period of clear weather without clouds" },
      ],
      correctChoiceId: "A",
      evidenceRule: "exact",
      correctEvidenceIds: ["s4"],
      hints: [
        "Reread what happens at the focus.",
        "Is the passage describing a place, a handle, or the weather?",
        "Look for the place where the directed light rays meet.",
        "Spotlight the focus sentence; still require your Check.",
      ],
    },
    {
      id: "q4_infer_aperture",
      order: 4,
      type: "infer_mc",
      xpKind: "question",
      prompt:
        "The crew can install a 7-centimeter lens or a 20-centimeter lens. Both are equally well made. Which should they use to detect the faint galaxy?",
      choices: [
        {
          id: "A",
          text: "The 7-centimeter lens because a smaller lens produces more light",
        },
        {
          id: "B",
          text: "The 20-centimeter lens because a larger lens gathers more light",
        },
        {
          id: "C",
          text: "Either one because only the eyepiece determines what can be seen",
        },
      ],
      correctChoiceId: "B",
      evidenceRule: "exact",
      correctEvidenceIds: ["s5"],
      requiresChoiceAndEvidence: true,
      hints: [
        "The target is faint, so think about how much light the telescope needs.",
        "Find the sentence comparing larger and smaller lenses or mirrors.",
        "Choose the telescope that gathers more light, then prove it from the passage.",
        "Glow the size-comparison sentence; still require choice + evidence tap.",
      ],
    },
    {
      id: "q5_exit_ticket",
      order: 5,
      type: "exit_main_idea_mc",
      xpKind: "exit",
      prompt:
        "What should the crew remember while rebuilding the observatory telescope?",
      choices: [
        {
          id: "A",
          text: "Its lens or mirror must gather and focus light, and a larger one can reveal fainter objects.",
        },
        {
          id: "B",
          text: "It must pull distant objects closer to the observatory.",
        },
        {
          id: "C",
          text: "Its camera must create new light before an image can form.",
        },
      ],
      correctChoiceId: "A",
      evidenceRule: "exact",
      correctEvidenceIds: ["s8"],
      hints: [
        "Think about the jobs repeated across the whole transmission.",
        "Does a telescope move objects, create light, or collect light?",
        "Keep the choice that includes gathering, focusing, and seeing faint objects.",
        "Glow the final sentence; still require your Check.",
      ],
    },
  ],
  reflection: {
    mapPrompt:
      "Build the path that lets a larger telescope reveal a faint galaxy.",
    cards: [
      { id: "source", text: "A faint galaxy sends light" },
      {
        id: "gather",
        text: "A larger lens or mirror gathers more of its light",
      },
      { id: "focus", text: "The light reaches the focus" },
      { id: "image", text: "The image reaches an eye or camera" },
      { id: "pull", text: "The telescope pulls the galaxy closer" },
      { id: "create", text: "The camera creates new starlight" },
    ],
    correctOrder: ["source", "gather", "focus", "image"],
    captainLogPrompt:
      "Explain how a telescope helps astronomers see a faint galaxy. Include what the lens or mirror does, what happens at the focus, and why size matters.",
    sentenceStarters: [
      "This transmission is mainly about…",
      "First, the lens or mirror…",
      "Next, the gathered light…",
      "A larger lens or mirror helps because…",
    ],
    parentGuide:
      "Listen for gathering light, focusing it into an image, and the connection between a larger main lens or mirror and fainter visible objects.",
    rewardTitle: "Aperture Ring restored",
    rewardDescription: "A wider opening gathers more light from faint objects.",
  },
  scoring,
};

export const missionWeek1Day2: MissionDetail = {
  id: "mission_w1_d2_moon_phases",
  title: "The Moon’s Changing Face",
  planet: "Week 1 · Day 2 · Lunar Gallery",
  planetId: "lunar_gallery",
  gradeBand: "3-5",
  kind: "standard",
  presentation: "adventure",
  estimatedMinutes: 15,
  skillTags: [
    "locate_evidence",
    "main_idea",
    "vocabulary_in_context",
    "simple_inference",
  ],
  status: "published",
  objective:
    "Repair the Moon map by connecting sunlight, the Moon’s orbit, and the phases we see.",
  sourceNote: "Science source: NASA, Moon Phases.",
  sentences: [
    {
      id: "s1",
      text: "The Moon can look like a thin silver curve, a half circle, or a bright round disk on different nights.",
    },
    {
      id: "s2",
      text: "It does not make its own visible light; moonlight is sunlight reflected from the Moon’s surface.",
    },
    {
      id: "s3",
      text: "The Sun always illuminates half of the Moon, just as it lights one side of Earth at a time.",
    },
    {
      id: "s4",
      text: "While the Moon travels around Earth, its position changes compared with Earth and the Sun.",
    },
    {
      id: "s5",
      text: "From Earth, we see changing amounts of the Moon’s illuminated half, and those changing views are called phases.",
    },
    {
      id: "s6",
      text: "At full Moon, the sunlit half faces mostly toward Earth, but at new Moon, the sunlit half faces mostly away from us.",
    },
    {
      id: "s7",
      text: "Earth’s shadow does not normally create the phases; its shadow crosses the Moon only during a lunar eclipse.",
    },
    {
      id: "s8",
      text: "The Moon completes its full pattern of phases about every 29.5 days as the positions repeat.",
    },
  ],
  questions: [
    {
      id: "q1_locate_moonlight",
      order: 1,
      type: "locate",
      xpKind: "question",
      prompt: "Which sentence explains where moonlight comes from?",
      evidenceRule: "exact",
      correctEvidenceIds: ["s2"],
      distractorTraps: ["s1", "s3", "s6"],
      hints: [
        "Look near the beginning for what shines on the Moon.",
        "Find the sentence that says whether the Moon makes or reflects light.",
        "Choose between the Moon making light and sunlight bouncing from its surface.",
        "Telescope glow on the reflected-sunlight sentence (still require tap).",
      ],
    },
    {
      id: "q2_main_idea",
      order: 2,
      type: "main_idea_mc",
      xpKind: "question",
      prompt: "What is this transmission mostly about?",
      choices: [
        {
          id: "A",
          text: "Clouds cover different parts of the Moon each night.",
        },
        {
          id: "B",
          text: "The Moon’s orbit changes how much of its sunlit half we see from Earth.",
        },
        {
          id: "C",
          text: "The Moon creates a different amount of light every night.",
        },
      ],
      correctChoiceId: "B",
      evidenceRule: "exact",
      correctEvidenceIds: [],
      hints: [
        "Ask what changes as the Moon moves around Earth.",
        "The best choice must connect the orbit, sunlight, and our view.",
        "Cross out choices about clouds or the Moon creating light.",
        "Soft-highlight the orbit-and-view sentences; still require your Check.",
      ],
    },
    {
      id: "q3_vocab_illuminates",
      order: 3,
      type: "vocab_in_context_mc",
      xpKind: "question",
      prompt: "What does **illuminates** mean in the sentence about the Sun?",
      stemSentenceId: "s3",
      choices: [
        { id: "A", text: "Lights up" },
        { id: "B", text: "Pulls closer" },
        { id: "C", text: "Covers with shadow" },
      ],
      correctChoiceId: "A",
      evidenceRule: "exact",
      correctEvidenceIds: ["s3"],
      hints: [
        "Reread what the Sun does to one side of the Moon.",
        "Which choice is another way to say that the Sun shines on something?",
        "The word describes making a surface bright, not moving it.",
        "Spotlight the Sun sentence; still require your Check.",
      ],
    },
    {
      id: "q4_infer_crescent",
      order: 4,
      type: "infer_mc",
      xpKind: "question",
      prompt:
        "When we see only a thin crescent, what is happening to the rest of the Moon’s sunlit half?",
      choices: [
        { id: "A", text: "The Sun has stopped lighting most of the Moon." },
        {
          id: "B",
          text: "Most of the sunlit half is turned away from our view.",
        },
        {
          id: "C",
          text: "Earth’s shadow covers the Moon every crescent night.",
        },
      ],
      correctChoiceId: "B",
      evidenceRule: "anyOf",
      correctEvidenceIds: ["s3", "s5"],
      requiresChoiceAndEvidence: true,
      hints: [
        "Remember how much of the Moon the Sun always lights.",
        "Connect the always-lit half with the changing amount we can see.",
        "Look at the Sun sentence or the sentence defining phases.",
        "Glow the always-lit and changing-view sentences; still require choice + evidence tap.",
      ],
    },
    {
      id: "q5_exit_ticket",
      order: 5,
      type: "exit_main_idea_mc",
      xpKind: "exit",
      prompt: "Why does the Moon appear to change shape during the month?",
      choices: [
        {
          id: "A",
          text: "Its orbit changes how much of the illuminated half we can see from Earth.",
        },
        {
          id: "B",
          text: "Earth’s shadow covers a new piece of it every night.",
        },
        {
          id: "C",
          text: "The Moon stretches into different shapes as it moves.",
        },
      ],
      correctChoiceId: "A",
      evidenceRule: "exact",
      correctEvidenceIds: ["s5"],
      hints: [
        "Think about position and point of view.",
        "The Moon stays round, and the Sun keeps lighting half of it.",
        "Match the choice to the orbit and the changing part visible from Earth.",
        "Glow the sentence defining phases; still require your Check.",
      ],
    },
  ],
  reflection: {
    mapPrompt: "Arrange the cause of the Moon’s changing phases.",
    cards: [
      { id: "sun", text: "The Sun illuminates half of the Moon" },
      { id: "orbit", text: "The Moon travels around Earth" },
      { id: "view", text: "Our view of the sunlit half changes" },
      { id: "phases", text: "Different phases appear" },
      { id: "shadow", text: "Earth’s shadow covers it each night" },
      { id: "shape", text: "The Moon stretches into new shapes" },
    ],
    correctOrder: ["sun", "orbit", "view", "phases"],
    captainLogPrompt:
      "Explain why the Moon looks different during the month even though the Sun always lights half of it.",
    sentenceStarters: [
      "The Moon’s phases happen because…",
      "The Sun always…",
      "As the Moon orbits Earth…",
      "From Earth, we see…",
    ],
    parentGuide:
      "Listen for reflected sunlight, half always illuminated, orbit, and a changing Earth viewpoint. Correct any claim that ordinary phases are Earth’s shadow.",
    rewardTitle: "Phase Dial restored",
    rewardDescription:
      "The observatory can now predict the Moon’s changing view.",
  },
  scoring,
};

export const missionWeek1Day3: MissionDetail = {
  id: "mission_w1_d3_twinkle",
  title: "Why Stars Twinkle",
  planet: "Week 1 · Day 3 · Atmosphere Deck",
  planetId: "atmosphere_deck",
  gradeBand: "3-5",
  kind: "standard",
  presentation: "adventure",
  estimatedMinutes: 15,
  skillTags: [
    "locate_evidence",
    "main_idea",
    "vocabulary_in_context",
    "simple_inference",
  ],
  status: "published",
  objective:
    "Stabilize the observatory image by tracing what Earth’s atmosphere does to starlight.",
  sourceNote: "Science source: Sky & Telescope, Why Do Stars Twinkle?",
  sentences: [
    {
      id: "s1",
      text: "On a clear night, stars may seem to sparkle, brighten, fade, or wiggle slightly in the sky.",
    },
    {
      id: "s2",
      text: "Stars are so far away that each one appears to our eyes as a tiny point of light.",
    },
    {
      id: "s3",
      text: "Their light travels steadily across space before it reaches the blanket of air around Earth, called the atmosphere.",
    },
    {
      id: "s4",
      text: "The atmosphere contains moving pockets of air with different temperatures and densities.",
    },
    {
      id: "s5",
      text: "As starlight passes through those shifting pockets, its path bends and becomes slightly distorted.",
    },
    {
      id: "s6",
      text: "Those quick changes in the light’s path make a star seem to change brightness or position, creating its twinkle.",
    },
    {
      id: "s7",
      text: "Planets usually look steadier because they appear as tiny disks, so many distorted light paths blend together.",
    },
    {
      id: "s8",
      text: "Above Earth’s atmosphere, astronauts see stars shining steadily instead of twinkling in the same way.",
    },
  ],
  questions: [
    {
      id: "q1_locate_air",
      order: 1,
      type: "locate",
      xpKind: "question",
      prompt:
        "Which sentence identifies what bends and distorts the starlight?",
      evidenceRule: "exact",
      correctEvidenceIds: ["s5"],
      distractorTraps: ["s2", "s4", "s6"],
      hints: [
        "Look for what happens while the light passes through the atmosphere.",
        "Find the sentence about the path of the light, not just the pockets of air.",
        "Choose between the moving air, the bending light path, and the twinkle we finally see.",
        "Telescope glow on the bending-light sentence (still require tap).",
      ],
    },
    {
      id: "q2_main_idea",
      order: 2,
      type: "main_idea_mc",
      xpKind: "question",
      prompt: "What is this transmission mostly about?",
      choices: [
        {
          id: "A",
          text: "Stars blink their own lights on and off every second.",
        },
        {
          id: "B",
          text: "Earth’s moving atmosphere bends starlight and makes stars appear to twinkle.",
        },
        { id: "C", text: "Planets are much brighter than every star." },
      ],
      correctChoiceId: "B",
      evidenceRule: "exact",
      correctEvidenceIds: [],
      hints: [
        "Ask what happens between the arriving starlight and the observer.",
        "The main idea should connect the atmosphere, bending light, and twinkling.",
        "Cross out choices about stars blinking or every planet being brighter.",
        "Soft-highlight the atmosphere-to-twinkle chain; still require your Check.",
      ],
    },
    {
      id: "q3_vocab_distorted",
      order: 3,
      type: "vocab_in_context_mc",
      xpKind: "question",
      prompt: "What does **distorted** mean in the sentence about starlight?",
      stemSentenceId: "s5",
      choices: [
        { id: "A", text: "Changed from its original path or appearance" },
        { id: "B", text: "Made into a louder sound" },
        { id: "C", text: "Stopped forever" },
      ],
      correctChoiceId: "A",
      evidenceRule: "exact",
      correctEvidenceIds: ["s5"],
      hints: [
        "Notice what happens to the light’s path in the same sentence.",
        "Does the path stay exactly the same, change slightly, or stop?",
        "The word describes a changed path or appearance.",
        "Spotlight the bending-light sentence; still require your Check.",
      ],
    },
    {
      id: "q4_infer_space",
      order: 4,
      type: "infer_mc",
      xpKind: "question",
      prompt:
        "How would a star probably look to an astronaut above Earth’s atmosphere?",
      choices: [
        {
          id: "A",
          text: "It would twinkle more because space has extra moving air.",
        },
        {
          id: "B",
          text: "It would look steadier because Earth’s atmosphere is no longer in the way.",
        },
        {
          id: "C",
          text: "It would disappear because stars need air to shine.",
        },
      ],
      correctChoiceId: "B",
      evidenceRule: "exact",
      correctEvidenceIds: ["s8"],
      requiresChoiceAndEvidence: true,
      hints: [
        "What causes the twinkle for an observer on the ground?",
        "Now remove the atmosphere from the light’s path.",
        "Look near the end for what astronauts see above the atmosphere.",
        "Glow the astronaut sentence; still require choice + evidence tap.",
      ],
    },
    {
      id: "q5_exit_ticket",
      order: 5,
      type: "exit_main_idea_mc",
      xpKind: "exit",
      prompt: "Why do stars appear to twinkle from the ground?",
      choices: [
        {
          id: "A",
          text: "Moving air bends their point-like light before it reaches us.",
        },
        { id: "B", text: "Stars quickly grow larger and smaller." },
        { id: "C", text: "Clouds turn every star on and off." },
      ],
      correctChoiceId: "A",
      evidenceRule: "exact",
      correctEvidenceIds: ["s6"],
      hints: [
        "Trace the light from space through the air to your eyes.",
        "The star stays steady; something near Earth changes its light path.",
        "Keep the choice about moving air and bending point-like light.",
        "Glow the sentence connecting path changes to twinkling; still require your Check.",
      ],
    },
  ],
  reflection: {
    mapPrompt: "Build the cause-and-effect path that creates a twinkle.",
    cards: [
      { id: "star", text: "A distant star sends point-like light" },
      { id: "air", text: "The light enters moving pockets of air" },
      { id: "bend", text: "The light’s path bends slightly" },
      { id: "twinkle", text: "The star appears to twinkle" },
      { id: "blink", text: "The star switches itself on and off" },
      { id: "closer", text: "The atmosphere pulls the star closer" },
    ],
    correctOrder: ["star", "air", "bend", "twinkle"],
    captainLogPrompt:
      "Explain why stars seem to twinkle even though the stars are not rapidly blinking.",
    sentenceStarters: [
      "Stars seem to twinkle because…",
      "Their light first…",
      "When it enters Earth’s atmosphere…",
      "That makes the star appear…",
    ],
    parentGuide:
      "Listen for point-like starlight, moving atmosphere, a changing light path, and an apparent—not actual—blink.",
    rewardTitle: "Atmosphere Stabilizer restored",
    rewardDescription:
      "The observatory can now correct some of the atmosphere’s shimmer.",
  },
  scoring,
};

export const missionWeek1Day4: MissionDetail = {
  id: "mission_w1_d4_abram",
  title: "God Calls Abram",
  planet: "Week 1 · Day 4 · Scripture Archive",
  planetId: "scripture_archive_abram",
  gradeBand: "3-5",
  kind: "standard",
  presentation: "scripture",
  estimatedMinutes: 15,
  skillTags: [
    "locate_evidence",
    "main_idea",
    "vocabulary_in_context",
    "simple_inference",
  ],
  status: "published",
  objective:
    "Read Genesis 12:1–9 and connect God’s command and promises with Abram’s response.",
  sourceNote:
    "Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. ESV Text Edition: 2025. The ESV text may not be quoted in any publication made available to the public by a Creative Commons license. The ESV may not be translated in whole or in part into any other language. Used by permission. All rights reserved.",
  sentences: [
    {
      id: "s1",
      text: "Abram lived in Haran with his wife, Sarai, and members of his father’s family.",
    },
    {
      id: "s2",
      text: "Now the LORD said to Abram, “Go from your country and your kindred and your father’s house to the land that I will show you.” (Genesis 12:1 ESV)",
    },
    {
      id: "s3",
      text: "God promised to make Abram into a great nation, to bless him, and to make his name great so that he would be a blessing.",
    },
    {
      id: "s4",
      text: "God also promised that through Abram all the families of the earth would be blessed.",
    },
    {
      id: "s5",
      text: "Abram did not yet know every turn of the road or exactly where God would lead him.",
    },
    {
      id: "s6",
      text: "So Abram went, as the LORD had told him, and Lot went with him. (Genesis 12:4a ESV)",
    },
    {
      id: "s7",
      text: "When Abram reached the land of Canaan, the LORD appeared to him and promised that land to his offspring.",
    },
    {
      id: "s8",
      text: "Abram built altars to the LORD, and the account connects God’s command and promises with Abram’s obedient response.",
    },
  ],
  questions: [
    {
      id: "q1_locate_command",
      order: 1,
      type: "locate",
      xpKind: "question",
      prompt: "Which sentence gives the LORD’s command to Abram?",
      evidenceRule: "exact",
      correctEvidenceIds: ["s2"],
      distractorTraps: ["s3", "s6", "s7"],
      hints: [
        "Look near the beginning for words the LORD spoke directly to Abram.",
        "Find the sentence telling Abram to leave and go.",
        "Choose the command, not the promises or Abram’s later response.",
        "Soft glow on the command from Genesis 12:1 (still require tap).",
      ],
    },
    {
      id: "q2_main_idea",
      order: 2,
      type: "main_idea_mc",
      xpKind: "question",
      prompt: "What is this Scripture reading mainly about?",
      choices: [
        { id: "A", text: "Abram designed a city in Haran and never left it." },
        {
          id: "B",
          text: "God called Abram, gave him promises, and Abram obeyed by going.",
        },
        { id: "C", text: "Lot commanded Abram to travel to Canaan." },
      ],
      correctChoiceId: "B",
      evidenceRule: "exact",
      correctEvidenceIds: [],
      hints: [
        "Look for the command, the promises, and Abram’s response.",
        "The main idea must cover what God did and what Abram did.",
        "Cross out choices claiming Abram stayed or Lot gave the command.",
        "Soft-highlight the command, promises, and response; still require your Check.",
      ],
    },
    {
      id: "q3_vocab_kindred",
      order: 3,
      type: "vocab_in_context_mc",
      xpKind: "question",
      prompt: "In Genesis 12:1, what does **kindred** mean?",
      stemSentenceId: "s2",
      choices: [
        { id: "A", text: "Relatives or family group" },
        { id: "B", text: "Gold and other treasure" },
        { id: "C", text: "A road through the desert" },
      ],
      correctChoiceId: "A",
      evidenceRule: "exact",
      correctEvidenceIds: ["s2"],
      hints: [
        "Notice that kindred appears beside country and father’s house.",
        "Which choice names people connected to Abram’s family?",
        "The word refers to relatives, not wealth or a road.",
        "Spotlight Genesis 12:1; still require your Check.",
      ],
    },
    {
      id: "q4_infer_response",
      order: 4,
      type: "infer_mc",
      xpKind: "question",
      prompt:
        "Which action best shows how Abram responded to the LORD’s command?",
      choices: [
        { id: "A", text: "He stayed in Haran until he knew every detail." },
        { id: "B", text: "He went as the LORD had told him." },
        {
          id: "C",
          text: "He asked Lot to choose whether God’s promise was true.",
        },
      ],
      correctChoiceId: "B",
      evidenceRule: "exact",
      correctEvidenceIds: ["s6"],
      requiresChoiceAndEvidence: true,
      hints: [
        "Find what Abram did after hearing the command and promises.",
        "His response is an action, not another promise.",
        "Look for the sentence that begins with the result word “So.”",
        "Soft glow on Abram’s response in Genesis 12:4 (still require choice + tap).",
      ],
    },
    {
      id: "q5_exit_ticket",
      order: 5,
      type: "exit_main_idea_mc",
      xpKind: "exit",
      prompt: "How are the main parts of this Scripture reading connected?",
      choices: [
        {
          id: "A",
          text: "God commanded and promised; Abram responded by going as God told him.",
        },
        {
          id: "B",
          text: "Abram made promises; God traveled to a land Abram selected.",
        },
        {
          id: "C",
          text: "Lot gave a command; Abram refused to leave his home.",
        },
      ],
      correctChoiceId: "A",
      evidenceRule: "exact",
      correctEvidenceIds: ["s8"],
      hints: [
        "Put the command, promises, and response in order.",
        "Who spoke first, and who then acted?",
        "Match God’s command and promises with Abram going.",
        "Soft glow on the final summary sentence; still require your Check.",
      ],
    },
  ],
  reflection: {
    mapPrompt: "Arrange the three parts of the Scripture account.",
    cards: [
      { id: "command", text: "The LORD commanded Abram to go" },
      { id: "promise", text: "God gave Abram promises" },
      { id: "response", text: "Abram went as the LORD told him" },
      { id: "stay", text: "Abram decided to remain in Haran" },
      { id: "lot", text: "Lot gave Abram the command" },
    ],
    correctOrder: ["command", "promise", "response"],
    captainLogPrompt:
      "Tell what the LORD commanded Abram, what God promised, and how Abram responded.",
    sentenceStarters: [
      "The LORD commanded Abram to…",
      "God promised…",
      "Abram responded by…",
    ],
    parentGuide:
      "Listen for God as the giver of the command and promises, followed by Abram’s obedient departure. Keep application separate from what the text states.",
    rewardTitle: "Genesis 12 record complete",
    rewardDescription: "Genesis 12:1–9 has been read, ordered, and narrated.",
  },
  scoring,
};

export const missionWeek1Day5: MissionDetail = {
  id: "mission_w1_d5_stop_wobble",
  title: "Build Lab: Stop the Wobble",
  planet: "Week 1 · Day 5 · Observatory Workshop",
  planetId: "observatory_workshop",
  gradeBand: "3-5",
  kind: "standard",
  presentation: "adventure",
  estimatedMinutes: 15,
  skillTags: [
    "locate_evidence",
    "main_idea",
    "vocabulary_in_context",
    "simple_inference",
  ],
  status: "published",
  objective:
    "Repair a wobbling observatory tower by finding how a diagonal brace changes its frame.",
  sourceNote:
    "Engineering source: University of Cambridge, Underground Mathematics, triangle rigidity.",
  sentences: [
    {
      id: "s1",
      text: "The observatory crew built a tall support frame from straight beams joined in rows of squares.",
    },
    {
      id: "s2",
      text: "The beams were strong, but the joints at their corners could pivot when a sideways force pushed the frame.",
    },
    {
      id: "s3",
      text: "As the corners pivoted, a square leaned into a slanted parallelogram and made the tower wobble.",
    },
    {
      id: "s4",
      text: "None of the four beams needed to bend or change length for the square to change shape.",
    },
    {
      id: "s5",
      text: "A triangle behaves differently because three fixed side lengths hold its angles in one rigid shape.",
    },
    {
      id: "s6",
      text: "When the crew added one diagonal beam across a square, they divided it into two triangles.",
    },
    {
      id: "s7",
      text: "This method, called triangulation, helped the frame resist the sideways shape change.",
    },
    {
      id: "s8",
      text: "Engineers use triangular braces in towers, cranes, roof frames, and bridges when they need rigid beam structures.",
    },
    {
      id: "s9",
      text: "With the diagonal brace installed, the observatory tower could hold its telescope without wobbling.",
    },
  ],
  questions: [
    {
      id: "q1_locate_shape_change",
      order: 1,
      type: "locate",
      xpKind: "question",
      prompt:
        "Which sentence describes the square changing shape and making the tower wobble?",
      evidenceRule: "exact",
      correctEvidenceIds: ["s3"],
      distractorTraps: ["s2", "s4", "s6"],
      hints: [
        "Look near the beginning for what the square becomes.",
        "Find the sentence connecting pivoting corners, a slanted shape, and wobbling.",
        "Choose the changing-square result, not just the force or the later repair.",
        "Telescope glow on the square-to-parallelogram sentence (still require tap).",
      ],
    },
    {
      id: "q2_main_idea",
      order: 2,
      type: "main_idea_mc",
      xpKind: "question",
      prompt: "What is this transmission mostly about?",
      choices: [
        {
          id: "A",
          text: "Paint makes a tower frame strong enough for a telescope.",
        },
        {
          id: "B",
          text: "A diagonal brace creates rigid triangles that help stop a square frame from wobbling.",
        },
        {
          id: "C",
          text: "Every square beam must bend before a frame can change shape.",
        },
      ],
      correctChoiceId: "B",
      evidenceRule: "exact",
      correctEvidenceIds: [],
      hints: [
        "Ask what problem the tower had and what fixed it.",
        "The main idea should connect the diagonal, triangles, and reduced wobble.",
        "Cross out choices about paint or every beam bending.",
        "Soft-highlight the diagonal-and-triangle sentences; still require your Check.",
      ],
    },
    {
      id: "q3_vocab_rigid",
      order: 3,
      type: "vocab_in_context_mc",
      xpKind: "question",
      prompt: "What does **rigid** mean in this transmission?",
      stemSentenceId: "s5",
      choices: [
        { id: "A", text: "Resistant to changing shape" },
        { id: "B", text: "Soft and easy to fold" },
        { id: "C", text: "Painted a bright color" },
      ],
      correctChoiceId: "A",
      evidenceRule: "exact",
      correctEvidenceIds: ["s5"],
      hints: [
        "Reread how the triangle behaves differently from the square.",
        "Does a rigid shape change easily or hold its angles?",
        "The word describes resisting a shape change.",
        "Spotlight the triangle sentence; still require your Check.",
      ],
    },
    {
      id: "q4_infer_brace",
      order: 4,
      type: "infer_mc",
      xpKind: "question",
      prompt:
        "Where should the crew add one beam to reduce the square frame’s sideways wobble?",
      choices: [
        {
          id: "A",
          text: "Horizontally across the middle, making two more rectangles",
        },
        { id: "B", text: "Diagonally from one corner to the opposite corner" },
        { id: "C", text: "Loose beside the frame without connecting it" },
      ],
      correctChoiceId: "B",
      evidenceRule: "exact",
      correctEvidenceIds: ["s6"],
      requiresChoiceAndEvidence: true,
      hints: [
        "The repair must turn the square into triangles.",
        "Which placement connects opposite corners?",
        "Find the sentence describing the beam the crew added.",
        "Glow the diagonal-beam sentence; still require choice + evidence tap.",
      ],
    },
    {
      id: "q5_exit_ticket",
      order: 5,
      type: "exit_main_idea_mc",
      xpKind: "exit",
      prompt: "Why did the diagonal brace make the square frame steadier?",
      choices: [
        {
          id: "A",
          text: "It created rigid triangles that resisted the sideways shape change.",
        },
        { id: "B", text: "It made all the original beams shorter." },
        { id: "C", text: "It removed every force from the tower." },
      ],
      correctChoiceId: "A",
      evidenceRule: "exact",
      correctEvidenceIds: ["s7"],
      hints: [
        "Connect the new triangles to the original wobble.",
        "The force can still exist, so what does the frame now resist?",
        "Keep the choice about rigid triangles and sideways shape change.",
        "Glow the triangulation sentence; still require your Check.",
      ],
    },
  ],
  reflection: {
    mapPrompt: "Arrange the problem and repair in the observatory frame.",
    cards: [
      { id: "push", text: "A sideways force pushes the square frame" },
      { id: "lean", text: "Its corner angles change and the frame leans" },
      { id: "brace", text: "A diagonal brace creates two triangles" },
      { id: "steady", text: "The frame resists the wobble" },
      { id: "shorten", text: "Every beam becomes shorter" },
      { id: "paint", text: "Bright paint removes the force" },
    ],
    correctOrder: ["push", "lean", "brace", "steady"],
    captainLogPrompt:
      "The beams did not break, but the square frame still wobbled. Explain how one diagonal brace made it steadier.",
    sentenceStarters: [
      "The square could wobble because…",
      "The beams stayed the same length, but…",
      "The diagonal brace…",
      "The triangles made the frame…",
    ],
    parentGuide:
      "Listen for changing corner angles, no required change in beam length, a diagonal making two triangles, and increased resistance to sideways deformation.",
    rewardTitle: "Tower Brace restored",
    rewardDescription:
      "A diagonal divides the frame into rigid triangles and stops the wobble.",
  },
  scoring,
};

export const WEEK_01_MISSIONS: readonly MissionDetail[] = [
  missionWeek1Day1,
  missionWeek1Day2,
  missionWeek1Day3,
  missionWeek1Day4,
  missionWeek1Day5,
];
