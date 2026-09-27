// Renders the full prompts (system + user message) the app sends, for a prompt QA review
// (docs/PROMPT_QA.md). No API calls. Cases: 5 leaves (focal, no focal, holder surface, a
// hand-built feature, manual box), 4 primitives (focal, plain, focal holder, held type), the
// focal agent, the contract agent and 2 wiring calls (from a saved wire-run.cjs result). Each file starts with a CASE line saying what is real and what was set by hand.
// Usage: node prompt-qa-render.cjs --out=<dir> [--dj=<task jsonl>] [--cp=<task jsonl>] [--wire=<wire-run dir>]
const fs = require("fs"), path = require("path");
const { load, ROOT } = require("./lib/load.cjs");
const { buildLeafSystem } = load(ROOT + "/app/utils/leafPrompt.ts");
const SK = load(ROOT + "/app/api/SKILLS.ts");
const H = load(ROOT + "/app/utils/helpers.ts");
const arg = (k, d) => process.argv.find((a) => a.startsWith("--" + k + "="))?.slice(k.length + 3) ?? d;
const OUT = arg("out");
if (!OUT) throw new Error("--out=<dir> is required");
fs.mkdirSync(OUT, { recursive: true });

// First run of a log: its hoist, style, task, resolved defs and the focal picks (logged, or given).
const run = (file) => {
  const L = fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(JSON.parse);
  const end = L.findIndex((l, i) => i > 0 && l.stage === "run:start");
  const R = end > 0 ? L.slice(0, end) : L;
  return {
    L: R, task: R[0].task, hoist: R.find((l) => l.stage === "hoist" && l.hoist).hoist, style: R.find((l) => l.stage === "style").style,
    defs: R.find((l) => l.stage === "run:style|hoist|layout").resolvedDefs.map((d) => (typeof d === "string" ? JSON.parse(d) : d)),
    focal: R.find((l) => l.stage === "focal:valid")?.focal,
  };
};
const dj = run(arg("dj", ROOT + "/logs/task-1790499847643.jsonl"));
const cp = run(arg("cp", ROOT + "/logs/task-1790493337400.jsonl"));
dj.focal ??= ["JogWheel", "Fader"]; cp.focal ??= ["StatBar", "MapCanvas"]; // the app's picks on these runs

const write = (name, note, system, user) =>
  fs.writeFileSync(path.join(OUT, name + ".txt"), `CASE: ${note}\n\n=== SYSTEM ===\n${system}\n\n=== USER MESSAGE ===\n${user}`);

const leaf = (R, re, name, note, mut) => {
  const l = R.L.find((x) => x.stage === "leaf:start" && re.test(x.leaf));
  if (!l) return console.log("no leaf matching", re);
  const spec = mut ? mut(JSON.parse(JSON.stringify(l.spec))) : l.spec;
  const library = l.library.map((t) => R.hoist.library.find((x) => x.type === t)).filter(Boolean);
  const { system } = buildLeafSystem({ spec, boxSize: l.boxSize, style: R.style, primitives: { library, floors: l.floors, focal: R.focal }, budget: true });
  write(name, `${l.leaf} (real spec, box and library; UI focal types ${R.focal.join(", ")}). ${note}`, system, JSON.stringify(spec));
};
leaf(dj, /Left Deck|Deck A/, "leaf-1-focal", "Uses focal types.");
leaf(dj, /Waveform/, "leaf-2-nofocal", "Uses no focal type.");
leaf(cp, /Map/, "leaf-3-holder", "Has a holder surface with held types.");
leaf(dj, /Library|Browser/, "leaf-4-handbuilt", "SYNTHETIC: its last feature was set to null by hand to exercise the hand-built rules; judge the rules, not the resulting asymmetry.",
  (s) => { const k = Object.keys(s.features).pop(); s.features[k] = null; return s; });
const manual = { name: "Data Table", genInstructions: "A sortable data table.", features: ["Search Bar", "Sortable Columns", "Pagination"], excludedFeatures: [] };
write("leaf-5-manual", "SYNTHETIC manual box (no UI, no primitives): the base prompt.",
  buildLeafSystem({ spec: manual, boxSize: { x: 800, y: 500 }, budget: true }).system, JSON.stringify(manual));

const prim = (R, type) => {
  const p = R.hoist.library.find((x) => x.type === type);
  if (!p) return console.log("no type", type);
  const u = H.derivePrimitiveUsage(R.hoist), c = H.derivePrimitiveCompanions(R.hoist);
  const sw = H.primitivePromptSwitches(p, c[type] ?? [], R.hoist.library, R.focal);
  write(`prim-${type}`, `${type} (real contract; focal=${sw.focal}, holds=${sw.holds}, heldBy=${sw.heldBy.join("/") || "-"}).`,
    SK.buildPrimitiveSystemPrompt(sw) + `\n\nVISUAL GUIDELINES — follow these guidelines so this primitive matches the rest of its UI:\n${R.style}`,
    SK.primitiveRequest(R.task, p, u[type], c[type] ?? []));
};
prim(dj, dj.focal[0]); prim(dj, "Knob");
const holders = cp.hoist.library.filter((t) => H.heldTypeNames(t).length);
const holder = holders.find((t) => cp.focal.includes(t.type)) ?? holders[0];
if (holder) { prim(cp, holder.type); prim(cp, H.heldTypeNames(holder)[0]); }

write("focal-agent", `The focal agent on ${dj.task} (real hoist and roles).`, SK.FOCAL_SYSTEM_PROMPT,
  SK.focalRequest(dj.task, dj.defs, dj.hoist.library, H.derivePrimitiveUsage(dj.hoist)));
// Wiring: the contract agent's first split call and 2 components, from a saved Wire run.
const W = JSON.parse(fs.readFileSync(path.join(arg("wire", ROOT + "/docs/fixtures/model-exp/wiring/dj-7643"), "wire-run.json"), "utf8"));
const comps = W.inputs.map((x) => ({ name: x.name, code: x.original, role: dj.defs.find((d) => d.name === x.name)?.role }));
const split = load(ROOT + "/app/utils/contractGen.ts").splitChannels(W.channelList)[0];
write("contract-agent", `The contract agent on ${dj.task}: the first of its split calls (${split.length} channels; real channels and code).`, SK.CONTRACT_SYSTEM_PROMPT, SK.contractRequest(split, comps));
const specs = W.channelList.map((c) => ({ channel: c, contract: W.contracts.find((k) => k.id === c.id) })).filter((x) => x.contract);
const wire = (re, name) => {
  const c = comps.find((x) => re.test(x.name));
  const sends = specs.filter((x) => x.channel.from === c.name), receives = specs.filter((x) => x.channel.to === c.name);
  write(name, `Wiring ${c.name} (real code and contracts; ${sends.length} sends, ${receives.length} receives).`, SK.WIRE_SYSTEM_PROMPT, SK.wireRequest(c, sends, receives));
};
wire(/Mixer/, "wire-1-mixer"); wire(/Waveform/, "wire-2-waveform");
console.log("wrote", fs.readdirSync(OUT).length, "files to", OUT);
