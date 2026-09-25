// Contract-driven gallery: samples and variations are derived from each type's prop
// contract (names + TS types), so it works for any hoist output.
// Usage: node build-gallery2.mjs --hoist=<json> --prims=<dir> --out=<html>
import { createRequire } from "module";
import fs from "fs";
import path from "path";

const ROOT = "C:/Users/realy/OneDrive/Documents/Work/DashUI";
const OUT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const ts = createRequire(ROOT + "/package.json")("typescript");
const arg = (k, d) => process.argv.find((a) => a.startsWith("--" + k + "="))?.slice(k.length + 3) ?? d;
const hoist = JSON.parse(fs.readFileSync(arg("hoist"), "utf8"));
const primsDir = OUT + "/" + arg("prims", "prims");
const outFile = OUT + "/" + arg("out", "gallery2.html");
const title = arg("title", "Primitive Gallery");

const lib = hoist.library.filter((t) => fs.existsSync(`${primsDir}/${t.type}.tsx`));
const refSrc = fs.readFileSync(arg("fit", ROOT + "/docs/SKILLS.primitives.reference.ts"), "utf8");
const fitSrc = refSrc.match(/export const FIT_TEXT_SOURCE = `([\s\S]*?)`;/)[1].replace(/^export\s+/gm, "");
const fitJs = ts.transpileModule(fitSrc, { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None } }).outputText;
const primJs = lib.map((t) => {
  const src = fs.readFileSync(`${primsDir}/${t.type}.tsx`, "utf8").replace(/^export\s+/gm, "");
  return ts.transpileModule(src, { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None } }).outputText;
}).join("\n");

const html = `<title>${title}</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  :root { color-scheme: dark; }
  body { background: #070707; color: #d4d4d4; font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; }
  .wrap { padding: 20px 16px 60px; max-width: 1400px; margin: 0 auto; }
  h1 { font-size: 18px; margin: 0 0 4px; color: #fbbf24; }
  .sub { font-size: 12px; color: #737373; margin-bottom: 20px; }
  section { border-top: 1px solid #262626; padding: 18px 0; }
  h2 { font-size: 15px; margin: 0 0 2px; color: #f5f5f5; }
  .desc { font-size: 12px; color: #737373; margin: 0 0 4px; }
  .contract { font: 11px ui-monospace, monospace; color: #a3a3a3; margin: 0 0 12px; overflow-x: auto; white-space: pre; }
  .row { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-start; margin-bottom: 14px; }
  .vlabel { font: 11px ui-monospace, monospace; color: #fbbf24; width: 100%; margin: 4px 0 -6px; }
  .cell { display: flex; flex-direction: column; gap: 4px; }
  .cap { font-size: 10px; color: #525252; }
  .slot { position: relative; overflow: hidden; border-radius: 10px; outline: 1px dashed #3f3f46;
          background: linear-gradient(to bottom, rgba(38,38,38,.7), rgba(23,23,23,.9)); }
  .err { color: #fb7185; font: 11px ui-monospace, monospace; padding: 6px; white-space: pre-wrap; }
  .log { position: fixed; right: 12px; bottom: 12px; background: #171717; border: 1px solid #333; border-radius: 8px;
         padding: 6px 10px; font: 11px ui-monospace, monospace; color: #fbbf24; max-width: 60vw; }
  .ctrls { font-size: 12px; margin-bottom: 16px; }
</style>
<div id="root"></div>
<script>
const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } = React;
${fitJs}
${primJs}

const h = React.createElement;
const LIB = ${JSON.stringify(lib)};
let logSet = null;
const log = (m) => logSet && logSet(m + "  @" + new Date().toLocaleTimeString());

/* ---- sample data ---- */
const wave = Array.from({ length: 600 }, (_, i) => {
  const beat = Math.pow(Math.max(0, Math.sin(i / 600 * Math.PI * 64)), 6);
  const env = 0.35 + 0.35 * Math.sin(i / 600 * Math.PI * 3) ** 2;
  return Math.min(1, env * (0.5 + 0.5 * Math.random()) + beat * 0.5) * (i % 2 ? 1 : -1);
});
const grid = Array.from({ length: 33 }, (_, i) => i / 32);
const TREE = [
  { id: "lib", label: "Library", children: [
    { id: "house", label: "House", children: [{ id: "deep", label: "Deep House" }, { id: "tech", label: "Tech House" }] },
    { id: "techno", label: "Techno" }, { id: "dnb", label: "Drum & Bass" } ] },
  { id: "crates", label: "Crates", children: [{ id: "warmup", label: "Warm-up Set" }, { id: "peak", label: "Peak Time" }] },
  { id: "hist", label: "History" } ];
const flatTree = (ns, p) => ns.flatMap((n) => [{ id: n.id, label: n.label, parentId: p }, ...flatTree(n.children || [], n.id)]);
const TRACK = [
  { title: "One More Time", artist: "Daft Punk", bpm: 123, key: "8B", duration: "5:20" },
  { title: "Strobe", artist: "deadmau5", bpm: 128, key: "4A", duration: "10:37" },
  { title: "Innerbloom", artist: "RÜFÜS DU SOL", bpm: 122, key: "11A", duration: "9:38" },
  { title: "Opus", artist: "Eric Prydz", bpm: 126, key: "6A", duration: "9:03" },
  { title: "Cola", artist: "CamelPhat & Elderbrook", bpm: 122, key: "5A", duration: "3:46" },
  { title: "Losing It", artist: "FISHER", bpm: 125, key: "10A", duration: "4:08" },
  { title: "Pjanoo", artist: "Eric Prydz", bpm: 126, key: "7A", duration: "7:02" },
  { title: "Gecko", artist: "Oliver Heldens", bpm: 124, key: "9B", duration: "3:31" } ];
const COLUMNS = ["Title", "Artist", "BPM", "Key", "Time"].map((l) => ({ id: l.toLowerCase(), label: l }));
const FX = ["Echo", "Reverb", "Filter", "Flanger", "Phaser", "Bitcrush"].map((l) => ({ id: l.toLowerCase(), label: l }));

/* ---- contract parsing ---- */
const isFn = (t) => t.includes("=>");
const members = (t) => { const m = [...t.matchAll(/'([^']*)'/g)].map((x) => x[1]); return m.length > 1 && !t.includes("{") ? m : null; };
const fieldsOf = (t) => [...t.matchAll(/(\\w+)\\??\\s*:/g)].map((x) => x[1]);
function sampleArray(name, t) {
  if (name === "data") return wave;
  if (name === "beatGrid") return grid;
  if (name === "steps") return [0, 25, 50, 75, 100];
  if (/^string\\[\\]$/.test(t.trim())) return ["title", "artist", "bpm", "key", "duration"];
  const f = fieldsOf(t);
  if (f.includes("children")) return TREE;
  if (f.includes("parentId")) return flatTree(TREE);
  if (f.includes("cells")) return TRACK.map((r, i) => ({ id: "t" + i, cells: Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v)])) }));
  const extra = f.filter((k) => k !== "id" && k !== "label");
  if (extra.length) return TRACK.map((r, i) => ({ id: "t" + i, label: r.title, ...Object.fromEntries(extra.map((k) => [k, r[k] ?? "—"])) }));
  return FX;
}
function sample(name, t, c) {
  const u = members(t);
  if (u) return u[0];
  if (/\\[\\]\\s*$/.test(t.trim())) return sampleArray(name, t);
  if (t.includes("ReactNode")) return "PLAY";
  if (t.trim().startsWith("{")) { const o = {}; for (const k of fieldsOf(t)) { const m = t.match(new RegExp(k + "\\\\??\\\\s*:\\\\s*([^;}]+)")); o[k] = m && members(m[1]) ? members(m[1])[0] : (k === "field" ? "bpm" : ""); } return o; }
  if (t === "boolean") return false;
  if (t.includes("number") && t.includes("string")) return "128.00";
  if (t === "number") {
    if (name === "min") return 0; if (name === "max") return 100;
    if (name === "value") return has(c, "min") ? 35 : 0.4;
    if (name === "zoom") return 1; if (name === "playhead") return 0.3;
    return 0.6;
  }
  if (t === "string") {
    if (name === "placeholder") return "Search tracks…";
    if (name === "field") return "bpm";
    if (name === "value") return has(c, "options") ? null : (has(c, "onChange") ? "" : "128.00");
    return "text";
  }
  return null;
}
const has = (c, k) => k in c || (k + "?") in c;
const bare = (k) => k.replace(/\\?$/, "");

function buildVariations(t) {
  const c = t.props, base = {}, vars = [{}];
  for (const [k0, ty] of Object.entries(c)) {
    const k = bare(k0), opt = k0.endsWith("?");
    if (isFn(ty)) { if (opt) vars.push({ ["__cb_" + k]: true }); continue; }
    const v = sample(k, ty, c);
    if (!opt || (k === "children" && !has(c, "value")) || (k === "value" && has(c, "children"))) base[k] = v;
    else vars.push({ [k]: v });
    const u = members(ty); if (u) u.slice(opt ? 0 : 1).forEach((m) => vars.push({ [k]: m }));
    if (ty === "boolean") vars.push({ [k]: true });
    if (Array.isArray(v) && !opt && ["data", "options", "nodes", "rows", "items"].includes(k)) vars.push({ [k]: [] });
    if (k === "steps") vars.push({ steps: [0.5, 1, 2, 4], min: 0.5, max: 4, value: 1 });
    if (k === "children") { if (has(c, "value")) vars.push({ children: v }); vars.push({ children: "HEADPHONE CUE" }, { children: undefined }); }
    if (k === "value" && typeof v === "string" && v === "128.00") vars.push({ value: "-03:42" }, { value: "One More Time — Daft Punk (Extended Mix)" });
    if (k === "value" && ty.includes("number") && ty.includes("string")) vars.push({ value: "-03:42" }, { value: "One More Time — Daft Punk (Extended Mix)" });
  }
  if (has(c, "options") && base.value === null) base.value = (base.options[0] || {}).id ?? "";
  if (base.options && base.options === TREE) base.value = "deep";
  if (base.options && base.value && typeof base.value === "object" && "field" in base.value) base.options = COLUMNS;
  if (has(c, "level")) base.__animate = "level"; else if (has(c, "playhead")) base.__animate = "playhead";
  const seen = new Set();
  return { base, vars: vars.filter((v) => { const s = JSON.stringify(v); if (seen.has(s)) return false; seen.add(s); return true; }) };
}

const SLOTS = [["small", 72, 72], ["large", 240, 240], ["wide", 320, 64], ["tall", 64, 240]];

class Boundary extends React.Component {
  constructor(p) { super(p); this.state = { e: null }; }
  static getDerivedStateFromError(e) { return { e }; }
  render() { return this.state.e ? h("div", { className: "err" }, String(this.state.e.message || this.state.e)) : this.props.children; }
}

function Harness({ t, init }) {
  const [s, set] = useState(init);
  useEffect(() => {
    if (!init.__animate) return;
    const id = setInterval(() => set((p) => init.__animate === "level"
      ? { ...p, level: Math.max(0, Math.min(1, 0.55 + 0.35 * Math.sin(Date.now() / 180) + 0.1 * Math.random())) }
      : { ...p, playhead: (p.playhead + 0.002) % 1 }), 60);
    return () => clearInterval(id);
  }, []);
  const props = {};
  for (const [k, v] of Object.entries(s)) if (!k.startsWith("__") && v !== undefined) props[k] = v;
  for (const [k0, ty] of Object.entries(t.props)) {
    const k = bare(k0);
    if (!isFn(ty)) continue;
    if (k0.endsWith("?") && !s["__cb_" + k]) continue;
    props[k] = (...a) => {
      log(t.type + "." + k + "(" + a.map((x) => JSON.stringify(x)).join(", ") + ")");
      if (k === "onChange") set((p) => ("on" in p ? { ...p, on: a[0] } : { ...p, value: a[0] }));
      if (k === "onScrub" && "playhead" in s && a[0] >= 0 && a[0] <= 1) set((p) => ({ ...p, playhead: a[0] }));
      if (k === "onPress" && "active" in s) set((p) => ({ ...p, active: !p.active }));
    };
  }
  const C = window[t.type];
  return C ? h(C, props) : h("div", { className: "err" }, "missing " + t.type);
}

function App() {
  const [msg, setMsg] = useState("interact with any primitive — callbacks log here");
  const [scale, setScale] = useState(1);
  logSet = setMsg;
  const only = location.hash.slice(1).split(",").filter(Boolean);
  const label = (v) => { const e = Object.entries(v).map(([k, x]) => k.startsWith("__cb_") ? k.slice(5) + ": fn" : k + ": " + (Array.isArray(x) ? "[" + x.length + "]" : JSON.stringify(x))); return e.length ? e.join(", ") : "base"; };
  return h("div", { className: "wrap" },
    h("h1", null, ${JSON.stringify(title)}),
    h("div", { className: "sub" }, "Samples and variations derived from each contract. Dashed outline = the slot a leaf would give it."),
    h("div", { className: "ctrls" }, "slot scale ",
      h("input", { type: "range", min: 0.5, max: 2, step: 0.1, value: scale, onChange: (e) => setScale(+e.target.value) }), " " + scale.toFixed(1) + "×"),
    LIB.filter((t) => !only.length || only.includes(t.type)).map((t) => {
      const { base, vars } = buildVariations(t);
      return h("section", { key: t.type },
        h("h2", null, t.type), h("p", { className: "desc" }, t.description),
        h("div", { className: "contract" }, JSON.stringify(t.props)),
        vars.map((v, vi) => h("div", { className: "row", key: vi },
          h("div", { className: "vlabel" }, label(v)),
          SLOTS.map(([n, w, hh]) => h("div", { className: "cell", key: n },
            h("div", { className: "slot", style: { width: w * scale, height: hh * scale } },
              h(Boundary, null, h(Harness, { t, init: { ...base, ...v } }))),
            h("div", { className: "cap" }, n + " " + Math.round(w * scale) + "×" + Math.round(hh * scale)))))));
    }),
    h("div", { className: "log" }, msg));
}
ReactDOM.createRoot(document.getElementById("root")).render(h(App));
</script>
`;
fs.writeFileSync(outFile, html);
console.log(path.basename(outFile), (html.length / 1024).toFixed(0) + "KB", lib.length, "primitives");
