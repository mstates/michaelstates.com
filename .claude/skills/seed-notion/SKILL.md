---
name: seed-notion
description: >-
  Run ONCE, after the Notion MCP is connected, to publish the project's founding
  documentation as children of a provided Notion home page — the two research reports,
  an index of the architecture decision records (docs/adr/), and the build journal as
  the running narrative/case-study space.
disable-model-invocation: true
---

# Seed Notion

Publishes the project's founding docs — the two research reports, an index of the
architecture decision records, and the build journal — as children of a Notion page you
provide (that page IS the portfolio home; no wrapper page is created). It's the
public-facing "build journal" / case-study layer. Manual-invoke only (`/seed-notion`).

## Prerequisite

The Notion MCP must be connected and authenticated:

```
claude mcp add --transport http notion https://mcp.notion.com/mcp
# then in Claude Code:  /mcp   → authenticate Notion via OAuth
```

Confirm with `/mcp` that Notion shows connected, and have the home page ready and shared
with the integration (it only sees pages it's been shared with). That page becomes the
portfolio home — the sections are published as its children.

## What it does

1. Asks which already-shared Notion page to use as the **home page**. That page IS the
   portfolio home — no wrapper page is created.
2. **Dedup guard (read-only, runs first).** Lists the home page's existing child pages
   via a read-only Notion MCP read (e.g. `notion-fetch` on the home page). If any of the
   seeded sections — child pages titled **Research**, **Architecture Decisions**, or
   **Journal** — already exist, it **STOPS**, reports what's already present plus the
   home-page URL, and creates nothing. Even a partial match is a stop condition, so a
   re-run can never duplicate or half-duplicate the tree.
3. Only when none of the three sections are present, publishes them as **direct children
   of the home page**:
   - **Research** — two sub-pages from `docs/research/01-stack-and-claude-setup.md`
     and `docs/research/02-architecture-blueprint.md` (the decision record).
   - **Architecture Decisions** — an index that mirrors `docs/adr/`.
   - **Journal** — a running log seeded from `docs/build-journal/`, set up so future
     entries can be appended (by this skill, by Cowork, or by hand).
4. Reports the created page URLs.

## How to run it

When the user invokes `/seed-notion`:

- Confirm the target home page (already shared with the integration).
- Run the read-only dedup guard first: list that page's child pages; if a Research,
  Architecture Decisions, or Journal child already exists, stop and report — create nothing.
- Read the research / ADR / build-journal markdown.
- Publish the three sections as children of the home page via the Notion MCP, converting
  markdown to Notion blocks.
- Print the resulting page URLs.

## Verbatim, point-in-time publishing (durable rule)

The source docs — `docs/research/*`, `docs/adr/*`, `docs/build-journal/*` — are
**intentional historical records** and must be published **exactly as written**. This skill
does **not** reconcile, correct, or modernize their claims against current reality
(dependency versions, superseded tooling plans, earlier naming, and the like) — the point of
a build journal is to show how the thinking evolved. If a run notices a discrepancy between a
doc and current reality, it **flags it to the user in the run output**; it never silently
edits, "fixes," or omits content while publishing. This is a standing rule of the skill, not
a one-time note.

## Notes

- The Notion integration acts with the user's full permissions on shared pages — only
  share the specific space you want it to write to.
- Keep one source of truth: the repo `docs/` are authoritative; Notion is the
  published, readable mirror. When they diverge, reconcile toward the repo.
- Safe to think of this as "publish," not "sync" — it's a one-time seeding. Ongoing
  updates can be appended deliberately.
