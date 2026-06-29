---
name: recon
description: >-
  Manual-invoke read-only session-opener: establish live ground truth — git state, last-deploy
  checks, and the full Linear board, queried fresh rather than from memory. Reads and reports
  only; never writes, commits, pushes, authenticates, or proposes actions. Reports the facts,
  then STOPS.
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git show:*), Bash(git rev-parse:*), Bash(git rev-list:*), Bash(git ls-files:*), Bash(git branch:*), Bash(git remote:*), Bash(git fetch:*), Bash(grep:*), Bash(rg:*), Bash(ls:*), Bash(find:*), Bash(gh api:*), Bash(gh pr view:*), Bash(gh pr list:*), Bash(gh run list:*), Bash(gh run view:*), mcp__linear__list_issues, mcp__linear__get_issue, mcp__linear__list_comments, mcp__linear__list_projects, mcp__linear__list_teams, mcp__linear__get_project, mcp__linear__list_issue_labels, mcp__linear__list_issue_statuses
disable-model-invocation: true
---

# /recon — session-opener (READ-ONLY · report-and-stop)

Establish live ground truth at the start of a session so decisions are made against the real board/repo/deploy state, never a remembered or documented snapshot. This skill READS and REPORTS only. It never writes, and it never proposes actions — it hands you the facts; you decide the move.

## Hard constraints (non-negotiable)

- **Read-only.** Invoke NO write tools: no `git commit`/`push`/`add`, no file edits, no Linear `save_issue`/`save_comment`/`create_issue`, no dashboard actions. `git fetch` is allowed — it refreshes remote-tracking refs locally and changes nothing on origin or the working tree.
- **Live, never cached.** Always query Linear and git fresh. Do not report state from memory, prior context, or any handoff — the whole point is ground truth over a snapshot.
- **Report, then STOP.** No suggestions ("INC-X looks closeable"), no proposed next actions, no interpretation of whether work is done. Just the facts.

## Steps

### 1. Git state

Run and report:

- `git rev-parse --abbrev-ref HEAD` — current branch.
- `git rev-parse --short HEAD` — HEAD SHA.
- `git fetch origin` (read-only refresh of remote-tracking refs), then `git rev-list --left-right --count origin/main...HEAD` — ahead/behind vs origin/main.
- `git status --porcelain` — clean (no output) or the list of uncommitted changes.

### 2. Last-deploy status

Report the GitHub check-run conclusions for the current HEAD commit via the `gh` CLI (form the call from the repo's owner/name; this repo uses `gh`, not the GitHub MCP). Report each check and its conclusion — e.g. Cloudflare Pages, the CI quality gate, Lighthouse CI — as success / failure / in-progress. Because a push to `main` is a production deploy, HEAD's deploy status is production's status.

### 3. Linear board (full project, lean fields)

Query the **michaelstates.com** project (Inclusive Code / INC; project id `301eaefd-fe92-4b33-aa7d-6a50238a849c`) for ALL issues, pulling **lean fields only** — identifier, title, status, labels, parent, priority. Do NOT pull descriptions: the board is large (50+ issues), and lean fields keep it in-context.

If the payload is still too large for context, parse it via a subagent or a tighter field projection rather than truncating — and say so if you do. Never silently drop issues.

Group the results by status.

## Output format

Report a tight, scannable session-opener, then stop:

```text
RECON — <date>
Git    <SHA> on <branch> · <clean | N uncommitted> · <in sync | N ahead, M behind origin/main>

Deploy HEAD checks — <check: PASS · check: FAIL · check: pending>
Linear — michaelstates.com (<total> issues)

In Progress (<n>)

INC-XXX  <title>  [labels]

Todo (<n>)

INC-XXX  <title>  [labels]

Backlog (<n>)

INC-XXX  <title>  [labels]

Done: <n>   (collapsed — not listed)
<Flags: surface loudly anything dirty, diverged, or red. If none: "Clean start.">
```

Report rules:

- Active statuses (In Progress, Todo, Backlog, and any others holding open issues) are **listed**; Done is **collapsed to a count**.
- Tag `[blocked]` inline on any issue carrying the `blocked` label, and note what it's gated on if the title/parent makes it clear. (Convention: `blocked` is a label kept alongside status — Backlog/Todo means "not scheduled," distinct from "can't start yet.")
- If git is dirty/diverged or a deploy check is red, surface it prominently in the Flags line — that is the thing a session-opener exists to catch.

## What this skill must NOT do

- Propose closing, opening, or modifying any issue.
- Suggest next actions or interpret whether work is "done."
- Invoke any write tool or change any state.
- Report remembered state instead of querying live.
