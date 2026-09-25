// Leaf prompt-layout comparison on a logged end-to-end run's leaves. Prompts come from the
// REAL buildLeafSystem (app/utils/leafPrompt.ts); code is extracted with extractComponentCode
// and post-processed with sanitizeLeaf, exactly as the generate route does.
// Usage: node leaf-compare.cjs --inputs=leaf-inputs.json --out=<dir> --budget=0|1
//          --model=<id> --thinking=adaptive|disabled --effort=<e> --max-tokens=<n>
const fs = require("fs"), path = require("path");
const { load, ROOT } = require("./lib/load.cjs");
const { buildLeafSystem } = load(ROOT + "/app/utils/leafPrompt.ts");
const { extractComponentCode } = load(ROOT + "/app/utils/helpers.ts");
const { sanitizeLeaf } = load(ROOT + "/app/utils/leafSanitizer.ts");
const Anthropic = require(ROOT + "/node_modules/@anthropic-ai/sdk").default;
const arg = (k, d) => process.argv.find((a) => a.startsWith("--" + k + "="))?.slice(k.length + 3) ?? d;
const OUT = path.join(__dirname, arg("out"));
const budget = arg("budget", "0") === "1";
const MODEL = arg("model"), THINKING = arg("thinking"), EFFORT = arg("effort"), MAX = +arg("max-tokens", "64000");
const client = new Anthropic({ apiKey: fs.readFileSync(ROOT + "/.env.local", "utf8").match(/^\s*CLAUDE_API_KEY\s*=\s*["']?([^"'\r\n]+)/m)[1] });
const countTok = async (t) => (await client.messages.countTokens({ model: "claude-opus-5", messages: [{ role: "user", content: t }] })).input_tokens - 8;

// Each leaf once (the log can hold regenerations of the same leaf).
const all = JSON.parse(fs.readFileSync(path.join(__dirname, arg("inputs")), "utf8"));
const inputs = all.filter((x, i) => all.findIndex((y) => y.leaf === x.leaf) === i);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const t0 = Date.now();
  const results = await Promise.all(inputs.map(async (inp, i) => {
    const { system } = buildLeafSystem({ ...inp, budget });
    const s = Date.now();
    try {
      const msg = await client.messages.stream({
        model: MODEL, max_tokens: MAX, thinking: { type: THINKING }, output_config: { effort: EFFORT },
        system, messages: [{ role: "user", content: JSON.stringify(inp.spec) }],
      }).finalMessage();
      const secs = (Date.now() - s) / 1000;
      const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
      const code = extractComponentCode(raw);
      const clean = sanitizeLeaf(code, inp.primitives.library.map((t) => t.type));
      fs.writeFileSync(`${OUT}/${i}.raw.tsx`, code);
      fs.writeFileSync(`${OUT}/${i}.tsx`, clean);
      const codeTok = await countTok(raw);
      const budgetLines = [...code.matchAll(/\/\/\s*BUDGET[^\n]*/g)].map((m) => m[0]);
      return { i, leaf: inp.leaf, box: inp.boxSize, secs, outTok: msg.usage.output_tokens, codeTok, thinkTok: msg.usage.output_tokens - codeTok,
        stop: msg.stop_reason, budgetLines, postProcessed: clean !== code };
    } catch (e) { return { i, leaf: inp.leaf, error: e.message }; }
  }));
  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify({ config: { budget, MODEL, THINKING, EFFORT }, wall: (Date.now() - t0) / 1000, results }, null, 2));
  console.log(`${path.basename(OUT)}: budget=${budget} ${MODEL} ${THINKING} ${EFFORT} — wall ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  for (const r of results) console.log(r.error ? `  ${r.leaf}: ERROR ${r.error}` :
    `  ${r.leaf.split(": ")[1].padEnd(24)} ${r.secs.toFixed(0).padStart(3)}s  out ${String(r.outTok).padStart(5)} = code ${String(r.codeTok).padStart(5)} + think ${String(r.thinkTok).padStart(5)}  ${r.stop}  budget-comment:${r.budgetLines.length}${r.postProcessed ? "  (post-processed)" : ""}`);
})();
