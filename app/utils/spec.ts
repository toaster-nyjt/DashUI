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

// Per-box: the chosen component type + which features are active
export type ComponentInstance = {
  name: string;
  activeIdx: number[]; // indices into the matching ComponentDef's features
}

// One functional link between two components of the SAME generated UI. `name`
// references a sibling component's ComponentDef.name exactly (the join key used
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

// A component-type entry in the shared registry (componentRegistry).
// `role` + `connectivity` are populated by the PLANNER only (they describe a
// component's place inside ONE generated UI). Preset/custom (manual) defs leave
// them undefined, so they drop out of resolveComponent's JSON for manual boxes.
export type ComponentDef = {
  name: string;
  genInstructions: string; // general directions for the LLM for this type
  role?: string;           // declarative role of this component within the larger UI
  connectivity?: Connectivity; // intra-UI functional links to sibling components
  features: string[];         // the component's full, canonical feature list
  defaultActiveIdx: number[]; // which features are on by default
}

/* PRIMITIVE HOIST (see docs/PRIMITIVE_HOIST_PLAN) */

// One primitive type in the shared library. `props` is a plain signature:
// propName -> TypeScript type string; a trailing "?" on the name marks it optional.
export type PrimitiveType = {
  type: string;                    // PascalCase JSX identifier, e.g. "Knob"
  description: string;             // what it is / how input maps to value; mechanism only, no styling
  props: Record<string, string>;   // spanning prop contract, e.g. { value: "number", "steps?": "number[]" }
};

// featureName -> the distinct primitive type names that feature is built from
export type FeatureTypes = Record<string, string[]>;

// A leaf's resolved features: the hoist's types, [] for a structural feature, null for an
// active feature the hoist never mapped (toggled on later, user-added, or its type dropped).
export type LeafFeatures = Record<string, string[] | null>;

export type HoistResult = {
  library: PrimitiveType[];
  components: { name: string; features: FeatureTypes }[];
};

// One use of a primitive type: the component + feature built from it.
export type PrimitiveUse = { component: string; feature: string };

// A primitive's declared floor, parsed from its generated "<Type>_MIN" constant:
// "base" plus "<prop>:<value>" overrides, each [width, height] in rem.
export type PrimitiveFloor = Record<string, [number, number]>;

// Everything the primitive stage produced for one generated UI, stored per taskID beside
// its style. code = each type's generated source; floors = its parsed FLOOR.
export type PrimitiveSet = {
  hoist: HoistResult;
  code: Record<string, string>;
  floors: Record<string, PrimitiveFloor>;
};

// What the generate route needs from a PrimitiveSet: the types a leaf may use (the ones that
// generated) and their floors. The code itself goes to Preview, never to the model.
export type LeafPrimitives = {
  library: PrimitiveType[];
  floors: Record<string, PrimitiveFloor>;
};

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

