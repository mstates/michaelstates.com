# ADR 0002: Pin Astro 6.4.8 now; fast-follow to Astro 7

- Status: Accepted (amended 2026-06-24 — fast-follow to Astro 7 attempted and blocked; see "Fast-follow attempt" below)
- Date: 2026-06-22
- Relates to: ADR-0001 (framework choice — unchanged; this records the _version_)

## Context

Astro 7.0.0 was published on 2026-06-22 — the same day we scaffolded — so
`pnpm create astro@latest` generates Astro 7 by default. ADR-0001 specified
"Astro 6," which was the current major when that decision was recorded. We had to
choose, at scaffold time, between the brand-new 7.0.0 and the mature 6.x line.

Findings that informed the call (npm registry + the official v7 upgrade guide):

- **Maturity gap.** 7.0.0 was hours old with **zero patch releases** (last beta 3
  days prior). Astro 6 was at **6.4.8** — ~3.5 months and 8 patch lines of
  hardening, and the version every integration was stabilized against.
- **Integration readiness.** All our deps have Astro-7-compatible releases, but
  the 7-side ones (`@astrojs/react@6.0.0`, on Vite 8) were **also published the
  same day**. The mature, Astro-6-aligned line is `@astrojs/react@5.x` (Vite 7).
  `react-aria-components` and `@tailwindcss/vite` are framework-agnostic and work
  on either major.
- **Breaking changes 6→7 that touch us are minimal.** The headline change is the
  Rust compiler becoming the default (stricter HTML parsing — aligned with our
  valid-HTML discipline). `output: 'static'`, React island APIs, the no-adapter
  Cloudflare static path, and tsconfig are all unaffected. Removed APIs
  (`@astrojs/db`, `astro:transitions` internals, `getContainerRenderer` move) are
  ones we don't use.
- **Project priority.** SETUP.md is explicit — _"reliability over novelty… where
  bleeding-edge and rock-solid pull against each other, choose solid."_ This is the
  week we build and show the site, and a major released hours ago with a new
  default compiler is exactly that tension; the priority resolves it toward 6.x.

## Decision

Pin **Astro 6.4.8** (`astro@^6`) with **`@astrojs/react@5.x`**, React **19.2.7**,
Tailwind v4 (`@tailwindcss/vite` + `tailwindcss`), and `react-aria-components`.

**Fast-follow:** upgrade to Astro 7 deliberately once it has a couple of patch
releases (likely within the build week) via `pnpm dlx @astrojs/upgrade`, re-running
the full CI/a11y gate. Because the 6→7 changes affecting us are minimal, this is a
low-friction, low-risk move once 7 has settled.

## Consequences

- Easier: lowest day-zero risk during the critical build/show week; integrations
  on their battle-tested majors; **no documentation churn** (ADR-0001, CLAUDE.md,
  README all still say "Astro 6," which remains accurate).
- Harder: we are one major behind "latest" until the fast-follow lands; the
  upgrade is a tracked follow-up rather than free-on-scaffold.
- Tooling note: `astro add` was intentionally **not** used for the React/Tailwind
  wiring — on a non-latest Astro it would pull today's Astro-7-era integration
  `latest` and a Vite-8 mismatch. Integrations were added with explicit pins and
  `astro.config.mjs` wired by hand instead.

## Alternatives considered

- **Adopt Astro 7.0.0 now** — true newest-major signal, zero greenfield migration
  cost. Rejected for this week on day-zero-major risk (new default Rust compiler,
  no patch releases) against the project's explicit "choose solid" priority. Will
  be revisited as the fast-follow above.

## Follow-up

- [ ] Track the Astro 7 upgrade as a Linear issue once the MCP connectors are live
      (SETUP.md Stage 4–5). Deferred here because Linear is not yet connected.

## Fast-follow attempt — 2026-06-24 (blocked, reverted)

The fast-follow above was attempted as its own isolated step: `astro@7.0.2` +
`@astrojs/react@6.0.0`, both pinned exact (not via `pnpm dlx @astrojs/upgrade`, which writes
caret ranges — we wanted deliberate exact pins). `@astrojs/react@6.0.0` is the coordinated
React-integration major that Astro 7 requires because 7 moves Vite 7 → 8.

**Result: blocked by the toolchain, not by Astro.** Astro 7 pulls Vite 8, and Vite 8 makes
Rolldown the default bundler. `@storybook/builder-vite@10.4.6` cannot transform `.tsx` JSX
under Rolldown — `pnpm build-storybook` failed with
`[PARSE_ERROR] Unexpected JSX expression ... JSX syntax is disabled`. The Astro static build
(`pnpm build`) passed, because our pages import no React components; the break is confined to
the Storybook component workbench. That workbench is where the accessibility work is
demonstrated and audited, so shipping Astro 7 without it is not acceptable.

**Reverted clean** to `astro@6.4.8` / `@astrojs/react@5.0.7` (Vite 7). `pnpm build` and
`pnpm build-storybook` were both green afterward and the tree was clean — the original
decision above stands unchanged.

**Re-attempt trigger:** Storybook ships stable Vite 8 / Rolldown support (i.e.
`@storybook/builder-vite` can transform JSX under Rolldown). Re-attempt pins remain
`astro@7.0.2` + `@astrojs/react@6.0.0` — re-confirm both are still current at that time and
re-run the full build + `build-storybook` + a11y gate. Kept open in `docs/follow-ups.md`.
