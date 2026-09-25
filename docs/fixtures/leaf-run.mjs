// End-to-end leaf test: generate chosen leaves WITH primitives (reference prompts +
// type-mapped features + library block) and as TODAY (current SKILLS.ts prompt, plain
// features), same style + box sizes + generate-route model config. Then check them.
// Usage: node leaf-run.mjs [--only=prim|base]
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const ROOT = "C:/Users/realy/OneDrive/Documents/Work/DashUI";
const OUT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const require = createRequire(ROOT + "/package.json");
const ts = require("typescript");

const load = (src, dest, rewrite = (s) => s) => {
  const js = ts.transpileModule(rewrite(fs.readFileSync(src, "utf8")), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  fs.writeFileSync(dest, js);
  return import(pathToFileURL(dest).href + "?t=" + Date.now());
};
const SK = await load(ROOT + "/app/api/SKILLS.ts", OUT + "/_skills.mjs");
const REF = await load(ROOT + "/docs/SKILLS.primitives.reference.ts", OUT + "/_ref.mjs",
  (s) => s.replace('"../app/api/SKILLS"', '"./_skills.mjs"'));
const H = await load(ROOT + "/app/utils/helpers.ts", OUT + "/_helpers.mjs");

// The generate route's sizeNote, evaluated from its own template (not re-typed here).
const route = fs.readFileSync(ROOT + "/app/api/generate/route.ts", "utf8");
const tpl = route.match(/const sizeNote = boxSize\s*\?\s*`([\s\S]*?)`\s*:\s*"";/)[1];
const sizeNote = (boxSize) => new Function("boxSize", "return `" + tpl + "`;")(boxSize);

const F = ROOT + "/docs/fixtures";
const components = JSON.parse(fs.readFileSync(F + "/dj-table.components.json", "utf8"));
const hoist = JSON.parse(fs.readFileSync(F + "/dj-table.hoist.run5-low.json", "utf8"));
const style = fs.readFileSync(process.argv.find((x) => x.startsWith("--style="))?.slice(8) ?? F + "/primitives-run1/_style.txt", "utf8");
// Parsed primitive floors (written by prim-run next to the primitives), fed to the library block.
const primsArg = process.argv.find((x) => x.startsWith("--prims="))?.slice(8);
const floors = primsArg && fs.existsSync(OUT + "/" + primsArg + "/_floors.json")
  ? JSON.parse(fs.readFileSync(OUT + "/" + primsArg + "/_floors.json", "utf8")) : {};
const styleBlock = `\n\nVISUAL GUIDELINES — follow these guidelines so this component matches the rest of its UI:\n${style}`;

// Leaves under test + a plausible DJ-table box size for each (32px blocks).
const LEAVES = [
  { name: "DJ Table: Deck A (Left)", box: { x: 448, y: 416 } },
  { name: "DJ Table: Central Mixer", box: { x: 384, y: 416 } },
  { name: "DJ Table: Deck B (Right)", box: { x: 448, y: 416 } },
];

const resolved = (name, mapped) => {
  const c = components.find((x) => x.name === name);
  const fmap = hoist.components.find((x) => x.name === name).features;
  return JSON.stringify({
    name: c.name, genInstructions: c.genInstructions, role: c.role, connectivity: c.connectivity,
    features: mapped ? Object.fromEntries(c.features.map((f) => [f, fmap[f] ?? null])) : c.features,
    excludedFeatures: [],
  });
};
// As the amended route will: hand-built-only rules/sentences are omitted when every
// active feature of this leaf maps to primitives.
const handBuiltFor = (name) => REF.needsHandBuiltRules(JSON.parse(resolved(name, true)).features, true);
// Primitive leaf: the condense sentence is replaced by the PRIMITIVE FLOORS order, and
// hand-built-only sentences are dropped when every feature maps to a primitive.
const sizeNoteFor = (box, handBuilt) => sizeNote(box).split("\n")
  .filter((l) => handBuilt || !REF.SIZENOTE_HANDBUILT_ONLY.some((p) => l.trim().startsWith(p)))
  .map((l) => (l.trim().startsWith(REF.SIZENOTE_PRIM_CONDENSE_PREFIX) ? REF.sizeNotePrimCondense(box) : l))
  .join("\n");
const systems = {
  prim: (box, name) => { const hb = handBuiltFor(name);
    return SK.GENERATE_QA_DIRECTIVE + "\n\n" + REF.buildGenerateSystemPrompt({ primitives: true, handBuilt: hb }) + REF.buildComponentProtocol(true, hb) + REF.primitiveLibraryBlock(hoist.library, floors) + styleBlock + sizeNoteFor(box, hb) + REF.sizeNoteRem(box); },
  base: (box) => SK.GENERATE_QA_DIRECTIVE + "\n\n" + SK.GENERATE_SYSTEM_PROMPT + SK.COMPONENT_PROTOCOL + styleBlock + sizeNote(box),
};

const env = fs.readFileSync(ROOT + "/.env.local", "utf8");
const apiKey = env.match(/^\s*CLAUDE_API_KEY\s*=\s*["']?([^"'\r\n]+)/m)?.[1];
const Anthropic = require("@anthropic-ai/sdk").default ?? require("@anthropic-ai/sdk");
const client = new Anthropic({ apiKey });

const libTypes = hoist.library.map((t) => t.type);
const check = (mode, leaf, code) => {
  const errs = [], notes = [];
  const r = ts.transpileModule(code, { reportDiagnostics: true, fileName: "leaf.tsx",
    compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
  for (const d of r.diagnostics ?? []) errs.push("syntax: " + ts.flattenDiagnosticMessageText(d.messageText, " "));
  if (!/export\s+default\s+function\s+GeneratedComponent/.test(code)) errs.push("no default GeneratedComponent");
  if (mode === "prim") {
    const redefined = libTypes.filter((t) => new RegExp(`(function|const|let|class)\\s+${t}\\b`).test(code));
    if (redefined.length) errs.push("redefines primitives: " + redefined.join(", "));
    const used = libTypes.filter((t) => new RegExp(`<${t}[\\s/>]`).test(code));
    const fmap = hoist.components.find((x) => x.name === leaf).features;
    const expected = [...new Set(Object.values(fmap).flat())];
    const missing = expected.filter((t) => !used.includes(t));
    notes.push("uses " + used.map((t) => t + "×" + (code.match(new RegExp(`<${t}[\\s/>]`, "g")) || []).length).join(", "));
    if (missing.length) errs.push("mapped primitives never used: " + missing.join(", "));
  }
  return { errs, notes };
};

const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
const jobs = [];
for (const mode of ["prim", "base"]) if (!only || only === mode)
  for (const [i, l] of LEAVES.entries()) jobs.push({ mode, i, ...l });
fs.mkdirSync(OUT + "/leaves/prim", { recursive: true });
fs.mkdirSync(OUT + "/leaves/base", { recursive: true });

// --dry: write the exact system + user message each job would send, then exit (no API).
if (process.argv.includes("--dry")) {
  fs.mkdirSync(OUT + "/leaves/dry", { recursive: true });
  for (const j of jobs) {
    fs.writeFileSync(`${OUT}/leaves/dry/${j.mode}-${j.i}.system.txt`, systems[j.mode](j.box, j.name));
    fs.writeFileSync(`${OUT}/leaves/dry/${j.mode}-${j.i}.user.txt`, resolved(j.name, j.mode === "prim"));
  }
  console.log("floors loaded:", Object.keys(floors).length, "types from", primsArg);
  process.exit(0);
}

// Model config (defaults = the generate route today). --thinking=adaptive|disabled
const arg = (k, d) => process.argv.find((a) => a.startsWith("--" + k + "="))?.slice(k.length + 3) ?? d;
const MODEL = arg("model", "claude-opus-4-8");
const THINKING = arg("thinking", "disabled");
const EFFORT = arg("effort", "max");
const MAX_TOKENS = +arg("max-tokens", "16000");
const OUTDIR = arg("outdir", "leaves");
fs.mkdirSync(`${OUT}/${OUTDIR}/prim`, { recursive: true });
fs.mkdirSync(`${OUT}/${OUTDIR}/base`, { recursive: true });
console.log(`config: ${MODEL} thinking=${THINKING} effort=${EFFORT} max_tokens=${MAX_TOKENS} -> ${OUTDIR}/`);

const t0 = Date.now();
const results = await Promise.all(jobs.map(async (j) => {
  const s = Date.now();
  try {
    // Haiku 4.5 takes an explicit thinking budget and no effort (effort errors there).
    const BUDGET = arg("budget", "");
    const modelCfg = BUDGET
      ? { thinking: { type: "enabled", budget_tokens: +BUDGET } }
      : { thinking: { type: THINKING }, output_config: { effort: EFFORT } };
    const msg = await client.messages.stream({
      model: MODEL, max_tokens: MAX_TOKENS,
      ...modelCfg,
      system: systems[j.mode](j.box, j.name),
      messages: [{ role: "user", content: resolved(j.name, j.mode === "prim") }],
    }).finalMessage();
    // Code comes ONLY from text blocks: thinking blocks are counted, never read into the code.
    const kinds = msg.content.map((b) => b.type);
    const thinkingBlocks = kinds.filter((k) => k === "thinking" || k === "redacted_thinking").length;
    const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const warn = [];
    if (msg.stop_reason === "refusal") warn.push("REFUSAL " + JSON.stringify(msg.stop_details ?? {}));
    if (msg.stop_reason === "max_tokens") warn.push("HIT max_tokens");
    if (!raw.trim()) warn.push("NO TEXT BLOCK (content: " + kinds.join(",") + ")");
    if (/<\/?thinking>/i.test(raw)) warn.push("thinking tags leaked into text");
    const code = H.extractComponentCode(raw);
    fs.writeFileSync(`${OUT}/${OUTDIR}/${j.mode}/${j.i}.tsx`, code);
    const c = check(j.mode, j.name, code);
    return { ...j, secs: (Date.now() - s) / 1000, out: msg.usage.output_tokens, stop: msg.stop_reason, thinkingBlocks,
      errs: [...warn, ...c.errs], notes: c.notes };
  } catch (e) { return { ...j, secs: (Date.now() - s) / 1000, out: 0, errs: ["request failed: " + e.message], notes: [] }; }
}));
console.log(`leaves: ${jobs.length} in ${((Date.now() - t0) / 1000).toFixed(1)}s wall`);
for (const r of results)
  console.log(`  ${r.mode.padEnd(4)} ${r.name.padEnd(26)} ${r.secs.toFixed(0).padStart(3)}s ${String(r.out).padStart(6)} out ${r.stop ?? ""} think-blocks:${r.thinkingBlocks ?? 0}  ${r.errs.length ? "FAIL: " + r.errs.join(" | ") : "ok"}  ${r.notes.join(" ")}`);
fs.writeFileSync(`${OUT}/${OUTDIR}/results.json`, JSON.stringify({ LEAVES, config: { MODEL, THINKING, EFFORT, MAX_TOKENS }, results }, null, 2));
