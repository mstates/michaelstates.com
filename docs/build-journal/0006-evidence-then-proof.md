# Build Journal — 0006: Evidence, then proof

**Date:** 2026-07-05

## Where this began

"Verified, not assumed" has been this project's rule from the first commit. But a principle is only as sharp as the incidents that ground it, and three of them, across ten days, turned it from a slogan into instruments. The common thread: what the tooling reports about the work is evidence; what the disk says is proof; and the job is to keep making proof cheaper to get.

## What shipped

- **A habit of reading the file, not the summary.** A build that exited cleanly was hiding a component gallery in which every single story failed at runtime. The fix for that had its own near-miss: the proposed edit quietly kept the old styling-plugin line while adding a new one — the plugin would have run twice in the same pipeline — and slotted the framework transform behind plugins that needed to run after it. None of that was visible in the summary of the change; all of it was visible in the actual file. The corrected edit was three deliberate lines, and it was proven by rendering the result in a real browser — on both serving paths — before it was committed.
- **Fingerprints stopped being hand-carried.** Commits are identified by forty-character fingerprints, and for a while those were retyped by hand into the next step's checks. A retyped fingerprint is a transcription risk wearing a verification costume — one wrong character and the check either cries wolf or checks nothing. The rule now: compare live value against live value, captured at the prior gate. Nothing load-bearing gets typed from memory.
- **Receipts straight from the disk.** After every commit, two files the version-control system already keeps — the log of every movement, and the text of the last commit message — are read directly. That converts "the assistant says it committed X, with message Y, on top of Z" from a report into a disk fact. It costs two file reads.

## The passing build that failed

The first incident deserves its own paragraph because it set the tone. "The build passed" is the most reassuring sentence in software and one of the least informative: an exit code certifies that the machinery ran, not that the output works. Every story in the gallery threw the same error the moment a human loaded it. The lesson wasn't "builds lie" — it's that every layer of reporting compresses, and compression is where failures hide. So verification here now names its layer: not "did it build" but "did it render," not "was it edited" but "what does the file contain," not "was it committed" but "what does the log show."

## What's next

The instruments are cheap enough now to be defaults rather than escalations. Every future gate in this project closes the same way: a report from the tool that did the work, then one or two direct reads that make the report unnecessary.

## Honest notes

None of these incidents involved anyone lying — the reports were confident, plausible, and wrong or incomplete in ways their authors couldn't see. That's exactly why "trust but verify" misses the point; the posture here is closer to "trust the disk, appreciate the narration." Between the events above and the writing of this entry, the pattern got an unplanned stress test: a coding session left overnight showed an eight-and-a-half-hour working timer and no explanation of what it did. A handful of direct reads — the movement log, the ticket board — closed the question in minutes: it had touched nothing. And this entry, like its three neighbors, is a backfill: dated to the last of the incidents it records, written afterward from the logs it praises — which is, at this point, the only fitting way to write it.
