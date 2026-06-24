# Accessibility Review — Link Primitive

**Date:** 2026-06-23
**Reviewed by:** accessibility-reviewer agent (WCAG 2.2 AA)
**Component:** `Link`
**Files reviewed:**

- `src/components/Link.tsx`
- `src/components/Link.stories.tsx`
- `tokens/semantic/color.json`
- `src/styles/tokens.css`
- `docs/a11y/button.md` (style reference)
- `docs/a11y/textfield.md` (style reference)

---

## Per-Criterion Verdict Table

| SC     | Criterion                 | Verdict                     | Notes                                                                                                                                                                                                                                    |
| ------ | ------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.3.1  | Info and Relationships    | PASS                        | RAC `Link` with `href` renders a native `<a>` — role exposed by the element itself, not ARIA. Without `href`, RAC renders a `<span role="link">` with keyboard handling; see semantic analysis below.                                    |
| 1.4.1  | Use of Color              | PASS                        | Both `inline` and `standalone` variants carry a persistent underline (`underline underline-offset-2`). Neither variant distinguishes links from surrounding text by color alone.                                                         |
| 1.4.3  | Contrast (Minimum)        | PASS                        | `text-primary` (brand.600, `oklch(54% 0.17 248)`) on white: **4.96:1** — clears 4.5:1 for normal text at 16px (text-body). Hover `text-primary-hover` (brand.700, `oklch(47% 0.15 248)`) on white: **6.69:1** ✓.                         |
| 1.4.11 | Non-text Contrast         | PASS                        | Focus ring (`ring` = brand.600) vs. background (white): **4.96:1** — exceeds the 3:1 UI component threshold. Underline decoration is part of text rendering, not a standalone UI boundary; contrast of text satisfies both SCs together. |
| 2.1.1  | Keyboard                  | PASS                        | RAC `Link` activates on **Enter** (correct for `<a>`). When `href` is absent, RAC renders a keyboard-operable span; both Enter and Space are wired. No keyboard trap.                                                                    |
| 2.4.3  | Focus Order               | PASS                        | No `tabindex` manipulation. Link participates in natural document order. No `tabIndex` prop detected.                                                                                                                                    |
| 2.4.7  | Focus Visible             | PASS                        | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`. `focus-visible:outline-hidden` removes the native outline; the transparent outline keeps a forced-colors fallback.      |
| 2.4.11 | Focus Not Obscured (Min)  | PASS                        | Standalone primitive; ring renders outside element bounds. Verify on live pages with sticky navigation.                                                                                                                                  |
| 2.4.13 | Focus Appearance          | PASS                        | 2px solid ring enclosing the full link boundary. Ring (brand.600) vs. adjacent white: 4.96:1 — exceeds 3:1 minimum. `rounded-sm` provides a coherent ring shape around inline text flow.                                                 |
| 2.5.7  | Dragging Movements        | N/A                         | No dragging interaction.                                                                                                                                                                                                                 |
| 2.5.8  | Target Size (Minimum)     | PASS (inline exempt) / PASS | `inline` variant: WCAG 2.5.8 explicitly exempts links that are inline in a sentence. `standalone` variant: no explicit `min-h`/`min-w`; see Issue #1 for analysis.                                                                       |
| 3.2.6  | Consistent Help           | N/A                         | No help mechanism on this component.                                                                                                                                                                                                     |
| 3.3.7  | Redundant Entry           | N/A                         | Not an input.                                                                                                                                                                                                                            |
| 3.3.8  | Accessible Authentication | N/A                         | No authentication interaction.                                                                                                                                                                                                           |
| 4.1.2  | Name, Role, Value         | PASS — see Issue #2         | `href`-present path: native `<a>`, role is inherent. `href`-absent path: RAC renders `role="link"` on a non-anchor. Disabled path: see disabled analysis. Icon-only pattern: no guard — see Issue #2.                                    |

---

## Detailed Analysis by Audit Area

### 1. Semantics / Role (SC 4.1.2)

RAC `Link` (v1.19.x) conditionally renders:

- **With `href`:** a native `<a href="…">` — correct link semantics, browsers and screen readers expose it as a link with its URL.
- **Without `href`:** a `<span role="link" tabIndex={0}>` with keyboard handling wired by RAC — semantically acceptable but unusual. This is the RAC-intended pattern for SPA navigation (where the `href` is managed by a router and passed via `onPress`). It is not a WCAG failure because `role="link"` is the correct ARIA role. **However**, a link without `href` is never included in browser link-lists (e.g. screen reader "Links" virtual menu in VoiceOver/NVDA), which may reduce discoverability. Callers should pass `href` whenever possible and use `onPress` only as a supplement.

The JSDoc on the component correctly states "renders a real `<a>` when `href` is set" — no misleading claim here.

### 2. Use of Color (SC 1.4.1)

Both `inline` and `standalone` variants apply `underline underline-offset-2` unconditionally in `base`. The `inline` variant also applies `decoration-1 hover:decoration-2` (underline thickness change on hover). The `InProse` story correctly places a link inside a `<p>` with surrounding `text-foreground` text — the underline is visible regardless of color.

The `standalone` variant adds only `font-medium` on top of `base` and therefore also carries the persistent underline. There is no variant where the underline is absent.

**Verdict: SC 1.4.1 is fully satisfied for both variants.** No meaning is conveyed by color alone.

### 3. Contrast (SC 1.4.3 / 1.4.11)

Token chain:

- `--color-primary` → `--color-brand-600` → `oklch(54% 0.17 248)` (medium-blue)
- `--color-background` → `--color-neutral-0` → `oklch(100% 0 0)` (white)
- Computed contrast: **4.96:1** (cited from build verification). Exceeds 4.5:1 for normal text ✓.
- Hover: `--color-primary-hover` → `--color-brand-700` → `oklch(47% 0.15 248)`: **6.69:1** ✓.
- Focus ring: brand.600 on white: **4.96:1** — exceeds 3:1 for non-text SC 1.4.11 ✓.

The `InProse` story uses `text-foreground` (neutral.900, `oklch(20.8% 0.010 247)`) for the surrounding paragraph. The link color (brand.600) differs from the body text color — that difference does not need to meet a specific ratio under SC 1.4.1 because the persistent underline serves as the non-color distinguishing cue.

### 4. Focus Visibility (SC 2.4.7 / 2.4.11 / 2.4.13)

The `base` string includes:

```
focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
```

This is the same pattern used successfully in Button and TextField. `outline-hidden` sets `outline: 2px solid transparent` — which forced-colors overrides to a system-colored outline (the `transparent` value is replaced by `Highlight` or `ButtonText`). The Tailwind ring provides the normal-mode indicator. `rounded-sm` keeps the ring close to the text rather than leaving a rectangular box around a single word in a long paragraph.

Two observations to note (not new defects — same as Button/TextField):

1. `ring-offset-background` is hardcoded to the white background token. This is acceptable in the current all-white surface context. When a link appears on a colored card surface, the ring-offset will produce a white halo artifact. Flagged as Nit (Issue #3).
2. The CSS custom property ring (`--color-ring` = brand.600) may not survive `forced-colors: active`, whereas the transparent outline fallback will. Net result in High Contrast Mode: a system-colored outline is visible; the CSS variable ring may disappear. Behavior should be verified manually (already tracked in `docs/a11y/manual-testing.md`).

### 5. Target Size (SC 2.5.8)

SC 2.5.8 has an explicit exception for **"Inline Exception"**: links whose target offset is constrained by the line-height of non-interactive surrounding text are exempt. This covers the `inline` variant in the `InProse` story.

The `standalone` variant ("Back to projects") is a block-level link — not inline in a sentence — and is **not exempt**. It has no `min-h` or `min-w` class. Its rendered height and width depend entirely on font metrics (`text-body` = 16px with default line-height ≈ 24px) plus any surrounding padding supplied by the parent. At 16px font size with Tailwind's default `line-height: 1.5` (24px), the link's rendered height is exactly **24px** — the WCAG 2.5.8 minimum floor, not safely above it. See Issue #1.

### 6. Disabled State (SC 4.1.2)

The `Disabled` story passes `isDisabled: true`. RAC `Link` (v1.19.x) behavior for `isDisabled`:

- **With `href`:** RAC adds `data-disabled` and sets `aria-disabled="true"` on the rendered `<a>`. It does **not** remove the `href` and does **not** suppress the native `<a>`'s tab participation. The element remains focusable. This is intentional in RAC v1.x: `aria-disabled` is used instead of removing `href` because the latter would change the element's semantics.
- **Keyboard:** With `aria-disabled="true"`, the link is technically still in the tab order. RAC intercepts `onPress` / `onClick` to suppress navigation, but the native `href` means a user who activates the link by means other than RAC's event handler (e.g. middle-click, browser link menu) could still navigate. This is a known RAC trade-off.
- **Visual:** `disabled:opacity-50 disabled:cursor-not-allowed` via the `data-disabled` attribute. The opacity reduction conveys disabled visually. SC 1.4.3 exempts inactive UI components from contrast requirements — the dimmed state is not a violation.

The behavioral trade-off (focusable + `aria-disabled` rather than removed from tab order) is **not a WCAG failure** — WCAG does not require disabled links to be unfocusable. Screen readers will announce the link as "dimmed" (VoiceOver) or "unavailable" (NVDA). The cursor change (`not-allowed`) is an additional affordance for pointer users. See Issue #4 for a documentation note about the RAC behavior vs. potential caller expectation.

### 7. Reduced Motion (SC 2.3.3 / project rules)

`transition-colors motion-reduce:transition-none` is present in `base`. Under `prefers-reduced-motion: reduce`, the color transition is disabled. The underline thickness change (`decoration-1 hover:decoration-2` on inline) is a CSS `text-decoration` property — not covered by `transition-colors`. This is not animated (it is a hover-state swap, not a transition); it fires instantaneously in both normal and reduced-motion contexts. **No issue.**

---

## Issues Found

### Issue #1 — [Medium] Standalone variant has no minimum height/width guard; rendered height equals the SC 2.5.8 floor exactly (SC 2.5.8)

**File:** `src/components/Link.tsx` line 33
**Criterion:** WCAG 2.2 SC 2.5.8 Target Size (Minimum)

**What is wrong:**

The `standalone` variant applies only `font-medium` beyond the shared `base`. There is no `min-h` or `min-w` class. At `text-body` (16px) with Tailwind's default line-height of 1.5, the rendered height of a standalone link is **24px** — precisely the SC 2.5.8 minimum. WCAG 2.5.8 requires the target to be at least 24×24 CSS pixels. Being exactly 24px satisfies the criterion numerically, but offers no margin against line-height overrides, custom font metrics, or parent containers that compress height.

The inline exception does not apply to standalone links (they are not surrounded by non-interactive text in a sentence).

Width is content-dependent. A two-word label like "Back to projects" renders well above 24px wide. A very short label (e.g., a single word like "Back") at 16px font ≈ 35–40px wide with no padding applied by the Link itself — still fine. The real risk is one-word or icon-adjacent usage where no explicit padding is added.

**Fix:** Add `inline-flex items-center min-h-6` (24px height floor) to the `standalone` variant class string. This guarantees the target height regardless of font-stack or parent overrides and aligns with the approach taken in Button (`min-h-9` / `min-h-11`). For future consideration: if a standalone link ever appears as an icon-only control (e.g., a nav arrow), add `min-w-6` as well.

```tsx
// Current (Link.tsx line 33)
standalone: "font-medium",

// Proposed fix
standalone: "inline-flex items-center min-h-6 font-medium",
```

---

### Issue #2 — [Nit] No icon-only Link story or accessible-name guard; pattern-copies the Button risk (SC 4.1.2)

**File:** `src/components/Link.stories.tsx`
**Criterion:** WCAG 2.2 SC 4.1.2 Name, Role, Value

**What is wrong:**

The JSDoc on `Link.tsx` (line 12) mentions "For an icon-only link, pass `aria-label`" — this is correct guidance. However there is no story exercising the pattern, and no TypeScript guard that enforces it. If a caller renders `<Link href="/about"><ArrowIcon /></Link>` with no accessible name, the link will be announced by screen readers as its URL or as an empty string depending on the browser.

This mirrors the icon-only gap previously flagged for Button. The same pattern risk applies here.

**Fix:** Add an `IconOnly` story: `<Link href="#" aria-label="View case study"><ArrowRightIcon /></Link>` with the Storybook a11y addon verifying the accessible name. The JSDoc comment is correct — it just needs the story to back it up and make the pattern discoverable.

---

### Issue #3 — [Nit] `ring-offset-background` white-surface assumption (SC 1.4.11 — design-time note, current PASS)

**File:** `src/components/Link.tsx` line 25
**Criterion:** SC 1.4.11 — not a current failure

**What is wrong:**

`focus-visible:ring-offset-background` hardcodes the ring-offset to `--color-background` (neutral.0, white). Same pattern flagged in Button (Issue #4) and TextField (Issue #4). When a link appears on a colored surface, the white halo artifact reappears.

**Fix:** Acceptable for now. Track alongside the Button and TextField entries already noted in `docs/a11y/button.md` (Issue #4) and `docs/a11y/textfield.md` (Issue #4). A single fix at the design-token or Tailwind plugin level will resolve all three components at once.

---

### Issue #4 — [Nit] RAC disabled behavior for links is subtly different from button disabled; worth documenting (SC 4.1.2 — behavioral note)

**File:** `src/components/Link.tsx` line 26; `src/components/Link.stories.tsx` line 31
**Criterion:** SC 4.1.2 — not a WCAG failure; documentation gap

**What is wrong:**

RAC `Link` with `isDisabled` sets `aria-disabled="true"` on the rendered `<a>` but preserves the `href`. The element remains in the tab sequence. This contrasts with RAC `Button` with `isDisabled`, which removes the element from the tab sequence by setting the native `disabled` attribute. A developer who learned the pattern from Button may expect a disabled link to be unfocusable, and could be confused when it remains traversable.

The behavior is intentional (and not a WCAG violation — the `aria-disabled` communicates the state), but there is no comment or story note explaining it.

**Fix:** Add a JSDoc note to `LinkProps` or `isDisabled` explaining the RAC behavior: that the link stays in the tab sequence with `aria-disabled="true"` and that RAC suppresses activation, but the native `href` still exists. No code change needed.

---

## WCAG 2.2 Additions Checklist

| Addition                      | SC           | Verdict                                                                                                                                                                            |
| ----------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focus Not Obscured (Min)      | 2.4.11       | PASS — ring renders outside element bounds at the component level. Verify on live pages with sticky navigation.                                                                    |
| Focus Not Obscured (Enhanced) | 2.4.12 (AAA) | Not in scope (AAA).                                                                                                                                                                |
| Focus Appearance              | 2.4.13       | PASS — 2px ring, full perimeter, 4.96:1 ring-vs-background. `rounded-sm` keeps the ring coherent around inline text.                                                               |
| Dragging Movements            | 2.5.7        | N/A — no dragging interaction.                                                                                                                                                     |
| Target Size (Minimum)         | 2.5.8        | CONDITIONAL — `inline` variant: explicitly exempt (inline exception). `standalone` variant: 24px rendered height meets floor exactly. Add `min-h-6` as a hardening fix (Issue #1). |
| Consistent Help               | 3.2.6        | N/A — no help mechanism.                                                                                                                                                           |
| Redundant Entry               | 3.3.7        | N/A — not an input.                                                                                                                                                                |
| Accessible Authentication     | 3.3.8        | N/A — no authentication.                                                                                                                                                           |

---

## Disabled State Analysis

RAC `Link` v1.19.x with `isDisabled`:

- Renders `<a href="…" aria-disabled="true" data-disabled>` — element remains in tab order.
- RAC suppresses `onPress` / click activation; native `href` is not removed.
- `disabled:opacity-50 disabled:cursor-not-allowed` provides visual affordance via `data-disabled`.
- SC 1.4.3 exempts inactive UI components from contrast; the dimmed state is not a violation.
- Screen reader announcement: VoiceOver → "dimmed link"; NVDA → "unavailable link". Verify manually (see manual testing checklist).
- Contrast with `aria-disabled` is correct; the behavioral trade-off (focusable but not activatable) is not a WCAG failure.

---

## Verdict

**PASS (AA)** — The Link primitive is WCAG 2.2 AA conformant in its current form. No blocker-level violations were identified.

One Medium finding (Issue #1, standalone target height exactly at floor) should be resolved before standalone links ship in production contexts where line-height or font-stack overrides may reduce the rendered size below 24px. The fix is a two-class addition.

Two Nit findings are documentation and pattern hardening items consistent with the recurring icon-only and ring-offset patterns already tracked for Button and TextField.

---

## Manual Screen-Reader Testing Checklist

Automation (axe) catches ~40% of real-world issues. Verify the following with VoiceOver (macOS/Safari) and NVDA (Windows/Firefox):

1. **Link announcement:** Tab to an `inline` link — confirm SR announces the link text, role ("link"), and optionally the destination URL. Confirm it does not announce the underline decoration as content.
2. **Disabled link in tab order:** Tab to the `Disabled` story — confirm SR announces "dimmed link" (VoiceOver) or "unavailable link" (NVDA). Confirm the link is **reachable** by Tab but activation is suppressed. Contrast with a disabled Button (which is skipped) to ensure consumers understand the difference.
3. **No-href link (role="link" span):** If any link is rendered without `href`, confirm VoiceOver and NVDA both announce it as a link (not a button or generic element), that it is reachable by Tab, and that it responds to Enter. Also confirm it does **not** appear in the VoiceOver "Links" virtual menu (expected behavior for `role="link"` on a non-anchor).
4. **Icon-only link:** Before any icon-only usage ships, test `<Link href="…" aria-label="View case study"><Icon /></Link>` — confirm SR announces only the `aria-label`, not the SVG's inner content.
5. **Forced-colors / Windows HCM focus ring:** Keyboard-focus the link under `forced-colors: active` — confirm a visible focus indicator survives. The `outline: 2px solid transparent` from `outline-hidden` should be overridden by the system `Highlight` color. The CSS variable ring may not survive; confirm at minimum the outline fallback is visible. This item is already open in `docs/a11y/manual-testing.md`.
6. **Link purpose (SC 2.4.6 / 2.4.9):** In a full-page context, confirm link labels are meaningful out of context (e.g., VoiceOver "Links" rotor, NVDA Elements List). Standalone links like "Back to projects" are acceptable. Inline links must carry their surrounding prose context or an `aria-label`. This is a page-level responsibility, not a component defect.

> **Recommend appending items 1–5 above to `docs/a11y/manual-testing.md`** under a new "Link" section, with item 5 cross-referenced to the existing Forced-colors entry.
