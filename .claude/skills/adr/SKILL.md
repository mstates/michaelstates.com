---
name: adr
description: >-
  Scaffold an Architecture Decision Record. Use when a decision has long-term
  consequences worth recording (framework choices, rendering boundaries, token
  architecture, tooling tradeoffs).
---

# ADR

Record a decision so future-you (and employers reading the repo) understand the why.

## Steps

1. Find the next ADR number in docs/adr/ (zero-padded, e.g. 0007).
2. Create docs/adr/NNNN-short-title.md using the template below.
3. Fill in context, decision, and consequences honestly — including the tradeoffs and
   the options not chosen.

## Template

# ADR NNNN: <title>

- Status: Proposed | Accepted | Superseded by ADR-XXXX
- Date: YYYY-MM-DD

## Context
What's the situation and the forces at play?

## Decision
What did we decide, and why this over the alternatives?

## Consequences
What becomes easier, what becomes harder, what we're now committed to.

## Alternatives considered
Briefly, what else was on the table and why it lost.

Keep it short. An ADR is a paragraph of thinking, not an essay.
