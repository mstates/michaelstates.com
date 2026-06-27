---
name: commit
description: >-
  Manual-invoke commit choreography: show scope, then stage and commit with a message you
  provide — Conventional-Commits-shaped (so the live commit-msg hook passes) and with no
  co-author trailer. Never pushes.
disable-model-invocation: true
---

# Commit

Manual-invoke only (`/commit`) — Claude Code must never decide to commit on its own. This runs
the by-hand commit choreography on top of the active git hooks (`core.hooksPath=.githooks`,
commit `6625769`): it does not re-implement validation, it produces a commit that passes the
live `commit-msg` hook cleanly.

## Prerequisite

- The change is in the working tree and you've decided the message.
- The hooks are active: `git config --get core.hooksPath` → `.githooks`. The `commit-msg` hook
  mechanically enforces Conventional Commits on the subject and rejects `Co-authored-by:`
  trailers; this skill produces a message that satisfies it.

## What it does

When the user invokes `/commit` with a commit message:

1. **Show scope first.** Run `git status` and `git diff --stat` so the user confirms exactly
   which files will be committed — nothing stray.
2. **Stage and commit with the user's message, verbatim.** Stage the intended change, then commit
   via `git commit -F -` (message on stdin, so the full multi-line body survives — not `-m`).
   - **No `Co-authored-by:` trailer**, ever (`includeCoAuthoredBy: false`; the hook also rejects it).
   - **No push.**
   - The subject must be Conventional-Commits-shaped — `type(optional-scope)!: subject`, type ∈
     `feat|fix|docs|chore|refactor|test|perf|build|ci|style|revert` — so the live `commit-msg`
     hook accepts it. If the provided message isn't shaped that way (or contains a co-author
     trailer), surface that and stop — fix the message, never bypass the hook.
3. **Confirm after committing:** print the new HEAD SHA, confirm the working tree is clean, and
   report the ahead-of-origin count (`git status -sb`). Do not push.

## How to run it

- Confirm scope with the user (`git status`, `git diff --stat`).
- `git commit -F -` with the provided message (full body, no co-author trailer).
- Report HEAD, clean tree, and ahead count. Stop — pushing is `/push`.

## Important

- **Never push** — that's `/push`. This skill stops at the commit.
- **Never `--no-verify`** — commits must pass the live hooks, not bypass them.
- The message is the user's; keep it verbatim. If it would fail the `commit-msg` hook, say so and
  stop; fix the message, don't bypass the hook.
