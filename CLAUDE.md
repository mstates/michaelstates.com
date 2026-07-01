# CLAUDE.md

Root context for Claude Code. This file holds **facts** (stack, commands, conventions).
Procedures live in `.claude/skills/`. Path-specific conventions live in `.claude/rules/`.
Keep this file short — every line is a recurring token cost. Re-read after compaction.

## What this is

A bleeding-edge, accessibility-first personal portfolio that doubles as a product
showcase. The deployed site is the primary artifact; this repo is open-source and
"available if curious." Accessibility is the signature competency on display.

**Audience:** supplementary to a resume — the URL is on it, so visitors are high-intent
and low-volume (mostly employers who already clicked through deliberately). The site
complements the resume rather than repeating it: show the work, craft, and reasoning a CV
can't. Prioritize reliability and link-preview/sharing over SEO. See SETUP.md "Who this is
for" for the full priorities.

## Stack (mid-2026)

- **Framework:** Astro 6 (static-first, zero-JS islands)
- **Interactive islands:** React 19.2
- **Styling:** Tailwind CSS v4 (CSS-first config, OKLCH)
- **Accessible primitives:** React Aria Components (Adobe)
- **Design tokens:** W3C DTCG → Style Dictionary v5 → CSS vars + Tailwind theme
- **Component docs:** Storybook 10 (addon-a11y, addon-vitest)
- **Package manager:** pnpm
- **Hosting:** Cloudflare Pages, static path (`output: 'static'`, no adapter). Deploys via
  Cloudflare Git integration (production on `main`, preview URL per PR/branch); GitHub
  Actions is the quality gate only. Custom domain attached at cutover.
- **Standards:** WCAG 2.2 AA is the hard pass/fail bar; APCA is a design-time
  readability aid only (WCAG 3 is still a draft — never claim WCAG 3 / APCA "compliance")

## Commands

- `pnpm dev` — Astro dev server
- `pnpm build` — production build
- `pnpm preview` — serve the build locally
- `pnpm test` — Vitest unit/component tests
- `pnpm test:a11y` — Playwright + @axe-core/playwright accessibility suite
- `pnpm lint` — ESLint (includes eslint-plugin-jsx-a11y)
- `pnpm storybook` — Storybook dev
- `pnpm tokens` — rebuild design tokens (Style Dictionary)

## Conventions

- All interactive components are built on **React Aria Components** and live in
  `src/components/`. Do not hand-roll ARIA widgets when a React Aria primitive exists.
- Components consume **design tokens** (CSS custom properties), never raw hex/px.
- Never use `outline: none` without an equivalent visible `:focus-visible` style.
- Respect `prefers-reduced-motion` for any animation.
- TypeScript is strict. No `any` without a written reason.
- Every UI change is verified against WCAG 2.2 AA before it's considered done.

## Hard rules

- **Always** run `pnpm lint && pnpm test:a11y` before declaring a UI task complete.
- **Never** commit secrets. Tokens/keys go in `.env` (gitignored) or CI secrets.
- **Never** modify a test to make it pass — fix the implementation (TDD discipline).
- Use **Plan Mode** for any non-trivial change before editing files.

## The agent studio (`.claude/agents/`)

- `accessibility-reviewer` — signature agent. Read-only WCAG 2.2 AA audits.
- `design` — generates from Figma + reviews implemented UI (OneRedOak-style).
- `frontend-architect` — Astro/React island architecture, token pipeline, perf.
- `content-writer` — case studies, ADRs, READMEs, build-journal entries.
- `devops-release` — GitHub Actions, CI, deploy config.
- `qa-test` — Vitest + Playwright E2E/a11y tests.

## Skills (`.claude/skills/`)

- `/scope-ticket` — turn an idea into a scoped Linear issue.
- `/adr` — scaffold an architecture decision record.
- `/sync-tokens` — run the Style Dictionary token build.
- `/seed-linear` — create the full project backlog in Linear (run once).
- `/seed-notion` — publish research + journal into Notion (run once).

## Reference docs

- Setup runbook: `@SETUP.md`
- Research (source of truth for decisions):
  `@docs/research/01-stack-and-claude-setup.md`,
  `@docs/research/02-architecture-blueprint.md`
- Decisions log: `docs/adr/`

## Connected services (via MCP — see `.mcp.json` and SETUP.md)

Figma, Linear, Notion, Playwright. These are wired on your machine via
`claude mcp add` / OAuth — they are not active until you complete SETUP.md Stage 4.
