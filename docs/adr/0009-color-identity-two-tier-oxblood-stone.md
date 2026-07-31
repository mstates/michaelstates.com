# ADR 0009: Color identity — two-tier oxblood/cranberry on stone (variant 3a)

- Status: Accepted
- Date: 2026-07-25
- Relates to: ADR 0003 (docs/adr/0003-token-pipeline.md); ADR 0008
  (typography sibling record, docs/adr/0008-font-strategy-brand-webfonts.md);
  INC-252 (implementation, PR #34); tokens/primitive/color.json;
  tokens/semantic/color.json

## Context

The original cream + terracotta identity read Claude-adjacent — flagged
2026-07-12 during INC-251 design work. The three-tier token pipeline
(ADR 0003) exists precisely for this case: a color identity swaps at the
primitive/semantic layer with zero markup changes. Variant 2a (a single
oxblood accent) was implemented and contrast-proven first, but read
heavy on preview and was superseded by 3a. The 3a system shipped via
PR #34 (INC-252, Done 2026-07-18); its ratification history lived in
Linear comments until this record. The direction was formally called
2026-07-25.

## Decision

Adopt the variant 3a color identity:

- **Stone neutral ground** — the neutral ramp carries all surfaces.
- **One oxblood primitive family** (steps 300/500/600/700), split into
  two tiers by interactivity:
  - **Action tier** — oxblood.500 ("cranberry") is the interactive ink
    and fill: links, CTAs, active/selected states. Hover lands on the
    brand tier.
  - **Brand tier** — oxblood.600/700 carries non-interactive accents.
- **Rose** (oxblood.300) is the accent on dark surfaces.
- The two syntax-only counterpoints (warm gold strings, periwinkle
  functions) stay code-block-scoped — never brand usage.
- The **focus ring stays foreground ink** — a deliberate action-tier
  exemption (docs/a11y/button.md).

Every normative pair is contrast-proven. The proofs live in the
semantic token $descriptions (tokens/semantic/color.json) and in
scripts/contrast-proof.mjs — this record links to them rather than
restating proof tables.

**Reopen trigger:** step-value retunes within the ramp during component
buildout amend this ADR in place as dated notes; a hue-family or
tier-structure change supersedes it.

## Consequences

Easier: components about to be built cite a ratified contract rather
than a moving target; downstream identity assets (OG images, favicon
repaint) unblock against a called direction. Harder: retunes now carry
an amendment duty to this record.

## Alternatives considered

- **Keep terracotta** — rejected; the identity read Claude-adjacent.
- **2a single-tier oxblood** — implemented and proven, but an
  undifferentiated interactive/brand red read heavy on preview.
  Superseded by the two-tier split.
