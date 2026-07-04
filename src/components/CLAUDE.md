# src/components — conventions (loaded when working here)

- Every interactive component is built on **React Aria Components**. Do not hand-roll
  ARIA widgets when a primitive exists (Button, Dialog, ComboBox, etc.).
- Components consume **design tokens** via CSS variables — never raw hex or px values.
- Every component has a visible `:focus-visible` style. No bare `outline: none`.
- Every component has a Storybook story; the a11y addon must pass on it.
- Respect `prefers-reduced-motion` for animation.
- Before "done": run `pnpm lint && pnpm test:a11y`, and for non-trivial work have the
  `accessibility-reviewer` agent audit it.

## Surface contracts

- The default pair is `text-foreground` on `bg-background` (17.84:1, measured). Any
  section or component that overrides text color or sits on a non-default surface —
  `bg-surface` / `bg-surface-muted` / `bg-surface-pressed`, filled controls like
  `bg-primary` + `text-primary-foreground`, or any future dark/inverted section — must
  prove the foreground/background pair meets WCAG 1.4.3 **before it ships**: ≥ 4.5:1 for
  normal text, ≥ 3:1 for large text (≥ 24px, or ≥ 18.66px bold).
- Proof is a computed contrast ratio from the measured token values (the oklch in
  `tokens/primitive/color.json`, resolved to sRGB), recorded in the PR body or the
  component's `docs/a11y/` entry — "visually checked" is not proof. Anchor the
  computation to the oklch source values in float precision — hex in proof tables is a
  display artifact, not a computation input (8-bit re-quantization shifts ratios:
  9.05/14.43 vs 9.07/14.50 on the pressed pairs; INC-226). The axe gate
  (`pnpm test:a11y`) still checks the rendered result, but it only sees pages and stories
  it renders; the recorded ratio is the design-time contract.
- Only token pairs: use an existing proven semantic pair (`primary`/`primary-foreground`,
  `accent`/`accent-foreground`, `danger`/`danger-foreground`, `success`/`success-foreground`
  — see ADR-0003 and `docs/a11y/`). No inverted/dark surface pair exists yet — when one is
  needed, add it through the token pipeline (primitive `mc.color.neutral.*` → a semantic
  pair, e.g. `inverted` + `inverted-foreground`, then `pnpm tokens`), never as a raw
  hex/oklch or a one-off `text-white` in a component.

See `.claude/rules/accessibility.md` for the full rule set.
