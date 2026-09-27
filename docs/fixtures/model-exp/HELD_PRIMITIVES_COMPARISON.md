# Companion context and held primitives (2026-09-26)

**Question.** A primitive agent saw only its own contract, a feature list and the style sheet. Would telling it which other primitives its components use (companions) fix relationship bugs such as the Cyberpunk map, where the markers and route didn't follow the map?

**Answer.** Partly. Companions fixed the holder's coordinate space, but the map stayed broken for two layout reasons that no amount of context fixes. The fix that works is a contract change: the hoist names the types a surface holds (`"children?": "MapMarker | RouteOverlay"`), and the primitive and leaf prompts switch on it. With that, the map works end to end: markers render on their districts, follow zoom and pan, and take real clicks.

All runs use the real app code, the Cyberpunk run-1 inputs pinned in `docs/fixtures/cyberpunk.run1.jsonl`, and Opus 5 with adaptive thinking at effort `low` (the route config).

## What shipped
- **Companions.** `derivePrimitiveCompanions` (helpers.ts) lists, per type, the other types each using component builds from. `primitiveRequest` adds a **USED WITH** section (type + description per component). It is derived from the hoist, never stored.
- **Held types.** A new HOIST contract rule, **HELD TYPES**: a type whose surface draws other library types in its own coordinates types `children` as the union of those names. `heldTypeNames` reads it, and `validateHoist` rejects unknown names or self-reference.
- **Primitive prompt switches** (`buildPrimitiveSystemPrompt`, driven by `primitivePromptSwitches`):
  - `companions`: one "You are given" line for USED WITH;
  - `holds`: **HELD LAYERS** replaces FACE CONTENT (one layer inside the pan/zoom transform that stacks each child as a full-size layer, `absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]`, never pointer-events-none);
  - `heldBy`: a **HELD** bullet (outermost element `pointer-events-none`, operable parts `pointerEvents: "auto"` and `e.stopPropagation()` on pointerdown).
- **Leaf prompt switch** (`holders`, when the library has a holder): FACE CONTENT narrows to `React.ReactNode` slots, and **HELD LAYERS** tells the leaf to pass the held primitives as direct children, with no wrapper (a wrapper breaks the stacking).
- **Fix to an old rule.** The primitive TEXT rule said "face content / children"; it now says "face content", since children are no longer always text.
- **No-op when unused.** With no holder in the library, all 10 logged leaf prompts and the manual-box prompt are byte-identical to HEAD. With the switches off, the primitive prompt matches HEAD except for the TEXT fix.

## Round 1: companions only (`model-exp/companions/`)
10 types × 2 samples per condition: the map trio, Tooltip, PerkNode, EquipmentSlot, ItemGrid, StatReadout, ActionButton, ToggleSwitch.

| | Off (`base-A/B`) | On (`comp-A/B`) |
|---|---|---|
| First-try pass | 20/20 | 20/20 |
| Cost per batch | $1.16, $1.32 | $1.17, $1.17 |
| MapCanvas children inside the pan/zoom transform | 1/2 | 2/2 |
| MapCanvas children layer clickable | 0/2 | 2/2 |
| Face types still render `children` through FitText | 4/4 types, both | 4/4 types, both |
| Map works (probe) | 0/2 | 0/2 |

`map-probe.mjs` found two causes that affect every set, including the live logged run:
1. **Held primitives stack.** Every primitive's outermost element is in-flow `h-full w-full` (SIZE-FLUID), so the holder's children lay out one below another: the route fills the map and each marker lands a full map height further down, outside the visible area.
2. **Held primitives block and lose pointer input.** Full-size layers cover the ones beneath them, and the holder's pan handler captures the pointer on pointerdown, so the marker never gets its pointerup.

Hand edits to comp-B (`handtest-gridstack`, `handtest-passthrough`) confirmed the fix before any prompt change: grid-stacking the children layer brought drift to 0–0.7px, and the pass-through root plus stopPropagation made hover and click fire, while a drag still pans the map.

## Round 2: held types (`model-exp/held/`)
**Hoist** (`hoist-check.cjs`, 2 samples per task, all valid on the first attempt, 24–47s):

| Task | Holders declared |
|---|---|
| Cyberpunk 2077 | 2/2: `MapCanvas` holds `MapMarker \| RouteOverlay` (the prompt's example is a graph canvas, not a map) |
| DJ Table | 0/2 (no spurious holders) |

**Primitives** on run 1's hoist, with only MapCanvas's slot changed to the union (`cyberpunk.hoist.patched.json`): 6 types × 2 samples, 12/12 first-try, $0.72 and $0.75 per batch.

| Probe (`map-probe.mjs`) | prims-A | prims-B |
|---|---|---|
| Marker distance from its district: default / zoomed 2.5× / dragged | 0 / 0.7 / 0.7 px | 0 / 0.7 / 0.7 px |
| Real hover → `onHover` | yes | yes |
| Real click → `onSelect` | yes | yes |
| Drag still pans the map | yes | yes |

**Leaf** (`leaf-compare.cjs` → `leaf-map-probe.mjs`): the Night City Map leaf regenerated twice with the new leaf prompt, rendered at its real box (832×610) with the new primitives.

| | Logged live leaf (old prims) | leaf-A | leaf-B |
|---|---|---|---|
| Markers visible inside the map | **0/9** (8 outside the box) | 10/10 | 9/9 (2 flagged "covered" are route waypoints drawn at the same point; visible in `before.png`) |
| Held children passed directly | yes | yes | yes |
| Real click → `onSelect` | — | yes | yes; the marker goes `default` → `tracked` |
| Time, output | — | 46s, 4.5k | 44s, 4.5k |

So in the live Cyberpunk UI, no quest or fast-travel marker was ever on screen.

## QC pass on the prompt combinations
Every variant was re-read as rendered (primitive: base / companions / holder / held; leaf with and without a holder; hoist). Fixed:
- **HELD (primitive):** a held type's box is the holder's whole surface, which SIZE-FLUID ("fills whatever slot") and FLOOR ("no fixed size larger than the floor") didn't cover. Both held markers resolved it by guessing 2.6rem against a 2rem floor. The rule now says: point elements are drawn at their FLOOR in rem, and spanning elements stretch with the box. Re-run (`qc-prims-A/B`): both markers are exactly the floor, the probe still reads 0–0.7px drift, and click and hover work 2/2.
- **HELD LAYERS (primitive):** the clauses are reordered so the layer's two jobs read in sequence; "anything around it" is now "any of its ancestors" (siblings may stay pointer-events-none); and "no other content" is now "draw only what your props supply" (so a map still draws its districts).
- **HELD LAYERS (leaf):** held primitives "need no slot of their own", which resolves them against PRIMITIVE SLOTS ("every primitive needs a definite box"). Both regenerated leaves had already budgeted correctly.
- **Reverted: held types out of the SIZE BUDGET.** The QC pass also removed held types' floors from the budget. The first live run on the new code (task-1790488443585) showed why that was wrong: `EquipmentSlot` was held by `BodyDiagram` but also used standalone, so the filter hid its floor from every leaf. Weapon & Gear Loadout then guessed 2.9rem slots against a 4rem floor, and the slot cards overlapped in the render. With the filter removed, the leaf regenerated twice (`held/weapon/A,B`) budgets slots at 4 and 4.25rem, reflows them into two columns, and nothing overlaps. Held uses are covered by the leaf wording alone ("they need no slot of their own").
- **HELD TYPES (hoist):** "only for elements placed in the surface's own coordinates — never for a layout container", so the rule can't be read as licence for Panel-style container types.

**Structural (`[]`) path.** Also re-read, and three things fixed:
- **Leaf protocol.** It said a structural feature "has no element of its own", while the hoist said the generator "builds that structure itself". Both now say the leaf builds the arrangement, including anything drawn to show it (connecting lines, grouping, dividers), and it has no primitive of its own. That also keeps the hoist from inventing a connector type.
- **All-structural leaf** (no feature mapped to a type). It got the primitives-only rules and a SIZE BUDGET with an empty floors header. `needsHandBuiltRules` is now true when no feature has a type, and the empty header is replaced by one line.
- **Evidence.** The Skill Tree leaf was regenerated twice (`skilltree-A/B`, rendered beside `skilltree-logged`). All three draw the same structure: a spine per attribute column plus tier rungs, built from divs. The earlier cross-reference claim that the logged leaf drew no branches came from counting `<svg>` elements, and was wrong. The rewording removes a contradiction between the two prompts but doesn't visibly change the output.

Left as is (noted, not a wording problem): held point elements scale with the holder's zoom (see below), and Tooltip uses `children` as the element it wraps rather than as face content.

## Second holder pattern: placement and units (2026-09-26)
The first live run on the new code (task-1790488443585, pinned as `cyberpunk-dashboard.run1.jsonl`) produced a second holder unprompted: `BodyDiagram` holds `EquipmentSlot`. Its body figure rendered **no slots**. The leaf gave regions in 0–1, BodyDiagram drew in 0–100 SVG units and clamped, so all 8 slots piled into one corner. The contract said `x: number`, with no unit. BodyDiagram also placed children by pairing them with its regions by index, and the HELD rule assumed children place themselves.

**Change: three clauses in the existing rules, no new rule or switch** (about +85 tokens on the hoist and holder prompts, +0 on held):
- **HOIST, HELD TYPES:** the holder's description states the coordinate unit and how each held element is placed: by its own position prop, or by the surface matching the element's id prop to its own data.
- **Primitive, HELD LAYERS:** a holder that places children from its own data matches each by its id prop and wraps it in a box at that position.
- **Primitive, HELD:** one rule for both cases, picked by the agent's own contract. With its own position, its box is the whole surface (point at its FLOOR, spanning stretches); otherwise it fills the box the surface gives it. Pointer pass-through and stopPropagation either way.

**Results** (`model-exp/placement/`):
- **Re-hoist 2/2:** valid on the first attempt, and every holder description names its unit ("normalized 0-1"). Given the choice, both hoists made the body slots **self-placed** with an optional position prop, which keeps the slot usable in ordinary grids and avoids index pairing.
- **Primitives from hoist A:** 19/19 first-try, 58s, $2.24.
- **Leaves** (Cyberware + Map, ×2, probed with `leaf-map-probe.mjs --held=<Type>`): every body slot sits on its region and a real click selects it (`selected` false → true). Map markers render on their districts and clicks reach `onSelect`. The flagged markers are covered by the leaf's own legend/zoom panel at the map edge, or share a point with another marker. That's layout, not layering.

## Deterministic placement mode and render check (2026-09-26)
**Disagreement risk.** The held type decided who places it from its contract, while the holder decided from the hoist's free-text description, since it can't see the held type's props. A mismatch meant double placement or none. Now:
- **`heldPlacement` (helpers.ts)** decides once, from the contracts. A held type with its own coordinates (`x`/`y`, a position, or points) is **self**-placed; otherwise it's **surface**-placed.
- **Both agents get the same sentence as a switch.** `primHolds(places)` says either "each child places itself — never position the children yourself" or "you place X yourself: match each child by its id…". `primHeld(holders, selfPlaced)` says either "place yourself at your own position" or "the surface sizes and places your box". These replace the two self-judged conditionals; no rule was added.
- **`validateHoist`** rejects a holder whose description states no unit, and a surface-placed held type whose holder has no data prop listing ids with x/y ("nothing places it").

**Render check (`app/utils/placementCheck.ts`, run by `checkPrimitive` inside the retry loop).** It evaluates the primitive with stub hooks into a plain element tree (no DOM, no React renderer; if it can't evaluate, it skips rather than rejects), gives it a probe position (0.37, 0.61) in the holder's declared unit, and reads the positions it renders (CSS % or SVG coordinates against the viewBox):
- a self-placed held type must land at 37% / 61%;
- a holder must render its children, outside any pointer-events-none box;
- a surface-placed holder must put a child matched to its data entry at 37% / 61%.

**Validation, no model calls:** 20/20 as expected. The 17 probe-verified good primitives pass. The 3 known-bad ones fail with the right reason: the live MapCanvas and base-A (children unclickable), and the live BodyDiagram (0–1 input clamped in a 0–100 frame). A synthetic wrong-unit marker (`* 100` removed) is caught too. Re-generating the held family with the new sentences and the check in the loop: 5/5 first-try, $0.72. With the new EquipmentSlot, the Cyberware leaf places the body slots on their regions, the standalone grid slots fill their cells, and clicks select them.

## Not covered
- **Held point elements grow with zoom.** The layer sits inside the holder's `scale()` transform, so a marker at 2.5× zoom is drawn 2.5× larger. Sizing and offsetting the layer (width = zoom × 100%) instead of scaling it would keep point sizes constant. That's a behaviour change to test, not a rewording.
- Samples are small (2 per condition). Only one UI has a holder, so the hoist needs more tasks with surfaces (a graph editor, a floor plan) before the rule is trusted broadly.
- The Tooltip `anchor` unit and the free-string `rarity` are separate hoist gaps (a unit or union in the contract), untouched here.
- The post-processor's face-children pass still treats a holder's lowercase children as face content. Leaves pass held primitives directly, so it hasn't mattered, but a wrapper would get its sizing classes stripped.
- Cost of this investigation: about $8.5 in harness calls. A likely Fast Refresh rerun of the live task in the open tab isn't included (see memory).
