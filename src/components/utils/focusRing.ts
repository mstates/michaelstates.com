/**
 * Shared focus-visible treatment for interactive primitives (Button, TextField, Link, …).
 *
 * `focus-visible:outline-hidden` removes the native outline — the ring replaces it —
 * while keeping a visible focus outline under forced-colors / Windows High Contrast
 * Mode (the transparent outline is forced to a system color). The ring offset is
 * `transparent`, so the 2px gap shows whatever surface the control sits on (white page,
 * card, tinted panel) instead of assuming a white background.
 *
 * The `focus-visible:` variant resolves via tailwindcss-react-aria-components to both
 * RAC's `[data-focus-visible]` and native `:focus-visible`.
 */
export const focusRing =
  "focus-visible:outline-hidden " +
  "focus-visible:ring-2 focus-visible:ring-ring " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
