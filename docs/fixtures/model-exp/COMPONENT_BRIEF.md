# Component brief for one-off primitives (2026-09-27): no gain, not adopted

**Idea.** A primitive's request carries its hoist description and USED BY (component → feature names), but never the using component's `genInstructions`. A comparison of descriptions against `genInstructions` on DJ (task-1790499847643) and Cyberpunk (task-1790493337400) found a few one-off visual surfaces whose `genInstructions` says more about what they depict:
- BodyDiagram: the body regions (frontal cortex, ocular, nervous system, …);
- MapCanvas: "a stylized Night City map with district labels";
- CharacterPortrait: "neon-glitch … V's portrait".

For shared controls and data displays, the USED BY feature names already carry everything. Roles describe data flow, not appearance.

**Candidate (harness only).** `prim-compare.cjs --brief=1`: a type used by exactly one component gets that component's `genInstructions` appended to its request, as COMPONENT DESCRIPTION. The criterion is decided in code from the hoist. It covers 13/17 Cyberpunk types and 5/14 DJ types.

**Test.** CharacterPortrait, BodyDiagram and MapCanvas (the expected gains), plus Stepper and QuestList (to check for harm). Opus 5 `low` with companions, 2 samples per arm. Outputs: `brief/off-A|B`, `brief/on-A|B`, galleries `brief/*.png`.

| | Off | On |
|---|---|---|
| Passed first try | 10/10 | 10/10 |
| Wall time per set | 43–50s | 41–48s |
| Output tokens per set | 15.3–15.7k | 14.7–16.1k |
| Body-region words in BodyDiagram code | 1 / 1 | 0 / 1 |
| District or Night City words in MapCanvas code | 0 / 0 | 0 / 0 |
| Glitch/scanline lines in CharacterPortrait | 14 / 17 | 16 / 15 |

The renders show no meaningful difference: the same framed placeholder portrait and the same teal silhouette.

**Why it doesn't help.**
- The primitive rules keep primitives content-free: draw only what props supply, never invent sample data.
- The hoist already routes these details into the contract as data. MapCanvas has `"regions?": "{ id; label; … }[]"`, so districts and their labels come from the leaf. BodyDiagram takes slot `points`.
- The style ("neon-glitch") comes from the style sheet, which every primitive already gets.

So the brief's specifics have nowhere to go. **Not adopted.** No app code changed; the flag stays in the harness.
