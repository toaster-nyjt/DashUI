// SERVER-ONLY: static checks on one wired component (the wiring step's validator). Uses the
// TypeScript compiler, so never import this from a client component.
import ts from "typescript";
import type { WireSpec } from "@/app/api/SKILLS";
import { MINI_LIB } from "./contractChecks";

type BusCall = { method: "emit" | "on"; id?: string; call: ts.CallExpression; inRender?: string; inEffect: boolean; inHelper: boolean };

// True when fn is the callback passed to useEffect / useLayoutEffect.
const isEffectCallback = (fn: ts.Node | undefined): boolean =>
  !!fn && ts.isCallExpression(fn.parent) && fn.parent.arguments[0] === fn && ts.isIdentifier(fn.parent.expression) && /^use(Layout)?Effect$/.test(fn.parent.expression.text);

// The name of a function declared at file level, or undefined.
function topLevelFnName(fn: ts.Node): string | undefined {
  if (ts.isFunctionDeclaration(fn) && ts.isSourceFile(fn.parent)) return fn.name?.text ?? "the default export";
  if ((ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && ts.isVariableDeclaration(fn.parent)
    && ts.isVariableDeclarationList(fn.parent.parent) && ts.isVariableStatement(fn.parent.parent.parent) && ts.isSourceFile(fn.parent.parent.parent.parent))
    return fn.parent.name.getText();
  return undefined;
}
// A component declared at file level (PascalCase, or the default export): a bus call directly
// in its body runs during render. Lowercase top-level helpers are not flagged.
const isComponentName = (name?: string) => !!name && /^[A-Z]|^the default export$/.test(name);

// Every bus.emit / bus.on call, its channel id (a string literal, or a const holding one;
// undefined when it can't be resolved) and, when it runs during render, the function it's in.
function busCalls(src: ts.SourceFile): BusCall[] {
  const consts = new Map<string, string>();
  const calls: BusCall[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer && ts.isStringLiteralLike(n.initializer)) consts.set(n.name.text, n.initializer.text);
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && ts.isIdentifier(n.expression.expression)
      && n.expression.expression.text === "bus" && (n.expression.name.text === "emit" || n.expression.name.text === "on")) {
      let fn: ts.Node | undefined = n.parent;
      while (fn && !ts.isFunctionLike(fn)) fn = fn.parent;
      const top = fn && topLevelFnName(fn);
      calls.push({ method: n.expression.name.text, call: n, inRender: !fn ? "the module body" : isComponentName(top) ? top : undefined, inEffect: isEffectCallback(fn), inHelper: !!top && !isComponentName(top) });
    }
    ts.forEachChild(n, visit);
  };
  visit(src);
  for (const c of calls) {
    const a = c.call.arguments[0];
    c.id = a && ts.isStringLiteralLike(a) ? a.text : a && ts.isIdentifier(a) ? consts.get(a.text) : undefined;
  }
  return calls;
}

// Type-checks every bus.emit payload against its contract (bus declared with one overload per
// channel this component sends). Only errors inside an emit call count (with several overloads
// the error sits on the whole call); the rest of the file isn't typed here. Returns the first
// mismatch, or undefined (also when it can't run).
function payloadError(code: string, sends: WireSpec[], emits: BusCall[]): string | undefined {
  if (!sends.length || !emits.length) return undefined;
  try {
    const decl = `declare const bus: {\n${sends.map((s) => `  emit(id: ${JSON.stringify(s.channel.id)}, payload: ${s.contract.payload}): void;`).join("\n")}\n  on(id: string, handler: (payload: any) => void): () => void;\n};\n`;
    const text = MINI_LIB + "\n" + decl + code;
    const offset = text.length - code.length;
    const file = "wired.tsx";
    const options: ts.CompilerOptions = { noLib: true, strict: true, noEmit: true, jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ES2020 };
    const host = ts.createCompilerHost(options);
    host.getSourceFile = (name, lang) => (name === file ? ts.createSourceFile(name, text, lang, true, ts.ScriptKind.TSX) : undefined);
    host.fileExists = (name) => name === file;
    host.readFile = (name) => (name === file ? text : undefined);
    const diags = ts.createProgram([file], options, host).getSemanticDiagnostics();
    for (const e of emits) {
      const arg = e.call.arguments[1];
      if (!arg || !e.id) continue;
      const [from, to] = [e.call.getStart() + offset, e.call.getEnd() + offset];
      const d = diags.find((x) => x.start != null && x.start >= from && x.start < to);
      if (d) return `the payload of bus.emit("${e.id}", …) does not match its PAYLOAD type ${sends.find((s) => s.channel.id === e.id)?.contract.payload}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

// Every rule a wired component must meet. Returns every violation (the first is fed back on retry).
export function checkLeafWiring(code: string, sends: WireSpec[], receives: WireSpec[]): string[] {
  const errors: string[] = [];
  const r = ts.transpileModule(code, { reportDiagnostics: true, fileName: "wired.tsx", compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
  for (const d of r.diagnostics ?? []) {
    const line = d.start != null ? code.slice(0, d.start).split("\n").length : 0;
    errors.push(`syntax: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}${line ? ` at line ${line}: \`${code.split("\n")[line - 1].trim().slice(0, 140)}\`` : ""}`);
  }
  if (errors.length) return errors;
  if (!/export\s+default\s+function\s+GeneratedComponent\b/.test(code)) errors.push(`the default export must stay "export default function GeneratedComponent"`);

  const src = ts.createSourceFile("wired.tsx", code, ts.ScriptTarget.ES2020, true, ts.ScriptKind.TSX);
  const calls = busCalls(src);
  const unresolved = calls.some((c) => c.id === undefined);
  const own = new Map([...sends.map((s) => [s.channel.id, "emit"] as const), ...receives.map((s) => [s.channel.id, "on"] as const)]);
  for (const [id, method] of own)
    if (!unresolved && !calls.some((c) => c.method === method && c.id === id))
      errors.push(`channel "${id}" is never ${method === "emit" ? "published: add bus.emit" : "subscribed: add bus.on"}("${id}", …) as its contract says`);
  for (const s of sends)
    // An emit in a top-level helper can't be traced to its caller here, so the check skips it.
    if (!unresolved && s.contract.kind === "state" && calls.some((c) => c.method === "emit" && c.id === s.channel.id) && !calls.some((c) => c.method === "emit" && c.id === s.channel.id && (c.inEffect || c.inHelper)))
      errors.push(`"${s.channel.id}" is a state channel, so send it from ONE useEffect keyed on the values it sends (it must fire on mount AND on every change), not only from a handler: useEffect(() => { bus.emit("${s.channel.id}", …); }, [...])`);
  for (const c of calls) {
    if (c.id !== undefined && own.get(c.id) !== c.method)
      errors.push(`bus.${c.method}("${c.id}", …) is not one of this component's ${c.method === "emit" ? "SENDS" : "RECEIVES"} channels; use only the listed ids`);
    if (c.inRender) errors.push(`bus.${c.method}("${c.id ?? "…"}", …) is called directly in the body of ${c.inRender}, so it runs on every render; move it into a useEffect or an event handler`);
  }
  if (!errors.length) {
    const p = payloadError(code, sends, calls.filter((c) => c.method === "emit"));
    if (p) errors.push(p);
  }
  return errors;
}
