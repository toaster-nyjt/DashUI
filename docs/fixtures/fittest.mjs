// Standalone FitText test page: several contents x slot shapes, inside a scaled wrapper too.
import { createRequire } from "module";
import fs from "fs";
const ROOT = "C:/Users/realy/OneDrive/Documents/Work/DashUI";
const ts = createRequire(ROOT + "/package.json")("typescript");
const ref = fs.readFileSync(ROOT + "/docs/SKILLS.primitives.reference.ts", "utf8");
const src = ref.match(/export const FIT_TEXT_SOURCE = `([\s\S]*?)`;/)[1].replace(/^export\s+/gm, "");
const js = ts.transpileModule(src, { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None } }).outputText;
const html = `<title>FitText test</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<body style="background:#0a0a0a;color:#ddd;font-family:sans-serif;margin:0;padding:16px">
<div id="root"></div>
<script>
const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } = React;
${js}
const h = React.createElement;
const tri = (props) => h("svg", { viewBox: "0 0 24 24", fill: "currentColor", ...props }, h("path", { d: "M7 4.5v15l12-7.5z" }));
const CASES = [
  ["svg 1em (recommended)", tri({ width: "1em", height: "1em" }), true],
  ["svg 1em + text", h(React.Fragment, null, tri({ width: "1em", height: "1em", style: { display: "inline", verticalAlign: "-0.125em", marginRight: "0.25em" } }), "PLAY"), true],
  ["text glyph ▶", "▶", true],
  ["svg fixed w-4 h-4 (should NOT scale)", tri({ className: "w-4 h-4" }), true],
  ["svg h-full w-full (should collapse)", tri({ className: "h-full w-full" }), true],
  ["HEADPHONE CUE", "HEADPHONE CUE", true],
];
const SLOTS = [[72, 72], [240, 240], [320, 64], [64, 240]];
function Cell({ w, hh, text, wrap, scale }) {
  return h("div", { style: { width: w, height: hh, outline: "1px dashed #555", borderRadius: 8, overflow: "visible", transform: scale ? "scale(" + scale + ")" : undefined, transformOrigin: "top left" } },
    h("div", { style: { position: "relative", width: "100%", height: "100%" } }, h("div", { style: { position: "absolute", inset: "12%" } },
      h(FitText, { wrap, className: "font-mono font-bold text-amber-300" }, text))));
}
function App() {
  return h("div", null, CASES.map(([lbl, t, wrap], i) => h("div", { key: i, style: { marginBottom: 18 } },
    h("div", { style: { font: "11px monospace", color: "#fbbf24", marginBottom: 4 } }, lbl),
    h("div", { style: { display: "flex", gap: 14, alignItems: "flex-start" } },
      SLOTS.map(([w, hh], j) => h(Cell, { key: j, w, hh, text: t, wrap })),
      h("div", { style: { width: 120, height: 120 } }, h(Cell, { w: 240, hh: 240, text: t, wrap, scale: 0.5 }))))));
}
ReactDOM.createRoot(document.getElementById("root")).render(h(App));
</script>`;
fs.writeFileSync("fittest.html", html);
console.log("ok");
