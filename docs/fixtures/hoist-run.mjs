// Hand-run of HOIST_SYSTEM_PROMPT (PRIMITIVE_HOIST_PLAN §2.9) against the DJ fixture.
// Usage: node hoist-run.mjs [--validate-only]
import { createRequire } from "module";
import fs from "fs";
import path from "path";

const ROOT = "C:/Users/realy/OneDrive/Documents/Work/DashUI";
const OUT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const require = createRequire(ROOT + "/package.json");

// Pull template-literal prompts straight from the reference file (neither has ${}).
const ref = fs.readFileSync(ROOT + "/docs/SKILLS.primitives.reference.ts", "utf8");
const grab = (name) => {
  const m = ref.match(new RegExp("export const " + name + " = `([\\s\\S]*?)`;"));
  if (!m) throw new Error("missing " + name);
  return m[1];
};
const HOIST = grab("HOIST_SYSTEM_PROMPT");
const PROTOCOL = grab("COMPONENT_PROTOCOL");
const components = JSON.parse(fs.readFileSync(ROOT + "/docs/fixtures/dj-table.components.json", "utf8"));
const task = "DJ Table";

// Coverage validator (§2.5.3), structural [] allowed.
function validate(result) {
  const errs = [], warns = [];
  const lib = result.library ?? [];
  const types = new Set(lib.map((t) => t.type));
  if (types.size !== lib.length) errs.push("duplicate library type names");
  // Type names become in-scope JSX identifiers: PascalCase, and must not shadow React,
  // the host's own names, or JS/DOM globals the generated code might use.
  const RESERVED = new Set([
    "React", "Fragment", "Suspense", "StrictMode", "Profiler", "Component", "PureComponent",
    "App", "GeneratedComponent",
    "Array", "Object", "String", "Number", "Boolean", "Symbol", "BigInt", "Date", "Math", "JSON",
    "Map", "Set", "WeakMap", "WeakSet", "Promise", "Error", "RegExp", "Proxy", "Reflect", "Intl",
    "Image", "Audio", "Option", "Event", "Node", "Element", "Text", "Range", "Selection",
    "Window", "Document", "File", "Blob", "URL", "Request", "Response", "Headers", "Worker",
    "WebSocket", "AudioContext", "Animation",
  ]);
  for (const t of types) {
    if (!/^[A-Z][A-Za-z0-9]*$/.test(t)) errs.push(`type "${t}" is not a PascalCase JSX identifier`);
    else if (RESERVED.has(t)) errs.push(`type "${t}" shadows a React/host/global name; rename it`);
  }
  const used = new Set();
  for (const c of components) {
    const out = (result.components ?? []).find((o) => o.name === c.name);
    if (!out) { errs.push(`missing component "${c.name}"`); continue; }
    const keys = Object.keys(out.features ?? {});
    for (const f of c.features) if (!keys.includes(f)) errs.push(`"${c.name}": missing feature "${f}"`);
    for (const k of keys) if (!c.features.includes(k)) errs.push(`"${c.name}": unknown feature key "${k}"`);
    for (const [f, ts] of Object.entries(out.features ?? {})) {
      if (!Array.isArray(ts)) { errs.push(`"${c.name}"/"${f}": not an array`); continue; }
      if (new Set(ts).size !== ts.length) errs.push(`"${c.name}"/"${f}": type listed twice`);
      for (const t of ts) { if (!types.has(t)) errs.push(`"${c.name}"/"${f}": unknown type "${t}"`); used.add(t); }
      if (!ts.length) warns.push(`structural []: "${c.name}"/"${f}"`);
    }
  }
  for (const t of types) if (!used.has(t)) errs.push(`unused library type "${t}"`);
  return { errs, warns };
}

const effort = (process.argv.find((a) => a.startsWith("--effort=")) ?? "--effort=medium").slice(9);
const RAW = OUT + `/hoist-raw-${effort}.txt`;
let raw;
if (process.argv.includes("--validate-only")) {
  raw = fs.readFileSync(RAW, "utf8");
} else {
  const env = fs.readFileSync(ROOT + "/.env.local", "utf8");
  const apiKey = env.match(/^\s*CLAUDE_API_KEY\s*=\s*["']?([^"'\r\n]+)/m)?.[1];
  if (!apiKey) throw new Error("CLAUDE_API_KEY not found in .env.local");
  const Anthropic = require("@anthropic-ai/sdk").default ?? require("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });
  const t0 = Date.now();
  // Same config as the plan route (the other holistic, reasoning-heavy design call).
  const msg = await client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort },
    system: HOIST + PROTOCOL,
    messages: [{ role: "user", content: `Task: ${task}\nComponents: ${JSON.stringify(components)}` }],
  }).finalMessage();
  raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  fs.writeFileSync(RAW, raw);
  console.log(`time ${((Date.now() - t0) / 1000).toFixed(1)}s  usage ${JSON.stringify(msg.usage)}  stop ${msg.stop_reason}`);
}

const result = JSON.parse(raw.replace(/^```[a-z]*\s*\n?/i, "").replace(/\n?```\s*$/i, ""));
fs.writeFileSync(OUT + `/hoist-result-${effort}.json`, JSON.stringify(result, null, 2));
const { errs, warns } = validate(result);
console.log(`\nLIBRARY (${result.library.length} types):`);
for (const t of result.library) console.log(`  ${t.type} ${JSON.stringify(t.props)}\n      ${t.description}`);
console.log("\nASSIGNMENT:");
for (const c of result.components) {
  console.log(`  ${c.name}`);
  for (const [f, ts] of Object.entries(c.features)) console.log(`    ${f.padEnd(22)} -> ${JSON.stringify(ts)}`);
}
console.log(`\nERRORS (${errs.length}):`); errs.forEach((e) => console.log("  " + e));
console.log(`WARNINGS (${warns.length}):`); warns.forEach((w) => console.log("  " + w));
