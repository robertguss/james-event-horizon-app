#!/usr/bin/env node
/**
 * Overnight visual gate without Playwright: static HTML of missions list
 * showing locked BH row (L1 / streak 0) for side-by-side review.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const actualsDir = join(root, "docs/design-refs/actuals");
mkdirSync(actualsDir, { recursive: true });

const missions = [
  {
    kind: "standard",
    title: "Dust Storm on Mars",
    planet: "Rusty Ridge (Mars sector)",
    locked: false,
  },
  {
    kind: "stub",
    title: "Ice Rings Ahead",
    planet: "Glass Halo (Saturn sector)",
    locked: true,
    lockMessage: "Coming soon — chart more sectors first.",
  },
  {
    kind: "stub",
    title: "Comet Trail Clues",
    planet: "Silver Wake (Kuiper sector)",
    locked: true,
    lockMessage: "Coming soon — chart more sectors first.",
  },
  {
    kind: "blackHole",
    title: "Accretion Whisper",
    planet: "Friendly Horizon (Black-hole sector)",
    locked: true,
    lockMessage: "Reach level 5 or a 5-day streak to open black holes.",
  },
];

const cards = missions
  .map((m) => {
    const badge =
      m.kind === "blackHole"
        ? "Black hole"
        : m.kind === "stub"
          ? "Chart stub"
          : "Next up";
    const action = m.locked
      ? `<div class="locked" data-locked="true"><strong>Locked — not a dead end</strong><p>${m.lockMessage}</p></div>`
      : `<a class="cta" href="#">Launch mission</a>`;
    return `<article class="card" data-kind="${m.kind}" data-locked="${m.locked}">
  <p class="eyebrow">${badge}</p>
  <h2>${m.title}</h2>
  <p class="planet">${m.planet}</p>
  ${action}
</article>`;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Slice 5 — Missions list (locked BH)</title>
  <style>
    :root {
      --primary: #2EC4B6;
      --secondary: #F5E6D3;
      --on-reading: #1a1428;
      --cream: #FFF8F0;
    }
    body {
      margin: 0;
      font-family: "Trebuchet MS", "Segoe UI", sans-serif;
      background: radial-gradient(circle at top, #3a2a5c, #1a1428 55%);
      color: var(--on-reading);
      padding: 2rem;
    }
    h1 { color: #fff; }
    .card {
      background: var(--cream);
      border-radius: 36px;
      padding: 1.75rem;
      margin: 1rem 0;
      max-width: 36rem;
    }
    .eyebrow {
      text-transform: uppercase;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: 0.04em;
      font-size: 0.85rem;
    }
    .locked {
      margin-top: 1rem;
      background: color-mix(in srgb, var(--secondary) 80%, white);
      border-radius: 1rem;
      padding: 1rem 1.25rem;
    }
    .cta {
      display: inline-flex;
      margin-top: 1rem;
      background: var(--primary);
      color: #fff;
      font-weight: 800;
      text-decoration: none;
      padding: 0.75rem 1.25rem;
      border-radius: 999px;
    }
    [data-kind="blackHole"] { outline: 2px solid #FF8A4C; }
  </style>
</head>
<body>
  <h1>Missions — locked BH visible (L1 / streak 0)</h1>
  ${cards}
</body>
</html>
`;

const out = join(actualsDir, "slice-5-missions-locked-bh.html");
writeFileSync(out, html);
console.log("Wrote docs/design-refs/actuals/slice-5-missions-locked-bh.html");
