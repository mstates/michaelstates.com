# Design token rules (path-scoped)

These apply when working in tokens/ or src/styles/.

- The source of truth is tokens/\*.json, hand-authored in W3C DTCG format (Tokens Studio is the planned Stage 4 authoring layer).
- Build with `pnpm tokens` (Style Dictionary v5 + @tokens-studio/sd-transforms).
- Three tiers: primitive → semantic → component. Components consume semantic or
  component tokens; they never reference primitives directly.
- Primitives live in a private `--mc-*` namespace (authored under an `mc` key in
  tokens/primitive/\*.json) so they never collide with or shadow Tailwind's theme
  namespaces; semantic tokens keep bare names and are the public utility surface. A
  primitive whose value coincides with a stock Tailwind utility is dropped — components
  use the stock utility (e.g. rounded-lg, leading-normal). See
  docs/adr/0004-token-namespace-collision.md.
- Set Figma variable code syntax to match our token names (e.g. var(--color-bg-primary))
  so the Figma MCP returns exact token references.
- Never edit generated files (src/styles/tokens.css) by hand — edit the source tokens
  and rebuild.
