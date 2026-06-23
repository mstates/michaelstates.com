# The Bleeding-Edge, Accessibility-First Portfolio: A Claude Code Setup Guide & Architectural Plan (Mid-2026)

> Saved from research conducted for this project. Source of truth for stack and
> Claude Code setup decisions. Referenced by the Linear backlog.

## TL;DR
- **Build an Astro 6 + React 19.2 islands site, styled with Tailwind CSS v4, composed from React Aria Components (Adobe), with a W3C DTCG design-token pipeline (Tokens Studio → Style Dictionary 4) — and treat the repo itself as a Claude Code "harness": a lean root CLAUDE.md, path-scoped rules, specialized subagents, deterministic hooks, and CI accessibility gates.** This stack maximizes the three things you're being judged on: demonstrable accessibility expertise, design-system craft, and bleeding-edge-but-correct engineering.
- **For Claude Code, the highest-ROI moves are: a sub-200-line CLAUDE.md (target 80–120 lines), a read-only accessibility-auditor subagent, PostToolUse hooks that run lint/format/a11y checks deterministically, and TDD-style "write the failing test first" workflows.** Hooks (not prose) enforce your non-negotiables.
- **Host the static portfolio surface on Cloudflare (or your own server) and keep Vercel for anything that genuinely needs SSR/preview-deploy polish.** Ship to **WCAG 2.2 AA as the hard baseline** (the legal/tooling floor) and use **APCA as a design-time readability check** — but do not claim WCAG 3.0/APCA "compliance," because WCAG 3.0 is still a Working Draft and APCA is not in the normative draft.

## Key Findings

### Claude Code (top priority)
1. **CLAUDE.md is context, not enforced config.** These files are loaded into the context window at the start of every session and treated as context, not enforced configuration. Target under 200 lines; practitioner consensus is 80–120 usable lines, because models reliably follow ~150–200 instructions and Claude Code's own system prompt consumes ~50 of those slots. Use the hierarchy (user ~/.claude/CLAUDE.md, project root, subdirectory, managed policy), @import to reference docs instead of duplicating, and path-scoped rules / .claude/rules/ for topic-specific guidance that loads lazily.
2. **Auto memory** (Claude Code v2.1.59+) lets Claude write its own cross-session notes to MEMORY.md; treat CLAUDE.md as "your requirements" and auto memory as "what Claude observed."
3. **Subagents** are Markdown + YAML-frontmatter files in .claude/agents/ (project) or ~/.claude/agents/ (user). They get isolated context windows, scoped tool access, and a chosen model. Best practice: narrow, read-only where possible (omit Edit/Write), job-shaped. Built-ins: Explore, Plan, general-purpose.
4. **MCP servers**: the high-value web-dev set is Playwright (browser self-QA via the accessibility tree), Figma (design context + Code Connect), Context7 (version-specific docs to cut hallucination), and GitHub. Keep total servers to ~3–6; MCP Tool Search/lazy loading now reduces context cost.
5. **Slash commands and Skills have merged** (Claude Code v2.1.101, April 2026). Custom commands live in .claude/skills/<name>/SKILL.md (recommended) or legacy .claude/commands/*.md; both create /name, and skills can also auto-invoke.
6. **Hooks** are deterministic shell/HTTP/prompt handlers firing on lifecycle events (PreToolUse, PostToolUse, Stop, etc.). They execute every single time their conditions are met, unlike prose in CLAUDE.md. Use PostToolUse to run Prettier/ESLint/axe after edits, PreToolUse to block secret/.env writes. They run with full user permissions — no sandbox.
7. **TDD is the strongest agentic pattern**: write failing tests → confirm they fail → commit → implement until green, instructing Claude not to modify the tests.
8. **Plan mode** (the Explore → Plan → Code → Commit workflow) is officially supported and the cheapest/most valuable phase per token; skip it only when you can describe the diff in one sentence.

### Modern stack (mid-2026 versions)
- **Next.js 16** (stable Turbopack default, Cache Components/use cache, React Compiler 1.0 stable, proxy.ts replacing middleware, React 19.2). **Astro 6** (zero-JS islands; Content Layer API). **React Router v7** is the Remix successor.
- **React 19.2** features: View Transitions, useEffectEvent, <Activity>, Actions, the use() hook, React Compiler 1.0.
- **Tailwind CSS v4** (Rust "Oxide" engine, CSS-first config, OKLCH, ~10x faster builds) is the default; **Panda CSS** is the type-safe, token-first alternative; **vanilla-extract** for zero-runtime typed CSS.
- **Security note**: React Server Components had a critical 2025 vulnerability — CVE-2025-55182 ("React2Shell"), disclosed December 3, 2025, CVSS 10.0, affecting RSC versions 19.0, 19.1.0, 19.1.1, and 19.2.0. Pin to patched versions if you use RSC (fixes in React 19.0.1, 19.1.2, 19.2.1).

### Design system & accessibility
- **React Aria Components (Adobe)** is the most accessibility-rigorous primitive layer — hooks/components implementing WAI-ARIA patterns with i18n/RTL across 40+ patterns — and the strongest "show, don't tell" choice for an accessibility expert. **Radix** is pragmatic and ubiquitous (via shadcn/ui) but update velocity slowed after the WorkOS acquisition; **Base UI** (MUI team) is the actively-maintained Radix alternative. **Ark UI** is cross-framework.
- **Design tokens**: the W3C Design Tokens Community Group announced the first stable version, 2025.10, on October 28, 2025 — a production-ready, vendor-neutral format. Style Dictionary v4 has first-class DTCG support; Tokens Studio exports DTCG. Use a three-tier architecture (primitives → semantic → component).
- **Figma**: official remote MCP server at https://mcp.figma.com/mcp (OAuth; the recommended deployment, no desktop app required). Code Connect bridges your codebase and Figma's Dev Mode, connecting components in your repositories directly to components in your design files. Key MCP tools: get_design_context (formerly get_code; default output React + Tailwind), get_variable_defs, get_screenshot, and the Code Connect mapping tools.
- **Storybook 9** ships built-in a11y testing (axe-core) plus Vitest-powered component/interaction/visual tests.
- **A11y testing**: per Deque Systems' 2021 study (2,000+ audits, 13,000+ pages, ~300,000 issues), 57.38% of total issues were identified using automated tests — the commonly cited ~30% figure reflects coverage measured by WCAG success criteria rather than by issue volume. Combine @axe-core/playwright (full-page/flow scans) with eslint-plugin-jsx-a11y (static, single-element only) and manual screen-reader testing.
- **Standards**: WCAG 2.2 AA is the operative legal baseline. W3C/WAI published the updated WCAG 3.0 Working Draft on March 3, 2026 (Bronze/Silver/Gold model); Candidate Recommendation anticipated Q4 2027, final Recommendation no earlier than 2028, with Bronze broadly equivalent to WCAG 2.2 AA. APCA is explicitly not in the normative WCAG 3.0 draft.

## Recommendations (staged setup sequence)

**Stage 0 — Decide the fork.** Confirmed: content-first portfolio → Astro 6.

**Stage 1 — Scaffold + Claude Code harness (day 1).**
1. git init; scaffold the framework; add TypeScript (strict), Tailwind v4, React 19.2.
2. Write a lean root CLAUDE.md (80–120 lines): stack/versions, commands, directory map, hard a11y rules, available skills.
3. Add ~/.claude/CLAUDE.md with durable personal prefs.
4. Configure MCP: Playwright, Figma (remote/OAuth + Code Connect), Context7, GitHub.
5. Create subagents: accessibility-auditor (read-only), test-author, code-reviewer, design-reviewer.
6. Add hooks in .claude/settings.json: PostToolUse (Prettier + jsx-a11y ESLint), PreToolUse (block .env/rm -rf), Stop (typecheck/test/a11y gate).
7. Add a custom status line; set outputStyle: Concise.

**Stage 2 — Design system + tokens (days 2–4).**
1. Stand up Tokens Studio (DTCG) → Style Dictionary v4 → CSS variables + Tailwind theme; three-tier architecture.
2. Wire Figma MCP + Code Connect; map your Figma components to code.
3. Build core components on React Aria Components; document in Storybook 9 with the a11y addon + Vitest tests.

**Stage 3 — Accessibility CI (day 5).**
1. Add @axe-core/playwright E2E a11y tests + Storybook a11y tests; fail CI on new critical/serious violations.
2. Add eslint-plugin-jsx-a11y (strict), Lighthouse CI.
3. GitHub Actions: typecheck → lint(+a11y) → unit/component (Vitest) → Playwright a11y/E2E → build → deploy.

**Stage 4 — Content, polish, ship (week 2).**
1. Build pages as content collections; add View Transitions.
2. Manual screen-reader passes (VoiceOver + NVDA); APCA-tune token pairs.
3. Deploy: Cloudflare/your server; add preview deploys.
4. Publish an accessibility statement.

## Caveats
- Versioning churn: Claude Code ships weekly; verify feature/version claims against /help and release notes. Treat exact figures as directional.
- RSC security: if you choose Next.js/RSC, pin to a patched release and re-verify against the live advisory.
- APCA/WCAG 3.0: do not represent APCA or WCAG 3.0 as a compliance standard; it's design guidance layered on a WCAG 2.2 AA baseline.
- Hooks run unsandboxed with your full permissions — review every hook command.
