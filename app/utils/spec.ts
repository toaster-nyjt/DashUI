// Tuple Type
export type XY = {
  x: number;
  y: number;
}

// To bypass ts type check
export const defaultXY : XY = {x: -1, y: -1};

// Props for Generated boxes
export type GeneratedBoxProps = {
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
  key: string;
  // Set by the dashboard generator: the box self-generates this component on
  // mount (the registry already holds its spec). Undefined for manual boxes.
  autoName?: string;
  // NESTING: a parent (group) box carries its children here. Children hold
  // coords LOCAL to this box (1..w / 1..h), placed in the parent's inner grid.
  // Absent on leaf boxes (which render a Preview from autoName instead).
  children?: GeneratedBoxProps[];
  // True for any box spawned INSIDE a parent (at any nesting depth). The one
  // top-level box in elementArr leaves this false — it alone gets drag + the
  // purple group outline.
  isChild?: boolean;
  // Targeting groundwork: a manually-created box starts empty and flips false
  // the first time it generates (see GeneratedBox isGenerating effect). Lets
  // SpatialGrid tell whether a selected box is an empty drop-target.
  isEmpty?: boolean;
  // Set by the dashboard generator on every box of a generated UI: the id of the
  // taskRequest that produced it, used as the key into SpatialGrid's styleSpec
  // registry so every component in this UI shares one coherent visual style.
  styleID?: number;
}

// One component's placement on the block grid (inclusive coords), returned by
// the /api/layout route. Mirrors the col/row fields of GeneratedBoxProps.
export type Placement = {name: string} & Omit<GeneratedBoxProps, "key" | "autoName" | "styleID">;

// Per-box: the chosen component type + which customizations are active
export type CompSpec = {
  name: string;
  specArrIdx: number[]; // indices into the matching DefaultCompSpec's specArr
}

// A component-type preset in the shared registry (defaultSpec)
export type DefaultCompSpec = {
  name: string;
  genInstructions: string; // general directions for the LLM for this type
  spec: {
    specArr: string[];          // all available customizations
    defaultSpecArrIdx: number[]; // which are on by default
  };
}

// Used in getCode to represent messages
export interface Message {
  id: string;
  // Assistant means message sent from chat bot
  role: 'user' | 'assistant';
  content: string;
}

// Determines block density in grid
export const numGridBlocksWide = 45;

// Determines height of grid (in vh)
export const numVHTall = 250;

