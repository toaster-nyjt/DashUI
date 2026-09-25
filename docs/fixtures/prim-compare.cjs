// Primitive-stage model comparison. Runs every hoisted type through the REAL app code —
// PRIMITIVE_SYSTEM_PROMPT + primitiveRequest (app/api/SKILLS.ts), extractPrimitiveCode +
// checkPrimitive (app/utils/primitiveChecks.ts), derivePrimitiveUsage (helpers.ts) — with
// the same validate-and-retry loop as fetchValidPrimitives (3 attempts, first error fed back).
// Usage: node prim-compare.cjs --out=<dir> --model=<id> --thinking=adaptive|disabled --effort=<e> --max-tokens=<n>
const fs = require("fs"), path = require("path");
const { load, ROOT } = require("./lib/load.cjs");
const SK = load(ROOT + "/app/api/SKILLS.ts");
const { checkPrimitive, extractPrimitiveCode } = load(ROOT + "/app/utils/primitiveChecks.ts");
const { derivePrimitiveUsage } = load(ROOT + "/app/utils/helpers.ts");
const Anthropic = require(ROOT + "/node_modules/@anthropic-ai/sdk").default;

const arg = (k, d) => process.argv.find((a) => a.startsWith("--" + k + "="))?.slice(k.length + 3) ?? d;
const OUT = path.join(__dirname, arg("out", "pc"));
const MODEL = arg("model", "claude-opus-4-8"), THINKING = arg("thinking", "disabled"), EFFORT = arg("effort", "max");
const MAX_TOKENS = +arg("max-tokens", "16000");
const RETRIES = 3;
const PRICE = { in: 5 / 1e6, out: 25 / 1e6 }; // Opus 4.8 and Opus 5: $5 / $25 per MTok

const task = "DJ Table";
const hoist = JSON.parse(fs.readFileSync(ROOT + "/docs/fixtures/dj-table.hoist.run5-low.json", "utf8"));
const style = fs.readFileSync(ROOT + "/docs/fixtures/dj-table.style.appearance-only.txt", "utf8");
const usage = derivePrimitiveUsage(hoist);
// Same system prompt the primitive route builds.
const system = SK.PRIMITIVE_SYSTEM_PROMPT + `\n\nVISUAL GUIDELINES — follow these guidelines so this primitive matches the rest of its UI:\n${style}`;

const env = fs.readFileSync(ROOT + "/.env.local", "utf8");
const client = new Anthropic({ apiKey: env.match(/^\s*CLAUDE_API_KEY\s*=\s*["']?([^"'\r\n]+)/m)[1] });

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  console.log(`config: ${MODEL} thinking=${THINKING} effort=${EFFORT} max_tokens=${MAX_TOKENS} -> ${OUT}`);
  const t0 = Date.now();
  const only = arg("only", "").split(",").filter(Boolean);
  const results = await Promise.all(hoist.library.filter((t) => !only.length || only.includes(t.type)).map(async (prim) => {
    const r = { type: prim.type, attempts: [], secs: 0, inTok: 0, outTok: 0 };
    const s = Date.now();
    let previousError;
    for (let attempt = 1; attempt <= RETRIES; attempt++) {
      const a0 = Date.now();
      try {
        const retryNote = previousError ? `\n\nYour previous attempt was REJECTED: ${previousError}\nReturn the full corrected primitive.` : "";
        const msg = await client.messages.stream({
          model: MODEL, max_tokens: MAX_TOKENS,
          thinking: { type: THINKING }, output_config: { effort: EFFORT },
          system,
          messages: [{ role: "user", content: SK.primitiveRequest(task, prim, usage[prim.type]) + retryNote }],
        }).finalMessage();
        r.inTok += msg.usage.input_tokens; r.outTok += msg.usage.output_tokens;
        // Code only from text blocks; thinking blocks are counted, never read.
        const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
        const thinking = msg.content.filter((b) => b.type === "thinking" || b.type === "redacted_thinking").length;
        const code = extractPrimitiveCode(raw);
        const { errors, floor } = checkPrimitive(prim, code);
        if (msg.stop_reason === "max_tokens") errors.unshift("cut off at max_tokens");
        if (msg.stop_reason === "refusal") errors.unshift("refusal");
        if (/<\/?thinking>/i.test(raw)) errors.push("thinking tags leaked into text");
        r.attempts.push({ secs: (Date.now() - a0) / 1000, out: msg.usage.output_tokens, stop: msg.stop_reason, thinking, errors });
        fs.writeFileSync(`${OUT}/${prim.type}${errors.length ? ".attempt" + attempt : ""}.tsx`, code);
        if (!errors.length) { r.floor = floor; break; }
        previousError = errors[0];
      } catch (e) {
        r.attempts.push({ secs: (Date.now() - a0) / 1000, errors: ["request failed: " + e.message] });
        previousError = e.message;
      }
    }
    r.secs = (Date.now() - s) / 1000;
    r.passed = !!r.floor;
    r.firstTry = r.attempts[0] && !r.attempts[0].errors.length;
    return r;
  }));
  const wall = (Date.now() - t0) / 1000;
  const cost = results.reduce((a, r) => a + r.inTok * PRICE.in + r.outTok * PRICE.out, 0);
  const summary = {
    config: { MODEL, THINKING, EFFORT, MAX_TOKENS }, wall,
    passedFirstTry: results.filter((r) => r.firstTry).length, passed: results.filter((r) => r.passed).length,
    types: results.length, totalAttempts: results.reduce((a, r) => a + r.attempts.length, 0),
    outTokens: results.reduce((a, r) => a + r.outTok, 0), cost: +cost.toFixed(3),
  };
  fs.writeFileSync(`${OUT}/_floors.json`, JSON.stringify(Object.fromEntries(results.filter((r) => r.floor).map((r) => [r.type, r.floor])), null, 2));
  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify({ summary, results }, null, 2));
  console.log(`wall ${wall.toFixed(0)}s  first-try ${summary.passedFirstTry}/${summary.types}  passed ${summary.passed}/${summary.types}  attempts ${summary.totalAttempts}  out ${summary.outTokens}  $${summary.cost}`);
  for (const r of results)
    console.log(`  ${r.type.padEnd(14)} ${r.secs.toFixed(0).padStart(4)}s  x${r.attempts.length}  ${String(r.outTok).padStart(6)} out  ${r.passed ? "ok" : "FAILED"}  ${r.attempts.filter((a) => a.errors.length).map((a) => a.errors[0].slice(0, 110)).join("  ||  ")}`);
})();
