# Research

The founding reports (01, 02) are the **source of truth** for the architectural
decisions in this project — every setup task in Linear (see `seed/linear-import.csv`)
references one of them. Later numbers are point-in-time audits of the build as it
progresses. All are committed here so the reasoning is safeguarded, versioned, and
legible to anyone reviewing the repo.

- `01-stack-and-claude-setup.md` — the stack choice (Astro 6 / React 19.2 / Tailwind v4
  / React Aria / DTCG tokens) and the Claude Code setup fundamentals (CLAUDE.md,
  subagents, MCP, hooks, TDD).
- `02-architecture-blueprint.md` — the multi-agent studio structure, the division of
  labor across Claude Code / Cowork / Chrome, the Figma generate-and-review workflow,
  and the Linear + Notion + GitHub + Actions loop.
- `03-stage5-readiness-audit.md` — point-in-time audit of the foundation ahead of the
  Stage 5 page build (gate reach, page/document infrastructure, component & test
  posture, token coverage, live deploy state).

The `/seed-notion` skill publishes the first two reports into Notion as the founding
reference pages.
