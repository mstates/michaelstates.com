# Design token rules (path-scoped)

These apply when working in tokens/ or src/styles/.

- The source of truth is tokens/*.json, hand-authored in W3C DTCG format (Tokens Studio is the planned Stage 4 authoring layer).
- Build with `pnpm tokens` (Style Dictionary v5 + @tokens-studio/sd-transforms).
- Three tiers: primitive → semantic → component. Components consume semantic or
  component tokens; they never reference primitives directly.
- Set Figma variable code syntax to match our token names (e.g. var(--color-bg-primary))
  so the Figma MCP returns exact token references.
- Never edit generated files (src/styles/tokens.css) by hand — edit the source tokens
  and rebuild.
