# Deferred follow-ups

Single consolidated tracker for known, intentionally-deferred work surfaced during the
build — each item is scoped enough to become its own step/ticket. Per-component audit detail
lives in `docs/a11y/<component>.md`; manual screen-reader checks live in
`docs/a11y/manual-testing.md`. This file is the index of what's deferred and why.

## Design tokens / styling

- **Configured `extendTailwindMerge` for guaranteed cross-component `className` overrides.**
  `cx` is a plain joiner, so a consumer `className` that conflicts with a component default
  on the _same_ property (e.g. another `text-*` color) resolves by stylesheet order, not
  last-wins. A token-aware `tailwind-merge` config (classGroups generated from the token
  source) would make overrides deterministic. Deferred to its own step — first investigate
  blast radius across the text / bg / border / ring color groups + font-size. (Stock twMerge
  conflates our custom `text-<size>` and `text-<color>` tokens, which is why it was decoupled
  from the Stage 3 commit rather than shipped half-configured.) **Now unblocked (2026-06-26,
  ADR-0004):** the private `--mc-*` namespace is the model its classGroups were waiting on.
- ✅ **Primitive ↔ Tailwind namespace collision — RESOLVED (2026-06-26) →
  `docs/adr/0004-token-namespace-collision.md`.** Primitives moved to a private `--mc-*`
  namespace (authored under an `mc` key in `tokens/primitive/*.json`); primitives whose value
  coincides with stock Tailwind (`radius`, `font.weight`, `leading.normal`) dropped in favour of
  stock utilities. Components repointed `rounded-md`→`rounded-lg` (Button, TextField) and
  `leading-prose`→`leading-normal` (Heading); `Link`'s `rounded-sm` now resolves to stock .25.
  Verified render-identical via a throwaway Astro page (Storybook being down — see below).

## Figma / token sync

- **Item H — point Figma variable code-syntax at the semantic layer, never the primitives.**
  Figma's consumable references are the **semantic** tokens (bare-named, e.g. `--color-primary`) —
  the public surface that both code and Figma consume. Set each Figma variable's code syntax to its
  semantic token (e.g. `var(--color-primary)`) and **explicitly do not** reference the private
  `--mc-*` primitives: primitives are internal, and wiring Figma to `--mc-*` would re-introduce the
  exact tier-boundary violation the rename (ADR-0004) removed. Semantic names are unchanged by the
  rename, so the task is a correctness/guardrail pass — ensure no Figma variable still points at a
  now-renamed primitive — not a bulk re-map. Mechanism: the Figma **plugin code-connect path**; the
  variables REST API is ruled out (Enterprise-gated). Ref the "Set Figma variable code syntax…" rule
  in `.claude/rules/tokens.md`.
- **`.claude/rules/tokens.md` Figma example is stale post-rename.** Its example
  `var(--color-bg-primary)` is a non-existent, bare `--color-*` name; since `--color-*` is now
  semantic-only (primitives are private `--mc-*`), it reads ambiguously. Replace it with a real
  semantic token (e.g. `var(--color-primary)`) and add a note that Figma maps to **semantic** tokens,
  not the private `--mc-*` primitives; align with item H (plugin path). Its own deliberate `.claude/`
  change — **not** done this session.

## Components

- **Button — distinct `pressed` token.** Pressed currently reuses the hover token; a
  dedicated pressed treatment would better reflect the interaction model. Ref `docs/a11y/button.md` (#2).
- **Icon-only stories + accessible-name guard (Button, Link).** JSDoc already requires
  `aria-label` for icon-only usage; add demonstrating stories (and consider a dev-time guard)
  when icon-only usage actually ships. Ref `docs/a11y/button.md`, `docs/a11y/link.md`.
- **Heading — empty-heading & ref.** `children` permits empty content (empty `<hN>`) and no
  `ref` is forwarded. Ref `docs/a11y/heading.md` (Notes / known limitations).

## Surfaces / theming

- **Surface contracts for dark/inverted sections.** Components inherit text color by design;
  before any non-white surface ships, add a rule to `src/components/CLAUDE.md` requiring any
  section that overrides text color to prove its foreground/background pair meets WCAG 1.4.3
  (4.5:1 normal / 3:1 large). Ref `docs/a11y/heading.md` (#2).

## Docs sync

- ✅ **Storybook doc-sync to v10 — DONE** (CLAUDE.md, README.md, SETUP.md, seed/linear-import.csv).
  `docs/research/*` left as point-in-time historical records.
- ✅ **Astro 7 upgrade — LANDED (2026-07-14, INC-220).** `astro@7.0.9`, `@astrojs/react@6.0.1`,
  and `@vitejs/plugin-react@6.0.3` (Storybook held at 10.4.6); full gate ladder green including
  `build-storybook` under Vite 8 / Rolldown and the ADR-mandated accessibility-reviewer
  re-audit (Button, PASS). June's blocker reattributed: not `@storybook/builder-vite` — the
  then-pipeline had no JSX plugin at all. Full record in `docs/adr/0002-astro-version-pin.md`
  ("Re-attempt — 2026-07-14").

## Content / narrative

- **`docs/case-study-notes.md` — decide whether build-incident notes live in the repo.** The
  build surfaced teachable incidents worth a portfolio case study — the `tailwind-merge`
  custom-token drop (see Design tokens above), the Astro 7 / Vite 8–Rolldown Storybook block
  (ADR-0002), and the sub-AA contrast catches (`docs/a11y/*`). The technical record already lives
  in ADRs / `docs/a11y` / build journal; this is the separate **Stage 5 narrative-layer decision**
  of whether to also capture an incident → fix → lesson narrative in-repo.

## Storybook workbench — RESOLVED

- ✅ **Storybook rendered nothing — "React is not defined" (dev _and_ static build)
  — RESOLVED (2026-06-26) → commit `1213b36`.** `@vitejs/plugin-react` was present
  in the store only as a transitive dep of `@astrojs/react` — unresolved at the
  project root and unwired in `.storybook/main.ts` `viteFinal`, so
  `@storybook/react-vite`'s preset (docgen plugins only) left no JSX transform under
  `tsconfig` `jsx:"preserve"`, and every story threw at runtime. `build-storybook`
  exited 0 (it bundled fine), masking the failure until `storybook dev` was first
  actually run. Fix: pinned `@vitejs/plugin-react@5.2.0` (already the in-tree version
  via `@astrojs/react`) and `unshift(react())` ahead of the docgen plugins in
  `viteFinal`. Render-proven at runtime, not green-build-assumed — Link/InProse
  (inline JSX) and Button render with a clean console in both `pnpm storybook` and
  the served `storybook-static`. (The token work that this had blocked was verified
  via a throwaway Astro page instead — see ADR-0004.)

## CI / build gate

- **CI is red until Stage 6.** `ci.yml` runs on push to `main` + PRs but fails at the lint step —
  eslint / vitest / Playwright + axe / lhci and their configs aren't installed until Stage 6.
  Expected, not a defect (no branch protection, no deploy gating; goes green at Stage 6).
- **pnpm ignores `sharp` / `esbuild` build scripts on Cloudflare Pages — deferred (trigger is
  future, not blocking).** The first Cloudflare Pages production deploy (`d14b827`) logged `sharp`
  and `esbuild` under pnpm's "Ignored build scripts" warning — pnpm 10's default of not running a
  dependency's install/build scripts unless it is allow-listed. The build still succeeded (static,
  1 page) because nothing exercised those native binaries. **Trigger:** when Astro build-time image
  optimization is introduced (`astro:assets` / `<Image>` / `getImage` rely on `sharp`), the ignored
  `sharp` build script can fail the production build (missing native binary); `esbuild` is
  lower-risk here (its platform binary resolved via an optional dep this build) but belongs in the
  same fix. **Resolution when triggered:** allow-list the needed deps via pnpm
  `onlyBuiltDependencies` in `package.json` (or `pnpm approve-builds`), as a deliberate,
  separately-reviewed config change (its own commit; exact-pin discipline). Verify by (a) the next
  build log no longer listing them under "Ignored build scripts" and (b) image-optimization output
  actually produced.
- **Soft-404 — unmatched routes return 200 instead of 404 — deferred (tracked: `INC-223`).**
  The first Cloudflare Pages production deploy (`2bf9d1b`, `michaelstates-com.pages.dev`)
  serves HTTP 200 with the index page for unmatched paths instead of a 404. **Cause:** no
  `dist/404.html` in the build output because there is no `src/pages/404.astro`, so Cloudflare
  Pages falls back to a 200 index response for unmatched routes. **Why it matters:**
  correctness + SEO — a missing URL returning 200 lets search engines index junk paths and gives
  users no not-found signal. **Resolution:** add `src/pages/404.astro` (Astro emits
  `dist/404.html`, served with a proper 404), as its own isolated branch/PR — the first source
  change to exercise the build path since deploy, i.e. the first non-no-op production deploy;
  filed under the `INC-180` deferred/hardening epic.
