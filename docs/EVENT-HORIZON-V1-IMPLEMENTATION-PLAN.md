# Event Horizon v1 — Overnight Implementation Plan

**Status:** Binding Engineering contract (docs-only land).  
**Repo:** `robertguss/james-event-horizon-app`  
**Audience:** Overnight Cursor agents + Robert (morning Mac).  
**Tone:** Contract. No fluff. Hint = GOLD. Check = CTA.

This file is the overnight build authority. If it conflicts with starter-kit defaults, this file wins for Event Horizon product surfaces. `DESIGN.md` wins for visual tokens. `docs/PRODUCT-BRIEF.md` wins for product scope. `docs/missions/mission-01.md` wins for Mission 1 sentence/question/hint text (copied into the seed JSON below).

---

## 1. Repo / stack / in-flight

| Item | Value |
|------|--------|
| **Repo** | `robertguss/james-event-horizon-app` |
| **Base kit** | web-app-starter-kit (TanStack Start, Convex, Clerk, TypeScript, shadcn/ui, Vitest, Playwright-ready) |
| **Package manager** | `aube` / `aubr` / `aubx` (not npm/pnpm-first) |
| **Product** | Event Horizon — practice reading-comprehension PWA (grades ~3–5) |
| **Canonical visuals** | `DESIGN.md` |
| **Product scope** | `docs/PRODUCT-BRIEF.md` |
| **Mission 1 content** | `docs/missions/mission-01.md` |
| **Visual refs** | Prefer `docs/design-refs/` if present; else Box fallback images Robert already approved (hub four-corner, mission cream card, Level Up). Do not invent a second look. |

**In-flight (DO NOT RESTART):**

- **Slice 1 agent:** `bc-c7fa884b` — **RUNNING**
- Do **not** relaunch Slice 1.
- If Slice 1 assumed live Clerk / live Convex as the only path, the **next** agent immediately adds the fixture adapter (`VITE_EH_DATA=fixture` default) on top of whatever Slice 1 landed — do not rip out Slice 1 UI chrome.

**Overnight constraint:** fixtures + tests + screenshots. Not iPad. Not live Clerk hosted sign-in. Not live Convex cloud required.

---

## 2. Product in / out

### IN (v1 overnight + morning)

- Space-explorer **practice reading-comprehension** PWA
- Tablet-first Add-to-Home-Screen
- Deterministic missions: passage → questions → Check → hints → XP → debrief → Level Up
- Tap-the-evidence + multiple choice
- 4-step Socratic hint ladder (Grok server-side optional; **static fallback required**)
- Kid profile as Convex (or fixture) row; parent PIN gate
- XP, levels, streak, black-hole **gate** (not full BH mission pack overnight)
- Hub four corners: Missions / Hangar / Library / Academy
- Fixture-first overnight path so CI and agents run with **no Clerk keys** and **no Convex URL**

### OUT (explicit — do not build)

- OCR / camera / handwriting
- Writing studio, cursive, typing gym
- “I’m stuck” homework helper / ChatGPT-for-homework
- Full LMS, school rostering, multiplayer
- Native App Store release
- Client-side Grok / browser xAI keys
- Runtime mission generation (passages/questions) via LLM
- WebGL / R3F / Spline **on mission question screens**
- Replacing Check CTA with Scan as the primary confirm label on mission answer row

---

## 3. Visuals + information architecture

### Hub (four-corner jelly chips)

| Corner | Label | Surface | Icon cue |
|--------|-------|---------|----------|
| Missions | Missions | **Teal** primary | star |
| Hangar | Hangar | **Teal** primary | rocket |
| Library | Library | **Cream** secondary | book |
| Academy | Academy | **Cream** secondary | telescope |

Nebula canvas behind; explorer/platform art from design refs. Short labels only.

### Mission screen (locked)

- Teal + gold **framed** cream reading card (`reading-panel` `#FFF8F0`, text `#1A1528`)
- Passage ≥22px Nunito, airy line-height
- Mid-screen answer affordances
- Bottom tool row — **five pills** pattern (visual rhythm):  
  **Check (TEAL primary CTA)** · gold accent · teal accent · gold accent · **Hint (GOLD `button-hint`)**
- **Hint is GOLD** per `DESIGN.md` `button-hint` — **not** teal from any Imagine bake-off
- **CTA label = Check** (not Scan). Scan may remain metaphor copy elsewhere; confirm action is **Check**
- Telescope / evidence reticle prop for locate + evidence taps (soft teal glow, not neon)
- No WebGL on missions. Flat 2D + CSS/Framer only.

### Level Up

- **Dedicated route/screen** (`/level-up`), not a toast-only moment
- Gold star / XP celebration language; one motion verb; honor `prefers-reduced-motion`

### Token authority

- Primary teal `#2EC4B6` = Check / Launch / Missions chip
- Secondary cream `#F5E6D3` = Library / Academy chips
- Tertiary gold `#F0C75E` = Hint / XP / stars
- Map tokens into theme; do not invent a parallel palette

---

## 4. Fixture architecture (FIRST CLASS)

Overnight **defaults to fixtures**. Live cloud is a morning flip.

### `lib/eh/data.ts` — `EhData` interface

UI components and route loaders talk **only** to `EhData`.  
**UI never calls Convex from components.** No `useQuery`/`useMutation` sprinkled in mission UI — go through the adapter.

```ts
// Contract sketch (normative shape; names may match exactly)
export type EhMode = "fixture" | "convex";

export interface EhKid {
  id: string;
  displayName: string;
  gradeBand: "3-5";
  xp: number;
  level: number;
  streakDays: number;
  lastMissionDate?: string; // YYYY-MM-DD local
  unlocks: string[];
}

export interface EhData {
  mode: EhMode;
  auth: {
    /** Fixture: always ready. Convex: parent session via Clerk, kid selected in app state. */
    getSession(): Promise<{ parentId: string | null; activeKidId: string | null }>;
    /** Fixture auth skips live Clerk entirely. */
    fixtureSignInAsParent?(): Promise<void>;
    selectKid(kidId: string): Promise<void>;
  };
  kids: {
    list(): Promise<EhKid[]>;
    get(kidId: string): Promise<EhKid | null>;
    create(input: { displayName: string; gradeBand: "3-5" }): Promise<EhKid>;
  };
  missions: {
    list(): Promise<MissionSummary[]>;
    get(missionId: string): Promise<MissionDetail | null>;
  };
  attempts: {
    getActive(kidId: string, missionId: string): Promise<Attempt | null>;
    start(kidId: string, missionId: string): Promise<Attempt>;
    submitAnswer(input: SubmitAnswerInput): Promise<SubmitAnswerResult>;
    requestHint(input: HintInput): Promise<HintResult>;
    complete(input: { attemptId: string }): Promise<CompleteResult>;
  };
  parent: {
    verifyPin(pin: string): Promise<boolean>;
    setPin(pin: string): Promise<void>;
    progress(kidId: string): Promise<ParentProgress>;
  };
}
```

### Mode selection

| Env | Behavior |
|-----|----------|
| `VITE_EH_DATA=fixture` | **DEFAULT overnight.** `fixtureAdapter`. In-memory / module state. Mission 1 from `lib/eh/fixtures/mission01.ts`. |
| `VITE_EH_DATA=convex` | Morning. `convexAdapter` wrapping Convex queries/mutations/actions. |

Factory:

```ts
// lib/eh/client.ts
export function getEhData(): EhData {
  const mode = import.meta.env.VITE_EH_DATA ?? "fixture";
  return mode === "convex" ? convexAdapter : fixtureAdapter;
}
```

### Fixture rules (binding)

1. **`VITE_EH_DATA=fixture` is the overnight default** — set in `.env.example` / agent docs; do not require unset→fixture gymnastics.
2. **`fixtureAuth` skips live Clerk.** No publishable key required. Fixture lands the kid on `/hub`.
3. **Fixture parent PIN:** `1234` (dev-only). Document in this plan + parent gate UI helper text in dev builds only.
4. **Mission 1 fixture module:** `lib/eh/fixtures/mission01.ts` — full seed from §9.
5. **`convex-test` in-process** is OK overnight for adapter parity tests.
6. **Live Convex cloud + Clerk hosted sign-in are NOT required overnight.**
7. **Playwright (or Vitest + screenshot harness) compares** key screens to `docs/design-refs/` when refs exist.
8. **`aubr check` / unit+integration tests must pass with no Clerk keys and no Convex URL** when `VITE_EH_DATA=fixture`.

### Adapters

| Adapter | File | Notes |
|---------|------|-------|
| `fixtureAdapter` | `lib/eh/fixtureAdapter.ts` | Default. Persists to `sessionStorage` or module memory for attempt state within a session. |
| `convexAdapter` | `lib/eh/convexAdapter.ts` | Morning. Thin map onto Convex API (§17). |

If Slice 1 (`bc-c7fa884b`) wired components directly to Clerk/Convex, next agent:

1. Introduce `EhData` + fixture default
2. Redirect UI through adapter
3. Keep visual work from Slice 1
4. Do not restart Slice 1 agent

---

## 5. Routes + auth

### Routes (kid-facing + parent)

| Path | Purpose |
|------|---------|
| `/hub` | Four-corner hub; fixture default landing |
| `/missions` | Mission list / map entry |
| `/mission/$id` | Mission runtime (read → questions → Check / Hint) |
| `/debrief` | XP breakdown, stamps, next CTA |
| `/level-up` | Dedicated Level Up celebration |
| `/hangar` | Ship / cosmetics (stub OK overnight) |
| `/library` | Passages / collection stub |
| `/academy` | Skills / tips stub |
| `/onboarding` | Create/select kid (fixture: one-click) |
| `/parent` | Parent mini-stats |
| `/parent/gate` | PIN gate before parent surfaces |

Starter-kit `/login`, `/signup`, `/dashboard` may remain for kit health; Event Horizon kid loop does not depend on them overnight.

### Auth model

- **Parent** = Clerk user (morning) **or** fixture parent session (overnight).
- **Kid** = **Convex row** (or fixture row) — **not** a Clerk user.
- Active kid id lives in app session state after parent selects / onboarding creates.
- Fixture path: auto parent + auto kid → land **`/hub`**.
- Parent surfaces require PIN (`1234` fixture; hashed PIN morning with `PIN_PEPPER`).

---

## 6. Complete Convex schema

Normative tables for morning / `convex-test`. Field names may use camelCase in TS; keep indexes as specified.

### `parents`

| Field | Type | Notes |
|-------|------|-------|
| `clerkUserId` | string | Clerk subject |
| `pinHash` | string | peppered hash; never store raw PIN |
| `createdAt` | number | ms |

**Indexes:** `by_clerkUserId` (`clerkUserId`)

### `kids`

| Field | Type | Notes |
|-------|------|-------|
| `parentId` | Id\<parents\> | |
| `displayName` | string | |
| `gradeBand` | string | `"3-5"` |
| `xp` | number | |
| `level` | number | start 1 |
| `streakDays` | number | |
| `lastMissionDate` | optional string | `YYYY-MM-DD` |
| `unlocks` | string[] | cosmetic ids |
| `createdAt` | number | |

**Indexes:** `by_parentId` (`parentId`)

### `missions`

| Field | Type | Notes |
|-------|------|-------|
| `slug` | string | e.g. `mission_01_mars_dust` |
| `title` | string | |
| `planetId` | string | e.g. `rusty_ridge` |
| `gradeBand` | string | |
| `estimatedMinutes` | number | |
| `skillTags` | string[] | |
| `status` | string | `draft` \| `published` |
| `sentences` | `{ id: string, text: string }[]` | stable evidence ids |
| `objective` | string | kid-facing |
| `createdAt` | number | |

**Indexes:** `by_slug` (`slug`), `by_status` (`status`)

### `questions`

| Field | Type | Notes |
|-------|------|-------|
| `missionId` | Id\<missions\> | |
| `key` | string | e.g. `q1_locate_wall` |
| `order` | number | 1..n |
| `type` | string | `locate` \| `main_idea_mc` \| `vocab_in_context_mc` \| `infer_mc` \| `exit_main_idea_mc` |
| `prompt` | string | |
| `choices` | optional `{ id: string, text: string }[]` | A/B/C |
| `correctChoiceId` | optional string | |
| `correctEvidenceIds` | string[] | exact match set OR anyOf policy in grader |
| `evidenceRule` | string | `exact` \| `anyOf` |
| `stemSentenceId` | optional string | vocab |
| `hints` | string[4] | static ladder |
| `xpKind` | string | `question` \| `exit` |

**Indexes:** `by_missionId` (`missionId`), `by_missionId_order` (`missionId`, `order`)

### `attempts`

| Field | Type | Notes |
|-------|------|-------|
| `kidId` | Id\<kids\> | |
| `missionId` | Id\<missions\> | |
| `status` | string | `active` \| `completed` |
| `startedAt` | number | |
| `completedAt` | optional number | |
| `questionResults` | `{ questionKey: string, correct: boolean, hintsUsed: number, evidenceId?: string, choiceId?: string, xpAwarded: number }[]` | |
| `xpEarned` | number | rollup |
| `firstDailyBonus` | boolean | |

**Indexes:** `by_kidId` (`kidId`), `by_kid_mission` (`kidId`, `missionId`), `by_kid_status` (`kidId`, `status`)

### `hintEvents`

| Field | Type | Notes |
|-------|------|-------|
| `attemptId` | Id\<attempts\> | |
| `questionKey` | string | |
| `step` | number | 1..4 |
| `source` | string | `static` \| `grok` |
| `text` | string | shown to kid |
| `createdAt` | number | |

**Indexes:** `by_attemptId` (`attemptId`), `by_attempt_question` (`attemptId`, `questionKey`)

### `xpLedger`

| Field | Type | Notes |
|-------|------|-------|
| `kidId` | Id\<kids\> | |
| `attemptId` | optional Id\<attempts\> | |
| `reason` | string | `question` \| `exit_ticket` \| `mission_complete` \| `first_daily` |
| `delta` | number | |
| `balanceAfter` | number | |
| `createdAt` | number | |

**Indexes:** `by_kidId` (`kidId`), `by_kidId_createdAt` (`kidId`, `createdAt`)

---

## 7. Pure functions (scoring, level, evidence, BH gate)

All pure logic lives under `lib/eh/pure/` (or equivalent) and is unit-tested without Convex/Clerk.

### Question XP (q1–q4)

| Hints used before correct | XP |
|---------------------------|----|
| 0 (clean) | **20** |
| 1 | **14** |
| 2 | **10** |
| 3+ | **6** |

### Exit ticket (q5)

- **25 XP flat** once correct (hints do not reduce overnight — keep simple).
- Retries allowed until correct.

### Mission complete

- **+15 XP** when all questions in the mission are correct (retries allowed).

### First daily mission

- **+20 XP** profile-level once per local day (first completed mission that day).

### Level thresholds

| Level | Cumulative XP to reach |
|-------|-------------------------|
| 1 | 0 |
| 2 | **100** |
| 3 | **250** |
| 4 | **450** |
| 5 | **700** |

Formula aligned with brief: 100 to L2, then +50 per level step (150, 200, 250…).

```ts
export function levelForXp(xp: number): number {
  const thresholds = [0, 100, 250, 450, 700];
  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i + 1;
  }
  // Beyond L5: continue +50 pattern if needed later; overnight may cap display at L5+.
  return level;
}
```

### Black-hole gate

```ts
export function isBlackHoleUnlocked(kid: { level: number; streakDays: number }): boolean {
  return kid.level >= 5 || kid.streakDays >= 5;
}
```

Mission 1 does **not** touch BH content — gate helper only.

### Evidence grading

- **Default:** `exact` — selected evidence id must equal the single correct id.
- **Q4:** `anyOf` evidence `[s5, s6]` **AND** MC choice `B` must both be correct.
- Reject evidence-only or choice-only on infer items that require both.

```ts
export function gradeEvidence(rule: "exact" | "anyOf", selected: string, acceptable: string[]): boolean {
  if (rule === "exact") return acceptable.length === 1 && selected === acceptable[0];
  return acceptable.includes(selected);
}
```

---

## 8. Mission runtime + hint ladder + Grok action

### Runtime states

1. `brief` — planet / objective  
2. `read` — passage on cream card; optional read-aloud later  
3. `ready` — kid continues to questions  
4. `question` — active question index  
5. `feedback` — correct / incorrect after **Check**  
6. `debrief` → optional `level-up`  
7. `complete`

Wrong answer → stay on question; Hint available; never auto-reveal the answer letter on steps 1–2.

### Hint ladder (4 steps)

| Step | Intent | XP impact when eventually correct |
|------|--------|-----------------------------------|
| 1 | Narrow attention / re-read cue | 14 |
| 2 | Rephrase / eliminate trap | 10 |
| 3 | Narrow to ~2 candidates (no answer letter) | 6 |
| 4 | Location glow / soft highlight; **still require kid Check/tap** | 6 |

Hints **never** state the answer letter or exact sentence id on steps 1–2. Step 4 may highlight location but still requires the kid’s action.

### Hint button

- Always **GOLD** (`button-hint`)
- Not the primary CTA
- Primary confirm remains **Check** (teal)

### Grok action (server-side only)

- Convex action `hints:generate` (name flexible) calls xAI only when `XAI_API_KEY` present.
- System rules: age-appropriate; never give the answer; short; push back to text/evidence; respect step intent.
- **On any failure / missing key → static hint text from question seed.**
- Overnight: leave `XAI_API_KEY` unset; static path must be covered by tests.
- Never ship API keys to the client.

---

## 9. Full Mission 1 JSON seed

Copy target: `lib/eh/fixtures/mission01.ts` (and Convex seed morning).  
Sentence / prompt / choice / hint text below is **verbatim** from `docs/missions/mission-01.md`.

```json
{
  "id": "mission_01_mars_dust",
  "title": "Dust Storm on Mars",
  "planetId": "rusty_ridge",
  "planetLabel": "Rusty Ridge (Mars sector)",
  "gradeBand": "3-5",
  "estimatedMinutes": 10,
  "skillTags": [
    "locate_evidence",
    "main_idea",
    "vocabulary_in_context",
    "simple_inference"
  ],
  "status": "published",
  "objective": "Scan the Mars transmission. Use your telescope to find the clues that prove what the dust storm did.",
  "sentences": [
    {
      "id": "s1",
      "text": "Maya’s rover rolled across the red sand of Mars."
    },
    {
      "id": "s2",
      "text": "The sky looked pale and calm at first."
    },
    {
      "id": "s3",
      "text": "Then a wall of dust rose in the distance."
    },
    {
      "id": "s4",
      "text": "The wind grew stronger and pushed grit against the rover’s cameras."
    },
    {
      "id": "s5",
      "text": "Maya could not see the rocks ahead."
    },
    {
      "id": "s6",
      "text": "She parked the rover and waited inside."
    },
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
    {
      "id": "q1_locate_wall",
      "order": 1,
      "type": "locate",
      "xpKind": "question",
      "prompt": "Which sentence shows when the dust storm **first appeared**?",
      "evidenceRule": "exact",
      "correctEvidenceIds": ["s3"],
      "distractorTraps": ["s4", "s2", "s7"],
      "hints": [
        "Look near the beginning — something in the sky **changes**.",
        "Find the sentence where the dust **shows up**, not where it bothers the cameras.",
        "It’s one of these ideas: the calm sky · **a wall of dust rises** · grit on the cameras. Which one is the *start*?",
        "Telescope glow on the wall-of-dust sentence (still require tap)."
      ]
    },
    {
      "id": "q2_main_idea",
      "order": 2,
      "type": "main_idea_mc",
      "xpKind": "question",
      "prompt": "What is this transmission mostly about?",
      "choices": [
        { "id": "A", "text": "Maya builds a new rover on Earth." },
        {
          "id": "B",
          "text": "A dust storm pauses Maya’s drive on Mars, then she continues."
        },
        { "id": "C", "text": "Mars has more oceans than Earth." }
      ],
      "correctChoiceId": "B",
      "evidenceRule": "exact",
      "correctEvidenceIds": [],
      "hints": [
        "Ask: what happens from start to finish?",
        "Cross out choices that never appear in the transmission.",
        "Keep the choice that includes **storm → wait → drive again**.",
        "Soft highlight whole passage; still require selecting B."
      ]
    },
    {
      "id": "q3_vocab_grit",
      "order": 3,
      "type": "vocab_in_context_mc",
      "xpKind": "question",
      "prompt": "In the sentence about the cameras, what does **grit** mean?",
      "stemSentenceId": "s4",
      "choices": [
        { "id": "A", "text": "Tiny bits of sand and dust" },
        { "id": "B", "text": "A brave feeling" },
        { "id": "C", "text": "A soft blanket" }
      ],
      "correctChoiceId": "A",
      "evidenceRule": "exact",
      "correctEvidenceIds": ["s4"],
      "hints": [
        "Reread the camera sentence. What is the wind pushing?",
        "In a dust storm, what tiny stuff would hit a camera?",
        "Courage is another meaning of “grit,” but does that fit **pushed against cameras**?",
        "Spotlight the cameras sentence; still require choosing A."
      ]
    },
    {
      "id": "q4_infer_why_park",
      "order": 4,
      "type": "infer_mc",
      "xpKind": "question",
      "prompt": "Why did Maya park the rover?",
      "choices": [
        { "id": "A", "text": "She wanted to take a nap for fun." },
        {
          "id": "B",
          "text": "She could not see safely, so she waited for the storm to ease."
        },
        { "id": "C", "text": "The rover ran out of snacks." }
      ],
      "correctChoiceId": "B",
      "evidenceRule": "anyOf",
      "correctEvidenceIds": ["s5", "s6"],
      "requiresChoiceAndEvidence": true,
      "hints": [
        "What problem did Maya have right before she parked?",
        "Connect “could not see” with what she did next.",
        "Evidence is probably the seeing problem or the parking sentence — not the “two hours later” sentence alone.",
        "Glow the seeing / parking sentences; still require answer B + tap."
      ]
    },
    {
      "id": "q5_exit_ticket",
      "order": 5,
      "type": "exit_main_idea_mc",
      "xpKind": "exit",
      "prompt": "Chart this planet: What should explorers remember about Mars dust storms from this report?",
      "choices": [
        {
          "id": "A",
          "text": "They can block a trip for a time, but they end and travel can start again."
        },
        { "id": "B", "text": "They melt the rover’s wheels every time." },
        { "id": "C", "text": "They only happen on Earth." }
      ],
      "correctChoiceId": "A",
      "evidenceRule": "exact",
      "correctEvidenceIds": ["s8"],
      "exitTicketXp": 25,
      "hints": [
        "What lesson does the last sentence teach?",
        "Do storms here destroy everything forever, or pause a trip?",
        "Match the choice to “stop for a while” / “do not last forever.”",
        "Glow the last sentence; still require A."
      ]
    }
  ],
  "scoring": {
    "questionXp": { "0": 20, "1": 14, "2": 10, "3": 6 },
    "exitTicketXp": 25,
    "missionCompleteXp": 15,
    "firstDailyXp": 20
  },
  "stars": {
    "1": "complete",
    "2": "complete_and_at_least_3_clean_on_q1_q4",
    "3": "all_clean_q1_q4_and_exit_clean"
  }
}
```

**Note on hint step 4 wording:** Product UI may implement glow by `evidenceSentenceId` (`s3`, `s4`, `s5`/`s6`, `s8`) even when kid-facing copy avoids saying the id aloud. Do not renumber sentence ids without migrating attempts.

---

## 10. Slices 1–6 (overnight)

Each slice: **Files / Done (fixtures) / Tests / Quality overnight**.  
PR-per-slice sequential (§11).

### Slice 1 — Shell, hub chrome, design tokens, fixture landing

**Agent:** `bc-c7fa884b` — **RUNNING — do not restart.**

| | |
|--|--|
| **Files** | Theme tokens from `DESIGN.md`; hub route `/hub`; four-corner chips; app shell; `VITE_EH_DATA` wiring stub if missing |
| **Done (fixtures)** | Fixture mode loads `/hub` with four chips (Missions teal/star, Hangar teal/rocket, Library cream/book, Academy cream/telescope) without Clerk/Convex |
| **Tests** | Hub renders in fixture mode; no crash without env keys |
| **Quality overnight** | Screenshot hub vs `docs/design-refs/` when available; lint/typecheck clean on touched files |

**Handoff note:** If Slice 1 assumed live Clerk, **Slice 2’s first commit** adds `EhData` + `fixtureAdapter` and redirects UI — do not thrash Slice 1 visuals.

### Slice 2 — EhData + fixture adapter + Mission 1 read/questions UI

| | |
|--|--|
| **Files** | `lib/eh/data.ts`, `lib/eh/client.ts`, `lib/eh/fixtureAdapter.ts`, `lib/eh/fixtures/mission01.ts`, `/missions`, `/mission/$id` read + question chrome (cream card, telescope, Check teal, Hint gold) |
| **Done (fixtures)** | Full Mission 1 playable offline: read passage, five questions, Check/Hint wired to fixture state |
| **Tests** | Fixture mission load; Q1 locate accepts `s3`; Q4 requires B + anyOf `s5`/`s6`; tests pass with no Clerk/Convex |
| **Quality overnight** | Mission screenshot vs design refs; Hint gold not teal; CTA label Check |

### Slice 3 — Pure scoring + attempts + debrief + Level Up

| | |
|--|--|
| **Files** | `lib/eh/pure/xp.ts`, `level.ts`, `evidence.ts`, `bhGate.ts`; fixture attempt lifecycle; `/debrief`; `/level-up` |
| **Done (fixtures)** | XP awards match §7; level thresholds; first-daily once; debrief numbers correct; Level Up route when threshold crossed |
| **Tests** | Table-driven XP/level/evidence/BH gate unit tests; attempt completion rollup |
| **Quality overnight** | Level Up is a real screen; reduced-motion path doesn’t break |

### Slice 4 — Hint ladder + Grok action skeleton + static fallback

| | |
|--|--|
| **Files** | Hint step state in adapter; Convex action stub `convex/hints.ts` (or similar); static fallback always; wire Hint gold button |
| **Done (fixtures)** | 4-step ladder from Mission 1 seed; step 4 glow still requires Check/tap; no answer leak on steps 1–2 |
| **Tests** | Static hints without `XAI_API_KEY`; hint XP reductions; action falls back when key missing |
| **Quality overnight** | Hint button uses `button-hint` gold token |

### Slice 5 — Parent gate + onboarding + hangar/library/academy stubs

| | |
|--|--|
| **Files** | `/onboarding`, `/parent/gate`, `/parent`, stubs for `/hangar` `/library` `/academy`; fixture PIN `1234` |
| **Done (fixtures)** | Kid create/select; parent PIN gate; stubs render in fantasy chrome without dead ends from hub |
| **Tests** | PIN accept `1234` / reject others in fixture; gate blocks parent stats |
| **Quality overnight** | Parent UI quieter but same palette family |

### Slice 6 — convexAdapter sketch + convex-test + Playwright screenshots + CI fixture path

| | |
|--|--|
| **Files** | `lib/eh/convexAdapter.ts` (may be partial), `convex/schema.ts` tables §6, seed helper, Playwright specs, CI env `VITE_EH_DATA=fixture` |
| **Done (fixtures)** | `aubr check` green with no Clerk keys / no Convex URL; screenshots for hub + mission + level-up archived under artifacts or `docs/design-refs/actuals/` |
| **Tests** | `convex-test` schema/seed smoke; Playwright fixture e2e Mission 1 happy path |
| **Quality overnight** | Document morning flip only — do not require cloud for merge |

---

## 11. PR-per-slice sequential merge

1. One PR per slice (Slices 2–6; Slice 1 already in flight).
2. Base each PR on the previously merged slice branch / `main` after merge.
3. Merge command:

```bash
gh pr merge --squash
```

4. If `403` on merge to `main`, **stack** the next PR onto the previous slice branch and keep the stack green.
5. Cursor bot previously merged docs PRs **#1** and **#2** — do not reopen those; continue numbering forward.
6. Do not land app code in this docs PR except optional README one-liner (§ this file + README link only for the docs land).

---

## 12. Env

### Overnight ONLY

```bash
VITE_EH_DATA=fixture
```

No Clerk keys. No Convex URL. No `XAI_API_KEY`. Fixture PIN `1234`.

### Morning (Robert Mac) — additional

| Var | Purpose |
|-----|---------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk |
| `CLERK_SECRET_KEY` | Clerk |
| `CLERK_JWT_ISSUER_DOMAIN` | Convex auth (via setup script) |
| `VITE_CONVEX_URL` | from `aubx convex dev` |
| `PIN_PEPPER` | Convex env — parent PIN hashing |
| `XAI_API_KEY` | optional — Grok hints; omit to keep static |
| `VITE_EH_DATA=convex` | flip off fixtures |

---

## 13. Morning Mac checklist (copy-paste for Robert)

1. `aube install`
2. `aubx clerk@latest auth login`
3. `./scripts/setup-clerk-auth.sh` (or `aubr setup:clerk`)
4. `aubx convex dev --until-success` (ensure `VITE_CONVEX_URL` in `.env.local`)
5. `aubx convex env set PIN_PEPPER <long-random-string>`
6. Set `VITE_EH_DATA=convex` in `.env.local` (flip off fixture default)
7. `aubr dev`
8. iPad: Add to Home Screen → open → run **Mission 1** end-to-end (Check + Hint gold + debrief)
9. Optional verify: unset `XAI_API_KEY` → static hints still work; visual compare vs `docs/design-refs/`; parent PIN (not `1234` in prod — set real PIN through parent gate)

---

## 14. Do not reopen

Locked decisions — do not re-litigate overnight:

1. Practice reading-comp only; not homework OCR helper  
2. PWA, not Expo/Flutter overnight  
3. Grok hints server-side only; static fallback mandatory  
4. No runtime mission generation  
5. No WebGL on mission question flow  
6. Hint = **GOLD** (`button-hint`); Check = **teal CTA**  
7. CTA label = **Check** (not Scan) on answer confirm  
8. Level Up = dedicated screen  
9. Kid = data row, not Clerk user  
10. Mission 1 sentence ids `s1`–`s8` stable  
11. Q4 evidence `anyOf` `[s5, s6]` AND choice `B`  
12. Exit ticket **25 flat**  
13. Question XP 20/14/10/6  
14. Mission complete +15; first daily +20  
15. Levels L2@100 L3@250 L4@450 L5@700  
16. BH gate `level>=5 OR streak>=5`  
17. Four-corner hub labels fixed  
18. Toy-3D / jelly look from `DESIGN.md` — bake-off A/C out  
19. Slice 1 agent `bc-c7fa884b` — do not restart  
20. PR-per-slice sequential  
21. **`VITE_EH_DATA=fixture` is default overnight**  
22. **UI never calls Convex from components — only via `EhData`**  
23. **Tests must pass with no Clerk keys and no Convex URL**  
24. **Fixture PIN `1234` is dev-only; never ship as production default**

---

## 15. Overnight definition of done

### Done

- [ ] `docs/EVENT-HORIZON-V1-IMPLEMENTATION-PLAN.md` landed (this file)
- [ ] Slices 1–6 implemented per §10 **or** clearly stacked as PRs with Slice 1 not double-started
- [ ] Fixture default path plays Mission 1 without cloud
- [ ] Unit tests for pure XP/level/evidence/BH
- [ ] Fixture adapter tests without Clerk/Convex env
- [ ] Screenshots: hub, mission (cream card + Check/Hint), Level Up
- [ ] `aubr check` green under `VITE_EH_DATA=fixture`

### Not done (morning / later)

- [ ] iPad A2HS acceptance (Robert §13)
- [ ] Live Clerk hosted sign-in polish
- [ ] Live Convex cloud seed in prod
- [ ] Grok live hint quality tuning
- [ ] Full art pack / BH mission content pack

---

## 16. Target file tree (Event Horizon additions)

```
lib/eh/
  data.ts                 # EhData interface
  client.ts               # getEhData() factory; default fixture
  fixtureAdapter.ts
  convexAdapter.ts
  fixtures/
    mission01.ts          # §9 seed
    session.ts            # optional in-memory session
  pure/
    xp.ts
    level.ts
    evidence.ts
    bhGate.ts
    hints.ts              # step selection helpers

app/routes/
  hub.tsx
  missions.tsx
  mission.$id.tsx
  debrief.tsx
  level-up.tsx
  hangar.tsx
  library.tsx
  academy.tsx
  onboarding.tsx
  parent.tsx
  parent.gate.tsx

components/eh/
  HubChip.tsx
  ReadingCard.tsx
  CheckButton.tsx         # teal CTA
  HintButton.tsx          # GOLD
  TelescopeReticle.tsx
  ChoicePill.tsx
  XpBadge.tsx
  LevelUpView.tsx

convex/
  schema.ts               # §6 tables
  kids.ts
  missions.ts
  attempts.ts
  hints.ts                # action + static fallback
  parent.ts
  xp.ts
  seed.ts                 # Mission 1 seed

docs/
  EVENT-HORIZON-V1-IMPLEMENTATION-PLAN.md   # this file
  PRODUCT-BRIEF.md
  missions/mission-01.md
  design-refs/            # optional screenshots / Imagine stills

DESIGN.md
```

Starter-kit files outside `lib/eh`, EH routes, and EH components stay unless a slice must touch theme/providers for fixture auth skip.

---

## 17. Convex API sketch

Morning / `convexAdapter` mapping. Names normative enough to implement without redesign.

| Function | Type | Purpose |
|----------|------|---------|
| `parents.getOrCreate` | mutation | Clerk → parent row |
| `parents.verifyPin` | action/mutation | check PIN vs hash |
| `parents.setPin` | mutation | set/update PIN hash with `PIN_PEPPER` |
| `kids.list` | query | by parent |
| `kids.create` | mutation | create kid row |
| `kids.get` | query | kid profile |
| `missions.listPublished` | query | mission summaries |
| `missions.getBySlug` | query | mission + questions |
| `attempts.start` | mutation | active attempt |
| `attempts.submitAnswer` | mutation | grade via pure fns; write questionResults; xpLedger |
| `attempts.requestHint` | mutation | increment step; persist hintEvents; may schedule action |
| `hints.generate` | action | Grok or static fallback |
| `attempts.complete` | mutation | +15 complete; first-daily +20; streak; level |
| `parent.progress` | query | missions completed, streak, weak tags |

All kid-facing reads/writes from UI go through `EhData` — **not** raw hooks in presentational components.

---

## 18. Quality overnight vs morning

### Overnight (agents / CI)

| Gate | Requirement |
|------|-------------|
| Lint / types / unit | `aubr check` with `VITE_EH_DATA=fixture` |
| Secrets | Pass with **no** Clerk keys, **no** Convex URL, **no** `XAI_API_KEY` |
| Visual | Screenshots vs `docs/design-refs/` (hub, mission, level-up) |
| UX contract | Hint gold; Check CTA; no WebGL on missions |
| Content | Mission 1 verbatim sentences/questions |
| Adapters | UI only via `EhData` |

### Morning (Robert)

| Gate | Requirement |
|------|-------------|
| Clerk + Convex | §13 checklist |
| PIN | Real pepper + non-default PIN |
| iPad | A2HS Mission 1 full loop |
| Optional Grok | Set `XAI_API_KEY`; confirm fallback still works when unset |
| Visual | Side-by-side with design refs on device |

---

## Handoff

**This docs PR:** land this file (+ optional README link). No app implementation in the docs-only change.

**Slice 1 (`bc-c7fa884b`):** leave running; do not restart.

**Next implementation agent after Slice 1 merges / lands:**

1. Confirm hub chrome from Slice 1  
2. If live Clerk was assumed → add `EhData` + `fixtureAdapter` immediately (`VITE_EH_DATA=fixture` default)  
3. Execute Slice 2 → 6 sequentially, PR-per-slice  
4. Keep Hint GOLD, Check CTA, Mission 1 seed verbatim  
5. Stop at overnight DoD (§15); leave §13 for Robert  

**Binding reminders:** fixtures default · Morning Mac checklist §13 · Mission 1 seed §9 · Slices 1–6 §10 · do-not-reopen fixture rules 21–24.

END OF CONTRACT.
