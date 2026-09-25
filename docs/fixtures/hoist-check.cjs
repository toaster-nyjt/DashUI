// One hoist run through the REAL app code (HOIST_SYSTEM_PROMPT + COMPONENT_PROTOCOL, validateHoist),
// with the hoist route's config. Usage: node hoist-check.cjs --out=<json>
const fs = require("fs"), path = require("path");
const { load, ROOT } = require("./lib/load.cjs");
const SK = load(ROOT + "/app/api/SKILLS.ts");
const { validateHoist, stripCodeFences } = load(ROOT + "/app/utils/helpers.ts");
const Anthropic = require(ROOT + "/node_modules/@anthropic-ai/sdk").default;
const out = process.argv.find((a) => a.startsWith("--out="))?.slice(6) ?? "hoist-check.json";
const arg = (k, d) => process.argv.find((a) => a.startsWith("--" + k + "="))?.slice(k.length + 3) ?? d;
const components = JSON.parse(fs.readFileSync(arg("in", ROOT + "/docs/fixtures/dj-table.components.json"), "utf8"));
const MODEL = arg("model", "claude-opus-4-8"), EFFORT = arg("effort", "low");
const env = fs.readFileSync(ROOT + "/.env.local", "utf8");
const client = new Anthropic({ apiKey: env.match(/^\s*CLAUDE_API_KEY\s*=\s*["']?([^"'\r\n]+)/m)[1] });
(async () => {
  const t0 = Date.now();
  const msg = await client.messages.stream({
    model: MODEL, max_tokens: 64000, thinking: { type: "adaptive" }, output_config: { effort: EFFORT },
    system: SK.HOIST_SYSTEM_PROMPT + SK.COMPONENT_PROTOCOL,
    messages: [{ role: "user", content: `Task: DJ Table\nComponents: ${JSON.stringify(components)}` }],
  }).finalMessage();
  const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  fs.writeFileSync(out + ".raw.txt", raw);
  let result;
  try { result = JSON.parse(stripCodeFences(raw.trim())); } catch { console.log(`hoist ${((Date.now() - t0) / 1000).toFixed(0)}s  ${msg.usage.output_tokens} out  INVALID JSON`); fs.writeFileSync(out, JSON.stringify({ invalidJson: true, secs: (Date.now() - t0) / 1000, outTok: msg.usage.output_tokens })); return; }
  result._meta = { model: MODEL, secs: (Date.now() - t0) / 1000, outTok: msg.usage.output_tokens, inTok: msg.usage.input_tokens, stop: msg.stop_reason };
  fs.writeFileSync(out, JSON.stringify(result, null, 2));
  const v = validateHoist(result, components.map((c) => ({ name: c.name, features: c.features })));
  console.log(`hoist ${((Date.now() - t0) / 1000).toFixed(0)}s  ${msg.usage.output_tokens} out  valid=${v.ok}${v.error ? " " + v.error : ""}  types=${result.library.length}`);
  for (const t of result.library) console.log(`  ${t.type.padEnd(16)} ${JSON.stringify(t.props)}`);
})();
