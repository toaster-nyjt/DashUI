# Dashboard Generator — Handoff Doc

Primary orientation doc for dash-ui. Its focus is the **task → dashboard**
auto-generation feature, but it also documents the conventions and subsystems a
new contributor needs before touching anything (the **component-spec contract**
in §3 is now codebase-wide, not generator-only). Read §1 + §3 before writing code.

---

## 1. What dash-ui is

A spatial canvas where you drag to create boxes; each box picks a component type
(or a custom name), and an LLM generates a React component rendered in a Sandpack
iframe. Customizations toggle features per box.

- **Manual flow (pre-existing):** drag a box → pick a type in `ComponentSelector` /
  toggle customizations in `CustomizationSelector` → `resolveComponentSpec` →
  `handleSend` → `/api/generate` streams the component code.
- **Auto flow (the feature this doc covers):** type a high-level task in the
  bottom Taskbar → the app plans, lays out, and fills the visible window with
  self-generating boxes.

Both flows converge on the same endpoint: a box's spec is resolved to JSON by
`resolveComponentSpec` and streamed through `/api/generate` (see §3).

### Codebase gotchas (read first)
- **Modified Next.js.** `AGENTS.md`: "This is NOT the Next.js you know" — read
  `node_modules/next/dist/docs/` before writing Next-specific code. App Router.
- Route handlers return `Response.json(...)`. Anthropic SDK. Models split by
  route: **plan** + **layout** + **style** run `claude-opus-4-8` (plan also sets
  adaptive thinking + `effort: "medium"`); **spec** + **generate** run
  `claude-sonnet-4-6`. **generate streams**; plan/spec/layout/style are
  non-streaming. API key env var: `CLAUDE_API_KEY`. All system prompts live in
  `app/api/SKILLS.ts`.
- **Component-spec contract (§3).** Every route that *consumes* a component
  receives the whole spec as JSON; a shared `COMPONENT_SPEC_PROTOCOL` string tells
  the model how to parse it. Don't pass bare names or hand-built sentences.
- Grid constants in `app/utils/spec.ts`: `numGridBlocksWide = 45`,
  `numVHTall = 250`. **The grid is 250vh — taller than the viewport.** "Visible
  window" for layout = `floor(window.innerHeight / gridBlockSize)` rows.
- **Nested boxes / grouping is the latest major feature — see §8.** A generated
  dashboard is now ONE parent "group" box that contains its components as nested
  children; selection is a `selectionPath`; right-click ungroups. §2/§4/§5 are
  annotated where §8 supersedes them.
- `defaultSpec` is the shared component registry. `CompSpec.specArrIdx` is
  **positional** (indices into `specArr`) — fragile if a registry entry is replaced.
- **State-commit-on-`await` is load-bearing** (see §5, risk 1).
- Use the Read tool (not `cat`/`grep`) as source of truth — terminal output garbles.

---

## 2. The auto-generation pipeline

> **Updated by §8 (nested boxes).** The pipeline now produces ONE parent **group**
> box containing the components as children, optionally targeted at a drawn box.
> Grouping/targeting/sizing details are in §8; the route-level flow is below.

User submits task in Taskbar → `page.tsx` sets `taskRequest {prompt, id}` →
`SpatialGrid` effect (keyed on `taskRequest.id`) runs `runDashboardGeneration(task, target)`:

0. **BOUNDS + AREA** — compute the target region (a selected `isEmpty` box, else the
   visible window) and its pixel size (`w/h × gridBlockSize`), *before* planning.
1. **PLAN** — `POST /api/plan {task, width, height}` → `DefaultCompSpec[]`. The
   planner scales component count to the available pixel area (§8).
1b. **STYLE** — `POST /api/style {task, components}` → `{ style: string }` — ONE
   coherent visual identity for this whole UI (§9). `components` is the planner
   specs *resolved* through `resolveComponentSpec` (active set = each preset's
   `defaultSpecArrIdx`), so the styler sees the same protocol view the generator
   will. Always called on the auto path.
2. **REGISTER** — `setDefaultSpec(prev => [...prev, ...specs])` **and**
   `setStyleSpec(prev => ({ ...prev, [taskRequest.id]: style }))`. The `await` in
   step 3 lets both commit *before* any box is created.
3. **LAYOUT** — tile the region interior `w × h`.
   - **Single component:** skip the layout route — it **fills** the box (`1..w / 1..h`).
   - **Multiple components:** `fetchValidLayout` → `POST /api/layout
     {task, components, cols=w, rows=h, previousError}` → `Placement[]` (LOCAL coords).
     `components` is the **full `DefaultCompSpec[]`** (not names). Validated + retried.
4. **PLACE** — `runDashboardGeneration` *returns* ONE parent group box (placements
   become its `children`, carrying local coords + `autoName`); the effect appends it
   to `elementArr`, replacing the targeted empty box if any. (§8)
5. **SELF-GENERATE** — each leaf `GeneratedBox` with `props.autoName` runs a mount
   effect → `handleUpdateNameAndSend(autoName)` → finds spec in registry →
   `resolveComponentSpec` → `handleSend` → `/api/generate` stream.

---

## 3. The component-spec contract  ← read this before touching routes/specs

**Standard:** any route that *consumes* component info takes the **whole spec as
JSON**, never bare names or a hand-built instruction sentence. A single shared
protocol string, `COMPONENT_SPEC_PROTOCOL` (in `app/api/SKILLS.ts`), documents the
JSON schema; each consuming route **appends it to its system prompt**, and the
route's base prompt says "follow the protocol to parse client content." The
protocol is **pure schema** — what to *do* with the spec lives in each route's own
system prompt.

**`resolveComponentSpec(compSpec, defaultSpec)`** (`app/utils/helpers.ts`) is the
single client-side resolver. It replaced the old `buildInstructions` (which built
a prose sentence). It:
- finds the box's `DefaultCompSpec` by name,
- maps `compSpec.specArrIdx` → active feature names (`include`),
- takes every *other* feature in `specArr` as `exclude`,
- returns `JSON.stringify({ name, genInstructions, include, exclude })`.

That JSON string is what `handleSend` sends as the user message to `/api/generate`.

**Wiring per route:**
- **generate** — `system = GENERATE_SYSTEM_PROMPT + COMPONENT_SPEC_PROTOCOL +
  sizeNote`; the user message *is* the `resolveComponentSpec` JSON. All three
  `GeneratedBox` call sites pass `fresh = true`, so generation is single-shot from
  the spec each time (no multi-turn history in this path).
- **layout** — receives the full `DefaultCompSpec[]`; `system =
  LAYOUT_SYSTEM_PROMPT + COMPONENT_SPEC_PROTOCOL`. Uses `name` + `genInstructions`
  (to judge each component's role/size) and ignores other fields.
- **plan** & **spec** are **exempt** — they *create* specs (from a task / a custom
  name); there's no existing component to receive.

**Why resolution stays client-side (and is NOT pushed into the protocol):** the
index→name mapping is trivial but the *deterministic* part of the job. Moving it
into the LLM (i.e. shipping `specArr` + active indices and asking the model to
resolve them) would put off-by-one / miscount risk on the **no-thinking** generate
path, with **no validation net** (unlike layout, which has `validateLayout`).
`specArr` is also not bounded — the custom-customization feature appends to it
([GeneratedBox] `handleUpdateSpecAndSend`), so arrays grow over a session. So the
client does the reliable array math; the protocol owns only the schema + the
include/exclude *semantics*. (This was the "Option A vs B" decision — **B** chosen:
ship resolved `include`/`exclude`, not raw indices.)

**`include`/`exclude` semantics** (ties to §5, risk 6): `include` = features to
implement; `exclude` = every other feature in the spec, which must **never render
in any form**. This is what enforces `GENERATE_SYSTEM_PROMPT`'s "don't add features
you weren't asked for" rule for toggled-off customizations.

---

## 4. Files & codebase map

**Component-spec refactor (most recent work)**
- `app/utils/helpers.ts` — `resolveComponentSpec` (replaced `buildInstructions`);
  also holds `stripCodeFences`, `validateLayout`.
- `app/api/SKILLS.ts` — added shared `COMPONENT_SPEC_PROTOCOL`; `GENERATE_` and
  `LAYOUT_SYSTEM_PROMPT` now point at it.
- `app/api/generate/route.ts` / `app/api/layout/route.ts` — append the protocol;
  layout takes full specs.
- `app/components/GeneratedBox.tsx` — 3 call sites now use `resolveComponentSpec`.
- `app/components/SpatialGrid.tsx` — `fetchValidLayout` sends `specs` (full), not
  `specs.map(s => s.name)`.

**Generator feature (earlier work)**
- `app/api/plan/route.ts` — planner route (task → `DefaultCompSpec[]`).
- `app/api/layout/route.ts` — layout route (specs + grid → `Placement[]`).
- `app/utils/spec.ts` — `autoName?: string` on `GeneratedBoxProps`; `Placement` type.
- `app/components/Taskbar.tsx` — `onGenerate` + Enter submit; disabled "Currently
  Designing Layout…" while `isDesigning`.
- `app/page.tsx` — owns `taskRequest` and `isDesigning` (lifted to share with grid).
- `app/components/SpatialGrid.tsx` — `runDashboardGeneration`, `fetchValidLayout`.
- `app/components/GeneratedBox.tsx` — auto-generate mount effect from `props.autoName`.
- `next.config.ts` — `reactStrictMode: false` (see §5).

**Per-file responsibility map (whole app)**
- `app/page.tsx` — root; owns `interactMode`, `taskRequest`, `isDesigning`; renders
  Taskbar + SpatialGrid.
- `app/components/Taskbar.tsx` — bottom prompt bar (task submit) + Interact Mode toggle.
- `app/components/SpatialGrid.tsx` — the canvas: drag-to-create boxes, grid-block
  sizing, **`selectionPath`** selection, Delete/Backspace removal, **right-click
  ungroup menu**, `markNonEmpty` / `syncBounds` / recursive `ungroup`; **owns the
  `defaultSpec` registry**; runs the generator pipeline (§8).
- `app/components/GeneratedBox.tsx` — one box, **recursive**: per-box `compSpec`
  state, move-drag (root only), resize (manual leaf only), popup menu, the `autoName`
  self-generate mount effect, and the **group children-grid vs. Preview** branch;
  calls `resolveComponentSpec` → `handleSend` (§8).
- `app/components/ComponentSelector.tsx` — popup to pick a registry type or type a
  custom name (custom name → `/api/spec`).
- `app/components/CustomizationSelector.tsx` — popup to toggle/add customizations
  once a type is chosen.
- `app/components/Preview.tsx` — Sandpack iframe host + host-side scaling logic.
- `app/utils/spec.ts` — shared types + grid constants.
- `app/utils/helpers.ts` — server-safe pure utils (importable by routes).
- `app/utils/defaultSpec.ts` — `DEFAULT_SPEC` seed registry (Kanban, Data Table,
  Stat Dashboard, Calendar, Chart Panel, Form).
- `app/utils/useGetCode.ts` — `useGetCode` hook: streaming fetch to `/api/generate`,
  message history, `generatedCode` / `isGenerating`.
- `app/api/{plan,style,layout,spec,generate}/route.ts` — the five LLM routes
  (`style` → one coherent visual identity per generated UI, §9).

**Key types**
```ts
GeneratedBoxProps = { colStart, colEnd, rowStart, rowEnd, key, autoName?, children?, isChild?, isEmpty?, styleID? } // children/isChild/isEmpty → §8; styleID → §9
DefaultCompSpec  = { name, genInstructions, spec: { specArr: string[], defaultSpecArrIdx: number[] } }
CompSpec         = { name, specArrIdx: number[] }   // specArrIdx = positional indices into specArr
Placement        = { name, colStart, colEnd, rowStart, rowEnd }

// Wire shape emitted by resolveComponentSpec → /api/generate (see §3):
{ name: string, genInstructions: string, include: string[], exclude: string[] }
```

**Coordinate convention:** 1-indexed, **inclusive**. A box occupies
`colStart..colEnd` and `rowStart..rowEnd`. Render maps via
`gridColumn: blockPos.x / (blockPos.x + 1 + blockDim.x)` where
`blockDim = colEnd - colStart`. Layout output must tile the `cols×rows` window
exactly (adjacent boxes start at prev `End + 1`). **Nested children use coords LOCAL
to their parent's inner grid (`1..w / 1..h`); ungroup converts them to global — §8.**

**Interaction model (non-obvious).** Two modes, shared from `page.tsx`:
- **Meta-edit (default):** the grid handles create/select/move/resize. A
  transparent overlay sits above each box's Sandpack iframe to capture clicks
  (the iframe would otherwise swallow them); while dragging/resizing a full-viewport
  "shield" div above all iframes keeps `mousemove`/`mouseup` reaching `document`.
- **Interact mode:** overlays/borders drop away so the generated component itself
  is interactive; the grid does no meta interaction.
- **Selection / drill-in / right-click ungroup** is the nested-boxes interaction (§8):
  selection is a `selectionPath`, you drill into a group to reach its components, and
  right-click backs out or offers Ungroup.
- **Preview scaling** (`Preview.tsx`): **side**-drag = reflow at a held zoom
  (`sideZoom`), **corner**/window = uniform zoom from a captured `baseSize`. Props
  can't cross the iframe boundary without remounting Sandpack, so all scaling is
  host-side via a `transform: scale()` wrapper. The pre-scale layer is sized
  `(100/scale)%` of the wrapper so the iframe fills it exactly — this also lets the
  leaf `seamBleed` overlap reach the bled edge (see §6 inter-leaf seam fix).

---

## 5. Design decisions & reasoning (the "6 risks")

1. **Async commit before self-gen.** `setDefaultSpec` is queued; the `await
   fetchValidLayout` between it and `setElementArr` guarantees the registry
   commits before boxes mount, so each box's mount effect finds its spec (no
   `/api/spec` re-fetch). The box mount effect *is* the post-commit trigger.
2. **Boxes self-trigger** via the `autoName` mount effect (manual boxes leave
   `autoName` undefined → no-op).
3. **LLM layout reliability** → `validateLayout` checks bounds/overlap/full
   coverage; `fetchValidLayout` retries up to `LAYOUT_RETRIES = 3`, feeding the
   validation error back as `previousError`; `console.error` on each failure;
   returns `null` (no boxes) if exhausted. **No deterministic packer** — user
   preference. Works in **block units**, over the **target region** (a drawn box or
   the visible window — §8). A **single** component bypasses the route (and thus
   validation) — it **fills** the region, so there's nothing to tile.
4. **Always-new, colon-namespaced names** (`"Theme: Specific Component"`, e.g.
   `"Music Player: Now Playing Bar"`). The grid only *appends* to the registry,
   never replaces — avoids breaking positional `specArrIdx` and existing boxes.
   **No cross-run dedup yet** (deliberately deferred; repeat identical themes can
   collide and `.find()` grabs the first).
5. **Reuse `GeneratedBoxProps` / `Placement`**, not parallel shapes.
6. **Functionality-critical customizations must be in `defaultSpecArrIdx`** (a
   planner-prompt rule) — because `handleUpdateNameAndSend` seeds `specArrIdx`
   from `defaultSpecArrIdx`, and `resolveComponentSpec` puts everything *not*
   active into the `exclude` list, which the generate route's
   `COMPONENT_SPEC_PROTOCOL` enforces as "never render in any form."

**Other decisions**
- `reactStrictMode: false` stops dev from double-invoking the one-shot auto-gen
  effect (so `didAutoGen` guard was removed). Tradeoff: disables StrictMode's
  *other* dev checks app-wide.
- `isDesigning` lifted to `page.tsx`. The **disabled Taskbar input is both the
  status indicator and the re-entrancy guard** — the in-function `if (isDesigning)
  return` was removed. (Minor non-atomic race in the sub-frame before the flag
  commits; negligible for human input.)
- `// eslint-disable-next-line react-hooks/exhaustive-deps` added to the
  intentional effects: auto-gen, drag, resize, task-trigger.

---

## 6. Open items / caveats

- `resolveComponentSpec` emits the spec as JSON with e.g. `"name": "Music Player:
  Now Playing Bar"` — the colon prefix rides into the generate prompt via the name
  field (acts as helpful context; strip if undesired).
- **Pre-existing lint errors** (newer react-hooks plugin, severity `error` but
  non-blocking):
  - `react-hooks/refs` — refs read/written during render (SpatialGrid drag-box
    render path; GeneratedBox `blockPosLiveRef`/`resizeRectLive` mirror-in-render).
    These are real smells; ideally move ref touches into effects/handlers.
  - `react-hooks/set-state-in-effect` — several intentional effects (interactMode,
    auto-gen, task-trigger, menu-reopen, isEmpty report, defaultSpec dev-log).
    Intentional → suppress-with-rationale candidates.
- Registry grows with prefixed entries; they also appear in the manual
  `ComponentSelector` dropdown (no filtering). Deferred.
- **Inter-leaf seam fix (`seamBleed`).** In interact mode a thin ~1px gray hairline
  could appear between adjacent leaf tiles inside a group. Diagnosis: `blockSize =
  gridWidth / 45` is fractional, so two adjacent leaf cells share a boundary that
  lands *mid-device-pixel* (worse on fractional-DPR Windows scaling, and it shifts
  with scroll/position — so the seam flickers in and out). That boundary device pixel
  ends up ~50% covered by the component (`zinc-950` = RGB 9,9,11) and ~50% by the
  canvas behind it (`bg-white` in interact mode), blending to RGB(132,132,133) =
  `#848485` — exactly `(255+9)/2`, confirmed with a color picker. It only shows in
  interact mode: meta mode's per-leaf 1px borders inset the content and cover the
  boundary (and the bars there are by design), which is also why every tile appears
  to "grow ~1px" when you switch meta→interact (the border inset goes away).
  - **Why not the earlier attempts:** painting the wrapper a fixed dark color (the
    undefined `var(--bg-secondary)`) would only *hide* it and breaks under dynamic
    styling; making the pre-scale layer `(100/scale)%` alone didn't help because the
    seam is *between* leaf iframes at the cell boundary, not inner-div underfill;
    device-pixel snapping `blockSize` is a moving target across DPR + scroll.
  - **The fix (deterministic, DPR-independent):** make each interact-mode leaf tile
    *overlap* its neighbour by 1px so the boundary pixel is always fully covered by
    the **component's own pixels** (dynamic-styling-safe — no fixed color). Two
    coordinated pieces: (1) `GeneratedBox` sets the leaf content wrapper to
    `calc(100% + 1px)` square via `seamBleed = interactMode && isChild &&
    !hasChildren` — it bleeds right/bottom past the cell (the leaf's outer grid-item
    div doesn't clip; the root group's `overflow-hidden` content mask clips the
    outermost bleed so the silhouette stays clean); (2) `Preview` fills that wrapper
    exactly (`width/height: (100/scale)%`) so the iframe's pixels actually reach the
    bled edge — without this the extra 1px is transparent and covers nothing. Cost: a
    leaf's bottom/right neighbour loses ~1px of edge content under the overlap —
    invisible at tile scale. Excluded for manual standalone boxes (`isChild` false)
    and groups (`hasChildren`), which don't tile.
- **Browser zoom vs. window resize (`devicePixelRatio` guard).** The canvas sizes
  itself by measuring the viewport and re-fitting `gridBlockSize = width / 45` on every
  `resize` event. Browser zoom (Ctrl +/-) shrinks the *CSS-pixel* viewport AND fires
  `resize`, so the listener used to re-fit and instantly cancel the zoom — the browser
  magnified everything for one frame, then React re-pinned the grid to a constant
  physical size: a visible flicker back to 100%. Fix: the resize handler tracks
  `window.devicePixelRatio` (changes on zoom, not on a window resize) and **skips the
  re-fit when dpr changed**, so zoom is left to the browser's native magnification.
  - To make the magnified (zoomed-in) canvas *scrollable* rather than clipped, the
    canvas now has an **explicit px width** (`canvasWidth`, = viewport width at 100%)
    instead of `width:100%`. When zoomed in it's wider than the viewport, so the
    **document** scrolls horizontally — its scrollbar is viewport-anchored. (A plain
    `overflow-x-auto` on the canvas does NOT work: the canvas is 250vh tall so the bar
    lands off-screen at its bottom, and the inner `absolute inset-0 overflow-hidden`
    overlay clips the boxes before any scroll container sees them.)
  - `setGridSize` measures `document.documentElement.clientWidth` (not the canvas div,
    which now has an explicit width — measuring it would be circular) and sets both
    `canvasWidth` and `gridBlockSize` from it.
- **No cross-run dedup yet** (deliberately deferred; repeat identical themes can
  collide and `.find()` grabs the first).
- **Future: min-size-per-component.** Discussed approach — add optional
  `minBlockDim: XY` to `DefaultCompSpec`, clamp resize in `GeneratedBox`
  (`handleResizeUp`). Keep it a *container* constraint; do NOT put minimums in the
  generate prompt (reintroduces the shrink-floor → overflow → clip chain).
- **Future: preserve generated code across ungroup (nested boxes).** Ungrouping a
  generated group (`ungroup` in `SpatialGrid`) currently remounts each freed leaf,
  which re-runs its `autoName` mount effect and re-streams from `/api/generate`.
  To keep the already-generated output, fetch each child's code out of its Sandpack
  frame and inject it into the box's props/code so the freed box renders it directly
  instead of regenerating. (Accepted as remount-for-now during the nested-boxes work.)

---

## 7. Related recent tweaks (not the generator, but touched)

- **Generate prompt** (`GENERATE_SYSTEM_PROMPT` in `app/api/SKILLS.ts`) sizing
  rules: `min-w-0` (horizontal shrink), tables `table-fixed w-full`, "NO SHRINK
  FLOORS", "RESPOND TO BOTH AXES INDEPENDENTLY", "FILL THE CONTAINER" (no floating
  content in dead space), "IGNORE PLACEMENT WORDS" (bar/sidebar/header describe the
  box's canvas position, not internal anchoring), legible stacked-text rows, no
  viewport-anchored/`fixed`/modal/portal, fixed `classname`→`className` typo.
  - **Scrolling policy (`SCROLLING — FIT FIRST, THEN HIDE THE BAR`).** Hierarchy:
    fit all content by right-sizing/condensing to a *legible* size → only if it still
    won't fit, give the specific overflowing region its own `overflow-auto`/`-y-auto`
    → that region MUST hide its bar (`[scrollbar-width:none] [&::-webkit-scrollbar]:hidden`).
    Never a visible scrollbar; never crush or clip to avoid scrolling. This REPLACED
    the old "condense INSTEAD of scrolling" / never-scroll framing. The page-scroll
    ban ("NEVER SCROLL OR FOCUS THE PAGE": no `scrollIntoView`/`window.scrollTo`/
    `.focus`) is a SEPARATE rule, still in force. Mirrored in `sizeNote`
    (`generate/route.ts`).
  - **JSX braces non-negotiable.** Any attribute value that isn't a plain quoted
    string MUST be braced — `className={"a " + cond}`, never `className="a " + cond`
    (a syntax error). Sits beside the no-template-literals-in-JSX rule; added after a
    real malformed-output `SyntaxError`.
- **Theme** (`app/globals.css`): `--color-bgdarkblue` renamed `--color-canvas`;
  darker canvas, stronger dots, brighter/faster loading shimmer; `--shadow-custom`
  fixed to use `color-mix` instead of the nonexistent `--color-borderactive-50`.
- **`defaultSpec.ts`** Data Table `genInstructions` got explicit
  `table-fixed`/truncate guidance.

---

## 8. Nested boxes, path selection & grouping (latest major feature)

A generated dashboard is no longer N sibling boxes — it's **one parent "group" box**
in `elementArr` that *contains* its components as nested children. This section
supersedes the flat-box assumptions in §2/§4/§5 where they conflict.

### Data model (`app/utils/spec.ts`)
`GeneratedBoxProps` gained three fields:
- `children?: GeneratedBoxProps[]` — present on a **group**; the box renders these
  instead of a Preview. Children hold coords **LOCAL** to the parent (`1..w / 1..h`).
- `isChild?: boolean` — true for any box spawned inside a parent (any depth). The one
  top-level box in `elementArr` leaves it false → only it drags + shows the purple
  outline. `isRoot = !isChild`.
- `isEmpty?: boolean` — a manually-drawn box starts `true`; flips `false` the first
  time it generates (`markNonEmpty`, fired by an `isGenerating` effect). Lets
  targeting know it's a drop-target.

### Parent-as-grid rendering (`GeneratedBox`)
A group renders its content area as an inner CSS grid sized to its block dims with
**`repeat(w/h, minmax(0,1fr))`** tracks, mapping each child to a recursive
`<GeneratedBox isChild>`. `1fr` tracks make children scale with the box (and with
`blockSize` on window resize) for free — no pixel math, no resize machinery. Because
the inner tracks equal `blockSize`, a nested child renders **pixel-identical** to
sitting on the main grid (the parent grid is just a re-rooted coordinate frame). A
leaf (no children) renders the Preview + `autoName` self-gen exactly as before.

### Selection is a PATH, not a single id
`SpatialGrid` replaced `selectedID` with **`selectionPath: string[]`** (keys from the
top-level box down to the deepest drilled-in box; `[]` = nothing). Each `GeneratedBox`
gets its own `path` + the global `selectionPath` and derives `onPath` (its path is a
prefix → selection runs through it) and `isFocus` (path ends exactly at it → shows its
menu). A variable-length path is required because a tree selection is a *path*, not a
point — N nesting levels need N "which child here?" slots (2 scalars cap at depth 2).

### Drill-in interaction
- Click an unselected group → selects it (purple). Click a child → **drills in**.
- The shield is the **overlay `pointer-events` toggle** (`overlayActive`): a group's
  overlay catches clicks until it's selected, then goes `pointer-events-none` so
  clicks fall to its children's overlays (one level at a time). A **leaf overlay is
  ALWAYS active** in meta-edit mode — it must always shield its Sandpack iframe
  (gating it on focus was a bug: drilling into one leaf exposed all the others).
- **Drill commits on mouseUP, not mousedown.** A child records its path in a
  module-level `pendingDrillPath` on mousedown; the root commits it in its drag
  `handleMouseUp` **only if `didDrag` is false**. (Drilling on mousedown flashed the
  child's selection/menu during a group-move. The child can't use its own mouseup —
  the drag-shield eats it; only the root's `document` mouseup fires.)
- **Drag + purple outline are root-only** (`isRoot`). A child's mousedown bubbles to
  the root (no `stopPropagation`) so a body-drag moves the whole group; children ride
  along because they're laid out inside it.

### Right-click context menu (`SpatialGrid.handleContextMenu`)
- Drilled in (intermediary/leaf selected) → **clears** the path (backs out).
- Just the root group selected → pops an **"Ungroup" button** at the cursor, over a
  full-workspace **shield** (`absolute inset-0`, follows resize) that absorbs any
  other mouse event (dismiss) so the click can't select/deselect a box.
- All box/grid mousedown handlers early-return on `e.button !== 0`, so right-click
  never leaks into selection/drag; `contextmenu` bubbles to the grid independently.

### Ungroup (recursive)
`ungroup(parent)` → `flattenToGlobal` recursively promotes **every leaf** to a
top-level `elementArr` box at **GLOBAL** coords (`localCoord + each ancestor's origin
offset − 1`), `isChild` cleared. Freed leaves drop onto the main grid (already render
via `gridColumn`). They **remount and re-generate** for now — see §6 (code-hoist).

### Position sync (`syncBounds`) — keeps `elementArr` coords live
A box's live position lives only in `GeneratedBox` state after creation. On drag/
resize end, **every** top-level box (`isRoot`, manual boxes included) calls
**`syncBounds(key, bounds)`** to write its new coords back to `elementArr`, so any
consumer that reads from `elementArr` sees where the box IS, not where it spawned.
Two consumers depend on this:
- **ungroup** — without it, ungrouping a *moved* UI teleported its components back to
  the original spot (this is the load-bearing case for groups).
- **empty-box targeting** (§"Empty-box targeting" below) — `runDashboardGeneration`
  places the generated UI at the target box's `colStart/rowStart/colEnd/rowEnd` read
  from `elementArr`. A manual box that was drawn, then **moved/resized**, then used as
  a generation target relies on these being current — otherwise the UI lands at the
  box's spawn position, not where the user dragged it.

It's gated on `isRoot` (not on "has children"), so it runs for manual boxes too. The
write is harmless when unused: it feeds new `colStart`/etc. props into the same
`GeneratedBox` instance (key unchanged → no remount), but `blockPos`/`blockDim` are
`useState`-seeded from props only at mount and ignore later prop changes, so render
stays driven by the box's own state.

### Empty-box targeting
`runDashboardGeneration(task, target)` takes a **target box** (a selected `isEmpty`
box, found in the effect via `selectionPath[0]`). It places the parent at the
target's bounds and tiles its `w×h` interior; the effect **replaces** the empty box.
No target → fills the visible window. Single-component now **fills** the box (it used
to center at quarter-window — pointless with a wrapper).

### Plan route knows the available area
`runDashboardGeneration` computes the target's pixel size (`w/h × gridBlockSize`) and
sends `{ task, width, height }` to `/api/plan`. `PLAN_SYSTEM_PROMPT` now leads with
"**RESPECT THE AVAILABLE AREA** — only create a new component if there's enough pixel
space for it and every other to stay legible; small area → single component."
(layout reasons in block units, generate in px, plan now also gets px.)

### Styling roles (selection-path colored)
Borders/glows are by role and brighten + thicken + glow when `onPath` (tokens in
`globals.css`; `leafBorderCls` / `groupOutlineCls` in `GeneratedBox`):
- **root group** → purple baseline; brighter purple + outward halo when active.
- **nested sub-group** → white baseline; yellow + inset glow when active (future depth).
- **leaf** → faint-white baseline; green + inset glow when active.
- **manual box** → blue active/inactive (unchanged).
Components inside a UI are **square** (`rounded-none`); the root's content wrapper is a
`rounded-lg overflow-hidden` **mask** that rounds only the UI's outer silhouette.
Sandpack's own radius is zeroed via `!rounded-none` on the `sp-*` classes
(`Preview.tsx`). Resize handles are hidden while a box `isGenerating`.

### Dev helper
`logDefaultSpec(defaultSpec)` (`helpers.ts`, dev-only) JSON-dumps the full registry;
`SpatialGrid` calls it in a `[defaultSpec]` effect (mount + every change).

---

## 9. Per-UI style registry (coherent styling across a generated dashboard)

Every component in a generated UI is produced by a **separate, single-shot**
`/api/generate` call with no knowledge of its siblings — so left alone they drift
apart visually. The **style registry** gives one generated dashboard a single shared
visual identity that every one of its components is generated against.

### The STYLE route (`app/api/style/route.ts`)
- Runs **after PLAN, before LAYOUT** in `runDashboardGeneration` (§2 step 1b). Always
  called on the auto path; lets errors fall to the pipeline's outer `catch`.
- Input: `{ task, components }` where `components` is the planner specs **resolved
  through `resolveComponentSpec`** (active set = each preset's `defaultSpecArrIdx`),
  i.e. the same `{name, genInstructions, include, exclude}` protocol view the
  generator gets per component. `system = STYLE_SYSTEM_PROMPT + COMPONENT_SPEC_PROTOCOL`.
- Output: `{ style: string }` — free-form prose/bullets (NOT JSON), a complete
  visual-style spec (identity, palette, typography, spacing, motion).
- Model: `claude-opus-4-8` (design-stage, like plan/layout). Non-streaming.
- `STYLE_SYSTEM_PROMPT` is intentionally a **starting point** — leads with "Use your
  styling skills for coherency and ease of use"; expect to tune it.

### The registry (`SpatialGrid`)
- `styleSpec: Record<number, string>` — `styleID` (= `taskRequest.id`) → that UI's
  style string. Committed alongside `defaultSpec` (same state-commit-on-`await`
  guarantee, §5 risk 1), so a box finds its style at mount.
- Threaded down to every `GeneratedBox` (like `defaultSpec`); a group passes it to
  its children recursively.

### Threading the style into generation
- `GeneratedBoxProps.styleID?` is set on every **child** of a generated group to
  `taskRequest.id`. Survives ungroup (the leaf keeps its `styleID`, and `styleSpec`
  persists in `SpatialGrid`), so freed/re-generated leaves stay on-style.
- `GeneratedBox.resolveStyle(styleID?)` returns `styleSpec[styleID]` (or `undefined`).
  The auto-gen mount effect calls `handleUpdateNameAndSend(autoName, props.styleID)`;
  **both** generation paths (name+send and customization toggle) pass
  `resolveStyle(...)` into `handleSend(prompt, true, boxSize, style)`, which forwards
  `style` to `/api/generate`.
- **Fallback by absence:** a manual box has no `styleID` → `style` is `undefined` →
  the generate route applies `GENERATE_STYLE_FALLBACK` instead. There is NO failure
  fallback inside the auto pipeline; the fallback exists purely for style-less boxes.

### Generate prompt split (`SKILLS.ts`)
The style sections (DESIGN DIRECTION / COLOR PALETTE / MOTION & FEEDBACK) were
**extracted** out of `GENERATE_SYSTEM_PROMPT` into a standalone `GENERATE_STYLE_FALLBACK`.
`generate/route.ts` builds `system = GENERATE_SYSTEM_PROMPT + COMPONENT_SPEC_PROTOCOL
+ styleBlock + sizeNote`, where `styleBlock` is the per-UI `style` (when present) or
`GENERATE_STYLE_FALLBACK` (when not). The base prompt keeps all structural/sizing
rules + the example output format.
