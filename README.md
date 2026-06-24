# Portfolio

A bleeding-edge, accessibility-first personal portfolio built with Astro 6, React 19.2,
Tailwind CSS v4, and React Aria Components — developed with a Claude Code "studio" of
specialized agents. Accessibility (WCAG 2.2 AA) is a first-class concern, enforced across
agent review, Storybook, and CI.

**Status:** scaffolding. See [`SETUP.md`](./SETUP.md) for the build runbook.

## Stack

- Astro 6 (static-first, zero-JS islands) + React 19.2 islands
- Tailwind CSS v4 + a W3C DTCG design-token pipeline (Tokens Studio → Style Dictionary v5)
- React Aria Components (Adobe) for accessible primitives
- Storybook 10 with axe-powered a11y testing
- GitHub Actions CI: lint (jsx-a11y), Vitest, Playwright + axe-core, Lighthouse CI
- Hosting: Cloudflare (primary)

## Getting started

```bash
pnpm install
pnpm dev
```

Full setup — including connecting Figma/Linear/Notion/GitHub and seeding the project
backlog — is in [`SETUP.md`](./SETUP.md).

## How this repo is built

This project is developed with Claude Code. The `.claude/` directory contains the agent
studio, skills, hooks, and rules that drive development. The reasoning behind the
architecture is recorded in [`docs/research/`](./docs/research/) and decisions in
[`docs/adr/`](./docs/adr/). The build narrative lives in
[`docs/build-journal/`](./docs/build-journal/).

## Accessibility

Conformance target is WCAG 2.2 AA. Automated checks run in CI, but the substance is the
accessibility-reviewer agent's audits (`docs/a11y/`) and manual screen-reader testing.
See the accessibility statement on the deployed site.

## License

MIT (see LICENSE).
