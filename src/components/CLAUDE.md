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

- The default pair is `text-foreground` on `bg-background` (16.38:1, float-oklch per
  INC-227 — proof record: `docs/a11y/inc-242-design-language-proof.md`). Any
  section or component that overrides text color or sits on a non-default surface —
  `bg-surface` / `bg-surface-muted` / `bg-surface-pressed`, filled controls like
  `bg-primary` + `text-primary-foreground`, or any future dark/inverted section — must
  prove the foreground/background pair meets WCAG 1.4.3 **before it ships**: ≥ 4.5:1 for
  normal text, ≥ 3:1 for large text (≥ 24px, or ≥ 18.66px bold).
- Proof is a computed contrast ratio from the measured token values (the oklch in
  `tokens/primitive/color.json`, resolved to sRGB), recorded in the PR body or the
  component's `docs/a11y/` entry — "visually checked" is not proof. Anchor the
  computation to the oklch source values in float precision — hex in proof tables is a
  display artifact, not a computation input (8-bit re-quantization shifts ratios: at the
  time, 9.05/14.43 vs 9.07/14.50 on the pressed pairs — INC-226; the once-recorded 17.84
  default pair was the same drift class, float-correct 17.78. Current values: `primary*`
  pairs and `inverted-accent` in `docs/a11y/inc-244-brand-retirement-proof.md`; all other
  pairs in `docs/a11y/inc-242-design-language-proof.md`). The axe gate
  (`pnpm test:a11y`) still checks the rendered result, but it only sees pages and stories
  it renders; the recorded ratio is the design-time contract.
- Only token pairs: use an existing proven semantic pair (`primary`/`primary-foreground`,
  `accent`/`accent-foreground`, `accent-ink`/`accent-ink-hover` on `background` or
  `surface`, `danger`/`danger-foreground`, `success`/`success-foreground`,
  `inverted`/`inverted-foreground` — see ADR-0003 and `docs/a11y/`). The inverted/dark
  surface pair shipped in INC-242: `inverted`/`inverted-foreground` (17.36:1) with
  `inverted-foreground-muted` (9.44:1), proven in
  `docs/a11y/inc-242-design-language-proof.md`. The on-dark accent shipped in INC-244:
  `inverted-accent` on `inverted` (8.52:1, ≥ 3:1 floor — large-text/fill usage only,
  never small text), proven in `docs/a11y/inc-244-brand-retirement-proof.md`. Any new
  surface pair is added the same
  way — through the token pipeline (primitive `mc.color.neutral.*` → a semantic pair,
  then `pnpm tokens`), never as a raw hex/oklch or a one-off `text-white` in a component.

See `.claude/rules/accessibility.md` for the full rule set.
