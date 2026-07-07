# Stage 5 Readiness: What Blocks the Page Build, and What Must Harden Before Launch (Mid-2026)

> Point-in-time readiness audit (2026-07-07, INC-230) ahead of the Stage 5 page build —
> BaseLayout, the Claude Design homepage shell, and the pages that follow. It departs from
> the founding reports' prose-only convention by contract: every finding carries an
> explicit Evidence line (file:line, command output, or live fetch) and a severity naming
> the Stage 5 step — or the launch — it blocks. Historical docs are cited as records, not
> defects. Referenced by the Linear backlog.

## TL;DR

- **The foundation holds, and the ticket's central worry inverts.** Both CI gates exercise
  the real built site — the axe suite drives `astro preview` of `dist/`, and Lighthouse
  audits every HTML file the build emits. Storybook is the layer with _no_ CI gate, not
  the pages. Building on this foundation is safe.
- **Five BLOCKER-before-pages findings, none of them rework.** Per-route axe enumeration,
  head/meta infrastructure + `site`, a document-level CSS baseline, the island/hydration
  contract, and a contingent hero-type-token gap. Every one resolves as a scoping line
  inside the BaseLayout/homepage tickets or a one-line acceptance criterion.
- **The production premise is confirmed live, with one precision.** The new production
  path (`michaelstates-com.pages.dev`) serves the Astro placeholder; the public domain
  still serves the old Vercel portfolio (apex 307 → `www`). Pages can ship to `main`
  continuously — blast radius is staging until the Stage 8 cutover.
- **Seven PRE-LAUNCH items, none blocking pages:** link-preview/OG cards, indexability
  (INC-210), placeholder-branding purge, the font decision, staging noindex, FF-compatible
  branch protection, and re-measuring Lighthouse thresholds as real pages land.
- **Test-posture verdict:** Link and TextField lacking dedicated `.test.tsx` files is
  **intentional under the operative design** (axe-as-gate + recorded manual audits) — but
  it is _not_ "stories-as-tests," which is not wired. TextField currently executes in no
  automated context at all.

## Ground state, verified

1. **The homepage is the placeholder; the scaffolds are empty.** Evidence:
   `src/pages/index.astro:12,15` (`<title>Astro</title>`, `<h1>Astro</h1>`, no component
   imports); `src/layouts/` and `src/content/` each contain only an empty `.gitkeep`; no
   content-collection config exists anywhere in the repo.
2. **Live production state.** Evidence: `curl -sI https://michaelstates-com.pages.dev/` →
   HTTP 200 with body `<title>Astro</title>`; apex `https://michaelstates.com/` → HTTP 307
   → `https://www.michaelstates.com/`, `server: Vercel`, body title "Michael States —
   Accessibility Design Engineer" (the old site), both probed 2026-07-07.
3. **The deploy loop is green and gate-only.** Evidence: `gh api …/commits/7f847aa…/check-runs`
   → 5 runs, all `success` (Cloudflare Pages + both CI jobs); `.github/workflows/ci.yml:3-5`
   ("QUALITY GATE only… Deploys are handled by Cloudflare's Git integration").
4. **Both gates exercise real pages, not stories.** Evidence: `playwright.a11y.config.ts:21-26`
   (webServer = `pnpm preview` serving `dist/`); `lighthouserc.json:4,9` (`staticDistDir:
"./dist"`, accessibility `error` at `minScore: 1.0`).
5. **Component composition into pages is proven.** Evidence: `src/pages/404.astro:3,16-19`
   (imports `Heading`, `Link` from the barrel `src/components/index.ts:1-8` and composes
   them); `tests/a11y/not-found.spec.ts:13,17-19,21-25` asserts a real 404 status, the
   rendered `<h1>`, and zero WCAG 2.0/2.1/2.2 A/AA axe violations against it.
6. **Security headers are authored and live.** Evidence: `public/_headers` (HSTS,
   `X-Frame-Options: DENY`, `Permissions-Policy`, `Referrer-Policy`); the pages.dev
   response above returns them.

## Key Findings

### BLOCKER-before-pages — resolve or scope into the page tickets, or pages ship wrong/ungated

- **B1 — The axe gate covers only hand-enumerated routes.** `pnpm test:a11y` is the sole
  full-a11y check for `.astro` markup (jsx-a11y lints island JSX only, by design), and it
  has no route auto-discovery — a new page without a spec ships with **no full-axe
  coverage**, backstopped only by Lighthouse's reduced, static-state a11y subset. Blocks:
  every new-page step shipping gated. Evidence: `tests/a11y/homepage.spec.ts:5` ("As
  routes are added, add one spec per route"); `tests/a11y/` holds exactly two specs;
  `eslint.config.mjs:60` and `docs/adr/0005:36` (template a11y "delegated to the runtime
  axe suite"); backstop at `lighthouserc.json:4,9`. Fix: parametrize the route list in
  `tests/a11y/`, or make spec-per-route a hard acceptance criterion in every page ticket.
- **B2 — No head/meta infrastructure, and `site` is unset.** The two existing heads are
  duplicated inline and already divergent (`<title>Astro</title>` vs the 404's
  `· Michael States` convention); there is no BaseHead/SEO component, and without `site`
  Astro cannot emit canonical/OG absolute URLs or a sitemap. Blocks: the BaseLayout step —
  head consolidation is its core job. Evidence: `src/pages/index.astro:6-13` vs
  `src/pages/404.astro:7-14`; `astro.config.mjs:8-14` (no `site` key); repo-wide grep
  finds zero `description`/`og:`/`twitter:`/`canonical` meta in `src/`. Fix: BaseLayout
  ticket owns head consolidation, a title/description/canonical/OG prop surface, setting
  `site`, and migrating both pages onto the 404 title convention.
- **B3 — No document-level baseline in `global.css`.** Six lines of wiring: no
  `color-scheme`, no `prefers-reduced-motion` guard, no branded global `:focus-visible`
  for non-component elements (a skip link or in-page anchor falls back to UA-default
  rings), no body size/leading baseline. One thing that is _not_ missing: the body font
  already resolves from tokens via Tailwind preflight. Blocks: the BaseLayout step.
  Evidence: `src/styles/global.css:1-6` (whole file); positive case:
  `src/styles/tokens.css:74` feeding `--default-font-family`
  (`node_modules/tailwindcss/theme.css:494`). Fix: a document base layer scoped into the
  BaseLayout ticket.
- **B4 — The island/hydration contract is undefined (contingent).** No `client:*`
  directive exists anywhere; the sole composition example uses only static-safe
  components, so it works by luck. A `Button` or `TextField` composed the same way
  renders **dead while passing both gates** (axe and Lighthouse test static markup —
  built wrong, gated green). Blocks: the homepage step iff it composes interactive
  components; the contract line costs one sentence regardless. Evidence:
  `grep -rn "client:" src/ tests/` → no matches; `src/pages/404.astro:17-19` (Heading/Link
  only); `src/components/Button.tsx:18` (RAC `AriaButtonProps` — press handling needs
  hydration). Fix: page tickets state the composition contract — which components need
  `client:*`, Heading's no-skipped-levels outline duty, explicit `target`/`rel` on
  external links.
- **B5 — No hero-scale type token (contingent; report-only).** The semantic scale tops
  out at `text-display` = 2.25rem; the 3rem primitive exists but is unexposed. Because
  the `@theme` extends rather than replaces Tailwind's defaults, stock `text-5xl` works —
  but only by silently breaching the token governance, which is doc-enforced only.
  Blocks: the homepage-shell step iff the Claude Design shell specifies type above
  2.25rem. Evidence: `src/styles/tokens.css:79` (`--text-display: var(--mc-size-4xl)`),
  `:43-44` (`--mc-size-4xl: 2.25rem`, `--mc-size-5xl: 3rem` absent from the `@theme`
  block at `:53`). Fix: per the token rules, no change here or in successor tickets
  without explicit step-scoping — the homepage ticket either confirms 2.25rem suffices or
  spawns a scoped token ticket first.

### PRE-LAUNCH — build freely, harden before cutover

- **P1 — No link-preview/OG infrastructure.** Zero OG/Twitter/description/canonical meta
  and no OG image, against a stated top priority ("the unfurled card is the first
  impression"). Blocks: launch. Evidence: grep of `src/` (finding B2); `public/` contains
  no social image; `SETUP.md:27`. Fix: per-page meta rides B2's BaseLayout surface; the
  designed OG image maps to the seeded OG ticket (`seed/linear-import.csv:36`) —
  cross-ref at review.
- **P2 — Indexability is absent (= INC-210).** No `robots.txt`, no sitemap integration,
  no meta description; the sitemap additionally depends on B2's `site`. Blocks: launch.
  Evidence: `public/` listing (no robots.txt); no `@astrojs/sitemap` in `package.json`;
  repo anchor `seed/linear-import.csv:38` ("Ensure basic indexability" — sitemap, meta
  description, robots), scope confirmed against the board during planning. Fix: execute
  INC-210 at launch readiness.
- **P3 — Placeholder branding survives in production assets.** The `Astro` title/h1 die
  with the homepage build; the stock Astro favicon and the `generator` meta need explicit
  decisions. Blocks: launch (brand surface at cutover). Evidence:
  `src/pages/index.astro:11,12,15`; `public/favicon.svg` is the stock Astro mark;
  `docs/adr/0006:30` (SEO warn capped by the placeholder title — self-heals with the
  homepage). Fix: brand favicon set + homepage; decide whether `generator` stays.
- **P4 — The font strategy is undecided by silence.** No webfont tooling, no `@font-face`,
  no preloads; the tokens carry a system stack; the architecture blueprint never mentions
  fonts. The de facto decision (system stack) may be right — but nothing records it.
  Blocks: launch polish; escalates to a homepage-step blocker if the design names a brand
  font (loading strategy then joins B2/B3's head work). Evidence: repo-wide grep for
  `@font-face|fontsource|preload` → none; `docs/research/02-architecture-blueprint.md`
  (83 lines, no font section); `src/styles/tokens.css:74`. Fix: a short font-decision ADR
  with or before homepage implementation.
- **P5 — Staging is indexable today, serving the placeholder.** The pages.dev production
  deployment returns no `X-Robots-Tag` and `_headers` sets none, so search engines may
  index the placeholder now and duplicate content after cutover. Blocks: launch hygiene.
  Evidence: live header probe of `michaelstates-com.pages.dev` (2026-07-07, no
  `X-Robots-Tag` in response); `grep -i robots public/_headers` → none. Fix:
  environment-conditional noindex for non-production hosts — **not** a blanket
  `X-Robots-Tag` in `_headers`, which would follow the build to the custom domain and
  deindex production at cutover.
- **P6 — `main` is unprotected while deploys ride every push.** Cloudflare deploys
  production on push to `main` and no branch protection exists, so a push with red CI
  still deploys. Blast radius today is staging only — which is why this is pre-launch,
  not a page blocker. Blocks: launch (ungated production deploys post-cutover). Evidence:
  `gh api repos/mstates/michaelstates.com/branches/main/protection` → HTTP 404 "Branch
  not protected" (2026-07-07); `.github/workflows/ci.yml:4`. Fix: required-status-checks
  protection **without require-PR** — the settled deploy is an FF push to `main`, which
  preserves branch-head SHAs so their existing check runs satisfy the requirement; a
  naive require-PR rule would block the deploy mechanism entirely.
- **P7 — Lighthouse thresholds are calibrated to a one-page shell.** Accessibility is the
  only erroring category; performance/SEO/best-practices are warn-only, and ADR-0006
  explicitly promises re-measurement as real pages arrive. Left as-is through cutover,
  launch ships with no blocking performance gate. Blocks: launch. Evidence:
  `lighthouserc.json:9-12`; `docs/adr/0006:50` ("calibrated to a 1-page shell… re-measure").
  Fix: re-measure per page landed; promote thresholds to `error` before cutover.

### POST-LAUNCH — can wait, with eyes open

- **L1 — Test posture: the Link/TextField verdict.** See Details below for the full
  evidence chain. Blocks: nothing in Stage 5 (B1's spec-per-route discipline is the
  operative guard); hardens in Stage 6. Evidence: `.storybook/main.ts:7`;
  `vitest.config.ts:9,12`; `.storybook/preview.ts:5-7`; `src/components/CLAUDE.md:7`;
  `CLAUDE.md:26` (the one living-doc drift: names addon-vitest as present stack). Fix:
  wire `@storybook/addon-vitest` in Stage 6 and align the CLAUDE.md stack line then.
- **L2 — No content-collections schema (conditional).** Irrelevant to BaseLayout and the
  homepage; becomes a scoped-in blocker for the later content/case-study pages step —
  effectively pre-launch iff case studies are in the launch cut, which is undecided.
  Blocks: the subsequent-content-pages step only. Evidence: `src/content/` = `.gitkeep`;
  no `content.config.ts` repo-wide. Fix: schema ticket when the first content page is
  scoped.
- **L3 — Known composition-quality deferrals.** `cx` is a plain class joiner, so
  same-property `className` overrides resolve by stylesheet order (a token-aware
  `tailwind-merge` is an explicit deferral); TextField's input classes are fixed inside
  the component. Blocks: nothing — awareness lines for page tickets. Evidence:
  `docs/follow-ups.md:13`; `src/components/TextField.tsx:46` (hardcoded `<Input>`
  styling). Fix: revisit only when a page actually needs the override.
- **L4 — Token coverage beyond type is thinner than the three-tier model implies
  (report-only).** Spacing primitives never reach `@theme` (pages use stock Tailwind
  spacing, as the 404 already does); no breakpoint/container/measure tokens; focus-ring
  geometry is hardcoded; no dark/inverted surface pair exists (adding one triggers the
  surface-contracts proof). Largely consistent with the ADR-0004 stock-utility posture;
  recorded here so page work knows the boundary. Blocks: nothing. Evidence:
  `src/styles/tokens.css:24-33` (space primitives, all before `@theme` at `:53`);
  `grep -rn "breakpoint|container" tokens/` → none; `src/components/utils/focusRing.ts:15`;
  `src/components/CLAUDE.md:12-14`. Fix: none — any change requires its own scoped ticket.

## Details

### Gate reach: what CI actually exercises

The quality gate runs lint → Vitest → build → Playwright-axe, plus Lighthouse in a second
job (`.github/workflows/ci.yml:46,71`). The axe suite drives the **built site** and is the
strongest check in the repo — but it enumerates routes by hand, while Lighthouse
auto-globs whatever HTML the build emits (`lighthouserc.json:4`; both `dist/index.html`
and `dist/404.html` today, corroborated by the local `dist/` from Jul 1 — stale by six
days, which is why this audit's production claims rest on the live probes instead).
The asymmetry is the point of B1: a new route is auto-covered by Lighthouse's subset but
untouched by full axe until a spec exists. Storybook, meanwhile, participates in no CI
job at all — its a11y addon errors only in the dev panel (`.storybook/preview.ts:5-7`).

### The Link/TextField test question, settled

The ticket asked: is the Button/Heading-only `.test.tsx` asymmetry intentional under
stories-as-tests, or a gap? The evidence supports **neither framing cleanly**.
Stories-as-tests does not exist here: `@storybook/addon-vitest` is not installed (no
match outside `CLAUDE.md:26`), Vitest includes only `src/**/*.test.{ts,tsx}` in jsdom
(`vitest.config.ts:9,12`), and the stories contain no play functions or assertions. What
_is_ operative: the axe suite is the documented authoritative gate
(`src/components/Heading.tsx:20`), the component contract requires a story plus a passing
a11y addon — not a unit test (`src/components/CLAUDE.md:7`) — and both components carry
recorded manual audits (`docs/a11y/link.md`, `docs/a11y/textfield.md`). The two tests
that do exist cover bespoke logic RAC doesn't provide (Button's press wiring; Heading's
level/size decoupling and empty-heading guard) — Link and TextField are thin RAC
pass-throughs with no such logic. **Verdict: intentional under the operative
axe-as-gate + manual-audit design, with addon-vitest deferred to Stage 6.** The honest
residue: TextField appears on no route and in no test, so **nothing automated executes it
today**, and Link's only automated coverage is incidental via the 404 page. The first
page that composes either must carry its axe spec (B1) — that closes the gap where it
matters.

### Token coverage from a page consumer's seat (report-only)

What a BaseLayout/homepage builder finds: proven color pairs for surfaces and text
(17.84:1 default, `src/components/CLAUDE.md:14`), token font families feeding the body
automatically, and a four-step semantic type scale that stops at 2.25rem (B5). Spacing,
breakpoints, container widths, tracking, and extra leading steps all fall back to stock
Tailwind — available but ungoverned (L4). Nothing here blocks a page; the risks are
governance-by-convention (stock utilities are one keystroke away) and the hero-type
contingency. Per the standing rule, every observation in this section is report-only:
token changes require their own explicitly-scoped ticket.

## Proposed tickets

1. **BaseLayout + BaseHead** — head consolidation, `site`, title/description/canonical/OG
   prop surface, document base layer, skip link, 404-title convention migration (B2, B3;
   likely maps to the seeded layout ticket — cross-ref at review).
2. **Parametrized a11y route manifest** in `tests/a11y/` — or spec-per-route as a hard AC
   in every page ticket (B1; new).
3. **Composition contract note for page tickets** — `client:*` needs, heading outline,
   external-link `target`/`rel` (B4; new, one paragraph in the ticket template).
4. **Scoped hero-type token ticket** — open only if the homepage design specifies >2.25rem
   type (B5; new, contingent).
5. **OG/link-preview cards + designed OG image** (P1; maps to `seed/linear-import.csv:36`
   — cross-ref at review).
6. **INC-210 — basic indexability** at launch readiness (P2; exists).
7. **Brand favicon set** replacing the stock Astro mark (P3; new, or folds into homepage).
8. **Font-decision ADR** — system stack vs. brand font, before/with homepage (P4; new).
9. **Staging noindex strategy** — environment-conditional, not `_headers`-global (P5; new).
10. **Branch protection: required status checks, no require-PR** — FF-push compatible
    (P6; new, before Stage 8).
11. **Lighthouse threshold re-measure + promote to error** as pages land (P7; new, per
    ADR-0006's own instruction).
12. **Stage 6: wire `@storybook/addon-vitest`** and align `CLAUDE.md:26`; give TextField
    its first executing test (L1; maps to the Stage 6 plan).
13. **Content-collections schema** with the first content page (L2; new, deferred).

## Caveats

- **Point-in-time.** Live probes (pages.dev, apex/www, check-runs, branch protection) are
  dated 2026-07-07; the local `dist/` corroboration is six days stale and marked as such.
  Deploy statements from `SETUP.md`, `docs/follow-ups.md`, and the ADRs are historical
  records — cited as evidence of intent, not current state.
- **"Stage 5" here follows INC-230's usage** (the page-build phase). `SETUP.md`'s own
  Stage 5 is the Linear/Notion kickoff — the numbering has drifted; this report does not
  adjudicate it.
- **Token findings are report-only** by ticket rule; nothing here authorizes a token edit.
- **Severity is scoped to the Stage 5 question.** POST-LAUNCH means "does not endanger
  pages or launch," not "unimportant."
- **WCAG 2.2 AA remains the only compliance bar claimed.** Lighthouse and axe subsets are
  tooling aids; no WCAG 3/APCA claims are made anywhere in this audit.
