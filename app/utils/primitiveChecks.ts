// SERVER-ONLY: static checks on one generated primitive (the primitive route's validator).
// Uses the TypeScript parser, so never import this from a client component.
import ts from "typescript";
import { PrimitiveType, PrimitiveFloor } from "./spec";
import { parsePrimitiveFloor } from "./helpers";

// Primitive code: first fenced block if any, else from the first top-level declaration
// (a primitive starts with "type <Type>Props", which extractComponentCode would cut).
export function extractPrimitiveCode(raw: string): string {
  const open = raw.match(/```[a-z]*\n/i);
  if (open) {
    const after = raw.slice(open.index! + open[0].length);
    const close = after.search(/\n?```/);
    return close < 0 ? after : after.slice(0, close);
  }
  const start = raw.search(/^(type |interface |export |function |const )/m);
  return start > 0 ? raw.slice(start) : raw;
}

// Every rule a primitive must meet to be shared safely (one file per UI, many instances,
// scaled by the host). Returns every violation (the first is fed back on retry) plus the
// parsed FLOOR when it is valid.
export function checkPrimitive(prim: PrimitiveType, code: string): { errors: string[]; floor?: PrimitiveFloor } {
  const type = prim.type;
  const errors: string[] = [];
  const r = ts.transpileModule(code, {
    reportDiagnostics: true, fileName: type + ".tsx",
    compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  });
  for (const d of r.diagnostics ?? []) {
    // Line + the offending code, so a retry can find the fault.
    const line = d.start != null ? code.slice(0, d.start).split("\n").length : 0;
    const src = line ? code.split("\n")[line - 1].trim().slice(0, 140) : "";
    errors.push(`syntax: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}${line ? ` at line ${line}: \`${src}\`` : ""}`);
  }
  if (/^\s*import\s/m.test(code)) errors.push("has an import (React hooks and FitText are already in scope)");
  if (/export\s+default/.test(code)) errors.push("has a default export");
  if (!new RegExp(`export\\s+function\\s+${type}\\s*\\(`).test(code)) errors.push(`no "export function ${type}("`);
  const exported = [...code.matchAll(/^export\s+(?:function|const|class|let)\s+(\w+)/gm)].map((m) => m[1]);
  const extra = exported.filter((n) => n !== type && n !== type + "_MIN");
  if (extra.length) errors.push("extra exports: " + extra.join(", "));
  const tops = [...code.matchAll(/^(?:export\s+)?(?:function|const|let|class)\s+(\w+)/gm)].map((m) => m[1]);
  const unprefixed = tops.filter((n) => !n.startsWith(type));
  if (unprefixed.length) errors.push(`unprefixed top-level names (prefix them with "${type}"): ` + unprefixed.join(", "));
  if (/\bid="[^"]+"/.test(code)) errors.push("hard-coded SVG id (must be unique per instance)");
  if (/function\s+FitText\b|const\s+FitText\b/.test(code)) errors.push("redefines FitText (it is provided by the host)");
  if (/\d\s*cq(w|h|min|max|i|b)\b/.test(code) && !/container-type/.test(code)) errors.push("uses container-query units with no [container-type:size] ancestor (they resolve against the viewport)");
  if (/ResizeObserver/.test(code)) errors.push("measures its size with ResizeObserver (draw in relative units)");
  const pctPad = code.match(/(^|[\s"'])([pm][xytblr]?-\[\d+(\.\d+)?%\])/);
  if (pctPad) errors.push(`uses percentage padding/margin "${pctPad[2]}": it is measured from the WIDTH, so in a short, wide slot it can take the whole height — use "inset-[x%]" on an absolute region, flex/grid gaps, or SVG viewBox coordinates instead`);
  const f = parsePrimitiveFloor(prim, code);
  if (f.error) errors.push("floor: " + f.error);
  return { errors, floor: f.floor };
}
