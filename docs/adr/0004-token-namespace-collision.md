# ADR 0004: Token-namespace collision — private `--mc-*` primitives + stock-utility adoption

- Status: Accepted
- Date: 2026-06-26
- Relates to: ADR-0003 (token pipeline); the three-tier rule in `.claude/rules/tokens.md`;
  `docs/follow-ups.md` items A (this) and B (`tailwind-merge`, now unblocked)

## Context

Primitive scales were authored in `:root` (`src/styles/tokens.css`), which `@import`s **after**
`tailwindcss` (`src/styles/global.css:1–2`). Same specificity, later source order → our `:root`
redefinitions **win the cascade and silently re-value Tailwind's built-in utilities**: our
`--radius-md` (.5rem) shadowed `rounded-md`, `--leading-tight` (1.15) shadowed `leading-tight`, and
the blue-tinted `--color-neutral-*` ramp shadowed Tailwind's achromatic one. Accidental and
undocumented (`docs/follow-ups.md` item A); it also gated the deferred `tailwind-merge` work (item B).

Tailwind values were verified against the **installed package** (`node_modules/tailwindcss/theme.css`,
v4.3.1), not docs.

## Decision

- **Private `--mc-*` primitive namespace, authored in source.** Each primitive file
  (`tokens/primitive/*.json`) is wrapped under a top-level `mc` key, so `name/kebab` emits
  `--mc-color-neutral-900`, `--mc-leading-tight`, etc. — the **full path is retained** (it is
  `--mc-color-neutral-*`, not `--mc-neutral-*`), confirmed by building the proposed source through
  the real Style Dictionary before applying. **No `style-dictionary.config.mjs` change.** Semantic
  tokens keep bare names (`--color-foreground`, `--leading-heading`) and remain the public utility
  surface; their `var()` chains repoint to `--mc-*` automatically via `outputReferences`.
- **Drop primitives whose value coincides with stock Tailwind; consume the stock utility.** Verified
  coincidences: `rounded-sm`=.25rem (**not** .125 — the v4 rename added `rounded-xs`=.125 and kept
  `rounded-sm` at .25), `rounded-lg`=.5rem, font-weights 400/500/600/700, `leading-normal`=1.5. So
  the whole `radius` group, the `font.weight` group, and `leading.normal` are deleted from source.
- **The `--radius-md` "divergence" was a mis-map.** Our `.5rem` is not a custom value — it is stock
  `rounded-lg` (.5), not `rounded-md` (.375). Components repoint to `rounded-lg`.

## Consequences

- **Blast radius is 3 components, not 1.** `rg 'rounded-md'` found the load-bearing radius in
  **`Button.tsx:29` and `TextField.tsx:50`** — the handoff's "only TextField:50" was incomplete;
  Button would have regressed .5→.375 if left. `Heading.tsx:36` repoints `leading-prose` → stock
  `leading-normal` (the dropped `leading.normal`). `Link.tsx` (`rounded-sm`) is unchanged — it now
  resolves to stock .25. Net: **Button, TextField, Heading**.
- **Verified by rendered output, not the green build.** The Storybook workbench is currently down
  (pre-existing "React is not defined" — see `docs/follow-ups.md`), and `build-storybook` exiting 0
  masked it. Verification instead used a **throwaway Astro page** rendering the real components +
  `getComputedStyle`: button/input corners **8px (.5rem)**, display line-height **1.15**, body
  **1.5**, neutral-derived colors resolving through `--mc-*` (e.g. `--color-foreground` →
  `oklch(20.8% .01 247)`). Output is byte-identical; the rename is visually transparent.
- `tailwind-merge` (follow-ups item B) is now **unblocked** — its gating namespace model is decided.

## Gotchas (for future maintainers)

- **`--color-*: initial` is the road not taken.** Tailwind v4's namespace-reset lever (`--color-*:
initial;` in `@theme`, which drops all of Tailwind's default colors) is deliberately **not** used.
  We un-shadow by giving primitives a private namespace, not by nuking Tailwind's palette — a later
  session should not "add it as a fix."
- **Coincident-value components reach past the semantic boundary, by accepted exception.** A
  component using `rounded-lg` / `leading-normal` directly is a soft reach past the semantic tier;
  accepted for values that coincide with stock Tailwind. The airtight alternative, recorded if the
  boundary ever needs re-tightening: a semantic alias to stock — e.g.
  `--radius-control: var(--radius-lg)` → `rounded-control`.

## Alternatives considered

- **Deliberately adopt the primitives as the Tailwind `@theme`** (embrace the override). Rejected:
  it exposes every primitive as a first-class utility (`bg-neutral-500`, `rounded-lg`=ours), which
  undercuts the tier rule ("components never consume primitives directly") and overrides Tailwind's
  scales globally.
- **A `name`-transform in `style-dictionary.config.mjs`** that prefixes primitives at build time.
  Rejected: the source should reflect the token's private identity; renaming in `*.json` keeps the
  config untouched and the `{mc.…}` references explicit.
