# ADR 0002: Pin Astro 6.4.8 now; fast-follow to Astro 7

- Status: Accepted (fast-follow completed 2026-07-14 — Astro 7 landed via INC-220; see "Re-attempt — 2026-07-14" below)
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
re-run the full build + `build-storybook` + a11y gate. **Vite 8 / Rolldown is a different
compile path, so the re-attempt must also re-run the `accessibility-reviewer` agent on at least
one primitive — the rendered output cannot be assumed identical to the Vite 7 build and must be
re-audited, not waved through.** Kept open in `docs/follow-ups.md`.

## Re-attempt — 2026-07-14 (INC-220): landed

Astro 7 landed on the second attempt with an amended matrix. The June re-attempt trigger
("Storybook ships stable Vite 8 / Rolldown support") never fired and is superseded: it rested
on a misattribution. `@storybook/builder-vite` never owned JSX transformation — its preset
adds only docgen plugins — so waiting on Storybook could not have unblocked anything.

**What June actually ran.** At the 2026-06-24 attempt, the Storybook pipeline contained no
React JSX plugin at all: `@vitejs/plugin-react` entered `package.json` and `viteFinal` two
days later (`1213b36`, 2026-06-26, fixing the unrelated "React is not defined" render bug —
see `docs/follow-ups.md`, "Storybook workbench"). Under Vite 7 that gap was masked at build
time (esbuild transformed `.tsx` implicitly; the breakage was runtime-only and undiscovered).
Under Vite 8, Rolldown enables no implicit JSX transform — hence `[PARSE_ERROR] ... JSX
syntax is disabled` at build. The install stayed silent in June because every peer range in
the tree was satisfied — `@vitejs/plugin-react@5.2.0` (in-tree via `@astrojs/react@6.0.0`)
already peer-allowed `vite ^8` — so nothing could warn; the incompatibility had no surface
until build time. (That 5.2.0 also shipped `@rolldown/pluginutils@1.0.0-rc.3` is
corroborating detail on how close, yet short of Vite-8-native, that line was — not the
cause.)

**Matrix (exact pins, hand-edited in `package.json`; lockfile via `pnpm install` only):**

| package                   | June attempt                       | INC-220                       |
| ------------------------- | ---------------------------------- | ----------------------------- |
| astro                     | 7.0.2                              | 7.0.9                         |
| @astrojs/react            | 6.0.0                              | 6.0.1                         |
| @vitejs/plugin-react      | absent from the Storybook pipeline | 6.0.3 (wired since `1213b36`) |
| storybook + @storybook/\* | 10.4.6                             | 10.4.6 — deliberately held    |

**Resolved tree after install (node 22.16.0, pnpm 10.33.0):** one standalone `vite@8.1.4`
serves every consumer (`pnpm why vite`: "Found 1 version"); `rolldown@1.1.5`. Install exit 0
with zero peer warnings; the only advisories were five deprecated transitive subdependencies
and pnpm's default-ignored build script (`esbuild@0.28.1`). Two `@vitejs/plugin-react`
instances exist by design: ours (6.0.3) drives the Storybook + Vitest pipeline;
`@astrojs/react@6.0.1` internally still uses 5.2.0 on the Astro build path — the path that
passed even in June.

**Gate results.** Baseline = the full ladder re-run on `main` @ `35fa9d2` the same day, all
green — including `pnpm build-storybook`, which CI does not run.

| gate                                     | baseline (6.4.8 / Vite 7.3.5)            | INC-220 (7.0.9 / Vite 8.1.4)                               |
| ---------------------------------------- | ---------------------------------------- | ---------------------------------------------------------- |
| `pnpm install`                           | n/a                                      | exit 0, zero peer warnings                                 |
| `pnpm build`                             | exit 0, 3 pages                          | exit 0, dist inventory identical                           |
| emitted-CSS token gate                   | 5/5 `--color-code-*` defs; prose present | counts identical to baseline                               |
| `pnpm build-storybook`                   | exit 0                                   | exit 0; zero PARSE_ERROR / JSX-syntax hits                 |
| `pnpm test`                              | 33/33                                    | 33/33 (stories re-run through axe, hard-fail mode)         |
| `pnpm test:a11y`                         | 8/8                                      | 8/8                                                        |
| `pnpm lint`                              | clean                                    | clean — `astro check` 0 errors on 36 files (Rust compiler) |
| accessibility-reviewer re-audit (Button) | n/a                                      | PASS (AA) — zero rendered drift under Rolldown             |

**Finding.** The June hypothesis is corrected in two layers: (1) confirmed — the blocker was
never `@storybook/builder-vite`; (2) refined — the JSX transform we control was not merely
the pre-Vite-8 major in June, it was absent from the pipeline entirely. With Storybook held
at exactly 10.4.6 and the Vite-8-native `@vitejs/plugin-react@6.0.3` wired, the June failure
signature does not reproduce. Residual confound, recorded for honesty: Vite's patch level
necessarily differs from June (8.1.4 today; June's exact 8.0.x went unrecorded), and the
5.2.0-wired permutation was never tested under Rolldown — 6.0.3 is the proven-green pin.

**Source/config changes required by the v7 migration guide: none.** `astro.config.mjs` uses
no removed experimental flags; `src/fetch.ts` (now reserved) does not exist; the Rust
compiler's stricter HTML parsing produced zero diagnostics.

**Corrections to the June section above (append-only; the original text stands as written):**

- "our pages import no React components" was imprecise — `404.astro` statically renders the
  React `Heading` and `Link` primitives (zero hydration). The real June distinction was that
  Astro's build path had a working JSX transform under Rolldown while the Storybook pipeline
  had none.
- The June re-attempt trigger and pins are superseded by this section; the corresponding
  `docs/follow-ups.md` entry is closed alongside this change.

**Carried forward (pre-existing, surfaced by the re-audit — not a migration regression):**
`--color-ring` and `--color-primary` both alias `--mc-color-terracotta-600` (independent
INC-242 / INC-244 decisions), so the focus ring on primary/small fills is same-hue behind a
2px offset gap. Contrast math passes (ring vs background 5.80:1, per the INC-244 proof); a
deliberate design pass — or a documented acceptance in `docs/a11y/button.md` — is
recommended so the coincidence doesn't read as unexamined.
