// Focal-primitive agent on every logged run's hoist. Default (--variant=app): the app's
// FOCAL_SYSTEM_PROMPT, focalRequest and validateFocal. A-D: the candidate prompts tested before it.
// Scores picks against per-task labels; measures latency per model config.
// Usage: node focal-check.cjs --out=<dir> [--configs=haiku,s5off,o5off,o5low] [--samples=1] [--variant=app|A|B|C|D] (count sentence)
const fs = require("fs"), path = require("path");
const { load, ROOT } = require("./lib/load.cjs");
const { stripCodeFences, heldTypeNames, derivePrimitiveUsage, validateFocal } = load(ROOT + "/app/utils/helpers.ts");
const SK = load(ROOT + "/app/api/SKILLS.ts");
const Anthropic = require(ROOT + "/node_modules/@anthropic-ai/sdk").default;
const arg = (k, d) => process.argv.find((a) => a.startsWith("--" + k + "="))?.slice(k.length + 3) ?? d;
const OUT = arg("out", ROOT + "/docs/fixtures/model-exp/focal/run1");
const SAMPLES = +arg("samples", 1);
const APP = arg("variant", "app") === "app";
const env = fs.readFileSync(ROOT + "/.env.local", "utf8");
const client = new Anthropic({ apiKey: env.match(/^\s*CLAUDE_API_KEY\s*=\s*["']?([^"'\r\n]+)/m)[1] });

const COUNT = { A: "Pick 1 to 3.", B: "Pick 1 to 3 — only as many as clearly pass both tests.", C: "Pick 1 to 3 — most UIs have only 1 or 2.", D: "Pick 1 or 2." }[arg("variant", "app")];
const MAX = ["app", "D"].includes(arg("variant", "app")) ? 2 : 3;
const FOCAL_SYSTEM_PROMPT = `You pick the FOCAL primitives of ONE multi-component UI: the ${MAX === 2 ? "1 or 2" : "1 to 3"} elements a person looking at the whole UI sees first and recognizes it by.

You are given the task, each component's role, and the UI's primitive library: each type's name, description, and the component features built from it (USED BY).

Pick a type only if it passes BOTH tests:
- PURPOSE: the UI's main job is done through it or shown on it; without it, the UI could not do what the task asks.
- IDENTITY: it is visually central to the UI's entire core identity — draw a small icon for this UI, and this element is in it.
${COUNT}

OUTPUT: ONLY this JSON (no markdown, no prose): {"focal": ["<exact type name>", ...]}`;

const CONFIGS = {
  haiku: { model: "claude-haiku-4-5", max_tokens: 1000 },
  s5off: { model: "claude-sonnet-5", max_tokens: 1000, thinking: { type: "disabled" }, output_config: { effort: "low" } },
  o5off: { model: "claude-opus-5", max_tokens: 1000, thinking: { type: "disabled" }, output_config: { effort: "low" } },
  o5low: { model: "claude-opus-5", max_tokens: 8000, thinking: { type: "adaptive" }, output_config: { effort: "low" } },
};

// Labels (agreed 2026-09-27): each group must be hit when a type of it exists; allowed = borderline, not an extra.
const LABELS = [
  { task: /dj/i, groups: [/^JogWheel$/], allowed: /^Waveform/ },
  { task: /cyberpunk/i, groups: [/^Map(Canvas|Surface)$/, /Portrait|^BodyDiagram$|^ModelViewer$/], allowed: /^$/ },
  { task: /aerospace/i, groups: [/^AttitudeIndicator$/], allowed: /^$/ },
  { task: /radio/i, groups: [/^(RotaryDial|FrequencyScale|TuningNeedle)$/], allowed: /^StationArt$/ },
];

function loadRuns() {
  const runs = [];
  for (const f of fs.readdirSync(ROOT + "/logs")) {
    let cur = null;
    for (const line of fs.readFileSync(ROOT + "/logs/" + f, "utf8").split("\n")) {
      let l; try { l = JSON.parse(line); } catch { continue; }
      if (l.stage === "run:start") runs.push(cur = { id: f.slice(5, -6) + (runs.filter((r) => r.file === f).length ? "b" : ""), file: f, task: l.task });
      if (!cur) continue;
      if (l.stage === "hoist" && l.hoist) cur.hoist = l.hoist;
      if (l.stage === "run:style|hoist|layout") cur.defs = l.resolvedDefs.map((d) => (typeof d === "string" ? JSON.parse(d) : d));
    }
  }
  return runs.filter((r) => r.hoist && r.defs);
}

const userMessage = (r) => APP ? SK.focalRequest(r.task, r.defs, r.hoist.library, derivePrimitiveUsage(r.hoist)) : legacyMessage(r);
const legacyMessage = (r) => {
  const usage = derivePrimitiveUsage(r.hoist);
  return `Task: ${r.task}\n\nComponents:\n` + r.defs.map((d) => `- "${d.name}": ${d.role ?? ""}`).join("\n")
    + `\n\nPRIMITIVE LIBRARY:\n` + r.hoist.library.map((t) => `- ${t.type}: ${t.description}\n    USED BY: ` + usage[t.type].map((u) => `"${u.component}" -> "${u.feature}"`).join("; ")).join("\n");
};

// Validate + deterministic repair (a held type -> its holder).
function check(raw, library) {
  if (APP) { let v; try { v = JSON.parse(stripCodeFences(raw.trim())); } catch { return { error: "Output is not the JSON object {\"focal\": [...]}." }; } const r = validateFocal(v, library); return r.focal ? { picks: r.focal, repairs: r.repairs } : { error: r.error }; }
  let v; try { v = JSON.parse(stripCodeFences(raw.trim())); } catch { return { error: "Output is not the JSON object {\"focal\": [...]}." }; }
  if (!Array.isArray(v?.focal)) return { error: "Output must be {\"focal\": [type names]}." };
  const names = new Set(library.map((t) => t.type));
  const repairs = [];
  const picks = [...new Set(v.focal.map((n) => {
    const holder = library.find((t) => heldTypeNames(t).includes(n));
    if (holder) { repairs.push(n + "->" + holder.type); return holder.type; }
    return n;
  }))];
  for (const n of picks) if (!names.has(n)) return { error: `"${n}" is not a library type name.` };
  if (picks.length < 1 || picks.length > MAX) return { error: `Pick 1 to ${MAX} types; got ${picks.length}.` };
  return { picks, repairs };
}

function score(r, picks) {
  const lab = LABELS.find((l) => l.task.test(r.task));
  const types = r.hoist.library.map((t) => t.type);
  const groups = lab.groups.filter((g) => types.some((t) => g.test(t)));
  const hit = groups.filter((g) => picks.some((p) => g.test(p))).length;
  const extras = picks.filter((p) => !lab.groups.some((g) => g.test(p)) && !lab.allowed.test(p));
  const borderline = picks.filter((p) => lab.allowed.test(p));
  return { groups: groups.length, hit, extras, borderline };
}

async function one(cfgName, r, sample) {
  const cfg = CONFIGS[cfgName];
  let previousError, attempts = 0, secs = 0, last;
  for (let n = 1; n <= 3; n++) {
    attempts = n;
    const t0 = Date.now();
    const msg = await client.messages.create({
      ...cfg, system: APP ? SK.FOCAL_SYSTEM_PROMPT : FOCAL_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage(r) + (previousError ? `\n\nYour previous answer was REJECTED: ${previousError}` : "") }],
    });
    secs += (Date.now() - t0) / 1000;
    const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    last = { raw, stop: msg.stop_reason, inTok: msg.usage.input_tokens, outTok: msg.usage.output_tokens, callSecs: (Date.now() - t0) / 1000 };
    const c = check(raw, r.hoist.library);
    if (!c.error) return { cfg: cfgName, run: r.id, task: r.task, sample, attempts, secs, ...last, ...c, ...score(r, c.picks) };
    previousError = c.error;
  }
  return { cfg: cfgName, run: r.id, task: r.task, sample, attempts, secs, ...last, error: previousError };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const runs = loadRuns();
  const cfgs = arg("configs", Object.keys(CONFIGS).join(",")).split(",");
  const jobs = [];
  for (const c of cfgs) for (const r of runs) for (let s = 1; s <= SAMPLES; s++) jobs.push([c, r, s]);
  const results = [];
  const POOL = 6;
  let i = 0;
  await Promise.all(Array.from({ length: POOL }, async () => {
    while (i < jobs.length) {
      const [c, r, s] = jobs[i++];
      try { const res = await one(c, r, s); results.push(res); console.log(`${c.padEnd(6)} ${r.id.padEnd(15)} ${r.task.slice(0, 14).padEnd(14)} ${res.error ? "FAIL " + res.error : `[${res.picks.join(", ")}] hit ${res.hit}/${res.groups}${res.extras.length ? " EXTRA " + res.extras : ""}${res.repairs.length ? " repair " + res.repairs : ""}`} ${res.secs.toFixed(1)}s`); }
      catch (e) { results.push({ cfg: c, run: r.id, error: String(e.message || e) }); console.log(c, r.id, "ERROR", e.message); }
    }
  }));
  fs.writeFileSync(OUT + "/results.json", JSON.stringify({ prompt: APP ? SK.FOCAL_SYSTEM_PROMPT : FOCAL_SYSTEM_PROMPT, results }, null, 1));
  console.log("\ncfg     n  valid  fullHit  withExtras  borderline  meanPicks  meanSecs  p90Secs  maxSecs  retries");
  for (const c of cfgs) {
    const rs = results.filter((x) => x.cfg === c), ok = rs.filter((x) => !x.error);
    const s = ok.map((x) => x.secs).sort((a, b) => a - b);
    console.log(`${c.padEnd(6)} ${String(rs.length).padStart(2)}  ${String(ok.length).padStart(5)}  ${String(ok.filter((x) => x.hit === x.groups).length).padStart(7)}  ${String(ok.filter((x) => x.extras.length).length).padStart(10)}  ${String(ok.filter((x) => x.borderline.length).length).padStart(10)}  ${(ok.reduce((a, x) => a + x.picks.length, 0) / ok.length).toFixed(2).padStart(9)}  ${(s.reduce((a, b) => a + b, 0) / s.length).toFixed(1).padStart(8)}  ${s[Math.floor(s.length * 0.9)]?.toFixed(1).padStart(7)}  ${s[s.length - 1]?.toFixed(1).padStart(7)}  ${ok.filter((x) => x.attempts > 1).length}`);
  }
})();
