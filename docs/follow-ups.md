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
  from the Stage 3 commit rather than shipped half-configured.)
- **Primitive scales collide with Tailwind's default theme-variable namespaces.** Our
  primitives in `:root` share Tailwind's `--font-weight-*`, `--radius-*`, `--leading-*`, and
  `--color-neutral-*` names; `tokens.css` is imported after `tailwindcss`, so ours win.
  Values **coincide** for some (`--font-weight-bold` 700, `--radius-sm` .25rem,
  `--leading-normal` 1.5) but **differ** for `--radius-md` (ours .5rem vs Tailwind .375rem),
  `--leading-tight` (1.15 vs 1.25), and the whole `--color-neutral-*` ramp — so our primitives
  silently re-value Tailwind's built-in `rounded-md` / `leading-*` / `neutral-*` utilities.
  **Load-bearing — NOT a no-op cleanup:** components use `rounded-md`/`rounded-sm`, and
  `--leading-heading` resolves through `--leading-tight`, so renaming primitives would shift
  component radius/leading appearance.
  **Decide the intended model in its own step — AFTER the Astro 7 upgrade, with component
  re-verification:** move primitives to a private namespace (e.g. `--mc-*`) vs. deliberately
  adopt them as the Tailwind theme via `@theme`. **Candidate ADR.**

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
- **Astro 7 upgrade — OPEN.** Attempted 2026-06-24, blocked by Vite 8 / Rolldown ↔
  `@storybook/builder-vite` JSX incompatibility; reverted clean. Re-attempt when Storybook ships
  stable Vite 8 / Rolldown support. Full record + re-attempt pins (`astro@7.0.2` +
  `@astrojs/react@6.0.0`) in `docs/adr/0002-astro-version-pin.md` ("Fast-follow attempt").

## Content / narrative

- **`docs/case-study-notes.md` — decide whether build-incident notes live in the repo.** The
  build surfaced teachable incidents worth a portfolio case study — the `tailwind-merge`
  custom-token drop (see Design tokens above), the Astro 7 / Vite 8–Rolldown Storybook block
  (ADR-0002), and the sub-AA contrast catches (`docs/a11y/*`). The technical record already lives
  in ADRs / `docs/a11y` / build journal; this is the separate **Stage 5 narrative-layer decision**
  of whether to also capture an incident → fix → lesson narrative in-repo.

## CI / build gate

- **CI is red until Stage 6.** `ci.yml` runs on push to `main` + PRs but fails at the lint step —
  eslint / vitest / Playwright + axe / lhci and their configs aren't installed until Stage 6.
  Expected, not a defect (no branch protection, no deploy gating; goes green at Stage 6).
