# tokens — conventions (loaded when working here)

- Source of truth: `*.json` in **W3C DTCG** format (Tokens Studio export).
- Build with `pnpm tokens` (Style Dictionary v4 + @tokens-studio/sd-transforms).
- Three tiers: **primitive → semantic → component**. Components consume semantic or
  component tokens, never primitives directly.
- Generated files (`src/styles/tokens.css`) are never hand-edited — change the source and
  rebuild.
- Keep Figma variable code syntax aligned with token names so the Figma MCP returns exact
  references.

See `.claude/rules/tokens.md`.
