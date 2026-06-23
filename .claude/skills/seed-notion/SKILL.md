---
name: seed-notion
description: >-
  Run ONCE, after the Notion MCP is connected, to publish the project's founding
  documentation into Notion — the two research reports as reference pages and the
  build journal as the running narrative/case-study space.
disable-model-invocation: true
---

# Seed Notion

Bootstraps the project's Notion workspace as the public-facing "build journal" and
case-study layer. Manual-invoke only (`/seed-notion`).

## Prerequisite

The Notion MCP must be connected and authenticated:

```
claude mcp add --transport http notion https://mcp.notion.com/mcp
# then in Claude Code:  /mcp   → authenticate Notion via OAuth
```

Confirm with `/mcp` that Notion shows connected, and have the parent page/space ready
(the integration only sees pages it's been shared with).

## What it does

1. Asks which Notion parent page/space to publish under.
2. Creates a top-level page **"Portfolio — Build Journal."**
3. Under it, creates:
   - **Research** — two sub-pages from `docs/research/01-stack-and-claude-setup.md`
     and `docs/research/02-architecture-blueprint.md` (the decision record).
   - **Architecture Decisions** — an index that mirrors `docs/adr/`.
   - **Journal** — a running log seeded from `docs/build-journal/`, set up so future
     entries can be appended (by this skill, by Cowork, or by hand).
4. Reports the created page URLs.

## How to run it

When the user invokes `/seed-notion`:

- Confirm the target parent page.
- Read the research markdown files and the build-journal seed.
- Create the page tree via the Notion MCP, converting markdown to Notion blocks.
- Print the resulting page URLs.

## Notes

- The Notion integration acts with the user's full permissions on shared pages — only
  share the specific space you want it to write to.
- Keep one source of truth: the repo `docs/` are authoritative; Notion is the
  published, readable mirror. When they diverge, reconcile toward the repo.
- Safe to think of this as "publish," not "sync" — it's a one-time seeding. Ongoing
  updates can be appended deliberately.
