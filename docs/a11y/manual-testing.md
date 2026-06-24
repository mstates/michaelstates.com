# Manual accessibility testing — Stage 5 checklist

Automated checks (axe via Storybook addon-a11y, the accessibility-reviewer's static
audits, and computed contrast) catch only a minority of real issues. The items below
require a human with a screen reader / forced-colors mode and are deferred to the
**Stage 5 manual pass** (per SETUP.md). Each links to the component audit that raised it.

## Open items

### TextField — error announcement on first validation ⟶ High priority

- **Source:** `docs/a11y/textfield.md` (Issue #1).
- **Risk:** `<FieldError>` is present in the DOM from load (RAC keeps it mounted so it can
  surface both custom and native constraint-validation errors). NVDA + Firefox can drop the
  _first_ announcement when an empty live region is pre-registered.
- **Why not "fixed" in code:** gating `<FieldError>` on a custom `errorMessage` would break
  RAC's **native** validation messages (e.g. empty `isRequired` submit). `aria-invalid` +
  visible error text already satisfy SC 3.3.1 programmatically — this is an AT-behavior check,
  not a code defect.
- **Test:** NVDA + Firefox (and JAWS) — tab to an invalid field; confirm the error string is
  announced on **first** focus, not only on refocus. Repeat for the `InvalidEmail` and
  `Required` (native) stories. VoiceOver/Safari + VoiceOver/Chrome as secondary.

### Button — disabled state announcement

- **Source:** `docs/a11y/button.md` (manual notes).
- **Test:** VoiceOver + NVDA — confirm a disabled Button announces as "dimmed"/"unavailable"
  and is excluded from tab order; confirm no spurious state announcement on a standard
  (non-toggle) button press.

### Forced-colors / Windows High Contrast Mode — focus indicator

- **Source:** Button + TextField (`focus-visible:outline-hidden` forced-colors fallback).
- **Test:** Windows High Contrast Mode — keyboard-focus each interactive primitive (Button,
  TextField, Link) and confirm a visible focus indicator survives (the box-shadow ring is
  stripped in forced-colors; the `outline-hidden` transparent outline should render as a
  system-colored outline).

### Link — disabled state, link purpose, href-absent role

- **Source:** `docs/a11y/link.md` (manual notes).
- **Test:** (1) a disabled link (`isDisabled`) announces as "dimmed"/"unavailable link" and is
  still Tab-reachable (RAC keeps `aria-disabled` links in focus order) — confirm it isn't a
  confusing dead stop; (2) when `href` is absent RAC renders `role="link"` on a span — confirm
  it doesn't pollute the screen-reader Links rotor; (3) before any icon-only link ships, confirm
  the SR reads only `aria-label`, not SVG inner content.

### Heading — outline navigation & level/size decoupling

- **Source:** `docs/a11y/heading.md`.
- **Test:** (1) screen-reader heading navigation (VoiceOver rotor / NVDA `H` key) — one `h1`
  per page, no skipped levels, labels meaningful out of context; (2) for a `level`-vs-`size`
  decoupled heading (e.g. an `h2` rendered at body size), confirm the SR announces "heading
  level 2" regardless of the visual size.

## How to close an item

Run the test, record pass/fail + AT/version + notes in the relevant `docs/a11y/<component>.md`,
and check it off here. Anything that fails becomes a tracked fix before launch (Stage 8).
