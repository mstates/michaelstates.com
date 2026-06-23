---
name: seed-linear
description: >-
  Run ONCE, after the Linear MCP is connected, to create the full initial project
  backlog in Linear from seed/linear-import.csv — including the "Set up Claude Code
  studio" epic and all Stage 0–5 setup tasks, each referencing the research reports.
disable-model-invocation: true
---

# Seed Linear

This skill bootstraps the project's Linear workspace. It is **manual-invoke only**
(`/seed-linear`) so it never fires by accident — creating dozens of issues is a
side-effect you want to trigger deliberately, once.

## Prerequisite

The Linear MCP must be connected and authenticated:

```
claude mcp add --transport http linear https://mcp.linear.app/mcp
# then in Claude Code:  /mcp   → authenticate Linear via OAuth
```

Confirm with `/mcp` that Linear shows as connected before running this.

## What it does

1. Reads `seed/linear-import.csv` — the canonical task list. Each row has: Title,
   Description, Labels, Estimate, Parent (epic), and a Reference column pointing to
   the research file that informs the task.
2. Creates a project in Linear named **"Portfolio — Build"** (ask the user to confirm
   the team/workspace first).
3. Creates the epics, then the child issues under each, preserving the
   parent/child relationships and applying labels and estimates.
4. For each issue, includes the Description plus a "Source" line linking the relevant
   research doc (e.g. `docs/research/02-architecture-blueprint.md`), so every ticket
   traces back to the reasoning behind it.
5. Reports back the created issue ids so they can be referenced in branches/PRs.

## How to run it

When the user invokes `/seed-linear`:

- First confirm the target Linear team and that they want ~30 issues created.
- Parse `seed/linear-import.csv`.
- Create the project, epics, and issues via the Linear MCP.
- Print a summary table of epic → issues with their new ids.

## Important

- Do not run this more than once or it will duplicate the backlog. If re-run, first
  check whether a "Portfolio — Build" project already exists and stop if so.
- The CSV is the source of truth — edit it, not this file, to change the task list.
