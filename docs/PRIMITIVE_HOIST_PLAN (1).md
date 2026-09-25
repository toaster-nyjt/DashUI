# dash-ui — Planning Doc: Primitive Hoisting, Parallel Wiring & Related Changes

**Status (2026-09-25):** **Feature 1 (primitive hoist) is built and running.** The system as built is described in `docs/UI_GENERATOR.md` §14; §0.1 below records every decision made while building it, with the evidence. Features 2 and 3 (typed wiring contracts, parallel/diff wiring) are not started. The rest of this doc is the original design handoff: it captures the reasoning, not just the conclusions, so decisions can be re-derived rather than reverse-engineered.

**Prereq reading:** `docs/UI_GENERATOR.md` (§2 pipeline, §3 component contract, §9 style
registry, §12 path/wiring) — this plan sits on top of that architecture and reuses
its vocabulary (leaf, group, `taskID`, resolved component, channel).

---

## 0. TL;DR — what we're building, in priority order

1. **Primitive hoist (build FIRST).** A new pipeline phase: ONE holistic agent call
   reads the resolved components of one UI, decides a small shared library of primitive
   *types* (knob, fader, readout, waveform strip…) AND rewrites each component's
   `features` array in place to point every feature at the type NAMES it is built from
   (names only — counts, values, modes and labels stay with the leaf generator). Each
   primitive type is generated once against the UI's style; leaves then **assemble** from
   the library instead of authoring primitives from scratch, while still authoring their
   own layout/labels/chrome. Fixes repeated-part visual drift (the "two turntables look
   different" problem) and lightens parallel generation. See §2.5 for the chosen design.
2. **Standardized-shape wiring contracts.** Lift the wiring payload from prose into
   typed shapes computed app-side, so wiring can be split per-component safely. The
   primitive library's prop signatures ARE these shapes — the two features share one
   artifact.
3. **Parallel / diff-based wiring (the latency fix).** The real cost in the current
   wiring step is echoing full component source. Fix via diffs and/or per-component
   parallel calls, on top of the standardized shapes from (2).

Deferred / decided-against for now: recursive group generation (see §7).

### 0.1 Decisions since first draft (2026-09-24)
- **Every feature's code is a primitive, one-offs included.** The §2.8 "skip when reuse
  is trivial" gate is dropped: generate-primitives builds every library type, and leaves
  only assemble. (Leaves still author layout, labels, chrome and counts.)
- **Hoist runs in parallel with layout.** It needs only the resolved components, not the
  style; only generate-primitives waits on style. Everything is still awaited before
  `runUIGeneration` returns (§9 async-commit invariant).
- **Feature map lives per `taskID`, beside `styleSpec`**, not in `ComponentDef.features`
  (which stays `string[]`). `resolveComponent` merges it at resolve time. Satisfies both
  the "rewrite features" goal and the "never rewrite registry entries" invariant (§9).
- **`PATH_SYSTEM_PROMPT` learns primitives are in scope** (`PATH_PRIMITIVES_NOTE` in the
  reference) so wiring never redefines/inlines them.
- **Purely structural features map to `[]`** (e.g. "FX Unit Slots": an arrangement with no
  control/display of its own). The leaf generator builds that structure around its
  primitives; the hoist never invents a container/slot/lane type to satisfy coverage.
- **Spanning applies to prop TYPES, not just prop names** (§2.4). Run 1 typed `Knob.steps?`
  as a `number` count, which can't express the Beat Multiplier's irregular ½/1/2/4. The hoist
  prompt now has a general rule: value/option sets are typed as lists, >2 states as unions,
  and each prop type is checked against every use before finalizing.
- **Primitive generation gets usage context computed in code, not by the hoist.** Run 3 named most
  one-offs by generic form (`TreeSelector` for "Folder Crate Tree", `SortControl` for
  "Sort Headers") despite the prompt, so the name alone doesn't carry domain context.
  `derivePrimitiveUsage(hoist)` computes each type's `usedBy: {component, feature}[]` from
  the feature map; it's a derived view (not a `PrimitiveType` field, not stored), passed
  with the task to the primitive-generation call. Shared types also learn their span
  (`Knob` sees all 7 uses). Leaves don't receive it.
- **Display/face text is sized by a host-provided `<FitText>`, not by generated CSS.** Three
  prompt-only cycles kept failing on text fitting (clipping, fixed-ratio sizes ignoring length,
  container-query units resolving against the viewport). `FIT_TEXT_SOURCE` (reference file) is
  hand-written, injected into the primitives file by `Preview` like the bus shim, and
  binary-searches the largest font at which children fit (layout-size measurement, so it's
  immune to the host's `scale()`; wraps multi-word content by default). The primitive prompt
  routes all display text and face `children` through it and forbids sizing that text directly.
  Same "deterministic parts stay in JS" rule as `resolveComponent` / `buildChannels`.
- **Primitive generation is validate-and-retry**, like the other LLM steps: syntax (TS
  transpile), exactly one `export function <Type>`, no imports / default export, type-prefixed
  top-level names, no hard-coded SVG ids, no `ResizeObserver`, no redefined `FitText`, no
  container-query units without a `container-type` ancestor. First failure is fed back; 3
  attempts. Syntax feedback should carry line + snippet (a bare "Identifier expected" took
  JogWheel 3 attempts). Visual failures (a hairline Fader, poor reflow) are NOT caught — a
  render check remains an option if run-to-run variance proves too costly.
- **The style sheet is APPEARANCE ONLY.** It's injected verbatim into every leaf and
  primitive prompt, so layout/sizing mechanics in it override the generators' structural
  rules. Leaf tests kept reproducing content-sized `shrink-0` rows — the exact pattern the old
  STYLE prompt's chrome example taught (`"h-9 px-3 flex items-center shrink-0"`), and `text-2xl`
  on readouts fought FitText. The amended `STYLE_SYSTEM_PROMPT` (reference file) forbids
  layout, flex-sizing, width/height, min/max, overflow and positioning classes, keeps only
  the chrome's fixed HEIGHT as a height class, and gives display text no font size.
  `validateStyleSheet` enforces it app-side (token-based, so prose like "fixed height" or "a
  grid of pads" isn't flagged) with the usual retry loop. The old sheet fails it; the new
  prompt passed on attempt 1. Leaf-prompt trims shipped alongside: hand-built-only rules
  are omitted for all-primitive leaves (`buildGenerateSystemPrompt` /
  `needsHandBuiltRules`), compact library JSON, PRIMITIVES bullet split into sub-points, and
  the slot rule as its own `<important>` bullet.
- **Primitives restore intrinsic size via declared FLOORS.** Root cause of the recurring leaf
  collapses: hand-built content carries its own size (a `w-8 h-8` knob, a line of text), so the
  model's habitual content-sized rows work; primitives are `h-full w-full`, so in an auto slot
  the row and the primitive size each other to 0. Fix, keeping layout ownership with the leaf:
  each primitive exports `<Type>_MIN = {"base":[w,h], "<prop>:<value>":[w,h]}` (rem, per shape
  variant) and applies it on its root as inline minWidth/minHeight read from the constant;
  `parsePrimitiveFloor` checks it (tolerant of annotations/unquoted keys; 0.5–16 rem; real
  variant keys; applied from the constant). Floors ride into the library block as `"floor"`; the
  leaf gets a first-class `PRIMITIVE FLOORS` rule (a box holding primitives MUST fit the sum of
  their floors + gaps/padding/labels; else compact → fewer copies → drop, never a
  connectivity-critical one) and PRIMITIVE SLOTS forbids `min-*-0`/`overflow-*` on a
  primitive's box. All primitive-only clauses (intro, imports, WIDTH / NO SHRINK FLOORS / BUILD
  EXACTLY exceptions, PRIMITIVES/SLOTS/FLOORS, mapped protocol) are conditional on a library
  being present, so manual boxes get today's prompt verbatim. `minBlockDim` deferred.
- **Leaf-prompt review pass (primitive case).** Rules that depend on primitives are swapped
  per pipeline (`*_BASE` = today's text, `*_PRIM` = written for primitive leaves) — never a
  base rule plus an appended "exception". The pass fixed: fixed-height / fluid-units rules
  contradicting rem-sized primitive boxes; fixed-height chrome that must never shrink while NO
  SHRINK FLOORS banned the class that prevents it (fixed in both prompts: chrome gets
  `flex-none`, and `shrink-0` stays banned everywhere, so the pattern isn't copied onto content
  rows — the contradiction is the likely source of the model's `shrink-0` habit); the
  min-zero ban is stated ONCE (PRIMITIVE SLOTS) with the other rules pointing to it; three different "doesn't fit" ladders unified into one in PRIMITIVE FLOORS
  (compact → fewer copies → scroll a run of repeated items → drop; the route's condense
  sentence is replaced to point at it); face children may use em-relative sizes for hierarchy
  (never absolute); style tokens for controls' insides are never reapplied around a
  primitive; hand-building text is omitted when it can't apply; the min-zero ban covers every
  ancestor of a primitive, with `overflow-clip` for rounded-corner clipping.
- **Leaf post-processor (deterministic, no model/browser) — `docs/fixtures/sanitize-leaf.cjs`.**
  A static scan (`slot-scan.cjs`) showed the min-zero ban is followed essentially never
  (4–12 violating boxes per leaf, even in visually correct leaves) — `flex-1 min-h-0` is too
  ingrained for wording to move. So the generate route runs a JSX-tree rewrite on every
  primitive leaf, touching literal class strings only: (1) on every element that contains a
  primitive at any depth — including through local components that render primitives — it
  removes `min-w-0`/`min-h-0`/`overflow-auto|scroll`, and `overflow-hidden`→`overflow-clip`
  (hidden-scrollbar scroll regions and the outermost element are left alone); (2) inside face
  children it removes `truncate`/`w-full`/`h-full`/`overflow-*`/absolute font sizes; (3) it
  makes the leaf's `flex-1` body a hidden-scrollbar scroll region, so a leaf whose parts
  exceed the box scrolls instead of overlapping or clipping. Floors are thereby honoured by
  construction; budgeting failures degrade to "scroll to reach the last row". Also: a
  percentage-padding check in the primitive retry loop, the published floor key renamed
  `min`→`floor` (it collided with the `min` value-range prop), and `extractComponentCode`
  now strips same-line / stray trailing fences.
- **Leaf generation model: `claude-opus-5`, adaptive thinking, effort `low` (decided 2026-09-25).**
  Sweep on the DJ leaves (2 samples × 3 leaves each; fixtures in `docs/fixtures/model-exp/`):
  thinking is what makes the leaf follow the layout rules and do the floor budgeting — with it,
  raw min-zero and face-child violations drop to 0 and body overflow to ≈0 at every effort;
  without it, even stronger models break (Opus 5 thinking-off: 3/6 leaves stubbed/abbreviated,
  a thinking-tag leak, overflow). Latency/cost scale with effort, quality doesn't below
  `medium`: Opus 5 `xhigh` 300–366s/leaf $0.72, `high` 169–252s $0.45, `medium` 77–108s $0.21,
  **`low` 38–61s $0.11** — the same latency and cost as the old thinking-off Opus 4.8 route
  (35–55s, ~$0.11) with none of its failures. Fable 5.1 `low` also clean (63–84s, $0.33);
  Sonnet 5 `medium` reverts to violations (post-processor-dependent, weaker visuals); Haiku 4.5
  fails (missing features, 10rem overflow). Route change: `thinking: {type:"adaptive"}`,
  `output_config.effort: "low"`, `max_tokens` ≈32–64k, read only text blocks, handle
  `stop_reason: "refusal"` with the server-side fallback. The post-processor stays as a
  safety net (it found nothing to fix on thinking-on leaves).
- **Primitive prompt ↔ check alignment, and a primitive-model comparison (2026-09-25).** The first
  live run spent most of the primitive stage on retries. The percentage-padding check (added in run 6)
  rejected percentage padding everywhere, while the prompt banned it only around `<FitText>`. The
  prompt now bans percentage padding/margin everywhere (SIZE-FLUID), the check also covers margin,
  and JSX RULES gained the leaf prompt's "a quoted string followed by any operator must be placed in
  braces". Then all 14 DJ primitives were run once on each config through the real app code
  (`docs/fixtures/prim-compare.cjs`). Full report: `docs/fixtures/model-exp/PRIMITIVE_MODEL_COMPARISON.md`.
  - **Opus 4.8, thinking off, `max` (current):** 10/14 passed on the first attempt, 18 calls, 88s, $2.18.
    SortHeaders renders no labels (FitText in a box with no definite height), and Selector doesn't reflow.
  - **Opus 5, adaptive, `low`:** 12/14 passed on the first attempt, 16 calls, 61s, $1.46. Its multi-item
    primitives follow the reflow rule. One regression: the Fader's track width grows with the slot.
  - **Decided 2026-09-25: the primitive route uses `claude-opus-5`, adaptive thinking, effort `low`,
    `max_tokens` 64k.** This matches the leaf config. A refusal regenerates once on the previous config
    (Opus 4.8, thinking off, `max`) instead of retrying the refusal.
  - **Follow-up fixes:**
    - **FitText:** the text can no longer size its own box. With no definite size it shows at its inherited size instead of shrinking to 1px, and it no longer crashes in a definite `flex-1` column. Verified old vs new on every FitText span: every size-bounded case is identical.
    - **Primitive prompt:** linear controls size their track and handle across the length in rem, never as a % (3/3 Faders correct). The FLOOR line now bans fixed sizes *larger than the floor*, not all fixed sizes. `url(#...)` references are shown in braces.
    - **Hoist prompt:** an input's placeholder gets an optional string prop.
    - **Opus 5 re-run of all 14:** 13/14 passed on the first attempt, 49s, $1.35. Details in the report.
- **Latency pass after the first logged end-to-end runs (2026-09-25).** Two DJ runs took about 273s:
  plan 67–75s, style/hoist/layout 57–71s (hoist-bound), primitives 65–68s, leaves 70–74s.
  - **Browser queueing fixed.** The primitive stage sent one request per type, and Chrome runs only 6
    per host, so types queued (12–23s lost per run). Now one `/api/primitives` request runs every type
    in parallel on the server (`generatePrimitive` in `app/utils/primitiveGen.ts`, same model,
    fallback, checks and 3-attempt retry). The per-type `/api/primitive` route is removed.
  - **Hoist model comparison:** see `docs/fixtures/model-exp/HOIST_MODEL_COMPARISON.md`. Opus 5 `low`
    had a mean of 40s against 61s, and followed the structural `[]` rule where Opus 4.8 broke it 3/6.
    **Switched:** the hoist route now uses `claude-opus-5`, adaptive, `low`, `max_tokens` 64k. A refusal
    regenerates once on Opus 4.8, adaptive, `low`.
- **Plan stays on Opus 4.8, adaptive, `medium` (tested 2026-09-25).** 5 tasks × 3 configs × 2 samples
  (`docs/fixtures/model-exp/PLAN_MODEL_COMPARISON.md`). All configs write about 85 tokens/s, so time
  follows plan size.
  - **Opus 5 isn't faster:** `low` took 50s and `medium` 65s, against 43s for Opus 4.8.
  - **Opus 5 writes bigger plans:** 60–90% more features and twice the connections. They're more
    complete, but they'd make the slowest downstream stage (the leaves) slower.
  - **Opus 5 `low` also broke the plan rules:** 4/10 plans with unmirrored edges, and 1/10 that would
    fail connectivity.
  - Measured after the latency fixes, a DJ run is about 222s end to end without a plan retry: plan 64s,
    style/hoist/layout 44s, primitives 46s, leaves 68s.
- **Leaf SIZE BUDGET layout (tested 2026-09-25, `docs/fixtures/model-exp/LEAF_BUDGET_COMPARISON.md`).**
  The leaf prompt is now built in one place, `buildLeafSystem` (`app/utils/leafPrompt.ts`), which the
  generate route and the harnesses share. Its `budget` switch (`LEAF_SIZE_BUDGET` in the generate route)
  puts the box, the chrome heights (`parseChromeHeights`) and this leaf's floors in one SIZE BUDGET
  block at the end, and asks for the sum as `// BUDGET` comments. Off reproduces the logged prompts
  byte for byte.
  - **On Opus 5 `low`:** 30% less deck thinking (14% per UI), all leaves fit, slowest leaf 64–67s vs 68–72s.
  - **Thinking off (Opus 4.8) isn't viable even with the block:** no faster (it writes 20–40% more code)
    and still overflows the short, wide Library box by 10–24rem.
  - **Switched on (2026-09-25):** `LEAF_SIZE_BUDGET = true`.
- **User-added features: out of scope for now** — they resolve to `null` and the leaf builds
  them inline (already covered by the PRIMITIVES fallback rule). Same for features toggled on
  after generation (the hoist sees only default-active features) and for features whose
  primitive failed its retries and was dropped.
- **`[]` and `null` mean different things in a leaf's resolved features.** `[]` = structural
  (an arrangement of the other features' primitives, nothing of its own) and does NOT switch on
  the hand-built rule set; `null` = unmapped, build it yourself, and does. One structural feature
  used to flip an otherwise all-primitive leaf onto the hand-built rules (LISTS' overflow-hidden
  rows etc., which clash with PRIMITIVE SLOTS).
- Test fixture for §2.9: `docs/fixtures/dj-table.components.json`.

---

## 1. Context — the defects these changes address

### 1.1 Repeated-part visual drift (the primary target)
Today a generated UI shares ONE style token sheet (`styleSpec[taskID]`, see
UI_GENERATOR §9). Every leaf generates against the same colors/radii/fonts/spacing.
**Yet repeated parts still diverge** — e.g. a DJ table's left and right turntables are
built by two independent generation calls and come out looking like different objects
(different platter geometry, different knob rendering), even though their palette
matches.

**Root cause:** a token sheet constrains *appearance*, not *construction*. Two agents
told "build a turntable, here are the colors" independently invent the sub-structure.
Consistency of a **repeated concrete part** requires sharing the *part itself* (shared
code), not a description of how to paint it. Prose and tokens structurally cannot fix
this; only a shared artifact can. This is the thing the current architecture has **no
other path** to solve.

### 1.2 Wiring latency (secondary target)
The `/api/path` wiring step is too slow even for small UIs. The cost is **not** the
bus machinery (client-side, instant) or channel computation (deterministic, instant).
It's that the model must **echo back the entire source of every edited component** just
to inject a few `bus.emit`/`bus.on` lines — hence `max_tokens: 32000`, `thinking:
disabled`. Output tokens are the bottleneck.

Key correction established during planning: **removing the bus does NOT fix wiring
latency.** Replacing `bus.emit(id,payload)` with props/shared-state is roughly the same
token count; the echo of full source is unchanged. The bus is machinery, not tax; the
echo is the tax. Latency fixes are therefore (a) emit diffs not full source, and/or
(b) parallelize per-component — both orthogonal to whether components share a sandbox.

### 1.3 Where reuse lives (measured, not assumed)
Confirmed against a real DJ-table generation: **repetition is at the PRIMITIVE level**
(knobs, faders, readouts, waveform strips recurring), **not the composite level** (whole
turntables/cards recurring). This decides the reuse boundary — see §2.3. If a future
app's repetition is composite-level instead, revisit §2.6.

---

## 2. Feature 1 — Primitive Hoist (BUILD FIRST)

### 2.1 Insertion point (decided)
The hoist runs on the **resolved components** — the output of
`resolveComponent` for every component of the UI, the same
`{ name, genInstructions, role, connectivity, features, excludedFeatures }` view that
style and layout already receive (UI_GENERATOR §3). This is the point where a
high-level overview of the whole UI is available in one place.

**Why this point specifically:**
- It's the earliest place the whole component set is visible at once. Reuse can only be
  decided globally (a per-leaf agent can't know the left and right knobs are the same),
  so the hoist must see everything — exactly what the resolved component array offers.
- It's **pre-generate**, which is load-bearing for the speed goal: primitives can be
  generated ONCE and handed to every leaf's generation call. Post-generate hoisting
  would be too late — you'd already have paid to generate six knobs six different ways.

### 2.2 The core loop — per-feature decomposition; reuse is a by-product
The hoist works **one feature at a time**. For each feature it asks a single question:
what building block(s) is this made of? If the feature decomposes into smaller reusable
primitives, assign those; if it doesn't, assign ONE primitive that is essentially the
feature itself (a lone "Channel Selector" feature → a `ChannelSelector` primitive). This
is the whole job. It is an LLM inference task (reading `genInstructions`, not string-
matching feature names), because the block a feature is made of is rarely stated in its
name.

**Most features map to their own one-off primitive, and that is the correct result.**
The library being mostly one-of-a-kind primitives is expected and fine — the step is not
trying to force sharing. Sharing is a *by-product*: it happens only when two features
independently turn out to be the same block. In the real DJ log, `"EQ Knobs"`,
`"Gain Trim"`, `"Dry Wet Knob"`, `"Beat Multiplier"`, `"Master Volume"` and
`"Headphone Mix"` all happen to be a knob — so they get the SAME `Knob` type and come out
identical. That payoff is real, but it is discovered per feature, not pursued as the goal;
the agent never sets out to "collapse the vocabulary," it just decomposes each feature and
reuses a block when one already fits.

Because assignment is strictly per-feature, a multi-feature thing like a deck is never
itself a candidate primitive — the agent only ever looks at "Jog Wheel", "Pitch Fader",
"Hot Cue Pads" one at a time, so there is no move by which they collapse into a `Deck`.
This is why the old "don't make a composite" apparatus is unnecessary (see §2.5.3).

### 2.3 The reuse boundary — hoist PRIMITIVES, never COMPOSITES
Bias the hoist to stop at the smallest independently-reusable unit.
- **Hoist:** knob, fader (vertical + horizontal/crossfader variant), numeric/BPM
  readout, waveform strip, cue pad, toggle, VU meter — the building blocks.
- **Do NOT hoist:** a whole turntable / deck / card, even when two components look
  nearly identical (Deck A vs Deck B are a deliberate trap here).

**Why:** a composite (turntable) is context-dependent — its internal layout,
proportions and which sub-parts show depend on the box's size, and the app's core
contract is that every component reflows on both axes independently (UI_GENERATOR §7
sizing rules). If you generate "the turntable" once and leaves only position it, you
lose that responsiveness. If each leaf re-lays-out the turntable, you're back to
generation cost AND divergence.

**The resolution:** Deck A and Deck B end up looking like siblings NOT because they
share a turntable, but because they **assemble the same shared primitives** (same jog
wheel, same pitch fader, same cue pads) into their own context-appropriate layouts.
Family resemblance via shared building blocks under variable composition — how real
design systems work. Bake this bias into the hoist prompt explicitly.

### 2.4 Interface-spanning — the main correctness risk
Because the hoist commits to a primitive's **interface before any code exists**, the
danger is NOT finding too few primitives — it's hoisting a primitive whose prop surface
doesn't span all the call sites it's collapsing. Concrete example from the DJ log:
- EQ knob = continuous, bipolar-ish; Gain trim = continuous; **Beat Multiplier = discrete
  stepped values** (1/2, 1, 2, 4). One naive "knob" can't do both.
- Correct output is ONE knob primitive with a prop contract wide enough to span them:
  `mode: "continuous" | "stepped"`, `steps?: number[]`, etc. — not two knobs, and not
  one knob that silently can't do stepped.

**Mitigation:** the hoist prompt must read `genInstructions` (the prose), not just the
`features` array — the continuous-vs-stepped distinction lives only in the
prose ("a beat-multiplier control", "3-band EQ knobs"). The resolved component DOES carry
this (genInstructions is right there), but the prompt has to be told to use it.

**This is why library-shaping and assignment happen in ONE holistic call (§2.5.2), not
a freeze-then-assign two-pass:** spanning the interface correctly requires seeing every
call site of a primitive TYPE at the moment its contract is decided. Freeze the `Knob`
contract before seeing the stepped Beat Multiplier and you can't span it. The
no-variant-names rule (§2.5.1) is what lets "span" mean "widen the ONE type's prop
contract" (add a `mode` prop) instead of "mint a second type."

### 2.5 What the hoist emits — a building-block manifest + a primitive library (CHOSEN DESIGN — "Design B")

> **Design history (read this so you don't reintroduce the old shape).** Two earlier
> sketches were rejected. First, a *detached manifest* ("Deck A uses Knob×3" sitting
> beside the spec) — rejected for floating free of the feature it belongs to. Second, an
> *enriched-instance* map where each feature held configured primitive INSTANCES with
> per-instance props (`{type:"Knob", mode:"stepped", steps:[...]}`, even hint fields like
> `band:"hi"`) — rejected because it pulls counts, values, modes and labels into the
> hoist, which is exactly the generate route's job. **The hoist does the LEAST that still
> points the generator at the right block: it assigns TYPE NAMES only.** If you find
> yourself putting a value, a count, a mode, or a label into the hoist output, stop — that
> belongs to the leaf generator.

The hoist emits **two artifacts**:

**(A) A primitive LIBRARY — a set of primitive TYPES, each with a prop CONTRACT (an
interface: prop NAMES and TYPES, never values).** This is the shared vocabulary. The six
knob-features across the DJ UI collapse to ONE `Knob` type whose contract is the *union*
of what every knob-use needs. Written as a prop signature — names and TypeScript types,
`?` marks optional:
```
Knob          { min: number, max: number, value: number, onChange: (v:number)=>void, "mode?": "'continuous'|'stepped'", "steps?": number[] }
Fader         { min: number, max: number, value: number, onChange: (v:number)=>void, "orientation?": "'vertical'|'horizontal'" }
Readout       { value: number, "unit?": string }
WaveformStrip { data: number[], "playhead?": number, "onScrub?": (t:number)=>void }
CuePad        { assigned: boolean, onTrigger: () => void }
Toggle        { on: boolean, onChange: (on:boolean)=>void }
VUMeter       { level: number, "channels?": number }
JogWheel      { onScrub: (delta:number)=>void, "spinning?": boolean }
```
The library records **no values** (`min: number`, never `min: 0`) and **nothing the
generator does** — no labels, no counts, no layout.

**(B) Each component's `features` array, REWRITTEN from `string[]` into a map of
`featureName → string[]`** — each feature mapped to the DISTINCT primitive TYPE NAMES it
is built from. Nothing else. Example, Central Mixer:
```jsonc
"features": {
  "Gain Trim":         ["Knob"],
  "EQ Knobs":          ["Knob"],           // ONE entry; the leaf renders three, from genInstructions ("3-band")
  "Channel Faders":    ["Fader"],          // ONE entry; the leaf renders two
  "Crossfader":        ["Fader"],
  "Channel VU Meters": ["VUMeter"],
  "Loop Controls":     ["Button", "Readout"] // several DISTINCT types when a feature genuinely combines them
}
```
And the FX rack's `"Beat Multiplier"` → `["Knob"]` — the SAME `Knob` type as the EQ
knobs. The leaf, seeing "beat multiplier" in its genInstructions, renders it as
`<Knob mode="stepped" steps={[0.5,1,2,4]} .../>`. The hoist never said "stepped"; it only
said "this is a Knob." That is the whole point.

**The value/count question, settled (this is the crux — see §2.5.1).** The library gives
the *variable names* `min`/`max`; the LEAF chooses the *numbers*, per feature — the mixer
gain knob gets `min={-12} max={12}`, the FX knob `min={0} max={100}`, all importing the
same `Knob`. "EQ Knobs": ["Knob"] lists `Knob` ONCE; that a 3-band EQ is three knobs is a
COUNT, and count is the leaf's decision. A feature lists a type **at most once**; it lists
several types only when it genuinely combines different kinds of element (Loop Controls =
a button + a length readout). It never lists the same type twice.

**Why this shape:** it's the smallest change (a `string[]` field becomes a
`Record<string,string[]>`; everything reading feature *names* still works and round-trips
through features/excludedFeatures), the leaf gets ONE component object not component+manifest, and — critically — it
**preserves the generate step's authorial job** unchanged. The leaf still receives the
FULL spec (`genInstructions` + `role` + `connectivity`), still decides counts, values,
modes, layout, labels, chrome and spacing; it just imports `<Knob>` from the library
instead of re-authoring the knob's internals. Primitives are the invariant atoms; the leaf
composes and dresses them. This is §2.3's "shared building blocks under variable
composition" enforced at the spec level.

#### 2.5.1 What goes in a contract vs what the leaf decides (the load-bearing rule)
The library contract is a prop **interface** — prop names and their TypeScript types, no
values. A prop belongs in the contract **iff the primitive's own code needs it to
function**; otherwise it's the leaf's job. The test is NOT "is it needed for wiring" — it's
"does the primitive's internal code consume this prop?"
- **In the contract** (primitive needs it): the primitive's intrinsic parameters and its
  data seam. `min`/`max` (the knob's drag math maps pointer motion onto that range —
  intrinsic), `mode`/`steps` (the knob branches on them internally), `value`/`onChange`
  (its live state seam). These are NAMES + TYPES only; the leaf supplies the numbers.
- **NOT in the contract** (the leaf renders it around the primitive): `label`/caption (the
  knob never draws its own name — "GAIN" is chrome the leaf lays out beside it), how many
  instances (that's the leaf rendering N copies), position/order, grouping.
- **Values, always:** never in the contract. `min: number`, never `min: 0`. If the library
  pinned `min:0 max:100`, every knob in the UI would share one range and the mixer gain
  couldn't be bipolar. Names in the contract → each feature configures its own instance →
  same component, different settings.

**No variant type names.** Variation is expressed by props the leaf passes, so there is ONE
`Knob` type with a `mode` prop — never `SteppedKnob`/`ContinuousKnob`, never
`VerticalFader`/`HorizontalFader`, never `DeckAButton`. A variant baked into a type name
hides drift; the prompt forbids it (anti-drift is prompt-only — §2.5.3).

#### 2.5.2 It's ONE holistic call, not a freeze-then-assign two-pass (DECIDED)
A strict two-pass (pass 1 freezes the library over all specs; pass 2 assigns
per-component) was **rejected**. The hazard: if pass 1 decides types without being on the
hook for the assignments, a feature whose need wasn't fully accounted for gets jammed into
a frozen vocabulary that doesn't fit — and the coverage rule (§2.5.3) *guarantees* it emits
something, turning an under-built library into silent mismatched assignments rather than a
visible failure. **Library-shaping and assignment cannot be separated across a hard
freeze** — whatever decides the types must also produce the assignments, so it can never
declare a vocabulary it can't honor.

So: **one holistic agent call sees ALL components at once and decides the library AND the
feature→type maps together.** This preserves *co-design* — the agent shapes the `Knob`
contract to span (as the UNION of prop needs) the mixer EQ, the FX dry/wet and the master
volume simultaneously, because all knob-uses are in view at once. Reading each component's
`genInstructions` is what surfaces those needs (continuous vs stepped), so the union
contract is correct even though the hoist never picks which mode a given feature uses.

Why the single call is affordable here (unlike generate/wiring): it emits enriched *specs*
(feature names + type names + a small library of prop signatures), NOT component *source
code*. It's far lighter than the token-heavy steps, so its single-call ceiling is high. For
any UI this tool realistically produces (≈6 components), it fits one call comfortably.

**Rejected alternative — naive running-library loop** (start empty, loop components,
reuse-or-mint): do NOT build this. Deciding types with only a *prefix* of components in view
is order-dependent and systematically under-consolidates — process Deck A first, mint a
continuous-only `Knob`, then hit the stepped Beat Multiplier and either retroactively widen
a library entry others already reference (churn) or mint a second knob type (drift).
Consolidation is inherently global. **At scale only (deferred):** if UIs ever grow past the
holistic call's comfort, restructure as *collect-all-needs → consolidate-globally →
assign* — the same call with an explicit collection step on the front. Earn that only when
forced.

#### 2.5.3 Wrap the single call in the pipeline's validate-and-retry harness
The one holistic call is the hardest cognitive step, so make it **auditable, not trusted**
— same pattern as `validateLayout` / `validateConnectivity` (feed the error back, retry up
to a budget, abort cleanly if exhausted). One deterministic validator:
- **Coverage check:** every feature of every component is present as a key with an array of
  type names (`[]` allowed only for purely structural features — §0.1); every named type exists in the library; no feature lists the same type twice; every
  library type is used by at least one feature; every type name is a PascalCase JSX identifier
  (`/^[A-Z][A-Za-z0-9]*$/`) that doesn't shadow a React export (`Fragment`, `Suspense`…), a
  host name (`App`, `GeneratedComponent`) or a JS/DOM global (`Image`, `Option`, `Range`,
  `Selection`, `Text`…) — primitives are injected into scope by name, so a bad name breaks at
  runtime rather than looking slightly off. Any miss = the hoist silently dropped or
  invented something → fail with the specific offender and retry.

**Anti-drift is prompt-only (decided 2026-09-24).** Two deterministic drift checks were
tried against the hand-runs and dropped:
- *Name substring* (`SteppedKnob` contains `Knob`): only false positives —
  `Button`/`ToggleButton`, `Selector`/`TreeSelector` are genuinely different forms.
- *Contract similarity* (Jaccard over `propName:type` pairs, ≥ 0.8): measures interface,
  but the rule is about FORM, and different forms legitimately share a data seam. Correct
  splits already scored close to the line (`Fader`/`Knob` 0.71, `Switch`/`ToggleButton` 0.67);
  a plain knob and plain fader would both be `{min,max,value,onChange}` = 1.0 and drive a
  retry toward a wrong merge. It also misses a real variant that adds >1 prop.

Across three runs the prompt's ONE TYPE PER FORM + no-variant-names rules (§2.5.1)
produced zero variant types, and each type's `description` already states its physical
form. The failure costs are lopsided: missed drift = two parts look different (today's
behaviour, not a broken UI); a false-positive retry = latency plus pressure toward a wrong
merge. So drift is left to the prompt; revisit only if real variants show up in practice.

A feature lists the MINIMUM set of DISTINCT types it is honestly built from — prefer one;
list several only when it combines genuinely different elements; never list a type twice
(count is the leaf's). Note this is *per feature*, not a drive to minimize the library as a
whole: the type count is whatever the features honestly need, mostly one-off, and that is
fine (§2.2).

Composite-avoidance needs no separate enforced rule here: because assignment is strictly
per-feature (§2.2), a whole `Deck`/`Turntable` type is never a candidate in the first place
— the agent only ever decomposes individual features, so the "≥1 type per feature" coverage
rule can't be satisfied by a composite catch-all.

#### 2.5.4 The library IS the wiring contract set (Feature 2) — and what wiring needs
A primitive type's contract already contains its data seam, and **that seam is the wiring
contract** (§3). Of the props in a contract, wiring cares ONLY about the data-carrying ones:
- **Outbound** (a control that drives another component): its callback — `onChange`,
  `onTrigger`, `onScrub`. The signature (`(v:number)=>void`) IS the payload shape on that
  edge.
- **Inbound** (a display driven by another component): its data prop — `value`, `data`,
  `playhead`, `level`.
`min`/`max`/`mode`/`steps` are in the contract for the PRIMITIVE's own sake and wiring
ignores them. So "props the primitive needs" (the whole contract) and "props that carry
cross-component data" (the wiring subset) are two overlapping circles; the data seam is the
intersection.

**Are contracts given to the leaf generators? Yes — the WHOLE library, every prop.** The
leaf must see `value`/`onChange` to supply them from its own state (`<Knob value={gain}
onChange={setGain}/>` — a primitive whose callback is unwired is a dead control), and must
see `min`/`max`/`mode` to configure the instance. It's handed the whole library (not just
its own feature's types) so it can reuse a shared primitive for incidental chrome too
(§2.5 generate rules). Because the data seam is a fixed contract, the leaf (initial state)
and the later wiring step (cross-component flow) attach to the IDENTICAL props — which is
why building the library hands wiring its interfaces for free. Treat the primitive library
and the wiring contract set as ONE artifact viewed twice.

### 2.6 Composite manifest (deferred — only if primitives prove insufficient)
Since repetition is measured as primitive-level (§1.3), the leaf-part library alone
should capture most of the value. Only if composites still diverge too much after the
primitive library ships do we add a fuller `Main { SliderControls { VolumeSlider,
CrossFader } Turntable }` assembly manifest that positions parts with per-instance
layout overrides. Note the storage shape when we get there: model it as **a flat part
library + per-leaf assembly manifest referencing parts by id**, NOT a strict tree —
reuse makes it a DAG (a `Knob` has many parents: turntable, mixer, FX). The tree is how
you think; the shared-library-by-id is how you store.

### 2.7 Pipeline shape after this feature
```
plan → style → HOIST  (ONE holistic call: all resolved components →
                        library[types] + each spec's features rewritten to
                        {featureName → [typeName, ...]}; validate-and-retry)
     → generate-primitives (ONCE per library type, against the style tokens)
     → generate-leaves (parallel; each leaf gets its ENRICHED spec and imports
                        library primitives instead of authoring them)
     → [wire]
```
Ordering decisions:
- **Hoist after style** (or fold the primitive-interface decision into the style pass):
  the style sheet can reinforce what counts as one primitive (all knobs share chrome →
  one knob), and it never splits a primitive.
- **Primitive CODE generation must be after style** regardless — primitives consume the
  style tokens, exactly like leaves do today. This is what makes both turntables' knobs
  identical: same primitive code + same tokens.
- Primitives are independent of each other given (style + shape spec), so
  generate-primitives can itself be parallel; the only hard ordering is
  leaf-waits-for-its-primitives.

### 2.8 Costs / risks ledger (be honest in the impl)
- **Serialization point:** the hoist + generate-primitives phase runs BEFORE the
  parallel leaf step and gates it. For high-reuse UIs (DJ deck: knobs/faders everywhere)
  this clearly wins; for a UI of six unrelated panels with no shared parts it's pure
  overhead (reuse pass finds nothing, you added a phase for nothing). Consider a cheap
  "was any primitive used ≥2×?" gate to skip assembly when reuse is trivial.
- **Reuse MISdetection is the real failure mode:** over-generalizing ("the browse list
  and the queue are the same list part") yields a primitive so prop-laden it's worse
  than two purpose-built components — premature-abstraction tax. The detector needs a
  **conservative bias**: hoist only when uses are genuinely near-identical; prefer
  duplication when in doubt.
- **Composite responsiveness:** if the hoist creeps up to hoisting composites, the
  dual-axis reflow degrades. Keep it at primitive level (§2.3).

### 2.9 Validation step BEFORE building (highest-leverage next action)
Hand-run the ONE holistic hoist prompt on the real six-component DJ array (in the repo log)
and eyeball whether it:
1. collapses the six knob-features to ONE `Knob` TYPE with a prop surface that spans
   continuous + stepped (one type spanning both via a `mode` prop, §2.5.1),
2. resists hoisting a whole deck (stops at primitive level, §2.3),
3. rewrites each spec's `features` into `{featureName → [typeName, ...]}` that plausibly
   covers each component, listing EQ Knobs as `["Knob"]` ONCE (count is the leaf's job,
   §2.5),
4. passes the coverage validator by hand (every feature mapped — `[]` only if structural — no type listed
   twice, every named type in the library, every library type used), with no variant types
   like a separate `SteppedKnob`.

If yes → insertion point + single-call design proven, build the phase. If the knob
interface comes out too narrow, or the agent mints duplicate types → the spec alone
isn't enough / the no-variant-names rule needs strengthening; thread a little
code-awareness in or tighten the prompt. **Draft + run this prompt first; start
implementation from a validated prompt, not a blank one.**

---

## 3. Feature 2 — Standardized-shape wiring contracts

### 3.1 Why
Current wiring passes payload semantics as **prose** (the planner's connectivity
`description`). A single agent that sees both endpoints can keep emit/subscribe
consistent implicitly. To split wiring per-component safely, both ends must agree on the
**payload shape**, not just the channel id. Channel ids are already computed app-side
(`buildChannels`, id = `"A->B"`); payload shape is the missing half.

### 3.2 What to add
Extend the wiring contract so each channel carries an explicit `payloadShape` (e.g.
`{ min:number, max:number }` for a price range; `{ bpm:number, phase:number }` for the
DJ Sync edges). Two ways to source it:
- **Lighter:** one cheap upfront LLM pass derives `payloadShape` per channel from the
  connectivity description; or the planner emits it as part of connectivity.
- **Heavier:** a dedicated "contract" phase that freezes the full interface (id + shape
  + semantics) for every edge before any per-component wiring runs.

### 3.3 Synergy with the hoist (important)
The primitive prop signatures from §2.5 **are** these shapes. A shared
`<Slider value onChange/>` primitive already defines a typed interface; wiring that
touches that slider keys off the same signature. So **building the hoist gives wiring
its shapes for free** — treat the primitive library and the wiring contract set as one
artifact viewed twice. This is also the cleanest resume/story framing: the two features
are one coherent piece of system design, not two.

### 3.4 The rule to enforce
Freeze payload contracts app-side BEFORE any per-component wiring fans out — the same
philosophy that already made channel ids deterministic. Without this, per-component
wiring produces subtly mismatched emit/subscribe shapes and you get flaky runtime bugs
that the current id-only `validateWiring` check wouldn't even catch.

---

## 4. Feature 3 — Parallel / diff-based wiring (latency fix)

### 4.1 The two levers (neither is "one block vs many blocks")
Total **output tokens** dominate wiring time, and they're ~equal whether you send one
concatenated block or many delimited blocks. The levers that actually move latency:
1. **Emit diffs/hunks, not full source.** Have the wiring agent return only the
   changes to inject (a `useState`, an effect, a handler) keyed to a location, instead
   of reprinting whole components. Biggest single lever — attacks the dominant term
   directly. The current full-echo was chosen for parse reliability, so this trades some
   robustness for a large speed gain (needs a reliable apply/patch step).
2. **Parallelize per-component.** Many small concurrent calls instead of one big serial
   one. Wall-clock drops even if total tokens don't. Safe ONLY once §3 (standardized
   shapes) is in place — otherwise split agents produce mismatched payload shapes.

### 4.2 What changes for validation
`validateWiring` currently checks both ends of each channel in one result set. Split
per-component, run the same check AFTER joining all results. New failure mode to handle:
**half-open channels** (A wired its emit, B's agent failed to wire the receive). The
single-call version fails atomically; the split version can partially succeed, so
join/validation must detect and re-drive individual dangling ends (retry the specific
failing component's agent, not the whole set).

### 4.3 Explicitly NOT the fix: merging into one sandbox
Merging all leaves into one Sandpack sandbox is a legitimate **cleanup** (deletes the
postMessage relay, the `busShim`, the initial-sync cache, and the §6 seam-bleed
hairline hack) and lets bus calls become ordinary React state/props. BUT it does **not**
speed up wiring-with-interactivity, because the echo cost is unchanged (§1.2). It can be
slightly worse on output (the agent now also authors the shell/wiring scaffold).

Where the sandbox merge DOES pay off big: **if a given UI needs no cross-component data
flow**, then consolidation is pure deterministic templating (see §5) and you skip the
LLM wiring call ENTIRELY — that's not "faster wiring," it's *no wiring call*. Decide per
the question in §6.

---

## 5. Deterministic layout consolidation (free win, independent of wiring)

The absolute→relative repositioning idea does NOT need an agent. `validateLayout` has
already PROVEN the placements tile the parent's `w × h` interior perfectly, so
converting absolute grid coords into a relative CSS-grid container is pure templating:
```jsx
// container
style={{ display:"grid",
         gridTemplateColumns:`repeat(${w}, 1fr)`,
         gridTemplateRows:`repeat(${h}, 1fr)` }}
// each child
style={{ gridColumn:`${p.colStart} / ${p.colEnd + 1}`,
         gridRow:`${p.rowStart} / ${p.rowEnd + 1}` }}
```
Every generated component already carries `h-full w-full flex flex-col overflow-hidden`
and reflows on both axes, so it fills whatever cell it lands in. **No LLM, no tokens, no
latency.** Relevant if/when consolidating leaves into one surface; keep it deterministic.

---

## 6. The decision that gates the wiring direction

**Do the generated UIs need real cross-component data flow, or is co-location + a shared
visual identity enough?**
- If components mostly need to look unified and sit together (interactivity lives
  *inside* each, little flows *between*): skip the path route, pack deterministically
  (§5), turn the slowest LLM call into instant templating.
- If they need genuine filter-drives-map / sync behavior (the DJ table clearly does —
  see the Sync, Load-to-Deck, FX-assign edges): keep wiring, apply §3 + §4 for speed and
  safety; the sandbox merge is optional cleanup.

The DJ example has real, dense connectivity (deck↔mixer, browser→decks, FX→decks,
deck↔deck sync), so for these UIs wiring stays — optimize it, don't delete it.

---

## 7. Recursion — considered and DEFERRED (do not build yet)

Question raised: should a child component recursively become its own group, gated on a
novel factor (cohesion/containment, since size + functionality are already handled by
plan)?

**Findings:**
- The **rendering** recursion already exists and is depth-general (`GeneratedBox`
  renders `children` recursively; `flattenToGlobal`, `ungroup`, `selectionPath` all
  handle arbitrary depth). The **generation** pipeline only ever emits ONE level (one
  group, N leaves) — recursive *generation* is not implemented.
- The split is decided ONLY at the top level, in the plan route, gated on available
  pixel area. There is no per-component "subdivide this further" logic.
- The "novel factor" correctly resolves to **cohesion/containment** (does this component
  decompose into sub-parts that belong together more than to the whole?) — a semantic
  judgment, so it needs an LLM call.

**Why deferred:** it pushes against the two binding constraints (latency, consistency) —
recursive generation multiplies the exact LLM calls we're trying to reduce, and forces
hard style-inheritance + wiring-scope decisions at each group boundary. Payoff is
invisible unless a downstream feature consumes the hierarchy (manipulation/ungroup of
meaningful sub-assemblies). It becomes worth it only if (a) UIs grow LARGE (a dozen-plus
components, where one flat plan/style degrades and divide-and-conquer helps), or (b) you
want users to grab/restyle meaningful sub-assemblies.

**Cheaper alternative if you want grouping now:** let the planner emit a soft `group`
label (a string, part of plan output, ~zero added cost, no extra call); layout keeps
same-group components contiguous; the renderer draws a subtle shared container. ~80% of
the perceptual/manipulation benefit without a recursive pipeline. Promote to real
recursion later only if UIs scale or manipulation features demand it.

---

## 8. Build order (recommended)

1. **Draft + hand-run the ONE holistic hoist prompt** on the real six-component DJ array
   (§2.9). Validate the four checks by hand. De-risks the insertion point + single-call
   design on real data. Lock the `features → [typeName]` schema and the contract-vs-leaf
   split (§2.5.1) here.
2. **Primitive library + feature→type maps, leaf-level primitives only** — single
   holistic hoist call wrapped in the validate-and-retry harness (coverage
   validator, §2.5.3) → generate-primitives per library type against
   style → leaves receive enriched specs and import/assemble while still authoring
   layout/labels/chrome. Ship this. Measure: do the two turntables now read as siblings?
   did the parallel leaf step get lighter?
3. **Standardized-shape wiring contracts (§3)** — reuse the primitive prop signatures as
   the contract artifact. Freeze payload shapes app-side.
4. **Parallel and/or diff-based wiring (§4)** — on top of (3). Handle half-open-channel
   validation.
5. (Optional) deterministic layout consolidation (§5) / sandbox merge cleanup, per the
   §6 decision.
6. (Only if needed) composite assembly manifest (§2.6); (only if UIs scale) recursion or
   soft group labels (§7).

---

## 9. Invariants to preserve (don't regress these)

- **Async-commit-before-self-gen** (UI_GENERATOR §5 risk 1): registry/style/library
  state must commit before leaves mount. Any new phase (hoist, primitives) must respect
  this ordering so leaves mount with everything they need already in state.
- **Outermost element stays square + full-bleed** (`h-full w-full flex flex-col
  overflow-hidden`, `rounded-none`): primitives AND assembled leaves must keep this;
  primitives are inner elements so they MAY use the style's rounding, but a leaf's
  outermost element still may not.
- **Positional `activeIdx` fragility**: the registry only appends, never replaces.
  Don't let the hoist rewrite existing registry entries' feature arrays.
- **`taskID` grouping**: primitives/library are per-UI, keyed by `taskID`, exactly like
  `styleSpec`. Two different generated UIs must not share a primitive library instance.
- **Style tokens are the single consistency source** for a UI: primitives consume them;
  never let a primitive hardcode colors that bypass the token sheet.
- **Contract holds NAMES+TYPES, never values; leaf decides values/counts/labels**
  (§2.5.1): the library holds TYPES with prop contracts (prop names + TS types); features
  map to TYPE NAMES only; a prop is in a contract iff the primitive's own code needs it;
  all variation rides in props the leaf passes, never in new type names. This is what
  keeps one type per form (§2.5.3: anti-drift is prompt-only) — do not let the hoist emit
  `SteppedKnob`/`BipolarKnob` as distinct types.
- **The hoist is ONE holistic call, not a freeze-then-assign two-pass** (§2.5.2):
  library-shaping and feature assignment happen together so the agent never declares a
  vocabulary it can't honor. Do not "optimize" this into a separate freeze pass or a
  running-library loop — both reintroduce drift/mismatch the single call avoids.
- **The `features` map must round-trip** the existing name-based contract: feature names
  still feed features/excludedFeatures and the on-screen label; enrichment only turns each name's
  value from absent into a `[typeName, ...]` array. Anything that reads feature names
  today keeps working.
