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
}

// One component's placement on the block grid (inclusive coords), returned by
// the /api/layout route. Mirrors the col/row fields of GeneratedBoxProps.
export type Placement = {name: string} & Omit<GeneratedBoxProps, "key" | "autoName">;

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
export const numGridBlocksWide = 30;

// Determines height of grid (in vh)
export const numVHTall = 250;

