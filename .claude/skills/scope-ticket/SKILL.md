---
name: scope-ticket
description: >-
  Turn a rough idea into a well-scoped Linear issue. Use when the user describes
  something they want to build or fix and it should become a tracked ticket. Asks
  clarifying questions, then creates the issue via the Linear MCP.
---

# Scope Ticket

Convert a loose idea into a crisp, actionable Linear issue.

## Process

1. **Clarify** — if the idea is ambiguous, ask up to 3 sharp questions (scope,
   acceptance criteria, priority). Don't ask what you can infer.
2. **Shape** the issue:
   - Title: imperative and specific ("Add reduced-motion toggle to hero").
   - Description: the problem, the proposed approach, and explicit **acceptance
     criteria** (a checklist). Include an accessibility acceptance line for any UI work.
   - Labels and estimate.
   - Link any relevant ADR or research section.
3. **Create** it via the Linear MCP, under the "Portfolio — Build" project.
4. Return the issue id so it can name a branch (you/eng-123-slug).

## Definition of well-scoped

A ticket is ready when someone could pick it up cold and know what "done" means. If you
can't write acceptance criteria, the idea isn't scoped yet — say so and break it down.
