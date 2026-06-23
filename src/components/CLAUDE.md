# src/components — conventions (loaded when working here)

- Every interactive component is built on **React Aria Components**. Do not hand-roll
  ARIA widgets when a primitive exists (Button, Dialog, ComboBox, etc.).
- Components consume **design tokens** via CSS variables — never raw hex or px values.
- Every component has a visible `:focus-visible` style. No bare `outline: none`.
- Every component has a Storybook story; the a11y addon must pass on it.
- Respect `prefers-reduced-motion` for animation.
- Before "done": run `pnpm lint && pnpm test:a11y`, and for non-trivial work have the
  `accessibility-reviewer` agent audit it.

See `.claude/rules/accessibility.md` for the full rule set.
