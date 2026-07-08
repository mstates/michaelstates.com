# Build Journal — 0008: The counter retires

**Date:** 2026-07-07

## Where this began

Entry 0005 set up an experiment: prompts stating goals and boundaries instead of step-by-step scripts, piloted on low-risk tickets, scored per run, graduating only after two or three clean cycles. The counter reached three. This entry records the graduation — and what the pilot taught about which parts of the old caution were load-bearing and which were scaffolding.

## What shipped

- **Goal-level is now the default,** for low- and medium-risk tickets, as a standing convention rather than an experiment. The carve-outs are permanent, not probationary: anything touching the instruction files, the token pipeline, or the deploy plumbing keeps the full script forever. Blast radius, not confidence, decides.
- **The scoring outlived the counter.** Each ticket still closes with the same three-part evaluation the pilot used — every gate held, verification found no gap between report and disk, the change stayed inside its boundary. What retired was the count toward graduation, not the checks.
- **A rule rewritten as an outcome.** The deploy rule used to name a command sequence; the pilot's lesson about scripts applied to the rule's own wording. It now names the outcome — the public branch only ever advances by pure fast-forward, behind a preflight that compares live values against live values, never via the code host's merge button — and leaves the keystrokes to whoever holds them. Same guarantee, no brittle choreography.

## Two runs under the new rules

The first two post-graduation tickets — a test-suite restructuring and a short decision record — both closed clean on all three criteria. The texture of the runs is the real evidence. At plan review, the executor pre-empted its reviewer: it had already planned the check for formatter drift on verbatim content and the full preflight, unprompted — the conventions showing up in plans before anyone asks. In the other direction, review kept earning its seat: one plan revision caught a gap where an existing guarantee would not have been carried forward intact, the kind of quiet regression a goal-level prompt can hide precisely because no step spells it out.

Two smaller judgment calls from the same stretch deserve the record. A naming convention, read literally, produced the wrong answer; read for its intent, it produced the right one — and the intent reading won. And a carried-over note asserted a relationship between tickets that a live read of the board said didn't exist; the live read won. Both are the same lesson at different scales: documents, including this project's own handoffs and conventions, are evidence about reality, not reality.

## What's next

The convention is standing, so the interesting failures are now the slow ones: drift the per-ticket evaluation is meant to catch, and the temptation to let the carve-outs erode because goal-level keeps going well. The carve-outs are the part written down precisely so that going well is not an argument against them.

## Honest notes

Three clean cycles is still a small sample, and the graduated tickets have been friendly terrain — tests, documentation, one nine-line mechanical change. The first medium-risk feature under goal-level will say more than this entry can. It's also fair to note who benefits from the graduation: shorter prompts are cheaper for the person writing them, which is exactly why the evaluation had to survive the counter — the incentive to declare success early is structural, and the checks are the counterweight. Like its neighbor, this entry is written the same day as the events it records.
