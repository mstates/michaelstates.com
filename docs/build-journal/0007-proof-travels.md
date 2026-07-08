# Build Journal — 0007: Proof travels

**Date:** 2026-07-07

## Where this began

Entry 0006 ended with a promise: every gate closes with a report from the tool that did the work, then a direct read that makes the report unnecessary. This week the project moved part of its workflow into a different working environment — a reviewer's seat alongside the coding assistant rather than inside it — and the environment promptly took some of the instruments away. The code host was unreachable from the new seat. The usual version-control commands didn't run there. Even the file access turned out, on inspection, to be pointed at a scratch folder rather than the repository. The question the week kept asking: when the instruments don't travel, does the standard?

## What shipped

- **The access gap, found by checking.** The reviewer's file window claimed to see the project; a direct read showed it was scoped to a temporary sandbox instead. The fix was to connect the real folder — which came with a catch worth recording: the connection grants read *and* write, so the reviewer's read-only guarantee stopped being enforced by scope and started being enforced by discipline. That is a weaker guarantee, and writing it down is the honest half of keeping it.
- **A second witness for merges.** With the code host unreachable, "the branch merged" would normally be the assistant's word alone. But the ticket board flips a ticket to done only when the real merge lands — entry 0003's open question, long since answered — so the board's transition, read live with its timestamp, independently proves the merge happened. Two systems that don't share a failure mode, agreeing.
- **Reading the ledger without the ledger's own tools.** When no version-control command was available at all, the plain files the system keeps on disk — the movement log, the ref that names the current commit — were readable through the ordinary file window. The fingerprints, the fast-forward, the branch cleanup: all confirmable from the raw records, no tooling required.
- **Verbatim means untouched by helpful hands.** A repository hook that tidies formatting rewrote a scratch file that held text meant to land exactly as written. The rule that came out of it: point-in-time content bypasses the formatters — pipe it straight to its destination rather than resting it anywhere the cleanup machinery can reach.

## The check that pointed inward

The sharpest moment of the week ran the standard in an unexpected direction. The coding assistant's own helper claimed to remember context from earlier work — and the assistant checked the claim against the record before using it, found it false, and discarded it. Self-report is not verification was written as a rule for checking the assistant's work from outside; watching it applied by the assistant, to its own components, suggests the posture is becoming culture rather than compliance.

## What's next

None of the workarounds above are the preferred instruments, and they shouldn't quietly become them. The direct commands beat reading raw ledger files; scope-enforced read-only beats discipline-enforced. The standing order is to prefer the strong form wherever the environment offers it, and to name the substitution out loud wherever it doesn't — a proof that arrived by a weaker route should say so.

## Honest notes

The reviewer's read-only rule survived this week because nothing tempted it, not because anything prevented it — worth being plain about. And the two-witness merge proof has a quiet dependency: it works because the board's automation is wired to the real merge event, which is itself a configuration someone could change. Every proof rests on something. The job is to know what, and to check the something once in a while. This entry breaks a streak: the four before it were backfills, written after the fact from the logs; this one is written the same day, from notes taken while it happened.
