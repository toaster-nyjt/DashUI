// Static scan of a leaf: every JSX element whose subtree contains a primitive and whose
// literal className carries min-w-0 / min-h-0 / overflow-(hidden|auto|scroll) violates
// NO MIN-ZERO AROUND PRIMITIVES. Also flags children with truncate/w-full inside faces.
// Usage: node slot-scan.cjs <leaf.tsx>...
const fs = require("fs");
const ts = require("C:/Users/realy/OneDrive/Documents/Work/DashUI/node_modules/typescript");
const PRIMS = ["Knob", "Fader", "Button", "ToggleButton", "Pad", "JogWheel", "Waveform", "LevelMeter", "Readout", "SearchInput", "TreeSelect", "TrackList", "SortHeaders", "Selector"];
const BAN = /(^|\s)(min-w-0|min-h-0|overflow-hidden|overflow-auto|overflow-scroll|overflow-y-auto|overflow-x-auto)(?=\s|$)/g;

for (const file of process.argv.slice(2)) {
  const code = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, code, ts.ScriptTarget.ES2020, true, ts.ScriptKind.TSX);
  const out = [];
  const tagName = (n) => (ts.isJsxElement(n) ? n.openingElement.tagName : n.tagName).getText(sf);
  const attrs = (n) => (ts.isJsxElement(n) ? n.openingElement.attributes : n.attributes);
  const classText = (n) => {
    for (const a of attrs(n).properties) {
      if (!ts.isJsxAttribute(a) || a.name.getText(sf) !== "className" || !a.initializer) continue;
      // literal pieces only (string literal, or string literals inside an expression)
      const lits = [];
      const walk = (x) => { if (ts.isStringLiteral(x) || ts.isNoSubstitutionTemplateLiteral(x)) lits.push(x.text); ts.forEachChild(x, walk); };
      walk(a.initializer);
      return lits.join(" ");
    }
    return "";
  };
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
      let f = false; const w = (x) => { if (f) return; if ((ts.isJsxElement(x) || ts.isJsxSelfClosingElement(x)) && HOLDS.has(tagName(x))) f = true; else ts.forEachChild(x, w); };
      w(body);
      if (f) { HOLDS.add(name); changed = true; }
    }
  }
  const containsPrim = (n) => { let f = false; const w = (x) => { if (f) return; if ((ts.isJsxElement(x) || ts.isJsxSelfClosingElement(x)) && HOLDS.has(tagName(x))) f = true; else ts.forEachChild(x, w); }; ts.forEachChild(n, w); return f; };
  let root = null;
  const visit = (n, depthUnderRoot) => {
    if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
      const tag = tagName(n);
      if (!PRIMS.includes(tag) && /^[a-z]/.test(tag)) {
        const isRoot = root === null && /h-full w-full flex flex-col/.test(classText(n));
        if (isRoot) root = n;
        else if (containsPrim(n) && !classText(n).includes("[scrollbar-width:none]")) {
          const bad = [...classText(n).matchAll(BAN)].map((m) => m[2]);
          if (bad.length) out.push({ line: sf.getLineAndCharacterOfPosition(n.getStart()).line + 1, bad: [...new Set(bad)].join(" "), cls: classText(n).slice(0, 90) });
        }
      }
      // face children: truncate / w-full / h-full / absolute sizes inside a primitive
      if (PRIMS.includes(tag) && ts.isJsxElement(n)) {
        const walk = (x) => {
          if (ts.isJsxElement(x) || ts.isJsxSelfClosingElement(x)) {
            const c = classText(x);
            const hits = c.match(/(^|\s)(truncate|w-full|h-full|text-(xs|sm|base|lg|[0-9]?xl|\[\d+(\.\d+)?(px|rem)\]))(?=\s|$)/g);
            if (hits) out.push({ line: sf.getLineAndCharacterOfPosition(x.getStart()).line + 1, bad: "face child: " + hits.map((h) => h.trim()).join(" "), cls: "inside <" + tag + ">" });
          }
          ts.forEachChild(x, walk);
        };
        n.children.forEach((c) => ts.forEachChild(c, walk) || walk(c));
      }
    }
    ts.forEachChild(n, (c) => visit(c));
  };
  visit(sf);
  console.log(`${file}: ${out.length} issue(s)`);
  for (const o of out) console.log(`   L${o.line}  ${o.bad.padEnd(34)} ${o.cls}`);
}
