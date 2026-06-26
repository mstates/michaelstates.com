# tokens — conventions (loaded when working here)

- Source of truth: hand-authored `*.json` in **W3C DTCG** format (Tokens Studio is the planned Stage 4 authoring layer).
- Build with `pnpm tokens` (Style Dictionary v5 + @tokens-studio/sd-transforms).
- Three tiers: **primitive → semantic → component**. Components consume semantic or
  component tokens, never primitives directly.
- Primitives live in a **private `--mc-*` namespace** (authored under an `mc` key in
  `tokens/primitive/*.json`) so they never collide with or shadow Tailwind's theme namespaces;
  semantic tokens keep bare names and are the public utility surface. A primitive whose value
  **coincides** with a stock Tailwind utility is dropped — components use the stock utility
  (e.g. `rounded-lg`, `leading-normal`). See `docs/adr/0004-token-namespace-collision.md`.
- Generated files (`src/styles/tokens.css`) are never hand-edited — change the source and
  rebuild.
- Keep Figma variable code syntax aligned with token names so the Figma MCP returns exact
  references.

See `.claude/rules/tokens.md`.
