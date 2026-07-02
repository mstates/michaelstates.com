# Accessibility rules (path-scoped)

These apply whenever working in src/components/, src/pages/, or src/layouts/.

- Use native semantic elements first. Reach for ARIA only when no native element fits,
  and prefer a React Aria Components primitive over hand-rolled ARIA.
- Every interactive element has a visible :focus-visible style. Bare `outline: none`
  is forbidden without an equivalent replacement.
- Color and spacing come from tokens, never raw values. Text contrast meets WCAG 2.2
  AA ratios (the CI gate enforces this via axe).
- Any section or component that overrides text color or sits on a non-default surface
  follows the "Surface contracts" rule in `src/components/CLAUDE.md` — computed-ratio
  proof before it ships.
- Respect prefers-reduced-motion for all animation.
- Meet the WCAG 2.2 additions: target size 24×24 minimum, focus not obscured,
  dragging alternatives, redundant entry, accessible authentication.
- A UI task is not done until `pnpm lint && pnpm test:a11y` pass and the
  accessibility-reviewer agent has signed off on anything non-trivial.
