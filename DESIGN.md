---
version: alpha
name: Event Horizon
description:
  Toy-like stylized 3D space reading game for grades 3–5. Soft cinematic hub,
  glassy jelly UI, readability-first mission panels.
colors:
  primary: "#2EC4B6"
  primary-pressed: "#24A99D"
  secondary: "#F5E6D3"
  tertiary: "#F0C75E"
  tertiary-glow: "#FFD978"
  neutral: "#1B1430"
  surface: "#241B3D"
  surface-elevated: "#2E2450"
  nebula-pink: "#C77DFF"
  nebula-magenta: "#E056A0"
  on-primary: "#0B1F1D"
  on-secondary: "#2A1F14"
  on-tertiary: "#2A2208"
  on-surface: "#F4F0FF"
  on-surface-muted: "#B8AED4"
  reading-panel: "#FFF8F0"
  on-reading: "#1A1528"
  highlight: "#5EEAD4"
  highlight-soft: "#5EEAD466"
  success: "#3DDC97"
  warning: "#F0C75E"
  error: "#FF6B8A"
  accretion: "#FF8A4C"
  black-hole: "#0A0614"
  star: "#FFE8A3"
  border-glass: "#FFFFFF33"
typography:
  display:
    fontFamily: Nunito
    fontSize: 40px
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Nunito
    fontSize: 28px
    fontWeight: 800
    lineHeight: 1.2
  headline-md:
    fontFamily: Nunito
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.25
  body-lg:
    fontFamily: Nunito
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.65
  body-md:
    fontFamily: Nunito
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.55
  body-sm:
    fontFamily: Nunito
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.45
  label-lg:
    fontFamily: Nunito
    fontSize: 18px
    fontWeight: 800
    lineHeight: 1.2
  label-md:
    fontFamily: Nunito
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.2
  label-sm:
    fontFamily: Nunito
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.04em
  xp:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: 800
    lineHeight: 1
rounded:
  sm: 12px
  md: 20px
  lg: 28px
  xl: 36px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  tap-min: 48px
  gutter: 20px
  margin: 24px
  panel-pad: 28px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 16px
    height: 56px
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 16px
    height: 56px
  button-hint:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 14px
    height: 48px
  button-choice:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 16px
    height: 56px
  button-choice-selected:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.on-primary}"
  button-choice-wrong:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.error}"
  button-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-primary}"
  evidence-highlight:
    backgroundColor: "{colors.highlight-soft}"
    textColor: "{colors.on-reading}"
  nebula-canvas:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
  nebula-canvas-muted:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
  reward-star:
    backgroundColor: "{colors.star}"
    textColor: "{colors.on-tertiary}"
  black-hole-ring:
    backgroundColor: "{colors.accretion}"
    textColor: "{colors.on-tertiary}"
  black-hole-core:
    backgroundColor: "{colors.black-hole}"
    textColor: "{colors.on-surface}"
  glass-panel:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.on-surface}"
  warning-chip:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-tertiary}"
  reading-card:
    backgroundColor: "{colors.reading-panel}"
    textColor: "{colors.on-reading}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.xl}"
    padding: 28px
  hub-chip:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: 16px
    height: 64px
  xp-badge:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.tertiary}"
    typography: "{typography.xp}"
    rounded: "{rounded.full}"
    padding: 12px
---

# Event Horizon — DESIGN.md

Agent-facing visual identity for **Event Horizon** (subtitle: Read to explore).
Follow [DESIGN.md](https://github.com/google-labs-code/design.md). Tokens above
are normative; prose below explains how to apply them.

## Overview

Event Horizon is a **toy-like stylized 3D** space reading game for a child in
grades 3–5. The emotional target is **wonder + clarity**: cozy spaceship
adventure, never grimdark, never babyish clutter, never hard military sci-fi.

**Locked look (hub reference):** matte plastic / clay materials, faceted
low-poly planets, soft cinematic lighting with depth of field, pastel
purple–magenta–deep-blue nebula, young explorer often seen from behind on a
glowing stone platform, and **glassy jelly UI** — large teal/cream pills with
gold star accents and chunky 3D icons.

Product constraints that shape the UI:

- **Tablet-first PWA**; huge tap targets; mission screens stay **2D and
  readable** even if the hub is 3D.
- Passages live on a cream **reading panel** — readability always beats
  spectacle.
- Telescope = evidence scanner (circular reticle / soft teal highlight on a
  sentence).
- Black holes are **friendly awe** (bright accretion ring), never horror void.
- Short labels only: Missions, Hangar, Library, Academy, Scan, Hint, Level Up —
  no technobabble.

Stack note: ship on Robert’s web-app-starter-kit (TanStack Start, Convex, Clerk,
shadcn). Prefer mapping these tokens into CSS variables / Tailwind theme rather
than inventing a second palette.

## Colors

The world is a dreamy nebula; interactive chrome is **teal jelly** and
**cream**; celebration is **soft gold**.

- **Primary (`#2EC4B6`):** Teal — primary actions (Launch, Scan, Check, hub
  Missions).
- **Secondary (`#F5E6D3`):** Warm cream — secondary hub chips, reading-adjacent
  surfaces.
- **Tertiary (`#F0C75E`):** Soft gold — XP, stars, Hint, reward sparkle (not the
  only CTA).
- **Neutral / surface (`#1B1430`, `#241B3D`, `#2E2450`):** Deep space ink for
  canvas and elevated panels.
- **Nebula accents (`#C77DFF`, `#E056A0`):** Background atmosphere only — never
  body text.
- **Reading panel (`#FFF8F0` on `#1A1528` text):** High-contrast passage
  surface.
- **Highlight (`#5EEAD4`):** Evidence / selected sentence glow (soft, not neon
  chaos).
- **Accretion (`#FF8A4C`) + black-hole (`#0A0614`):** Reward / black-hole
  moments — cute ring, not void horror.
- **Error (`#FF6B8A`):** Soft coral for wrong answers — always pair with
  icon/shape, never red-vs-green alone.

Keep one strong action color per screen (usually primary teal). Gold is garnish
and XP, not a competing CTA.

Atmosphere tokens (`nebula-*`, `border-glass`, `tertiary-glow`) are for
**backgrounds, gradients, and borders only** — never as text fill behind body
copy.

## Typography

**Nunito** is the single family — rounded, friendly, excellent at large sizes
for developing readers.

- **Display / headlines:** Extra-bold for hub titles and Level Up moments.
- **Body-lg (22px / 1.65):** Default **passage** size on tablet; never shrink
  passages to fit art.
- **Body-md:** Choices, hints, supporting copy.
- **Labels:** Bold/extra-bold short words on jelly buttons; avoid all-caps walls
  of text (small tracking on `label-sm` only).
- **XP:** Extra-bold numerals next to star icons.

Do not introduce a second display font for v1. Parent screens may reuse the same
scale at slightly denser sizes.

## Layout

Tablet-first, landscape-comfortable. Missions use a **single focal column**:
reading card center, choices below, tools (Scan / Hint) in a thumb-friendly
bottom band. Hub can be scenic full-bleed with corner jelly chips.

- Base rhythm: **8px** scale (`sm`/`md`/`lg`…).
- Minimum tap height: **48px** (`tap-min`); prefer 56px for primary actions.
- Reading card internal padding: **28px** (`panel-pad`).
- Safe margins ~24px from screen edges; avoid putting critical controls under
  notches / home indicators.
- Prefer containment: passage + questions in one elevated card stack so the
  nebula stays background, not noise behind glyphs.

## Elevation & Depth

Depth comes from **cinematic lighting and layered translucency**, not heavy
Material shadows.

- Hub: real/fake 3D scene with shallow DoF; UI floats as glassy pills with soft
  bloom.
- Missions: flatter. Soft shadow or 1px glass border (`border-glass`) under the
  reading card; keep the passage plane calm.
- Selected evidence: soft teal wash (`highlight-soft`), not a harsh outline
  storm.
- Rewards: brief bloom / star sparkle; one motion verb at a time.

Honor `prefers-reduced-motion`: hard cuts, still nebula, no parallax
requirement.

## Shapes

Everything interactive is **highly rounded** — jelly language.

- Pills / primary buttons: `rounded.full`.
- Cards / choice rows: `rounded.lg`–`xl` (20–36px).
- Telescope / scanner: circular reticle.
- Avoid sharp 4px admin-tool radii on kid surfaces. Parent PIN screens may
  tighten slightly but stay in-family.

## Components

- **button-primary:** Teal jelly pill — Launch, Scan (confirm), Check. 56px
  tall, full radius.
- **button-secondary:** Cream jelly — Library / Academy-style secondary hub
  actions.
- **button-hint:** Gold jelly — Hint only; never the primary path.
- **button-choice / selected:** Elevated dark glass rows; selected gains teal
  soft fill + check affordance.
- **reading-card:** Cream panel, large Nunito body, generous padding; blank of
  chrome inside the text well.
- **hub-chip:** Oversized corner jelly (Missions / Hangar / Library / Academy)
  with chunky icon + short label.
- **xp-badge:** Pill with star + bold XP count.

States: pressed = slightly darker teal; disabled = 40% opacity, still readable
label. Wrong answer = coral icon + gentle shake (or static X if reduced motion)
— never shame copy.

## Do's and Don'ts

- Do keep mission text on the cream reading panel at ≥22px with airy
  line-height.
- Don’t place passage text directly on nebula / busy 3D backgrounds.
- Do use teal for the single primary action per view; gold for
  XP/Hint/celebration only.
- Don’t mix flat comic ink outlines or parchment Zelda-map chrome into the
  default kid UI (those bake-offs are out).
- Do keep black holes cute (eyes/smile optional) with a bright accretion ring —
  awe, not fear.
- Don’t use franchise lookalikes, horror voids, military gore, or watermarks on
  gameplay art.
- Do hit ~48–56px tap targets; thumb zones at the bottom on tablets.
- Don’t rely on red/green alone for correctness — add icons/shapes.
- Do map these tokens into the starter-kit theme; don’t invent a parallel
  palette in components.
- Don’t generate runtime AI images per mission — prebake assets to match this
  identity.
