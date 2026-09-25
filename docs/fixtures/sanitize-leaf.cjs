// Deterministic post-processor for a primitive leaf (no model, no browser).
//  1. Around primitives: on every element that contains a primitive at any depth (except the
//     leaf's outermost element and deliberate hidden-scrollbar scroll regions) remove
//     min-w-0 / min-h-0 / overflow-auto|scroll|x-auto|y-auto, and turn overflow-hidden into
//     overflow-clip — so every box keeps its default minimum and primitive floors propagate.
//  2. Face children: inside a primitive's children remove truncate / w-full / h-full /
//     overflow-* and absolute font sizes (em-relative sizes stay) — so FitText can measure.
// Only literal class strings are edited; structure is never touched.
// Usage: node sanitize-leaf.cjs <in.tsx> <out.tsx>   (prints a change log)
const fs = require("fs");
const ts = require("C:/Users/realy/OneDrive/Documents/Work/DashUI/node_modules/typescript");

const PRIMS = new Set(["Knob", "Fader", "Button", "ToggleButton", "Pad", "JogWheel", "Waveform", "LevelMeter", "Readout", "SearchInput", "TreeSelect", "TrackList", "SortHeaders", "Selector"]);
const AROUND = /^(min-w-0|min-h-0|overflow-auto|overflow-scroll|overflow-x-auto|overflow-y-auto|overflow-hidden)$/;
const FACE = /^(truncate|w-full|h-full|overflow-[a-z-]+|text-(xs|sm|base|lg|[0-9]?xl)|text-\[\d+(\.\d+)?(px|rem)\])$/;

function sanitize(code) {
  const sf = ts.createSourceFile("leaf.tsx", code, ts.ScriptTarget.ES2020, true, ts.ScriptKind.TSX);
  const tagOf = (n) => (ts.isJsxElement(n) ? n.openingElement.tagName : n.tagName).getText(sf);
  const attrsOf = (n) => (ts.isJsxElement(n) ? n.openingElement.attributes : n.attributes);
  const isEl = (n) => ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n);
  const classLits = (n) => {
    const lits = [];
    for (const a of attrsOf(n).properties) {
      if (!ts.isJsxAttribute(a) || a.name.getText(sf) !== "className" || !a.initializer) continue;
      const walk = (x) => { if (ts.isStringLiteral(x) || ts.isNoSubstitutionTemplateLiteral(x)) lits.push(x); ts.forEachChild(x, walk); };
      walk(a.initializer);
    }
    return lits;
  };
  const classText = (n) => classLits(n).map((l) => l.text).join(" ");
  // Local components (defined in this file) that render primitives, directly or through
  // other local components, count as primitives — otherwise <ChannelStrip/> hides the
  // Knobs and Faders inside it from the ancestors that need their floors.
  const localDefs = new Map(); // name -> body node
  const collect = (x) => {
    if (ts.isFunctionDeclaration(x) && x.name && /^[A-Z]/.test(x.name.text) && x.body) localDefs.set(x.name.text, x.body);
    if (ts.isVariableDeclaration(x) && ts.isIdentifier(x.name) && /^[A-Z]/.test(x.name.text) && x.initializer &&
        (ts.isArrowFunction(x.initializer) || ts.isFunctionExpression(x.initializer))) localDefs.set(x.name.text, x.initializer.body);
    ts.forEachChild(x, collect);
  };
  collect(sf);
  const HOLDS = new Set(PRIMS);
  for (let changed = true; changed; ) {
    changed = false;
    for (const [name, body] of localDefs) {
      if (HOLDS.has(name)) continue;
      let f = false; const w = (x) => { if (f) return; if (isEl(x) && HOLDS.has(tagOf(x))) f = true; else ts.forEachChild(x, w); };
      w(body);
      if (f) { HOLDS.add(name); changed = true; }
    }
  }
  const containsPrim = (n) => { let f = false; const w = (x) => { if (f) return; if (isEl(x) && HOLDS.has(tagOf(x))) f = true; else ts.forEachChild(x, w); }; ts.forEachChild(n, w); return f; };

  const edits = new Map(); // literal node -> { rule, removed[] }
  const log = [];
  const strip = (lit, test, rule, swap) => {
    const e = edits.get(lit) || { toks: lit.text.split(/(\s+)/), removed: [] };
    e.toks = e.toks.map((t) => {
      if (!t.trim() || !test.test(t)) return t;
      e.removed.push(t);
      return swap && swap[t] !== undefined ? swap[t] : "";
    });
    if (e.removed.length) { e.rule = e.rule ? e.rule + "+" + rule : rule; edits.set(lit, e); }
  };

  let root = null;
  const visit = (n) => {
    if (isEl(n)) {
      const tag = tagOf(n);
      if (/^[a-z]/.test(tag)) {
        const c = classText(n);
        if (!root && /\bh-full\b/.test(c) && /\bw-full\b/.test(c) && /\bflex-col\b/.test(c)) root = n;
        const scrollRegion = /\[scrollbar-width:none\]/.test(c);
        if (n !== root && !scrollRegion && containsPrim(n))
          for (const l of classLits(n)) strip(l, AROUND, "around", { "overflow-hidden": "overflow-clip" });
      }
      if (PRIMS.has(tag) && ts.isJsxElement(n)) {
        const w = (x) => { if (isEl(x) && /^[a-z]/.test(tagOf(x))) for (const l of classLits(x)) strip(l, FACE, "face"); ts.forEachChild(x, w); };
        n.children.forEach(w);
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);

  // 3. Overflow scrolls, never clips: the outermost element's main body region (its "flex-1"
  //    child) becomes a hidden-scrollbar scroll region. With floors enforced, a leaf whose
  //    parts don't fit then scrolls inside its box instead of losing its bottom rows.
  if (root && ts.isJsxElement(root)) {
    const body = root.children.find((c) => isEl(c) && /^[a-z]/.test(tagOf(c)) && /(^|\s)flex-1(\s|$)/.test(classText(c)));
    const lits = body ? classLits(body) : [];
    if (body && lits.length && !/\[scrollbar-width:none\]/.test(classText(body))) {
      const lit = lits[0];
      const e = edits.get(lit) || { toks: lit.text.split(/(\s+)/), removed: [] };
      const add = ["min-h-0", "overflow-y-auto", "[scrollbar-width:none]", "[&::-webkit-scrollbar]:hidden"].filter((t) => !e.toks.includes(t));
      e.toks.push(" " + add.join(" "));
      e.rule = e.rule ? e.rule + "+scroll" : "scroll";
      e.removed.push("(+ " + add.join(" ") + ")");
      edits.set(lit, e);
    } else log.push({ line: 0, rule: "scroll", removed: [!body ? "no flex-1 body found — not made scrollable"
      : /\[scrollbar-width:none\]/.test(classText(body)) ? "body is already a hidden-scrollbar scroll region"
      : "body has no literal className — not made scrollable"] });
  }

  // Apply back to front so positions stay valid; re-quote with the literal's own quote char.
  let out = code;
  const list = [...edits.entries()].sort((a, b) => b[0].getStart() - a[0].getStart());
  for (const [lit, e] of list) {
    const q = code[lit.getStart()];
    const text = e.toks.join("").replace(/\s{2,}/g, " ");
    const trimmed = /^\s/.test(lit.text) || /\s$/.test(lit.text) ? text : text.trim(); // keep deliberate edge spaces used in concatenation
    out = out.slice(0, lit.getStart()) + q + trimmed + q + out.slice(lit.getEnd());
    log.push({ line: sf.getLineAndCharacterOfPosition(lit.getStart()).line + 1, rule: e.rule, removed: e.removed });
  }
  return { out, log: log.reverse() };
}

if (require.main === module) {
  const [inp, outp] = process.argv.slice(2);
  const { out, log } = sanitize(fs.readFileSync(inp, "utf8"));
  fs.writeFileSync(outp, out);
  const n = (r) => log.filter((l) => l.rule.includes(r)).reduce((a, l) => a + l.removed.length, 0);
  console.log(`${inp}: ${log.length} literals edited — around-primitive classes removed: ${n("around")}, face-child classes removed: ${n("face")}`);
  for (const l of log) console.log(`   L${l.line} [${l.rule}] ${l.removed.join(" ")}`);
}
module.exports = { sanitize };
