# SETUP.md — Build Runbook

This is the method. Work top to bottom. Each step is **do this → confirm that**, so you're
always executing and verifying, never authoring from scratch. The files referenced here
already exist in this scaffold.

Conventions in this doc:

- `▢` = a checkbox to tick as you go.
- **Confirm:** = how you know the step worked before moving on.
- Commands assume macOS/Linux and `pnpm`.

> **What's already done for you:** the `.claude/` studio (6 agents, 5 skills, hooks,
> rules, settings), `.mcp.json`, the Linear backlog (`seed/linear-import.csv`), the two
> research reports (`docs/research/`), and this runbook. You're wiring it to your machine
> and filling in the app.

## Who this is for — traffic model & priorities

This site is **supplementary**: the URL is on your resume, so visitors are **high-intent
and low-volume** — nearly everyone arrives already interested, asking one question, "is
this person as good as the resume says?" Organic discovery is rare. That inverts the usual
web priorities:

- **Skip broad SEO.** Just keep the site indexable so a search of your name finds it. No
  keyword work.
- **Link-preview (Open Graph) cards matter a lot.** The URL gets pasted into emails and
  forwarded between people; the card that unfurls is the first impression _before_ any
  click. Get title/description/image right everywhere the link is shared.
- **Complement the resume; don't repeat it.** They already have your CV — show what it
  can't: the work, the craft, the reasoning. The case studies and the demonstrated quality
  of the build itself are the substance.
- **Reliability over novelty.** There's no long tail of low-stakes traffic to absorb a bad
  moment; every slow or broken visit can cost a potential employer outright. Where
  bleeding-edge and rock-solid pull against each other, choose solid.
- **Analytics: lightweight only.** A few dozen visits won't produce funnel data, so
  something privacy-respecting just to confirm visits is plenty (self-hosted Umami on your
  own server is free and on-ethos; Plausible/Fathom if you prefer hosted). Don't build
  conversion optimization for this volume.

Contact is about converting interest into momentum with near-zero friction — most visitors
already have your email — and the detail of that is for the design-direction conversation.

## Suggested one-week schedule

The stages below are the detail; this is the rhythm. The design system is on the critical
path — it's days 2–4, right after the stack, because it's what makes the rest of the build
fast and consistent.

- **Day 1 — Stack + skeleton live.** Stages 0–1. Scaffold Astro, get a real layout
  rendering, connect Cloudflare (Stage 6 deploy half) and deploy to `*.pages.dev` even
  ugly. Everything after this is iteration on something already live.
- **Days 2–3 — Design system core.** Stages 2–3. Token pipeline first (your visual
  direction drops in here as token values), then the ~6–8 primitives the site actually
  uses, on React Aria, documented in Storybook as you go. Don't build a library — build
  what the portfolio needs.
- **Day 4 — Studio + PM wiring.** Stages 4–5. Connect MCP servers, seed Linear + Notion.
  (Can slot earlier if you want tracking from day 1.)
- **Days 5–6 — Content + polish.** Build the real pages and wire in case studies; run the
  full loop (Stage 7) on each. Add link-preview (OG) cards and lightweight analytics
  (the Launch readiness epic). Manual screen-reader passes. This is where it gets
  impressive.
- **Day 7 — Cutover.** Stage 8. Attach `michaelstates.com`, accessibility statement, ship.

Scope discipline beats heroics: a focused site live on day 7 beats a sprawling one that
slips. Defer anything not on this path.

---

## Stage 0 — Prerequisites & first commit

▢ Install Node 22+ and pnpm (`npm i -g pnpm`).
▢ Install Claude Code and sign in. Run `claude --version`.
▢ From this folder: `git init && git add -A && git commit -m "chore: scaffold Claude Code studio + research"`.
▢ Create an empty GitHub repo and push.

**Confirm:** `git log` shows your first commit; the repo is on GitHub. Your plan is now
safeguarded — versioned and backed up.

---

## Local git hooks — commit discipline

The repo ships commit-discipline hooks in `.githooks/` — a `commit-msg` that enforces
Conventional Commits and rejects `Co-authored-by:` trailers, and a `pre-push` that blocks
non-fast-forward / force pushes. They live in a tracked directory (not `.git/hooks/`), so
they're version-controlled — but git only runs them once you point it at them.

▢ Activate them (one-time, per clone): `git config core.hooksPath .githooks` — this is **local
git config**, not committed, so each clone sets it itself; without it the hooks are simply
inactive. (They enforce commit discipline at the **git** layer for every actor — not just Claude
Code, whose `.claude/` hooks only constrain its own tool calls.)

**Confirm:** `git config --get core.hooksPath` prints `.githooks`; a commit with a
non-conventional subject or a `Co-authored-by:` line is rejected, and a force / non-fast-forward
push is blocked.

---

## Stage 1 — Scaffold the Astro app into this repo

The studio files live alongside your app. Initialize Astro **in place** (or scaffold in a
temp dir and copy `src/`, `astro.config.*`, `package.json` over — keeping the existing
`.claude/`, `docs/`, `seed/`, `CLAUDE.md`, `SETUP.md`).

▢ `pnpm create astro@latest` → choose: minimal/empty, TypeScript **strict**, install deps.
▢ Add React: `pnpm astro add react` (React 19.2).
▢ Add Tailwind v4: `pnpm astro add tailwind`.
▢ Add React Aria Components: `pnpm add react-aria-components`.
▢ Replace the generated `package.json` scripts with the ones in this scaffold's
`package.json` (so `pnpm test:a11y`, `pnpm tokens`, etc. exist).

**Confirm:** `pnpm dev` serves a page; `pnpm build` succeeds. Open `CLAUDE.md` and verify
the stack section matches what you installed.

---

## Stage 2 — Design token pipeline

▢ In Figma, install **Tokens Studio**; set its export format to **W3C DTCG**.
▢ Export your tokens to `tokens/*.json` in this repo (start with a primitive palette +
semantic layer; the three-tier rule is in `.claude/rules/tokens.md`).
▢ `pnpm add -D style-dictionary @tokens-studio/sd-transforms`.
▢ Add a `style-dictionary.config.*` that reads `tokens/` and outputs
`src/styles/tokens.css` (CSS variables) + a Tailwind theme. Wire it to `pnpm tokens`.
▢ Run `pnpm tokens`.

**Confirm:** `src/styles/tokens.css` exists with `--color-*` / `--space-*` variables, and
they're importable in a component. (You can ask the `frontend-architect` agent to write
the Style Dictionary config — it knows the conventions.)

---

## Stage 3 — Component system + Storybook

▢ Build leaf primitives on React Aria Components in `src/components/` (Button, Input, Text,
Badge, Icon), consuming tokens. **Do these first** — Code Connect coverage cascades from them.
▢ `pnpm add -D storybook@latest @storybook/addon-a11y @storybook/addon-vitest` and init Storybook 10.
▢ Add a story per primitive; enable the a11y addon.

**Confirm:** `pnpm storybook` runs; each primitive has a story; the a11y addon shows no
violations on them. Ask the `accessibility-reviewer` agent to audit one primitive and
write its report to `docs/a11y/` — this verifies the signature agent works.

---

## Stage 4 — Connect MCP servers (this is the "hook up Linear & Notion" step)

`.mcp.json` already declares all four servers. You authenticate them on your machine.
**Nothing in earlier chat actually connected these — this is where it really happens.**

▢ Playwright: `claude mcp add playwright npx @playwright/mcp@latest`
▢ Figma: it's in `.mcp.json` as a remote server. In Claude Code run `/mcp` → authenticate **Figma** (OAuth).
▢ Linear: `/mcp` → authenticate **Linear** (OAuth).
▢ Notion: `/mcp` → authenticate **Notion** (OAuth), then in Notion **share** your target
page/space with the integration (it only sees what it's shared).
▢ GitHub: via the `gh` CLI (which Claude Code already uses) — not wired as an MCP server (its OAuth advertises no registration endpoint, so `/mcp` can't connect).

**Confirm:** `/mcp` lists figma, linear, notion, playwright as **connected**. If
any show disconnected, re-run auth before proceeding — the seed skills depend on this.

---

## Stage 5 — Kick off Linear & Notion (one command each)

Now the payoff. With the connectors live:

▢ In Claude Code: **`/seed-linear`**. Confirm the target team, let it create the
**"Portfolio — Build"** project and the full backlog from `seed/linear-import.csv`.
The **"Set up Claude Code studio"** epic and every Stage 0–5 task land here, each
linking back to the research report that informed it.
▢ In Claude Code: **`/seed-notion`**. Confirm the parent page, let it publish the two
research reports and the build journal as your founding Notion pages.

**Confirm:** Linear shows ~30 issues under epics; Notion shows the Build Journal with the
Research sub-pages. Tick off the setup tasks you've already completed (Stages 0–4).

> If you prefer not to use the seed skills, you can import `seed/linear-import.csv`
> directly via Linear's CSV import UI, and paste the research markdown into Notion by
> hand. The skills just automate it.

---

## Stage 6 — CI gate + Cloudflare staging deploy

Two tools, one job each: **GitHub Actions is the quality gate; Cloudflare deploys.**

**The quality gate (GitHub Actions):**
▢ `.github/workflows/ci.yml` is scaffolded: lint (jsx-a11y) → Vitest → build →
`@axe-core/playwright` → Lighthouse CI. Install the deps it expects
(`pnpm add -D @axe-core/playwright @playwright/test vitest @lhci/cli`).
▢ Confirm it runs on a throwaway PR and uploads the a11y report artifact.

**Deploy + staging (Cloudflare Git integration — configured in the dashboard, no repo workflow):**
▢ In the Cloudflare dashboard: Workers & Pages → Create → **Pages** → Connect to Git → pick
this repo. **Choose Pages, not Workers** — the dashboard may try to route a static site
to Workers; if you land on a `*.workers.dev` URL, use the "shift to Pages" toggle at the
bottom of project settings.
▢ Build settings: framework preset **Astro**, build command `pnpm build`, output dir `dist`.
▢ Keep the project on the **static path**: `output: 'static'` in `astro.config`, and **do
not** add the `@astrojs/cloudflare` adapter. (The adapter is only for SSR/bindings you
don't need; it adds a local-emulator step that can hang on a static site.)
▢ **Do NOT attach `michaelstates.com` yet.** The project deploys to `*.pages.dev` — that's
your staging URL. Every push to `main` updates it; every PR/branch gets its own preview
URL automatically. The existing live site stays untouched.

▢ Enable the Linear ↔ GitHub integration in Linear settings; keep "Done" firing only on
merge to `main`.

**Confirm:** a push to `main` deploys to `<project>.pages.dev`; opening a PR produces a
separate preview URL; CI runs the gate on that PR; a PR titled with `Fixes ENG-123` moves
the Linear issue. You can now build and review on real URLs without touching michaelstates.com.

---

## Stage 7 — Prove the loop end to end

Run one small real feature through the whole system before scaling:

▢ `/scope-ticket` → describe a small feature (e.g. "reduced-motion toggle in the header").
▢ Branch from the Linear issue id (`you/eng-123-reduced-motion-toggle`).
▢ Build it in **Plan Mode** (let `frontend-architect` plan, then implement).
▢ Have the `design` agent review it live (Playwright) and `accessibility-reviewer` audit it.
▢ Open a PR with `Fixes ENG-123`; get CI green.
▢ Merge → deploy → write a `docs/build-journal/` entry (the `content-writer` agent drafts it).

**Confirm:** the issue auto-closed on merge, the site deployed, and there's a journal entry.
That's the full **idea → ticket → PR → CI → merge → deploy → journal** loop working. Scale
from here, one ticket at a time.

---

## Stage 8 — Cutover (go live on michaelstates.com)

Only when the staged site at `*.pages.dev` looks right and the gate is green:

▢ In the Cloudflare Pages project → **Custom domains** → add `michaelstates.com`
(and `www`). If the domain's DNS is already on Cloudflare, it wires the records and
provisions HTTPS automatically (2–3 min). If the domain currently lives elsewhere
(your own server / another registrar), point the registrar's nameservers at Cloudflare
first, then add the domain.
▢ Decide canonicalization (redirect apex → `www` or vice versa) and add a redirect rule.
▢ Once `; preload` on HSTS is something you're sure about, add it in `public/_headers`.
▢ Publish the accessibility statement page.

**Confirm:** `michaelstates.com` serves the new site over HTTPS, the old site is fully
replaced, and Lighthouse looks healthy. You're live.

---

## Operating rhythm (after setup)

- One ticket at a time: `/scope-ticket` → branch → Plan Mode → review (design + a11y) →
  PR → CI → merge → deploy → journal.
- `/clear` between unrelated tasks to keep context lean.
- Let the **reviewers stay read-only**; let agents write durable artifacts to `docs/`.
- **Claude Code** builds. **Claude in Chrome** does live a11y/visual QA on previews.
  **Cowork** maintains Notion/Linear and drafts case studies. None of them drives the
  others — you're the orchestrator at each handoff.

## A note on honesty (it matters for this portfolio)

Your audience includes accessibility and product people who will notice overclaiming.
Two things to keep straight in your write-ups:

- Automated a11y testing catches a **minority** of real issues. The agent reviews and your
  manual screen-reader passes are the substance.
- The Claude surfaces coordinate through **shared files**, not by autonomously operating
  each other or your machine. Said plainly, that's a more credible story than "the AI did
  it all," and it's the true one.
