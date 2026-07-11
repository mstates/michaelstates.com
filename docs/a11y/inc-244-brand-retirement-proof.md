# INC-244 brand-ramp retirement contrast proof — primary repointed to terracotta, terracotta.800 extension

- Date: 2026-07-10
- Ticket: INC-244 (retire the brand blue ramp, repoint primary component styling), ratified
  2026-07-10 with amendments (scope widened to add the `inverted-accent` semantic)
- Design source of record: the terracotta ramp pinned by INC-242 (Home.dc.html export,
  2026-07-08). The 800 stop is **derived** from that ramp's 500/600/700 anchors — no new
  sampled values enter the system in this change.
- Tool: `scripts/contrast-proof.mjs` (vendored, zero-dependency; Ottosson OKLab reference
  matrices + WCAG 2.2 relative luminance)
- Method: float-oklch pipeline per INC-227 — every ratio below is computed from the
  **authored token values** resolved to linear sRGB with no quantization. Hex values are
  display artifacts only, never computation inputs.

## 1. Tool validation (fixture gate — must pass before any new value is trusted)

`node scripts/contrast-proof.mjs validate`, run in this working tree **after** the brand
ramp's deletion: **8/8 PASS**, exit 0. The fixture block pins the retired brand values as
literals (token values @ `b4ad5c5`) precisely so the gate is independent of token repoints —
deleting the ramp does not touch it, and the vendored math stays permanently
regression-tested.

## 2. What changed

| token                      | before                     | after                                                                                                                                           |
| -------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `mc.color.brand.400–800`   | legacy blue ramp (hue 248) | **deleted** — 400/500 had zero consumers; 600/700/800 fed only the `primary*` aliases                                                           |
| `mc.color.terracotta.800`  | —                          | **new**: `oklch(35.22% 0.0905 41.41)` (derived — §3)                                                                                            |
| `color.primary`            | `{mc.color.brand.600}`     | `{mc.color.terracotta.600}`                                                                                                                     |
| `color.primary-hover`      | `{mc.color.brand.700}`     | `{mc.color.terracotta.700}`                                                                                                                     |
| `color.primary-pressed`    | `{mc.color.brand.800}`     | `{mc.color.terracotta.800}`                                                                                                                     |
| `color.primary-foreground` | `{mc.color.neutral.0}`     | unchanged                                                                                                                                       |
| `color.inverted-accent`    | —                          | **new** (ratified scope amendment): `{mc.color.terracotta.300}` — on-dark accent for inverted surfaces, large-text/fill usage only, ≥ 3:1 floor |

No component, story, test, or config file changed: the semantic token names are the utility
surface and they are untouched. The 2026-07-10 recon established the three `primary*`
aliases were the blue ramp's only live consumers in the entire token graph.

## 3. Derived value (`node scripts/contrast-proof.mjs derive` — scripted, never eyeballed)

### `mc.color.terracotta.800`

Derived, **not sampled**: the Home.dc.html export defines the terracotta ramp only down to
700, so there is no source hex and no round-trip gate. The derivation gate instead requires
the scripted recomputation from the 500/600/700 anchors to reproduce the authored value
exactly (the same gate class as the danger-retune floors).

| dimension | rhythm in the 500→600→700 anchors                                   | extension                                 |
| --------- | ------------------------------------------------------------------- | ----------------------------------------- |
| L         | geometric — per-step ratios 0.834347 / 0.832381 agree within 0.2%   | 42.26% × geo-mean 0.833363 = **35.2179%** |
| C         | dark-end C∝L coupling — C/L identical to 4 s.f. at 600 and 700      | mean slope 0.257011 × L = **0.090514**    |
| H         | dark-end hue flat within hex-quantization noise (40.73/40.71/41.41) | held from 700: **41.41**                  |

Authored at token file precision: **`oklch(35.22% 0.0905 41.41)`** (display `#61270f`).

derive() gates, all OK (exit 0):

- the recomputation reproduces the authored value byte-for-byte;
- white / terracotta.800: **11.6221** float — clears the 4.5:1 pressed-text floor at 2.58×
  (8-bit/rendered expectation 11.63 — the INC-226 drift class, display-only);
- **in-gamut** (linear channels 0.1187 / 0.0206 / 0.0050) — the retired brand.800 was not.

## 4. Full-ramp proof table (`node scripts/contrast-proof.mjs prove` — all normative pairs PASS, exit 0)

| fg                        | bg              | ratio (float) | requirement                                              | result |
| ------------------------- | --------------- | ------------- | -------------------------------------------------------- | ------ |
| foreground                | background      | 16.38         | ≥ 4.5:1 (text, default pair)                             | PASS   |
| foreground                | surface         | 17.36         | ≥ 4.5:1 (text)                                           | PASS   |
| foreground                | surface-muted   | 15.69         | ≥ 4.5:1 (text)                                           | PASS   |
| foreground                | surface-pressed | 14.11         | ≥ 4.5:1 (text)                                           | PASS   |
| muted-foreground          | background      | 5.37          | ≥ 4.5:1 (text)                                           | PASS   |
| muted-foreground          | surface         | 5.69          | ≥ 4.5:1 (text)                                           | PASS   |
| muted-foreground          | muted           | 5.15          | ≥ 4.5:1 (text)                                           | PASS   |
| primary-foreground        | primary         | 6.15          | ≥ 4.5:1 (text)                                           | PASS   |
| primary-foreground        | primary-hover   | 8.77          | ≥ 4.5:1 (text)                                           | PASS   |
| primary-foreground        | primary-pressed | 11.62         | ≥ 4.5:1 (text)                                           | PASS   |
| primary                   | background      | 5.80          | ≥ 4.5:1 (text, Link on page)                             | PASS   |
| primary                   | surface         | 6.15          | ≥ 4.5:1 (text)                                           | PASS   |
| primary-hover             | background      | 8.27          | ≥ 4.5:1 (text)                                           | PASS   |
| primary-hover             | surface         | 8.77          | ≥ 4.5:1 (text)                                           | PASS   |
| accent-foreground         | accent          | 4.08          | ≥ 3:1 (large text/UI fill — accent is display/fill-only) | PASS   |
| accent                    | background      | 3.85          | ≥ 3:1 (non-text/large display)                           | PASS   |
| accent                    | surface         | 4.08          | ≥ 3:1 (non-text/large display)                           | PASS   |
| accent-ink                | background      | 5.80          | ≥ 4.5:1 (small accent text)                              | PASS   |
| accent-ink                | surface         | 6.15          | ≥ 4.5:1 (text)                                           | PASS   |
| accent-ink-hover          | background      | 8.27          | ≥ 4.5:1 (text)                                           | PASS   |
| accent-ink-hover          | surface         | 8.77          | ≥ 4.5:1 (text)                                           | PASS   |
| ring                      | background      | 5.80          | ≥ 3:1 (non-text, focus ring)                             | PASS   |
| ring                      | surface         | 6.15          | ≥ 3:1 (non-text, focus ring)                             | PASS   |
| input                     | background      | 3.64          | ≥ 3:1 (non-text, control boundary)                       | PASS   |
| input                     | surface         | 3.86          | ≥ 3:1 (non-text, control boundary)                       | PASS   |
| danger                    | background      | 4.66          | ≥ 4.65:1 (error text — ratified retune floor)            | PASS   |
| danger                    | surface         | 4.94          | ≥ 4.9:1 (error text — ratified retune floor)             | PASS   |
| danger-foreground         | danger          | 4.94          | ≥ 4.5:1 (text)                                           | PASS   |
| success-foreground        | success         | 5.09          | ≥ 4.5:1 (text)                                           | PASS   |
| inverted-foreground       | inverted        | 17.36         | ≥ 4.5:1 (text, inverted pair)                            | PASS   |
| inverted-foreground-muted | inverted        | 9.44          | ≥ 4.5:1 (text, inverted muted)                           | PASS   |
| inverted-accent           | inverted        | 8.52          | ≥ 3:1 (on-dark accent, large/fill)                       | PASS   |
| success                   | background      | 3.22          | — informational (no text/boundary usage exists)          | n/a    |
| border                    | background      | 1.16          | — informational (border is never a sole indicator)       | n/a    |
| border                    | surface         | 1.23          | — informational                                          | n/a    |

## 5. Notes and margins

- **Every `primary*` pair's margin improves.** Fill pairs (`primary-foreground` on
  `primary`/`-hover`/`-pressed`): 4.96 / 6.69 / 9.05 → **6.15 / 8.77 / 11.62**. Text pairs:
  `primary` on `background`/`surface` 4.68 / 4.96 → **5.80 / 6.15**; hover 6.31 / 6.69 →
  **8.27 / 8.77**. Pressed remains strictly darker than hover — the INC-215
  distinct-pressed affordance rationale is preserved.
- **The gamut-clip caveat class is retired.** brand.600/700/800 sat outside sRGB (the
  recurring clip-vs-CSS-gamut-mapping note since the 2026-07-02 button addendum). With the
  ramp deleted and terracotta.800 verified in-gamut, every token in the system now sits
  inside sRGB.
- **Link text and focus ring now share a stop:** `primary` = `accent-ink` =
  terracotta.600, so a link's text and its focus ring are chromatically identical by
  construction. Ring ratios are unchanged from INC-242.
- `inverted-accent`/`inverted` (**8.52**, floor 3:1) moves from the INC-242 proof's
  informational "terracotta.300 (primitive)" footnote into the normative table. It has no
  page consumer yet, so Tailwind v4 tree-shakes `--color-inverted-accent` out of compiled
  CSS until its first utility appears — the token lives in `tokens/semantic/color.json` and
  `src/styles/tokens.css` (the pipeline- and Figma-facing artifacts) and ships pre-proven.
- **Pending supersession (deliberately NOT edited in this change):**
  `src/components/CLAUDE.md` still points at the INC-242 proof as "current values"; the
  ratified numeric corrections land as their own isolated hard-stop pass after this diff
  is reviewed.

## 6. Verification runs (2026-07-10, this working tree)

- `pnpm tokens` — regenerated `src/styles/tokens.css` diff contains exactly: the five
  `--mc-color-brand-*` custom properties removed, `--mc-color-terracotta-800` added,
  `--color-inverted-accent` added, and the three `--color-primary*` `@theme` lines
  repointed. Nothing else.
- `node scripts/contrast-proof.mjs validate` → 8/8, exit 0; `derive` → terracotta.800
  section all-OK, exit 0; `prove` → all normative pairs PASS, exit 0.
- `rg -i brand tokens/ src/styles/tokens.css` → zero hits.
- `pnpm lint` (eslint + astro check) → 0 errors / 0 warnings; `pnpm test` → 13/13;
  `pnpm build` → clean (2 pages); `pnpm test:a11y` → 6/6, zero WCAG 2.0/2.1/2.2 A+AA
  violations on both routes.
- Rendered verification (Chromium, computed style + canvas readback): built `/404`
  "Return home" link computes `oklch(0.5077 0.1305 40.71)` → `#a14622` (terracotta.600);
  Storybook `Primitives/Button` Primary renders a `#a14622` fill with `#ffffff` text;
  Storybook `Primitives/Link` Standalone renders `#a14622` with the persistent underline.
  `--mc-color-brand-*` is absent from all compiled CSS.
