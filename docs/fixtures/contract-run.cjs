// Contract agent (generateContracts: CONTRACT_SYSTEM_PROMPT + validateContracts + retries) on
// logged UIs, as if Wire were pressed on each: the latest run's plan (channels via buildChannels)
// and each leaf's final code. Measures time per call (target <= 20s), validity and tokens.
// Usage: node contract-run.cjs --out=<dir> [--configs=o5low,o48off] [--samples=2] [--tasks=<id>,...] [--parallel=4] [--split=8]
// With --split, use --parallel=1 so each UI's calls run at once like one Wire press, without other UIs' calls.
const fs = require("fs"), path = require("path");
const { load, ROOT } = require("./lib/load.cjs");
const arg = (k, d) => process.argv.find((a) => a.startsWith("--" + k + "="))?.slice(k.length + 3) ?? d;
process.env.CLAUDE_API_KEY = fs.readFileSync(ROOT + "/.env.local", "utf8").match(/^\s*CLAUDE_API_KEY\s*=\s*["']?([^"'\r\n]+)/m)[1];
process.env.NODE_ENV = "production"; // keep runLog out of logs/manual.jsonl
const { buildChannels } = load(ROOT + "/app/utils/helpers.ts");
const { generateContracts, generateContractsSplit } = load(ROOT + "/app/utils/contractGen.ts");
const SPLIT = +arg("split", 0); // >0: generateContractsSplit with at most this many channels per call (all calls of a UI in parallel)

const OUT = arg("out", ROOT + "/docs/fixtures/model-exp/contracts");
const SAMPLES = +arg("samples", 2);
const PARALLEL = +arg("parallel", 4);
// One of each task, plus the most channels (Synthesizer, 19) and the most code (Cyberpunk 1790488443585).
const TASKS = arg("tasks", "1790503859796,1790499847643,1790488443585,1790493337400,1790505558905,1790360963510,1790357285132,1790508636151").split(",");
const CONFIGS = {
  o5low: { model: "claude-opus-5", max_tokens: 16000, thinking: { type: "adaptive" }, output_config: { effort: "low" } },
  o48off: { model: "claude-opus-4-8", max_tokens: 16000, thinking: { type: "disabled" }, output_config: { effort: "max" } },
};
const configs = arg("configs", "o5low,o48off").split(",");

// The latest run of a task log: plan defs + each leaf's final code, by component name.
function loadUI(id) {
  const ev = fs.readFileSync(`${ROOT}/logs/task-${id}.jsonl`, "utf8").split("\n").filter(Boolean).map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
  const starts = ev.map((e, i) => (e.stage === "run:start" ? i : -1)).filter((i) => i >= 0);
  const last = ev.slice(starts.length ? starts[starts.length - 1] : 0);
  const defs = last.find((e) => e.stage === "plan").defs;
  const code = {};
  for (const e of last) if (e.stage === "leaf:done" && e.code) code[e.leaf] = e.code;
  const channels = buildChannels(defs);
  const components = defs.map((d) => ({ name: d.name, role: d.role, code: code[d.name] ?? "" }));
  const missing = [...new Set(channels.flatMap((c) => [c.from, c.to]))].filter((n) => !code[n]);
  if (missing.length) throw new Error(`task ${id}: no final code for ${missing.join(", ")}`);
  return { id, task: last[0].task, channels, components };
}

async function pool(jobs, n) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < jobs.length) { const j = i++; out[j] = await jobs[j](); } }));
  return out;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const uis = TASKS.map(loadUI);
  const jobs = [];
  for (const ui of uis) for (const cfg of configs) for (let s = 1; s <= SAMPLES; s++) jobs.push(async () => {
    const t0 = Date.now();
    let row;
    if (SPLIT) {
      const r = await generateContractsSplit(ui.channels, ui.components, undefined, CONFIGS[cfg], SPLIT);
      // attempts = each call's first attempt (the calls run at once); calls = the full per-call record.
      row = { task: ui.id, name: ui.task, cfg, sample: s, channels: ui.channels.length, totalSecs: (Date.now() - t0) / 1000, calls: r.calls, attempts: r.calls.map((c) => c.attempts[0]), ok: !r.failed.length, error: r.calls.find((c) => c.error)?.error, contracts: r.contracts };
      console.log(`${ui.id} ${cfg} #${s}: ${row.ok ? "ok" : "FAILED " + r.failed.length + " channel(s)"} in ${row.totalSecs.toFixed(1)}s, calls [${r.calls.map((c) => `${c.channels}ch ${c.attempts.map((a) => a.secs.toFixed(1) + "s").join("+")}`).join(", ")}]`);
    } else {
      const r = await generateContracts(ui.channels, ui.components, undefined, CONFIGS[cfg]);
      row = { task: ui.id, name: ui.task, cfg, sample: s, channels: ui.channels.length, totalSecs: (Date.now() - t0) / 1000, attempts: r.attempts, ok: !!r.contracts, error: r.error, contracts: r.contracts };
      console.log(`${ui.id} ${cfg} #${s}: ${row.ok ? "ok" : "FAILED"} in ${row.totalSecs.toFixed(1)}s, ${r.attempts.length} attempt(s)${r.attempts[0].error ? " — first error: " + r.attempts[0].error.slice(0, 140) : ""}`);
    }
    fs.writeFileSync(`${OUT}/${ui.id}.${cfg}.${s}.json`, JSON.stringify({ ...row, channelList: ui.channels }, null, 2));
    return row;
  });
  const rows = await pool(jobs, PARALLEL);
  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify({ configs: Object.fromEntries(configs.map((c) => [c, CONFIGS[c]])), tasks: TASKS, rows: rows.map(({ contracts, ...r }) => r) }, null, 2));

  // Summary per config: time (total and first attempt), first-try validity, tokens, kinds.
  const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
  for (const cfg of configs) {
    const rs = rows.filter((r) => r.cfg === cfg);
    const tot = rs.map((r) => r.totalSecs), first = rs.map((r) => r.attempts[0].secs);
    const kinds = rs.flatMap((r) => r.contracts ?? []).reduce((a, c) => ((a[c.kind] = (a[c.kind] ?? 0) + 1), a), {});
    console.log(`\n${cfg}: ${rs.filter((r) => r.ok).length}/${rs.length} ok, ${rs.filter((r) => !r.attempts[0].error).length}/${rs.length} valid on the first try`);
    console.log(`  total secs: median ${med(tot).toFixed(1)}, max ${Math.max(...tot).toFixed(1)}, over 20s: ${tot.filter((t) => t > 20).length}/${rs.length}; first attempt median ${med(first).toFixed(1)}`);
    console.log(`  tokens (first attempt): in median ${med(rs.map((r) => r.attempts[0].inTok ?? 0))}, out median ${med(rs.map((r) => r.attempts[0].outTok ?? 0))}; kinds ${JSON.stringify(kinds)}`);
  }
})();
