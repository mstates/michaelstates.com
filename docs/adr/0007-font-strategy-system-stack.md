# ADR 0007: Font strategy — system stack, no webfont

- Status: Superseded by ADR 0008 (2026-07-08, docs/adr/0008-font-strategy-brand-webfonts.md)
- Date: 2026-07-07
- Relates to: Stage 5 readiness audit P4 (docs/research/03-stage5-readiness-audit.md); tokens/primitive/typography.json

## Context

The font strategy has been undecided by silence: the tokens carry a system stack
(`mc.font.family.sans`/`mono`), there is no `@font-face`, no preloads, no webfont
tooling, and the architecture blueprint never mentions fonts. The homepage shell
(Claude Design) is approaching; if it named a brand font, loading strategy (preload,
`font-display`, CLS budget) would join the BaseHead work.

## Decision

Keep the system font stack — now as a deliberate decision, not a default. Zero font
payload and zero font-swap CLS align with the portfolio's performance thesis and the
Lighthouse gates (ADR 0006), and native platform rendering is a feature for an
accessibility-focused portfolio, not a compromise. Token impact: **none** —
`mc.font.family.*` primitives and semantic `font.sans`/`font.mono` are unchanged;
`--default-font-family` continues to source from the existing stack.

**Reopen trigger:** if the Claude Design homepage shell (or a later brand pass) names
a brand font, this ADR is superseded by a new ADR covering self-host vs service,
preload strategy, `font-display`, the CLS budget, and token impact — with any token
change in its own scoped ticket per the token governance rule.

## Consequences

Easier: BaseHead stays lean; no font pipeline, no CLS budget line, no third-party
requests. Harder: brand differentiation rests on layout, color, and spacing rather
than type; rendering metrics vary across platforms.

## Alternatives considered

- **Self-hosted webfont** — brand control, but payload + preload plumbing + CLS
  management with no named brand font to justify it. Rejected until the trigger fires.
- **Service-hosted (e.g. Google Fonts)** — same, plus a third-party request/privacy
  surface. Rejected on the same grounds.
