# Build Journal — 0001: Kickoff

**Date:** project start

## Where this began

The project opened with research, not code: deciding the stack and how to set up Claude
Code to drive the build. Two reports came out of that — saved in `docs/research/` as the
source of truth — covering (1) the stack and Claude Code fundamentals and (2) the
multi-agent studio architecture and toolchain.

## Decisions locked in

- **Framework:** Astro 6, static-first with React 19.2 islands. Chosen over Next.js for a
  content-first portfolio; the islands model keeps shipped JS minimal while still letting
  the React Aria component work shine.
- **Styling & tokens:** Tailwind v4 over a W3C DTCG token pipeline (Tokens Studio →
  Style Dictionary v4 → CSS variables). Three-tier token architecture.
- **Accessible primitives:** React Aria Components — the most rigorous option, and itself
  evidence of the accessibility focus this portfolio is meant to demonstrate.
- **Package manager:** pnpm.
- **Hosting:** Cloudflare primary, Vercel optional for previews.
- **Standard:** WCAG 2.2 AA as the hard bar; APCA as a design-time readability aid only.

## The Claude Code studio

Six agents (accessibility-reviewer, design, frontend-architect, content-writer,
devops-release, qa-test), five skills (scope-ticket, adr, sync-tokens, seed-linear,
seed-notion), deterministic hooks, and path-scoped rules. Accessibility-reviewer is the
signature agent and is read-only.

## What's next

Follow `SETUP.md`: scaffold the app, stand up the token pipeline and component system,
connect the MCP servers, seed Linear and Notion, wire CI, and prove the full
idea→ticket→PR→CI→merge→deploy→journal loop on one small feature.

## Honest notes

- Automated accessibility testing catches a minority of real issues; the agent reviews and
  manual screen-reader passes are where the expertise lives.
- The Claude surfaces (Code, Cowork, Chrome) coordinate through shared files — none drives
  the others or the machine autonomously. That's the accurate framing and the one to use
  in case studies.
