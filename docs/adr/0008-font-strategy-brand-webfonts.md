# ADR 0008: Font strategy — brand webfonts, self-hosted

- Status: Accepted
- Date: 2026-07-08
- Supersedes: ADR 0007 (docs/adr/0007-font-strategy-system-stack.md)
- Relates to: Stage 5 readiness audit P4/B5 (docs/research/03-stage5-readiness-audit.md); INC-242 (implementation); tokens/primitive/typography.json

## Context

ADR 0007 kept the system stack as a deliberate decision and named its own
reopen trigger: a brand font arriving in the design. The trigger fired
2026-07-08 — the Claude Design project's established visual language,
applied consistently across the homepage hi-fi (Home.dc.html),
Testimonials, and the Case Study Template, names three brand fonts.
Typography carries the brand identity the design settled on; the homepage
shell ships in this language.

## Decision

Adopt the three brand webfonts, self-hosted:

- **Newsreader** — display and headings (hero, section headings)
- **Plus Jakarta Sans** — body text and UI
- **Space Mono** — mono accents (eyebrow, stats, code-flavored details)

Serving strategy: self-hosted subset woff2 — no third-party font requests,
matching the privacy and performance posture already shipped in
`public/_headers`. `@font-face` with `font-display: swap`, preloads for
above-the-fold faces wired through BaseHead, and fallback metrics tuned to
hold CLS within the Lighthouse budget (ADR 0006 gates). All three faces
are published under the SIL Open Font License.

Token impact: the `mc.font.family.*` primitives and semantic
`font.sans`/`font.mono` tokens change to the brand stacks (current system
stacks retained as fallback chains), and a display-serif slot is added.
Per the token governance rule, the token change and all loading
infrastructure land in their own scoped ticket (INC-242) — this ADR
records the decision only.

**Reopen trigger:** a rebrand replacing any of the three faces, or
measured font payload/CLS breaching the performance gates — either
supersedes this ADR.

## Consequences

Easier: the shipped site matches the approved design language; the
serif/sans/mono hierarchy does brand work that layout, color, and spacing
alone could not. Harder: BaseHead carries font plumbing; a font payload
joins every page; CLS is managed by fallback metrics rather than being
structurally zero; subsetting and font-file upkeep become maintenance
surface.

## Alternatives considered

- **Stay on the system stack (ADR 0007)** — zero payload, but the shell
  would ship visibly off-design; the trigger existed precisely for this
  case. Superseded by this decision.
- **Service-hosted (e.g. Google Fonts)** — same faces, but adds a
  third-party request/privacy surface and forfeits subsetting control.
  Rejected; self-hosting matches the repo's existing posture.
