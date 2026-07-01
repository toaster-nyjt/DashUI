import { CompSpec, DefaultCompSpec, Placement, Connectivity } from "./spec";

// One directed runtime link between two leaves of a UI, derived DETERMINISTICALLY
// (app-side, not by the LLM) from the planner's connectivity so the emit/subscribe
// channel string can never mismatch. `id` is the channel key both endpoints use.
export type WireChannel = { id: string; from: string; to: string; description: string };

// Strip markdown code fences from generated code
export function stripCodeFences(code: string): string {
  // Remove opening fence: ``` optionally followed by a language tag (tsx, json, ...)
  let stripped = code.replace(/^```[a-z]*\s*\n?/i, "");
  // Remove closing fence: ```
  stripped = stripped.replace(/\n?```\s*$/i, "");
  return stripped;
}

// Pull the component code out of a generate-route response that may carry a
// reasoning preamble and/or a markdown fence anywhere (thinking-off models can
// prepend prose despite the "code only" rule). See UI_GENERATOR.md §7.
export function extractComponentCode(raw: string): string {
  // Code inside a fence: take the FIRST fenced block's contents, bounded by its
  // closing fence — so a preamble, trailing prose, AND any later blocks all drop.
  // Closing fence not streamed in yet -> take to end (streaming-safe).
  const open = raw.match(/```[a-z]*\n/i);
  if (open) {
    const after = raw.slice(open.index! + open[0].length);
    const close = after.search(/\n```/);
    return close === -1 ? after : after.slice(0, close);
  }
  // No fence: drop any leading prose by starting at the first import/export.
  const start = raw.search(/^(import |export )/m);
  return start > 0 ? raw.slice(start) : stripCodeFences(raw);
}

// Layer between spec and the routes, essentially just does the deterministic array caluculations instead of passing it to the LLM
// Seperates the spec field into explicit include and exclude lists
export function resolveComponentSpec(compSpec: CompSpec, defaultSpec: DefaultCompSpec[]): string {
  const def = defaultSpec.find((d) => d.name === compSpec.name); // Full spec for this box's chosen type
  if (!def) return '{}'; // Unreachable, for ts type safety

  // Indices of active customizations -> their names (features to implement)
  const include = compSpec.specArrIdx
    .map((i) => def.spec.specArr[i])
    .filter(Boolean);

  // Every customization NOT chosen -> deliberately excluded features
  const exclude = def.spec.specArr.filter((_, i) => !compSpec.specArrIdx.includes(i));

  // role + connectivity are added without restructuring the existing shape. They
  // are undefined for manual/preset boxes, so JSON.stringify drops them and those
  // boxes emit exactly the previous { name, genInstructions, include, exclude }.
  return JSON.stringify({
    name: def.name,
    genInstructions: def.genInstructions,
    role: def.role,
    connectivity: def.connectivity,
    include,
    exclude,
  });
}

// Validates the connectivity wiring in a planner result: every effector/target
// connection must reference a sibling component by EXACT name (and never itself).
// Connection names are the join key used by layout (adjacency) and the future
// path/wiring route, so a dangling name silently breaks those. Returns the first
// violation so it can be fed back to the planner on retry (see fetchValidPlan).
export function validateConnectivity(specs: DefaultCompSpec[]): { ok: boolean; error?: string } {
  const names = new Set(specs.map((s) => s.name));

  for (const s of specs) {
    const edges = [
      ...(s.connectivity?.effectors ?? []).map((c) => ({ c, kind: "effector" })),
      ...(s.connectivity?.targets ?? []).map((c) => ({ c, kind: "target" })),
    ];
    for (const { c, kind } of edges) {
      if (!c?.name) {
        return { ok: false, error: `"${s.name}" has a ${kind} connection with no "name".` };
      }
      if (c.name === s.name) {
        return { ok: false, error: `"${s.name}" lists itself as a ${kind} connection — a component cannot connect to itself.` };
      }
      if (!names.has(c.name)) {
        return { ok: false, error: `"${s.name}" has a ${kind} connection to "${c.name}", which is not one of this UI's component names. Every connection "name" must exactly match another component's "name".` };
      }
    }
  }

  return { ok: true };
}

// Validates a layout-route result: every block of the cols x rows window must be
// covered by exactly one placement (no overlaps, no gaps, in bounds). Returns the
// first violation found so it can be fed back to the LLM on retry. Coords are
// 1-indexed and inclusive, matching GeneratedBoxProps.
export function validateLayout(placements: Placement[], cols: number, rows: number): { ok: boolean; error?: string } {
  if (!Array.isArray(placements) || placements.length === 0) {
    return { ok: false, error: "no placements returned" };
  }

  // occ[r][c] = times block (r,c) is covered; sized +1 for 1-indexed access
  const occ: number[][] = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));

  for (const p of placements) {
    if (
      p.colStart < 1 || p.rowStart < 1 ||
      p.colEnd > cols || p.rowEnd > rows ||
      p.colStart > p.colEnd || p.rowStart > p.rowEnd
    ) {
      return { ok: false, error: `"${p.name}" is out of bounds or inverted: cols ${p.colStart}-${p.colEnd}, rows ${p.rowStart}-${p.rowEnd} (grid is ${cols} cols x ${rows} rows).` };
    }
    for (let r = p.rowStart; r <= p.rowEnd; r++) {
      for (let c = p.colStart; c <= p.colEnd; c++) {
        if (occ[r][c]) {
          return { ok: false, error: `Overlap at row ${r}, col ${c} (involving "${p.name}"). No block may belong to two components.` };
        }
        occ[r][c] = 1;
      }
    }
  }

  // Any uncovered block is a gap
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      if (!occ[r][c]) {
        return { ok: false, error: `Gap at row ${r}, col ${c} — every block in the ${cols}x${rows} grid must be covered exactly once.` };
      }
    }
  }

  return { ok: true };
}

// Dev-only: dump the full current component registry (defaultSpec) to the console
// with ALL fields, so you can watch it grow as the planner / custom-spec route
// append presets.
export function logDefaultSpec(defaultSpec: DefaultCompSpec[]): void {
  if (process.env.NODE_ENV === "production") return; // dev log only
  console.log(`[defaultSpec] ${defaultSpec.length} component(s):`, JSON.stringify(defaultSpec, null, 2));
}

// Derive the deterministic channel list for a UI from its components' connectivity.
// Each planner "target" (an OUTGOING edge owner -> target) becomes one channel the
// owner emits on and the target subscribes to; id = "<owner>-><target>". Edges to a
// name that isn't in this UI are dropped, and duplicate ids are collapsed. Keeping
// this in JS (not the LLM) guarantees both endpoints agree on the exact channel key.
export function buildChannels(components: { name: string; connectivity?: Connectivity }[]): WireChannel[] {
  const names = new Set(components.map((c) => c.name));
  const byId = new Map<string, WireChannel>();
  for (const c of components) {
    for (const t of c.connectivity?.targets ?? []) {
      if (!t?.name || t.name === c.name || !names.has(t.name)) continue; // dangling/self -> skip
      const id = `${c.name}->${t.name}`;
      if (!byId.has(id)) byId.set(id, { id, from: c.name, to: t.name, description: t.description });
    }
  }
  return [...byId.values()];
}

// Validate a Path-route result: every channel's emitter and subscriber must actually
// reference the channel id in its returned code (a light proxy for "the bus.emit /
// bus.on call was injected"). Returns the first violation to feed back on retry. The
// channel id contains "->", so a stray textual match is very unlikely.
export function validateWiring(wired: { name: string; code: string }[], channels: WireChannel[]): { ok: boolean; error?: string } {
  const codeByName = new Map(wired.map((w) => [w.name, w.code]));

  for (const ch of channels) {
    const fromCode = codeByName.get(ch.from);
    const toCode = codeByName.get(ch.to);
    if (fromCode === undefined) return { ok: false, error: `No wired code returned for "${ch.from}".` };
    if (toCode === undefined) return { ok: false, error: `No wired code returned for "${ch.to}".` };
    if (!fromCode.includes(ch.id)) {
      return { ok: false, error: `"${ch.from}" must publish on channel "${ch.id}" via bus.emit("${ch.id}", ...), but its returned code never references that channel id.` };
    }
    if (!toCode.includes(ch.id)) {
      return { ok: false, error: `"${ch.to}" must subscribe on channel "${ch.id}" via bus.on("${ch.id}", ...), but its returned code never references that channel id.` };
    }
  }

  return { ok: true };
}