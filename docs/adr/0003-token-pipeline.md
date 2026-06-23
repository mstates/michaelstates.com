# ADR 0003: Design-token pipeline (Style Dictionary v5 → CSS vars + Tailwind v4 @theme)

- Status: Accepted
- Date: 2026-06-23
- Relates to: Stage 2; the three-tier rule in .claude/rules/tokens.md

## Context

Stage 2 needed a token pipeline: hand-authored W3C DTCG source → CSS custom properties,
integrated with Tailwind v4's CSS-first theme. Checking current releases (not the docs)
showed Style Dictionary is at **v5** (stable since 2025-05; `@tokens-studio/sd-transforms@2`
requires SD `^5`), so the docs' "v4" was stale. Tailwind v4 has a single `--color-*`
namespace and only `@theme {}` vars generate utilities.

## Decision

- **Style Dictionary v5.5.0 + @tokens-studio/sd-transforms 2.0.3.** Here current == mature
  == required, so no reliability tradeoff (unlike the Astro 6 hold in ADR-0002).
- **Hand-authored DTCG starter** (Figma/Tokens Studio is a later layer). sd-transforms is
  installed + `register()`-ed for that future source, but its `tokens-studio` transformGroup
  is **NOT applied** now, and **no color transform** runs — so authored `oklch(...)` strings
  pass through verbatim. Transforms: `['attribute/cti','name/kebab']` only.
- **Single generated `src/styles/tokens.css`** via a custom `css/tiered` format: primitives →
  `:root` (raw values, no utilities); semantic → `@theme` with `outputReferences` (values as
  `var(--primitive)`), so Tailwind generates semantic utilities while keeping the indirection.
  Regular `@theme` (not `@theme inline`) so a future `[data-theme="dark"]` can remap semantics.
- **Role-based flat semantic color names** (`background`, `foreground`, `surface`, `border`,
  `primary`/`primary-foreground`, `muted`, `accent`, `danger`, `success`, …) → clean utilities
  (`bg-background`, `text-foreground`); chosen over `color.bg.*`/`color.text.*` nesting because
  Tailwind's single color namespace would yield `bg-bg-primary`.
- **Component-token tier deferred to Stage 3** (built with the first React Aria components).

## Consequences

- Accessibility check caught two sub-AA pairings in the starter palette: white on `accent`
  (3.62:1) and white on `success` (3.41:1) failed normal-text AA. Fixed by pairing both with
  dark text (`*-foreground` → `neutral.900`): now **4.91:1** and **5.21:1**. All eight
  semantic text pairings clear WCAG 2.2 AA. Hues unchanged (tunable).
- `border` on `background` is **1.23:1** — fine for subtle dividers, but needs a darker
  variant for input/control boundaries (WCAG 1.4.11, 3:1) when controls land in Stage 3.
- Light theme only for now; structure is dark-ready via the indirection above.

## Gotcha (for future maintainers)

`style-dictionary/utils` `formattedVariables` defaults to reading `token.value`; DTCG stores
the resolved value on `$value`. The format must forward `usesDtcg: options.usesDtcg` or every
variable emits `undefined`. (First build hit this; fixed in `style-dictionary.config.mjs`.)
Separately: the SD **CLI** honored top-level `register()` from the ESM config — no programmatic
build script was needed, so the existing `pnpm tokens` script is unchanged.

## Alternatives considered

- **Pin Style Dictionary v4** (match the docs literally) — older, less maintained, forces
  sd-transforms@1; no upside. Rejected.
- **`tokens-studio` transformGroup on the starter** — would reserialize colors and risk
  OKLCH→hex/rgb. Deferred until a real Tokens Studio source exists (re-verify OKLCH then).
- **`@theme inline`** — bakes the resolved reference into utilities, breaking runtime
  semantic overrides. Rejected for themeability.
