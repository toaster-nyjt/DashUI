// The GENERATE route's system prompt for one leaf, in one function so the route and the
// offline harnesses build exactly the same text. budget=false is the inline layout (floors in
// the library block, box in rem at the end); budget=true puts the box, chrome heights and this
// leaf's floors together in a SIZE BUDGET block at the very end (sizeBudgetBlock).
import {
  GENERATE_QA_DIRECTIVE, GENERATE_STYLE_FALLBACK, buildGenerateSystemPrompt, buildComponentProtocol,
  needsHandBuiltRules, primitiveLibraryBlock, SIZENOTE_HANDBUILT_ONLY, SIZENOTE_PRIM_CONDENSE_PREFIX,
  sizeNotePrimCondense, sizeNoteRem, sizeBudgetBlock,
} from "@/app/api/SKILLS";
import { XY, LeafPrimitives, LeafFeatures, PrimitiveFloor } from "./spec";
import { parseChromeHeights } from "./helpers";

export function buildLeafSystem({ spec, boxSize, style, primitives, budget }: {
  spec: { features?: string[] | LeafFeatures };
  boxSize?: XY;
  style?: string;
  primitives?: LeafPrimitives;
  budget: boolean;
}): { system: string; hasLibrary: boolean; handBuilt: boolean } {
  // Primitive leaf = a library is present. handBuilt = it still builds some feature itself
  // (a plain feature list, or any feature mapped to null), which keeps the hand-built rules.
  const hasLibrary = !!primitives?.library.length;
  const handBuilt = needsHandBuiltRules(spec.features ?? [], hasLibrary);
  const withBudget = budget && hasLibrary && !!boxSize;

  // A box that belongs to a generated UI carries that UI's coherent style; use it
  // in place of the default style direction so all its components match. Anything
  // without a style (manual boxes, custom components, single standalone boxes)
  // gets the fallback.
  const styleBlock = style
    ? `\n\nVISUAL GUIDELINES — follow these guidelines so this component matches the rest of its UI:\n${style}`
    : GENERATE_STYLE_FALLBACK;

  // Tell the model the concrete dimensions it's designing for. Still responsive
  // (the box can be resized), but this anchors the initial layout to the real shape.
  const baseSizeNote = boxSize
    ? `\n\nThe box this component renders into is currently ${Math.round(boxSize.x)}px wide by ${Math.round(boxSize.y)}px tall
    (aspect ratio ${(boxSize.x / boxSize.y).toFixed(2)}). Drive ALL layout, sizing, and density decisions in relation to these dimensions
    — choose horizontal vs. vertical arrangement, how many items/columns fit, and text sizes based on this actual width and height.
    The component as a whole MUST fit the box — nothing spills past its edges and it NEVER scrolls the host page. Fill the full width AND the full height (lay the body out as a flex column whose main region is "flex-1").
    When there is more content than comfortably fits in ${Math.round(boxSize.y)}px of height, FIRST try to fit it by condensing to a still-legible size: tighten spacing/gaps, shrink text and cards, reduce per-item padding, or show fewer items — but never crush past legibility.
    Give this component a panel header/title bar or footer/status strip ONLY when its content genuinely calls for one AND there is vertical room for it without crowding the body — a short box or a purely-visual component should skip chrome rather than force it in and waste space. WHEN you do include a header or footer, keep the fixed height, padding, and type treatment from VISUAL GUIDELINES (regardless of this box's size) so it lines up with the siblings that also have chrome, and condense ONLY the content/body region — shrink the body, never the chrome.
    When a list or feed is naturally long, or condensing would push rows below a legible size, give that region its own internal scroll ("overflow-y-auto") with its scrollbar HIDDEN ("[scrollbar-width:none] [&::-webkit-scrollbar]:hidden") rather than crushing rows until text collides — an internal hidden-scrollbar scroll is a fine, normal choice here. Never render a visible scrollbar, never clip text mid-glyph at an edge, and keep every row's stacked lines from overlapping.
    Generate ALL PIECES, even non-traditional ones (ie DJ discs, scrubbable timelines, elastic node graphs) WITH THE ABOVE RULES IN MIND, AND CALCULATE THE SIZES OF PROMINENT SHAPES (Circles and ovals especially) CAREFULLY!!!`
    : "";

  // Primitive leaf: the condense sentence points at the PRIMITIVE FLOORS order instead, and
  // hand-built-only sentences drop when nothing is hand-built. The box in rem (the floors'
  // unit) goes after it (inline), or into the SIZE BUDGET (budget).
  const sizeNote = boxSize && hasLibrary
    ? baseSizeNote.split("\n")
        .filter((l) => handBuilt || !SIZENOTE_HANDBUILT_ONLY.some((p) => l.trim().startsWith(p)))
        .map((l) => (l.trim().startsWith(SIZENOTE_PRIM_CONDENSE_PREFIX) ? sizeNotePrimCondense(boxSize) : l))
        .join("\n") + (withBudget ? "" : sizeNoteRem(boxSize))
    : baseSizeNote;

  // SIZE BUDGET: this leaf's own types first (from its feature map), then the rest.
  let budgetBlock = "";
  if (withBudget) {
    const floors = primitives!.floors;
    const mine = new Set(Array.isArray(spec.features) ? [] : Object.values(spec.features ?? {}).flatMap((t) => t ?? []));
    const pick = (keep: boolean) => primitives!.library.map((t) => t.type)
      .filter((t) => floors[t] && mine.has(t) === keep).map((t) => [t, floors[t]] as [string, PrimitiveFloor]);
    budgetBlock = sizeBudgetBlock(boxSize!, pick(true), pick(false), parseChromeHeights(style));
  }

  // QA/max-perf preamble + main instructions + component-JSON protocol + primitive library
  // (if any) + per-UI (or fallback) style + per-box size context + size budget (if any)
  const system = GENERATE_QA_DIRECTIVE + "\n\n"
    + buildGenerateSystemPrompt({ primitives: hasLibrary, handBuilt, budget: withBudget })
    + buildComponentProtocol(hasLibrary, handBuilt)
    + (hasLibrary ? primitiveLibraryBlock(primitives!.library, primitives!.floors, withBudget) : "")
    + styleBlock + sizeNote + budgetBlock;

  return { system, hasLibrary, handBuilt };
}
