---
name: sync-tokens
description: >-
  Rebuild design tokens from the DTCG source. Use after editing tokens/*.json or
  pulling new Figma variables, to regenerate CSS variables and the Tailwind theme.
---

# Sync Tokens

Run the token build pipeline: DTCG JSON → Style Dictionary v4 → CSS custom properties
+ Tailwind v4 theme.

## Steps

1. Confirm tokens/*.json is in W3C DTCG format (this is what Tokens Studio exports).
2. Run pnpm tokens (Style Dictionary with @tokens-studio/sd-transforms).
3. Verify the generated src/styles/tokens.css and Tailwind theme updated.
4. If anything references a primitive token directly from a component, flag it — the
   three-tier rule (primitive → semantic → component) means components consume semantic
   or component tokens, never primitives.

## Reminder

Tokens are the single source of truth for color/spacing/type. After syncing, a quick
visual check in Storybook confirms nothing shifted unexpectedly.
