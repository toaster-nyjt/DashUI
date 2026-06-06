import { CompSpec, DefaultCompSpec, Placement } from "./spec";

// Strip markdown code fences from generated code
export function stripCodeFences(code: string): string {
  // Remove opening fence: ``` optionally followed by a language tag (tsx, json, ...)
  let stripped = code.replace(/^```[a-z]*\s*\n?/i, "");
  // Remove closing fence: ```
  stripped = stripped.replace(/\n?```\s*$/i, "");
  return stripped;
}

// Assembles the LLM instruction string from the current spec state of generated box and current default specs
export function buildInstructions(compSpec: CompSpec, defaultSpec: DefaultCompSpec[]): string {
  const def = defaultSpec.find((d) => d.name === compSpec.name); // Full spec found of compSpec's name in default spec
  if (!def) return '67'; // Unreachable, for ts type safety

  // Map the indexes of active customizations to the actual names of the customizations
  const active = compSpec.specArrIdx
    .map((i) => def.spec.specArr[i])
    .filter(Boolean);

  // Every customization the user did NOT choose, to be explicitly excluded.
  const excluded = def.spec.specArr.filter((_, i) => !compSpec.specArrIdx.includes(i));

  let out = `Create a ${def.name}. ${def.genInstructions}`; // General scaffolding
  // Tack on customization details
  if (active.length) out += ` Include these features: ${active.join('; ')}.`;
  if (excluded.length) out += ` Do NOT include the following features under any circumstances — they have been deliberately excluded and must not appear in any form: ${excluded.join('; ')}.`;

  return out;
}

// Validates a layout-route result: every block of the cols x rows window must be
// covered by exactly one placement (no overlaps, no gaps, in bounds). Returns the
// first violation found so it can be fed back to the LLM on retry. Coords are
// 1-indexed and inclusive, matching GeneratedBoxProps.
export function validateLayout(placements: Placement[], cols: number, rows: number): { ok: boolean; error?: string } {
  if (!Array.isArray(placements) || placements.length === 0) {
    return { ok: false, error: "no placements returned" };
  }

  // occ[r][c] = times block (r,c) is covered; sized +1 for 1-indexed access
  const occ: number[][] = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));

  for (const p of placements) {
    if (
      p.colStart < 1 || p.rowStart < 1 ||
      p.colEnd > cols || p.rowEnd > rows ||
      p.colStart > p.colEnd || p.rowStart > p.rowEnd
    ) {
      return { ok: false, error: `"${p.name}" is out of bounds or inverted: cols ${p.colStart}-${p.colEnd}, rows ${p.rowStart}-${p.rowEnd} (grid is ${cols} cols x ${rows} rows).` };
    }
    for (let r = p.rowStart; r <= p.rowEnd; r++) {
      for (let c = p.colStart; c <= p.colEnd; c++) {
        if (occ[r][c]) {
          return { ok: false, error: `Overlap at row ${r}, col ${c} (involving "${p.name}"). No block may belong to two components.` };
        }
        occ[r][c] = 1;
      }
    }
  }

  // Any uncovered block is a gap
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      if (!occ[r][c]) {
        return { ok: false, error: `Gap at row ${r}, col ${c} — every block in the ${cols}x${rows} grid must be covered exactly once.` };
      }
    }
  }

  return { ok: true };
}