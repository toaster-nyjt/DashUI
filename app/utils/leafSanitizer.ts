// SERVER-ONLY: deterministic post-processor for a leaf built from primitives (generate
// route). Uses the TypeScript parser, so never import this from a client component.
//  1. Around primitives: on every element that contains a primitive at any depth (except the
//     leaf's outermost element and deliberate hidden-scrollbar scroll regions) remove
//     min-w-0 / min-h-0 / overflow-auto|scroll|x-auto|y-auto, and turn overflow-hidden into
//     overflow-clip — so every box keeps its default minimum and primitive floors propagate.
//  2. Face children: inside a primitive's children remove truncate / w-full / h-full /
//     overflow-* and absolute font sizes (em-relative sizes stay) — so FitText can measure.
//  3. The outermost element's flex-1 body becomes a hidden-scrollbar scroll region, so a
//     leaf whose parts exceed the box scrolls instead of clipping.
// Only literal class strings are edited; structure is never touched.
import ts from "typescript";

const AROUND = /^(min-w-0|min-h-0|overflow-auto|overflow-scroll|overflow-x-auto|overflow-y-auto|overflow-hidden)$/;
const FACE = /^(truncate|w-full|h-full|overflow-[a-z-]+|text-(xs|sm|base|lg|[0-9]?xl)|text-\[\d+(\.\d+)?(px|rem)\])$/;
const SCROLL_BODY = ["min-h-0", "overflow-y-auto", "[scrollbar-width:none]", "[&::-webkit-scrollbar]:hidden"];

type Literal = ts.StringLiteral | ts.NoSubstitutionTemplateLiteral;
type JsxEl = ts.JsxElement | ts.JsxSelfClosingElement;

// primitives = the library's type names in scope for this leaf.
export function sanitizeLeaf(code: string, primitives: string[]): string {
  const sf = ts.createSourceFile("leaf.tsx", code, ts.ScriptTarget.ES2020, true, ts.ScriptKind.TSX);
  const isEl = (n: ts.Node): n is JsxEl => ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n);
  const tagOf = (n: JsxEl) => (ts.isJsxElement(n) ? n.openingElement.tagName : n.tagName).getText(sf);
  const attrsOf = (n: JsxEl) => (ts.isJsxElement(n) ? n.openingElement.attributes : n.attributes);
  const classLits = (n: JsxEl): Literal[] => {
    const lits: Literal[] = [];
    for (const a of attrsOf(n).properties) {
      if (!ts.isJsxAttribute(a) || a.name.getText(sf) !== "className" || !a.initializer) continue;
      const walk = (x: ts.Node) => { if (ts.isStringLiteral(x) || ts.isNoSubstitutionTemplateLiteral(x)) lits.push(x); ts.forEachChild(x, walk); };
      walk(a.initializer);
    }
    return lits;
  };
  const classText = (n: JsxEl) => classLits(n).map((l) => l.text).join(" ");

  // Local components that render primitives (directly or through other local components)
  // count as primitives, so <ChannelStrip/> doesn't hide its Knobs from the boxes around it.
  const localDefs = new Map<string, ts.Node>();
  const collect = (x: ts.Node) => {
    if (ts.isFunctionDeclaration(x) && x.name && /^[A-Z]/.test(x.name.text) && x.body) localDefs.set(x.name.text, x.body);
    if (ts.isVariableDeclaration(x) && ts.isIdentifier(x.name) && /^[A-Z]/.test(x.name.text) && x.initializer &&
        (ts.isArrowFunction(x.initializer) || ts.isFunctionExpression(x.initializer))) localDefs.set(x.name.text, x.initializer.body);
    ts.forEachChild(x, collect);
  };
  collect(sf);
  const prims = new Set(primitives);
  const holds = new Set(primitives);
  const rendersHeld = (n: ts.Node, self: boolean) => {
    let f = false;
    const w = (x: ts.Node) => { if (f) return; if (isEl(x) && holds.has(tagOf(x))) f = true; else ts.forEachChild(x, w); };
    if (self) w(n); else ts.forEachChild(n, w);
    return f;
  };
  for (let changed = true; changed; ) {
    changed = false;
    for (const [name, body] of localDefs)
      if (!holds.has(name) && rendersHeld(body, true)) { holds.add(name); changed = true; }
  }

  const edits = new Map<Literal, string[]>(); // literal -> its tokens (whitespace kept)
  const tokensOf = (lit: Literal) => edits.get(lit) ?? lit.text.split(/(\s+)/);
  const strip = (lit: Literal, test: RegExp, swap: Record<string, string> = {}) => {
    let hit = false;
    const toks = tokensOf(lit).map((t) => {
      if (!t.trim() || !test.test(t)) return t;
      hit = true;
      return swap[t] ?? "";
    });
    if (hit) edits.set(lit, toks);
  };

  let root: JsxEl | null = null;
  const visit = (n: ts.Node) => {
    if (isEl(n)) {
      const tag = tagOf(n);
      if (/^[a-z]/.test(tag)) {
        const c = classText(n);
        if (!root && /\bh-full\b/.test(c) && /\bw-full\b/.test(c) && /\bflex-col\b/.test(c)) root = n;
        const scrollRegion = c.includes("[scrollbar-width:none]");
        if (n !== root && !scrollRegion && rendersHeld(n, false))
          for (const l of classLits(n)) strip(l, AROUND, { "overflow-hidden": "overflow-clip" });
      }
      if (prims.has(tag) && ts.isJsxElement(n)) {
        const w = (x: ts.Node) => { if (isEl(x) && /^[a-z]/.test(tagOf(x))) for (const l of classLits(x)) strip(l, FACE); ts.forEachChild(x, w); };
        n.children.forEach(w);
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);

  // 3. Scroll, never clip: the outermost element's flex-1 body child.
  const top = root as JsxEl | null;
  if (top && ts.isJsxElement(top)) {
    const body = top.children.find((c): c is JsxEl => isEl(c) && /^[a-z]/.test(tagOf(c)) && /(^|\s)flex-1(\s|$)/.test(classText(c)));
    const lit = body ? classLits(body)[0] : undefined;
    if (body && lit && !classText(body).includes("[scrollbar-width:none]")) {
      const toks = tokensOf(lit);
      const add = SCROLL_BODY.filter((t) => !toks.includes(t));
      if (add.length) edits.set(lit, [...toks, " " + add.join(" ")]);
    }
  }

  // Apply back to front so positions stay valid; keep the literal's own quote character.
  let out = code;
  for (const [lit, toks] of [...edits.entries()].sort((a, b) => b[0].getStart() - a[0].getStart())) {
    const q = code[lit.getStart()];
    const text = toks.join("").replace(/\s{2,}/g, " ");
    const kept = /^\s/.test(lit.text) || /\s$/.test(lit.text) ? text : text.trim(); // keep deliberate edge spaces used in concatenation
    out = out.slice(0, lit.getStart()) + q + kept + q + out.slice(lit.getEnd());
  }
  return out;
}
