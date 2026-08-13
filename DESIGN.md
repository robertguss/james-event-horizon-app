---
version: alpha
name: Event Horizon
description: Toy-like stylized 3D space reading game for grades 3–5. Soft cinematic hub, glassy jelly UI, readability-first mission panels.
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
    lineHeight: 1.2
  headline-lg:
    fontFamily: Nunito
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.25
  headline-md:
    fontFamily: Nunito
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.3
  body-lg:
    fontFamily: Nunito
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.65
  body-md:
    fontFamily: Nunito
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.45
  label-lg:
    fontFamily: Nunito
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.2
  label-md:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.2
  label-sm:
    fontFamily: Nunito
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.2
  xp:
    fontFamily: Nunito
    fontSize: 20px
    fontWeight: 800
    lineHeight: 1.1
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
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 16px
    height: 56px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 16px
    height: 56px
  button-hint:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.tertiary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 12px
    height: 48px
  button-choice:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 16px
    height: 56px
  button-choice-selected:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 16px
    height: 56px
  button-choice-wrong:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 16px
    height: 56px
  button-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 16px
    height: 56px
  evidence-highlight:
    backgroundColor: "{colors.highlight-soft}"
    textColor: "{colors.on-reading}"
    rounded: "{rounded.sm}"
  nebula-canvas:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
  nebula-canvas-muted:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
  reward-star:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.full}"
  black-hole-ring:
    backgroundColor: "{colors.accretion}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
  black-hole-core:
    backgroundColor: "{colors.black-hole}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
  glass-panel:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: 28px
  warning-chip:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 8px
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
  xp-badge:
    backgroundColor: "{colors.tertiary-glow}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.xp}"
    rounded: "{rounded.full}"
    padding: 8px
---

## Overview

Toy-like stylized 3D space adventure for a son-facing reading game (grades 3–5). Soft, cinematic, premium-kid. Wonder and clarity over spectacle.

The locked look is matte plastic / clay low-poly worlds in a pastel purple–magenta–deep-blue nebula, soft cinematic lighting with depth of field, and glassy jelly UI in teal and cream with gold star accents. Hub and rewards speak toy-3D; mission reading panels stay high-contrast cream so readability beats spectacle. Not grimdark, not flat comic, not busy adventure-map clutter.

## Colors

The canvas is dreamy purple/magenta nebula over deep space blue (`neutral`, `surface`, `nebula-pink`, `nebula-magenta`). Primary actions use teal (`primary` / `primary-pressed`); secondary surfaces and pills use cream (`secondary`); stars and XP accents use soft gold (`tertiary`, `tertiary-glow`, `star`).

Black holes use a luminous orange/magenta accretion ring (`accretion`) around a friendly dark core (`black-hole`) — awe, never void horror. Passage UI uses `reading-panel` / `on-reading` for high contrast. Evidence taps use soft teal glow (`highlight` / `highlight-soft`), not neon chaos. Semantic states: `success`, `warning`, `error`. Glass edges use `border-glass`.

## Typography

Nunito throughout — friendly sans for kids. Passage text is `body-lg` (22px / 1.65) on the reading card. UI labels stay short and clear (“Scan,” “Hint,” not technobabble) via `label-*`. Headlines and hub titles use `display` / `headline-*`. XP and level numbers use the bold `xp` style.

## Layout

Tablet-first PWA with generous margins (`margin` 24px, `gutter` 20px). Tap targets meet `tap-min` (48px). Mission flow centers a large reading card with side/bottom controls; hub places large corner chips (Missions, Hangar, Library, Academy). Panel padding is `panel-pad` (28px). Keep one job per screen: hub presence, then calm reading/scan, then short reward.

## Elevation & Depth

Hub/home: soft cinematic lighting and shallow depth of field — hero ship/explorer sharp, distant nebula soft. Mission screens: flatten the background (muted nebula) so the cream reading card sits clearly above. Glass panels use translucent elevated surfaces (`surface-elevated` + `border-glass`) with soft shadows, not hard sci-fi HUD chrome. Optional light 3D only on map/home; question flow stays flat 2D.

## Shapes

Heavy corner radius: pills and CTAs at `rounded.full`; cards and choice rows at `rounded.lg` / `rounded.xl`. Telescope / scanner is circular. Big rounded jelly buttons and chunky 3D icons. No sharp military corners; no dense parchment map frames.

## Components

- **Primary / secondary buttons** — large glassy jelly pills (teal primary, cream secondary); pressed state darkens teal.
- **Hint** — quieter elevated chip with gold accent so kids can ask without crowding the answer path.
- **Choices** — cream pills; selected = teal highlight; wrong = soft error blush, then ladder continues.
- **Reading card** — cream/off-white elevated panel, large type, blank of busy art behind text.
- **Evidence highlight** — soft teal glow on the tapped sentence.
- **Hub chips** — Missions / Hangar / Library / Academy as large corner jelly buttons with gold stars / chunky icons.
- **XP badge / reward star** — gold glow accents for unlocks.
- **Black-hole ring + core** — friendly accretion ring language for gated missions and unlock moments.
- **Glass panel / warning chip / nebula canvas** — shell chrome and status; muted canvas during reading.

## Do's and Don'ts

**Do**
- Lead with wonder and clarity; keep mission text readable first.
- Use matte plastic / clay toy-3D for hub, ship, rewards.
- Keep labels short: Missions, Hangar, Library, Academy, Scan, Hint, Level Up.
- Honor big taps, heavy radius, soft shadows, and `prefers-reduced-motion`.
- Treat black holes as luminous awe (bright accretion ring), not horror.

**Don't**
- Flat comic ink outlines as the default (bake-off A is out).
- Top-down parchment adventure map as the default (bake-off C is out).
- Busy backgrounds behind passage text.
- Horror black holes, military gore, franchise lookalikes, or watermarks.
- Hard-edged sci-fi HUD, photoreal space, or neon chaos on evidence highlights.
