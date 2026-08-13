#!/usr/bin/env node
/**
 * Overnight visual gate without Playwright: assert art pack files exist and
 * cosmetics swatches match DESIGN.md tokens. Optional HTML preview under
 * docs/design-refs/actuals/ for side-by-side review.
 */
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const DESIGN_TOKENS = {
  primary: "#2EC4B6",
  tertiary: "#F0C75E",
  nebulaMagenta: "#E056A0",
  nebulaPink: "#C77DFF",
  accretion: "#FF8A4C",
  secondary: "#F5E6D3",
  success: "#3DDC97",
};

const ART_FILES = [
  "paint_default.webp",
  "paint_nebula_01.webp",
  "paint_solar_01.webp",
  "scope_teal_01.webp",
  "planet_rocky_01.webp",
  "ship_base.webp",
  "bh_unlock_01.webp",
];

const EXPECTED_SWATCHES = {
  paint_default: DESIGN_TOKENS.primary,
  paint_nebula_01: DESIGN_TOKENS.nebulaMagenta,
  paint_solar_01: DESIGN_TOKENS.tertiary,
  scope_teal_01: DESIGN_TOKENS.primary,
  planet_rocky_01: DESIGN_TOKENS.accretion,
};

let failed = false;
for (const file of ART_FILES) {
  const path = join(root, "public/art", file);
  try {
    const st = statSync(path);
    if (st.size < 32) {
      console.error(`FAIL ${file}: too small (${st.size})`);
      failed = true;
    } else {
      console.log(`OK   ${file} (${st.size} bytes)`);
    }
  } catch {
    console.error(`FAIL ${file}: missing`);
    failed = true;
  }
}

const cosmeticsSrc = readFileSync(join(root, "lib/cosmetics.ts"), "utf8");
for (const [id, swatch] of Object.entries(EXPECTED_SWATCHES)) {
  if (!cosmeticsSrc.includes(id)) {
    console.error(`FAIL catalog missing id ${id}`);
    failed = true;
  }
  if (!cosmeticsSrc.includes(swatch)) {
    console.error(`FAIL catalog missing swatch ${swatch} for ${id}`);
    failed = true;
  }
}

const globals = readFileSync(join(root, "app/globals.css"), "utf8");
if (!globals.includes("prefers-reduced-motion")) {
  console.error("FAIL globals.css missing prefers-reduced-motion");
  failed = true;
}
if (!globals.includes("eh-hub-drift")) {
  console.error("FAIL globals.css missing eh-hub-drift");
  failed = true;
}

const levelUp = readFileSync(
  join(root, "components/event-horizon/level-up-view.tsx"),
  "utf8",
);
if (!levelUp.includes("prefers-reduced-motion")) {
  console.error("FAIL level-up-view missing prefers-reduced-motion");
  failed = true;
}

const actualsDir = join(root, "docs/design-refs/actuals");
mkdirSync(actualsDir, { recursive: true });
const preview = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>EH Slice 4 art tokens</title>
  <style>
    body { font-family: Nunito, system-ui, sans-serif; background: #1B1430; color: #F4F0FF; padding: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
    figure { margin: 0; text-align: center; }
    img { width: 128px; height: 128px; border-radius: 20px; border: 2px solid #FFFFFF33; }
    .swatch { height: 12px; border-radius: 999px; margin-top: 8px; }
  </style>
</head>
<body>
  <h1>Hangar art pack (placeholders)</h1>
  <p>Reduced-motion: hub/level-up CSS strips required parallax/video/confetti.</p>
  <div class="grid">
    ${ART_FILES.map((file) => {
      const id = file.replace(/\.webp$/, "");
      const swatch = EXPECTED_SWATCHES[id] ?? "#2EC4B6";
      return `<figure><img src="../../../public/art/${file}" alt="${id}" /><figcaption>${id}</figcaption><div class="swatch" style="background:${swatch}"></div></figure>`;
    }).join("\n")}
  </div>
</body>
</html>
`;
writeFileSync(join(actualsDir, "slice-4-hangar-art.html"), preview);
console.log("Wrote docs/design-refs/actuals/slice-4-hangar-art.html");

if (failed) {
  process.exit(1);
}
console.log("Art + DESIGN token check passed");
