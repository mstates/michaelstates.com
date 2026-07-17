# Accessibility Review — Button Primitive

**Date:** 2026-06-23
**Reviewed by:** accessibility-reviewer agent (WCAG 2.2 AA)
**Component:** `Button`
**Files reviewed:**

- `src/components/Button.tsx`
- `src/components/Button.stories.tsx`
- `src/components/utils/cx.ts`
- `tokens/semantic/color.json`
- `src/styles/tokens.css`

---

## Per-Criterion Verdict Table

| SC     | Criterion                 | Verdict | Notes                                                                                                                                                                                                                                        |
| ------ | ------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.3.1  | Info and Relationships    | PASS    | RAC `Button` renders a native `<button>` — role and state conveyed by the element itself, not ARIA.                                                                                                                                          |
| 1.4.1  | Use of Color              | PASS    | Variants are explicit caller choices (primary/secondary/ghost), not status indicators. No meaning conveyed by color alone.                                                                                                                   |
| 1.4.3  | Contrast (Minimum)        | PASS    | All enabled states pass 4.5:1. Primary: 4.96:1. Primary-hover: 6.69:1. Secondary foreground on surface: ~17:1. Ghost foreground on background: 17.78:1. Disabled is WCAG-exempt (inactive UI component).                                     |
| 1.4.11 | Non-text Contrast         | PASS    | Secondary border (`input` = neutral.500 on neutral.0/50 background): 4.76:1 — exceeds the 3:1 threshold for UI boundaries. Focus ring (`ring` = brand.600 on background): 4.96:1 — exceeds 3:1.                                              |
| 2.1.1  | Keyboard                  | PASS    | RAC `Button` activates on Enter and Space natively (renders `<button>`). No keyboard traps. No override of RAC's keyboard handling detected.                                                                                                 |
| 2.1.2  | No Keyboard Trap          | PASS    | Standard button; no trap possible.                                                                                                                                                                                                           |
| 2.4.3  | Focus Order               | PASS    | Button participates in natural document order; no `tabindex` manipulation.                                                                                                                                                                   |
| 2.4.7  | Focus Visible             | PASS    | `outline-none` is paired with `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`. Ring is driven by `data-focus-visible` (RAC) + `:focus-visible` (native); never bare removal. |
| 2.4.11 | Focus Not Obscured (Min)  | PASS    | The button is a standalone primitive with no sticky headers in its own context. The ring renders outside the element bounds — no evidence of occlusion at the component level. **Note:** confirm on live pages where sticky nav exists.      |
| 2.4.13 | Focus Appearance          | PASS    | `ring-2` = 2px solid enclosing ring. Perimeter coverage is the full element boundary. Contrast of ring (brand.600) vs. adjacent background: 4.96:1 — exceeds 3:1 minimum. Both sub-criteria of 2.4.13 satisfied.                             |
| 2.5.7  | Dragging Movements        | PASS    | No dragging interaction; N/A.                                                                                                                                                                                                                |
| 2.5.8  | Target Size (Minimum)     | PASS    | `md`: `min-h-11` (44px height), `px-4` (16px each side). `sm`: `min-h-9` (36px height), `px-3` (12px each side). Heights clear 24px; `min-w-6` now floors width too (Issue #1 resolved 2026-06-26). Both dimensions clear the 24×24 floor.   |
| 3.2.4  | Consistent Identification | PASS    | Single Button primitive; variants share identical naming/interaction model.                                                                                                                                                                  |
| 3.3.1  | Error Identification      | N/A     | Button is not a form input.                                                                                                                                                                                                                  |
| 3.3.6  | Error Prevention          | N/A     | N/A                                                                                                                                                                                                                                          |
| 3.3.7  | Redundant Entry           | N/A     | N/A                                                                                                                                                                                                                                          |
| 3.3.8  | Accessible Authentication | N/A     | N/A                                                                                                                                                                                                                                          |

---

## Issues Found

### Issue #1 — [Medium] Minimum width not enforced; narrow sm buttons with short labels could fall below 24px (SC 2.5.8) — ✅ RESOLVED (2026-06-26)

> **Resolved 2026-06-26:** `min-w-6` (24px) is now present on both `sm` and `md` size classes; the live re-audit confirms the rendered target clears 24×24 px. Original finding retained below for the record.

**File:** `src/components/Button.tsx` line 37
**Criterion:** WCAG 2.2 SC 2.5.8 Target Size (Minimum)

**What is wrong:**
`sm` size applies `min-h-9` (36px) and `px-3` (12px per side). Height exceeds the 24px minimum floor. However, SC 2.5.8 requires a 24×24 CSS pixel bounding box. Width is determined by label content plus padding. A button with a single short character (e.g., `"X"` at `text-caption` = 14px font) plus `px-3` (24px total horizontal padding) will render approximately 38px wide — fine. But if the Button is ever rendered with _no children_ (icon-only, zero-width text), the width collapses to 24px of padding only, which is exactly at the boundary rather than safely above it.

More critically: there is no `min-w` set on either size. If a consumer renders `<Button size="sm" />` (or an icon-only usage with 16px icon and no label), the clickable area could be 24px wide or less, depending on icon/content size. The `md` size with `px-4` (32px total padding) is safer but still has no explicit floor.

**Fix:** Add `min-w-6` (24px) to both size classes as a safety floor. For `md`, add `min-w-6`. For `sm`, add `min-w-6`. If icon-only buttons are an intended pattern, add a dedicated `icon` size variant with `min-h-11 min-w-11` (44×44) to match the `md` height target. Alternatively, add a project-level convention in `src/components/CLAUDE.md` that icon-only usages must include explicit sizing.

```tsx
// Current (Button.tsx line 36-39)
const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 gap-1.5 px-3 text-caption",
  md: "min-h-11 gap-2 px-4 text-body",
};

// Proposed fix (minimum — adds safety floor)
const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 min-w-6 gap-1.5 px-3 text-caption",
  md: "min-h-11 min-w-6 gap-2 px-4 text-body",
};
```

---

### Issue #2 — [Nit] `pressed:` state is visually identical to `hover:` on primary and secondary variants — ✅ RESOLVED (2026-07-02)

> **Resolved 2026-07-02:** Distinct pressed tokens shipped in INC-215 (`primary-pressed` = brand.800, `surface-pressed` = neutral.200); contrast proof recorded in the 2026-07-02 addendum below. Original finding retained below for the record.

**File:** `src/components/Button.tsx` lines 28–31
**Criterion:** Not a WCAG failure; design/UX note.

**What is wrong:**
Both `primary` and `secondary` variants map `pressed:bg-primary-hover` / `pressed:bg-surface-muted` to the same token value as their hover state. Pressed and hovered states are therefore visually indistinguishable. The native `<button>` communicates the pressed state semantically (`:active`), so this is not a WCAG 1.4.1 or 1.3.1 failure — no information is conveyed by color alone that is not available via another channel. However, adding a distinct `pressed` token (e.g., `brand.800` for primary, `neutral.200` for secondary) would provide a richer haptic-equivalent affordance.

**Fix:** Define `pressed` semantic tokens (`--color-primary-pressed`, `--color-surface-pressed`) at brand.800 and neutral.200 respectively, and apply them to `pressed:` classes.

---

### Issue #3 — [Nit] No icon-only Button story or documented pattern

**File:** `src/components/Button.stories.tsx`
**Criterion:** Not a direct SC failure; operational risk.

**What is wrong:**
The Storybook stories cover primary, secondary, ghost, small, and disabled — but not icon-only usage. If a consumer renders a Button with only an icon child (common for toolbar/action buttons), there is no accessible name — a violation of SC 4.1.2 (Name, Role, Value) and SC 1.1.1. The component does not guard against this (no prop-type warning, no required `children` or `aria-label`).

This is not a defect in the current component code, since no icon-only usage exists yet. But as the first-listed primitive it will be pattern-copied. The risk should be contained now.

**Fix:** Add an `IconOnly` story that demonstrates `<Button aria-label="Close"><CloseIcon /></Button>` with the a11y addon verifying the accessible name. Add a JSDoc comment to `ButtonProps` noting that icon-only usage requires `aria-label` or `aria-labelledby`.

---

### Issue #4 — [Nit] `ring-offset-background` assumes white background stacking context — ✅ RESOLVED (2026-06-26)

> **Resolved 2026-06-26:** `focusRing` now uses `ring-offset-transparent` (not `ring-offset-background`), so the offset gap reflects the actual surface instead of hardcoding white. Original finding retained below for the record.

**File:** `src/components/Button.tsx` line 23
**Criterion:** SC 1.4.11 — design-time note, not a current failure.

**What is wrong:**
`focus-visible:ring-offset-background` hardcodes the ring-offset to `--color-background` (neutral.0, white). When a button appears on a colored surface — e.g., a card using `surface-muted` (neutral.100) — the ring-offset produces a white halo between the button and the ring. The ring itself still passes 1.4.11 (4.96:1), but the offset color creates a visual artifact on non-white surfaces that may appear as a gap rather than a deliberate part of the indicator.

**Fix:** This is acceptable for now (the contrast of ring vs. the offset gap is visible). When the design system expands to card surfaces, consider whether a CSS custom property approach (`ring-offset-color: var(--current-surface, var(--color-background))`) would be cleaner — or remove the offset entirely and rely on the ring alone (WCAG 2.4.13 does not require an offset).

---

## Disabled State Analysis

`disabled:opacity-50` (Button.tsx line 24) is applied via the RAC `disabled:` variant, which maps to `data-disabled`. RAC also sets `aria-disabled` on the rendered `<button>` and removes it from the tab sequence. This means:

- The disabled button is **not focusable** (RAC removes it from tab order by setting `disabled` on the native element) — correct behavior.
- SC 1.4.3 **explicitly exempts** inactive UI components from contrast requirements — the 50% opacity reduction is therefore not a WCAG violation.
- The visual treatment (dimmed) is a universally understood disabled affordance — SC 1.4.1 is satisfied because no meaning beyond "inactive" is conveyed.

One note for screen reader testing: confirm that RAC sets both the `disabled` HTML attribute _and_ `aria-disabled` consistently — some versions of RAC set only one or the other depending on whether `isDisabled` vs. `disabled` prop is used. The story uses `isDisabled` (RAC's prop), which is correct.

---

## WCAG 2.2 Additions Checklist

| Addition                      | SC           | Verdict                                                                              |
| ----------------------------- | ------------ | ------------------------------------------------------------------------------------ |
| Focus Not Obscured (Min)      | 2.4.11       | PASS — no sticky header/footer occlusion at component level. Verify on live pages.   |
| Focus Not Obscured (Enhanced) | 2.4.12 (AAA) | Not in scope (AAA).                                                                  |
| Focus Appearance              | 2.4.13       | PASS — 2px ring, full perimeter, 4.96:1 contrast.                                    |
| Dragging Movements            | 2.5.7        | PASS — N/A.                                                                          |
| Target Size (Minimum)         | 2.5.8        | PASS — `min-w-6` shipped (Issue #1 resolved 2026-06-26); width + height clear 24×24. |
| Consistent Help               | 3.2.6        | N/A — no help mechanism on this component.                                           |
| Redundant Entry               | 3.3.7        | N/A.                                                                                 |
| Accessible Authentication     | 3.3.8        | N/A.                                                                                 |

---

## Verdict

**PASS (AA)** — The Button primitive is WCAG 2.2 AA conformant in its current form. No blocker-level violations were identified. One Medium finding (Issue #1, target width floor) has since been **resolved** (`min-w-6` shipped — see the 2026-06-26 re-audit). One Nit finding (#3 icon-only) remains logged for design polish. Issue #2 (pressed token) was resolved 2026-07-02 — distinct pressed tokens with contrast proof in the addendum below.

---

## Manual Screen-Reader Testing Checklist

Automation (axe) catches ~40% of real-world issues. The following must be verified manually with VoiceOver (macOS/Safari) and NVDA (Windows/Firefox) before the component is considered production-hardened:

1. **Disabled announcement:** Confirm VoiceOver announces "dimmed" or "greyed out" and NVDA announces "unavailable" for the `isDisabled` story. Verify the button is skipped in Tab order.
2. **Pressed state announcement:** Confirm VoiceOver does _not_ announce spurious state changes on click for a standard (non-toggle) button. If any `aria-pressed` prop is passed by a consumer, confirm VoiceOver announces the toggle correctly.
3. **Focus ring visibility in High Contrast Mode (Windows):** The Tailwind ring may be overridden by forced colors. Confirm the ring remains visible under `forced-colors: active` (add `forced-colors:outline-2 forced-colors:outline-ButtonText` if not).
4. **Focus ring on colored surfaces:** Place a Button on a `surface-muted` card and confirm the white ring-offset does not create a visually confusing gap in the focus indicator.
5. **icon-only pattern:** Before any icon-only usage ships, test `<Button aria-label="…"><Icon /></Button>` — confirm VoiceOver reads the `aria-label` only (not the SVG title/desc) and NVDA does the same.

---

## Re-audit — 2026-06-26

Re-verified after the `--mc-*` token refactor and the Storybook render-blocker fix, via a live
axe-core 4.12.1 pass (WCAG 2.0/2.1/2.2 A + AA) through the rendered stories.

- **0 axe violations** across all 5 variants (Primary, Secondary, Ghost, Small, Disabled).
- Measured text contrast (rendered sRGB): Primary / Small white-on-brand **4.97:1**, Secondary
  **17.07:1**, Ghost **17.83:1**; Disabled is WCAG-exempt (inactive control).
- Issues #1 (target-width floor) and #4 (ring-offset) confirmed **resolved** in source
  (`min-w-6` present; `ring-offset-transparent`). #2 (pressed = hover token) and #3 (icon-only
  story/guard) remain **open**.
- Forced-colors / Windows HCM focus-ring and Focus Appearance remain **manual-only** — axe does
  not evaluate them; see the manual checklist above.

---

## Addendum — 2026-07-02: Pressed-pair contrast proof (INC-226)

The distinct pressed tokens shipped in INC-215 (`8d0a67c`) predate the
surface-contracts rule (INC-218, `src/components/CLAUDE.md`), which requires
a computed contrast ratio from measured token values for every non-default
fg/bg pair. Recorded here to close that gap; ratios computed from the token
sources in `tokens/primitive/color.json`, oklch resolved to sRGB.

| Pair                                                            | Background                                     | Foreground                                     | Ratio       | AA (4.5:1) |
| --------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | ----------- | ---------- |
| `primary-pressed` / `primary-foreground` (primary variant)      | brand.800 oklch(40% 0.13 248) → `#004989`      | neutral.0 → `#ffffff`                          | **9.05:1**  | PASS       |
| `surface-pressed` / `foreground` (secondary and ghost variants) | neutral.200 oklch(92.9% 0.005 247) → `#e5e8eb` | neutral.900 oklch(20.8% 0.010 247) → `#14181c` | **14.43:1** | PASS       |

Notes: brand.800 sits outside the sRGB gamut; naive channel clamping and CSS
oklch gamut mapping converge on the same sRGB result (`#004989`), so the
ratio is stable across rendering strategies. Both pressed backgrounds are
darker than their hover counterparts (9.05:1 vs 6.69:1 on primary), so the
pressed state strictly increases text contrast. `surface-pressed` is shared
by the secondary and ghost variants — one pair covers both.

---

## Addendum — 2026-07-08: Warm-ramp repoint supersedes surface ratios (INC-242)

INC-242 re-derived every `mc.color.neutral.*` value warm (hue ≈ 78–82) and swapped the
`background`/`surface` roles (cards now sit white above a warm page). The token **names**
Button consumes are unchanged; the **values** behind its non-primary pairs changed, so the
ratios recorded above are superseded for current values by
`docs/a11y/inc-242-design-language-proof.md` (float-oklch per INC-227). Finding bodies above
are retained verbatim per the record-keeping convention.

- Secondary/ghost `foreground` on `surface` (now white): **17.36:1**.
- `foreground` on `surface-muted` (hover): **15.69:1**; on `surface-pressed`: **14.11:1** —
  supersedes the 2026-07-02 addendum's 14.43:1. The primary pressed pair (9.05:1) is
  value-identical and re-proven — `brand.*` is untouched by INC-242.
- Secondary border `input` boundary: **3.86:1** on `surface`, **3.64:1** on `background`
  (was 4.76:1 — reduced margin, still above the 3:1 floor; flagged in the proof doc).
- Focus ring repointed `brand.600` → `accent-ink` (terracotta.600): **5.80:1** vs
  `background`, **6.15:1** vs `surface` (was 4.96:1) — the 1.4.11/2.4.13 margin improves.
- Primary fill pairs (4.96 / 6.69 / 9.05) are value-identical and re-proven.

---

## Addendum — 2026-07-10: Brand retirement — primary variant repointed to terracotta (INC-244)

INC-244 deleted the legacy blue `mc.color.brand.*` ramp and repointed the `primary*`
semantics at the terracotta ramp (`primary` → terracotta.600, `primary-hover` → 700,
`primary-pressed` → the new derived 800). The token **names** Button consumes are again
unchanged; the **values** behind the primary variant changed, so the primary fill ratios
recorded above are superseded for current values by
`docs/a11y/inc-244-brand-retirement-proof.md` (float-oklch per INC-227). Finding bodies
above are retained verbatim per the record-keeping convention.

- Primary fill pairs (`primary-foreground` on `primary`/`primary-hover`/`primary-pressed`):
  **6.15 / 8.77 / 11.62** (were 4.96 / 6.69 / 9.05) — every state's margin improves, and
  pressed remains strictly darker than hover, preserving the Issue #2 resolution rationale.
- The 2026-07-02 addendum's gamut note is retired with the ramp: brand.800 sat outside
  sRGB; the derived terracotta.800 (`oklch(35.22% 0.0905 41.41)`, display `#61270f`) is
  in-gamut, so the clip-vs-mapping caveat no longer applies to any primary value.
- Secondary/ghost pairs, the `input` boundary, and the focus `ring` (`accent-ink`) are
  untouched by INC-244 — the 2026-07-08 addendum's values remain current for them.
- Rendered check (Chromium computed style, Storybook Primary story): fill `#a14622`
  (terracotta.600), text `#ffffff`; axe suite 6/6 with zero A/AA violations.

---

## Addendum — 2026-07-17: Focus ring decoupled from brand accent (INC-252)

Advisory ruling (final, ratified in the INC-252 thread): the semantic `ring` token
repoints from `{color.accent-ink}` to `{color.foreground}` — focus indication decouples
from the brand accent **permanently**. Rationale: under the oxblood identity (variant 2a),
a same-hue ring would sit adjacent to the oxblood primary fill; hue-divergence keeps the
focus indicator perceptually distinct from the control it encloses. Same-hue acceptance
was considered and **rejected**. The token **name** Button consumes is unchanged; the
value behind it changed, so the ring ratios in the 2026-07-08 addendum are superseded:

- Focus `ring` (`foreground` = stone neutral.900) vs `background`: **15.20:1**; vs
  `surface`: **17.00:1** (was 5.80/6.15 via accent-ink) — the 1.4.11/2.4.13 margins
  improve by ~2.6×, and the ring is now hue-divergent from every oxblood fill state.
- INC-252 also repointed the terracotta ramp to oxblood and the cream neutrals to stone;
  Button's other pairs are re-proven in `scripts/contrast-proof.mjs prove` (all normative
  pairs PASS — primary fill pairs now **9.70 / 12.56 / 15.12**, secondary border `input`
  boundary **3.52** on `background` / **3.94** on `surface`, both above the 3:1 floor).

---

## Superseding note — 2026-07-17: Variant 3a two-tier red split (INC-252 Phase 1b)

Variant 3a (Linear comment 489685c6) supersedes the 2a palette values recorded in the
addendum above, same ticket, same token names. The role axis is **interactivity**, not
size: `primary` is now the **cranberry action tier** (oxblood.500, anchored #A62244),
its **hover lands on the brand tier** (oxblood.600, anchored #7D2B3C), and pressed goes
one step deeper (oxblood.700, #6E2434). No third red exists. The token names Button
consumes are again unchanged; superseding proven ratios:

- Primary fill pairs (`primary-foreground` on `primary`/`primary-hover`/`primary-pressed`):
  **7.16 / 9.20 / 10.69** (were 9.70 / 12.56 / 15.12) — every state clears the 4.5:1
  small-text floor with ≥ 59% margin, and pressed remains strictly darker than hover.
- **Ring ruling REAFFIRMED:** `ring` stays `{color.foreground}` (ink) — a deliberate
  exemption from the action tier, unchanged from the 2026-07-17 addendum above. On the
  lighter 3a ground the ring proves **15.60:1** vs `background`, **17.00:1** vs `surface`.
- Secondary border `input` boundary on the re-anchored ground: **3.55** on `background`,
  **3.87** on `surface` — above the 3:1 floor (margin watch continues).
