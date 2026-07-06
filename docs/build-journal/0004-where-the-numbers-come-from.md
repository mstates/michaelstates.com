# Build Journal — 0004: Where the numbers come from

**Date:** 2026-07-04

## Where this began

This design system has a rule: any text-on-color pair that isn't the default must ship with proof — a computed contrast ratio from the actual color sources, on the record, before it goes live. The button's pressed-state colors had shipped shortly before that rule existed, so they owed a proof after the fact. Backfilling a missing number sounds like paperwork. It turned into two lessons about provenance — where a number claims to come from, and where it actually does.

## What shipped

- **The proof:** a dated addendum in the button's audit doc. White text on the pressed blue: 9.05:1. Dark text on the pressed grey: 14.43:1. Both clear the 4.5:1 bar with room, and both pressed backgrounds are darker than their hover states — pressing a button strictly increases its text contrast.
- **A correction, in the open:** the pull request that originally shipped the pressed colors had presented those same ratios as "validated against the audit's measured baselines." The audit contained no such baselines — those pairs had never been audited, which was the entire reason a proof was owed. The numbers were right; the story about where they came from was invented. The correction is recorded in the new proof's pull request rather than quietly edited away.
- **A rule with the trap embedded:** contrast math now anchors to the color sources at full precision; the hex codes in proof tables are labeled as display artifacts. Codified in the components' convention file with the concrete example inline, so the next person meets the trap already disarmed.

## Same color, two numbers

The tokens are authored in oklch, a color format with decimal precision. The familiar six-character hex codes are a translation — every channel rounded to one of 256 steps. Run the contrast math on the rounded hex and you get 9.07 and 14.50; run it on the sources and you get 9.05 and 14.43. Same colors on screen, two defensible-looking sets of numbers. Today the gap is trivia — everything passes with margin. But a future pair sitting near the 4.5:1 line could pass in one arithmetic and fail in the other, and a proof whose result depends on an unstated input isn't a proof. So the computation was done twice by independent methods, calibrated by first reproducing the audit's known figures — and the rule now names its input.

## What's next

Every future surface pair inherits this: a recorded ratio, a named computation path, and a hex column that's understood as decoration. The first dark or inverted surface, whenever it arrives, will be the rule's first real test — it shows up with the trap already documented instead of rediscovered.

## Honest notes

The false provenance wasn't a wrong number — it was a right number wearing an invented citation, produced in AI-assisted drafting, missed in review, and reading exactly like the truth. That's the unsettling part: correct results make invented sourcing nearly invisible. Nothing clever caught it; the boring habit of opening the cited source and looking for the numbers did. The two-decimal drift, meanwhile, matters to nobody today, and pinning it now is cheap insurance against the day it matters to a pair on the line. And like the last entry, this one is a backfill — written from the pull-request trail and the audit doc rather than same-day memory, and dated to the arc it records.
