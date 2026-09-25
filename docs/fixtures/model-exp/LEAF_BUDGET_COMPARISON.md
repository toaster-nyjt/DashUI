# Leaf prompt: SIZE BUDGET block vs inline floors

**Decision:** the budget layout is on (`LEAF_SIZE_BUDGET = true` in `app/api/generate/route.ts`).

Run 2026-09-25 on the 6 leaves of end-to-end run 1790351266686, with their real inputs from the run log: spec, box size, style, library, floors and generated primitives. Harness: `docs/fixtures/leaf-compare.cjs` (prompts from the real `buildLeafSystem`) and `leaf-render.mjs` (renders each leaf at its box size and measures overflow). Everything is in `leaf-budget/`.

## The two prompt layouts (`buildLeafSystem`, `budget` switch)

- **Inline (current).** The floors ride in the PRIMITIVE LIBRARY block, the sum rule is in RULES, and the box in rem comes at the end. The model has to connect the three.
- **Budget.** One SIZE BUDGET block ends the prompt. It holds:
  - the box in rem;
  - the chrome heights parsed from the style sheet (`parseChromeHeights`);
  - the floors of this leaf's own types, with variants spelled out, and the rest of the library on one line;
  - a request to write the sum as `// BUDGET height: … ≤ H` / `// BUDGET width: … ≤ W` comments before the layout.

  The library block drops its floors, and the RULES entry points to the block.

With the switch off, the builder reproduces the logged prompts byte for byte (12/12).

## Results

| Config | Slowest leaf (sets the stage) | Thinking tokens, decks (mean) | Thinking tokens, whole UI | Overflow past the box (rem, 6 leaves) |
|---|---|---|---|---|
| **A** inline, Opus 5 adaptive `low` (current; e2e run + 1 sample) | 68s, 72s | 1,659 | 5,746 / 5,428 | 0.5 · 0 |
| **B** budget, Opus 5 adaptive `low` (2 samples) | 64s, 67s | **1,166 (−30%)** | 4,645 / 5,018 (−14%) | **0 · 0** |
| **C** budget, Opus 4.8 thinking off `max` (2 samples) | 64s, 71s | 0 | 0 | 9.8 (Library) · 23.9 (Library) + 3.1 (Deck A) |
| **D** inline, Opus 4.8 thinking off `max` (1 sample) | 65s | 0 | 0 | 15.4 (Library) + 6.3 (FX) + 0.3 + 0.2 |

Code tokens per leaf (excluding thinking):

| | Opus 5 (A/B) | Opus 4.8 thinking off (C/D) |
|---|---|---|
| Decks | 4.5–5.0k | 5.3–7.0k |
| Other leaves | 2.9–4.6k | 4.3–6.2k |

## Reading

1. **Budget on Opus 5 trims thinking without costing quality.** Thinking fell 30% on the decks and 14% across the UI. All 12 budget leaves fit exactly, and the renders are as complete as the current ones. The slowest leaf was 64–67s against 68–72s, a few seconds faster, but that's within sample noise.
2. **Dropping thinking doesn't make leaves faster.** Opus 4.8 without thinking writes 20–40% more code tokens than Opus 5 for the same leaf, which cancels the saved thinking. Its slowest leaf was 64–71s, the same as Opus 5 with thinking.
3. **Dropping thinking also still breaks the fit.** The budget comment fixed Opus 4.8's Effects Rack (6.3 → 0). It didn't fix the short, wide Track Library Browser (9.8 and 23.9rem over). Its comments sum only the top-level row ("body 18.55 (≥ TrackTable 6, TreeSelector 4)") and never add up the primitives stacked inside a column. Opus 5's comments do add up those nested stacks ("jog 25 + gap .75 + transport 3.5 | fader 18 + …").
4. **The comments are useful on their own:** each leaf's intended budget is readable in its code and in the run log.

## Summary

The budget layout is a small gain for the thinking model (less thinking, same perfect fit, a slightly faster slowest leaf) and makes each leaf's budget visible. It doesn't make thinking-off viable: that saves no time, because Opus 4.8 writes more code, and it still overflows the hardest box.
