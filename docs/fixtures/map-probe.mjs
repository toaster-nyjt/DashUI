// Behaviour probe for a map surface that holds other primitives as children (MapCanvas +
// MapMarker + RouteOverlay from a prim-compare output dir). Drives real Chrome over the
// DevTools protocol: renders the trio at a known view, then zooms/re-centres (props) and
// pans (a real mouse drag), measuring after each view whether every marker stays on its
// district label (the same 0-1 map point), and whether a real click/hover reaches a marker.
// Usage: node map-probe.mjs --dir=<prim dir> [--out=<dir for html+png>]
import { createRequire } from "module";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
const ROOT = "C:/Users/realy/OneDrive/Documents/Work/DashUI";
const ts = createRequire(ROOT + "/package.json")("typescript");
const arg = (k) => process.argv.find((a) => a.startsWith("--" + k + "="))?.slice(k.length + 3);
const dir = path.resolve(arg("dir")), out = path.resolve(arg("out") ?? dir);
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const tx = (src) => ts.transpileModule(src.replace(/^export\s+/gm, ""), { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None } }).outputText;
const fit = fs.readFileSync(ROOT + "/app/api/SKILLS.ts", "utf8").match(/export const FIT_TEXT_SOURCE = `([\s\S]*?)`;/)[1];
const prims = ["MapCanvas", "MapMarker", "RouteOverlay"].map((t) => tx(fs.readFileSync(path.join(dir, t + ".tsx"), "utf8"))).join("\n");

// Three districts; each marker sits at its district's centre (the label's anchor).
const REGIONS = [
  { id: "r1", label: "QXALPHA", bounds: { x: 0.2, y: 0.25, w: 0.2, h: 0.16 } },
  { id: "r2", label: "QXBRAVO", bounds: { x: 0.55, y: 0.3, w: 0.2, h: 0.16 } },
  { id: "r3", label: "QXCHARLIE", bounds: { x: 0.35, y: 0.6, w: 0.24, h: 0.16 } },
];
const centre = (r) => ({ x: r.bounds.x + r.bounds.w / 2, y: r.bounds.y + r.bounds.h / 2 });
const html = `<!doctype html><title>map-probe</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<body style="margin:0;background:#050505"><div id="root"></div><script>
const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } = React;
${tx(fit)}
${prims}
const REGIONS = ${JSON.stringify(REGIONS)};
const MARKERS = ${JSON.stringify(REGIONS.map((r) => ({ id: "m-" + r.id, position: centre(r) })))};
window.__sel = []; window.__hov = [];
const h = React.createElement;
function Harness() {
  const [view, setView] = useState({ center: { x: 0.5, y: 0.5 }, zoom: 1 });
  window.__setView = setView; window.__view = view;
  return h("div", { id: "slot", className: "bg-zinc-950", style: { position: "absolute", left: 20, top: 20, width: 720, height: 460 } },
    h(MapCanvas, { regions: REGIONS, center: view.center, zoom: view.zoom, onViewChange: setView },
      h(RouteOverlay, { points: MARKERS.map((m) => ({ x: m.position.x + 0.0003, y: m.position.y + 0.0003 })), visible: true }),
      MARKERS.map((m) => h(MapMarker, { key: m.id, id: m.id, position: m.position, kind: "quest", state: "default",
        onSelect: (id) => window.__sel.push(id), onHover: (id) => window.__hov.push(id) }))));
}
ReactDOM.createRoot(document.getElementById("root")).render(h(Harness));
// Children are passed bare, as a leaf passes them; route waypoints sit 0.03% off the markers, so the
// element at exactly left:x% is the marker.
// District centre = the smallest rendered element (>=1% of the slot) holding the label's centre,
// outside the children — i.e. the region shape the map drew.
window.__events = [];
const markerEl = (pos) => [...document.querySelectorAll("#slot *")].find((c) => c.style && c.style.left && !/QX[A-Z]/.test(c.textContent) && Math.abs(parseFloat(c.style.left) - pos.x * 100) < 1e-6 && Math.abs(parseFloat(c.style.top) - pos.y * 100) < 1e-6);
["pointerdown", "pointerup", "click"].forEach((t) => document.addEventListener(t, (e) => window.__events.push({ t, inMarker: MARKERS.some((m) => { const k = markerEl(m.position); return k && k.contains(e.target); }), tag: e.target.tagName }), true));
window.__measure = () => {
  const slotEl = document.getElementById("slot"), slot = slotEl.getBoundingClientRect(), area = slot.width * slot.height;
  const kids = MARKERS.map((m) => markerEl(m.position)).filter(Boolean);
  const inKids = (e) => kids.some((k) => k.contains(e)) || e.closest("[data-kid]") !== null || e.tagName === "polyline";
  const labelAt = (txt) => { const w = document.createTreeWalker(slotEl, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode());) if (n.textContent.trim() === txt && !inKids(n.parentElement)) { const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect(); if (b.width) return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; } return null; };
  const regionAt = (p) => { if (!p) return null; let best = null;
    for (const e of slotEl.querySelectorAll("*")) { if (inKids(e) || e.closest("text")) continue; const b = e.getBoundingClientRect(), a = b.width * b.height;
      if (a < area * 0.01 || a > area * 0.95 || p.x < b.left || p.x > b.right || p.y < b.top || p.y > b.bottom) continue;
      if (e.querySelector && [...e.querySelectorAll("*")].some((c) => c.textContent && c.textContent.trim() === "") && e.children.length > 3) continue;
      if (!best || a < best.a) best = { a, x: b.x + b.width / 2, y: b.y + b.height / 2, tag: e.tagName }; }
    return best; };
  const markerAt = (id, pos) => { const e = markerEl(pos); if (!e) return null;
    const b = e.getBoundingClientRect(); const c = { x: b.x + b.width / 2, y: b.y + b.height / 2 }; const hit = document.elementFromPoint(c.x, c.y);
    return { ...c, onTop: !!(hit && e.contains(hit)), hitTag: hit && hit.tagName }; };
  return MARKERS.map((m, i) => { const l = labelAt(REGIONS[i].label), r = regionAt(l), k = markerAt(m.id, m.position);
    return { id: m.id, region: r && { x: r.x, y: r.y, tag: r.tag }, marker: k, dist: r && k ? +Math.hypot(r.x - k.x, r.y - k.y).toFixed(1) : null }; });
};
</script>`;
fs.mkdirSync(out, { recursive: true });
const file = path.join(out, "map-probe.html");
fs.writeFileSync(file, html);

// --- Chrome over CDP ---
const port = 9300 + Math.floor(Math.random() * 500);
const profile = fs.mkdtempSync(path.join(process.env.TEMP || "/tmp", "mp-"));
const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + port, "--user-data-dir=" + profile, "--window-size=800,520", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) { await sleep(200); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
const mouse = (type, x, y, extra = {}) => send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1, pointerType: "mouse", ...extra });
const shot = async (name) => fs.writeFileSync(path.join(out, name), Buffer.from((await send("Page.captureScreenshot", { format: "png" })).result.data, "base64"));

await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 760, height: 500, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "file:///" + file.replace(/\\/g, "/") });
await sleep(3500);
const errs = await evaluate(`document.body.innerText.includes("Error") ? document.body.innerText.slice(0,300) : ""`);
const views = [];
const record = async (name) => { await sleep(700); const m = await evaluate("JSON.stringify(window.__measure())"); views.push({ name, view: await evaluate("JSON.stringify(window.__view)"), markers: JSON.parse(m) }); await shot(name + ".png"); };

await record("v1-default");
await evaluate(`window.__setView({ center: { x: 0.35, y: 0.4 }, zoom: 2.5 })`);
await record("v2-zoomed");
// Real drag in empty map space (bottom-right of the slot), 120px left / 60px up.
await mouse("mouseMoved", 700, 440); await mouse("mousePressed", 700, 440);
for (let i = 1; i <= 8; i++) await mouse("mouseMoved", 700 - 15 * i, 440 - 7.5 * i, { buttons: 1 });
await mouse("mouseReleased", 580, 380);
await record("v3-dragged");
// Real hover + click on the first marker that is on screen in this view.
const target0 = views.at(-1).markers.find((m) => m.marker && m.marker.x > 20 && m.marker.x < 740 && m.marker.y > 20 && m.marker.y < 480);
let click = null;
if (target0) {
  await evaluate("window.__sel = []; window.__hov = []; window.__events = []");
  await mouse("mouseMoved", target0.marker.x, target0.marker.y); await sleep(150);
  await mouse("mousePressed", target0.marker.x, target0.marker.y); await mouse("mouseReleased", target0.marker.x, target0.marker.y); await sleep(300);
  click = { marker: target0.id, selected: await evaluate("JSON.stringify(window.__sel)"), hovered: await evaluate("JSON.stringify(window.__hov)"),
    viewChangedByClick: await evaluate("JSON.stringify(window.__view)") !== views.at(-1).view, onTop: target0.marker.onTop, hitTag: target0.marker.hitTag,
    events: await evaluate("JSON.stringify(window.__events)") };
}
ws.close(); chrome.kill();

// Alignment: each marker's distance from its district's centre, per view (≈0 when markers live in map space).
const offsUnused = (v) => v.markers.map((m) => (m.marker && m.label ? { x: m.marker.x - m.label.x, y: m.marker.y - m.label.y } : null));
const drift = views.map((v) => ({ view: v.name, px: v.markers.map((m) => m.dist) }));
const result = { dir: path.basename(dir), renderError: errs || null, drift, click, views };
fs.writeFileSync(path.join(out, "map-probe.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ dir: path.relative(ROOT, dir), renderError: result.renderError, drift, click }));
