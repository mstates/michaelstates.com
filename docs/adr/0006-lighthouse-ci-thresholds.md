# ADR 0006: Lighthouse CI thresholds — accessibility is the blocking gate

- Status: Accepted
- Date: 2026-06-28
- Relates to: INC-200 (author CI workflow); ADR-0005 (ESLint/jsx-a11y); the launch/SEO
  follow-up (real `<title>`/meta, `site:`, OG cards — out of scope for the gate)

## Context

`ci.yml`'s Lighthouse step ran `pnpm exec lhci autorun || echo "…"` — the `|| echo` swallowed
every failure, so even an accessibility regression passed silently. There was also no
`lighthouserc`, so `lhci` asserted nothing. Accessibility is this project's signature
competency; its Lighthouse score must be a real pass/fail.

## Decision

`lighthouserc.json` with `staticDistDir: "./dist"` collection (lhci serves the built static
output itself — no preview server to coordinate) and `numberOfRuns: 3` to median out variance:

| Category       | Level     | minScore |
| -------------- | --------- | -------- |
| accessibility  | **error** | **1.0**  |
| best-practices | warn      | 0.95     |
| seo            | warn      | 0.9      |
| performance    | warn      | 0.9      |

- **Accessibility `error @ 1.0` — verified, not assumed.** A local `lhci autorun` (3 runs)
  scored accessibility **100/100/100**; perf **100**, best-practices **100**, seo **90**. The
  1.0 floor is the measured reality on the current page, so it's a real gate, not an aspiration.
- **Everything else is `warn`.** SEO is **90** today, capped by the placeholder
  `<title>Astro</title>` and missing meta description — legitimate and owned by the separate
  launch/SEO ticket, so it must not fail the build. perf/best-practices are warn for the same
  "don't flake the gate on non-a11y noise" reason (and to absorb shared-runner variance).
- **Removed the `|| echo` escape hatch** from `ci.yml` so `lhci`'s exit code gates the job. With
  only accessibility at `error`, the job is a real a11y gate without flaking on perf/seo.
- **`upload.target: "filesystem"`** (`outputDir: ./.lighthouseci`, gitignored) + a CI
  `lighthouse-report` artifact, rather than `temporary-public-storage`. Keeps reports available
  for debugging failures without publishing performance data to an external service on every run.

## Consequences

- An accessibility regression now **fails CI** — the gate finally bites.
- The `lighthouse` job uploads `.lighthouseci/` as an artifact (mirrors the `a11y-report` upload),
  so a failing run's full report is retrievable.
- SEO sitting at the `0.9` warn floor is expected; raising `<title>`/meta in the launch ticket
  lifts it. **Do not promote seo to `error`** until that content lands.

## Gotchas (for future maintainers)

- **Thresholds are calibrated to a 1-page shell.** As real pages/content arrive, re-measure —
  performance especially can drop with images/fonts. Revisit the `warn` floors then.
- **Don't re-add `|| echo`** (or any `|| true`) to the Lighthouse step — it re-hollows the a11y
  gate, the exact regression this ADR removes.
- The local `lhci` run uses system Chrome via chrome-launcher; CI uses the runner's Chrome. No
  Playwright browser is involved (that's the separate axe suite).

## Alternatives considered

- **`temporary-public-storage` upload** (public report URL per run, handy for PR links).
  Rejected: outward-facing data publish on every CI run; the filesystem artifact gives the same
  debuggability without an external dependency.
- **Keep `|| echo` "just for the first run."** Rejected: the local 3-run verification already
  confirmed the scores, so there's no reason to ship a hollow gate even temporarily.
- **Make perf/seo blocking too.** Rejected for now: they'd fail on the placeholder content and on
  runner variance — revisit once launch content exists.
