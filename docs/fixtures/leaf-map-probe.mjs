// Renders one generated map leaf at its box size with a primitive set, and checks its held
// markers in real Chrome (DevTools protocol): each MapMarker's placed element is inside the
// MapCanvas's visible area and on top at its centre, a real click reaches onSelect, and the leaf
// reacts (the marker's props change after the click).
// Usage: node leaf-map-probe.mjs --leaf=<tsx> --prims=<dir>[,<dir>...] (later dirs win) --box=<W>x<H> --out=<dir> [--held=<Type>, default MapMarker]
import { createRequire } from "module";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
const ROOT = "C:/Users/realy/OneDrive/Documents/Work/DashUI";
const ts = createRequire(ROOT + "/package.json")("typescript");
const arg = (k) => process.argv.find((a) => a.startsWith("--" + k + "="))?.slice(k.length + 3);
const out = path.resolve(arg("out")); fs.mkdirSync(out, { recursive: true });
const [W, H] = arg("box").split("x").map(Number);
const HELD = arg("held") ?? "MapMarker";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const tx = (src) => ts.transpileModule(src.replace(/^export\s+default\s+function\s+GeneratedComponent/m, "function GeneratedComponent").replace(/^export\s+/gm, ""),
  { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None } }).outputText;
const fit = fs.readFileSync(ROOT + "/app/api/SKILLS.ts", "utf8").match(/export const FIT_TEXT_SOURCE = `([\s\S]*?)`;/)[1];
const prims = {};
for (const d of arg("prims").split(",")) for (const f of fs.readdirSync(d)) if (/^[A-Z]\w*\.tsx$/.test(f)) prims[f.slice(0, -4)] = fs.readFileSync(path.join(d, f), "utf8");
const html = `<!doctype html><title>leaf-map-probe</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<body style="margin:0;background:#050505"><div id="root"></div><script>
const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } = React;
${tx(fit)}
${Object.values(prims).map(tx).join("\n")}
// Instrument the held type: latest props per id, and every onSelect call.
window.__mm = {}; window.__sel = [];
const RealHeld = ${HELD};
${HELD} = function (p) { const id = p.id ?? p.slotId; window.__mm[id] = p; return RealHeld({ ...p, onSelect: (x) => { window.__sel.push(x); p.onSelect && p.onSelect(x); } }); };
const bus = { emit() {}, on() { return () => {}; } };
${tx(fs.readFileSync(arg("leaf"), "utf8"))}
const h = React.createElement;
ReactDOM.createRoot(document.getElementById("root")).render(h("div", { id: "box", className: "bg-zinc-950", style: { position: "absolute", left: 0, top: 0, width: ${W}, height: ${H}, overflow: "hidden" } }, h(GeneratedComponent)));
window.__markers = () => {
  const box = document.getElementById("box");
  const posOf = (p) => p.position || (typeof p.x === "number" ? { x: p.x, y: p.y } : null);
  return Object.entries(window.__mm).map(([mid, p]) => { const pos = posOf(p); if (!pos) return { id: mid, error: "no position prop" };
    const el = [...box.querySelectorAll("*")].find((c) => c.style && c.style.left && Math.abs(parseFloat(c.style.left) - pos.x * 100) < 1e-6 && Math.abs(parseFloat(c.style.top) - pos.y * 100) < 1e-6);
    if (!el) return { id: mid, error: "placed element not found" };
    const b = el.getBoundingClientRect(), c = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    const hit = document.elementFromPoint(c.x, c.y);
    return { id: mid, x: Math.round(c.x), y: Math.round(c.y), inBox: c.x > 0 && c.x < ${W} && c.y > 0 && c.y < ${H}, onTop: !!(hit && el.contains(hit)), state: JSON.stringify({ state: p.state, selected: p.selected }) }; });
};
</script>`;
const file = path.join(out, "leaf-map-probe.html"); fs.writeFileSync(file, html);

const port = 9300 + Math.floor(Math.random() * 500);
const profile = fs.mkdtempSync(path.join(process.env.TEMP || "/tmp", "lmp-"));
const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + port, "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) { await sleep(200); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true })).result?.result?.value;
const mouse = (type, x, y) => send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1, pointerType: "mouse" });
await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: Math.ceil(W), height: Math.ceil(H), deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "file:///" + file.replace(/\\/g, "/") });
await sleep(4000);
const err = await evaluate(`(document.body.innerText.match(/Error[^\\n]*/) || [""])[0]`);
const before = JSON.parse(await evaluate("JSON.stringify(window.__markers())"));
fs.writeFileSync(path.join(out, "before.png"), Buffer.from((await send("Page.captureScreenshot", { format: "png" })).result.data, "base64"));
const t = before.find((m) => m.inBox && m.onTop);
let click = null;
if (t) {
  await mouse("mouseMoved", t.x, t.y); await sleep(100); await mouse("mousePressed", t.x, t.y); await mouse("mouseReleased", t.x, t.y); await sleep(500);
  const after = JSON.parse(await evaluate("JSON.stringify(window.__markers())"));
  click = { marker: t.id, onSelectCalls: JSON.parse(await evaluate("JSON.stringify(window.__sel)")), stateBefore: t.state, stateAfter: after.find((m) => m.id === t.id)?.state };
  fs.writeFileSync(path.join(out, "after-click.png"), Buffer.from((await send("Page.captureScreenshot", { format: "png" })).result.data, "base64"));
}
ws.close(); chrome.kill();
const summary = { leaf: path.relative(ROOT, arg("leaf")), renderError: err || null, markers: before.length,
  visibleOnTop: before.filter((m) => m.inBox && m.onTop).length, inBoxButCovered: before.filter((m) => m.inBox && !m.onTop).length,
  outOfBox: before.filter((m) => m.error || !m.inBox).length, click };
fs.writeFileSync(path.join(out, "leaf-map-probe.json"), JSON.stringify({ summary, before }, null, 2));
console.log(JSON.stringify(summary));
