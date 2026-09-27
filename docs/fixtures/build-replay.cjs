// Replays a logged run through the REAL build route (app/api/build/route.ts) with the two model
// calls stubbed: each primitive returns its logged code/floor after its logged time, each leaf
// records its request and returns after its logged time (times scaled by --speed). No API calls.
// Checks: every event arrives, each leaf starts only after its own types settle, and each leaf's
// prompt (user message + system) is byte-identical to what the client path builds with the
// final primitive set (resolveComponent + buildLeafSystem).
// Usage: node build-replay.cjs --log=<task jsonl> [--speed=20]
const fs = require("fs");
const { load, ROOT } = require("./lib/load.cjs");
const arg = (k, d) => process.argv.find((a) => a.startsWith("--" + k + "="))?.slice(k.length + 3) ?? d;
const SPEED = +arg("speed", 20);
const L = fs.readFileSync(arg("log"), "utf8").split("\n").filter(Boolean).map(JSON.parse);
const end = L.findIndex((l, i) => i > 0 && l.stage === "run:start");
const R = end > 0 ? L.slice(0, end) : L;
const hoist = R.filter((l) => l.stage === "hoist" && l.hoist).pop().hoist;
const style = R.find((l) => l.stage === "style").style;
const focal = R.find((l) => l.stage === "focal:valid")?.focal ?? [];
const defsRaw = R.find((l) => l.stage === "run:plan") && R.find((l) => l.stage === "plan")?.defs;
const H = load(ROOT + "/app/utils/helpers.ts");
const { buildLeafSystem } = load(ROOT + "/app/utils/leafPrompt.ts");

// Logged primitive results and times.
const prim = {};
for (const l of R) if (l.stage === "primitive" && !(l.errors || []).length) prim[l.type] = { code: l.code, floor: l.floor, secs: l.secs };
const leafSecs = {};
for (const l of R) if (l.stage === "leaf:done") leafSecs[l.leafKey] = l.secs;

// Stub the model calls (the route calls them through the module objects, so patching works).
const pg = load(ROOT + "/app/utils/primitiveGen.ts"), lg = load(ROOT + "/app/utils/leafGen.ts");
const t0 = Date.now(), at = () => ((Date.now() - t0) / 1000 * SPEED).toFixed(0) + "s";
pg.generatePrimitive = async (task, p) => {
  const r = prim[p.type];
  await new Promise((res) => setTimeout(res, (r?.secs ?? 30) * 1000 / SPEED));
  return r ? { code: r.code, floor: r.floor, attempts: 1 } : { error: "dropped (not in log)", attempts: 3 };
};
const leafReqs = {};
lg.generateLeaf = async (req) => {
  leafReqs[req.leafKey] = { ...req, startedAt: at() };
  await new Promise((res) => setTimeout(res, (leafSecs[req.leafKey] ?? 45) * 1000 / SPEED));
  return "// code for " + req.leafKey;
};
load(ROOT + "/app/utils/runLog.ts").runLog = () => {};

(async () => {
  const route = load(ROOT + "/app/api/build/route.ts");
  // The leaves exactly as SpatialGrid sends them: plain resolved component + box size.
  const defs = defsRaw ?? R.find((l) => l.stage === "run:style|hoist|layout").resolvedDefs.map((d) => (typeof d === "string" ? JSON.parse(d) : d));
  const starts = R.filter((l) => l.stage === "leaf:start");
  const leaves = starts.filter((s, i) => starts.findIndex((x) => x.leafKey === s.leafKey) === i).map((s) => {
    const plain = { ...s.spec, features: Object.keys(s.spec.features) };
    return { leafKey: s.leafKey, prompt: JSON.stringify(plain), boxSize: s.boxSize };
  });
  const res = await route.POST(new Request("http://x/api/build", { method: "POST", body: JSON.stringify({ task: R[0].task, hoist, style, focal, leaves, taskID: 1 }) }));
  const reader = res.body.getReader(), dec = new TextDecoder();
  let buf = "", events = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    for (let nl; (nl = buf.indexOf("\n")) >= 0; buf = buf.slice(nl + 1)) {
      const e = JSON.parse(buf.slice(0, nl));
      events.push(e);
      console.log(at().padStart(5), e.type.padEnd(11), e.name ?? e.leafKey ?? "");
    }
  }

  // Byte-identity against the client path with the final primitive set.
  const finalSet = { hoist, code: Object.fromEntries(Object.entries(prim).map(([t, r]) => [t, r.code])), floors: Object.fromEntries(Object.entries(prim).map(([t, r]) => [t, r.floor])), focal };
  let same = 0, diff = 0;
  for (const s of leaves) {
    const got = leafReqs[s.leafKey];
    const spec = JSON.parse(s.prompt);
    const clientPrompt = JSON.stringify({ ...spec, features: H.leafFeatures(finalSet, spec.name, spec.features) });
    const clientSys = buildLeafSystem({ spec: JSON.parse(clientPrompt), boxSize: s.boxSize, style, primitives: { library: H.leafLibrary(finalSet), floors: finalSet.floors, focal }, budget: true }).system;
    const buildSys = buildLeafSystem({ spec: JSON.parse(got.prompt), boxSize: got.boxSize, style: got.style, primitives: got.primitives, budget: true }).system;
    const ok = got.prompt === clientPrompt && buildSys === clientSys;
    ok ? same++ : diff++;
    console.log(`${spec.name.padEnd(42)} started ${got.startedAt.padStart(4)} (own: ${H.ownTypes(hoist, spec.name, spec.features).join(", ")})  prompt identical: ${ok}`);
  }
  console.log({ events: events.length, primitives: events.filter((e) => e.type === "primitive").length, leaves: events.filter((e) => e.type === "leaf").length, done: events.at(-1)?.type === "done", identicalPrompts: same, differentPrompts: diff });
})();
