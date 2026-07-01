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
  // Set by the UI generator: the box self-generates this component on
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
  // Set by the UI generator on every box of a generated UI (group + leaves):
  // the id of the taskRequest that produced it. The single grouping key for a
  // generated UI, with three consumers: the styleSpec lookup (shared visual
  // style), the completion barrier (when have all this UI's leaves generated?),
  // and the runtime bus (relay messages only between leaves of the same UI).
  taskID?: number;
}

// One component's placement on the block grid (inclusive coords), returned by
// the /api/layout route. Mirrors the col/row fields of GeneratedBoxProps.
export type Placement = {name: string} & Omit<GeneratedBoxProps, "key" | "autoName" | "taskID">;

// Per-box: the chosen component type + which customizations are active
export type CompSpec = {
  name: string;
  specArrIdx: number[]; // indices into the matching DefaultCompSpec's specArr
}

// One functional link between two components of the SAME generated UI. `name`
// references a sibling component's DefaultCompSpec.name exactly (the join key used
// by layout for adjacency and, later, the path/wiring route). See Connectivity.
export type Connection = {
  name: string;        // exact name of the connected sibling component within this UI
  description: string; // what passes across the connection / what it does
}

// How one component is wired to the others in its UI. An edge "A affects B" is
// recorded on BOTH endpoints: as a TARGET on A (outgoing) and an EFFECTOR on B
// (incoming). Set by the planner only; intra-UI metadata, never on manual boxes.
export type Connectivity = {
  effectors: Connection[]; // INCOMING: sibling components that drive/affect THIS one
  targets: Connection[];   // OUTGOING: sibling components THIS one drives/affects
}

// A component-type preset in the shared registry (defaultSpec).
// `role` + `connectivity` are populated by the PLANNER only (they describe a
// component's place inside ONE generated UI). Preset/custom (manual) specs leave
// them undefined, so they drop out of resolveComponentSpec's JSON for manual boxes.
export type DefaultCompSpec = {
  name: string;
  genInstructions: string; // general directions for the LLM for this type
  role?: string;           // declarative role of this component within the larger UI
  connectivity?: Connectivity; // intra-UI functional links to sibling components
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

