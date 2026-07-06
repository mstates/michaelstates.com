# Build Journal — 0005: Goals, not choreography

**Date:** 2026-07-05

## Where this began

The coding assistant moved to a newer, more capable model, and the old prompt style stopped making sense with it. Prompts here used to read like stage directions — edit this line, then that one, then run this. A stronger planner treats a script like that as a ceiling: it follows the steps even when it can see a better route, and when reality diverges from the script, the script wins and the work drifts. The tempting fix is to just say less. But saying less is only safe if the things that must never flex live somewhere the assistant reads every single session — not in the prompt of the day.

## What shipped

- **Boundaries, made durable:** two hard rules moved into the repo's own instruction file, the one the assistant loads at every session. One: execute exactly the stated scope — no refactors or "improvements" beyond the boundary, and if the correct fix needs anything outside it, stop and report. Two: self-report is not verification — every task closes with checks against live ground truth, reported pass or fail. Prompts stopped restating these because the repo now does.
- **A new prompt shape:** goal, hard scope boundary, gates, and pass/fail verification — no edit-by-edit script. What the prompt stopped carrying is the middle; what it kept is everything that was ever actually load-bearing.
- **A pilot with scoring criteria:** the first ticket run this way was deliberately small — bumping four CI actions off a deprecated runtime. Nine lines, one file. Scored on three criteria: every gate held, verification found zero gap between the assistant's report and the disk, and the change stayed inside its boundary.

## The first run

The run passed all three, and the details are the interesting part. The assistant verified each action's runtime claim per version tag against the live API instead of from memory, and reviewed release notes for breaking changes before touching anything. The warnings that motivated the ticket — present on both CI jobs before — came back as zero after. And it hit exactly one judgment call: a stale comment sitting next to the change, technically outside the stated scope. It asked instead of absorbing. That question was the whole experiment in miniature — the boundary is working when it produces a question at the edge, not a quiet expansion past it.

## What's next

One clean cycle is one clean cycle. The counter says one of the two or three needed before this prompt style graduates beyond low-risk tickets; until then, anything with a real blast radius — the instruction files themselves, the token pipeline, the deploy plumbing — keeps the full script. And one thing is permanent regardless of the counter: capability changes what prompts say, never what gets checked. Diffs still get reviewed, writes still get approved one at a time, verification still runs against the disk.

## Honest notes

The pilot ticket was chosen partly because it was hard to fail — small, mechanical, well-trodden. That's a fair criticism and also the point: you calibrate a new leash on a short walk. The honest surprise was where the effort went. "Say less in the prompt" turned out to mean "write more in the repo first" — the brevity was earned upstream, not granted. And this entry is a backfill like its neighbors, written a day after from the ticket trail and the session record, dated to the run it describes.
