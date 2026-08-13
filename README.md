# Event Horizon

Read to explore — son-facing reading comprehension PWA (grades ~3–5)

## Docs

- [Product brief](docs/PRODUCT-BRIEF.md)
- [Design system (`DESIGN.md`)](DESIGN.md)
- [v1 overnight implementation plan](docs/EVENT-HORIZON-V1-IMPLEMENTATION-PLAN.md)
  (on `main` via #3 @ `8fba320`)
- Visual SoT: [`docs/design-refs/`](docs/design-refs/) (`VISUAL-SOT.md` +
  hub/mission JPEGs). Runtime hub scene is served from `public/hub-scene.jpeg`.

## Stack

PWA on
[robertguss/web-app-starter-kit](https://github.com/robertguss/web-app-starter-kit)
(TanStack Start, Convex, Clerk); xAI Grok server-side for Socratic hints only.

## Overnight vs Mac morning

| Mode                 | Flag                                                 | Auth / data                                                               |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------- |
| Overnight / CI / DEV | `VITE_EH_DATA=fixture` (unset in non-prod → fixture) | `lib/eh/*` fixture adapter; no Clerk keys or Convex URL needed for checks |
| Production / preview | unset ≠ fixture; set `VITE_EH_DATA=convex` for live  | Hosted Clerk + Convex; no `fixture_parent` / PIN `1234` default           |
| Mac morning (live)   | `VITE_EH_DATA=convex`                                | Clerk + Convex via **repo scripts** below                                 |

Product UI imports data only from [`lib/eh/data`](lib/eh/data.tsx). Mode /
`hostedStackEnabled()` live in [`lib/eh/mode.ts`](lib/eh/mode.ts). Fixture kid
is **James**, parent PIN **`1234`** (fixture only), home is **`/hub`**.

```bash
# Overnight green (no Clerk / no Convex URL)
VITE_EH_DATA=fixture aubr check
VITE_EH_DATA=fixture aubr test:once
```

## Setup (repo scripts — do not ad-hoc dashboard-poke)

```bash
# Non-interactive / agent
./setup.sh --yes --no-dev
# or: SETUP_NONINTERACTIVE=1 ./setup.sh --no-dev

# Day-to-day (Mac morning live)
aube install
aubx convex dev --until-success   # writes VITE_CONVEX_URL
aubx clerk@latest auth login      # once per machine (browser OAuth)
./scripts/setup-clerk-auth.sh     # or: aubr setup:clerk
aubx convex env set PIN_PEPPER "$(openssl rand -hex 32)"
# .env.local: VITE_EH_DATA=convex
aubr dev
```

See also morning checklist in
[`docs/EVENT-HORIZON-V1-IMPLEMENTATION-PLAN.md`](docs/EVENT-HORIZON-V1-IMPLEMENTATION-PLAN.md)
§13.

Env template: [`.env.example`](.env.example).

## Status

Slice 1: PWA + hub + onboarding/PIN (fixture-first overnight). Clerk OAuth
finishes on the shared Mac (cloud VMs cannot complete browser login).

Private family app / personal project.
