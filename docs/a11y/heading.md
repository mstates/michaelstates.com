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
| 1.4.3  | Contrast (Minimum)        | PASS — with design-time note | Explicitly applies `text-foreground` (not inherited); measured 17.84:1 (neutral.900 on neutral.0 white). See Issue #2 for the consumer-override risk note. |
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

### 3. Contrast — Explicit `text-foreground` (SC 1.4.3)

> **Corrected 2026-06-26:** an earlier version of this section claimed the component "applies
> no `text-*` color class" and "inherits color from the cascade." That was **factually wrong** —
> `Heading.tsx:60` applies `text-foreground` explicitly (the first argument to `cx()`). The
> contrast conclusion is unchanged (measured **17.84:1** live); only the mechanism is corrected.

`Heading.tsx` applies `text-foreground` explicitly (line 60, the leading class in the `cx()`
call) — it does **not** rely on cascade inheritance. That resolves to `text-foreground`
(neutral.900, `oklch(20.8% 0.010 247)`) on `background` (neutral.0, `oklch(100% 0 0)`); the
effective contrast is **17.84:1**, far exceeding the 4.5:1 requirement for normal text and the
3:1 requirement for large text.

Applying the color explicitly is **stronger** than inheritance: a heading placed inside an
inverted or colored section keeps `text-foreground` rather than silently adopting the surface's
color — so it cannot accidentally inherit an under-contrasted color. A consumer that needs a
different color on such a surface must override it deliberately via `className`. **In the current
context this is correct and safe.**

The residual risk is the inverse: a consumer who passes a conflicting `text-*` color via
`className` overrides the default, and because `cx` is a plain joiner (not last-wins) the outcome
depends on stylesheet order. If that override is under-contrasted it fails SC 1.4.3 silently.
That is a page/layout contract, not a component defect — see Issue #2.

### 4. Reflow and Text Spacing (SC 1.4.4, 1.4.10, 1.4.12)

Token resolution from `tokens/semantic/typography.json` and `src/styles/tokens.css`:

- `--text-body: var(--size-base)` → `--size-base: 1rem` → **16px at default browser font size**
- `--text-title: var(--size-2xl)` → `--size-2xl: 1.5rem` → **24px**
- `--text-display: var(--size-4xl)` → `--size-4xl: 2.25rem` → **36px**
- `leading-normal` → **1.5 unitless** (body; stock Tailwind utility — the redundant `--leading-prose` / `--mc-leading-normal` primitive was dropped in the `--mc-*` refactor)
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

### Issue #2 — [Medium] Explicit `text-foreground` is safe in context, but the dark/inverted-surface contract is still unenforced (SC 1.4.3) — ✅ RESOLVED (2026-07-01)

> **Resolved 2026-07-01:** the contract is now documented as prescribed — a "Surface
> contracts" section in `src/components/CLAUDE.md` (with a pointer bullet in
> `.claude/rules/accessibility.md` so it reaches pages/layouts work) requires a computed
> contrast ratio from measured token values before any fg/bg override ships. Two
> corrections to the fix text below: the risk mechanism is `cx` stylesheet-order on
> deliberate overrides, not inheritance (see the 2026-06-26 correction above), and the
> shipped rule uses WCAG's large-text thresholds (18pt ≈ 24px / 14pt bold ≈ 18.66px), not
> the "18px / 14px bold" stated below. Original finding retained below for the record.

**File:** `src/components/Heading.tsx` — no explicit file:line; this is an architectural
observation about what the component does not do.
**Criterion:** WCAG 2.2 SC 1.4.3 Contrast (Minimum)

**What is wrong:**

`Heading` applies `text-foreground` explicitly (it does **not** inherit from the cascade) — the
correct, safe default for a themeable primitive. The documented context (`text-foreground` =
neutral.900 on background = neutral.0, measured 17.84:1) gives substantial headroom.

The risk: as the site grows to include inverted banners, dark cards, or brand-colored
sections, a heading on such a surface keeps `text-foreground` and must be given a
surface-appropriate color via `className` — and because `cx` is a plain joiner (not last-wins),
a conflicting `text-*` override resolves by stylesheet order. If the chosen color is
insufficiently contrasted against the surface background, the heading fails SC 1.4.3 silently —
there is no token-level guard and no type constraint that requires a foreground/background pair
to meet 4.5:1.

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
the actual rendered pages — which is the correct enforcement point for the rendered color.

---

### Issue #3 — [Nit] `body` size heading has no `text-balance`; long `h4`–`h6` headings will rag unpredictably — ✅ RESOLVED (2026-06-26)

> **Resolved 2026-06-26:** `text-balance` is now applied to the body size. (The body line-height token also moved `leading-prose` → stock `leading-normal` in the `--mc-*` refactor.) Shipped: `body: "text-body font-semibold leading-normal text-balance"`. Original finding retained below for the record.

**File:** `src/components/Heading.tsx` line 30
**Criterion:** Not a WCAG criterion; UX/readability note.

**What is wrong:**

`sizeClasses.body` was `"text-body font-semibold leading-prose"` — no `text-balance` (both since fixed; see the resolved note above).
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
// 2026-06-23 (before): neither the leading change nor text-balance
body: "text-body font-semibold leading-prose",

// Shipped 2026-06-26: text-balance added; leading-prose → stock leading-normal
body: "text-body font-semibold leading-normal text-balance",
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
and token-driven; reflow and text-spacing overrides are compatible. The explicit `text-foreground` default (not inheritance) is safe in the current deployment context.

One Medium finding (Issue #2, dark/inverted-surface contract) is now resolved (see the
2026-07-01 resolution note). Issue #1 (JSDoc skip-levels note) remains a low-risk polish item; Issue #3 (`text-balance` on body) is now resolved (see the 2026-06-26 re-audit).

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

---

## Re-audit — 2026-06-26

Re-verified after the `--mc-*` token refactor (which repointed body line-height `leading-prose`
→ `leading-normal`) and the Storybook render-blocker fix, via a live axe-core 4.12.1 pass
(WCAG 2.0/2.1/2.2 A + AA) through the rendered stories.

- **0 axe violations** across all 4 variants.
- Rendered, scoped to the component (not Storybook chrome): Display **`h1` / 36px / lh 1.15**,
  Title **`h2` / 24px / lh 1.15**, Body **`h3` / 16px / lh 1.5**, Level-decoupled **`h2` / 16px**
  — semantic level correctly decoupled from visual size (1.3.1). `leading-normal` renders at
  exactly **1.5**, so the body repoint is 1.4.12-safe.
- `text-foreground` (applied explicitly by the component) measured **17.84:1** on white.
- Issue #3 (`text-balance` on body) confirmed **resolved**. #1 (skip-levels JSDoc) remains
  **open**; #2 (dark/inverted-surface contract) is now **resolved** (see the 2026-07-01
  resolution note).

---

## Addendum — 2026-07-08: Warm-ramp repoint supersedes the default-pair ratio (INC-242)

INC-242 re-derived the neutral ramp warm and repointed `background` to the warm off-white
stop (`#faf8f5` display). The default pair recorded above as 17.84:1 (`text-foreground` on
white) is superseded: the current pair computes **16.38:1**, and on the new white `surface`
(cards) **17.36:1** (float-oklch per INC-227; `docs/a11y/inc-242-design-language-proof.md`).
For the record, 17.84 was itself an 8-bit-rendered artifact of the old pair — the
float-correct value was **17.78** (adjudicated in the proof doc; same drift class as
INC-226's 9.05→9.07). Headroom remains far above the 4.5:1 and 3:1 floors at every heading
size. The dark/inverted-surface contract flagged in Issue #2 now has real tokens behind it:
`inverted` / `inverted-foreground` (**17.36:1**) and `inverted-foreground-muted` (**9.44:1**)
shipped through the pipeline in INC-242.
