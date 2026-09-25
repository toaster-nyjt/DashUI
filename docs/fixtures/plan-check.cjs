// One plan call through the REAL PLAN_SYSTEM_PROMPT and the plan route's user message, then
// the automatic checks: validateConnectivity (the app's retry gate), mirrored edges, name
// format/uniqueness, all features enabled by default, feature-name shape.
// Usage: node plan-check.cjs --task="DJ Table" --model=<id> --effort=<e> --out=<json>
const fs = require("fs");
const { load, ROOT } = require("./lib/load.cjs");
const SK = load(ROOT + "/app/api/SKILLS.ts");
const { validateConnectivity, stripCodeFences } = load(ROOT + "/app/utils/helpers.ts");
const Anthropic = require(ROOT + "/node_modules/@anthropic-ai/sdk").default;
const arg = (k, d) => process.argv.find((a) => a.startsWith("--" + k + "="))?.slice(k.length + 3) ?? d;
const task = arg("task"), MODEL = arg("model"), EFFORT = arg("effort"), out = arg("out");
const width = 2497, height = 1276; // the full window of the logged end-to-end runs
const env = fs.readFileSync(ROOT + "/.env.local", "utf8");
const client = new Anthropic({ apiKey: env.match(/^\s*CLAUDE_API_KEY\s*=\s*["']?([^"'\r\n]+)/m)[1] });
// Same user message as app/api/plan/route.ts (no retry note).
const sizeNote = `\nAvailable area: ${Math.round(width)}px wide by ${Math.round(height)}px tall. Make ALL decisions relative to this space — only create multiple components if each gets enough pixel area to be legible and useful; in a small area, prefer a single focused component.`;

(async () => {
  const t0 = Date.now();
  const msg = await client.messages.stream({
    model: MODEL, max_tokens: 64000, thinking: { type: "adaptive" }, output_config: { effort: EFFORT },
    system: SK.PLAN_SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Task: ${task}${sizeNote}` }],
  }).finalMessage();
  const secs = (Date.now() - t0) / 1000;
  const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const meta = { task, model: MODEL, effort: EFFORT, secs, outTok: msg.usage.output_tokens, inTok: msg.usage.input_tokens, stop: msg.stop_reason };
  let defs;
  try { defs = JSON.parse(stripCodeFences(raw)); } catch { fs.writeFileSync(out, JSON.stringify({ meta, invalidJson: true, raw }, null, 2)); console.log(`${secs.toFixed(0)}s INVALID JSON`); return; }

  const issues = [];
  const conn = validateConnectivity(defs);
  if (!conn.ok) issues.push("connectivity: " + conn.error);
  const names = defs.map((d) => d.name);
  if (new Set(names).size !== names.length) issues.push("duplicate names");
  for (const d of defs) {
    if (!/^[^:]+: \S/.test(d.name)) issues.push(`name not "<Theme>: <Component>": ${d.name}`);
    const all = d.features.map((_, i) => i);
    if (JSON.stringify([...d.defaultActiveIdx].sort((a, b) => a - b)) !== JSON.stringify(all)) issues.push(`${d.name}: not every feature enabled by default`);
    for (const f of d.features) if (f.split(/\s+/).length > 4) issues.push(`${d.name}: feature over 4 words: "${f}"`);
    // mirrored edges: A targets B  <=>  B lists A as an effector
    for (const t of d.connectivity?.targets ?? []) {
      const b = defs.find((x) => x.name === t.name);
      if (b && !(b.connectivity?.effectors ?? []).some((e) => e.name === d.name)) issues.push(`unmirrored: ${d.name} -> ${t.name}`);
    }
    for (const e of d.connectivity?.effectors ?? []) {
      const a = defs.find((x) => x.name === e.name);
      if (a && !(a.connectivity?.targets ?? []).some((t) => t.name === d.name)) issues.push(`unmirrored: ${e.name} -> ${d.name} (effector only)`);
    }
  }
  const edges = defs.reduce((n, d) => n + (d.connectivity?.targets?.length ?? 0), 0);
  const features = defs.reduce((n, d) => n + d.features.length, 0);
  const descLen = defs.flatMap((d) => d.connectivity?.targets ?? []).map((t) => t.description.length);
  const summary = { components: defs.length, features, edges, meanEdgeDescChars: descLen.length ? Math.round(descLen.reduce((a, b) => a + b, 0) / descLen.length) : 0, issues };
  fs.writeFileSync(out, JSON.stringify({ meta, summary, defs }, null, 2));
  console.log(`${secs.toFixed(0)}s ${meta.outTok} out | ${defs.length} comps, ${features} features, ${edges} edges, desc ${summary.meanEdgeDescChars} ch | ${issues.length ? "ISSUES: " + issues.join(" ; ") : "clean"}`);
})();
