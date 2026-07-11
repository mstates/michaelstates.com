#!/usr/bin/env node
/**
 * contrast-proof.mjs — INC-242 float-oklch contrast pipeline (INC-227 rule).
 *
 * Zero-dependency by deliberate decision (recon §6.1, ratified): installing
 * culori/colorjs.io would trigger the dependency-install hard stop, and the
 * fixture-validation gate below is the correctness guarantee a library would
 * otherwise provide. All color math is vendored from published reference
 * constants:
 *   - OKLab/OKLCH ↔ linear-sRGB matrices: Björn Ottosson, "A perceptual color
 *     space for image processing" (bottosson.github.io/posts/oklab), the same
 *     constants culori and colorjs.io ship.
 *   - Relative luminance + contrast ratio: WCAG 2.2 §"relative luminance" /
 *     SC 1.4.3 definition of contrast ratio.
 *
 * Two computation paths, kept deliberately distinct (INC-226):
 *   float — oklch → linear sRGB → Y, no quantization anywhere. This is the
 *           design-time contract value.
 *   hex8  — oklch → 8-bit sRGB hex → decode → Y. This is what a rendered-
 *           pixel measurement (axe, canvas sampling) sees. Display-only;
 *           never a computation input for proofs.
 *
 * Modes:
 *   node scripts/contrast-proof.mjs validate   fixture gate vs current tokens
 *   node scripts/contrast-proof.mjs derive     INC-242 value derivation tables
 *   node scripts/contrast-proof.mjs prove      full-ramp proof of semantic pairs
 *
 * validate and prove exit non-zero on any miss — CI-composable.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

// ---------------------------------------------------------------------------
// Color math (vendored, see header)
// ---------------------------------------------------------------------------

/** Parse "oklch(L% C H)" → { L: 0..1, C, H: degrees }. */
export function parseOklch(str) {
  const m = /^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(str.trim());
  if (!m) throw new Error(`Unparseable oklch string: "${str}"`);
  return { L: Number(m[1]) / 100, C: Number(m[2]), H: Number(m[3]) };
}

/** OKLCH → linear sRGB (unclamped; may exceed [0,1] when out of gamut). */
export function oklchToLinearSrgb({ L, C, H }) {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** Linear sRGB → OKLCH (full float). */
export function linearSrgbToOklch([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  let C = Math.hypot(A, B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  if (C < 1e-7) {
    C = 0;
    H = 0; // achromatic: hue is meaningless
  }
  return { L, C, H };
}

/** Gamut handling: hard clip linear channels to [0,1]; flags real excursions. */
function clipLinear(rgb, label = "") {
  const EPS = 1e-4; // float noise vs a genuine out-of-gamut excursion
  return rgb.map((c) => {
    if ((c < -EPS || c > 1 + EPS) && label) {
      process.stderr.write(
        `  [gamut] ${label}: linear channel ${c.toFixed(5)} clipped to sRGB\n`,
      );
    }
    return Math.min(1, Math.max(0, c));
  });
}

/** sRGB transfer function — encode linear → gamma (sRGB standard). */
const encode = (c) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
/** WCAG 2.x decode gamma → linear (0.03928 threshold, as axe implements it). */
const decode = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** WCAG relative luminance from linear sRGB. */
const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** WCAG contrast ratio from two luminances. */
function ratioFromY(y1, y2) {
  const [hi, lo] = y1 >= y2 ? [y1, y2] : [y2, y1];
  return (hi + 0.05) / (lo + 0.05);
}

/** FLOAT path: contrast of two oklch strings, no quantization. */
export function ratioFloat(fgStr, bgStr) {
  const y = (s) => luminance(clipLinear(oklchToLinearSrgb(parseOklch(s)), s));
  return ratioFromY(y(fgStr), y(bgStr));
}

/** oklch string → display hex (8-bit, gamut-clipped). */
export function oklchToHex(str) {
  const rgb = clipLinear(oklchToLinearSrgb(parseOklch(str)), str);
  return (
    "#" +
    rgb
      .map((c) =>
        Math.round(encode(c) * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

export function hexToLinear(hex) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => decode(parseInt(h.slice(i, i + 2), 16) / 255));
}

/** HEX8 path: contrast as a rendered-pixel measurement would compute it. */
export function ratioHex8(fgOklch, bgOklch) {
  const y = (s) => luminance(hexToLinear(oklchToHex(s)));
  return ratioFromY(y(fgOklch), y(bgOklch));
}

/** hex → oklch (full float). */
export function hexToOklch(hex) {
  return linearSrgbToOklch(hexToLinear(hex));
}

/** OKLCH → token string at file precision: L% 2dp, C 4dp, H 2dp. */
export function oklchToken({ L, C, H }) {
  const l = (L * 100).toFixed(2).replace(/\.?0+$/, "");
  const c = C.toFixed(4).replace(/\.?0+$/, "");
  const h = H.toFixed(2).replace(/\.?0+$/, "");
  return `oklch(${l}% ${c === "" ? "0" : c} ${h === "" ? "0" : h})`;
}

const round2 = (x) => Math.round(x * 100) / 100;

// ---------------------------------------------------------------------------
// Token-source access
// ---------------------------------------------------------------------------

function loadJson(rel) {
  return JSON.parse(readFileSync(new URL(rel, `file://${repoRoot}`), "utf8"));
}

/** Flatten {mc:{color:{...}}} → Map("mc.color.neutral.900" → "oklch(...)"). */
function flatten(obj, prefix, out = new Map()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === "object" && "$value" in v) {
      out.set(`${prefix}${k}`, v.$value);
    } else if (v && typeof v === "object") {
      flatten(v, `${prefix}${k}.`, out);
    }
  }
  return out;
}

function loadTokens() {
  // Both files carry their own top-level namespace key ("mc" / "color"),
  // so flattening from an empty prefix yields "mc.color.…" and "color.…".
  const primitives = flatten(loadJson("tokens/primitive/color.json"), "");
  const semantics = flatten(loadJson("tokens/semantic/color.json"), "");
  const all = new Map([...primitives, ...semantics]);
  const resolve = (name, depth = 0) => {
    if (depth > 8) throw new Error(`Reference loop at ${name}`);
    const raw = all.get(name);
    if (raw === undefined) throw new Error(`Unknown token: ${name}`);
    const ref = /^\{(.+)\}$/.exec(raw);
    return ref ? resolve(ref[1], depth + 1) : raw;
  };
  return { resolve };
}

// ---------------------------------------------------------------------------
// Mode: validate — the fixture gate (INC-242 recon §2). Validates the vendored
// math against the pre-INC-242 recorded ratios. Inputs are PINNED literals —
// the token values as they stood at b4ad5c5 — so this gate stays a permanent
// regression test of the math itself, independent of later token repoints.
// Recorded figures come from docs/a11y/*.md + src/components/CLAUDE.md.
// ---------------------------------------------------------------------------

// Pre-INC-242 primitive values (tokens/primitive/color.json @ b4ad5c5).
const PINNED = {
  "neutral.0": "oklch(100% 0 0)",
  "neutral.200": "oklch(92.9% 0.005 247)",
  "neutral.500": "oklch(55.4% 0.014 247)",
  "neutral.600": "oklch(44.6% 0.014 247)",
  "neutral.900": "oklch(20.8% 0.010 247)",
  "brand.600": "oklch(54% 0.17 248)",
  "brand.700": "oklch(47% 0.15 248)",
  "brand.800": "oklch(40% 0.13 248)",
  "functional.danger": "oklch(58% 0.20 27)", // pre-retune (INC-242 amendment)
};

function validate() {
  const P = (n) => PINNED[n];

  // expectFloat: recorded design-time (float) figure; expectHex8: recorded
  // rendered/8-bit figure where one exists. INC-226's 9.07/14.50 pair is the
  // designed negative control for hex re-quantization drift.
  const fixtures = [
    {
      label: "foreground(neutral.900) / background(neutral.0) — default pair",
      fg: P("neutral.900"),
      bg: P("neutral.0"),
      expectFloat: 17.78,
      expectHex8: 17.84,
      adjudicate: true,
    },
    {
      label: "white / primary(brand.600)",
      fg: P("neutral.0"),
      bg: P("brand.600"),
      expectFloat: 4.96,
    },
    {
      label: "white / primary-hover(brand.700)",
      fg: P("neutral.0"),
      bg: P("brand.700"),
      expectFloat: 6.69,
    },
    {
      label: "white / primary-pressed(brand.800) — INC-226 control",
      fg: P("neutral.0"),
      bg: P("brand.800"),
      expectFloat: 9.05,
      expectHex8: 9.07,
    },
    {
      label:
        "foreground(neutral.900) / surface-pressed(neutral.200) — INC-226 control",
      fg: P("neutral.900"),
      bg: P("neutral.200"),
      expectFloat: 14.43,
      expectHex8: 14.5,
    },
    {
      label: "muted-foreground(neutral.600) / white",
      fg: P("neutral.600"),
      bg: P("neutral.0"),
      expectFloat: 7.55,
    },
    {
      // The original design-time record (4.77, docs/a11y/textfield.md:22–23)
      // is an ERRATUM: no computation path reproduces it, Chrome canvas
      // readback agrees with this tool byte-for-byte (#d73431), and the
      // 2026-06-26 re-audit itself measured 4.74/4.746 — this tool's 8-bit
      // path. Advisory ratified the corrected fixture 2026-07-08:
      // 4.73 float / 4.75 hex8 (same artifact class as 17.84-vs-17.78).
      label:
        "danger(functional.danger, pre-retune) / white — ratified erratum correction",
      fg: P("functional.danger"),
      bg: P("neutral.0"),
      expectFloat: 4.73,
      expectHex8: 4.75,
    },
    {
      label: "input(neutral.500) / white",
      fg: P("neutral.500"),
      bg: P("neutral.0"),
      expectFloat: 4.76,
    },
  ];

  let failed = 0;
  console.log(
    "Fixture validation — vendored math vs pre-INC-242 recorded ratios (pinned inputs @ b4ad5c5)\n",
  );
  for (const f of fixtures) {
    const fl = ratioFloat(f.fg, f.bg);
    const h8 = ratioHex8(f.fg, f.bg);
    const okF = round2(fl) === f.expectFloat;
    const okH = f.expectHex8 === undefined || round2(h8) === f.expectHex8;
    const ok = okF && okH;
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${f.label}`);
    console.log(
      `      float ${fl.toFixed(6)} (expect ${f.expectFloat})` +
        `  hex8 ${h8.toFixed(6)} via ${oklchToHex(f.fg)}/${oklchToHex(f.bg)}` +
        (f.expectHex8 !== undefined ? ` (expect ${f.expectHex8})` : ""),
    );
    if (f.adjudicate) {
      console.log(
        `      ADJUDICATION 17.84-vs-17.78: the float-oklch pipeline computes ` +
          `${round2(fl)}; 17.84 only appears after quantizing both colors to ` +
          `8-bit hex (${oklchToHex(f.fg)} on ${oklchToHex(f.bg)} → ${round2(h8)}). ` +
          `17.78 is the float-correct design-time value; 17.84 is a rendered/8-bit ` +
          `measurement artifact — the same drift class as 9.05→9.07 / 14.43→14.50 (INC-226).`,
      );
    }
  }
  console.log(
    `\n${fixtures.length - failed}/${fixtures.length} fixtures reproduced.` +
      (failed ? " STOP: do not proceed to derivation." : " Gate PASS."),
  );
  process.exitCode = failed ? 1 : 0;
}

// ---------------------------------------------------------------------------
// Mode: derive — INC-242 pinned design values → token values. Source of
// record: Home.dc.html export dated 2026-07-08, as extracted in the ticket.
// ---------------------------------------------------------------------------

const TERRACOTTA = {
  300: "#e8a877",
  500: "#cf5a2b",
  600: "#a14622",
  700: "#7d3517",
};
// Sampled warm anchors → neutral stops (ticket fact 4).
const WARM_ANCHORS = {
  0: "#ffffff",
  50: "#faf8f5",
  200: "#ece7df",
  600: "#6b665e",
  700: "#4a463f",
  900: "#1c1a17",
};
const INVERTED_BLOCK = "#1c1a17";
const MUTED_ON_INVERTED_ALPHA = 0.72; // 72% white over the block (ticket fact 3)
// Ratified 2026-07-08 (INC-242 amendment): functional.danger retunes so error
// text clears 4.5:1 on the warm background with margin. Verification floors
// ratified with it: ≥ 4.65 vs background, ≥ 4.9 vs surface.
const DANGER_RETUNED = "oklch(57% 0.20 27)";
// Ratified 2026-07-10 (INC-244): terracotta.800 extends the ramp so primary-pressed
// survives the brand retirement. DERIVED, not sampled (no Home.dc source hex → no
// round-trip gate): L continues the ramp's geometric progression, C the dark-end
// C∝L coupling (C/L ≈ 0.00257 at both 600 and 700), H holds the 700 hue (dark-end
// hue is flat within hex-quantization noise). Gates in derive(): the recomputation
// must reproduce this authored value, white-on-800 must clear the 4.5:1 pressed-pair
// floor, and the stop must be in-gamut (the retired brand.800 was not).
const TERRACOTTA_800 = "oklch(35.22% 0.0905 41.41)";
// Pre-INC-242 neutral-ramp oklab-L per stop (tokens @ b4ad5c5) — the
// HISTORICAL input that fixes each in-between stop's position between its
// bracketing anchors. Pinned so the derivation is reproducible after the
// repoint lands.
const CURRENT_NEUTRAL_L = new Map([
  [0, 1.0],
  [50, 0.984],
  [100, 0.968],
  [200, 0.929],
  [300, 0.869],
  [400, 0.707],
  [500, 0.554],
  [600, 0.446],
  [700, 0.372],
  [800, 0.279],
  [900, 0.208],
  [950, 0.145],
  [1000, 0.0],
]);

/** Round-trip check: token-precision string → hex must equal the source hex. */
function roundTrip(hex) {
  const token = oklchToken(hexToOklch(hex));
  const back = oklchToHex(token);
  return { token, back, ok: back.toLowerCase() === hex.toLowerCase() };
}

/**
 * Warm neutral ramp. Anchored stops convert exactly from the sampled hex.
 * In-between stops interpolate in OKLCH between their bracketing anchors,
 * with t taken from each stop's CURRENT position in oklab-L between the same
 * brackets — this preserves the existing ramp's designed lightness rhythm
 * while landing every anchor exactly. Hue interpolates shortest-path.
 * Stop 950 keeps its current L-position between 900 and 1000 (pure black,
 * which stays oklch(0% 0 0): black is achromatic — there is no "warm black").
 */
function deriveWarmRamp() {
  const stops = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000];
  const currentL = CURRENT_NEUTRAL_L;
  const anchorOklch = new Map(
    Object.entries(WARM_ANCHORS).map(([s, hex]) => [
      Number(s),
      hexToOklch(hex),
    ]),
  );
  anchorOklch.set(1000, { L: 0, C: 0, H: 0 }); // interpolation endpoint only

  const anchorStops = [...anchorOklch.keys()].sort((a, b) => a - b);
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpHue = (a, b, t) => {
    let d = ((b - a + 540) % 360) - 180; // shortest path
    return (a + d * t + 360) % 360;
  };

  const out = new Map();
  for (const stop of stops) {
    if (stop === 1000) {
      out.set(stop, { token: "oklch(0% 0 0)", note: "unchanged (pure black)" });
      continue;
    }
    if (anchorOklch.has(stop) && stop in WARM_ANCHORS) {
      const rt = roundTrip(WARM_ANCHORS[stop]);
      out.set(stop, {
        token: rt.token,
        note: `ANCHOR ${WARM_ANCHORS[stop]} round-trip ${rt.ok ? "OK" : `FAIL → ${rt.back}`}`,
        ok: rt.ok,
      });
      continue;
    }
    const lo = anchorStops.filter((s) => s < stop).pop();
    const hi = anchorStops.find((s) => s > stop);
    const t =
      (currentL.get(stop) - currentL.get(lo)) /
      (currentL.get(hi) - currentL.get(lo));
    const A = anchorOklch.get(lo);
    const B = anchorOklch.get(hi);
    const derived = {
      L: lerp(A.L, B.L, t),
      C: lerp(A.C, B.C, t),
      H: B.C === 0 ? A.H : A.C === 0 ? B.H : lerpHue(A.H, B.H, t),
    };
    out.set(stop, {
      token: oklchToken(derived),
      note: `interpolated between ${lo}/${hi} at t=${t.toFixed(4)} (current-L position)`,
    });
  }
  return out;
}

function derive() {
  console.log("## Terracotta primitives (mc.color.terracotta.*)\n");
  console.log("| stop | source hex | oklch token (float) | round-trip |");
  console.log("| --- | --- | --- | --- |");
  let anyFail = false;
  for (const [stop, hex] of Object.entries(TERRACOTTA)) {
    const rt = roundTrip(hex);
    if (!rt.ok) anyFail = true;
    console.log(
      `| ${stop} | ${hex} | \`${rt.token}\` | ${rt.ok ? "OK" : `FAIL → ${rt.back}`} |`,
    );
  }

  console.log("\n## Warm neutral ramp (mc.color.neutral.*)\n");
  console.log(
    "| stop | pre-INC-242 L | derived token | display hex | derivation |",
  );
  console.log("| --- | --- | --- | --- | --- |");
  for (const [stop, d] of deriveWarmRamp()) {
    if (d.ok === false) anyFail = true;
    console.log(
      `| ${stop} | ${CURRENT_NEUTRAL_L.get(stop)} | \`${d.token}\` | ${oklchToHex(d.token)} | ${d.note} |`,
    );
  }

  // Solid composite: encoded-space compositing, exactly as a browser paints
  // rgba(255,255,255,.72) over the block; kept as float until token rounding.
  const block = INVERTED_BLOCK.replace("#", "");
  const encodedBlock = [0, 2, 4].map(
    (i) => parseInt(block.slice(i, i + 2), 16) / 255,
  );
  const comp = encodedBlock.map(
    (c) => MUTED_ON_INVERTED_ALPHA * 1 + (1 - MUTED_ON_INVERTED_ALPHA) * c,
  );
  const compOklch = linearSrgbToOklch(comp.map(decode));
  const compToken = oklchToken(compOklch);
  console.log("\n## inverted-foreground-muted (solid composite, no alpha)\n");
  console.log(
    `72% white over ${INVERTED_BLOCK} (encoded-space compositing) → ` +
      `\`${compToken}\` (display ${oklchToHex(compToken)})`,
  );

  // Ratified danger retune — pre-verify the amendment's floors from the
  // pinned design values before the primitive is edited.
  const warmBg = oklchToken(hexToOklch(WARM_ANCHORS[50]));
  const rBg = ratioFloat(DANGER_RETUNED, warmBg);
  const rSurf = ratioFloat(DANGER_RETUNED, "oklch(100% 0 0)");
  console.log("\n## functional.danger retune (ratified 2026-07-08)\n");
  console.log(
    `\`${DANGER_RETUNED}\` (display ${oklchToHex(DANGER_RETUNED)}) — ` +
      `vs background(${WARM_ANCHORS[50]}): ${rBg.toFixed(4)} (floor 4.65) ${rBg >= 4.65 ? "OK" : "FAIL"}; ` +
      `vs surface(#ffffff): ${rSurf.toFixed(4)} (floor 4.9) ${rSurf >= 4.9 ? "OK" : "FAIL"}`,
  );
  if (rBg < 4.65 || rSurf < 4.9) anyFail = true;

  // INC-244: recompute the terracotta.800 extension from the token-precision
  // 500/600/700 anchors and gate the authored constant against it (the derivation
  // gate stands in for the round-trip gate a sampled stop would get).
  const anchor = (stop) => parseOklch(oklchToken(hexToOklch(TERRACOTTA[stop])));
  const a5 = anchor(500);
  const a6 = anchor(600);
  const a7 = anchor(700);
  const rGeo = Math.sqrt((a6.L / a5.L) * (a7.L / a6.L));
  const L800 = a7.L * rGeo;
  const slope = (a6.C / a6.L + a7.C / a7.L) / 2;
  const recomputed = oklchToken({ L: L800, C: slope * L800, H: a7.H });
  const match = recomputed === TERRACOTTA_800;
  const rPressed = ratioFloat("oklch(100% 0 0)", TERRACOTTA_800);
  const inGamut = oklchToLinearSrgb(parseOklch(TERRACOTTA_800)).every(
    (c) => c >= -1e-4 && c <= 1 + 1e-4,
  );
  console.log("\n## terracotta.800 extension (ratified 2026-07-10, INC-244)\n");
  console.log(
    `geometric L ratio ${rGeo.toFixed(6)} → L ${(L800 * 100).toFixed(4)}%; ` +
      `dark-end C/L ${slope.toFixed(6)} → C ${(slope * L800).toFixed(6)}; ` +
      `H held from 700 → \`${recomputed}\` — ` +
      `authored \`${TERRACOTTA_800}\` ${match ? "OK" : "FAIL (recomputation drifted)"}`,
  );
  console.log(
    `white / terracotta.800: ${rPressed.toFixed(4)} float ` +
      `(pressed text pair, floor 4.5) ${rPressed >= 4.5 ? "OK" : "FAIL"}; ` +
      `display ${oklchToHex(TERRACOTTA_800)}; ` +
      `in-gamut ${inGamut ? "OK — the retired brand.800 was not" : "FAIL"}`,
  );
  if (!match || rPressed < 4.5 || !inGamut) anyFail = true;

  if (anyFail) {
    console.log(
      "\nSTOP: a round-trip failed — raise token precision before use.",
    );
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------
// Mode: prove — full-ramp proof table over the (edited) semantic tier.
// Normative rows carry a WCAG threshold; informational rows document pairs
// with no normative requirement (border is never the sole indicator today;
// success has no text usage).
// ---------------------------------------------------------------------------

function prove() {
  const { resolve } = loadTokens();
  const S = (n) => resolve(`color.${n}`);

  const rows = [
    // [fg, bg, min, requirement label]  — semantic names unless noted
    ["foreground", "background", 4.5, "text (default pair)"],
    ["foreground", "surface", 4.5, "text"],
    ["foreground", "surface-muted", 4.5, "text"],
    ["foreground", "surface-pressed", 4.5, "text"],
    ["muted-foreground", "background", 4.5, "text"],
    ["muted-foreground", "surface", 4.5, "text"],
    ["muted-foreground", "muted", 4.5, "text"],
    ["primary-foreground", "primary", 4.5, "text"],
    ["primary-foreground", "primary-hover", 4.5, "text"],
    ["primary-foreground", "primary-pressed", 4.5, "text"],
    ["primary", "background", 4.5, "text (Link on page)"],
    ["primary", "surface", 4.5, "text"],
    ["primary-hover", "background", 4.5, "text"],
    ["primary-hover", "surface", 4.5, "text"],
    [
      "accent-foreground",
      "accent",
      3.0,
      "large text/UI fill (accent is display/fill-only)",
    ],
    ["accent", "background", 3.0, "non-text/large display"],
    ["accent", "surface", 3.0, "non-text/large display"],
    ["accent-ink", "background", 4.5, "text (small accent text)"],
    ["accent-ink", "surface", 4.5, "text"],
    ["accent-ink-hover", "background", 4.5, "text"],
    ["accent-ink-hover", "surface", 4.5, "text"],
    ["ring", "background", 3.0, "non-text (focus ring)"],
    ["ring", "surface", 3.0, "non-text (focus ring)"],
    ["input", "background", 3.0, "non-text (control boundary)"],
    ["input", "surface", 3.0, "non-text (control boundary)"],
    [
      "danger",
      "background",
      4.65,
      "error text — ratified retune floor (WCAG 4.5 + margin)",
    ],
    [
      "danger",
      "surface",
      4.9,
      "error text — ratified retune floor (WCAG 4.5 + margin)",
    ],
    ["danger-foreground", "danger", 4.5, "text"],
    ["success-foreground", "success", 4.5, "text"],
    ["inverted-foreground", "inverted", 4.5, "text (inverted pair)"],
    ["inverted-foreground-muted", "inverted", 4.5, "text (inverted muted)"],
    ["inverted-accent", "inverted", 3.0, "on-dark accent, large/fill"],
    [
      "success",
      "background",
      null,
      "informational (no text/boundary usage exists)",
    ],
    [
      "border",
      "background",
      null,
      "informational (border is never sole indicator)",
    ],
    ["border", "surface", null, "informational"],
  ];

  console.log("| fg | bg | ratio (float) | requirement | result |");
  console.log("| --- | --- | --- | --- | --- |");
  let failed = 0;
  for (const [fg, bg, min, label] of rows) {
    const r = ratioFloat(S(fg), S(bg));
    const verdict =
      min === null ? "n/a" : r >= min ? "PASS" : (failed++, "**FAIL**");
    console.log(
      `| ${fg} | ${bg} | ${r.toFixed(2)} | ${min === null ? "—" : `≥ ${min}:1`} (${label}) | ${verdict} |`,
    );
  }

  console.log(
    failed
      ? `\n${failed} normative pair(s) FAILED — STOP. Retune at the source and re-prove.`
      : "\nAll normative pairs PASS.",
  );
  process.exitCode = failed ? 1 : 0;
}

// ---------------------------------------------------------------------------

// Only dispatch when run as a CLI — the math functions are importable.
if (
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href
) {
  const mode = process.argv[2] ?? "validate";
  if (mode === "validate") validate();
  else if (mode === "derive") derive();
  else if (mode === "prove") prove();
  else {
    console.error(`Unknown mode "${mode}" — use validate | derive | prove`);
    process.exitCode = 2;
  }
}
