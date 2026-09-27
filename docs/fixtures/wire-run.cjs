// The Wire action (runWire: contract agent split per receiver, then one wiring call per component,
// all in parallel, each checked by checkLeafWiring) on ONE logged UI, as if Wire were pressed:
// the latest run's channels (buildChannels) and each leaf's final code. Saves each wired leaf and
// the timings; render-check the result with wire-probe.mjs.
// Usage: node wire-run.cjs --task=<taskID> --out=<dir>
const fs = require("fs");
const { load, ROOT } = require("./lib/load.cjs");
const arg = (k, d) => process.argv.find((a) => a.startsWith("--" + k + "="))?.slice(k.length + 3) ?? d;
process.env.CLAUDE_API_KEY = fs.readFileSync(ROOT + "/.env.local", "utf8").match(/^\s*CLAUDE_API_KEY\s*=\s*["']?([^"'\r\n]+)/m)[1];
process.env.NODE_ENV = "production"; // keep runLog out of logs/manual.jsonl
// --budget=N: hard cap on model calls (retries included); the call past it throws instead of running.
const BUDGET = +arg("budget", Infinity);
const Anthropic = require(ROOT + "/node_modules/@anthropic-ai/sdk").default;
const stream = Anthropic.Messages.prototype.stream;
let used = 0;
Anthropic.Messages.prototype.stream = function (...a) { if (++used > BUDGET) throw new Error(`call budget of ${BUDGET} reached`); return stream.apply(this, a); };
const { buildChannels } = load(ROOT + "/app/utils/helpers.ts");
const { runWire } = load(ROOT + "/app/utils/wireGen.ts");

const TASK = arg("task"), OUT = arg("out");
const ev = fs.readFileSync(`${ROOT}/logs/task-${TASK}.jsonl`, "utf8").split("\n").filter(Boolean).map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
const starts = ev.map((e, i) => (e.stage === "run:start" ? i : -1)).filter((i) => i >= 0);
const last = ev.slice(starts.length ? starts[starts.length - 1] : 0);
const defs = last.find((e) => e.stage === "plan").defs;
const code = {}, box = {};
for (const e of last) { if (e.stage === "leaf:done" && e.code) code[e.leaf] = e.code; if (e.stage === "leaf:start") box[e.leaf] = e.boxSize; }
const channels = buildChannels(defs);
const components = defs.map((d) => ({ name: d.name, role: d.role, code: code[d.name] ?? "" }));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const t0 = Date.now(), timeline = [];
  const r = await runWire(components, channels, undefined, (e) => timeline.push({ t: (Date.now() - t0) / 1000, type: e.type, name: e.name }));
  const leaves = r.results.map((x) => ({ name: x.name, ok: !!x.code, attempts: x.attempts, error: x.error }));
  r.results.forEach((x, i) => x.code && fs.writeFileSync(`${OUT}/${i}.wired.tsx`, x.code));
  const calls = r.contracts.calls.reduce((n, c) => n + c.attempts.length, 0) + r.results.reduce((n, x) => n + x.attempts.length, 0);
  const summary = {
    task: TASK, channels: channels.length, contracted: r.contracts.contracts.length, secs: r.secs,
    contractSecs: timeline.find((e) => e.type === "contracts")?.t, calls,
    leaves: leaves.map((l) => ({ name: l.name, ok: l.ok, attempts: l.attempts.map((a) => ({ secs: a.secs, outTok: a.outTok, error: a.error?.slice(0, 200) })) })),
    failed: r.failed, halfOpen: r.halfOpen, timeline,
  };
  fs.writeFileSync(`${OUT}/wire-run.json`, JSON.stringify({ ...summary, contracts: r.contracts.contracts, channelList: channels,
    inputs: r.results.map((x, i) => ({ i, name: x.name, box: box[x.name], original: code[x.name] })) }, null, 2));
  console.log(JSON.stringify(summary, null, 1));
})();
