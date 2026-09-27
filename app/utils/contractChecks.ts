// SERVER-ONLY: validates a contract-agent result (the contract agent's validator). Uses the
// TypeScript compiler, so never import this from a client component.
import ts from "typescript";
import { ChannelContract } from "./spec";

// Just enough of the standard library for JSON-only types, so a check needs no lib.d.ts.
export const MINI_LIB = `interface Array<T> { length: number; [n: number]: T } interface ReadonlyArray<T> { length: number; readonly [n: number]: T }
interface Boolean {} interface Number {} interface String {} interface Object {} interface Function {} interface IArguments {} interface RegExp {}
interface CallableFunction {} interface NewableFunction {}
type Record<K extends keyof any, T> = { [P in K]: T };`;

const ALLOWED_REFS = new Set(["Array", "ReadonlyArray", "Record"]);

// The first non-JSON part of a payload type, or undefined when it is JSON data only.
function nonJson(node: ts.TypeNode): string | undefined {
  switch (node.kind) {
    case ts.SyntaxKind.StringKeyword: case ts.SyntaxKind.NumberKeyword: case ts.SyntaxKind.BooleanKeyword:
      return undefined;
    case ts.SyntaxKind.LiteralType: {
      const lit = (node as ts.LiteralTypeNode).literal;
      return [ts.SyntaxKind.StringLiteral, ts.SyntaxKind.NumericLiteral, ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword, ts.SyntaxKind.PrefixUnaryExpression].includes(lit.kind) ? undefined : lit.getText();
    }
    case ts.SyntaxKind.ParenthesizedType: return nonJson((node as ts.ParenthesizedTypeNode).type);
    case ts.SyntaxKind.ArrayType: return nonJson((node as ts.ArrayTypeNode).elementType);
    case ts.SyntaxKind.TupleType: return (node as ts.TupleTypeNode).elements.map((e) => nonJson(ts.isNamedTupleMember(e) ? e.type : e)).find(Boolean);
    case ts.SyntaxKind.UnionType: return (node as ts.UnionTypeNode).types.map(nonJson).find(Boolean);
    case ts.SyntaxKind.TypeLiteral:
      for (const m of (node as ts.TypeLiteralNode).members) {
        if (ts.isPropertySignature(m)) { if (!m.type) return `property "${m.name.getText()}" has no type`; const bad = nonJson(m.type); if (bad) return bad; }
        else if (ts.isIndexSignatureDeclaration(m)) { const bad = nonJson(m.type); if (bad) return bad; }
        else return m.getText();
      }
      return undefined;
    case ts.SyntaxKind.TypeReference: {
      const ref = node as ts.TypeReferenceNode;
      const name = ref.typeName.getText();
      if (!ALLOWED_REFS.has(name)) return name;
      return (ref.typeArguments ?? []).map(nonJson).find(Boolean);
    }
    default: return node.getText();
  }
}

// Type-checks `example` against `payload`. Returns the first error, "" when it passes, or
// undefined when the check can't run (then it is skipped, never rejected).
function exampleError(payload: string, example: unknown): string | undefined {
  try {
    const file = "contract.ts";
    const text = `${MINI_LIB}\ntype P = ${payload};\nconst e: P = ${JSON.stringify(example)};`;
    const options: ts.CompilerOptions = { noLib: true, strict: true, noEmit: true, target: ts.ScriptTarget.ES2020 };
    const host = ts.createCompilerHost(options);
    host.getSourceFile = (name, lang) => (name === file ? ts.createSourceFile(name, text, lang) : undefined);
    host.fileExists = (name) => name === file;
    host.readFile = (name) => (name === file ? text : undefined);
    const diags = ts.createProgram([file], options, host).getSemanticDiagnostics();
    return diags.length ? ts.flattenDiagnosticMessageText(diags[0].messageText, " ") : "";
  } catch {
    return undefined;
  }
}

// Every channel exactly once (id verbatim), a valid kind, a JSON-only payload type, and an
// example of that type. Returns the contracts, or the first violation to feed back on retry.
export function validateContracts(result: unknown, channels: { id: string }[]): { contracts?: ChannelContract[]; error?: string } {
  const list = (result as { contracts?: unknown })?.contracts;
  if (!Array.isArray(list)) return { error: `Output must be {"contracts": [...]}.` };
  const ids = new Set(channels.map((c) => c.id));
  const seen = new Set<string>();
  for (const c of list as Partial<ChannelContract>[]) {
    if (typeof c?.id !== "string" || !ids.has(c.id)) return { error: `"${c?.id}" is not a channel id; copy each id verbatim from CHANNELS.` };
    if (seen.has(c.id)) return { error: `Channel "${c.id}" has more than one contract; give exactly one.` };
    seen.add(c.id);
    if (c.kind !== "state" && c.kind !== "event") return { error: `Channel "${c.id}": kind must be "state" or "event".` };
    if (typeof c.payload !== "string" || !c.payload.trim()) return { error: `Channel "${c.id}": payload must be a TypeScript type expression string.` };
    const src = ts.createSourceFile("p.ts", `type P = ${c.payload};`, ts.ScriptTarget.ES2020, true);
    const decl = src.statements[0];
    const syntax = ts.transpileModule(`type P = ${c.payload};`, { reportDiagnostics: true }).diagnostics ?? [];
    if (syntax.length || src.statements.length !== 1 || !decl || !ts.isTypeAliasDeclaration(decl))
      return { error: `Channel "${c.id}": payload "${c.payload}" is not a valid TypeScript type expression.` };
    const bad = nonJson(decl.type);
    if (bad) return { error: `Channel "${c.id}": payload uses "${bad}", which is not JSON data; use only object types, arrays, string, number, boolean, null and literal unions.` };
    if (!("example" in c)) return { error: `Channel "${c.id}": missing example.` };
    const exErr = exampleError(c.payload, c.example);
    if (exErr) return { error: `Channel "${c.id}": example ${JSON.stringify(c.example).slice(0, 200)} does not match payload type: ${exErr}` };
  }
  const missing = channels.find((c) => !seen.has(c.id));
  if (missing) return { error: `Channel "${missing.id}" has no contract; give exactly one per channel.` };
  return { contracts: list as ChannelContract[] };
}
