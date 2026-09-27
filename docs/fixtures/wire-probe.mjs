// Renders a wire-run.cjs result in headless Chrome: every leaf of the UI at its box size, with
// the run's primitives, sharing one in-page bus that records traffic and relays like the app
// (kind-aware cache, identical-state drop). No API calls. Checks, per channel:
//   - the receiver subscribed on mount (bus.on);
//   - a "state" sender emitted on mount, with a payload shaped like the contract example;
//   - fed the contract's example, the receiver's DOM changes (text, or attributes when they're
//     otherwise still; an animated box is reported as "animated", not failed).
// Also screenshots the original and the wired UI, and reports render errors.
// Usage: node wire-probe.mjs --dir=<wire-run out dir> --log=<task jsonl>
import { createRequire } from "module";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
const ROOT = "C:/Users/realy/OneDrive/Documents/Work/DashUI";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const ts = createRequire(ROOT + "/package.json")("typescript");
const arg = (k) => process.argv.find((a) => a.startsWith("--" + k + "="))?.slice(k.length + 3);
const dir = arg("dir");
const run = JSON.parse(fs.readFileSync(path.join(dir, "wire-run.json"), "utf8"));
const L = fs.readFileSync(arg("log"), "utf8").trim().split("\n").map((s) => { try { return JSON.parse(s); } catch { return {}; } });

const tx = (src) => ts.transpileModule(src, { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None } }).outputText;
const fit = fs.readFileSync(ROOT + "/app/api/SKILLS.ts", "utf8").match(/export const FIT_TEXT_SOURCE = `([\s\S]*?)`;/)[1].replace(/^export\s+/gm, "");
const prims = {};
for (const e of L) if (e.stage === "primitive" && e.code && !e.errors?.length) prims[e.type] = e.code;
const primJs = Object.values(prims).map((c) => tx(c.replace(/^export\s+/gm, ""))).join("\n");
const kinds = Object.fromEntries(run.contracts.map((c) => [c.id, c.kind]));

const page = (wired) => {
  const leaves = run.inputs.map((inp) => {
    const f = path.join(dir, inp.i + ".wired.tsx");
    const src = wired && fs.existsSync(f) ? fs.readFileSync(f, "utf8") : inp.original;
    const js = tx(src.replace(/^\s*import[^\n]*\n/gm, "").replace(/export\s+default\s+function\s+GeneratedComponent/, "function GeneratedComponent"));
    return `(function(bus){ ${js}\n return GeneratedComponent; })(makeBus(${JSON.stringify(inp.name)}))`;
  });
  return `<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<body style="background:#050505;margin:0;padding:8px;display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start">
<div id="root" style="display:contents"></div>
<script>
const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } = React;
const KINDS = ${JSON.stringify(kinds)};
window.__log = []; window.__subs = []; const cache = {};
function makeBus(me) { return {
  emit(channel, payload) {
    window.__log.push({ from: me, channel, payload: JSON.parse(JSON.stringify(payload ?? null)), t: performance.now() });
    if (KINDS[channel] !== "event") { const s = JSON.stringify(payload); if (cache[channel] === s) return; cache[channel] = s; }
    for (const sub of window.__subs) if (sub.channel === channel && sub.me !== me) try { sub.handler(payload); } catch (e) { window.__log.push({ handlerError: String(e), channel, me: sub.me }); }
  },
  on(channel, handler) { const sub = { me, channel, handler }; window.__subs.push(sub); return () => { window.__subs = window.__subs.filter((x) => x !== sub); }; },
}; }
${tx(fit)}
${primJs}
const LEAVES = [${leaves.join(",\n")}];
const META = ${JSON.stringify(run.inputs.map((x) => ({ name: x.name, box: x.box })))};
const h = React.createElement;
class Guard extends React.Component { constructor(p){super(p);this.state={e:null};} static getDerivedStateFromError(e){return {e};} render(){ return this.state.e ? h("pre",{"data-err":"1",style:{color:"#f55",whiteSpace:"pre-wrap"}},String(this.state.e.message||this.state.e)) : this.props.children; } }
function App(){ return META.map((m,i)=> h("div",{key:i,"data-leaf":m.name,className:"bg-zinc-950",style:{width:m.box.x*0.5,height:m.box.y*0.5,position:"relative",overflow:"hidden",outline:"1px solid #333"}},
  h("div",{style:{width:m.box.x,height:m.box.y,transform:"scale(0.5)",transformOrigin:"0 0"}}, h(Guard,null,h(LEAVES[i]))))); }
ReactDOM.createRoot(document.getElementById("root")).render(h(App));
window.__snap = (name) => { const b = document.querySelector('[data-leaf="' + CSS.escape(name) + '"]'); if (!b) return null;
  let attrs = ""; b.querySelectorAll("*").forEach((el) => { for (const a of el.attributes) attrs += a.name + "=" + a.value + ";"; });
  return { text: b.innerText, attrs }; };
window.__feed = (name, channel, payload) => { let n = 0; for (const s of window.__subs) if (s.me === name && s.channel === channel) { s.handler(payload); n++; } return n; };
</script>`;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9300 + Math.floor(Math.random() * 500);
const profile = fs.mkdtempSync(path.join(process.env.TEMP || "/tmp", "wp-"));
const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + port, "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
let target;
for (let i = 0; i < 50 && !target; i++) { await sleep(200); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1600, height: 1400, deviceScaleFactor: 1, mobile: false });

// Same top-level keys and JS types as the example (arrays: the first element's shape).
const shape = (v) => v === null ? "null" : Array.isArray(v) ? [v.length ? shape(v[0]) : "any"] : typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, shape(v[k])])) : typeof v;
const sameShape = (a, b) => { const x = shape(a), y = shape(b); const s = (o) => JSON.stringify(o).replace(/\["any"\]/g, "[]"); return s(x) === s(y) || s(x).replace(/\[[^\[\]]*\]/g, "[]") === s(y).replace(/\[[^\[\]]*\]/g, "[]"); };

const results = {};
for (const mode of ["original", "wired"]) {
  const file = path.join(dir, `probe-${mode}.html`); fs.writeFileSync(file, page(mode === "wired"));
  await send("Page.navigate", { url: "file:///" + file.replace(/\\/g, "/") });
  await sleep(3500);
  fs.writeFileSync(path.join(dir, `probe-${mode}.png`), Buffer.from((await send("Page.captureScreenshot", { format: "png" })).result.data, "base64"));
  const errors = await evaluate(`[...document.querySelectorAll("[data-err]")].map((e) => ({ leaf: e.closest("[data-leaf]").dataset.leaf, error: e.textContent.slice(0, 200) }))`);
  results[mode] = { errors };
  if (mode === "original") continue;
  const log = await evaluate("window.__log");
  const subs = await evaluate("window.__subs.map((s) => ({ me: s.me, channel: s.channel }))");
  const channels = [];
  for (const ch of run.channelList) {
    const k = run.contracts.find((c) => c.id === ch.id);
    if (!k) { channels.push({ id: ch.id, skipped: "no contract" }); continue; }
    const r = { id: ch.id, kind: k.kind, subscribed: subs.some((s) => s.me === ch.to && s.channel === ch.id) };
    const sent = log.filter((e) => e.channel === ch.id && e.from === ch.from);
    r.emittedOnMount = k.kind === "state" ? sent.length > 0 : "n/a (event)";
    if (sent.length) r.payloadShapeOk = sent.every((e) => sameShape(e.payload, k.example));
    // 4 samples before and after feeding the example to the receiver only. It reacts when a
    // still signal (text or attributes) changes, or when an animated box's attribute size moves
    // outside its whole before-range (e.g. meters lighting up).
    const snaps = async () => { const s = []; for (let i = 0; i < 4; i++) { s.push(await evaluate(`window.__snap(${JSON.stringify(ch.to)})`)); await sleep(120); } return s; };
    const before = await snaps();
    const fed = await evaluate(`window.__feed(${JSON.stringify(ch.to)}, ${JSON.stringify(ch.id)}, ${JSON.stringify(k.example)})`); await sleep(200);
    const after = await snaps();
    const still = (key) => new Set(before.map((s) => s[key])).size === 1;
    const changed = (key) => still(key) && after.every((s) => s[key] !== before[0][key]);
    const lens = (ss) => ss.map((s) => s.attrs.length);
    const shifted = Math.max(...lens(after)) < Math.min(...lens(before)) || Math.min(...lens(after)) > Math.max(...lens(before));
    r.handlers = fed;
    r.reacts = !fed ? "no handler" : changed("text") || changed("attrs") || shifted ? true : !still("text") || !still("attrs") ? "animated (can't tell)" : false;
    channels.push(r);
  }
  results.wired.channels = channels;
  results.wired.handlerErrors = log.filter((e) => e.handlerError);
}
ws.close(); chrome.kill();
const ch = results.wired.channels.filter((c) => !c.skipped);
const summary = {
  renderErrors: { original: results.original.errors.length, wired: results.wired.errors.length },
  channels: ch.length,
  subscribed: ch.filter((c) => c.subscribed).length,
  stateEmittedOnMount: `${ch.filter((c) => c.kind === "state" && c.emittedOnMount === true).length}/${ch.filter((c) => c.kind === "state").length}`,
  payloadShapeOk: `${ch.filter((c) => c.payloadShapeOk === true).length}/${ch.filter((c) => c.payloadShapeOk !== undefined).length}`,
  reacts: ch.filter((c) => c.reacts === true).length, animated: ch.filter((c) => c.reacts === "animated (can't tell)").length, noReaction: ch.filter((c) => c.reacts === false || c.reacts === "no handler").map((c) => c.id),
  handlerErrors: results.wired.handlerErrors.length,
};
fs.writeFileSync(path.join(dir, "wire-probe.json"), JSON.stringify({ summary, results }, null, 2));
console.log(JSON.stringify(summary, null, 1));
