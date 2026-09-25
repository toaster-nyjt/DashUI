# Hoist: Opus 4.8 vs Opus 5 (both adaptive thinking, effort `low`)

**Decision:** the hoist route now uses Opus 5, adaptive, `low`.

Run 2026-09-25, after end-to-end runs showed the hoist had become the slowest step before the primitive stage (57–71s).

## Setup

- **Inputs:** three DJ Table plans.
  - `in-canon.json`: the canonical fixture.
  - `in-1790347150340.json` (7 components) and `in-1790347489002.json` (6 components): the resolved components logged by the two end-to-end runs.
- **Code:** the real `HOIST_SYSTEM_PROMPT` + `COMPONENT_PROTOCOL` and `validateHoist`, through `docs/fixtures/hoist-check.cjs`.
- **Samples:** two per config per input, 12 hoists in total. Outputs are in `hoist-compare/`.

## Results

| Input | Opus 4.8 (current) | Opus 5 |
|---|---|---|
| canon | 42s, 52s | 36s, 35s |
| 150340 | 69s, 64s | 39s, 40s |
| 489002 | 69s, 70s | 49s, 42s |
| **Mean** | **61s** | **40s** |
| Output tokens | 3.7k–6.2k | 3.3k–3.9k |
| Valid on first attempt | 6/6 | 6/6 |

## Quality, checked against the hoist rules

| Rule | Opus 4.8 | Opus 5 |
|---|---|---|
| Every feature covered, valid names | 6/6 | 6/6 |
| Mirrored features (both decks) get the same type | 6/6 | 6/6 |
| `[]` only for pure arrangements | **3/6 broke it**: "BPM Key Columns" got `[]` (canon run 1, both 489002 runs), as did "Sortable Columns" (both 489002 runs) and "Beat Alignment View" (489002 run 1). Each has something you operate or read | 6/6: those same features got `TrackList` / `WaveformLane`. Only true arrangements got `[]` ("FX Unit Slots", "Channel A/B Strip") |
| Value sets typed as lists (Knob `steps?: number[]`) | 6/6 | 6/6 |
| Text input has `placeholder?: string` (new rule) | 6/6 | 6/6 |
| Face content through `children` on buttons and pads | 6/6 | 6/6 |
| One type per form | No real duplicates. Pairs like TreeSelector/OptionSelector are distinct forms | No real duplicates. PushButton/ToggleButton and ToggleButton/ToggleSwitch are distinct forms (momentary vs latching, button vs switch) |

The two models build libraries of similar size (13–15 types, 2–5 one-offs).

## Summary

Opus 5 took about 20s less per hoist (mean 40s vs 61s) with fewer output tokens, and it followed the structural `[]` rule where Opus 4.8 broke it. Since the hoist is on the critical path before the primitive stage, switching would cut about 20s from every generated UI.
