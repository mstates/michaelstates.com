---
name: follow-up
description: >-
  Manual-invoke deferral filer: records a deferred item in BOTH Linear (a ticket) and
  docs/follow-ups.md (a matching entry citing the real issue number). Recons first, proposes
  both artifacts, then makes two separately per-call-approved writes — Linear create, then the
  doc edit. Never commits or pushes; never writes without explicit approval.
allowed-tools: Read, Edit, Write, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(sed:*), Bash(grep:*), Bash(pnpm exec prettier:*), mcp__linear__list_issues, mcp__linear__get_issue, mcp__linear__list_issue_labels, mcp__linear__list_projects, mcp__linear__save_issue
disable-model-invocation: true
---

# /follow-up — file a deferral (Linear ticket + docs/follow-ups.md entry)

Record a piece of intentionally-deferred work in BOTH systems so the board and the tracker agree. Two artifacts, two gated writes. This skill encodes the _choreography, the house-style traps, and the conventions_ — it does NOT encode authorization. Every write stops for explicit per-call approval; never a blanket "don't ask again."

`$ARGUMENTS` = a short description of the thing to defer.

## Non-negotiable gates (the reason this skill exists is to make these consistent, not to skip them)

- **Recon before propose.** Read live state first; never assume.
- **Propose-and-stop before ANY write.** Draft both artifacts, present them, STOP.
- **Per-call approval on each write.** The Linear create and the doc edit are TWO separate approvals. Never accept a blanket grant.
- **Diff-and-stop before the doc commit.** Show the diff; do not commit. Do not push.
- **Sequence matters:** Linear write FIRST (to get the real issue number), THEN the doc entry citing it.

## Step 1 — Recon (READ-ONLY; report, don't write)

1. **Linear:** query the **michaelstates.com** project (Inclusive Code / INC; project id `301eaefd-fe92-4b33-aa7d-6a50238a849c`) with lean fields (id, title, status, labels, parent). Purpose:
   - **Check no existing ticket already covers `$ARGUMENTS`** — if one does, STOP and report it; do not file a duplicate.
   - Identify the right **parent epic** (deferred/hardening work → INC-180 by default; confirm against the board rather than assuming).
   - Confirm the project's label set and which labels belong to THIS project (not shared-workspace labels from other products).
2. **Doc:** read `docs/follow-ups.md` in full. Report:
   - The right `##` section for this item (match an existing one; do not invent a heading).
   - The house style to match: bullets hand-wrapped at ~95 cols with 2-space continuation indent; bold inline markers (e.g. `**Cause:**` / `**Resolution:**`) if the section uses them; how existing items reference issues, if at all.
   - **Confirm no duplicate entry** already exists.

## Step 2 — Propose BOTH artifacts, then STOP (no writes)

Draft and present both for review. Make NO writes.

**(a) Linear ticket** — mapped to the conventions from Step 1:

- Title: descriptive sentence, no tag prefix.
- Description: markdown sections (Context / Cause / Why it matters / Resolution / Acceptance), files & commits in backticks.
- Parent: the epic from recon (default INC-180).
- Status: Backlog (unless scheduling now).
- **Priority — the scale is NOT inverted: 0=No priority, 1=Urgent, 2=High, 3=Normal, 4=Low.** Deferred/unscheduled work → **0 (No priority)**. Pass the literal integer; confirm it.
- Labels: only EXISTING project labels that fit; add `blocked` if gated (the `blocked` label is the project's signal for gated work, kept alongside status).

**(b) docs/follow-ups.md entry** — pre-built to survive this repo's prettier (`proseWrap: "preserve"`, which does NOT wrap prose).

THREE HOUSE-STYLE TRAPS — the entry MUST satisfy all three or it breaks:

1. **Pre-wrap by hand at ~95 cols** with 2-space continuation indent. Prettier will not wrap it for you; match neighbors.
2. **No long verbatim inline-code spans.** Use short backtick identifiers, not pasted log lines — long `code` spans mangle when wrapped in a list item.
3. **No wrapped line may begin with `+`, `-`, or `*`** (after leading spaces). Markdown reads a line-initial list marker as a sub-bullet and silently re-nests the item — and this passes BOTH `prettier --check` AND a column-0 grep. Break lines so any such character sits mid-line.

The entry captures: bold title with status, evidence (with the deploy/commit SHA in backticks), cause, why it matters, resolution, and `` tracked: `INC-NNN` `` under its parent epic. (The issue number is filled in Step 4, after the Linear write.)

## Step 3 — Gate 1: create the Linear ticket (single per-call-approved write)

On explicit go: ONE issue-create write with the approved parameters. Per-call approved — no blanket grant. Then re-fetch the issue and report its identifier, status, parent, labels, and priority to confirm they landed. STOP.

## Step 4 — Gate 2: append the doc entry (diff-and-stop)

Append the proposed entry to `docs/follow-ups.md`, now citing the **real issue number** from Step 3. Append only — preserve every existing item verbatim. Let the prettier hook run, then VERIFY (report each PASS/FAIL):

- `prettier --check docs/follow-ups.md` → exit 0, no changes.
- `grep -c "<INC-NNN>"` → 1 (present, not duplicated).
- **No line-initial list marker** in the new bullet: `sed -n '<range>p' docs/follow-ups.md | grep -nE '^\s*[-+*]\s'` returns nothing beyond the item's own single leading bullet.
- Content-identity: unwrapping the bullet matches the approved prose (only line-breaks differ).

Show `git diff docs/follow-ups.md` and `git status` (follow-ups.md the only change). STOP. No commit.

## Step 5 — Commit (separate step, on go)

`docs:` conventional commit — subject + body, message via `-F`/heredoc (so it wraps as written and no trailer is auto-appended), NO co-author / "Generated with" trailer, its own isolated commit, staging only `docs/follow-ups.md`. **No push** — pushing is a separate gate, and a push to `main` is a production deploy.

## What this skill must NOT do

- Make any write without explicit per-call approval, or accept a blanket grant.
- File a Linear ticket or doc entry that duplicates an existing one (Step 1 guards this).
- Create new Linear labels, or use shared-workspace labels from other products.
- Invert the priority scale.
- Push, or bundle the doc commit with anything else.
- Skip the three markdown traps or the verification gauntlet.
