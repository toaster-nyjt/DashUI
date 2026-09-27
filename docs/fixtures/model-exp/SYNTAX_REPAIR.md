# Deterministic syntax repair (2026-09-27)

**Problem.** Leaves weren't syntax-checked at all: one model slip (a missing `)`) reached Sandpack and blanked the whole box ("Unexpected token, expected ','"). Primitives were checked, but every slip cost a full retry (40–80s on the critical path).

**Fix: `app/utils/syntaxRepair.ts`**, used by the generate route and `primitiveGen`:
1. **Detect:** the TypeScript compiler's diagnostics (`syntaxIssues`).
2. **Repair (no model):**
   - re-quote misplaced `url(#id)` concatenations: `fill={"url(#" + uid + "-glow")}` / `fill="url(#" + uid + "-glow)"` become `fill={"url(#" + uid + "-glow)"}`;
   - then up to 3 single-token edits at the first error: insert `)` `]` `}` `,` or drop a stray character, each kept only if it strictly reduces the error count.

   A repair is kept only if **the whole file then compiles**; code that already compiles is never touched.
3. **Fallback (leaves):** if repair can't fix it, one regeneration with the compile error fed back. The result is sent with `LEAF_REPLACE_MARKER`, and the box shows the shimmer until then. The run log's `leaf:done` records `syntaxRepairs`, or `syntaxRegenerated` / `syntaxStillBroken`; the `primitive` log records `syntaxRepairs`.

**Evidence** (`syntax/corpus.json`: every non-compiling leaf and primitive attempt in all logs, 9 of 103 leaves + all primitive attempts):
- **Repair: 9/9**, each the correct fix:
  - 7 `url(#id)` misquotes (JogWheel ×2, SlipIndicator, Knob, TuningNeedle, PerkNode, ZoomPanControls). Every one of these had cost a primitive retry.
  - 2 leaf missing `)` (Weapon Loadout Rack; Night City Map, the reported error).
- **Safety: 341/341** compiling leaves and primitives from the logs come back byte-identical.
- **Fallback:** a Night City Map leaf cut off at 60% (unrepairable, unclosed JSX) regenerated in 41s into a full component that compiles (`syntax/fallback-regenerated.tsx`).
