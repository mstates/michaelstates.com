# INC-242 design-language contrast proof — warm ramp, terracotta accent, inverted pair

- Date: 2026-07-08
- Ticket: INC-242 (design-language enablement), as amended 2026-07-08 (danger retune)
- Design source of record: the Home.dc.html export dated 2026-07-08 (values pinned in the ticket)
- Tool: `scripts/contrast-proof.mjs` (vendored, zero-dependency; Ottosson OKLab reference
  matrices + WCAG 2.2 relative luminance)
- Method: float-oklch pipeline per INC-227 — every ratio below is computed from oklch floats
  resolved to linear sRGB with no quantization. **Hex values are display artifacts only, never
  computation inputs.**

## 1. Tool validation (fixture gate — must pass before any new value is trusted)

`node scripts/contrast-proof.mjs validate` reproduces all 8 pre-INC-242 recorded ratios from
pinned inputs (token values @ `b4ad5c5`): 17.78/17.84 default pair, 4.96, 6.69, 9.05 (→ 9.07
8-bit control), 14.43 (→ 14.50 8-bit control), 7.55, 4.76, and the corrected danger fixture —
**8/8 PASS**. The conversion was independently cross-checked against Chrome's engine (canvas
pixel readback), which agrees byte-for-byte on every sampled color.

**Adjudication — 17.84 vs 17.78 (default pair):** the float-oklch pipeline computes **17.78**;
17.84 only appears after quantizing both colors to 8-bit (`#14181c` on `#ffffff`). 17.78 was the
float-correct design-time value; 17.84 is a rendered/8-bit measurement artifact — the same drift
class as the INC-226 controls (9.05→9.07, 14.43→14.50).

**Erratum (ratified 2026-07-08):** the 4.77:1 recorded for danger-on-white in
`docs/a11y/textfield.md` is reproducible by no computation path. Float-correct value: **4.73**;
8-bit/rendered: **4.75** (matches the 2026-06-26 re-audit's own 4.74/4.746 measurements).
Corrected fixture ratified as 4.73 float / 4.75 8-bit.

## 2. Derived values (`node scripts/contrast-proof.mjs derive` — scripted, never eyeballed)

### Terracotta primitives (`mc.color.terracotta.*`)

| stop | source hex | oklch token (float)          | 8-bit round-trip |
| ---- | ---------- | ---------------------------- | ---------------- |
| 300  | #e8a877    | `oklch(78.14% 0.0993 58.1)`  | OK               |
| 500  | #cf5a2b    | `oklch(60.85% 0.1601 40.73)` | OK               |
| 600  | #a14622    | `oklch(50.77% 0.1305 40.71)` | OK               |
| 700  | #7d3517    | `oklch(42.26% 0.1086 41.41)` | OK               |

### Warm neutral ramp (`mc.color.neutral.*`)

Anchored stops convert exactly from the design's sampled hex; in-between stops interpolate in
OKLCH between their bracketing anchors, with each stop's interpolation position `t` taken from
its **pre-INC-242 oklab-L position** between the same brackets — preserving the existing ramp's
lightness rhythm while landing every anchor exactly. Hue interpolates shortest-path. Stop 1000
stays `oklch(0% 0 0)` (black is achromatic — there is no "warm black").

| stop | derived token                | display hex | derivation                        |
| ---- | ---------------------------- | ----------- | --------------------------------- |
| 0    | `oklch(100% 0 0)`            | #ffffff     | ANCHOR #ffffff (round-trip OK)    |
| 50   | `oklch(97.98% 0.0045 78.3)`  | #faf8f5     | ANCHOR #faf8f5 (round-trip OK)    |
| 100  | `oklch(96.52% 0.0067 78.73)` | #f6f3ef     | interpolated 50/200 at t=0.2909   |
| 200  | `oklch(92.97% 0.012 79.78)`  | #ece7df     | ANCHOR #ece7df (round-trip OK)    |
| 300  | `oklch(87.78% 0.0122 79.78)` | #dbd6ce     | interpolated 200/600 at t=0.1242  |
| 400  | `oklch(73.79% 0.0129 79.76)` | #aea9a1     | interpolated 200/600 at t=0.4596  |
| 500  | `oklch(60.57% 0.0135 79.74)` | #868179     | interpolated 200/600 at t=0.7764  |
| 600  | `oklch(51.24% 0.0139 79.73)` | #6b665e     | ANCHOR #6b665e (round-trip OK)    |
| 700  | `oklch(39.58% 0.0127 81.76)` | #4a463f     | ANCHOR #4a463f (round-trip OK)    |
| 800  | `oklch(29.55% 0.0092 79.73)` | #2f2c28     | interpolated 700/900 at t=0.5671  |
| 900  | `oklch(21.89% 0.0065 78.18)` | #1c1a17     | ANCHOR #1c1a17 (round-trip OK)    |
| 950  | `oklch(15.26% 0.0045 78.18)` | #0d0b0a     | interpolated 900/1000 at t=0.3029 |
| 1000 | `oklch(0% 0 0)`              | #000000     | unchanged (pure black)            |

### `inverted-foreground-muted` (solid composite — no alpha in the token)

72% white over `inverted` (#1c1a17), composited in encoded sRGB exactly as a browser paints
`rgba(255,255,255,.72)` over the block → `oklch(80.45% 0.0013 78.31)` (display #bfbfbe).

### `functional.danger` retune (ratified INC-242 amendment)

Pre-retune `oklch(58% 0.20 27)` computes **4.4631** against the warm `background` — below the
4.5:1 error-text floor. Retuned to `oklch(57% 0.20 27)` (display #d4302e) with ratified
verification floors: vs `background` **4.6551** (floor 4.65) ✓; vs `surface` **4.9350**
(floor 4.9) ✓. `functional.success` untouched.

## 3. Full-ramp proof table (`node scripts/contrast-proof.mjs prove` — all normative pairs PASS)

| fg                         | bg              | ratio (float) | requirement                                              | result |
| -------------------------- | --------------- | ------------- | -------------------------------------------------------- | ------ |
| foreground                 | background      | 16.38         | ≥ 4.5:1 (text, default pair)                             | PASS   |
| foreground                 | surface         | 17.36         | ≥ 4.5:1 (text)                                           | PASS   |
| foreground                 | surface-muted   | 15.69         | ≥ 4.5:1 (text)                                           | PASS   |
| foreground                 | surface-pressed | 14.11         | ≥ 4.5:1 (text)                                           | PASS   |
| muted-foreground           | background      | 5.37          | ≥ 4.5:1 (text)                                           | PASS   |
| muted-foreground           | surface         | 5.69          | ≥ 4.5:1 (text)                                           | PASS   |
| muted-foreground           | muted           | 5.15          | ≥ 4.5:1 (text)                                           | PASS   |
| primary-foreground         | primary         | 4.96          | ≥ 4.5:1 (text)                                           | PASS   |
| primary-foreground         | primary-hover   | 6.69          | ≥ 4.5:1 (text)                                           | PASS   |
| primary-foreground         | primary-pressed | 9.05          | ≥ 4.5:1 (text)                                           | PASS   |
| primary                    | background      | 4.68          | ≥ 4.5:1 (text, Link on page)                             | PASS   |
| primary                    | surface         | 4.96          | ≥ 4.5:1 (text)                                           | PASS   |
| primary-hover              | background      | 6.31          | ≥ 4.5:1 (text)                                           | PASS   |
| primary-hover              | surface         | 6.69          | ≥ 4.5:1 (text)                                           | PASS   |
| accent-foreground          | accent          | 4.08          | ≥ 3:1 (large text/UI fill — accent is display/fill-only) | PASS   |
| accent                     | background      | 3.85          | ≥ 3:1 (non-text/large display)                           | PASS   |
| accent                     | surface         | 4.08          | ≥ 3:1 (non-text/large display)                           | PASS   |
| accent-ink                 | background      | 5.80          | ≥ 4.5:1 (small accent text)                              | PASS   |
| accent-ink                 | surface         | 6.15          | ≥ 4.5:1 (text)                                           | PASS   |
| accent-ink-hover           | background      | 8.27          | ≥ 4.5:1 (text)                                           | PASS   |
| accent-ink-hover           | surface         | 8.77          | ≥ 4.5:1 (text)                                           | PASS   |
| ring                       | background      | 5.80          | ≥ 3:1 (non-text, focus ring)                             | PASS   |
| ring                       | surface         | 6.15          | ≥ 3:1 (non-text, focus ring)                             | PASS   |
| input                      | background      | 3.64          | ≥ 3:1 (non-text, control boundary)                       | PASS   |
| input                      | surface         | 3.86          | ≥ 3:1 (non-text, control boundary)                       | PASS   |
| danger                     | background      | 4.66          | ≥ 4.65:1 (error text — ratified retune floor)            | PASS   |
| danger                     | surface         | 4.94          | ≥ 4.9:1 (error text — ratified retune floor)             | PASS   |
| danger-foreground          | danger          | 4.94          | ≥ 4.5:1 (text)                                           | PASS   |
| success-foreground         | success         | 5.09          | ≥ 4.5:1 (text)                                           | PASS   |
| inverted-foreground        | inverted        | 17.36         | ≥ 4.5:1 (text, inverted pair)                            | PASS   |
| inverted-foreground-muted  | inverted        | 9.44          | ≥ 4.5:1 (text, inverted muted)                           | PASS   |
| success                    | background      | 3.22          | — informational (no text/boundary usage exists)          | n/a    |
| border                     | background      | 1.16          | — informational (border is never a sole indicator)       | n/a    |
| border                     | surface         | 1.23          | — informational                                          | n/a    |
| terracotta.300 (primitive) | inverted        | 8.52          | ≥ 3:1 (future on-dark accent, large/fill)                | PASS   |

## 4. Notes and margins

- **Gamut:** `brand.600/700/800` sit slightly outside sRGB (as before INC-242); channel clipping
  and CSS gamut mapping converge on the same sRGB result, so their ratios are stable across
  rendering strategies (same note as the 2026-07-02 button addendum). No new token is out of
  gamut.
- **Reduced (but passing) margins to watch:** `input` boundary fell 4.76 → 3.64 (background) /
  3.86 (surface) — the warm 500 stop is lighter than the old cool 500. Still clear of the 3:1
  floor; if the shell design ever needs more edge, darken toward 600 through the pipeline.
  `danger`/`background` at 4.66 rides its ratified 4.65 floor by design.
- **Improved margins:** focus `ring` 4.96 → 5.80/6.15 (repointed to `accent-ink`);
  `foreground`/`surface` 17.36 on white cards.
- **Pending supersession (deliberately NOT edited in this change):**
  `src/components/CLAUDE.md:14` still cites the 17.84:1 default pair (now 16.38) and `:25` the
  9.05/14.43 pressed pairs (14.43 is now 14.11; 9.05 unchanged). CLAUDE.md edits are a
  hard-stop path and land as their own isolated, separately-reviewed commit.

## 5. Verification runs (2026-07-08, this working tree)

`pnpm tokens` clean (oklch passthrough verbatim; `--text-hero` emits
`clamp(var(--mc-size-hero-min), 5.4vw, var(--mc-size-hero-max))` with reference indirection
preserved; `--color-ring: var(--color-accent-ink)`); `pnpm build` clean (built CSS carries the
warm values; the `--color-ring → --color-accent-ink → --mc-color-terracotta-600` chain survives
Tailwind's theme tree-shaking); `pnpm lint` clean; `pnpm test` 13/13; `pnpm test:a11y` 6/6 with
zero WCAG 2.0/2.1/2.2 A+AA violations on both routes.
