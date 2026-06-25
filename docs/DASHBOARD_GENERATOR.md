# Dashboard Generator — Handoff Doc

Context for continuing work on dash-ui's **task → dashboard** auto-generation feature.
Written as a starting point for a new chat.

---

## 1. What dash-ui is

A spatial canvas where you drag to create boxes; each box picks a component type
(or a custom name), and an LLM generates a React component rendered in a Sandpack
iframe. Customizations toggle features per box.

- **Manual flow (pre-existing):** drag a box → pick a type in `ComponentSelector` /
  toggle customizations in `CustomizationSelector` → `buildInstructions` →
  `handleSend` → `/api/generate` streams the component code.
- **Auto flow (the feature this doc covers):** type a high-level task in the
  bottom Taskbar → the app plans, lays out, and fills the visible window with
  self-generating boxes.

### Codebase gotchas (read first)
- **Modified Next.js.** `AGENTS.md`: "This is NOT the Next.js you know" — read
  `node_modules/next/dist/docs/` before writing Next-specific code. App Router.
- Route handlers return `Response.json(...)`. Anthropic SDK. Models split by
  route: **plan** + **layout** run `claude-opus-4-8` (plan also sets adaptive
  thinking + `effort: "medium"`); **spec** + **generate** run `claude-sonnet-4-6`.
  **generate streams**; plan/spec/layout are non-streaming. API key env var:
  `CLAUDE_API_KEY`. All system prompts live in `app/api/SKILLS.ts`.
- Grid constants in `app/utils/spec.ts`: `numGridBlocksWide = 30`,
  `numVHTall = 250`. **The grid is 250vh — taller than the viewport.** "Visible
  window" for layout = `floor(window.innerHeight / gridBlockSize)` rows.
- `defaultSpec` is the shared component registry. `CompSpec.specArrIdx` is
  **positional** (indices into `specArr`) — fragile if a registry entry is replaced.
- **State-commit-on-`await` is load-bearing** (see §4, risk 1).
- Use the Read tool (not `cat`/`grep`) as source of truth — terminal output garbles.

---

## 2. The auto-generation pipeline

User submits task in Taskbar → `page.tsx` sets `taskRequest {prompt, id}` →
`SpatialGrid` effect (keyed on `taskRequest.id`) runs `runDashboardGeneration`:

1. **PLAN** — `POST /api/plan {task}` → `DefaultCompSpec[]`. Functionality-aware
   presets; decides single vs. multiple components.
2. **REGISTER** — `setDefaultSpec(prev => [...prev, ...specs])`. The `await` in
   step 3 lets this commit *before* any box is created.
3. **LAYOUT** — compute `cols = 30`, `rows = floor(innerHeight / gridBlockSize)`.
   - **Single component:** skip the layout route — place it centered at a quarter
     of the window (`floor(cols/2) × floor(rows/2)`).
   - **Multiple components:** `fetchValidLayout` → `POST /api/layout
     {task, components, cols, rows, previousError}` → `Placement[]`. Validated +
     retried (see §4, risk 3).
4. **PLACE** — `setElementArr(append)` boxes carrying `autoName` + coords.
5. **SELF-GENERATE** — each `GeneratedBox` with `props.autoName` runs a mount
   effect → `handleUpdateNameAndSend(autoName)` → finds spec in registry →
   `buildInstructions` → `handleSend` → `/api/generate` stream.

---

## 3. Files

**New**
- `app/api/plan/route.ts` — planner route (task → `DefaultCompSpec[]`).
- `app/api/layout/route.ts` — layout route (specs + grid → `Placement[]`).
- `app/api/SKILLS.ts` — **consolidated** system prompts for every route
  (`PLAN_/LAYOUT_/SPEC_/GENERATE_SYSTEM_PROMPT`). The planner and layout prompts
  were added here, not in per-route `prompt.ts` files.

**Changed**
- `app/utils/spec.ts` — added `autoName?: string` to `GeneratedBoxProps`; added `Placement` type.
- `app/utils/helpers.ts` — added `validateLayout(placements, cols, rows)`.
- `app/components/Taskbar.tsx` — `onGenerate` + Enter submit; input is
  `disabled` and shows "Currently Designing Layout…" while `isDesigning`.
- `app/page.tsx` — owns `taskRequest` and `isDesigning` (lifted so Taskbar +
  grid share them).
- `app/components/SpatialGrid.tsx` — `runDashboardGeneration`, `fetchValidLayout`;
  new props `taskRequest`, `setIsDesigning`.
- `app/components/GeneratedBox.tsx` — auto-generate mount effect from `props.autoName`.
- `next.config.ts` — `reactStrictMode: false` (see §4).

**Key types**
```ts
GeneratedBoxProps = { colStart, colEnd, rowStart, rowEnd, key, autoName? }
DefaultCompSpec  = { name, genInstructions, spec: { specArr: string[], defaultSpecArrIdx: number[] } }
CompSpec         = { name, specArrIdx: number[] }   // specArrIdx = positional indices into specArr
Placement        = { name, colStart, colEnd, rowStart, rowEnd }
```

**Coordinate convention:** 1-indexed, **inclusive**. A box occupies
`colStart..colEnd` and `rowStart..rowEnd`. Render maps via
`gridColumn: blockPos.x / (blockPos.x + 1 + blockDim.x)` where
`blockDim = colEnd - colStart`. Layout output must tile the `cols×rows` window
exactly (adjacent boxes start at prev `End + 1`).

---

## 4. Design decisions & reasoning (the "6 risks")

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
   preference. Works in **block units**, **visible window only**. A **single**
   component bypasses the route (and thus validation) — it's deterministically
   centered at quarter-window size, so there's nothing to tile.
4. **Always-new, colon-namespaced names** (`"Theme: Specific Component"`, e.g.
   `"Music Player: Now Playing Bar"`). The grid only *appends* to the registry,
   never replaces — avoids breaking positional `specArrIdx` and existing boxes.
   **No cross-run dedup yet** (deliberately deferred; repeat identical themes can
   collide and `.find()` grabs the first).
5. **Reuse `GeneratedBoxProps` / `Placement`**, not parallel shapes.
6. **Functionality-critical customizations must be in `defaultSpecArrIdx`** (a
   planner-prompt rule) — because `handleUpdateNameAndSend` seeds `specArrIdx`
   from `defaultSpecArrIdx`, and `buildInstructions` lists everything *not* active
   as an explicit "do NOT include."

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

## 5. Open items / caveats

- **Not run live end-to-end yet.** Exact-tiling layout is the riskiest part —
  watch console for `Layout attempt N/3 invalid: …`.
- `buildInstructions` emits e.g. `Create a Music Player: Now Playing Bar. …` —
  the colon prefix rides into the generate prompt (acts as helpful context; strip
  if undesired).
- **Pre-existing lint errors** (newer react-hooks plugin, severity `error` but
  non-blocking):
  - `react-hooks/refs` — refs read/written during render (SpatialGrid drag-box
    render path; GeneratedBox `blockPosLiveRef`/`resizeRectLive` mirror-in-render).
    These are real smells; ideally move ref touches into effects/handlers.
  - `react-hooks/set-state-in-effect` — pre-existing `interactMode` effect + the 2
    new effects (auto-gen, task-trigger). Intentional → suppress-with-rationale
    candidates.
- Registry grows with prefixed entries; they also appear in the manual
  `ComponentSelector` dropdown (no filtering). Deferred.
- **Future: min-size-per-component.** Discussed approach — add optional
  `minBlockDim: XY` to `DefaultCompSpec`, clamp resize in `GeneratedBox`
  (`handleResizeUp`). Keep it a *container* constraint; do NOT put minimums in the
  generate prompt (reintroduces the shrink-floor → overflow → clip chain).

---

## 6. Related recent tweaks (not the generator, but touched)

- **Generate prompt** (`GENERATE_SYSTEM_PROMPT` in `app/api/SKILLS.ts`) sizing
  rules: `min-w-0` (horizontal shrink), tables `table-fixed w-full`, "NO SHRINK
  FLOORS", "RESPOND TO BOTH AXES INDEPENDENTLY", "FILL THE CONTAINER" (no floating
  content in dead space), "IGNORE PLACEMENT WORDS" (bar/sidebar/header describe the
  box's canvas position, not internal anchoring), "NEVER SCROLL OR FOCUS THE PAGE",
  legible stacked-text rows, no viewport-anchored/`fixed`/modal/portal, fixed
  `classname`→`className` typo.
- **Theme** (`app/globals.css`): `--color-bgdarkblue` renamed `--color-canvas`;
  darker canvas, stronger dots, brighter/faster loading shimmer; `--shadow-custom`
  fixed to use `color-mix` instead of the nonexistent `--color-borderactive-50`.
- **`defaultSpec.ts`** Data Table `genInstructions` got explicit
  `table-fixed`/truncate guidance.
