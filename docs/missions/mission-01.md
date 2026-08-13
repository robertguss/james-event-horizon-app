# Mission 01 — Dust Storm on Mars

| Field                 | Value                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------- |
| **id**                | `mission_01_mars_dust`                                                                    |
| **planet**            | Rusty Ridge (Mars sector)                                                                 |
| **grade_band**        | 3–5                                                                                       |
| **estimated_minutes** | 8–12                                                                                      |
| **skill_tags**        | locate_evidence, main_idea, vocabulary_in_context, simple_inference                       |
| **status**            | draft (Thinking Partner, Aug 2026)                                                        |
| **art_note**          | Needs locked-style planet still + mission UI chrome later (Design) — not blocking content |

---

## 1. Title & objective

**Title:** Dust Storm on Mars  
**Objective (kid-facing):** Scan the Mars transmission. Use your telescope to
find the clues that prove what the dust storm did.

**UI framing (locked visuals):** This mission is **Missions flow only** — cream
passage card, mid-screen answer pills, **Check** + **Hint**, telescope/evidence
scan. Hub chips (Missions / Hangar / Library / Academy) and Level Up celebration
are out of scope for this file; do not reshape questions around those screens.

**Parent / designer note:** First Practice mission. Slightly space-flavored so
the fantasy lands, but comprehension skills (evidence, main idea, vocab)
transfer beyond space facts.

---

## 2. Passage

**Word count:** ~165  
**Tone:** Clear, curious, toy-space adventure voice — short sentences, concrete
verbs.

### Sentences (stable `evidenceSentenceId`s)

Use these ids in the app; do not renumber without migrating attempts.

| id   | text                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------ |
| `s1` | Maya’s rover rolled across the red sand of Mars.                                                 |
| `s2` | The sky looked pale and calm at first.                                                           |
| `s3` | Then a wall of dust rose in the distance.                                                        |
| `s4` | The wind grew stronger and pushed grit against the rover’s cameras.                              |
| `s5` | Maya could not see the rocks ahead.                                                              |
| `s6` | She parked the rover and waited inside.                                                          |
| `s7` | After two hours, the air cleared enough to drive again.                                          |
| `s8` | Maya learned that dust storms on Mars can stop a trip for a while, but they do not last forever. |

### Passage (display)

Maya’s rover rolled across the red sand of Mars. The sky looked pale and calm at
first. Then a wall of dust rose in the distance. The wind grew stronger and
pushed grit against the rover’s cameras. Maya could not see the rocks ahead. She
parked the rover and waited inside. After two hours, the air cleared enough to
drive again. Maya learned that dust storms on Mars can stop a trip for a while,
but they do not last forever.

---

## 3. Questions

### Q1 — Locate evidence (tap sentence)

| Field          | Value                                                           |
| -------------- | --------------------------------------------------------------- |
| **id**         | `q1_locate_wall`                                                |
| **type**       | `locate` (tap one sentence)                                     |
| **prompt**     | Which sentence shows when the dust storm **first appeared**?    |
| **correct**    | `s3`                                                            |
| **acceptable** | `s3` only                                                       |
| **why**        | Forces “first appeared,” not later effects (cameras / parking). |

**Distractor traps (if UI shows wrong-tap feedback):** `s4` (effect, not start),
`s2` (calm before), `s7` (ending).

### Q2 — Main idea (multiple choice)

| Field       | Value                                                         |
| ----------- | ------------------------------------------------------------- |
| **id**      | `q2_main_idea`                                                |
| **type**    | `main_idea_mc`                                                |
| **prompt**  | What is this transmission mostly about?                       |
| **choices** | A · B · C                                                     |
| **A**       | Maya builds a new rover on Earth.                             |
| **B**       | A dust storm pauses Maya’s drive on Mars, then she continues. |
| **C**       | Mars has more oceans than Earth.                              |
| **correct** | `B`                                                           |
| **why**     | Whole-passage arc; A/C are off-topic or invented.             |

### Q3 — Word in context

| Field             | Value                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **id**            | `q3_vocab_grit`                                                                                                               |
| **type**          | `vocab_in_context_mc`                                                                                                         |
| **prompt**        | In the sentence about the cameras, what does **grit** mean?                                                                   |
| **stem_sentence** | `s4`                                                                                                                          |
| **choices**       | A · B · C                                                                                                                     |
| **A**             | Tiny bits of sand and dust                                                                                                    |
| **B**             | A brave feeling                                                                                                               |
| **C**             | A soft blanket                                                                                                                |
| **correct**       | `A`                                                                                                                           |
| **why**           | Context “pushed … against the rover’s cameras” + dust storm. B is a common alternate meaning of “grit” (courage) — good trap. |

### Q4 — Simple inference + evidence

| Field                 | Value                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| **id**                | `q4_infer_why_park`                                                                               |
| **type**              | `infer_mc` + required evidence tap                                                                |
| **prompt**            | Why did Maya park the rover?                                                                      |
| **choices**           | A · B · C                                                                                         |
| **A**                 | She wanted to take a nap for fun.                                                                 |
| **B**                 | She could not see safely, so she waited for the storm to ease.                                    |
| **C**                 | The rover ran out of snacks.                                                                      |
| **correct**           | `B`                                                                                               |
| **required_evidence** | `s5` (primary) or `s6` (acceptable support)                                                       |
| **evidence_rule**     | Prefer `s5`; accept `s6` if product allows one alternate. Reject `s7` alone (result, not reason). |
| **why**               | Links “could not see” → parked/waited; not silly distractors.                                     |

### Q5 — Exit ticket (chart the planet)

| Field       | Value                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------ |
| **id**      | `q5_exit_ticket`                                                                           |
| **type**    | `exit_main_idea_mc`                                                                        |
| **prompt**  | Chart this planet: What should explorers remember about Mars dust storms from this report? |
| **choices** | A · B · C                                                                                  |
| **A**       | They can block a trip for a time, but they end and travel can start again.                 |
| **B**       | They melt the rover’s wheels every time.                                                   |
| **C**       | They only happen on Earth.                                                                 |
| **correct** | `A`                                                                                        |
| **anchors** | Especially `s8` (and the wait → clear sequence).                                           |

---

## 4. Static hint ladders (fallback if Grok unavailable)

Hints **never** state the answer letter or the exact sentence id on step 1–2.
Step 3 may narrow to two sentences; step 4 may highlight location still
requiring the kid’s tap (per product brief).

### Q1 hints

1. Look near the beginning — something in the sky **changes**.
2. Find the sentence where the dust **shows up**, not where it bothers the
   cameras.
3. It’s one of these ideas: the calm sky · **a wall of dust rises** · grit on
   the cameras. Which one is the _start_?
4. Telescope glow on `s3` (still require tap).

### Q2 hints

1. Ask: what happens from start to finish?
2. Cross out choices that never appear in the transmission.
3. Keep the choice that includes **storm → wait → drive again**.
4. Soft highlight whole passage; still require selecting B.

### Q3 hints

1. Reread the camera sentence. What is the wind pushing?
2. In a dust storm, what tiny stuff would hit a camera?
3. Courage is another meaning of “grit,” but does that fit **pushed against
   cameras**?
4. Spotlight `s4`; still require choosing A.

### Q4 hints

1. What problem did Maya have right before she parked?
2. Connect “could not see” with what she did next.
3. Evidence is probably the seeing problem or the parking sentence — not the
   “two hours later” sentence alone.
4. Glow `s5` (and optionally `s6`); still require answer B + tap.

### Q5 hints

1. What lesson does the last sentence teach?
2. Do storms here destroy everything forever, or pause a trip?
3. Match the choice to “stop for a while” / “do not last forever.”
4. Glow `s8`; still require A.

---

## 5. XP & success criteria (this mission)

Aligns with locked XP draft:

| Event                           | XP                                                                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Clean question (no hints)       | 20 each × up to 5 = 100                                                                                                    |
| After hint 1 / 2 / 3+           | 14 / 10 / 6                                                                                                                |
| Exit ticket (`q5`)              | 25 (or use per-question table if exit counts as a question — **recommend:** score q1–q4 with question XP; q5 uses exit 25) |
| Mission complete (all answered) | +15                                                                                                                        |
| First daily mission bonus       | +20 (profile-level, not mission-unique)                                                                                    |

**Recommended scoring for Mission 1**

- Score **q1–q4** with question XP (hint-reduced as above).
- Score **q5** as exit ticket **25** (hint-reduced: 18 / 12 / 8 if you want
  parity — or keep exit flat 25 once correct).
- **Mission complete +15** when all five are correct (retries allowed).
- Stars (optional UI): 1★ complete · 2★ ≥3 clean (no-hint) on q1–q4 · 3★ all
  clean + exit clean.

**Success / advance**

- Kid may retry wrong items; don’t soft-lock the map.
- Planet stamp on Rusty Ridge when mission complete.
- No black-hole gate touch on Mission 1.

**Rough XP band if played well:** ~100–160 depending on hints + first-daily.

---

## 6. Content flags

| Flag                 | Note                                                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Difficulty**       | On-level for mid grade 3–4; grade 5 should feel easy warm-up (intentional for Mission 1).                                                                       |
| **Vocab**            | `grit` has a double meaning (courage vs particles) — good teaching trap; watch for kids picking B.                                                              |
| **Science softener** | Real Mars dust storms can last much longer than two hours; this is **story-simplified** for length. Parent About can say “real storms can last days or months.” |
| **Names**            | “Maya” is a peer explorer (not the player avatar) to avoid identity confusion.                                                                                  |
| **Decoding load**    | Low; focus is comprehension/evidence.                                                                                                                           |
| **Sensitivity**      | No peril-horror; waiting inside is calm and competent.                                                                                                          |
| **Follow-ups**       | Mission 02 could leave Mars (non-space passage) so skills generalize per brief.                                                                                 |

---

## Implementation sketch (for Architect / Engineering)

```json
{
  "id": "mission_01_mars_dust",
  "title": "Dust Storm on Mars",
  "planetId": "rusty_ridge",
  "sentences": [
    { "id": "s1", "text": "Maya’s rover rolled across the red sand of Mars." },
    { "id": "s2", "text": "The sky looked pale and calm at first." },
    { "id": "s3", "text": "Then a wall of dust rose in the distance." },
    {
      "id": "s4",
      "text": "The wind grew stronger and pushed grit against the rover’s cameras."
    },
    { "id": "s5", "text": "Maya could not see the rocks ahead." },
    { "id": "s6", "text": "She parked the rover and waited inside." },
    {
      "id": "s7",
      "text": "After two hours, the air cleared enough to drive again."
    },
    {
      "id": "s8",
      "text": "Maya learned that dust storms on Mars can stop a trip for a while, but they do not last forever."
    }
  ],
  "questions": [
    "q1_locate_wall",
    "q2_main_idea",
    "q3_vocab_grit",
    "q4_infer_why_park",
    "q5_exit_ticket"
  ]
}
```
