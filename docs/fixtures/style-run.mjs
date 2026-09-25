// 1) validateStyleSheet on the OLD sheet (should flag), 2) new STYLE prompt through a
// validate-and-retry loop (as the route will), same call shape as app/api/style/route.ts.
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
const ROOT = "C:/Users/realy/OneDrive/Documents/Work/DashUI";
const OUT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const require = createRequire(ROOT + "/package.json");
const ts = require("typescript");
const load = (src, dest, rw = (s) => s) => { fs.writeFileSync(dest, ts.transpileModule(rw(fs.readFileSync(src, "utf8")), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText); return import(pathToFileURL(dest).href + "?t=" + Date.now()); };
const SK = await load(ROOT + "/app/api/SKILLS.ts", OUT + "/_skills.mjs");
const REF = await load(ROOT + "/docs/SKILLS.primitives.reference.ts", OUT + "/_ref.mjs", (s) => s.replace('"../app/api/SKILLS"', '"./_skills.mjs"'));
const H = await load(ROOT + "/app/utils/helpers.ts", OUT + "/_helpers.mjs");

const old = fs.readFileSync(ROOT + "/docs/fixtures/primitives-run1/_style.txt", "utf8");
console.log("OLD sheet:", JSON.stringify(REF.validateStyleSheet(old)));
// false-positive probes: prose that uses the ambiguous words
for (const probe of ["- Structural chrome (fixed height, only when present): header height: h-9",
  "- Pads sit in a grid of eight; flex feel", "- Large numeric readouts: font-mono font-bold tracking-tight text-amber-300"])
  console.log("probe:", JSON.stringify(REF.validateStyleSheet(probe)), "<-", probe);

if (process.argv.includes("--validate-only")) process.exit(0);
const components = JSON.parse(fs.readFileSync(ROOT + "/docs/fixtures/dj-table.components.json", "utf8"));
const defs = components.map((c) => ({ name: c.name, genInstructions: c.genInstructions, role: c.role, connectivity: c.connectivity, features: c.features, defaultActiveIdx: c.features.map((_, i) => i) }));
const resolvedDefs = defs.map((d) => JSON.parse(H.resolveComponent({ name: d.name, activeIdx: d.defaultActiveIdx }, defs)));
const env = fs.readFileSync(ROOT + "/.env.local", "utf8");
const apiKey = env.match(/^\s*CLAUDE_API_KEY\s*=\s*["']?([^"'\r\n]+)/m)?.[1];
const Anthropic = require("@anthropic-ai/sdk").default ?? require("@anthropic-ai/sdk");
const client = new Anthropic({ apiKey });

let previousError;
for (let attempt = 1; attempt <= 3; attempt++) {
  const t0 = Date.now();
  const retryNote = previousError ? `\n\nYour previous sheet was REJECTED: ${previousError}\nReturn the full corrected token sheet.` : "";
  const msg = await client.messages.create({
    model: "claude-opus-4-8", max_tokens: 4000,
    system: REF.STYLE_SYSTEM_PROMPT + SK.COMPONENT_PROTOCOL,
    messages: [{ role: "user", content: `Task: DJ Table\nThese are the components that make up this single UI: ${JSON.stringify(resolvedDefs)}.${retryNote}` }],
  });
  const style = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  fs.writeFileSync(`${OUT}/style-new-${attempt}.txt`, style);
  const v = REF.validateStyleSheet(style);
  console.log(`attempt ${attempt}: ${((Date.now() - t0) / 1000).toFixed(1)}s ${msg.usage.output_tokens} out -> ${v.ok ? "PASS" : "FAIL: " + v.error}`);
  if (v.ok) { fs.writeFileSync(OUT + "/style-new.txt", style); break; }
  previousError = v.error;
}
