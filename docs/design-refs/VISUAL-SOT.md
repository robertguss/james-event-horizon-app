# Event Horizon — Visual Source of Truth

**Status:** Locked visual SoT from Robert (Aug 2026).

## Authority split

| Layer                         | Source                              | Role                                                              |
| ----------------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| Color, type, component tokens | Root [`DESIGN.md`](../../DESIGN.md) | Normative for palette, typography, button roles, spacing          |
| Chrome, composition, art look | JPEGs in this folder                | Look authority for scene framing, jelly chrome, props, and layout |

Implementers should follow `DESIGN.md` for token values and these images for how
the product should _look_ on screen.

## Inventory

| File                                                 | Screen         | What to match                                                                                                     |
| ---------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------- |
| [`01-mission-reader.jpeg`](./01-mission-reader.jpeg) | Mission Reader | Cream/white passage card in teal + gold frame; five-pill interaction bar (Check / choices / Hint); telescope prop |
| [`02-level-up.jpeg`](./02-level-up.jpeg)             | Level Up       | Teal + gold “Level Up” banner; toy ship with rainbow trail; celebratory nebula + confetti                         |
| [`03-home-hub.jpeg`](./03-home-hub.jpeg)             | Home Hub       | Explorer on glowing platform; four corner cards — Missions, Hangar, Library, Academy                              |

## Short notes

- **Mission Reader:** Thick teal outer frame + gold inner edge on the reading
  panel. Bottom bar is five large jelly pills (not a dense toolbar). Check is
  teal; middle three are choice pills (gold / teal / gold in the mock); Hint
  sits on the right.
- **Level Up:** Full-bleed celebration — ship as the hero, banner as the only
  headline chrome, soft gold sparkle and confetti. Minimal copy.
- **Home Hub:** Scenic full-bleed vista with corner navigation cards (teal
  Missions / Hangar; cream Library / Academy), each with a chunky 3D icon,
  label, gold star, and chevrons.

## Mild tensions (resolve this way)

1. **Hint color:** The Mission Reader JPEG shows a teal Hint pill. Prefer **gold
   Hint** per `DESIGN.md` (`button-hint`) for role clarity — gold = assist / XP,
   teal = primary Check. Do not make Hint compete with Check.
2. **Choice pills vs older dark-glass rows:** The five-pill bar in
   `01-mission-reader.jpeg` is SoT for choice chrome. Prefer these glossy
   teal/gold jelly pills over older elevated dark-glass choice rows described
   elsewhere in design notes.
