# Structuring a Bleeding-Edge, Accessibility-First Open-Source Portfolio for Claude Code (Mid-2026)

> Saved from research conducted for this project. Source of truth for the multi-agent
> studio structure, surface division of labor, Figma workflow, and the PM/CI loop.
> Referenced by the Linear backlog.

## TL;DR
- **Build the project as a single coherent system, not a pile of tools:** a Claude Code "studio" of ~6 first-class subagents (architecture, accessibility, design, content, DevOps, QA) defined in .claude/agents/, governed by a tiered CLAUDE.md/rules hierarchy, wired to Figma, Linear, Notion, and GitHub via MCP — with Claude Code doing the building, Claude Cowork running the PM/knowledge-work layer, and Claude in Chrome doing live accessibility/visual QA on rendered pages.
- **Make accessibility your signature, first-class agent** (it is your differentiator), give the **design agent a dual generate-and-review mandate** backed by Figma MCP + Code Connect + Playwright screenshots, and route the **idea→ticket→branch→PR→CI→merge→deploy→build-journal** loop through Linear (execution) and Notion (the narrative/case-study layer) so the workflow itself becomes part of the portfolio.
- **Be honest about limits:** Cowork, Claude in Chrome, the Figma write/MCP features, and Claude Code Agent Teams are all real but evolving/beta in mid-2026 — none of them can autonomously drive your whole machine or operate each other unsupervised. Treat them as supervised assistants with human approval gates.

## Key Findings

1. **Subagents are the right primitive, but use few of them.** Claude Code subagents are separate Claude instances with their own context window, system prompt, scoped tools, and model, defined as markdown-with-YAML files in .claude/agents/ (project) or ~/.claude/agents/ (user). The consensus sweet spot is 3–5 concurrently; give each subagent one job. First-class agents that earn their keep: accessibility, design (generate + review), architecture/frontend, content/writing, DevOps/release, QA/testing. Product/planning, ADR-writing, and token-sync are better as skills/slash commands.

2. **The design agent should be split in spirit into "generate" and "review" modes.** The canonical community pattern is the OneRedOak design-review workflow (GitHub: OneRedOak/claude-code-workflows). It drives a real browser using Microsoft's open-source Playwright MCP and reviews front-end PRs against the standard set by top-tier companies (Stripe, Airbnb, Linear) for visual hierarchy, accessibility (WCAG AA+), responsive design, and interaction patterns, following a "Live Environment First" methodology and a phased process (interaction → responsiveness → visual polish → accessibility → robustness → code health → console). This is community work, not an official Anthropic release — adapt and attribute it.

3. **Accessibility should be first-class and enforced in three places:** a dedicated subagent (design-time review against WCAG 2.2 AA + APCA), Storybook's @storybook/addon-a11y (component-level axe) during development, and CI (@axe-core/playwright + eslint-plugin-jsx-a11y + Lighthouse CI) on every PR. Automation alone is not enough: ~57% of issues by volume (Deque), and only ~29.5% of WCAG 2.2 success criteria are fully automatable. The human/agent review layer is where expertise shows.

4. **Three Claude surfaces divide cleanly:** Claude Code (terminal/IDE) builds and tests code; Claude Cowork (desktop app, Opus-default, macOS-first with Windows rolling out) runs the non-coding knowledge work (Notion/Linear upkeep, case-study drafting, research synthesis); Claude in Chrome (browser extension, beta) does live work against rendered pages and web UIs. They hand off through shared artifacts (the repo, Notion, Linear) — not by operating each other.

5. **Figma MCP + Code Connect is the design-to-code accuracy unlock**, now bidirectional (code→canvas). Tokens flow Figma → Tokens Studio (W3C DTCG) → Style Dictionary v4 → CSS variables/Tailwind theme.

6. **The four PM/dev tools form one loop:** idea → Linear ticket → branch/PR (auto-linked, magic words close issues) → GitHub Actions CI (Vitest, axe/Playwright, jsx-a11y, Lighthouse CI) → merge → deploy (Cloudflare/Vercel) → Notion build-journal/ADR entry.

## Details

### Subagent mechanics and roster
A subagent is a fresh Claude instance spawned via the Task tool, with its own context window, scoped tools, model, and system prompt. The parent receives only the subagent's final summary — heavy reading/searching happens in the child's context. Definitions live in .claude/agents/<name>.md. Manage with /agents (guided creation, tool selection including a read-only preset, model choice, optional persistent memory directory).

YAML best practices: scope tools tightly (reviewers read-only: Read, Grep, Glob); tier the model to the task (Opus for architecture, Sonnet for most, Haiku for cheap); write a sharp description (front-load the trigger); one job per agent.

When subagents help: parallel exploration, heavy-context isolation, independent file work. When they hurt: tightly sequential same-file work. 3–5 concurrent is the everyday ceiling.

Recommended first-class agents: accessibility-reviewer (signature, read-only), design (generate + review), frontend-architect (Opus, plan-first), content-writer, devops-release, qa-test. Better as skills: product/planning → Linear (/scope-ticket), ADR creation (/adr), token sync (/sync-tokens), seed skills (manual-invoke).

Orchestration features: Plan Mode (the planning gate); Agent Teams (shipped with Opus 4.6, Feb 2026, experimental, behind CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1, ~3–7× tokens — overkill for solo daily work); the Skills/Hooks/Subagents trinity ("Skill teaches the how, Hook enforces the rule, Subagent isolates the work"); Plugins (versioned bundles).

### Division of labor across Claude surfaces
**Claude Code (the builder):** writing/refactoring code, running tests, Git, orchestrating subagents, driving MCP servers, headless CI runs. Center of gravity.

**Claude Cowork (knowledge-work layer):** brings Claude Code's agentic architecture to the desktop for non-coding work, Opus-default, isolated VM. Shares config with Claude Code, connects to apps via MCP, can use Claude in Chrome as a connector. Added Projects (March 2026). Good fit: maintaining the Notion build journal/case studies, updating Linear tickets, synthesizing research, drafting narrative from docs/ artifacts. Honest limits: research preview; consumes usage limits fast; the desktop app must stay open; no memory across sessions by default; it does NOT operate Claude Code — sibling surfaces sharing config and files.

**Claude in Chrome (live page work):** beta extension; reads the page via the accessibility tree, screenshots, clicks, types, reads console/network/DOM. Shares your logged-in browser state. Genuine fits: live accessibility testing against real rendered pages, visual QA comparing deployed site to Figma frames, checking deploy previews, reading console errors to feed back to Claude Code. Honest limits: beta, occasionally off-task; slow; permission-gated per-site; context bloats from accessibility-tree snapshots; prompt-injection risk on untrusted pages. Not a hands-off computer-use agent — keep it supervised on trusted sites.

The handoff model: these do NOT operate each other or your whole machine. They coordinate through shared artifacts — Claude Code writes code + docs/ and opens PRs; Claude in Chrome verifies the rendered result; Cowork maintains Notion/Linear narrative. The human is the orchestrator and approval gate.

### Figma generate-and-review
Remote MCP at https://mcp.figma.com/mcp (OAuth). Core tools: get_design_context (structured React+Tailwind + tokens), get_variable_defs (map Figma variables to tokens), get_screenshot, get_metadata (cheap structure for large files), Code Connect tools, write/canvas tools. Scope to a single node id to cut tokens.

Code Connect maps a Figma component to its real code component so Dev Mode shows your actual snippet. Cover leaf primitives first since coverage cascades. Note: full Code Connect requires a Dev/Full seat on Organization/Enterprise plans — a real cost consideration for a solo developer.

Generate-and-review loop: Figma MCP tells you what the design should be; Playwright MCP (or Claude in Chrome) tells you what the implementation actually is; Claude Code reconciles them. The design agent generates from Figma context, then in review mode screenshots the running component across breakpoints and diffs against the Figma frame.

Tokens flow: Figma variables / Tokens Studio (DTCG) → repo tokens/ → Style Dictionary v4 with @tokens-studio/sd-transforms → CSS custom properties + Tailwind theme. Set variable code syntax in Figma so MCP returns exact token names.

### Linear + Notion + GitHub + Actions
**Linear (execution):** remote MCP at https://mcp.linear.app/mcp (OAuth). Claude Code can create/update/triage issues. GitHub integration auto-links branches/PRs three ways: issue ID in branch name, in PR title, or magic words (Closes/Fixes/Resolves ENG-123) which move the issue In Progress on push and Done on merge. Solo-dev best practices: conservative state transitions; create issues even when working alone — that discipline showcases execution.

**Notion (narrative):** official hosted remote MCP (OAuth) gives read/write to pages — PRDs/specs/ADRs, build journal, case studies. Acts with your full Notion permissions, so scope which pages it can touch. Descriptive page titles; start read-only; one source of truth. This is the "showing the thinking" layer.

**GitHub + Actions (CI/CD):** official GitHub MCP server (remote https://api.githubcopilot.com/mcp/) or gh CLI. Recommended CI per PR: eslint-plugin-jsx-a11y; Vitest (+ Storybook addon-vitest); @axe-core/playwright against a built+served site (own Playwright project, upload report); Lighthouse CI with budgets; build + deploy to Cloudflare (Wrangler, token in secrets) or Vercel.

The coherent loop: idea → /scope-ticket creates a Linear issue → branch named from Linear → Claude Code implements (Plan Mode) → PR with Fixes ENG-123 → GitHub Actions runs the gate → review (design + a11y agents, optionally Claude in Chrome on the preview) → merge (Linear auto-closes) → deploy → Notion build-journal entry written from docs/ artifacts.

## Recommendations (staged)

- **Stage 0 — Foundations:** git init, scaffold Astro 6 + React 19.2 + Tailwind v4 + React Aria, /init CLAUDE.md, settings.json permissions.
- **Stage 1 — Token pipeline:** Tokens Studio DTCG → Style Dictionary v4 → CSS vars + Tailwind theme; tokens/CLAUDE.md.
- **Stage 2 — Components + Storybook:** leaf primitives on React Aria + tokens; Storybook 9 with addon-a11y + addon-vitest; Figma Code Connect for primitives.
- **Stage 3 — Claude Code studio:** six agents (accessibility first, read-only reviewers); adapt OneRedOak design-review; .mcp.json with figma/linear/notion/github/playwright; Tool Search; PreToolUse secret scan + test-gate hook.
- **Stage 4 — PM + CI loop:** Linear MCP + Linear↔GitHub; /scope-ticket; Notion MCP + build-journal space; /adr; ci.yml + deploy.yml.
- **Stage 5 — Operate the loop:** Claude Code builds; Claude in Chrome does live a11y/visual QA; Cowork maintains Notion/Linear. Run one small feature end-to-end before scaling.

Pro tips: Plan Mode for non-trivial changes; /clear aggressively between tasks; keep reviewers read-only; agents emit durable markdown artifacts in docs/; Storybook + token files are the design agent's ground truth; scope qa-test to browser-only tools for black-box testing.

## Caveats
- Everything bleeding-edge here is moving (Cowork research preview; Chrome beta; Figma write features slated to become paid; Agent Teams experimental). Pin versions, read changelogs, design to degrade gracefully.
- Don't overstate autonomy: no surface autonomously operates your computer or the other Claude surfaces. Present this honestly in case studies — it's more credible.
- Automated a11y catches a minority of issues (~57% by volume; ~29.5% of WCAG 2.2 criteria fully automatable). WebAIM Million 2026: 95.9% of top home pages still had detectable WCAG 2.x failures. Human/agent review and real assistive-tech testing are the differentiator. APCA is a design-time aid, not a conformance bar.
- MCP security: servers carry supply-chain and prompt-injection risk and act with your full permissions. Scope tokens, prefer read-only, never point Cowork/Chrome at secrets.
- Don't over-engineer the repo: the deployed site is the primary showcase. Fewer, sharper agents beat many overlapping ones.
- Token cost is real: subagents, Agent Teams, MCP tool definitions, and browser snapshots consume context fast. A Max plan is realistically needed for heavy Cowork/Chrome use.
