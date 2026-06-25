import { CompSpec, DefaultCompSpec, Placement } from "./spec";

// Strip markdown code fences from generated code
export function stripCodeFences(code: string): string {
  // Remove opening fence: ``` optionally followed by a language tag (tsx, json, ...)
  let stripped = code.replace(/^```[a-z]*\s*\n?/i, "");
  // Remove closing fence: ```
  stripped = stripped.replace(/\n?```\s*$/i, "");
  return stripped;
}

// Layer between spec and the routes, essentially just does the deterministic array caluculations instead of passing it to the LLM
// Seperates the spec field into explicit include and exclude lists
export function resolveComponentSpec(compSpec: CompSpec, defaultSpec: DefaultCompSpec[]): string {
  const def = defaultSpec.find((d) => d.name === compSpec.name); // Full spec for this box's chosen type
  if (!def) return '{}'; // Unreachable, for ts type safety

  // Indices of active customizations -> their names (features to implement)
  const include = compSpec.specArrIdx
    .map((i) => def.spec.specArr[i])
    .filter(Boolean);

  // Every customization NOT chosen -> deliberately excluded features
  const exclude = def.spec.specArr.filter((_, i) => !compSpec.specArrIdx.includes(i));

  return JSON.stringify({
    name: def.name,
    genInstructions: def.genInstructions,
    include,
    exclude,
  });
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