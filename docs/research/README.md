# Research

These two reports are the **source of truth** for the architectural decisions in this
project. Every setup task in Linear (see `seed/linear-import.csv`) references one of
them. They are committed here so the reasoning is safeguarded, versioned, and legible
to anyone reviewing the repo.

- `01-stack-and-claude-setup.md` — the stack choice (Astro 6 / React 19.2 / Tailwind v4
  / React Aria / DTCG tokens) and the Claude Code setup fundamentals (CLAUDE.md,
  subagents, MCP, hooks, TDD).
- `02-architecture-blueprint.md` — the multi-agent studio structure, the division of
  labor across Claude Code / Cowork / Chrome, the Figma generate-and-review workflow,
  and the Linear + Notion + GitHub + Actions loop.

The `/seed-notion` skill publishes these into Notion as the founding reference pages.
