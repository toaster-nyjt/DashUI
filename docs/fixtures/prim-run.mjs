// Hand-run of PRIMITIVE_SYSTEM_PROMPT: style call -> one call per hoisted type (parallel)
// -> compile check. Usage: node prim-run.mjs [--reuse-style] [--only=Knob,Fader]
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const ROOT = "C:/Users/realy/OneDrive/Documents/Work/DashUI";
const OUT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const require = createRequire(ROOT + "/package.json");
const ts = require("typescript");

// Load the REAL prompt strings (interpolations included) by transpiling both files.
const load = (src, dest, rewrite = (s) => s) => {
  const js = ts.transpileModule(rewrite(fs.readFileSync(src, "utf8")), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  fs.writeFileSync(dest, js);
  return import(pathToFileURL(dest).href + "?t=" + Date.now());
};
const SK = await load(ROOT + "/app/api/SKILLS.ts", OUT + "/_skills.mjs");
const REF = await load(ROOT + "/docs/SKILLS.primitives.reference.ts", OUT + "/_ref.mjs",
  (s) => s.replace('"../app/api/SKILLS"', '"./_skills.mjs"'));

const components = JSON.parse(fs.readFileSync(ROOT + "/docs/fixtures/dj-table.components.json", "utf8"));
const hoistPath = process.argv.find((a) => a.startsWith("--hoist="))?.slice(8) ?? ROOT + "/docs/fixtures/dj-table.hoist.run3-low.json";
const hoist = JSON.parse(fs.readFileSync(hoistPath, "utf8"));
const PRIMS = OUT + "/" + (process.argv.find((a) => a.startsWith("--out="))?.slice(6) ?? "prims");
const task = "DJ Table";

const env = fs.readFileSync(ROOT + "/.env.local", "utf8");
const apiKey = env.match(/^\s*CLAUDE_API_KEY\s*=\s*["']?([^"'\r\n]+)/m)?.[1];
const Anthropic = require("@anthropic-ai/sdk").default ?? require("@anthropic-ai/sdk");
const client = new Anthropic({ apiKey });

// 1. STYLE — same call shape as app/api/style/route.ts
let style;
if (process.argv.includes("--reuse-style")) style = fs.readFileSync(OUT + "/style.txt", "utf8");
else {
  const t0 = Date.now();
  const msg = await client.messages.create({
    model: "claude-opus-4-8", max_tokens: 4000,
    system: SK.STYLE_SYSTEM_PROMPT + SK.COMPONENT_PROTOCOL,
    messages: [{ role: "user", content: `Task: ${task}\nThese are the components that make up this single UI: ${JSON.stringify(components)}.` }],
  });
  style = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  fs.writeFileSync(OUT + "/style.txt", style);
  console.log(`style: ${((Date.now() - t0) / 1000).toFixed(1)}s, ${msg.usage.output_tokens} out`);
}

// 2. PRIMITIVES — generate-route config, one call per type, all parallel
const usage = REF.derivePrimitiveUsage(hoist);
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const lib = hoist.library.filter((t) => !only || only.includes(t.type));
const system = REF.PRIMITIVE_SYSTEM_PROMPT +
  `\n\nVISUAL GUIDELINES — follow these guidelines so this primitive matches the rest of its UI:\n${style}`;
fs.mkdirSync(PRIMS, { recursive: true });

// Code extraction: first fenced block if any, else from the first top-level declaration.
// (NOTE for the real route: extractComponentCode starts at import/export and would cut a
// leading "type XProps" line — the primitive route needs this broader start rule.)
const extract = (raw) => {
  const open = raw.match(/```[a-z]*\n/i);
  if (open) { const after = raw.slice(open.index + open[0].length); const c = after.search(/\n```/); return c < 0 ? after : after.slice(0, c); }
  const start = raw.search(/^(type |interface |export |function |const )/m);
  return start > 0 ? raw.slice(start) : raw;
};

// 3. COMPILE CHECK — syntax, exactly one named export, no imports, no default export
const check = (prim, code) => {
  const type = prim.type;
  const errs = [];
  const r = ts.transpileModule(code, { reportDiagnostics: true, fileName: type + ".tsx",
    compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
  for (const d of r.diagnostics ?? []) {
    // Line + the offending code, so a retry can find the fault (a bare message took 3 attempts).
    const line = d.start != null ? code.slice(0, d.start).split("\n").length : 0;
    const src = line ? code.split("\n")[line - 1].trim().slice(0, 140) : "";
    errs.push(`syntax: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}${line ? ` at line ${line}: \`${src}\`` : ""}`);
  }
  if (/^\s*import\s/m.test(code)) errs.push("has an import");
  if (/export\s+default/.test(code)) errs.push("has a default export");
  if (!new RegExp(`export\\s+function\\s+${type}\\s*\\(`).test(code)) errs.push(`no "export function ${type}("`);
  const exported = [...code.matchAll(/^export\s+(?:function|const|class|let)\s+(\w+)/gm)].map((m) => m[1]);
  const extra = exported.filter((n) => n !== type && n !== type + "_MIN");
  if (extra.length) errs.push("extra exports: " + extra.join(", "));
  const tops = [...code.matchAll(/^(?:export\s+)?(?:function|const|let|class)\s+(\w+)/gm)].map((m) => m[1]);
  const unprefixed = tops.filter((n) => !n.startsWith(type));
  if (unprefixed.length) errs.push("unprefixed top-level names: " + unprefixed.join(", "));
  if (/\bid="[^"]+"/.test(code)) errs.push("hard-coded SVG id (must be unique per instance)");
  if (/function\s+FitText\b|const\s+FitText\b/.test(code)) errs.push("redefines FitText (it is provided by the host)");
  if (/\d\s*cq(w|h|min|max|i|b)\b/.test(code) && !/container-type/.test(code)) errs.push("uses container-query units with no [container-type:size] ancestor (they resolve against the viewport)");
  if (/ResizeObserver/.test(code)) errs.push("measures its size with ResizeObserver (draw in relative units)");
  const pctPad = code.match(/(^|[\s"'])(p[xytblr]?-\[\d+(\.\d+)?%\])/);
  if (pctPad) errs.push(`uses percentage padding "${pctPad[2]}": percentage padding is measured from the WIDTH, so in a short, wide slot it can take the whole height — use "inset-[x%]" on an absolute region or flex gaps instead`);
  const f = REF.parsePrimitiveFloor(prim, code);
  if (f.error) errs.push("floor: " + f.error);
  return { errs, floor: f.floor };
};

const t0 = Date.now();
const results = await Promise.all(lib.map(async (prim) => {
  const s = Date.now();
  let previousError, out = 0, history = [];
  // Validate-and-retry, as the route will: feed the first failure back, up to 3 attempts.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const retryNote = previousError
        ? `\n\nYour previous attempt was REJECTED: ${previousError}\nReturn the full corrected primitive.`
        : "";
      const msg = await client.messages.stream({
        model: "claude-opus-4-8", max_tokens: 16000,
        thinking: { type: "disabled" }, output_config: { effort: "max" },
        system,
        messages: [{ role: "user", content: REF.primitiveRequest(task, prim, usage[prim.type]) + retryNote }],
      }).finalMessage();
      out += msg.usage.output_tokens;
      const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
      const code = extract(raw);
      const { errs, floor } = check(prim, code);
      history.push(errs.length ? errs.join(" | ") : "ok");
      fs.writeFileSync(`${PRIMS}/${prim.type}.tsx`, code);
      if (!errs.length || attempt === 3)
        return { type: prim.type, secs: (Date.now() - s) / 1000, out, stop: msg.stop_reason, attempts: attempt,
          history, preamble: raw.trimStart() !== code.trimStart(), errs, floor };
      previousError = errs[0];
    } catch (e) {
      return { type: prim.type, secs: (Date.now() - s) / 1000, out, attempts: attempt, history, errs: ["request failed: " + e.message] };
    }
  }
}));

console.log(`\nprimitives: ${lib.length} in ${((Date.now() - t0) / 1000).toFixed(1)}s wall`);
for (const r of results)
  console.log(`  ${r.type.padEnd(16)} ${r.secs.toFixed(0).padStart(3)}s ${String(r.out).padStart(6)} out ${r.stop ?? ""}${r.preamble ? " (preamble stripped)" : ""}  x${r.attempts}  ${r.errs.length ? "FAIL: " + r.errs.join(" | ") : "ok"}${r.attempts > 1 ? "   [" + r.history.join(" -> ") + "]" : ""}`);
fs.writeFileSync(OUT + "/prim-results.json", JSON.stringify(results, null, 2));
// Parsed floors per type, as the route would store them beside the library (per taskID).
const floors = Object.fromEntries(results.filter((r) => r.floor).map((r) => [r.type, r.floor]));
fs.writeFileSync(PRIMS + "/_floors.json", JSON.stringify(floors, null, 2));
console.log("\nfloors (rem):"); for (const [t, f] of Object.entries(floors)) console.log(`  ${t.padEnd(16)} ${JSON.stringify(f)}`);
