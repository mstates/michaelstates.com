// INC-250: shared class recipe, moved verbatim from src/pages/index.astro (INC-243
// shell). Exported here because it has two consumers: the SiteHeader CTA and the
// index.astro hero CTA. Colors are semantic tokens only; the pair's computed ratio
// is recorded in the INC-243/244 PR record (class string unchanged by the move).
export const pillPrimary =
  "inline-flex items-center rounded-full bg-accent-ink text-body font-bold text-accent-foreground transition-colors hover:bg-accent-ink-hover";

// INC-251: promoted verbatim from src/pages/index.astro on gaining a second consumer —
// the index.astro section eyebrows and the KeyTakeaways partial heading (pillPrimary
// precedent; class string unchanged by the move).
export const eyebrow =
  "font-mono text-caption font-bold uppercase tracking-widest";
