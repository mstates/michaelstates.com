---
name: push
description: >-
  Manual-invoke push gate: preflight (clean tree, fetch, confirm origin hasn't diverged, list the
  exact commits), then a plain fast-forward push — never --force. The intent-gate the pre-push
  hook can't provide.
disable-model-invocation: true
---

# Push

Manual-invoke only (`/push`) — Claude Code must never decide to push on its own. This is the
**intent gate**: a push happens only when you deliberately invoke this skill, after preflight
passes.

## Prerequisite

- Commits exist locally that you intend to publish (use `/commit` first).
- A clean working tree.

## What it does

When the user invokes `/push`:

1. **Preflight — shown before pushing:**
   - `git status -sb` — confirm a **clean tree**, the branch, and the **exact ahead count** over
     the upstream.
   - `git fetch origin`, then confirm `origin/<branch>` **hasn't moved/diverged** — the
     behind-count must be **0** (a clean fast-forward), via
     `git rev-list --left-right --count origin/<branch>...HEAD`.
   - List the **exact commits that will push, in order**: `git log --oneline origin/<branch>..HEAD`.
2. **Stop conditions.** If the tree isn't clean, OR `origin` has diverged (behind-count > 0), OR
   the ahead count isn't what's expected — **STOP and report; do not push.**
3. **Push (only if preflight passes):** a **plain fast-forward** `git push origin <branch>` —
   **no `--force`, no `--force-with-lease`.** Then confirm the new `origin/<branch>` SHA matches
   local `HEAD` and `git status` shows up-to-date.

## How to run it

- Run the preflight and show it to the user.
- If anything is off, stop and report — do not push.
- Otherwise `git push origin <branch>` (plain FF), then verify `origin/<branch>` == `HEAD`.

## Important

- **Intent gate + mechanical backstop are complementary.** This skill is the intent layer (push
  only when deliberately invoked, after preflight); the `pre-push` hook (`core.hooksPath=.githooks`,
  commit `6625769`) is the mechanical layer (blocks non-FF/force regardless of how a push is
  invoked). Neither replaces the other — a hook can't read intent, and intent alone isn't a guard.
- **Never `--force`** (or `--force-with-lease`) from this skill. A force push is a deliberate,
  separately-reviewed action — not part of the routine push gate.
- A push to `main` is the publish action (Cloudflare deploys `main` from Stage 6+) — treat it as such.
