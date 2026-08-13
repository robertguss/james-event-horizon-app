# Product brief — Event Horizon (v1)

**Owner:** Robert Guss (son-facing, ~grades 3–5)  
**Status:** Ready to build (Thinking Partner, Aug 2026)  
**Working title:** **Event Horizon**  
**Subtitle (parent-facing):** Read to explore.

**Build note:** AI-native MVP speed is fine; keep scope deep on one loop, not wide.

---

## Pitch

A **space-explorer reading game** where your son levels up his ship by *understanding* what he reads — scanning passages for evidence with his telescope, charting planets, and unlocking black-hole missions. Not ChatGPT-for-homework.

---

## Who / success

| | |
|--|--|
| **Primary user** | Son (grades 3–5) |
| **Secondary** | Parent (setup + light progress), tucked away |
| **Job to be done** | Daily, fun reading-comprehension reps that force *evidence*, not guessing |
| **v1 success** | He asks to do a mission; clears a planet with tap-the-evidence; returns next day for XP/ship unlocks |

---

## App shape & tech stack (locked)

| Layer | Choice |
|-------|--------|
| **Client** | **PWA**, tablet-first (phone OK); rich space imagery + animations |
| **Base** | [web-app-starter-kit](https://github.com/robertguss/web-app-starter-kit) — TanStack Start, **Convex**, **Clerk**, TypeScript, shadcn/ui |
| **Install** | Add to Home Screen on iPad (App Store not required for v1) |
| **Mission UI** | **Deterministic** — passages, questions, taps, XP, map (no LLM required to play a turn) |
| **AI hints** | **xAI Grok API** (server-side only; Convex action). Consumer Grok/X subscription is **separate** and does **not** fund the app |
| **Secrets** | xAI API key in server env / Convex secrets (never shipped to the browser) |
| **Assets** | Compressed hero stills + selective motion (Lottie/Rive/CSS); honor reduced-motion |

**3D (v1):** Map/home shell only (React Three Fiber *or* Spline). Practice missions stay **flat 2D** for readability. No 3D text, no WebGL during question flow.

**Not for v1:** Expo/React Native, Flutter, Go (wrong lane), calling Grok from the client, using a personal Grok chat session as the backend.

---

## AI usage (locked)

- Use Grok **only** for the **Socratic hint ladder** when an answer is wrong (and optional offline content authoring later).
- System prompt hard-rules: age-appropriate; **never give the answer**; short hints; push back to the text / evidence.
- Prefer authored passages + questions with stable `evidenceSentenceId`s; don’t generate the live mission UI on the fly in v1.
- On API failure: fall back to **static hint templates** so the mission still completes.

---

## v1 in / out

**In**
- Space fantasy (planets, stars, telescope = evidence tool; black holes = special missions)
- Practice missions only (reading comprehension)
- Tap-the-evidence + multiple choice; Socratic hint ladder
- XP, levels, small cosmetic unlocks, streaks
- Optional read-aloud; large type; tablet/phone PWA
- Parent PIN / kid profile

**Out (explicit)**
- Photos / OCR / handwriting
- “I’m stuck” worksheet helper
- Cursive, writing studio, typing gym
- Full LMS, school rostering, multiplayer
- Native App Store release (unless later)

---

## Core loop — Practice mission (~8–12 min)

1. **Launch** — Map → Next mission → short planet brief  
2. **Transmission** — Read short passage (~120–250 words); optional read-aloud → “Ready to scan”  
3. **Scan (3–4 questions)** — Locate (tap sentence) · Main idea (3 choices) · Word in context · Infer (+ evidence tap) on harder / black hole  
4. **Hints ladder** (wrong): narrow paragraph → rephrase → 2 candidate sentences → optional reveal-location still requiring his tap. Smaller XP if hints used. **Grok generates hint text** within those constraints when available.  
5. **Chart the planet** — one main-idea exit ticket (MC in v1)  
6. **Debrief** — XP, unlocks, map update; optional second mission  

**Never** lead with the answer. Prefer “point to the text.”

---

## XP & unlocks (locked draft)

**XP:** clean question 20; hint1 14; hint2 10; hint3/reveal 6; exit ticket 25; mission complete 15; first daily mission +20.  
**Levels:** 100 XP to L2, then +50 XP each level (150, 200, …).  
**Unlocks (small set):** ship paints / telescope skins by level; sector stamps every 3 missions; **black hole gate** at level 5 **or** 5-day streak; ~1 black hole mission/week after gate; a couple buddy/cosmetics by L8–10.  
**Streaks:** small XP bonus; breaking streak doesn’t strip cosmetics.

---

## Black holes

Same Practice loop, harder inference, space-themed treat. Rare, gated, cosmetic payoff. Not a second game mode.

---

## Content

- Start with a **handful of high-quality passages** (mix space + non-space so skills generalize).  
- Questions authored (or AI-assisted offline) **with review**; every locate/infer item has a clear evidence sentence id.  
- Difficulty: grade band 3–5.

---

## Parent surface (minimal)

- Create kid profile, grade band, optional daily reminder  
- See: missions completed, streak, weak skill tags — no heavy dashboard in v1  
- PIN/gate so kid stays in kid mode  

---

## Data (Convex-shaped)

Kid profile, XP/level/unlocks/streak, mission attempts (question results, hints_used, evidence ids, duration), passage/question content (or CMS JSON), parent link via Clerk.

---

## Non-goals / ethics

- No “give me the answer” mode  
- Rewards reinforce thinking moves, not speed-running guesses  
- Age-appropriate content; parent-controlled account  

---

## Art & media pipeline (locked direction)

**Studio (you, ahead of time)**  
- **NASA / ESA open imagery** — real planets, nebulae, telescopes (respect attribution/credit requirements)  
- **Grok Imagine + video** (your Grok subscription) — ships, UI chrome, stylized maps, reward moments, short warp/black-hole clips  

**Theater (the PWA)**  
- Ships **prebaked** assets via `public/` or CDN — no runtime image/video generation per mission  
- Live **xAI API** remains hints-only  

**Usage rules**  
- Prefer compressed stills + a few hero motions over video-everywhere  
- Prefetch next planet art while he reads  
- Honor `prefers-reduced-motion` / parent toggle  
- Kid-safe: no horror, no gore, no sexy anthropomorphism; wonder > dread even for black holes  

### Asset inventory (v1 target)

| Slot | Count (approx) | Source lean |
|------|----------------|-------------|
| Planet stills | 12–20 | NASA + Imagine polish |
| Sector / map backgrounds | 3–5 | Imagine |
| Ship + paint variants | 1 base + 3–5 paints | Imagine |
| Telescope / scanner UI | 2–3 | Imagine |
| Reward / level-up stills | 4–6 | Imagine |
| Warp / black-hole short clips | 2–4 (3–8s) | Grok video |
| SFX (optional) | small pack | free/CC or generate |

Name assets stably: `planet_rocky_01.webp`, `bh_unlock_01.mp4`, missions reference ids only.

---

### Motion recipe (v1)

- **Map/home:** light 3D (R3F/Spline) — planet/ship presence  
- **Missions:** 2D + CSS/Framer (taps, XP, highlights); optional Ken Burns on stills  
- **Hero moments:** 2–4 short prebaked Grok video clips (warp / black-hole unlock)  
- No runtime AI video generation in-app  

## Style guide (LOCKED)

**Canonical tokens for agents/UI:** [`DESIGN.md`](../DESIGN.md) ([format](https://github.com/google-labs-code/design.md)). Prose below matches that file; prefer DESIGN.md when implementing.

**North star:** Toy-like stylized 3D space adventure — soft, cinematic, premium-kid. Wonder and clarity. Not grimdark, not flat comic, not busy Zelda-map clutter.

**Locked look (from hub reference)**  
- Stylized 3D / low-poly worlds with **matte plastic / clay** surfaces (not photoreal, not hard-edged sci-fi HUD)  
- Faceted cute planets and soft asteroids floating in a **pastel purple–magenta–deep-blue nebula**  
- Soft cinematic lighting + **depth of field** (hero sharp, distant space soft)  
- Young explorer often seen **from behind** on a glowing stone / platform hub  
- **Glassy jelly UI**: large rounded pills/cards in teal and cream, gold star accents, chunky 3D icons  
- Short labels only on art comps: Missions, Hangar, Library, Academy, Scan, Hint, Level Up

**Color**  
- Canvas: dreamy purple/magenta nebula + deep space blue  
- Accents: teal (primary actions), cream (secondary), soft gold stars  
- Black holes: luminous orange/magenta accretion *ring*, friendly awe — never void horror  
- Reading panels: high-contrast cream/off-white card — **readability beats spectacle**

**Typography (in product)**  
- Passage text: large friendly sans, generous line-height  
- UI labels: short and clear (“Scan,” “Hint,” not technobabble)

**Shapes / UI**  
- Big tap targets (min ~44px), heavy corner radius, soft shadows  
- Telescope = circular scanner / vignette for evidence highlight  
- Sentence highlight: soft teal glow, not neon chaos  

**Motion**  
- Short juicy UI (200–500ms); 3–8s hero clips only  
- One motion verb per moment; honor reduced-motion  

**Imagery mix**  
- Stylized game art is the **hero language** for hub, ship, rewards  
- Optional NASA stills only as subtle texture / parent About — don’t break the toy-3D look mid-mission  
- Same ship / explorer silhouette; unlocks = paint, fins, trails  

**Don’t**  
- Flat comic ink outlines as the default (bake-off A is out)  
- Top-down parchment adventure map as the default (bake-off C is out)  
- Busy backgrounds behind passage text  
- Horror black holes, military gore, franchise lookalikes, watermarks  

**Imagine prompt anchors (append or reuse)**  
- “3D stylized low-poly children’s space game, matte plastic toy aesthetic, soft cinematic lighting, depth of field, pastel purple magenta nebula”  
- “Glassy jelly UI buttons, teal and cream, gold star accents, rounded, high clarity, original IP”  
- “Friendly black hole with bright accretion disk, awe not fear, same toy-3D style”

## Build slice order (fast)

1. Fork/extend web-app-starter-kit → PWA shell, Clerk parent + kid profile, empty star map + fake XP  
2. One hard-coded mission end-to-end (passage, 4 questions, taps, static hints, rewards)  
3. Wire Convex action → xAI Grok for hint ladder + static fallback  
4. Cosmetics unlock + level curve + art pack (NASA + prebaked Imagine/video per style guide)  
5. 10–20 more passages; black hole gate  
6. Parent mini-stats  

---

## Open (non-blocking)

Final passage pack; whether voice input appears in v1.1; App Store wrap later. (Art style locked — see Style guide.)
