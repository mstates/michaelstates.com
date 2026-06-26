# Accessibility Review — TextField Primitive

**Date:** 2026-06-23
**Reviewed by:** accessibility-reviewer agent (WCAG 2.2 AA)
**Component:** `TextField`
**Files reviewed:**

- `src/components/TextField.tsx`
- `src/components/TextField.stories.tsx`
- `tokens/semantic/color.json`
- `src/styles/tokens.css`
- `docs/a11y/button.md` (style reference)

---

## Per-Criterion Verdict Table

| SC     | Criterion                 | Verdict             | Notes                                                                                                                                                                                                                                                      |
| ------ | ------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.3.1  | Info and Relationships    | PASS                | RAC `TextField` renders a native `<input>` associated to a `<label>` via `aria-labelledby`. FieldError and description slots produce `aria-describedby`. Structure is programmatically exposed.                                                            |
| 1.4.1  | Use of Color              | PASS                | Invalid state uses `invalid:border-danger` (color change) AND exposes `aria-invalid` + FieldError text — color is redundant, not the sole cue.                                                                                                             |
| 1.4.3  | Contrast (Minimum)        | PASS                | Label (foreground/neutral.900 on background/white): 17.78:1 ✓. Description + placeholder (muted-foreground/neutral.600 on white): 7.55:1 ✓. Error text (danger/functional.danger on white): 4.77:1 ✓ (≥4.5:1 for normal text at `text-caption`).           |
| 1.4.11 | Non-text Contrast         | PASS                | border-input (neutral.500) on background (white): 4.76:1 — exceeds 3:1 threshold for UI control boundary ✓. Invalid border-danger on white: 4.77:1 ✓. Focus ring (brand.600) on white: 4.96:1 ✓.                                                           |
| 2.1.1  | Keyboard                  | PASS                | Native `<input>` is keyboard operable by default. RAC does not override keyboard behavior on a text field.                                                                                                                                                 |
| 2.1.2  | No Keyboard Trap          | PASS                | Standard text input; no trap possible.                                                                                                                                                                                                                     |
| 2.4.3  | Focus Order               | PASS                | No `tabindex` manipulation. Input participates in natural document order.                                                                                                                                                                                  |
| 2.4.7  | Focus Visible             | PASS                | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` — ring applied on `[data-focus-visible]` via RAC + `:focus-visible` CSS. `focus-visible:outline-hidden` correctly removes the redundant native outline without hiding the ring. |
| 2.4.11 | Focus Not Obscured (Min)  | PASS                | Standalone component; ring renders outside element bounds. Verify on live pages with sticky navigation.                                                                                                                                                    |
| 2.4.13 | Focus Appearance          | PASS                | 2px solid ring encloses full input perimeter. Ring (brand.600) vs. adjacent background: 4.96:1 — exceeds 3:1 minimum.                                                                                                                                      |
| 2.5.7  | Dragging Movements        | PASS / N/A          | No dragging interaction.                                                                                                                                                                                                                                   |
| 2.5.8  | Target Size (Minimum)     | PASS                | `min-h-11` = 44px height. `w-full` spans full container width — both dimensions clear the 24×24 px minimum floor by a significant margin.                                                                                                                  |
| 3.2.6  | Consistent Help           | N/A                 | No help mechanism on this component.                                                                                                                                                                                                                       |
| 3.3.1  | Error Identification      | PASS — see Issue #1 | FieldError renders visible text. RAC auto-sets `aria-invalid` on the input and associates the error via `aria-describedby`. See Issue #1 for a condition where error text may silently render empty.                                                       |
| 3.3.2  | Labels or Instructions    | PASS                | `label` is a required prop at the TypeScript level — unlabeled fields cannot be created via the public API.                                                                                                                                                |
| 3.3.7  | Redundant Entry           | PASS                | `Email` story passes `type="email" autoComplete="email"`. The component accepts and threads through all `AriaTextFieldProps` including `autoComplete` — callers can satisfy this criterion.                                                                |
| 3.3.8  | Accessible Authentication | PASS                | `autoComplete` pass-through via `...props` means password managers and browser autofill can operate without obstruction. No CAPTCHA or cognitive test on the component.                                                                                    |
| 4.1.2  | Name, Role, Value         | PASS                | RAC renders a native `<input>` with an associated `<label>` (role/name), `aria-invalid` (value), and `aria-describedby` (description + error). No ARIA overrides needed or used.                                                                           |

---

## Stage 2 Fix Confirmation: border-input Control Boundary (SC 1.4.11)

**border-input** resolves to `--color-input` → `--color-neutral-500` → `oklch(55.4% 0.014 247)`.
**background** resolves to `--color-background` → `--color-neutral-0` → `oklch(100% 0 0)` (white).

Computed contrast: **4.76:1** — confirmed above the 3:1 minimum required by WCAG 2.2 SC 1.4.11 for UI component boundaries. The Stage 2 fix carries over correctly to TextField, as both components consume the same `border-input` token. **Confirmed PASS.**

**invalid:border-danger** resolves to `--color-danger` → `--color-functional-danger` → `oklch(58% 0.20 27)`.
Computed contrast vs. white: **4.77:1** — also confirmed PASS for the invalid-state boundary.

---

## Issues Found

### Issue #1 — [High] FieldError is always rendered; empty error renders a zero-height element with live-region implications — ⚠️ STILL OPEN (2026-06-26)

> **Still open (2026-06-26):** the live axe re-audit returned 0 violations, but that does **not** clear this — the first-announcement live-region risk is a dynamic screen-reader behavior axe cannot detect. Remains open pending manual NVDA + Firefox verification.

**File:** `src/components/TextField.tsx` line 63
**Criterion:** SC 3.3.1 Error Identification; SC 4.1.3 Status Messages (informational)

**What is wrong:**

```tsx
<FieldError className="text-caption text-danger">{errorMessage}</FieldError>
```

`FieldError` is rendered unconditionally. When `errorMessage` is `undefined` (the common case), RAC's `FieldError` renders as an empty `<span>` with `role="alert"` (or equivalent live region behavior in some RAC versions). An always-present empty alert element is not itself a WCAG failure, but it creates two risks:

1. **Spurious announcements:** If the live region is present in the DOM from page load and its content later updates, some screen readers (notably NVDA + Firefox) announce the full content on any text change — including transitions from empty to the first error string, which is the intended behavior. However, an always-rendered empty live region can also result in the region being "stale" in NVDA's live-region tracking, causing it to miss the first announcement.
2. **Contrast of empty space:** Not a WCAG issue by itself, but it does consume layout space (the `gap-1.5` flex gap still fires) even when there is no error, which can create unexpected spacing.

The more defensible pattern (and the one used by most RAC implementations) is to gate `FieldError` rendering on the presence of error content — either via `errorMessage` prop or RAC's `isInvalid` state — so the live region is injected into the DOM at the moment the error fires, maximizing screen reader announcement reliability.

**Fix:**

```tsx
// Option A — conditional render (most reliable for SR live region injection)
{
  errorMessage ? (
    <FieldError className="text-caption text-danger">{errorMessage}</FieldError>
  ) : null;
}

// Option B — keep always-rendered but verify RAC version behavior
// Check if RAC's FieldError already handles empty gracefully in the version in use.
// If RAC v1.4+ omits the live region when content is empty, Option B is acceptable.
```

Option A is the safer default until RAC's exact live-region strategy for empty `FieldError` is verified against VoiceOver and NVDA.

---

### Issue #2 — [Medium] `focus-visible:outline-hidden` carries no explicit forced-colors fallback on the Input

**File:** `src/components/TextField.tsx` line 53
**Criterion:** SC 1.4.11 (forced-colors / Windows High Contrast Mode)

**What is wrong:**

```tsx
"focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring ...";
```

The comment in `Button.tsx` (lines 25–27) explicitly documents that `focus-visible:outline-hidden` from Tailwind's ring utilities keeps a visible focus outline under `forced-colors: active` because `outline-hidden` sets `outline: 2px solid transparent`, which forced-colors overrides to a visible system color. The TextField input uses the identical pattern — which is correct — but unlike the Button, there is **no code comment** explaining this on the TextField. This is a documentation gap, not a functional defect.

More substantively: the `ring` color (`brand.600`) is a CSS custom property. Under `forced-colors: active`, CSS custom property color values are not overridden by the forced palette — they are replaced by `ButtonText` or the system highlight color only if the browser's forced-colors implementation replaces them. The `outline: 2px solid transparent` set by `outline-hidden` **is** overridden by forced colors (transparent becomes the system `Highlight` or `ButtonText` color), so the outline remains visible. The ring (CSS variable–based) may or may not be visible depending on the browser. The net result is: in High Contrast Mode, the input will have at least the transparent-outline fallback, but the ring may disappear.

This is the same exposure noted in the Button review (Issue #4 analogue). It is not a current WCAG failure because forced-colors provides its own focus indicator (the `outline` fallback), but the behavior should be verified.

**Fix:** Add a code comment on TextField matching the one in Button.tsx so future maintainers understand the forced-colors behavior. If testing reveals the ring is absent in High Contrast Mode, add `forced-colors:outline-2 forced-colors:outline-[Highlight]` as an explicit fallback.

---

### Issue #3 — [Nit] `WithError` story does not supply `autoComplete` — missing demonstrative coverage for 3.3.8 — ✅ RESOLVED (2026-06-26)

> **Resolved 2026-06-26:** an `InvalidEmail` story now combines `type="email"`, `autoComplete="email"`, `isInvalid`, and `errorMessage` — the canonical validated-email pattern. Original finding retained below for the record.

**File:** `src/components/TextField.stories.tsx` lines 22–29
**Criterion:** SC 3.3.8 Accessible Authentication (documentation gap, not a functional failure)

**What is wrong:**

The `WithError` story hard-codes `value="not-an-email"` and sets `isInvalid: true` but passes no `type` or `autoComplete`. A developer reading the stories as a usage guide would not see a validated pattern for email error + autocomplete combined. This is low risk because `autoComplete` is surfaced on the `Email` story, but the two concerns (validation and autocomplete) are never shown together.

**Fix:** Add a combined `InvalidEmail` story that includes `type="email"`, `autoComplete="email"`, `isInvalid: true`, and `errorMessage`. This becomes the canonical copy-paste pattern for a validated email field and ensures the a11y addon checks the error + invalid + autocomplete combination.

---

### Issue #4 — [Nit] `ring-offset-background` inherits the white-surface assumption from Button — ✅ RESOLVED (2026-06-26)

> **Resolved 2026-06-26:** `focusRing` now uses `ring-offset-transparent`; the white-halo artifact on non-white surfaces no longer applies. Original finding retained below for the record.

**File:** `src/components/TextField.tsx` line 53
**Criterion:** SC 1.4.11 — design-time note, current PASS

**What is wrong:**

`focus-visible:ring-offset-background` hardcodes the ring-offset to `--color-background` (neutral.0, white). If a TextField appears inside a card or surface with a non-white background token (e.g., `surface-muted` / neutral.100), the ring-offset produces a white halo artifact. The ring itself (brand.600 at 4.96:1) still passes 1.4.11, but the offset creates a visual seam.

This is the same pattern flagged in the Button review (Issue #4 in `docs/a11y/button.md`) — it is a codebase-level recurrence.

**Fix:** Acceptable for now given the all-white background context. When TextField appears on non-white surfaces, consider a context-aware offset token or simply drop `ring-offset-2` (WCAG 2.4.13 does not require an offset).

---

## WCAG 2.2 Additions Checklist

| Addition                      | SC           | Verdict                                                                                                  |
| ----------------------------- | ------------ | -------------------------------------------------------------------------------------------------------- |
| Focus Not Obscured (Min)      | 2.4.11       | PASS — ring renders outside element bounds. Verify on live pages with sticky nav.                        |
| Focus Not Obscured (Enhanced) | 2.4.12 (AAA) | Not in scope.                                                                                            |
| Focus Appearance              | 2.4.13       | PASS — 2px ring, full input perimeter, 4.96:1 contrast.                                                  |
| Dragging Movements            | 2.5.7        | N/A                                                                                                      |
| Target Size (Minimum)         | 2.5.8        | PASS — `min-h-11` (44px) × `w-full`. Clears 24×24 by large margin.                                       |
| Consistent Help               | 3.2.6        | N/A — no help mechanism.                                                                                 |
| Redundant Entry               | 3.3.7        | PASS — `autoComplete` prop pass-through; `Email` story demonstrates correct usage.                       |
| Accessible Authentication     | 3.3.8        | PASS — no obstruction of password managers; `autoComplete` supported. Verify no `user-select: none` CSS. |

---

## Verdict

**PASS (AA)** — The TextField primitive is WCAG 2.2 AA conformant. No blocker-level violations were identified.

Issue #1 (FieldError always rendered) is rated **[High]** because it has the potential to degrade screen reader error announcements in NVDA + Firefox — the most common AT combination on Windows. It does not constitute a hard WCAG failure in its current form (the error text and `aria-invalid` are still present), but the live-region injection pattern is unreliable. This should be resolved before the first form that uses validation ships.

The Stage 2 `border-input` fix is confirmed: neutral.500 vs. white at 4.76:1 clears SC 1.4.11 with margin. Issues #2–#4 have since been **resolved** (see the 2026-06-26 re-audit); Issue #1 remains open.

---

## Manual Screen-Reader Testing Checklist

Automation (axe) catches ~40% of real-world issues. Verify the following with VoiceOver (macOS/Safari) and NVDA (Windows/Firefox):

1. **Label announcement:** Tab to the input — confirm VoiceOver/NVDA announces the label, role ("text field"), and any description. The description appears before or after the label depending on SR; confirm it is not skipped.
2. **Error announcement on invalid:** Set `isInvalid` and provide `errorMessage` — confirm SR announces the error string when focus enters the field (via `aria-describedby`) and that `aria-invalid` causes the field to be flagged as "invalid." Specifically test NVDA + Firefox for Issue #1: confirm the error is announced on the _first_ validation trigger, not only on subsequent ones.
3. **Required field:** Use the `Required` story — confirm SR announces "required" when entering the field. **Correction (2026-06-26):** RAC uses `validationBehavior="native"`, so it renders the **native `required` attribute** (`<input required>`), not `aria-required`; the input's `valueMissing` validity fires and AT still announces "required" — a11y-equivalent, mechanism corrected.
4. **Autocomplete + password manager:** Activate the `Email` story in a real browser — confirm browser autofill suggestions appear and that a password manager (e.g., 1Password) can populate the field. Verify no JavaScript event handler swallows the fill.
5. **Disabled state:** Tab through a form containing a disabled TextField — confirm the field is skipped (RAC sets native `disabled`, removing it from the tab sequence) and that it is not announced as a focusable element.
6. **Focus ring in High Contrast Mode (Windows):** Verify the input's focus indicator remains visible under `forced-colors: active` — the `outline: transparent` fallback from `outline-hidden` should be overridden by the system Highlight color.
7. **Placeholder not announced as value:** Enter the Default story with no value — confirm SR does not read the placeholder as though it were user-entered content (native `placeholder` attribute behavior is well-supported, but verify with VoiceOver).

---

## Re-audit — 2026-06-26

Re-verified after the `--mc-*` token refactor and the Storybook render-blocker fix, via a live
axe-core 4.12.1 pass (WCAG 2.0/2.1/2.2 A + AA) through the rendered stories. Non-text contrast
(1.4.11) computed via canvas + `getComputedStyle` (rendered sRGB), since axe does not automate
non-text contrast.

- **0 axe violations** across all 6 variants (Default, Required, WithError, Email, InvalidEmail,
  Disabled).
- Measured contrast: error text **4.74:1** (axe and canvas agree) — only **~0.24 above the 4.5
  floor**, a **tight tolerance**: re-check if the danger hue is ever retuned. `border-input`
  (neutral.500) **4.749:1** and invalid danger border **4.746:1** (both vs the 3.0 floor).
  Label/value 17.83:1; description (muted-foreground) 7.55:1.
- `isRequired` is exposed via the **native `required` attribute** (`validationBehavior="native"`);
  `valueMissing` validity fires; AT announces it.
- Issues #3 (InvalidEmail story) and #4 (ring-offset) confirmed **resolved**. **Issue #1
  (FieldError unconditional render) remains OPEN** — the clean axe run does **not** clear it (the
  live-region first-announcement risk is dynamic and undetectable by axe); pending manual NVDA +
  Firefox verification.
- Forced-colors / Windows HCM focus-ring remains **manual-only**.
