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
