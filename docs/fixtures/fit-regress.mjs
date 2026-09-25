// FitText regression page: the fittest.mjs cases (definite slots, incl. a scaled one) plus
// edge cases, rendered with a given FitText source; a probe records every FitText text span.
// Usage: node fit-regress.mjs --fit=<ts file holding FIT_TEXT_SOURCE> --out=<html>
import { createRequire } from "module";
import fs from "fs";
const ROOT = "C:/Users/realy/OneDrive/Documents/Work/DashUI";
const ts = createRequire(ROOT + "/package.json")("typescript");
const arg = (k) => process.argv.find((a) => a.startsWith("--" + k + "="))?.slice(k.length + 3);
const src = fs.readFileSync(arg("fit"), "utf8").match(/export const FIT_TEXT_SOURCE = `([\s\S]*?)`;/)[1].replace(/^export\s+/gm, "");
const js = ts.transpileModule(src, { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None } }).outputText;

export const PROBE = `<script>setTimeout(()=>{const out=[];document.querySelectorAll("span").forEach((s)=>{if(s.style.lineHeight!=="1.1"||s.style.display!=="inline-block")return;const r=s.getBoundingClientRect();const fs=parseFloat(getComputedStyle(s).fontSize);const c=s.closest("[data-case]");out.push({case:c?c.dataset.case:"?",fs:+fs.toFixed(2),w:+r.width.toFixed(1),h:+r.height.toFixed(1),text:(s.textContent||"").slice(0,20)});});document.querySelectorAll("[data-crash]").forEach((c)=>out.push({case:c.dataset.crash,crash:true}));const p=document.createElement("pre");p.id="probe";p.textContent=JSON.stringify(out);document.body.appendChild(p);},2500);</script>`;

const html = `<title>FitText regression</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<body style="background:#0a0a0a;color:#ddd;font-family:sans-serif;margin:0;padding:16px;font-size:16px">
<div id="root"></div>
<script>
const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } = React;
${js}
const h = React.createElement;
const tri = (props) => h("svg", { viewBox: "0 0 24 24", fill: "currentColor", ...props }, h("path", { d: "M7 4.5v15l12-7.5z" }));
const CASES = [
  ["svg1em", tri({ width: "1em", height: "1em" }), true],
  ["svg+text", h(React.Fragment, null, tri({ width: "1em", height: "1em", style: { display: "inline", verticalAlign: "-0.125em", marginRight: "0.25em" } }), "PLAY"), true],
  ["glyph", "\\u25B6", true],
  ["svgfixed", tri({ className: "w-4 h-4" }), true],
  ["svgfull", tri({ className: "h-full w-full" }), true],
  ["twoword", "HEADPHONE CUE", true],
  ["nowrap", "HEADPHONE CUE", false],
  ["number", "128.00", false],
];
const SLOTS = [[72, 72], [240, 240], [320, 64], [64, 240]];
function Cell({ w, hh, text, wrap, scale, id }) {
  return h("div", { "data-case": id, style: { width: w, height: hh, outline: "1px dashed #555", transform: scale ? "scale(" + scale + ")" : undefined, transformOrigin: "top left" } },
    h("div", { style: { position: "relative", width: "100%", height: "100%" } }, h("div", { style: { position: "absolute", inset: "12%" } },
      h(FitText, { wrap, className: "font-mono font-bold text-amber-300" }, text))));
}
// Edge cases: each renders one FitText in a situation the definite-slot cases don't cover.
function Later({ from, to, children }) { const [v, set] = useState(from); useEffect(() => { const t = setTimeout(() => set(to), 400); return () => clearTimeout(t); }, []); return children(v); }
const EDGES = [
  // The SortHeaders bug: FitText in a flex child with no definite height.
  ["edge:indef-height", h("div", { style: { width: 200, height: 60, display: "flex", alignItems: "center" } },
    h("span", { style: { display: "flex", flex: 1, minWidth: 0, alignItems: "center", overflow: "hidden" } }, h(FitText, { align: "start", wrap: false }, "BPM")))],
  // A parent whose width comes from its content.
  ["edge:content-width", h("div", { style: { height: 40, display: "flex" } }, h("span", { style: { flex: "none", height: "100%" } }, h(FitText, { wrap: false }, "CUE")))],
  // Hidden on mount, then shown: must fit once visible (not lock into the unsized fallback).
  ["edge:hidden-then-shown", h(Later, { from: "none", to: "block" }, (d) => h("div", { style: { display: d, width: 120, height: 60 } }, h(FitText, null, "SYNC")))],
  // Zero height on mount, then a definite height: must recover and fit.
  ["edge:zero-then-grow", h(Later, { from: 0, to: 60 }, (hh) => h("div", { style: { width: 120, height: hh, overflow: "hidden" } }, h(FitText, null, "LOOP")))],
  // Content changes after mount: must refit to the new text.
  ["edge:text-change", h("div", { style: { width: 120, height: 60 } }, h(Later, { from: "1", to: "128.00" }, (t) => h(FitText, { wrap: false }, t)))],
  // Definite flex-1 child of a definite column (the common correct pattern).
  ["edge:flex1-definite", h("div", { style: { width: 160, height: 80, display: "flex", flexDirection: "column" } },
    h("div", { style: { height: 20 } }), h("div", { style: { flex: 1, minHeight: 0, display: "flex" } }, h(FitText, null, "MASTER")))],
];
class Guard extends React.Component { constructor(p) { super(p); this.state = { e: null }; } static getDerivedStateFromError(e) { return { e }; } render() { return this.state.e ? h("i", { "data-crash": this.props.id }, "CRASH") : this.props.children; } }
function App() {
  return h("div", null,
    CASES.map(([id, t, wrap]) => h("div", { key: id, style: { display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" } },
      SLOTS.map(([w, hh], j) => h(Guard, { key: j, id: id + ":" + w + "x" + hh }, h(Cell, { w, hh, text: t, wrap, id: id + ":" + w + "x" + hh }))),
      h("div", { style: { width: 120, height: 120 } }, h(Cell, { w: 240, hh: 240, text: t, wrap, scale: 0.5, id: id + ":scaled" })))),
    EDGES.map(([id, el]) => h("div", { key: id, "data-case": id, style: { marginBottom: 14, outline: "1px dashed #333" } }, h(Guard, { id }, el))));
}
ReactDOM.createRoot(document.getElementById("root")).render(h(App));
</script>${PROBE}`;
fs.writeFileSync(arg("out"), html);
