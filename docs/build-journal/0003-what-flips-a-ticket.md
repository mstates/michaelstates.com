# Build Journal — 0003: What flips a ticket

**Date:** 2026-07-01

## Where this began

The last entry closed on an open question: when a pull request opens, does the ticket tracker notice on its own, or does it need a manual nudge? It sounds like trivia. It isn't — this project treats its own process as the exhibit, which means the board has to be a truthful record, and a board that moves by invisible rules can't be one. Two tickets had already advanced themselves from "Todo" to "Done" with no hand on them, which proved automation existed without revealing which event tripped it: pushing the branch, or opening the pull request.

## What shipped

No code this time — a verified map of the automation, and one new habit.

- **The trigger:** opening a pull request is what moves a ticket to "In Progress." Pushing the branch alone does nothing. The branch name carries the ticket's ID; the pull request is the event that links them.
- **The close:** merging a pull request whose description says it closes the ticket flips it to "Done" on its own, two to four seconds later. Verified four cycles in a row.
- **The habit:** nothing signals "work started" during research, edits, and commits — most of a ticket's life. So the ticket now gets flipped to "In Progress" by hand at the start, and the board tells the truth the whole way.

## Isolating the trigger

The test was deliberate separation: push the branch, stop, check the board, then open the pull request. The check got skipped — the pull-request instruction went out before the between-step read happened, which briefly looked like a ruined experiment. The timestamps saved it. The tracker logs every state change to the millisecond, and the code host logs when a pull request is created: creation at 00:10:25, flip at 00:10:28, and the flip recorded in the same millisecond the pull-request link attached to the ticket — the signature of a single webhook doing both. The push, minutes earlier, had moved nothing. Case closed.

## What's next

With the map settled and the manual flip in place, the board becomes a reliable audit log: every future ticket's state history doubles as a faithful timeline of when work started, when it shipped, and how fast the automation confirmed it. That record is portfolio material in itself.

## Honest notes

The experiment nearly failed by process error, not design: queuing the "next step" before its gate had cleared meant the gate got skipped. Timestamps rescued the observation, but the real fix was a workflow rule — one gated step per turn, and conditional steps stay unwritten until their condition clears. Also honest: the manual-flip habit means one automation case (a ticket jumping straight from "Backlog") will now never be tested — a question deliberately retired, not answered. And this entry is written days after the fact, from logs rather than memory. That the logs could reconstruct all of it is rather the point.
