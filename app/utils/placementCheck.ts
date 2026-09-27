// SERVER-ONLY: render check for held placement (primitive route). Evaluates one primitive with
// stub hooks into a plain element tree (no DOM, no React renderer), gives it a probe position,
// and checks the position lands where the surface's declared unit says. Deterministic; a
// primitive the evaluator can't run is skipped, never rejected.
import ts from "typescript";
import { PrimitiveType } from "./spec";
import { heldPlacement, heldTypeNames, surfaceUnit } from "./helpers";

type El = { type: unknown; props: Record<string, unknown> };
type Node = { tag: string; props: Record<string, unknown>; kids: Node[]; up?: Node };

const PROBE = { x: 0.37, y: 0.61 };
const PROBE2 = { x: 0.63, y: 0.29 };
const SENTINEL = "held-probe";

const noop = () => {};
const hooks = {
  useState: (i: unknown) => [typeof i === "function" ? (i as () => unknown)() : i, noop],
  useReducer: (_r: unknown, i: unknown) => [i, noop],
  useRef: (v: unknown) => ({ current: v }),
  useMemo: (f: () => unknown) => f(),
  useCallback: (f: unknown) => f,
  useEffect: noop, useLayoutEffect: noop, useId: () => "probe-id",
};
const Fragment = Symbol("Fragment");
const createElement = (type: unknown, props: Record<string, unknown> | null, ...children: unknown[]): El =>
  ({ type, props: children.length ? { ...(props ?? {}), children: children.length === 1 ? children[0] : children } : { ...(props ?? {}) } });
const FitText = (p: { children?: unknown }) => createElement("fittext", null, p.children);

// One primitive's exports, evaluated with the stubs in scope.
function evaluate(code: string): Record<string, unknown> {
  const js = ts.transpileModule(code, { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports: Record<string, unknown> = {};
  const React = { createElement, Fragment, ...hooks };
  new Function("exports", "React", "FitText", ...Object.keys(hooks), js)(exports, React, FitText, ...Object.values(hooks));
  return exports;
}

function render(el: unknown, up: Node | undefined, depth = 0): Node[] {
  if (depth > 60 || el == null || typeof el === "boolean" || typeof el === "string" || typeof el === "number") return [];
  if (Array.isArray(el)) return el.flatMap((c) => render(c, up, depth + 1));
  const { type, props } = el as El;
  if (type === Fragment) return render(props.children, up, depth + 1);
  if (typeof type === "function") return render((type as (p: unknown) => unknown)(props), up, depth + 1);
  const node: Node = { tag: String(type), props, kids: [], up };
  node.kids = render(props.children, node, depth + 1);
  return [node];
}

// Sample values for a contract, with the probe position on every coordinate prop.
function sampleProps(prim: PrimitiveType): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [raw, t] of Object.entries(prim.props)) {
    const k = raw.replace(/\?$/, "");
    if (k === "children") continue;
    if (k === "x") out.x = PROBE.x; else if (k === "y") out.y = PROBE.y;
    else if (/x\s*:\s*number/.test(t) && /y\s*:\s*number/.test(t)) out[k] = /\[\]\s*$/.test(t.trim()) ? [PROBE, PROBE2] : PROBE;
    else if (/=>/.test(t)) out[k] = noop;
    else if (/\[\]\s*$/.test(t.trim())) out[k] = [];
    else if (/^'[^']*'/.test(t.trim())) out[k] = t.trim().match(/^'([^']*)'/)![1];
    else if (/\bnumber\b/.test(t)) out[k] = 1;
    else if (/\bboolean\b/.test(t)) out[k] = false;
    else if (/\bstring\b/.test(t)) out[k] = "probe";
    else if (!raw.endsWith("?")) out[k] = {};
  }
  return out;
}

const nums = (s: string) => [...s.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => +m[0]);
const near = (a: number, b: number) => Math.abs(a - b) < 0.006;

// Every position a node expresses, as fractions of its frame (CSS % or the nearest SVG viewBox).
function fractions(n: Node): { xs: number[]; ys: number[] } {
  const xs: number[] = [], ys: number[] = [];
  const style = (n.props.style ?? {}) as Record<string, unknown>;
  for (const [k, v] of Object.entries(style)) {
    if (typeof v !== "string" || !v.includes("%")) continue;
    const pct = [...v.matchAll(/(-?\d+(?:\.\d+)?)%/g)].map((m) => +m[1] / 100);
    if (/^(left|right|insetInlineStart)$/.test(k)) xs.push(...pct);
    else if (/^(top|bottom|insetBlockStart)$/.test(k)) ys.push(...pct);
    else if (/transform|translate/.test(k)) { xs.push(...pct.filter((_, i) => i % 2 === 0)); ys.push(...pct.filter((_, i) => i % 2 === 1)); }
  }
  let svg: Node | undefined = n;
  while (svg && !(svg.tag === "svg" && typeof svg.props.viewBox === "string")) svg = svg.up;
  if (svg) {
    const [mx, my, w, h] = nums(svg.props.viewBox as string);
    const fx = (v: number) => (v - mx) / w, fy = (v: number) => (v - my) / h;
    const p = n.props as Record<string, unknown>;
    const num = (k: string) => (typeof p[k] === "number" || (typeof p[k] === "string" && /^-?\d/.test(p[k] as string)) ? +(p[k] as number) : undefined);
    for (const k of ["cx", "x1", "x2"]) { const v = num(k); if (v !== undefined) xs.push(fx(v)); }
    for (const k of ["cy", "y1", "y2"]) { const v = num(k); if (v !== undefined) ys.push(fy(v)); }
    const x = num("x"), y = num("y"), wd = num("width"), ht = num("height");
    if (x !== undefined) xs.push(fx(x), ...(wd !== undefined ? [fx(x + wd / 2)] : []));
    if (y !== undefined) ys.push(fy(y), ...(ht !== undefined ? [fy(y + ht / 2)] : []));
    for (const k of ["points", "d", "transform"]) {
      if (typeof p[k] !== "string") continue;
      const v = nums(p[k] as string);
      for (let i = 0; i + 1 < v.length; i += 2) { xs.push(fx(v[i])); ys.push(fy(v[i + 1])); }
    }
  }
  return { xs, ys };
}

const places = (list: Node[], want: { x: number; y: number }) => {
  const xs = list.flatMap((n) => fractions(n).xs), ys = list.flatMap((n) => fractions(n).ys);
  return xs.some((v) => near(v, want.x)) && ys.some((v) => near(v, want.y));
};
const walk = (roots: Node[]): Node[] => roots.flatMap((n) => [n, ...walk(n.kids)]);
const passThrough = (n: Node) => /(^|\s)pointer-events-none(\s|$)/.test(String(n.props.className ?? ""))
  || (n.props.style as Record<string, unknown> | undefined)?.pointerEvents === "none";

// Placement errors for one generated primitive (empty = ok or not applicable).
export function checkPlacement(prim: PrimitiveType, code: string, library: PrimitiveType[]): string[] {
  const holders = library.filter((t) => heldTypeNames(t).includes(prim.type));
  const held = heldTypeNames(prim);
  if (!holders.length && !held.length) return [];
  let exp: Record<string, unknown>;
  try { exp = evaluate(code); } catch { return []; }
  const Comp = exp[prim.type];
  if (typeof Comp !== "function") return [];
  const errors: string[] = [];
  const pct = (u: "fraction" | "percent", v: number) => (u === "fraction" ? v : Math.round(v * 100));

  // A self-placed held type: rendered at the probe, it must land there in its surface's unit.
  const self = holders.find((h) => heldPlacement(h, library)[prim.type] === "self");
  if (self) {
    const unit = surfaceUnit(self);
    if (unit) {
      const props = sampleProps(prim);
      if (unit === "percent") for (const [k, v] of Object.entries(props)) {
        const scale = (p: { x: number; y: number }) => ({ x: p.x * 100, y: p.y * 100 });
        if (k === "x" || k === "y") props[k] = (v as number) * 100;
        else if (Array.isArray(v) && v[0] === PROBE) props[k] = v.map(scale);
        else if (v === PROBE) props[k] = scale(PROBE);
      }
      try {
        if (!places(walk(render(createElement(Comp, props), undefined)), PROBE))
          errors.push(`placement: rendered at ${self.type}'s coordinates x=${pct(unit, PROBE.x)}, y=${pct(unit, PROBE.y)} (${unit === "fraction" ? "normalized 0-1" : "0-100"}), nothing landed at ${PROBE.x * 100}% / ${PROBE.y * 100}% of the surface — convert your position to the surface's frame (e.g. left: x * 100 + "%" for 0-1 coordinates).`);
      } catch { /* evaluator limit: skip */ }
    }
  }

  // A holder: it must render its children outside any pointer-events-none box, and place the
  // ones it places itself at their data position.
  if (held.length) {
    const unit = surfaceUnit(prim);
    const mode = heldPlacement(prim, library);
    const props = sampleProps(prim);
    const Probe = () => createElement(SENTINEL, null);
    const surfacePlaced = held.filter((t) => mode[t] === "surface");
    const dataKey = Object.entries(prim.props).find(([, t]) => /\[\]\s*$/.test(t.trim()) && /\bid\b/.test(t) && /x\s*:\s*number/.test(t))?.[0].replace(/\?$/, "");
    if (surfacePlaced.length && dataKey && unit) {
      const v = unit === "fraction" ? PROBE : { x: PROBE.x * 100, y: PROBE.y * 100 };
      props[dataKey] = [{ id: "probe", label: "probe", name: "probe", ...v }];
    }
    const heldType = library.find((t) => t.type === held[0]);
    const idProps = Object.fromEntries(Object.entries(heldType?.props ?? {}).filter(([k, t]) => /^(id|\w*Id)\??$/.test(k) && /string/.test(t)).map(([k]) => [k.replace(/\?$/, ""), "probe"]));
    try {
      const nodes = walk(render(createElement(Comp, { ...props, children: [createElement(Probe, idProps)] }), undefined));
      const probe = nodes.find((n) => n.tag === SENTINEL);
      if (!probe) errors.push(`placement: rendered with a child, it never appears — render your "children" (the ${held.join(" / ")} layers).`);
      else {
        const chain: Node[] = []; for (let n = probe.up; n; n = n.up) chain.push(n);
        if (chain.some(passThrough)) errors.push(`placement: your children sit inside a pointer-events-none box, so they can't be clicked — remove it from every box around the children layer.`);
        if (surfacePlaced.length && dataKey && unit && !places(chain, PROBE))
          errors.push(`placement: a child matched to your "${dataKey}" entry at x=${pct(unit, PROBE.x)}, y=${pct(unit, PROBE.y)} (${unit === "fraction" ? "normalized 0-1" : "0-100"}) was not placed at ${PROBE.x * 100}% / ${PROBE.y * 100}% — wrap it in a box at that position in your frame.`);
      }
    } catch { /* evaluator limit: skip */ }
  }
  return errors;
}
