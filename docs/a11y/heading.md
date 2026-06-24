# Accessibility Review — Heading Primitive

**Date:** 2026-06-23
**Reviewed by:** accessibility-reviewer agent (WCAG 2.2 AA)
**Component:** `Heading`
**Files reviewed:**

- `src/components/Heading.tsx`
- `src/components/Heading.stories.tsx`
- `tokens/semantic/typography.json`
- `src/styles/tokens.css`
- `docs/a11y/button.md`, `docs/a11y/link.md` (style reference)

---

## Per-Criterion Verdict Table

| SC     | Criterion                 | Verdict                      | Notes                                                                                                                                                      |
| ------ | ------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.3.1  | Info and Relationships    | PASS                         | `level` prop resolves to a real `<h1>`–`<h6>` via template-literal tag — no `role="heading"` ARIA hack, no `<div>` standing in for a heading.              |
| 1.3.1  | Level/size decoupling     | PASS — correct pattern       | `size` controls visual scale only; `level` controls document outline. JSDoc is explicit. Skipped-level risk is a consumer concern — see Issue #1 (Nit).    |
| 2.4.6  | Headings and Labels       | PASS                         | Headings describe the sections they introduce when used correctly. The component's job is to render a native heading; labeling quality is caller-owned.    |
| 2.4.10 | Section Headings          | PASS                         | The primitive enables correct heading outlines without opinionated structure. Component correctly does not enforce outline — that is a page-level concern. |
| 1.4.3  | Contrast (Minimum)        | PASS — with design-time note | Inherits color from context. In documented context: foreground (neutral.900) on background (neutral.0) = 17.78:1. See Issue #2 (Medium) for risk note.     |
| 1.4.4  | Resize Text               | PASS                         | All font-size tokens resolve to `rem` values (`--size-base: 1rem`, `--size-2xl: 1.5rem`, `--size-4xl: 2.25rem`). Zoom-safe by design.                      |
| 1.4.10 | Reflow                    | PASS                         | `rem`-based sizes; no fixed-width or `px` font-size override. `text-balance` is a progressive enhancement — degrades gracefully if unsupported.            |
| 1.4.12 | Text Spacing              | PASS                         | No inline `line-height`, `letter-spacing`, `word-spacing`, or `font-size` set via `style` attribute. Token-driven values override correctly.               |
| 2.1.1  | Keyboard                  | N/A                          | Non-interactive; headings are not focusable by default. Nothing interactive present.                                                                       |
| 2.4.11 | Focus Not Obscured (Min)  | N/A                          | Non-interactive; no focus state.                                                                                                                           |
| 2.5.7  | Dragging Movements        | N/A                          | No dragging interaction.                                                                                                                                   |
| 2.5.8  | Target Size (Minimum)     | N/A                          | Non-interactive; target size does not apply.                                                                                                               |
| 3.2.6  | Consistent Help           | N/A                          | No help mechanism.                                                                                                                                         |
| 3.3.7  | Redundant Entry           | N/A                          | Not a form element.                                                                                                                                        |
| 3.3.8  | Accessible Authentication | N/A                          | No authentication context.                                                                                                                                 |
| 4.1.2  | Name, Role, Value         | PASS                         | Native heading elements expose role and level natively. No ARIA overrides applied.                                                                         |

---

## Detailed Analysis by Audit Area

### 1. Semantic Structure and Native Element (SC 1.3.1, 4.1.2)

`Heading.tsx` line 50:

```tsx
const Tag = `h${level}` as `h${HeadingLevel}`;
```

The dynamic tag is a template-literal string that resolves to a concrete `h1`–`h6` at
render time. TypeScript constrains `HeadingLevel` to `1 | 2 | 3 | 4 | 5 | 6`, so invalid
tag names are a compile-time error, not a runtime risk. The rendered element is a genuine
heading element — browsers and screen readers expose it via the accessibility tree with the
correct role (`heading`) and level (`aria-level` equivalent via native semantics). No
`role="heading"` ARIA is applied, which is correct (native semantics are always preferred).

No `div` or `span` is used to fake a heading anywhere in this component. **Pass.**

### 2. Level vs. Size Decoupling (SC 1.3.1, 2.4.6, 2.4.10)

The `level`/`size` separation is the accessibility-correct pattern. It actively addresses
the most common heading antipattern in practice: choosing a heading level for its
visual size rather than for document structure. The JSDoc at lines 7–13 of `Heading.tsx`
makes this intent explicit and cites the relevant SCs (1.3.1, 2.4.6).

The `defaultSize` map (lines 34–41) provides sensible defaults:

- `h1` → `display`, `h2`/`h3` → `title`, `h4`–`h6` → `body`

This default wiring is appropriate: it matches common typographic hierarchy without
prescribing page structure. Callers who need a visual override (e.g., an `h2` rendered at
body size for a sidebar label) pass `size` explicitly.

**The component cannot, by itself, prevent a consumer from skipping heading levels** (e.g.,
jumping from `h1` to `h3`). This is expected behavior — level-skipping is a usage error,
not something a primitive can enforce without constraining valid patterns (e.g., deeply
nested content with a legitimately sparse outline). See Issue #1 for the documentation
recommendation.

### 3. Contrast — Inherited Color (SC 1.4.3)

`Heading.tsx` applies no `text-*` color class. It inherits the surrounding text color
from the cascade. In the documented context — `<body>` carries `text-foreground`
(neutral.900, `oklch(20.8% 0.010 247)`) on `background` (neutral.0, `oklch(100% 0 0)`) —
the effective contrast is **17.78:1**, far exceeding the 4.5:1 requirement for normal text
and the 3:1 requirement for large text.

This inheritance strategy is architecturally intentional: headings that live inside
inverted or colored sections inherit the surface's foreground color rather than reverting
to white or black, which enables consistent dark/light section design without component
changes. **In the current context this is correct and safe.**

The risk arises if a heading is ever dropped into a container whose text color is
insufficiently contrasted against its own background. That is a page/layout contract, not a
component defect — but it is worth flagging explicitly. See Issue #2.

### 4. Reflow and Text Spacing (SC 1.4.4, 1.4.10, 1.4.12)

Token resolution from `tokens/semantic/typography.json` and `src/styles/tokens.css`:

- `--text-body: var(--size-base)` → `--size-base: 1rem` → **16px at default browser font size**
- `--text-title: var(--size-2xl)` → `--size-2xl: 1.5rem` → **24px**
- `--text-display: var(--size-4xl)` → `--size-4xl: 2.25rem` → **36px**
- `--leading-prose: var(--leading-normal)` → `--leading-normal: 1.5` → **unitless**
- `--leading-heading: var(--leading-tight)` → `--leading-tight: 1.15` → **unitless**

All font sizes are `rem`-relative — they scale with the browser's root font size. A user
who sets their browser to 200% zoom or increases the default font size will see the heading
scale proportionally. No fixed `px` font-size is in play.

`text-balance` (`text-wrap: balance`) is a CSS progressive enhancement. Browsers that do
not support it fall back to default text wrapping — no content is lost, no layout breaks.
It does not affect zoom, reflow, or the text-spacing bookmarklet tests.

SC 1.4.12 text-spacing overrides (line-height 1.5×, letter-spacing 0.12em, word-spacing
0.16em, paragraph spacing 2em) are fully compatible: the unitless line-height multipliers
in the token system scale correctly with user overrides, and no `!important` or `style`
attribute locks them.

**All four SCs pass.**

### 5. No Interactive Concerns

`Heading` is a pure typographic primitive. It has no `onClick`, `onKeyDown`, `tabIndex`,
`role`, or interactive ARIA state. The `...props` spread (line 48) passes through only
`ComponentPropsWithoutRef<"h1">` props — TypeScript will reject any attempt to pass
`tabIndex`, `onClick`, or ARIA state props if the component definition's `Omit` pattern
prevents it. It does not: `Omit<ComponentPropsWithoutRef<"h1">, "className">` spreads all
standard heading props including event handlers.

This is not a defect — headings legitimately accept `id` (for skip-link targets, scroll
anchors), `aria-label` (to override the accessible name in edge cases), and event handlers
(for copy-on-click patterns). The component is correct to expose the full prop surface.
The caller is responsible for not misusing it (e.g., adding `role="button"` to a heading
would be an error, but TypeScript does not prevent it).

No element that should be interactive is currently non-interactive. **No issue.**

---

## Issues Found

### Issue #1 — [Nit] No JSDoc or component-level guidance warns against skipping heading levels

**File:** `src/components/Heading.tsx` (JSDoc block, lines 7–13)
**Criterion:** SC 2.4.6 Headings and Labels — not a defect in the component itself; documentation gap.

**What is wrong:**

The JSDoc correctly explains the `level`/`size` decoupling and cites SCs 1.3.1 and 2.4.6.
It does not mention the level-skipping risk — e.g., a consumer who renders an `h1` on the
home page and jumps straight to `h3` on a section within the same page. Skipped heading
levels are a common WCAG failure pattern that screen-reader users navigating by heading
encounter as unexpected gaps.

The component cannot enforce sequential levels without breaking valid use cases (e.g., an
`h4` inside a widget that is itself inside an `h2` section is fine if the intermediate `h3`
exists elsewhere in the page). However, a brief warning in the JSDoc and a Storybook
autodocs note would prompt consumers to check their page outline.

There is no `LevelSkipping` story demonstrating what the wrong pattern looks like (and why
it matters). Adding one as a cautionary "anti-pattern" variant (with the a11y addon
flagging the violation) would provide discoverable documentation.

**Fix:** Add a JSDoc line: "Never skip levels in the document outline — choose `level` by
structure, then use `size` to adjust the visual scale." Optionally add a Storybook story
demonstrating the antipattern with the a11y addon configured to flag the missing
intermediate heading.

---

### Issue #2 — [Medium] Inherited color is correct in context but creates a fragile contract for future inverted/colored surfaces (SC 1.4.3)

**File:** `src/components/Heading.tsx` — no explicit file:line; this is an architectural
observation about what the component does not do.
**Criterion:** WCAG 2.2 SC 1.4.3 Contrast (Minimum)

**What is wrong:**

`Heading` deliberately sets no text color — it inherits from the cascade. This is the right
strategy for a themeable primitive. The documented context (body `text-foreground` =
neutral.900 on background = neutral.0, 17.78:1) gives substantial headroom.

The risk: as the site grows to include inverted banners, dark cards, or brand-colored
sections, any heading inside such a surface will inherit whatever `color` the parent
declares. If that parent color is insufficiently contrasted against the surface background,
the heading will fail SC 1.4.3 silently — there is no token-level guard and no type
constraint that requires a foreground/background pair to meet 4.5:1.

This is not a failure of the current component — the current rendered context is safe.
It is a design-system contract that must be enforced at the layout/section level when
those surfaces are introduced.

**Fix:** No change to `Heading.tsx` required now. When dark/inverted sections are built,
require that the surface component provides a semantically contrasted foreground token
(e.g., `text-foreground-on-dark`) rather than a raw color value. Document this contract
explicitly in `src/components/CLAUDE.md` under a "Surface contracts" heading: "Any layout
section that overrides text color must prove the foreground/background pair meets
WCAG 1.4.3 at 4.5:1 for normal text and 3:1 for text >= 18px / 14px bold."

In the meantime, the axe CI gate (`pnpm test:a11y`) will catch any contrast failure on
the actual rendered pages — which is the correct enforcement point for inherited color.

---

### Issue #3 — [Nit] `body` size heading has no `text-balance`; long `h4`–`h6` headings will rag unpredictably

**File:** `src/components/Heading.tsx` line 30
**Criterion:** Not a WCAG criterion; UX/readability note.

**What is wrong:**

`sizeClasses.body` is `"text-body font-semibold leading-prose"` — no `text-balance`.
`display` and `title` both include `text-balance`. At `text-body` (16px), headings used at
`h4`–`h6` (or any heading with `size="body"`) will wrap with the browser's default
line-breaking algorithm. For short labels this is fine; for longer `h4` headings (e.g., a
sub-section title like "Reduced-motion implementation notes") the last line may be very
short, creating an unbalanced rag.

`text-balance` is a progressive enhancement with no accessibility impact — it is a
readability improvement. At body size, `text-wrap: balance` has a browser-imposed cap of
~6 lines (Chromium), so it is safe to add.

**Fix:** Add `text-balance` to `body` in `sizeClasses`:

```tsx
// Current (Heading.tsx line 30)
body: "text-body font-semibold leading-prose",

// Proposed
body: "text-body font-semibold leading-prose text-balance",
```

---

## WCAG 2.2 Additions Checklist

| Addition                  | SC     | Verdict                          |
| ------------------------- | ------ | -------------------------------- |
| Focus Not Obscured (Min)  | 2.4.11 | N/A — non-interactive.           |
| Focus Appearance          | 2.4.13 | N/A — non-interactive.           |
| Dragging Movements        | 2.5.7  | N/A — no dragging interaction.   |
| Target Size (Minimum)     | 2.5.8  | N/A — non-interactive.           |
| Consistent Help           | 3.2.6  | N/A — no help mechanism.         |
| Redundant Entry           | 3.3.7  | N/A — not a form element.        |
| Accessible Authentication | 3.3.8  | N/A — no authentication context. |

All WCAG 2.2 additions are N/A for this non-interactive primitive. The additions that
apply to heading-level content (2.4.6, 2.4.10) are covered in the main criterion table.

---

## Verdict

**PASS (AA)** — The Heading primitive is WCAG 2.2 AA conformant. No blocker or High
severity violations were found. The `level`/`size` decoupling is the correct architectural
pattern and the JSDoc makes the intended usage explicit. All font sizes are `rem`-based
and token-driven; reflow and text-spacing overrides are compatible. The inherited-color
strategy is safe in the current deployment context.

One Medium finding (Issue #2) is an architectural note for future surface work — it is not
a current failure. Two Nit findings (Issue #1 JSDoc gap, Issue #3 missing `text-balance`
on body size) are low-risk polish items.

---

## Manual Screen-Reader Testing

Automation (axe) catches heading-level errors when a page has a detectable skip or
duplicate `h1`. The following must still be verified manually:

1. **Heading-outline navigation:** In VoiceOver (Web Rotor → Headings) and NVDA (H key
   navigation), navigate the page by heading only. Confirm: exactly one `h1` per page;
   no skipped levels; each heading label is meaningful in isolation (i.e., not "Section 1").
2. **Level/size mismatch in SR output:** Render the `LevelDecoupledFromSize` story (`h2`
   at body size). Confirm VoiceOver announces "heading level 2" regardless of the visual
   font size. Confirm the heading is reachable by the H key in NVDA and appears in the
   VoiceOver Headings list at level 2.
3. **`display` size heading reflow at 400%:** Zoom to 400% on a narrow viewport. Confirm
   `text-display` (2.25rem = 36px at default) reflows to a single-column layout without
   horizontal scroll and without content being clipped. `text-balance` may deactivate at
   this width if the browser's 6-line cap is reached — confirm text still wraps acceptably.
4. **`id` anchor jump:** If any heading carries an `id` for a skip-link or in-page anchor,
   confirm focus is moved to the heading (or its container) on activation, and that the
   heading itself or its nearest focusable ancestor is announced by the SR.

> **Recommend appending items 1 and 2 above to `docs/a11y/manual-testing.md`** under a
> new "Heading" section, as heading-outline navigation is fundamental to SR usability and
> no prior primitive review has covered it.

---

## Notes / known limitations (component edge cases)

- **Empty-heading risk (SC 1.3.1 / 2.4.6):** `children: ReactNode` permits `null`, `""`,
  `undefined`, or `false`, so a consumer can render an empty `<hN>`. An empty heading is an
  axe `empty-heading` failure and a confusing landmark for screen-reader users. The component
  does not guard against this — consumers must pass non-empty content. A dev-time warning (or a
  stricter non-empty children type) is a candidate future hardening.
- **No ref forwarding:** the prop type is `ComponentPropsWithoutRef<"h1">`, so no `ref` reaches
  the rendered heading element. A consumer can't obtain a DOM handle (e.g. for a
  scroll-to-heading / skip-link focus pattern). React 19 allows `ref` as a normal prop; thread
  it through if that need arises.
