# tests — conventions (loaded when working here)

- **Unit/component:** Vitest. Name tests by behavior ("restores focus to the trigger when
  the dialog closes").
- **E2E:** Playwright in `tests/e2e/`.
- **Accessibility:** `@axe-core/playwright` in `tests/a11y/`, run via `pnpm test:a11y`
  against a built+served site. Assert zero new critical/serious violations.
- **TDD:** write the failing test first; never edit a test to force a pass — fix the code.
- This automated layer catches a minority of real a11y issues; it complements, not
  replaces, the accessibility-reviewer agent and manual screen-reader testing.
