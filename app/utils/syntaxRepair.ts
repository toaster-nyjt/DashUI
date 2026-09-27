// SERVER-ONLY: deterministic repair of the small syntax slips generated code makes (a missing
// closer, a misquoted SVG url(#id) reference). Only touches code that doesn't compile, and only
// keeps a repair when the WHOLE file then compiles, so it can never break working code.
import ts from "typescript";

export type SyntaxIssue = { line: number; message: string; snippet: string };

// Compile errors in a TSX file, first one first ([] = compiles).
export function syntaxIssues(code: string): SyntaxIssue[] {
  const r = ts.transpileModule(code, {
    reportDiagnostics: true, fileName: "x.tsx",
    compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  });
  return (r.diagnostics ?? []).map((d) => {
    const line = d.start != null ? code.slice(0, d.start).split("\n").length : 0;
    return { line, message: ts.flattenDiagnosticMessageText(d.messageText, " "), snippet: line ? code.split("\n")[line - 1].trim().slice(0, 140) : "" };
  });
}

const firstErrorPos = (code: string): number | undefined => {
  const r = ts.transpileModule(code, { reportDiagnostics: true, fileName: "x.tsx", compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
  return r.diagnostics?.[0]?.start;
};
const count = (code: string) => syntaxIssues(code).length;

// A url(#id) reference built by concatenation, with its quotes or braces misplaced, e.g.
// fill={"url(#" + uid + "-glow")}  or  fill="url(#" + uid + "-glow)"  ->  fill={"url(#" + uid + "-glow)"}
const URL_REF = /(\s)([A-Za-z][\w-]*)=\{?\s*"url\(#"\s*\+\s*(?:""\s*\+\s*)?([A-Za-z_$][\w$.]*)\s*\+\s*"([^"\n]*?)\)?"\s*\)?\s*"?\s*\}?(?=[\s/>])/g;

// Single-token edits tried at the first error: insert a missing closer or comma, or drop one char.
const EDITS: ((c: string, p: number) => string)[] = [")", "]", "}", ","].map((t) => (c: string, p: number) => c.slice(0, p) + t + c.slice(p))
  .concat([(c: string, p: number) => c.slice(0, p) + c.slice(p + 1)]);

export function repairSyntax(code: string): { code: string; repairs: string[] } | null {
  if (!count(code)) return { code, repairs: [] };
  let cur = code;
  const repairs: string[] = [];
  const urlFixed = cur.replace(URL_REF, (_m, sp, attr, id, suffix) => `${sp}${attr}={"url(#" + ${id} + "${suffix})"}`);
  if (urlFixed !== cur && count(urlFixed) < count(cur)) { cur = urlFixed; repairs.push("url(#id) references re-quoted"); }
  // Up to three single-token edits, each at the then-first error, each strictly reducing the error count.
  for (let step = 0; step < 3 && count(cur); step++) {
    const pos = firstErrorPos(cur);
    if (pos == null) break;
    const before = count(cur);
    let best: { code: string; n: number; i: number } | null = null;
    EDITS.forEach((edit, i) => {
      const next = edit(cur, pos);
      const n = count(next);
      if (n < before && (!best || n < best.n)) best = { code: next, n, i };
    });
    if (!best) break;
    const b = best as { code: string; n: number; i: number };
    const line = cur.slice(0, pos).split("\n").length;
    repairs.push(b.i < 4 ? `inserted "${[")", "]", "}", ","][b.i]}" at line ${line}` : `removed a stray character at line ${line}`);
    cur = b.code;
  }
  return count(cur) ? null : { code: cur, repairs };
}
