// Splits the exact primitive-leaf system prompt into rule units with sizes, for an
// applicability audit. Tokens ~ chars / 4.
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
const ROOT = "C:/Users/realy/OneDrive/Documents/Work/DashUI";
const OUT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const ts = createRequire(ROOT + "/package.json")("typescript");
const load = (src, dest, rw = (s) => s) => { fs.writeFileSync(dest, ts.transpileModule(rw(fs.readFileSync(src, "utf8")), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText); return import(pathToFileURL(dest).href + "?t=" + Date.now()); };
const SK = await load(ROOT + "/app/api/SKILLS.ts", OUT + "/_skills.mjs");
const REF = await load(ROOT + "/docs/SKILLS.primitives.reference.ts", OUT + "/_ref.mjs", (s) => s.replace('"../app/api/SKILLS"', '"./_skills.mjs"'));
const route = fs.readFileSync(ROOT + "/app/api/generate/route.ts", "utf8");
const tpl = route.match(/const sizeNote = boxSize\s*\?\s*`([\s\S]*?)`\s*:\s*"";/)[1];
const sizeNote = new Function("boxSize", "return `" + tpl + "`;")({ x: 448, y: 416 });
const hoist = JSON.parse(fs.readFileSync(ROOT + "/docs/fixtures/dj-table.hoist.run5-low.json", "utf8"));
const style = fs.readFileSync(ROOT + "/docs/fixtures/primitives-run1/_style.txt", "utf8");

const units = [];
const add = (section, text) => { const t = text.trim(); if (t) units.push({ section, chars: t.length, text: t }); };
add("QA_DIRECTIVE", SK.GENERATE_QA_DIRECTIVE);
// GENERATE_SYSTEM_PROMPT: one unit per top-level or nested bullet; prose between as its own unit
let buf = "", sec = "GENERATE";
for (const line of REF.GENERATE_SYSTEM_PROMPT.split("\n")) {
  if (/^\s*- /.test(line) || /^<\/?important>/.test(line) || /^Example output format/.test(line) || /^RULES:/.test(line)) { add(sec, buf); buf = ""; }
  buf += line + "\n";
}
add(sec, buf);
add("PROTOCOL", REF.COMPONENT_PROTOCOL);
add("LIBRARY", REF.primitiveLibraryBlock(hoist.library));
add("STYLE", "VISUAL GUIDELINES:\n" + style);
for (const s of sizeNote.split(/\n\s*/).filter(Boolean)) add("SIZENOTE", s);

const total = units.reduce((a, u) => a + u.chars, 0);
console.log(`TOTAL ${total} chars ≈ ${Math.round(total / 4)} tokens, ${units.length} units`);
const bySec = {};
for (const u of units) bySec[u.section] = (bySec[u.section] || 0) + u.chars;
for (const [k, v] of Object.entries(bySec)) console.log(`  ${k.padEnd(13)} ${String(v).padStart(6)} chars  ${(100 * v / total).toFixed(1)}%`);
units.forEach((u, i) => console.log(`${String(i).padStart(2)} ${u.section.padEnd(12)} ${String(u.chars).padStart(5)}  ${u.text.replace(/\s+/g, " ").slice(0, 110)}`));
fs.writeFileSync(OUT + "/prompt-units.json", JSON.stringify(units, null, 2));
