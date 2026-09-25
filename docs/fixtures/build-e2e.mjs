// Renders the leaf test: WITH primitives vs TODAY, Deck A | Mixer | Deck B side by side at
// their box sizes. Each leaf is scoped in its own IIFE so a baseline leaf's own helpers
// (e.g. its own "Knob") can't collide with the shared primitives.
import { createRequire } from "module";
import fs from "fs";
import path from "path";

const ROOT = "C:/Users/realy/OneDrive/Documents/Work/DashUI";
const OUT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const ts = createRequire(ROOT + "/package.json")("typescript");
const tx = (src) => ts.transpileModule(src, { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None } }).outputText;

const ref = fs.readFileSync(ROOT + "/docs/SKILLS.primitives.reference.ts", "utf8");
const fit = tx(ref.match(/export const FIT_TEXT_SOURCE = `([\s\S]*?)`;/)[1].replace(/^export\s+/gm, ""));
const primDir = OUT + "/" + (process.argv.find((x) => x.startsWith("--prims="))?.slice(8) ?? "prims4");
const prims = fs.readdirSync(primDir).filter((f) => f.endsWith(".tsx"))
  .map((f) => tx(fs.readFileSync(primDir + "/" + f, "utf8").replace(/^export\s+/gm, ""))).join("\n");
const { LEAVES } = JSON.parse(fs.readFileSync(OUT + "/leaves/results.json", "utf8"));
const leafJs = (mode, i) => {
  const src = fs.readFileSync(`${OUT}/leaves/${mode}/${i}.tsx`, "utf8").replace(/export\s+default\s+function\s+GeneratedComponent/, "function GeneratedComponent");
  return `window.LEAF_${mode}_${i} = (() => {\n${tx(src)}\nreturn GeneratedComponent;\n})();`;
};
const leaves = ["prim", "base"].flatMap((m) => LEAVES.map((_, i) => leafJs(m, i))).join("\n");

const html = `<title>Leaf test — primitives vs today</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<body style="background:#050505;color:#ddd;font-family:ui-sans-serif,system-ui,sans-serif;margin:0">
<div id="root"></div>
<script>
const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } = React;
${fit}
${prims}
${leaves}
const h = React.createElement;
const LEAVES = ${JSON.stringify(LEAVES)};
class Boundary extends React.Component {
  constructor(p) { super(p); this.state = { e: null }; }
  static getDerivedStateFromError(e) { return { e }; }
  render() { return this.state.e ? h("div", { style: { color: "#fb7185", font: "12px monospace", padding: 8 } }, String(this.state.e.message)) : this.props.children; }
}
const SCALES = [1, 0.75];
function Row({ mode, label, scale }) {
  return h("div", { style: { marginBottom: 28 } },
    h("div", { style: { font: "13px sans-serif", color: "#fbbf24", margin: "0 0 8px" } }, label + (scale !== 1 ? "  (boxes at " + scale + "× width)" : "")),
    h("div", { style: { display: "flex", borderRadius: 12, overflow: "hidden", width: "fit-content", outline: "1px solid #262626" } },
      LEAVES.map((l, i) => h("div", { key: i, style: { width: l.box.x * scale, height: l.box.y, overflow: "hidden", position: "relative" } },
        h("div", { className: "h-full w-full overflow-hidden bg-zinc-950" },
          h(Boundary, null, (!location.hash || location.hash === "#" + mode + "_" + i) ? h(window["LEAF_" + mode + "_" + i]) : null))))));
}
function App() {
  return h("div", { style: { padding: 20 } },
    h("div", { style: { font: "18px sans-serif", color: "#fbbf24", marginBottom: 4 } }, "Deck A | Central Mixer | Deck B"),
    h("div", { style: { font: "12px sans-serif", color: "#737373", marginBottom: 18 } }, "Same style sheet, box sizes and model config. Top: leaves assembled from shared primitives. Bottom: today's pipeline."),
    SCALES.map((s) => h(React.Fragment, { key: s },
      h(Row, { mode: "prim", label: "WITH PRIMITIVES", scale: s }),
      h(Row, { mode: "base", label: "TODAY (no primitives)", scale: s }))));
}
ReactDOM.createRoot(document.getElementById("root")).render(h(App));
</script>`;
fs.writeFileSync(OUT + "/e2e.html", html);
console.log("e2e.html", (html.length / 1024).toFixed(0) + "KB");
