# Primitive generation: Opus 4.8 (thinking off) vs Opus 5 (adaptive, low)

Run 2026-09-25, after two prompt fixes to `PRIMITIVE_SYSTEM_PROMPT` (see below). One sample per config.

**Decision:** the primitive route now uses Opus 5, adaptive thinking, `low` (`app/api/primitive/route.ts`). A refusal regenerates once on Opus 4.8, thinking off, `max`.

## Setup

- **Input:** the 14 types of the canonical DJ Table hoist (`dj-table.hoist.run5-low.json`) and the appearance-only style sheet (`dj-table.style.appearance-only.txt`).
- **Code under test:** the real app code, not the reference file:
  - `PRIMITIVE_SYSTEM_PROMPT` and `primitiveRequest` from `app/api/SKILLS.ts`;
  - `extractPrimitiveCode` and `checkPrimitive` from `app/utils/primitiveChecks.ts`;
  - `derivePrimitiveUsage` from `app/utils/helpers.ts`.
- **Retry loop:** the same as `fetchValidPrimitives`. Up to 3 attempts per type, with the first failed check fed back.
- **Harness:** `docs/fixtures/prim-compare.cjs`. Outputs are in `prims-pc-o48/` and `prims-pc-o5l/`:
  - each type's code;
  - failed attempts, saved as `<Type>.attemptN.tsx`;
  - `_floors.json` and `results.json`;
  - the gallery, as `gallery.html` plus base-row screenshots `gal-*-0..3.png`.

| | Current: Opus 4.8 | Candidate: Opus 5 |
|---|---|---|
| Model | `claude-opus-4-8` | `claude-opus-5` |
| Thinking | disabled | adaptive |
| Effort | `max` | `low` |
| `max_tokens` | 16,000 | 64,000 |

## Prompt fixes applied before the run

1. **Percentage padding.** SIZE-FLUID gets a general rule: never use percentage padding or margin anywhere, because it's measured from the slot's width, so in a short, wide slot it can take up the whole height. Inner spacing uses `inset-[x%]` on an absolute region, flex/grid gaps, or SVG viewBox coordinates.
   - Before this, the prompt banned it only around `<FitText>`, while the check rejected it everywhere.
   - The check now covers margin too, so the prompt and the check match.
2. **JSX attributes.** JSX RULES now include the leaf prompt's sentence: "A quoted string followed by any operator must be placed in braces."

## Results

| | Opus 4.8, thinking off, `max` | Opus 5, adaptive, `low` |
|---|---|---|
| **Passed on first attempt** | 10/14 | **12/14** |
| Passed within 3 attempts | 14/14 | 14/14 |
| Total calls | 18 | **16** |
| Stage wall time (all types in parallel) | 88s | **61s** |
| Median time per type | 38s | **22s** |
| Median first attempt | 36s | **20s** |
| Output tokens | 59,325 | **33,591** |
| Cost ($5 / $25 per MTok, both models) | $2.18 | **$1.46** |
| Thinking blocks | 0 | 1 on 13 of 16 attempts |
| Thinking leaked into text / refusals / cut-offs | none | none |

The stage takes as long as its slowest type. Here that was Waveform on Opus 4.8 (two attempts, 88s) and JogWheel on Opus 5 (two attempts, 61s).

### First-attempt rejections

| Opus 4.8 | Opus 5 |
|---|---|
| Waveform: percentage padding `px-[6%]` | JogWheel: syntax error, `fill="url(#" + ""` (a quoted string followed by an operator, without braces) |
| TreeSelect: percentage padding `px-[6%]` | SearchInput: percentage padding `py-[18%]` |
| Selector: percentage padding `pl-[3%]` | |
| ToggleButton: unprefixed top-level name `PowerGlyph` | |

Even with the new rule, Opus 4.8 used percentage padding on 3 of 14 types, against about 5 in the live run before the fix. Opus 5 used it once. Both fixed their rejections on the second attempt.

## Visual comparison (gallery base rows: small 72×72, large 240×240, wide 320×64, tall 64×240)

| Type | Opus 4.8 | Opus 5 | Better |
|---|---|---|---|
| Knob | Clean arc and pointer | Adds tick marks and a glowing arc | Opus 5 (slightly) |
| Fader | Slim track and cap; correct proportions in every slot | **Track width grows with the slot**: a fat pill in the large slot, and a dome shape in the wide slot | **Opus 4.8** |
| Button | Fitted face text | Same | Tie |
| ToggleButton | Fitted text and a lit strip | Fitted text and an LED dot | Tie |
| Pad | Richer: corner accent, indicator and velocity bar | Plainer face | Opus 4.8 |
| JogWheel | Good platter and centre cap | More detailed markings | Opus 5 (slightly) |
| Waveform | Good | Good, with a stronger played/unplayed split | Tie |
| LevelMeter | Green segments | Green, amber and red zones | Opus 5 (slightly) |
| Readout | Fitted numerals | Same | Tie |
| SearchInput | Shows a "Search library" placeholder | No placeholder | See note 1 |
| TreeSelect | Uppercase rows with counts | Compact rows with folder icons | Tie |
| TrackList | Title / artist / BPM / time | Also shows a key badge | Tie |
| SortHeaders | **Broken: header labels don't render**, only arrows in empty columns | Legible chips that reflow to the slot | **Opus 5** |
| Selector | **Doesn't reflow**: one squeezed row, with unreadable labels in the large and tall slots | **Reflows** to a grid when square and a column when tall, with legible labels | **Opus 5** |

**Notes:**
1. **SearchInput.** The contract has no `placeholder` prop, so Opus 4.8's "Search library" is invented content. That breaks the CONTENT-FREE rule, even though it looks better. Opus 5 followed the rule. The real fix is in the hoist: a placeholder is face content, so the contract should carry it.
2. **SortHeaders (Opus 4.8), root cause.** `<FitText>` sits inside `<span className="relative flex min-w-0 flex-1 items-center overflow-hidden">`, which has no definite height. FitText fills its parent, so it measures a zero-height box and renders the labels at size 0. This breaks the prompt's "DEFINITE SIZES ALL THE WAY DOWN" rule, and no static check catches it.
3. **JogWheel.** Opus 5's floor is 5rem (Opus 4.8's is 4rem), so in the 4rem-wide gallery slot it spills over the edge. That's a slot smaller than its declared floor, not a rendering bug. A leaf would budget for it.

## Follow-up fixes (same day)

### 1. FitText: text can no longer size its own box (host code, `FIT_TEXT_SOURCE` in `SKILLS.ts`)

- **The bug.** In a parent with no definite size, the old FitText's text set its own box's size. Each fitting step shrank the font, which shrank the box, so the loop ran down to 1px.
- **A second failure.** In one layout the old version also crashed with an infinite update loop (React error #185): a `flex-1` child of a column with a definite height, which is a *correct* pattern.
- **The fix.**
  - The text now sits in an absolutely positioned layer, so the box's size always comes from the parent.
  - If the box measures zero while visible, FitText shows the text at its inherited size instead of shrinking it away.
  - Hidden boxes (`display:none`) are skipped until shown, so hiding is never mistaken for "no definite size".
  - The fallback isn't sticky: when the box later gets a size, fitting resumes.
- **Regression check** (`docs/fixtures/fit-regress.mjs` plus the galleries, old vs new FitText, every FitText span measured; data in `fittext-regression/`):

| Page | Spans | Identical | Changed |
|---|---|---|---|
| FitText cases: 8 contents × 4 slots, plus a scaled slot | 40 | 40 | — |
| Edge cases: hidden then shown, zero height then grows, text changes after mount | 3 | 3 | — (all fitted: 43px, 42.75px, 39px) |
| Edge: parent with no definite height; content-width parent | 2 | 0 | 1px → 16px (readable) |
| Edge: `flex-1` in a column with a definite height | 1 | — | old **crashed**, new fits (38.25px) |
| Gallery, Opus 5 primitives | 56 | 56 | — |
| Gallery, run 6 primitives | 84 | 80 | 4 × "NO SIGNAL" empty state: 1px → 16px (the same bug, previously unnoticed) |
| Gallery, Opus 4.8 primitives | 104 | 84 | 20 × SortHeaders labels: 1px → 16px |

Every size-bounded case is identical. The only changes are text that was invisible and is now shown. None of the saved primitives pass layout or padding classes to FitText (18 uses scanned), which was the one API difference to check.

`docs/SKILLS.primitives.reference.ts` keeps the old FitText on purpose, as the baseline for this comparison.

### 2. Linear controls keep their thickness (primitive prompt, SIZE-FLUID)

- **The pattern.** Failing Faders sized the track and handle across the slot in % (`w-[26%]`), so they widened with the slot. Correct ones used rem (`w-[min(34%,0.7rem)]`).
- **Wording tested, Opus 5, Fader only:**

| Wording | Correct |
|---|---|
| "keep their thickness" | 1/2 |
| "a fixed thickness in rem" | 1/2 |
| Final: "size its track and handle ACROSS the length in rem (within its floor's short side), never as a % of the slot" | 3/3 |

- **Knock-on edit.** The FLOOR line said "nothing inside gets a fixed … pixel/rem size", which contradicts the new rule. It now says "nothing inside it gets a minimum size, a shrink floor, or a fixed size larger than the floor", which is the actual intent.
- **Re-run of all 14 after both edits** (`prims-pc-o5l-2/`): 13/14 passed on the first attempt, 15 calls, 49s, $1.35. No visual regressions: fluid shapes still scale, Faders are slim in every slot, and multi-item primitives reflow.

### 3. SVG id references in braces (primitive prompt, UNIQUE SVG IDS)

JogWheel failed twice in a row on `fill="url(#" + …` (a quoted string followed by `+`, without braces). The id rule told the model to build every `url(#...)` reference, but never showed the JSX form, so it now includes `fill={"url(#" + uid + "-glow)"}`. JogWheel then passed on the first attempt in 2/3 samples. The third wrote a different broken variant and passed on retry.

### 4. Placeholder in contracts (hoist prompt, FACE CONTENT)

Added: "Other text the element itself shows that varies by use (an input's placeholder) gets an optional string prop." Two hoist runs (`followup-hoist/`) both gave the text input `"placeholder?": "string"`.

A third run returned malformed JSON (`"type": "Pad": ""`) and didn't reproduce. The hoist route turns this into a 422 and a retry.

## Summary

Opus 5 at `low` followed the rules more reliably, used fewer calls, finished about 30% faster, and cost about 33% less. It was clearly better on the two multi-item primitives, where Opus 4.8 failed: SortHeaders' missing labels, and Selector not reflowing.

Opus 4.8 was better on Fader, whose Opus 5 track scales with the slot width, and on Pad's detail. Of these, the Fader is the only functional regression, and a vertical Fader appears in every channel strip. Follow-up fix 2 resolves it: 3/3 Opus 5 samples came out correct.

With one sample per config, the per-type visual differences are only indicative. The rule-following gap matches what we found for leaves, where thinking was what made the model follow the rules.
