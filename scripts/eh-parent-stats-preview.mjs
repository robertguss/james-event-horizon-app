#!/usr/bin/env node
/**
 * Overnight visual gate without Playwright: static HTML of parent mini-stats.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const actualsDir = join(root, "docs/design-refs/actuals");
mkdirSync(actualsDir, { recursive: true });

const stats = {
  displayName: "James",
  missionsCompleted: 2,
  streakDays: 3,
  weakSkillTags: ["locate_evidence", "main_idea"],
  reminderEnabled: true,
  level: 2,
  xp: 120,
};

const tags = stats.weakSkillTags
  .map((tag) => `<li class="tag">${tag.replaceAll("_", " ")}</li>`)
  .join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Slice 6 — Parent mini-stats</title>
  <style>
    :root {
      --primary: #2EC4B6;
      --secondary: #F5E6D3;
      --neutral: #1B1430;
      --surface: #241B3D;
      --elevated: #2E2450;
      --on-surface: #F4F0FF;
      --muted: #B8AED4;
      --border: rgba(244, 240, 255, 0.14);
    }
    body {
      margin: 0;
      font-family: "Trebuchet MS", "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at 20% 0%, #2EC4B622, transparent 40%),
        linear-gradient(180deg, #1B1430, #241B3D);
      color: var(--on-surface);
      min-height: 100vh;
      padding: 2rem 1.5rem;
    }
    main { max-width: 32rem; margin: 0 auto; }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 700;
      color: var(--muted);
      font-size: 0.85rem;
    }
    h1 { font-size: 2rem; margin: 0.25rem 0 1.25rem; }
    .panel {
      background: color-mix(in srgb, var(--elevated) 90%, transparent);
      border: 1px solid var(--border);
      border-radius: 28px;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .label {
      text-transform: uppercase;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--muted);
    }
    .value { font-size: 2rem; font-weight: 800; margin-top: 0.35rem; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.75rem 0 0; padding: 0; list-style: none; }
    .tag {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 0.35rem 0.75rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--secondary);
    }
    .row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-top: 1rem; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 3rem;
      padding: 0 1.25rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--on-surface);
      font-weight: 800;
    }
    .btn-primary { background: var(--primary); color: #0B1F1D; border: none; width: 100%; height: 3.5rem; margin-top: 0.5rem; }
    .btn-outline { width: 100%; margin-top: 0.75rem; }
    input {
      flex: 1;
      height: 3rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--on-surface);
      padding: 0 1rem;
    }
    .name-row { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <main>
    <p class="eyebrow">Parent area</p>
    <h1>Explorer progress</h1>
    <section class="panel">
      <div class="grid">
        <div>
          <p class="label">Missions done</p>
          <p class="value">${stats.missionsCompleted}</p>
        </div>
        <div>
          <p class="label">Streak</p>
          <p class="value">${stats.streakDays} days</p>
        </div>
      </div>
      <p class="label" style="margin-top:1rem">Weak skills</p>
      <ul class="tags">${tags}</ul>
      <p style="color:var(--muted);margin:1rem 0 0">Level ${stats.level} · ${stats.xp} XP</p>
    </section>
    <section class="panel">
      <p class="label">Explorer name</p>
      <div class="name-row">
        <input value="${stats.displayName}" readonly />
        <button class="btn" type="button">Save</button>
      </div>
      <div class="row">
        <div>
          <strong>Daily reminder</strong>
          <p style="color:var(--muted);margin:0.25rem 0 0;font-size:0.9rem">Optional nudge to keep the streak going.</p>
        </div>
        <button class="btn" type="button" aria-pressed="true">${stats.reminderEnabled ? "On" : "Off"}</button>
      </div>
    </section>
    <button class="btn btn-primary" type="button">Back to kid hub</button>
    <button class="btn btn-outline" type="button">Sign out (fixture)</button>
  </main>
</body>
</html>
`;

const out = join(actualsDir, "slice-6-parent-stats.html");
writeFileSync(out, html);
console.log(`Wrote ${out}`);
