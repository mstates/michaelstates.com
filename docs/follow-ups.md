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

## Storybook workbench — BLOCKING

- **Storybook renders nothing — "React is not defined" (dev _and_ static build).**
  `@vitejs/plugin-react` is absent from the dependency tree and is not wired into
  `.storybook/main.ts` `viteFinal`, so the `@storybook/react-vite` framework has no JSX transform
  and every story throws at runtime. `build-storybook` exits 0 (it bundles fine), so the failure
  was masked — discovered 2026-06-26 when `storybook dev` was first actually run. **Blocking
  priority:** Storybook is the component workbench where the accessibility work is demonstrated, so
  this gates all further component work and the manual screen-reader pass. Fix: add
  `@vitejs/plugin-react` and apply it in `viteFinal`, then re-verify a story renders and the a11y
  addon runs. (The token work was verified via a throwaway Astro page instead — see ADR-0004.)

## CI / build gate

- **CI is red until Stage 6.** `ci.yml` runs on push to `main` + PRs but fails at the lint step —
  eslint / vitest / Playwright + axe / lhci and their configs aren't installed until Stage 6.
  Expected, not a defect (no branch protection, no deploy gating; goes green at Stage 6).
