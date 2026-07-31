// INC-250: shared class recipe, moved verbatim from src/pages/index.astro (INC-243
// shell). Exported here because it has two consumers: the SiteHeader CTA and the
// index.astro hero CTA. Colors are semantic tokens only. INC-252 Phase 1c moved the
// fill to the action tier (action-ink/action-ink-hover — CTA = interactive under the
// 3a role map); pair ratios in the INC-252 Phase 1b exported-math proof.
export const pillPrimary =
  "inline-flex items-center rounded-full bg-action-ink text-body font-bold text-accent-foreground transition-colors hover:bg-action-ink-hover";

// INC-251: promoted verbatim from src/pages/index.astro on gaining a second consumer —
// the index.astro section eyebrows and the KeyTakeaways partial heading (pillPrimary
// precedent; class string unchanged by the move).
export const eyebrow =
  "font-mono text-caption font-bold uppercase tracking-widest";

// INC-264: promoted verbatim from src/pages/index.astro (page-local pillOutline,
// INC-243 shell) per the INC-260 inventory — the hero secondary CTA now; the
// case-study closing CTA and the INC-268 CTAPanel adopt without modification
// (eyebrow/pillPrimary precedent; class string unchanged by the move).
export const pillSecondary =
  "inline-flex items-center rounded-full border border-input text-body font-bold text-foreground transition-colors hover:bg-surface-muted";

// INC-264: dark-surface variant for the inverted panel (INC-218 surface contract) —
// ships proofed-but-dark (StatGroup strip/meta precedent); first consumer lands with
// INC-268 (CTAPanel). No background fill; hover brightens the border to
// inverted-foreground (17.00:1 float vs inverted, ≥ 3:1 boundary floor; border pair
// inverted-border/inverted 3.22:1 proven at the token). Semantic tokens only.
export const pillSecondaryInverted =
  "inline-flex items-center rounded-full border border-inverted-border text-body font-bold text-inverted-foreground transition-colors hover:border-inverted-foreground focus-visible:outline-inverted-foreground";
