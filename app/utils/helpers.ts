import { ComponentInstance, ComponentDef, Placement, Connectivity, HoistResult, PrimitiveType, PrimitiveUse, PrimitiveFloor, PrimitiveSet, LeafFeatures } from "./spec";

// One directed runtime link between two leaves of a UI, derived DETERMINISTICALLY
// (app-side, not by the LLM) from the planner's connectivity so the emit/subscribe
// channel string can never mismatch. `id` is the channel key both endpoints use.
export type WireChannel = { id: string; from: string; to: string; description: string };

// Sent by the generate route after the streamed code when it has a corrected version
// (post-processed, or regenerated after a refusal): everything after it replaces the code.
export const LEAF_REPLACE_MARKER = "\u0000<<<REPLACE>>>\u0000";

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
    // Closing fence may share a line with the last code ("}```").
    const close = after.search(/\n?```/);
    return trimFenceTail(close === -1 ? after : after.slice(0, close));
  }
  // No fence: drop any leading prose by starting at the first import/export.
  const start = raw.search(/^(import |export )/m);
  return trimFenceTail(start > 0 ? raw.slice(start) : stripCodeFences(raw));
}

// Drop a stray trailing fence fragment (a last line starting with backticks, e.g. "`}"),
// which a thin-fenced response can leave behind and which breaks compilation.
function trimFenceTail(code: string): string {
  return code.replace(/\n[ \t]*`{1,3}[^\n`]*`{0,3}[ \t]*$/, "\n").replace(/`{3}[ \t]*$/, "");
}

// Layer between the registry and the routes, essentially just does the deterministic array caluculations instead of passing it to the LLM
// Separates the component's feature list into explicit active + excluded feature lists.
// prims (a generated UI with a primitive library): features come out type-mapped — see
// leafFeatures. Without it (manual boxes, or a UI whose hoist failed) they stay plain names.
export function resolveComponent(instance: ComponentInstance, registry: ComponentDef[], prims?: PrimitiveSet): string {
  const def = registry.find((d) => d.name === instance.name); // Full definition for this box's chosen type
  if (!def) return '{}'; // Unreachable, for ts type safety

  // Indices of active features -> their names (features to implement)
  const activeFeatures = instance.activeIdx
    .map((i) => def.features[i])
    .filter(Boolean);

  // Every feature NOT chosen -> deliberately excluded features
  const excludedFeatures = def.features.filter((_, i) => !instance.activeIdx.includes(i));

  // role + connectivity are added without restructuring the existing shape. They
  // are undefined for manual/preset boxes, so JSON.stringify drops them and those
  // boxes emit exactly { name, genInstructions, features, excludedFeatures }.
  return JSON.stringify({
    name: def.name,
    genInstructions: def.genInstructions,
    role: def.role,
    connectivity: def.connectivity,
    features: prims ? leafFeatures(prims, def.name, activeFeatures) : activeFeatures,
    excludedFeatures,
  });
}

// A leaf's active features mapped to the primitive types it builds them from: the hoist's
// types, [] for a structural feature, and null (build it yourself) for a feature the hoist
// never saw (toggled on later, user-added) or one whose type failed generation.
export function leafFeatures(prims: PrimitiveSet, component: string, active: string[]): LeafFeatures {
  const fmap = prims.hoist.components.find((c) => c.name === component)?.features ?? {};
  return Object.fromEntries(active.map((f) => {
    const types = fmap[f];
    return [f, !types || types.some((t) => !(t in prims.code)) ? null : types];
  }));
}

// The library a leaf can use: every type that generated successfully.
export const leafLibrary = (prims: PrimitiveSet): PrimitiveType[] =>
  prims.hoist.library.filter((t) => t.type in prims.code);

// Validates the connectivity wiring in a planner result: every effector/target
// connection must reference a sibling component by EXACT name (and never itself).
// Connection names are the join key used by layout (adjacency) and the future
// path/wiring route, so a dangling name silently breaks those. Returns the first
// violation so it can be fed back to the planner on retry (see fetchValidPlan).
export function validateConnectivity(defs: ComponentDef[]): { ok: boolean; error?: string } {
  const names = new Set(defs.map((s) => s.name));

  for (const s of defs) {
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

// Dev-only: dump the full current component registry to the console with ALL
// fields, so you can watch it grow as the planner / custom-define route append
// component definitions.
export function logRegistry(registry: ComponentDef[]): void {
  if (process.env.NODE_ENV === "production") return; // dev log only
  console.log(`[registry] ${registry.length} component(s):`, JSON.stringify(registry, null, 2));
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

// The style sheet's fixed chrome heights in rem ("header height: h-9" -> 2.25), for the leaf's
// SIZE BUDGET. The sheet is appearance-only (validateStyleSheet), so a height class on a
// header/footer line is the chrome height. Missing -> undefined.
export function parseChromeHeights(style?: string): { header?: number; footer?: number } {
  const rem = (line?: string) => {
    const m = line?.match(/(?:^|[\s,;("'`])h-(\d+(?:\.\d+)?|\[(\d+(?:\.\d+)?)(rem|px)\])(?=$|[\s,;)"'`.])/);
    if (!m) return undefined;
    return m[2] ? (m[3] === "px" ? +m[2] / 16 : +m[2]) : +m[1] / 4;
  };
  const lines = (style ?? "").split("\n");
  return {
    header: rem(lines.find((l) => /header|title bar/i.test(l) && /\bh-/.test(l))),
    footer: rem(lines.find((l) => /footer|status strip/i.test(l) && /\bh-/.test(l))),
  };
}

// Primitive type names become in-scope JSX identifiers, so they must not shadow React, the
// host's own names, or JS/DOM globals the generated code might use.
const RESERVED_TYPE_NAMES = new Set([
  "React", "Fragment", "Suspense", "StrictMode", "Profiler", "Component", "PureComponent",
  "App", "GeneratedComponent", "FitText",
  "Array", "Object", "String", "Number", "Boolean", "Symbol", "BigInt", "Date", "Math", "JSON",
  "Map", "Set", "WeakMap", "WeakSet", "Promise", "Error", "RegExp", "Proxy", "Reflect", "Intl",
  "Image", "Audio", "Option", "Event", "Node", "Element", "Text", "Range", "Selection",
  "Window", "Document", "File", "Blob", "URL", "Request", "Response", "Headers", "Worker",
  "WebSocket", "AudioContext", "Animation",
]);

// Validates a hoist-route result against the resolved components it was given: every
// component and every feature key present verbatim, every assigned type in the library,
// no unused or duplicate type, valid JSX identifiers. [] (structural) is allowed. Returns
// the first violation to feed back on retry (see fetchValidHoist).
export function validateHoist(result: HoistResult, components: { name: string; features: string[] }[]): { ok: boolean; error?: string } {
  if (!result || !Array.isArray(result.library) || !Array.isArray(result.components))
    return { ok: false, error: `Output must be an object with a "library" array and a "components" array.` };
  const types = new Set<string>();
  for (const t of result.library) {
    if (!t?.type || typeof t.description !== "string" || !t.props || typeof t.props !== "object")
      return { ok: false, error: `Every library entry needs "type", "description" and a "props" object; got ${JSON.stringify(t).slice(0, 120)}.` };
    if (types.has(t.type)) return { ok: false, error: `Library type "${t.type}" is declared twice; type names are unique.` };
    if (!/^[A-Z][A-Za-z0-9]*$/.test(t.type)) return { ok: false, error: `Library type "${t.type}" is not a PascalCase JSX identifier.` };
    if (RESERVED_TYPE_NAMES.has(t.type)) return { ok: false, error: `Library type "${t.type}" shadows a React/host/global name; rename it.` };
    types.add(t.type);
  }
  const used = new Set<string>();
  for (const c of components) {
    const out = result.components.find((o) => o.name === c.name);
    if (!out) return { ok: false, error: `Component "${c.name}" is missing; include every input component by exact name.` };
    const fmap = out.features ?? {};
    for (const f of c.features)
      if (!(f in fmap)) return { ok: false, error: `"${c.name}" is missing feature "${f}"; every feature is a key, copied verbatim.` };
    for (const [f, ts] of Object.entries(fmap)) {
      if (!c.features.includes(f)) return { ok: false, error: `"${c.name}" has unknown feature key "${f}"; keys are exactly that component's "features" entries.` };
      if (!Array.isArray(ts)) return { ok: false, error: `"${c.name}" / "${f}" must map to an array of type names.` };
      if (new Set(ts).size !== ts.length) return { ok: false, error: `"${c.name}" / "${f}" lists a type twice; list each distinct type once.` };
      for (const t of ts) {
        if (!types.has(t)) return { ok: false, error: `"${c.name}" / "${f}" uses "${t}", which is not in the library.` };
        used.add(t);
      }
    }
  }
  for (const t of types)
    if (!used.has(t)) return { ok: false, error: `Library type "${t}" is not assigned to any feature; remove it or assign it.` };
  return { ok: true };
}

// Where each primitive type is used, derived from the hoist's feature map — never
// written by the model and never stored: recomputed whenever the primitive-generation
// route is called, so it can't drift from the map. Gives the primitive generator the
// domain context a generic type name ("TreeSelector") doesn't carry.
export function derivePrimitiveUsage(hoist: HoistResult): Record<string, PrimitiveUse[]> {
  const usage: Record<string, PrimitiveUse[]> = {};
  for (const t of hoist.library) usage[t.type] = [];
  for (const c of hoist.components)
    for (const [feature, types] of Object.entries(c.features))
      for (const t of types) usage[t]?.push({ component: c.name, feature });
  return usage;
}

// Parse + check a generated primitive's floor (primitive route, validate-and-retry).
// Deterministic: the floor must be one-line JSON, in a sane rem range, keyed only by real
// union prop values, and applied on the root from the constant (not retyped).
export function parsePrimitiveFloor(prim: PrimitiveType, code: string): { floor?: PrimitiveFloor; error?: string } {
  const name = prim.type + "_MIN";
  // Tolerates harmless variants (a TS type annotation, unquoted keys, single quotes) so a
  // retry is never spent on formatting alone.
  const m = code.match(new RegExp("export\\s+const\\s+" + name + "(?:\\s*:\\s*[^=\\n]+)?\\s*=\\s*(\\{[^\\n]*\\})"));
  if (!m) return { error: `No one-line floor constant: export const ${name} = {"base":[width,height]};` };
  let floor: PrimitiveFloor;
  const json = m[1].replace(/'/g, '"').replace(/([{,]\s*)([A-Za-z_]\w*)\s*:/g, '$1"$2":').replace(/,\s*([}\]])/g, "$1");
  try { floor = JSON.parse(json); } catch { return { error: `${name} is not a plain object of [width, height] numbers: ${m[1]}` }; }
  if (!floor.base) return { error: `${name} has no "base" floor.` };
  const unions: Record<string, string[]> = {};
  for (const [k, t] of Object.entries(prim.props)) {
    const vals = [...t.matchAll(/'([^']*)'/g)].map((x) => x[1]);
    if (vals.length > 1) unions[k.replace(/\?$/, "")] = vals;
  }
  for (const [key, v] of Object.entries(floor)) {
    if (!Array.isArray(v) || v.length !== 2 || v.some((n) => typeof n !== "number" || n < 0.5 || n > 16))
      return { error: `${name}["${key}"] must be [width, height] in rem, each between 0.5 and 16; got ${JSON.stringify(v)}.` };
    if (key === "base") continue;
    const [p, val] = key.split(":");
    if (!unions[p] || !unions[p].includes(val))
      return { error: `${name} key "${key}" is not "<prop>:<value>" for a union prop value of this contract.` };
  }
  if ((code.match(new RegExp("\\b" + name + "\\b", "g")) || []).length < 2 || !/minWidth/.test(code) || !/minHeight/.test(code))
    return { error: `The outermost element must apply ${name} as inline minWidth/minHeight in rem, read from the constant.` };
  return { floor };
}

// Deterministic guard for the STYLE route (validate-and-retry, like validateLayout):
// flags layout/sizing mechanics the sheet must not carry. Chrome lines (header/footer/
// title bar/status strip) may carry their one height class. Returns the first offender.
export function validateStyleSheet(sheet: string): { ok: boolean; error?: string } {
  // Unambiguous layout/sizing classes (checked after stripping variants like "hover:" / "!").
  const banned = /^(inline-flex|inline-grid|flex-(1|auto|none|initial|row|col|wrap)|flex-shrink-0|grow-0|shrink-0|whitespace-nowrap|overflow-[a-z-]+|items-[a-z]+|justify-[a-z]+|place-[a-z-]+|basis-.+|min-[wh]-.+|max-[wh]-.+|size-.+|aspect-.+|inset-.+|w-.+)$/;
  const height = /^h-.+$/;
  // Words that are also English ("fixed height", "a grid of pads"): only a class when
  // they sit next to another Tailwind-looking token.
  const ambiguous = new Set(["flex", "grid", "fixed", "absolute", "sticky", "grow", "shrink", "hidden", "block"]);
  const classy = (t: string) => /^!?([a-z]+:)*[a-z][a-z0-9]*-[a-z0-9[\]/.#%_-]+$/.test(t);
  const bare = (t: string) => t.replace(/^!/, "").replace(/^([a-z-]+:)+/, "");
  const chrome = /header|footer|title bar|status strip|chrome/i;
  const display = /readout|numeral|display (text|value)|big number/i;
  const fontSize = /(^|\s)!?(text-(xs|sm|base|lg|[0-9]?xl|\[[^\]]*(px|rem|em)\]))(?=$|[\s,;)])/;
  for (const line of sheet.split("\n")) {
    const where = ` (in: "${line.trim().slice(0, 120)}")`;
    const toks = line.split(/[\s,;()"'`]+/).filter(Boolean);
    for (let i = 0; i < toks.length; i++) {
      const t = bare(toks[i]);
      const nearClass = classy(toks[i - 1] || "") || classy(toks[i + 1] || "");
      if (banned.test(t) || (ambiguous.has(t) && nearClass))
        return { ok: false, error: `The sheet contains the layout/sizing class "${toks[i]}"${where}. The sheet is APPEARANCE ONLY — remove every layout, flex-sizing, width/height, min/max, overflow and positioning class.` };
      if (height.test(t) && !chrome.test(line))
        return { ok: false, error: `The sheet contains the height class "${toks[i]}"${where}. The only size allowed is the fixed chrome header/footer height.` };
    }
    const f = display.test(line) && line.match(fontSize);
    if (f) return { ok: false, error: `Display text is given the font size "${f[2]}"${where}. Display text (readouts, numerals, text on buttons/pads) gets family, weight, tracking and color only — it is sized automatically.` };
  }
  return { ok: true };
}
