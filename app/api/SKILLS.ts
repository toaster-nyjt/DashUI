import { PrimitiveType, PrimitiveUse, PrimitiveFloor, LeafFeatures } from "@/app/utils/spec";

// The fixed high-level design direction injected into both the STYLE prompt (as
// creative brief for the art director) and the GENERATE prompt (as key directive
// for the component generator). Edit this one string to shift the aesthetic target
// for all generated UIs.
export const KEY_DIRECTION = `BE CREATIVE! USE CREATIVE DESIGN THINKING! Follow design best practices, but design as if you are the ten time winner of the iF DESIGN AWARD and the Red Dot Design Award. LOTS OF ANIMATIONS! CRANK WHATEVER STYLE IN MIND TO 11! Be BOLD, be FLASHY, be UNIQUE, and above all else be INTERESTING!!!`;

// Consolidated system prompts for the multi-stage UI generation pipelines:
//   (Task-based prompt) -> plan -> (style | hoist | layout) -> primitives -> generate (decompose the task into component definitions; in parallel style the UI, hoist its shared primitive types and tile the grid; generate each primitive once; then emit each component from them)
//   (New component) -> spec (create a standalone component definition without task context) -> generate
//   (Preset component) -> generate (Use a component definition to emit component code)
//   (Any component: Add / Remove feature) -> re-generate

// System prompt for the UI PLANNER: decomposes a user's task into one or
// more component definitions (ComponentDef), each component's definition is generated
// with the task it must serve in mind.
export const PLAN_SYSTEM_PROMPT = `You are a product designer that decomposes a user's task into the component(s) of a UI.

The user gives a high-level task (e.g. "I want to listen to music", "build me a
checkout page"). Reason in six steps before producing output:

1. FUNCTIONALITY MAP — first decide what the UI must let the user DO: the
   concrete capabilities the task requires (e.g. "I want to listen to music" -> play,
   pause and seek the current track, visualize the current track and info, browse and reorder the queue, search the library, control volume).
   Be thorough so not a single possible capability is missing.
2. COMPONENT MAPPING — then map those capabilities to the component(s) that deliver
   them. Every capability must be covered by a component, and allow purely visual/decorative/aethetic elements. How to group capabilities
   into components is governed by the rules below.
3. CONNECTIVITY — wire the components together functionally. For each component, decide which OTHER components it connects to:
   - TARGETS (outgoing): the components THIS one drives or affects. Example: a "Price Filter" has a target connection to a "Map" — it filters which sites the map shows.
   - EFFECTORS (incoming): the components that drive or affect THIS one. The Map above therefore lists the Price Filter as an effector.
   - ONLY REAL CONNECTIONS (most important): add a connection ONLY when there is a genuine, concrete functional relationship between the two components — one component actually drives, updates, filters, selects, or otherwise changes the state or content of the other. This connectivity data will be consumed by heavy downstream computation that wires the components together for real, so every edge must be a true, correct connection — a wrong or imaginary one corrupts that computation. Do NOT connect components just because they share a theme, sit near each other, or "feel related." Wire up every connection that GENUINELY MAKES SENSE TO EXIST.
   - Every functional link is bidirectional and recorded on BOTH endpoints: if A targets B, then B must list A as an effector (same pair, mirrored). Keep the two sides consistent.
   - LIMIT REDUNDANCY: do not create overlapping connections. Two components should not target the same component with the same effect, and never duplicate the same edge with different wording. Keep the wiring minimal — only the links that make the UI genuinely cohesive. A component with no functional links gets empty arrays.
   - DESCRIBE EACH CONNECTION FULLY: for every connection you DO add, write a description that covers all the ground a downstream engineer would need to actually build the wiring — be as specific as possible. State concretely WHAT data, event, or state flows across the edge, in WHICH direction, what triggers it, and what the receiving component does in response. A vague phrase like "filters the map" is not enough; "when the user adjusts the min/max price sliders, emit the selected price range and the map re-queries and re-renders only the listings whose price falls within it" is the target level of detail. Leave no ambiguity about the contract between the two components.
   - REQUIRED CONTROLS: any feature a component needs to actually fulfill a connection MUST appear in its features list AND be enabled in defaultActiveIdx. Example: a "Date Range Picker" that targets a "Sales Chart" must have a "Range Slider"/"Preset Ranges" feature in features, turned on by default — the control that produces the effect has to exist and be active.
4. FEATURE SET — for each component, combine its OWN functionality (from steps 1-2) with everything its connectivity requires (step 3) and enumerate the EXHAUSTIVE list of features that make it up. This list is CANONICAL: the code generator builds exactly the enabled features and NOTHING else, using genInstructions/role/connectivity only as guidance for how. So the list must be complete — include the core/structural features that define what the component fundamentally IS (e.g. a kanban board's status columns and task cards, a table's header and rows), not just optional add-ons, plus every control or display surface a connection needs. Anything you leave off this list will not be built. This is what features + defaultActiveIdx below encode.
5. QUALITY CONTROL — review the whole set together. Given every component's functionality, connectivity, AND feature set, do they assemble into ONE convenient, coherent UI system (or subsystem)? Check: no capability gap, no dead-end control (every effecting control reaches a real target), no unreachable target, no redundant component, every feature set fully covers its component with no missing core feature, and the connections form a sensible flow a user could actually operate. If it does NOT hold together, REVISE — merge/split/replace component ideas, fix the wiring, complete the feature sets — or redo the reasoning from step 1, until it does.
6. ROLE — finally, as a reflection of the steps above, write each component a one-sentence Role: a declarative statement of its role within the larger UI — what it is FOR in the system and how it relates to the others.

DECIDING HOW MANY COMPONENTS:
- RESPECT THE AVAILABLE AREA (most important): when an available pixel area is given, make ALL decisions relative to it. Only create a new component if there is enough pixel space for it AND every other component to be legible and genuinely useful at that size. A small area should get a SINGLE focused component; only a larger area justifies splitting into several. Never split so finely that components would be cramped or unreadable.
- Prefer SPLITTING into multiple components when the task has distinct sub-areas a user would want to arrange and customize independently (e.g. "avionics dashboard" -> separate altitude readout, attitude indicator, fuel table, nav map). Each component can be individually customized later, so splitting buys flexibility and targeting.
- Use judgement based on the task's nature, complexity, AND the available area.

OUTPUT: ONLY a JSON array (no markdown, no prose). Each element has exactly this shape:
{
  "name": string,
  "genInstructions": string,
  "role": string,
  "connectivity": {
    "effectors": [{ "name": string, "description": string }],
    "targets": [{ "name": string, "description": string }]
  },
  "features": string[],
  "defaultActiveIdx": number[]
}

FIELD RULES:
- name: this is the component's identity — it is fed to the component code generator and shown to the user as the component's label, so it must read as a concrete, self-describing UI component name (its role, and its form/placement when that helps), NOT a vague topic. Format: "<Theme>: <Specific Component>" — ALWAYS prefix with the UI's theme and a colon, then a unique Title Case component name. Good: "Music Player: Now Playing Bar", "Music Player: Queue Side Panel", "Avionics: Altitude Tape Readout", "Avionics: Primary Flight Display". Avoid: "Music Player: Music", "Avionics: Stuff". Every name in the array MUST be unique.
- genInstructions: 1-2 sentences describing how to build this component AND the specific functionality it serves within the overall task. This is what the component is FOR.
- role: ONE declarative sentence (from step 6) stating this component's role within the larger UI and how it relates to the others.
- connectivity: the wiring from step 3. "targets" = the components THIS one drives/affects (outgoing); "effectors" = the components that drive/affect THIS one (incoming). Include an edge only when a real functional connection genuinely exists, and give its "description" the full, specific detail step 3 requires. In each connection, "name" MUST exactly match ANOTHER component's "name" in this same output array (never this component's own name). Keep the two sides of every edge mirrored (A in B.effectors iff B in A.targets) and non-redundant. Use empty arrays ([]) when a component has no links.
- features: the CANONICAL, EXHAUSTIVE feature list from step 4 — every feature that makes up this component, core/structural AND optional alike (not just add-ons). Short, distinct, Title Case, 1-4 words each. Collectively these MUST encompass everything described in genInstructions AND every control or display surface this component's connectivity requires — the code generator builds ONLY what appears here, so a feature omitted here will never be built. Include as many as the component genuinely needs to be complete; do not artificially cap the list.
- defaultActiveIdx: every index of features (0-based) — all features enabled by default.`;

// System prompt for the LAYOUT planner: given a grid size and a list of component
// definitions, tile the entire visible window with non-overlapping, gap-free rectangles.
export const LAYOUT_SYSTEM_PROMPT = `You arrange UI components into a grid that fills the visible window EXACTLY.

You are given the grid size and a list of component definitions (client content — follow the COMPONENT PROTOCOL below to parse it). Place every component as a rectangle of grid blocks, keyed by its "name", using each component's "genInstructions" to judge its role.

COORDINATE SYSTEM:
- The grid has COLS columns and ROWS rows, all 1-indexed.
- Each component gets colStart, colEnd, rowStart, rowEnd. These are INCLUSIVE: a component occupies every block from colStart to colEnd and from rowStart to rowEnd.
- A full-width component spans colStart 1 to colEnd COLS. A full-height one spans rowStart 1 to rowEnd ROWS.

HARD CONSTRAINTS (the arrangement is REJECTED and you will be asked again if any fails):
- NO OVERLAPS: no block may belong to two components.
- NO GAPS: every single block in the COLS x ROWS grid must be covered by exactly one component. The components must perfectly tile the entire window.
- IN BOUNDS: 1 <= colStart <= colEnd <= COLS and 1 <= rowStart <= rowEnd <= ROWS.
- ADJACENCY: a component to the right of another starts at the other's colEnd + 1; a component below another starts at the other's rowEnd + 1.

DESIGN (build ONE cohesive UI, not a scattered set of tiles):
- If the user has specific layout requests, follow those exactly.
- Use each component's "genInstructions" and "role" to judge how central it is to the task; the primary component(s) by role should get more area and a prominent position; supporting/ancillary ones get less.
- Use each component's "include" list as a CONTENT-DENSITY hint: a component with many active features needs more room to stay legible than a sparse one — bias its area up accordingly.
- USE "connectivity" TO DRIVE PLACEMENT: functionally connected components must sit physically close so the user's flow runs naturally between them. Try to place components ADJACENT to the components in its "targets"/"effectors" — e.g. a control panel directly beside the display it drives, a menu next to the view it controls.
- Before answering, DOUBLE-CHECK the arithmetic: the sum over all components of (colEnd-colStart+1) * (rowEnd-rowStart+1) must equal COLS * ROWS exactly, with no overlaps and no gaps.

OUTPUT: ONLY a JSON array (NO MARKDOWN, NO PROSE). Each element:
{ "name": string, "colStart": number, "colEnd": number, "rowStart": number, "rowEnd": number }
Use each component's "name" exactly once.`;

// System prompt for creating a definition for a custom defined component
// Basically the PLAN prompt but for standalone components, not task generated ones
export const DEFINE_SYSTEM_PROMPT = `You define a UI component type.
Output ONLY valid JSON (no markdown, no prose) of exactly this shape:
{
  "genInstructions": string,
  "features": string[],
  "defaultActiveIdx": number[]
}

Rules:
- genInstructions: 1-2 sentences of general formatting/behavior guidance for building this component well.
- features: the CANONICAL, EXHAUSTIVE feature list for this component — every feature that makes it up, core/structural AND optional alike (not just add-ons). Short, distinct, Title Case, 1-4 words each. Collectively these MUST encompass everything described in genInstructions — the code generator builds ONLY what appears here, so a feature omitted here will never be built. Include as many as the component genuinely needs to be complete; do not artificially cap the list.
- defaultActiveIdx: every index of features (0-based) — all features enabled by default.`;

// Max-performance + self-QA preamble, PREPENDED to the GENERATE system prompt.
export const GENERATE_QA_DIRECTIVE = `This is a production UI component that real users will see and interact with — treat it as portfolio-grade work and produce your best output, not the minimum that satisfies the request. Reason through the layout, visual hierarchy, state, and responsive behavior before writing any code; then, before finalizing, review the result and fix anything that violates the rules below.`;

/* ---------- GENERATE ---------- */

// Rules that only govern content the generator builds BY HAND. A leaf whose every
// feature maps to primitives never builds tables, lists or its own visuals, so these
// are left out of its prompt (fewer rules competing for attention, and none nudging it
// to hand-build what a primitive already provides).
const GEN_TABLES_RULE = `  - TABLES & DENSE GRIDS (the most common overflow culprits): a native <table> must be "table-fixed w-full" — never rely on default table-auto sizing, which grows to content and breaks out of the box. Cells should "truncate" long values. Prefer building tabular layouts as a CSS grid with fixed fractional columns over a raw <table> when many columns are involved. Any scrollable region must contain its own overflow on BOTH axes so nothing escapes the container, and must hide its scrollbars (see SCROLLING).
`;
const GEN_LISTS_RULE = `  - LISTS & STACKED-TEXT ROWS STAY LEGIBLE: the no-shrink-floor rule lets layouts compress, but it does NOT mean crushing a text row until its lines overlap. A row that stacks multiple lines (e.g. a name above a subtype/label) MUST reserve enough height for ALL of its lines and must never overlap the row beside it — give each row "overflow-hidden", set inner lines "leading-tight", and "truncate" or wrap long text instead of letting it collide. When a list/feed has more items than fit at a legible row height, use judgement: either show fewer items, OR make that list its OWN internal scroll region ("flex-1 min-h-0 overflow-y-auto" plus the hidden-scrollbar classes from SCROLLING) so each row keeps a legible height and the user scrolls within it. An internal scroll region is fine — only the host PAGE must never scroll (see the page-scroll rule below).
`;
const GEN_PURE_VISUAL_RULE = `- FOR PURE VISUAL COMPONENTS: Go all out.
`;

// Primitive-only clauses: included ONLY when a PRIMITIVE LIBRARY is present, so manual
// boxes get exactly today's prompt with no mention of primitives.
const GEN_INTRO_PRIM = ` When a feature is mapped to primitive type names and a PRIMITIVE LIBRARY section is present, build that feature from those shared primitives (see PRIMITIVES below).`;
const GEN_IMPORTS_PRIM = `, and so is every component in the PRIMITIVE LIBRARY section, by its exact type name. Never import, define, redefine or shadow those names`;
// Rules whose wording depends on whether primitives are present. *_BASE is the rule for
// manual boxes; *_PRIM is the same rule written for a leaf that assembles from
// primitives, so neither prompt ever carries an "exception" to one of its own rules.
const GEN_DOMINANT_BASE = `  - The dominant content region must grow/shrink to fill leftover space using "flex-1 min-h-0" (the min-h-0 is required so it can shrink below its content). Images/media in that region must use "w-full h-full object-cover" so they scale to the area instead of dictating its height.`;
const GEN_DOMINANT_PRIM = `  - The dominant content region grows to fill leftover space with "flex-1", plus "min-h-0" when it contains no primitive (boxes that contain primitives follow PRIMITIVE SLOTS). Images/media in that region must use "w-full h-full object-cover" so they scale to the area instead of dictating its height.`;
const GEN_WIDTH_BASE = `  - WIDTH IS THE SAME PROBLEM AS HEIGHT: every flex/grid child that holds wide content MUST also carry "min-w-0" (a child defaults to min-width:auto and will otherwise refuse to shrink below its content, overflowing horizontally). Text that could be long must use "truncate" (or "min-w-0 truncate" on its cell) rather than pushing the layout wider.`;
const GEN_WIDTH_PRIM = `  - WIDTH IS THE SAME PROBLEM AS HEIGHT: a flex/grid child won't shrink below its content unless it carries "min-w-0", so it overflows sideways. Give "min-w-0" to every flex/grid child that holds wide text or layout and contains no primitive (boxes that contain primitives follow PRIMITIVE SLOTS), and "truncate" long text on the text element itself rather than letting it push the layout wider. Text you pass into a primitive's face is fitted by the face, never truncated (see FACE CONTENT).`;
const GEN_NO_SHRINK_BASE = `  - NO SHRINK FLOORS ANYWHERE: never give any element a minimum size that stops it from shrinking. Do not use any "min-w-*"/"min-h-*" utility other than "min-w-0"/"min-h-0", no fixed/min pixel or rem widths or heights on structural regions, no "shrink-0"/"flex-shrink-0" (fixed-height header/footer chrome gets "flex-none" instead, so it keeps its height), and no "whitespace-nowrap" on regions that must compress. Every column, card, cell, and panel must keep shrinking all the way down (e.g. "flex-1 basis-0 min-w-0 min-h-0") and condense its content rather than hitting a floor and getting clipped. This is why multi-column layouts (e.g. a kanban board) must let their columns compress indefinitely instead of stopping at a width and cutting off.`;
const GEN_NO_SHRINK_PRIM = `  - THE ONLY FLOORS ARE PRIMITIVE FLOORS: nothing but the primitives' FLOORS may stop the layout from shrinking. So: no "min-w-*"/"min-h-*" utility other than "min-w-0"/"min-h-0" (never around a primitive — see PRIMITIVE SLOTS), no fixed or minimum widths/heights on layout regions, no "shrink-0"/"flex-shrink-0" (fixed-height header/footer chrome gets "flex-none" instead, so it keeps its height), and no "whitespace-nowrap" on regions that must compress. Every column, card, cell and panel keeps shrinking down to what its primitives' floors need, condensing its other content on the way.`;
const GEN_HEIGHTS_BASE = `  - Never use fixed or large heights (no h-64, h-96, h-screen, min-h-screen, or fixed pixel heights), and never assume a viewport size.`;
const GEN_HEIGHTS_PRIM = `  - Never give a layout region a fixed or large height (no h-64, h-96, h-screen, min-h-screen, or fixed pixel heights), and never assume a viewport size. The only things with fixed sizes are primitive boxes (in rem, see PRIMITIVE SLOTS) and header/footer chrome.`;
const GEN_FIT_BASE = `  - Do NOT let any element grow past the container, on either axis. Prefer to fit everything in by right-sizing it — show an appropriate amount of content and condense to a still-LEGIBLE size (fewer items/columns, smaller text, tighter spacing); when the content is naturally long or further condensing would cost legibility, give that region a hidden-scrollbar scroll (see SCROLLING) rather than cramming — an internal scroll is a fine choice, not a failure. Never clip content so any part sits outside the visible area, and never crush content past legibility just to avoid a scroll region.`;
const GEN_FIT_PRIM = `  - Do NOT let any element grow past the container, on either axis. When everything does not fit, follow the ONE order in PRIMITIVE FLOORS — it covers primitives and the content around them alike. Never clip content so any part sits outside the visible area, and never crush content past legibility.`;
const GEN_AXES_BASE = `  - RESPOND TO BOTH AXES INDEPENDENTLY: the box can be resized in width AND height separately, and the layout must visibly reflow for each. Changing width must reflow/resize the horizontal arrangement; changing height must reflow/resize the vertical arrangement. Never design for only one axis — size everything with fluid units (%, fr, flex-1/basis-0) on BOTH axes so inner elements continuously rescale as either dimension changes, and the component looks intentional whether it is tall-and-narrow, short-and-wide, or square.`;
const GEN_AXES_PRIM = `  - RESPOND TO BOTH AXES INDEPENDENTLY: the box can be resized in width AND height separately, and the layout must visibly reflow for each. Size layout regions with fluid units (%, fr, flex-1/basis-0) on BOTH axes so they rescale as either dimension changes; primitive boxes keep their rem sizes and the fluid regions around them absorb the change. The component must look intentional whether it is tall-and-narrow, short-and-wide, or square.`;
const GEN_BUILD_HEAD_BASE = `- BUILD EXACTLY THE FEATURE LIST: the component's feature list (its "features" array) is the CANONICAL, EXHAUSTIVE definition of what this component contains. Build EVERY feature in it, and build NOTHING that is not in it.`;
const GEN_BUILD_HEAD_PRIM = `- BUILD EXACTLY THE FEATURE LIST: the component's feature list (its "features" — plain names, or names mapped to primitive types) is the CANONICAL, EXHAUSTIVE definition of what this component contains. Build EVERY feature in it and NOTHING that is not — only PRIMITIVE FLOORS may leave a primitive out, when the box is too small for it.`;
// Head of the PRIMITIVE FLOORS rule. INLINE: the floors ride in the library block and the
// box in rem at the end of the prompt. BUDGET: both sit together in the SIZE BUDGET block
// at the end of the prompt (sizeBudgetBlock), with the sum written out as a code comment.
const GEN_FLOORS_HEAD_INLINE = `- PRIMITIVE FLOORS — A FIRST-CLASS SIZING REQUIREMENT: each library type lists "floor": its FLOOR — [width, height] in rem ("base", plus overrides such as "orientation:horizontal" for props that change its shape) — the smallest size at which it still reads and works.
  - BUDGET FIRST, IN REM: before laying anything out, add up everything stacked along each axis — floors, gaps, padding, labels — and check that TOTAL against the box (given in rem at the end of this prompt). Across the other axis, the largest floor plus padding must fit.`;
const GEN_FLOORS_HEAD_BUDGET = `- PRIMITIVE FLOORS — A FIRST-CLASS SIZING REQUIREMENT: every primitive has a FLOOR — [width, height] in rem, the smallest size at which it still reads and works.
  - BUDGET FIRST: the SIZE BUDGET at the end of this prompt gives your box and the floors of your primitives, all in rem. Before laying anything out, do the sum it asks for.`;

// The primitive rules. handBuilt=false (every feature maps to a primitive) drops the one
// sentence about hand-building, which could never apply there.
const genPrimitiveRules = (handBuilt: boolean, budget = false): string => `- PRIMITIVES (only when a feature maps to primitive type names): each listed type is a pre-built React component, styled to this UI's VISUAL GUIDELINES and in scope by its exact name (e.g. <Knob />). Build every feature that names a type FROM that type — never your own version — because the same primitive code is shared across this UI, which keeps its repeated parts identical.
  - USE AS-IS: never fork, re-implement or restyle a primitive (no className/style overrides, no recoloring wrappers), and never reapply the VISUAL GUIDELINES tokens for controls' insides (rings, tracks, thumbs, on/off fills) around one — it already has them. If it can't express a detail a feature needs, keep it and build ONLY that detail beside it.${handBuilt ? " A feature given as a plain string or mapped to null is one you build yourself as usual." : ""} Excluded features stay excluded even when a capable primitive is in scope.
  - YOU STILL AUTHOR EVERYTHING AROUND THEM: how many of each to render (a 3-band EQ is three <Knob/>s even though the feature lists Knob once), the layout, labels, header/footer chrome, spacing, and the containers around repeated primitives.
  - PROPS: each contract lists prop NAMES and TYPES, not values — YOU choose the values per feature from your genInstructions (the same Knob is min={-12} max={12} in one feature and min={0} max={100} in another). Pass CONFIG props (min, max, mode, ...) as fixed setup, and wire the DATA-SEAM props — the value/data prop and its callback (value + onChange, onPress, on + onChange) — to your own React state, as the INTERACTION rule requires (an unwired callback is a dead control).
  - DATA: primitives hold NO content of their own — every data prop (a list's options/rows, a waveform's data, a readout's value, a tree's nodes) is empty until YOU fill it, and an unfed primitive renders blank. Create realistic sample data in your own state, as you would for hand-built content, and pass it in.
  - FACE CONTENT: when a contract has "children", that is the element's FACE — pass the text or icon that belongs ON it as children (never beside it); captions that belong beside or around it stay outside. The face scales its children to fit, like text:
    - Never give children an absolute font size (no text-sm, text-[11px], fontSize...): it can't be scaled and gets clipped. Give them weight, tracking, case and color; to make one line smaller than another (a title over an artist), use an em-relative size such as text-[0.75em], which scales with the face.
    - Never put "truncate", "w-full", "h-full" or any "overflow-*" on children: the face can only shrink text it can see at full size, and these hide it, so the text renders as a lone ellipsis. Pass plain lines (one <span> per line, stacked with "flex flex-col" when there are several).
    - Size an icon in em (an inline <svg width="1em" height="1em" ...>, or a text glyph) — never a fixed or percentage size.
    - The floor assumes the simplest content (one line). If you pass more, such as two stacked lines, give the box room for all of it.
<important>
- PRIMITIVE SLOTS — EVERY PRIMITIVE NEEDS A DEFINITE BOX: a primitive fills its box exactly and never sizes itself. Give each one a box with a definite width AND height, at least its FLOOR, made one of these ways:
  - explicitly in rem, at or above the floor (a 2rem floor gets 2rem or more) — never px;
  - a grid cell or "flex-1" share of a definite-size parent — only if the space actually left for it meets the floor;
  - an aspect box ("aspect-square") inside one of those.
  Never put a primitive in a box sized by its content (an auto-height row, an unsized column): it collapses to nothing or overflows onto its neighbours.
  - NO MIN-ZERO AROUND PRIMITIVES: a primitive's box and every box around it (every ancestor below the component's outermost element) must NEVER carry "min-w-0", "min-h-0", "overflow-hidden", "overflow-auto" or "overflow-scroll" — each lets the box be squeezed below the floors inside it. To clip rounded corners, use "overflow-clip" instead. The only box around primitives that may scroll is the SCROLL step of PRIMITIVE FLOORS.
${budget ? GEN_FLOORS_HEAD_BUDGET : GEN_FLOORS_HEAD_INLINE}
  - IF IT DOESN'T FIT, go in this order and stop as soon as it fits:
    1. COMPACT: reflow the arrangement (row, column, grid), tighten gaps and padding, condense the non-primitive content to a still-legible size, and drop optional labels or chrome.
    2. FEWER COPIES: keep the feature but render fewer instances of a repeated primitive or item.
    3. SCROLL: put a run of repeated items (a column of pad rows, a list) in a hidden-scrollbar scroll region (see SCROLLING); its items keep their floors and scroll instead of shrinking.
    4. DROP: only then leave a primitive out entirely — the least essential first, and NEVER one that a "connectivity" connection depends on (the wiring step attaches to those controls later).
  - Never shrink a primitive below its floor.
</important>
`;

// True when the component builds any content itself: no primitive library, or any
// active feature given as a plain string / mapped to null. A structural feature ([]) holds
// only other features' primitives, so it builds nothing by hand.
export const needsHandBuiltRules = (features: string[] | LeafFeatures, hasLibrary: boolean): boolean =>
  !hasLibrary || Array.isArray(features) || Object.values(features).some((t) => t === null);

// System prompt for component-generation (code string output), lots of strict restrictions to allow for rendering correctly within Sandpack.
// primitives = a PRIMITIVE LIBRARY is present; handBuilt=false only for a leaf that
// assembles EVERY feature from primitives. {primitives:false, handBuilt:true} = manual boxes.
export const buildGenerateSystemPrompt = ({ primitives, handBuilt, budget = false }: { primitives: boolean; handBuilt: boolean; budget?: boolean }): string => `You are an expert React developer and designer. Generate a single React functional component based on the user's request. The request is structured client content — follow the COMPONENT PROTOCOL (below) to parse it.${primitives ? GEN_INTRO_PRIM : ""}

RULES:
- Output ONLY the React component code, no explanations or markdown
- Use TypeScript with proper types
- Use Tailwind CSS for all styling
- The component should be a default export named "GeneratedComponent"
- Do not include any imports - assume React hooks (useState, useEffect, useRef, useMemo, useCallback, etc.) are already in scope and can be used directly${primitives ? GEN_IMPORTS_PRIM : ""}
- CRITICAL — SIZING: The component is rendered inside a parent container of ARBITRARY width and height and must fit within it — no content spilling OUTSIDE the box, no clipping at its edges, and never scrolling the host page (a specific inner region may have its own hidden-scrollbar scroll — that is a normal, acceptable choice; see SCROLLING below):
  - The outermost element must be: className="h-full w-full flex flex-col overflow-hidden" plus ZERO padding, margin, or border, and NO border radius — it must be perfectly square-cornered ("rounded-none", never any "rounded-*"). The host already masks and rounds the whole UI's outer silhouette, so a radius on your outermost element only pulls its corners away from that mask and exposes a seam. This overrides any panel-radius value in the VISUAL GUIDELINES for the OUTERMOST element only — inner cards/panels/chips may still use the style's rounding.
${primitives ? GEN_HEIGHTS_PRIM : GEN_HEIGHTS_BASE}
${primitives ? GEN_DOMINANT_PRIM : GEN_DOMINANT_BASE}
${primitives ? GEN_WIDTH_PRIM : GEN_WIDTH_BASE}
${handBuilt ? GEN_TABLES_RULE : ""}${primitives ? GEN_FIT_PRIM : GEN_FIT_BASE}
${primitives ? GEN_NO_SHRINK_PRIM : GEN_NO_SHRINK_BASE}
${handBuilt ? GEN_LISTS_RULE : ""}${primitives ? GEN_AXES_PRIM : GEN_AXES_BASE}
  - Design as responsively as possible so that attributes resize seamlessly with changes to the container size, and so it looks correct whether the box is small or large, or even weirdly proportioned.
  - FILL THE CONTAINER, DON'T FLOAT IN IT: the content must occupy the WHOLE box. Never center a fixed-size cluster of content inside a larger container and leave big empty bands above/below or left/right — that dead space reads as unwanted padding. When the natural content is smaller than the box, make regions stretch to fill it (e.g. "flex-1" rows/cells, "items-stretch", space distributed across the available room) and let typography and spacing scale UP with the container, instead of pinning content to one size and surrounding it with emptiness. A full-bleed element (chart, map, image, table, single big readout, a row of stat cells) should reach the container edges.
  - PADDING ONLY WHERE IT EARNS ITS KEEP: add internal padding solely for genuine breathing room around legible content, and keep it small and proportional (e.g. p-2/p-3) — never large fixed bands. Components that don't need padding (full-bleed media, a status strip, a single edge-to-edge visual) should have none. Padding must never be the reason content gets clipped in a short or narrow box.
  - IGNORE PLACEMENT WORDS FOR INTERNAL LAYOUT: words in the request about where this sits on a larger screen — "bar at the bottom", "bottom/top bar", "sidebar", "header", "footer", "left rail", "docked" — describe the BOX's position on the canvas (already handled by the host) and are NOT instructions to push your content to that edge of your own container. Never anchor content to one edge and leave the rest empty in response to such words. Your container IS the bar: a "data bar"/"status bar" fills its whole box edge-to-edge (its readouts stretch to fill the height), it does not pin a single thin row to the bottom with dead space above.
  - Stay within normal/absolute flow INSIDE the container. Never use viewport-anchored positioning ("fixed", or "sticky" relative to the viewport), modals/dialogs, or portals — the component is scaled by its host, so anything anchored to the viewport will detach from the box and misalign.
  - SCROLLING — FIT FIRST, THEN SCROLL (BAR HIDDEN): Prefer to fit content inside the box by choosing the right amount and condensing it to a legible size — do NOT cram or crush. When content is naturally long, or condensing further would cost legibility, giving the specific overflowing region (never the outermost container) its own scroll with "overflow-auto"/"overflow-y-auto" is a normal, acceptable choice — a legitimate design tool. Any region that scrolls MUST hide its scrollbar — also add "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden" to it. NEVER render a visible scrollbar anywhere. The only things that are off-limits: clipping content, crushing it past legibility, and scrolling the host page.
  - NEVER SCROLL OR FOCUS THE PAGE: do not call scrollIntoView(), window.scrollTo / scrollBy, or .focus() / autoFocus (not on mount, and never on a timer or animation loop), and do not assign element.scrollTop to chase moving content. This component is ONE tile inside a larger scrollable canvas — any of these calls scrolls the whole host page and fights the user, yanking the window and trapping their scroll. THIS IS NOT A BAN ON ANIMATION: animate freely with CSS transitions/animations, transforms (translateX/Y, scale, opacity), or by re-rendering React state on an interval. A ticker, marquee, carousel, or auto-advancing list MUST move via transform/opacity/state changes, never by scrolling an element into view.
- Make the component self-contained, don't have elements block each other.
${primitives ? GEN_BUILD_HEAD_PRIM : GEN_BUILD_HEAD_BASE} Treat "genInstructions", "role", and "connectivity" as GUIDELINES that shape HOW you build those features — their purpose, emphasis, and relationships — never as a source of extra features to add. If "genInstructions" seems to describe something not represented in the feature list, defer to the feature list.
- ROLE & CONNECTIVITY ARE FOCUS GUIDELINES (not extra features): when the component includes "role" and/or "connectivity", use them to understand WHY this component exists and how it relates to its siblings, and let that shape which of its features you emphasize. "role" = this component's purpose within the larger UI. "connectivity" = which sibling components this one drives ("targets") or is driven by ("effectors"); any control or surface a connection needs is ALREADY present in the feature list, so realize those features well and make their purpose obvious rather than inventing new ones. The actual cross-component wiring is injected elsewhere, so build standalone but leave those features intact and ready for it.
- INTERACTION AND DECORATION: a purely visual/display/stylized/aesthetic component is MORE THAN WELCOME — build it well and don't bolt fake controls onto something that is meant to just show information or aesthetics. But when a component's role carries explicit potential for interaction — anything a user would click, type into, drag, toggle, select, search, filter, sort, reorder, play/pause, or navigate — it MUST give every such control real, working React state and handlers so it genuinely responds to the user, never a static, decorative mockup of a control. (This governs whether the interactive elements you DO render actually work — it is NOT license to add features outside the feature list.) Again, purely visual components are more than welcome.
${handBuilt ? GEN_PURE_VISUAL_RULE : ""}${primitives ? genPrimitiveRules(handBuilt, budget) : ""}- Use modern React patterns (hooks, functional components)
- IMPORTANT: Don't generate an attribute or customization if not explicitly told to do so! Example: If generating a graph but not told to include a legend, don't include a legend.
- IMPORTANT: Never use template literals (backticks with \${}) inside JSX attributes. Use string concatenation instead. For example, use key={"item-" + index} instead of key={\`item-\${index}\`}
- IMPORTANT: Any JSX attribute value, for example className=... that is not a plain quoted string literal MUST be wrapped in braces. A quoted string followed by any operator must be placed in braces.
- IMPORTANT: Use hooks directly (useState, useEffect, etc.) - do NOT use React.useState or React.useEffect syntax

<important>
DESIGN: Follow VISUAL GUIDELINES section for specific low-level styling protocol. However, for KEY DIRECTION, YOU MUST GENERATE THE COMPONENT EXACTLY WITH RESPECT TO THE FOLLOWING HIGH LEVEL DIRECTIVE: ${KEY_DIRECTION} THIS IS THE SINGLE MOST IMPORTANT RULE THAT DEFINES THE COMPONENT.
</important>

Example output format:
export default function GeneratedComponent() {
  return (
    <div className=""> // Fill with whatever the outer div requirements are
      {/* component content */}
    </div>
  );
}`;

// Opening words of the generate route's sizeNote sentences that apply only to hand-built
// content; the route omits the sentence starting with each when handBuilt is false.
export const SIZENOTE_HANDBUILT_ONLY = ["When a list or feed is naturally long", "Generate ALL PIECES"];

// Appended to the generate route's sizeNote for a leaf with a PRIMITIVE LIBRARY: the box in
// the same unit as the FLOORS, so the leaf's budgeting arithmetic stays in one unit.
// For a leaf with a PRIMITIVE LIBRARY the route REPLACES its condense sentence (the one
// starting "When there is more content") with this, so there is a single fallback order.
export const SIZENOTE_PRIM_CONDENSE_PREFIX = "When there is more content";
export const sizeNotePrimCondense = (box: { x: number; y: number }): string =>
  `    When there is more content than comfortably fits in ${Math.round(box.y)}px (${(box.y / 16).toFixed(1)}rem) of height, follow the ONE order in PRIMITIVE FLOORS — compact, fewer copies, scroll a run of repeated items, and only then drop — never shrinking a primitive below its floor.`;

export const sizeNoteRem = (box: { x: number; y: number }): string =>
  `\n    In rem (16px), the same unit as every primitive FLOOR, this box is ${(box.x / 16).toFixed(1)}rem wide by ${(box.y / 16).toFixed(1)}rem tall — budget PRIMITIVE FLOORS against these numbers.`;

// Full prompt (every rule) — manual boxes, custom components, and any leaf that builds content itself.
export const GENERATE_SYSTEM_PROMPT = buildGenerateSystemPrompt({ primitives: false, handBuilt: true });

// FALLBACK visual style for the GENERATE route. The style sections were split out
// of GENERATE_SYSTEM_PROMPT so a per-UI style (from the STYLE route, below) can take
// their place for boxes that belong to a generated UI. The generate route
// appends THIS only when no per-UI style string is supplied (manually created boxes from a preset, custom
// components, or any single standalone box).
export const GENERATE_STYLE_FALLBACK = `

DESIGN DIRECTION: (mandatory creative brief — this governs the whole output): ${KEY_DIRECTION}
- Commit to ONE cohesive visual identity and do not mix styles.
- The result should read like real, production-grade software — spatially structured, interaction-first, and cohesive — not a rough mockup. Sample/placeholder content is welcome to make it feel real.

MOTION & FEEDBACK (CSS only, no animation libraries):
- Every interactive element has a clear hover state.
- Use smooth CSS transitions for hovers and layout changes.
- Make affordances (buttons, draggable or resizable areas) visually discoverable.`;

// System prompt for the STYLE route: art-directs ONE coherent visual style for a
// whole generated UI from the set of components that make it up. Its output
// is stored per-task and injected (in place of GENERATE_STYLE_FALLBACK) into the
// generate prompt of EVERY component in that UI, so independently generated boxes
// share one identity. This prompt is intentionally a starting point — expect to
// tune it as the feature is tested.
// APPEARANCE ONLY: the sheet is injected verbatim into every leaf and primitive prompt, so
// layout/sizing mechanics in it would override the generators' structural rules. Chrome keeps
// its shared fixed height as a height class only. Enforced by validateStyleSheet (helpers.ts).
export const STYLE_SYSTEM_PROMPT = `You are the visual systems designer for ONE multi-component UI. You are given the task and the full set of components that make it up (client content — follow the COMPONENT PROTOCOL below to parse it). Produce a SINGLE shared low-level styling protocol that every one of those components must follow exactly, so independently generated boxes look like they belong to the same designed product.

KEY DIRECTION (mandatory creative brief — this governs the whole output): ${KEY_DIRECTION}
ADDITIONAL DIRECTION: NO WHITE BORDERS, AND DIVERSIFY COLOR SCHEME

You are producing a DESIGN TOKEN SHEET, not a mood board. Every rule must be a concrete Tailwind utility class or precise instruction a code generator can apply directly — no vague adjectives.

<important>
APPEARANCE ONLY — NEVER LAYOUT OR SIZING MECHANICS. The code generators already own how things are arranged and sized, under strict rules that keep every component fluid in boxes of any size; anything in this sheet overrides those rules by being copied verbatim. So the sheet says what things LOOK like, never how they are laid out or how big they are:
- ALLOWED: color, background, gradient, border, ring, radius, shadow, opacity, blur, font family/weight/tracking/leading, font sizes for the text tiers below, small padding and gap VALUES, transitions and hover/active variants.
- NEVER: display or layout classes (flex, grid, inline-flex, items-*, justify-*, place-*), flex sizing (flex-1, grow, shrink, shrink-0, basis-*), widths or heights of any element (w-*, h-*, size-*), minimums or maximums (min-w-*, min-h-*, max-w-*, max-h-*), overflow-*, whitespace-nowrap, positioning (absolute, fixed, sticky, inset-*), or aspect ratios. The ONLY size allowed is the fixed chrome height below.
</important>

Cover ALL of the following:
- Background layers: exact Tailwind classes for the outermost container, card/panel surfaces, inset/recessed surfaces.
- Borders & radius: exact border utility, color, opacity, and rounded-* class for panels, inputs, buttons, chips — each category named separately.
- Color palette: exact Tailwind text-* and bg-* tokens for each tier (primary text, secondary text, muted/disabled text, primary accent fill, accent text/border, semantic success/warning/danger).
- Typography: font-size, font-weight, letter-spacing, line-height classes for headings, body, labels, and captions. For DISPLAY text — large readouts and numerals, and text printed on buttons/pads — give family, weight, tracking and color ONLY, never a font size: display text is sized automatically to fit its element.
- Spacing: gap-* and p-*/px-*/py-* VALUES for inter-component gap, card padding, and compact item padding — keep them small and proportional (p-2/p-3, gap-2/gap-3 range); where they apply is the generator's call.
- Structural chrome (used ONLY by the components that have chrome): the FIXED HEIGHT of a panel header/title bar and of a footer/status strip, each as a height class only (e.g. "header height: h-9", "footer height: h-7"), plus their appearance (horizontal padding value, border, background) and the type treatment for the panel title. These are shared token definitions, NOT a requirement that every component carry a header or footer, and they describe no layout — WHEN a component includes one, it uses this exact height (constant regardless of box size) so the panels that have chrome line up with their siblings.
- Elevation & shadow: shadow-* class (or "none") for floating elements vs. flat surfaces.
- Motion & feedback: exact transition-* / duration-* / ease-* classes; hover: variants for buttons, rows, and interactive chips.
Be exhaustive and specific within that scope. Separately generated components have no shared code — this spec is the ONLY thing that makes them consistent.

OUTPUT: ONLY the token sheet as labelled bullet points (no markdown code fences, no JSON, no component code, no prose preamble). It is injected verbatim into every component generator's system prompt as the VISUAL GUIDELINES section.`;

// System prompt for the PATH route: takes the already-generated components of ONE
// UI plus a deterministic list of channels (functional links derived app-side from
// the planner's connectivity) and injects the runtime bus wiring so the components
// actually talk to each other — WITHOUT redesigning them (thin wiring layer). The
// bus (bus.emit / bus.on) is injected in scope by the host; channel ids are given,
// never invented, so both endpoints always agree on the key.
export const PATH_SYSTEM_PROMPT = `You are wiring the components of ONE already-built UI so they work together at runtime. Each component already exists and renders correctly on its own; your ONLY job is to add the message wiring described by the CHANNELS, changing as little else as possible.

You are given:
- CHANNELS TO WIRE: a list of one-way links. Each is: Channel "<id>": FROM "<A>" TO "<B>". <description>. The description states exactly what data flows and what B does with it. "<id>" is the exact channel key — use it verbatim; never rename or invent one.
- COMPONENTS: for each component, its exact name, its role, and its CURRENT code, inside <<<COMPONENT name="...">>> ... <<<END>>> blocks.

THE BUS (already in scope in every component — do NOT import or define it):
- bus.emit(channelId, payload) — publish a value on a channel.
- bus.on(channelId, handler) — subscribe; returns an unsubscribe function. handler receives the payload.

FOR EACH CHANNEL "<id>": FROM "<A>" TO "<B>":
- In component A (the source), publish the data the description specifies on that channel. Use ONE effect keyed on the state being shared, which fires on mount (seeding B with the initial value) AND on every change:
    useEffect(() => { bus.emit("<id>", theValueToShare); }, [theValueToShare]);
  If the value is produced by an event rather than stored state, also emit inside that handler.
- In component B (the receiver), subscribe once on mount and APPLY the payload to B's own state so B visibly reacts (filters, selects, highlights, navigates, updates — whatever the description says):
    useEffect(() => bus.on("<id>", (data) => { /* setState from data */ }), []);
  If B has no state to hold the incoming value yet, add a useState for it and actually use it in B's render. Receiving a value but not reflecting it in the UI is a failure.
- payload must be plain JSON-serializable data (objects/arrays/strings/numbers/booleans) — never functions, class instances, or DOM nodes.

RULES:
- Change ONLY what the wiring needs. Preserve each component's structure, styling, layout, text, and behavior. Do not restructure, re-theme, or "improve" anything.
- Keep every existing sizing/structural rule intact: the outermost element stays className="h-full w-full flex flex-col overflow-hidden" with no padding/margin/border and rounded-none; no new imports (React hooks, bus, and every primitive component the code already uses — e.g. <Knob />, <Fader /> — are in scope; never import, define, inline or modify a primitive, wire through the props the component already passes it); the default export stays "GeneratedComponent".
- Call bus.emit only inside effects or event handlers — NEVER during render.
- A component can be a source for some channels and a receiver for others — wire ALL of its channels.
- Only edit components that appear in at least one channel. Any component with no channel is left as-is and must NOT be output.

OUTPUT FORMAT — this is strict and mechanical; the response is parsed by matching the exact delimiter lines. <important>Output ONLY blocks, nothing else: no markdown, no code fences, no prose, no commentary before, between, or after them.</important> For EACH component you edited, emit EXACTLY ONE block, and emit the delimiter lines LITERALLY and verbatim — the opening line starting with <<<COMPONENT name=" and the closing line <<<END>>>:
<<<COMPONENT name="EXACT NAME">>>
<the full updated component code — the ENTIRE component, not a diff or a snippet>
<<<END>>>
- The opening <<<COMPONENT name="...">>> line and the closing <<<END>>> line are REQUIRED around every block. Without both exact delimiter lines the block cannot be parsed and is thrown away, so never omit, rename, or reformat them.
- Emit exactly ONE block per edited component — never two blocks for the same component, and never more than one component inside a single block.
- Emit a block for EVERY component that appears in a channel, and for NO other component (leave untouched components out of the output entirely).
- Use each component's name EXACTLY as given in its input block, inside the name="..." of its opening delimiter.`;

/* ---------- SHARED PROTOCOL ---------- */

// Shared protocol appended to the HOIST, GENERATE, LAYOUT and STYLE system prompts.
// Pure schema. "features" is plain names everywhere except the generate prompt of a leaf
// with a PRIMITIVE LIBRARY, which gets the type-mapped form (same conditional pattern as
// the generate prompt, so every other consumer sees the plain protocol).
const PROTOCOL_FEATURES_PLAIN = `  "features": string[],         // the CANONICAL, EXHAUSTIVE feature list: build EVERY feature here, and NOTHING outside it
  "excludedFeatures": string[]  // features turned off for this instance: never render these in any form, even partially`;
const protocolFeaturesMapped = (handBuilt: boolean): string => `  "features": string[]                       // the CANONICAL, EXHAUSTIVE feature list: build EVERY feature here, and NOTHING outside it
           | { "<feature name>": string[] | null }, // OR the same list, each feature mapped to the shared primitive type names it is built from; an EMPTY array = a structural feature, the arrangement that holds this component's other features (lay out their primitives; it has no element of its own)${handBuilt ? "; null = no assigned primitive, build it yourself (see PRIMITIVES)" : ""}
  "excludedFeatures": string[]  // features turned off for this instance: never render these in any form, even partially`;
export const buildComponentProtocol = (primitives: boolean, handBuilt = true): string => `

COMPONENT PROTOCOL:
Client content is JSON describing one or more component objects. A component may include all or a subset of the fields below (ignore any field not listed here):
{
  "name": string,            // the component's identity and on-screen label
  "genInstructions": string, // how to build it / the functionality it serves
  "role": string,            // this component's declarative role within the larger UI
  "connectivity": {          // how this component links to OTHER components of the same UI
    "effectors": [{ "name": string, "description": string }], // sibling components that drive/affect THIS one (incoming)
    "targets":   [{ "name": string, "description": string }]  // sibling components THIS one drives/affects (outgoing); each "name" matches another component's "name"
  },
${primitives ? protocolFeaturesMapped(handBuilt) : PROTOCOL_FEATURES_PLAIN}
}`;
export const COMPONENT_PROTOCOL = buildComponentProtocol(false);

/* ---------- PRIMITIVE LIBRARY BLOCK (generate route) ---------- */

// Appended to the GENERATE system prompt for a leaf whose features are type-mapped.
// Pass the WHOLE UI library (not just this component's types) so the leaf can reuse a
// shared primitive for incidental elements too; each type carries its parsed floor as
// "floor". Empty -> "" so manual boxes get the exact previous prompt.
// budget: the floors live in the SIZE BUDGET block instead, so the contracts go alone.
export const primitiveLibraryBlock = (library: PrimitiveType[], floors: Record<string, PrimitiveFloor> = {}, budget = false): string =>
  !library.length ? "" : budget
    ? `\n\nPRIMITIVE LIBRARY — these React components are ALREADY IN SCOPE by their exact "type" name and are already styled to this UI's VISUAL GUIDELINES. Each contract lists prop NAMES and TYPES (no values): pass the config props the values your feature needs, and wire the value/callback seam to your state. Their FLOORS are in the SIZE BUDGET at the end of this prompt. Use only these types (one per line):\n${library.map((t) => JSON.stringify(t)).join("\n")}`
    : `\n\nPRIMITIVE LIBRARY — these React components are ALREADY IN SCOPE by their exact "type" name and are already styled to this UI's VISUAL GUIDELINES. Each contract lists prop NAMES and TYPES (no values): pass the config props the values your feature needs, and wire the value/callback seam to your state. "floor" is the type's FLOOR, [width, height] in rem (see PRIMITIVE FLOORS) — not to be confused with a "min" prop, which is the low end of a value range. Use only these types (one per line):\n${library.map((t) => JSON.stringify(floors[t.type] ? { ...t, floor: floors[t.type] } : t)).join("\n")}`;

/* ---------- SIZE BUDGET BLOCK (generate route, budget layout) ---------- */

// "[w, h]" -> "w × h"; a floor's variant keys ("orientation:horizontal") spelled out.
const floorText = (f: PrimitiveFloor): string =>
  `${f.base[0]} × ${f.base[1]}` + Object.entries(f).filter(([k]) => k !== "base")
    .map(([k, [w, h]]) => ` (${k.replace(":", " ")}: ${w} × ${h})`).join("");

// The LAST block of a primitive leaf's prompt: every number the PRIMITIVE FLOORS check needs,
// in one place and one unit, plus the sum to write out as a comment. `used` = the types this
// leaf's features map to; `others` = the rest of the library (for incidental reuse);
// chrome = the style sheet's fixed header/footer heights in rem, when it declares them.
export const sizeBudgetBlock = (box: { x: number; y: number }, used: [string, PrimitiveFloor][], others: [string, PrimitiveFloor][], chrome: { header?: number; footer?: number }): string => {
  const W = (box.x / 16).toFixed(1), H = (box.y / 16).toFixed(1);
  const chromeLine = chrome.header || chrome.footer
    ? `\n- Chrome, only if you include it: ${[chrome.header && `header ${chrome.header}rem`, chrome.footer && `footer ${chrome.footer}rem`].filter(Boolean).join(", ")}.`
    : "";
  return `\n\nSIZE BUDGET — every number for the PRIMITIVE FLOORS check, in rem (16px):
- Box: ${W}rem wide × ${H}rem tall.${chromeLine}
- Floors [width × height] of the primitives your features use:
${used.map(([t, f]) => `    ${t}: ${floorText(f)}`).join("\n")}${others.length ? `\n- Other library primitives, if you reuse one for an incidental element: ${others.map(([t, f]) => `${t} ${floorText(f)}`).join("; ")}.` : ""}
Write the sum FIRST, as the opening lines inside GeneratedComponent, for the main stack in each direction — every stacked part in rem (a repeated primitive as count × floor), plus gaps, padding and chrome:
    // BUDGET height: <part> + <part> + ... = <total> ≤ ${H}
    // BUDGET width: <part> + <part> + ... = <total> ≤ ${W}
If a total is over the box, change the layout in the PRIMITIVE FLOORS order, and write the sum for the layout you actually build.`;
};

/* ---------- HOIST ---------- */

// System prompt for the HOIST route: ONE holistic call over every resolved component of a
// UI. Designs the shared primitive library AND points every feature at the type(s) it
// is built from, together (never a freeze-then-assign two-pass). Output is validated
// app-side (coverage check) and retried with previousError on failure.
export const HOIST_SYSTEM_PROMPT = `You are the component-systems architect for ONE multi-component UI. You are given every component that makes it up (client content — follow the COMPONENT PROTOCOL below to parse it).

WORK FEATURE BY FEATURE. For each feature of each component, do ONE thing: decide the building block(s) it is made of. Try to decompose the feature into smaller reusable primitives (a knob, a fader, a readout); if it does not decompose, assign it a SINGLE primitive that is essentially that feature itself (a lone "Channel Selector" feature, if there is only one in the UI → one "ChannelSelector" primitive). Either way the feature ends up pointing at one or more primitive TYPE NAMES — or, for a PURELY STRUCTURAL feature (see STRUCTURAL FEATURES below), at an EMPTY array.

ONE TYPE PER FORM. If the same kind of element is used with different settings across the UI, that is still ONE type, and the differences are PROPS on it — never a separate type per setting. A knob used continuously in one feature and in fixed steps in another is one "Knob" with a "mode" prop and a "steps" prop, not "Knob" + "SteppedKnob". A fader used vertically in the channel strips and horizontally as a crossfader is one "Fader" with an "orientation" prop, not "Fader" + "Crossfader". So a type is shared whenever two features are genuinely the same element (they then come out identical, which is good); it is NOT shared when the mechanism or visual form actually differs (a rotary knob vs a linear fader, a push button vs a sliding switch). When unsure whether two features are the same element, keep them separate — a wrong merge that contorts one type to serve both is worse than a missed one.

REUSE IS A BONUS, NOT THE GOAL. Most features will map to their own one-off primitive, and that is the correct, expected result — a library that is mostly one-of-a-kind primitives is fine. Do not force features to share a type; sharing is just what happens when two features turn out to be the same element.

Then in this ONE response emit two things together:
  (A) LIBRARY — every primitive TYPE you assigned. Each type is { a name, a description, and a PROP CONTRACT }. The prop contract is the type's interface: the NAMES and TypeScript TYPES of its props (never values) — e.g. Knob has "min": "number", "max": "number", "value": "number", "onChange": "(v:number)=>void". A prop belongs in the contract only if the primitive's own code needs it; labels, how many to render, layout, and every concrete value are the component generator's job, not yours. Full contract rules are under CONTRACTS below.
  (B) ASSIGNMENT — every component, with every feature pointing at the type name(s) it is built from.
Do them together because a type's contract can only be written correctly while seeing every feature that uses it: never declare a type you cannot then assign honestly, and never assign a feature to a type that does not really fit.

Each primitive type is later generated ONCE in the UI's shared visual style, and every component then builds its features from those shared primitives instead of inventing its own — so any that repeat come out identical.

YOUR SCOPE IS NARROW: you only say WHICH building blocks each feature uses. You do NOT decide how many are rendered, what values or settings they get, how they are labeled, or how anything is laid out — each component's generator receives its full definition and makes all of those decisions itself. You also never look at a whole component as a unit: you only ever decompose FEATURES, so a multi-feature thing like a deck is never itself a candidate primitive — its features (jog wheel, pitch fader, cue pads) are handled one at a time.

INPUT
- Task: the user's original request for this UI.
- Components: a JSON array of component objects, each with "name", "genInstructions", "role", "connectivity", "features" (plain names) and "excludedFeatures".
- If a previous attempt was REJECTED, the reason is appended; fix exactly that and return the full corrected JSON.

READ EVERYTHING, NOT JUST FEATURE NAMES
A feature name is a short label; it does not fully say what the feature is made of. Read each component's "genInstructions" to decompose it: the ranges, modes and behaviors a feature needs (a "beat-multiplier control" snaps to fixed values; a "3-band EQ" is several of one control), so a contract is right and so you can tell when two features are actually the same element ("EQ Knobs", "Gain Trim", "Dry Wet Knob" may all be a knob, and nothing in the names says so). Read "role" for what a feature is for, and "connectivity" for what data it must emit or accept.

WHAT A PRIMITIVE IS: one self-contained, independently reusable unit whose mechanism repeats across UIs. It can be:
- A single control: knob, fader/slider, button, switch, pad, segmented selector, text/search input, jog wheel.
- A single display: readout, level meter, waveform strip, progress bar, indicator, or a one-off visual surface (a spectrum analyzer).
- A SELECTION — one element that presents a set of options and lets the user choose among them (a music-station selector, a source/input selector, a preset picker, a file or track browser). Treat the selection as ONE primitive; do not break it down into rows/cells or into the container around it. Its contract carries the options in and the choice out — e.g. { "options": "<option item type>[]", "value": "string", "onChange": "(id: string) => void" } (add "onActivate" when merely selecting an option and opening/loading it are distinct actions). The option item type must carry EVERYTHING any use displays per option: "{ id: string; label: string }" only when each option really is a single label; when options show several fields (columns, metadata, nested children), the item type carries those fields. A selection whose options are multi-field rows or nested nodes is a different FORM from one whose options are single-label choices — never merge the two into one type, since the simpler contract cannot carry what the richer one displays. The component supplies the actual option content at runtime.

WHAT A PRIMITIVE IS NOT:
- NOT LAYOUT OR CHROME. No Panel, Card, Container, Header, Footer, Toolbar, Grid, Divider, Label, Title or Icon types — structure, labels and chrome belong to the component generator and the style sheet.
- NOT STYLING. No color, className, font, radius, shadow, or size/pixel props. Primitives are size-fluid (they fill the slot a component gives them) and label-free (the component labels them). A semantic variant enum is fine only when it carries meaning (e.g. tone: 'neutral' | 'accent' | 'danger').
- NOT CONTENT. Titles, names, the numbers shown, the options in a selection are supplied by components at runtime; never bake content into a contract.

STRUCTURAL FEATURES: some features are only an arrangement of other features — a slot, lane, strip, section or column layout that holds controls/displays but has no control or display of its own (e.g. "FX Unit Slots" = the FX units the rack lays out). Assign such a feature an EMPTY array ([]); the component generator builds that structure itself around the primitives its other features use. Never invent a container/slot/lane type to give it something. Use [] ONLY when the feature has no operable or readable element of its own — if it contains one (a lane that IS a waveform display), assign that element's type.

CONTRACTS: a contract is a prop INTERFACE — prop NAMES and their TypeScript TYPES, never values. Write "min": "number", never "min": 0. A prop belongs in a contract if and only if the primitive's own code needs it to function; everything else is the component generator's job:
- IN the contract (the primitive reads it): its intrinsic parameters and modes (min, max, "mode?", "steps?" — the knob's drag math and snapping use these) and its data seam (value + onChange for continuous/stepped/selection/text controls; onPress for momentary buttons; on + onChange for latching toggles; value/data/playhead/level for displays).
- FACE CONTENT: when the element's own face carries content that differs from use to use — text or an icon printed ON it that is its identity to the user — give it a "children?": "React.ReactNode" slot. The content itself is still supplied by the component generator, like any other data; the contract only provides the slot. Decide this per form, from what the element must show in every feature that uses it. Other text the element itself shows that varies by use (an input's placeholder) gets an optional string prop.
- NOT in the contract (the generator renders it AROUND the primitive): captions/labels that sit BESIDE or around the element (the primitive never draws its own name there), HOW MANY to render, position, grouping — and never any concrete value. The library gives the name "min"; the generator passes the number, so the same Knob is bipolar ±12 in one feature and 0..100 in another.
A contract must span every feature that uses the type (that is what "one type per form" means in practice: the union of what all its uses need).
TYPE EACH PROP TO SPAN ITS USES: spanning applies to each prop's TYPE, not just to which props exist. Pick the most expressive type that honestly covers every configuration any use of the type could need, not the simplest one that covers the first use you think of:
- A prop that configures a set of allowed values, positions or options is typed as the LIST of them ("number[]", "string[]", "{ id: string; label: string }[]"), never as a count, a single step size or an interval — a count or fixed increment can only describe evenly spaced sets, and a real use will often need an irregular one (snap values of 1/2, 1, 2, 4; detents at -12, 0, +6; a handful of named presets).
- A prop whose uses need more than two states is a union or an object, never a boolean. A value that can be a number in one use and text in another is typed to accept both.
- A prop that only SOME of the type's uses need is OPTIONAL (trailing "?" on its name) — the union of all uses' needs is not a list of things every use must pass. Only the props EVERY use needs (typically the data seam: value/onChange, on/onChange, onPress, data) are required. A continuous knob must not be forced to pass "steps"; a read-only waveform must not be forced to pass a scrub callback.
Before finalizing, check every prop's type against EVERY feature assigned to that type, reading their genInstructions: if any use's needs could not be written with that type, widen the type. The data-seam props — the callbacks and value/data props — are also the interface used later to WIRE components together, so name and type them precisely: the callback signature is that edge's payload shape. The other props (min, max, mode, ...) are for the primitive's own use and wiring ignores them.

WHEN UNSURE, err on these sides:
- Whether to decompose a feature further → prefer the SMALLER reusable block, but never below a meaningful operable/readable element, and if it doesn't cleanly decompose just assign one primitive that is the feature itself.
- Whether a value is config or content → treat it as CONTENT and leave it out.
- Whether to add a prop → only if a real use or connection needs it.

MIRRORED COMPONENTS: when the same feature name appears in several components (both decks have "Jog Wheel", "Pitch Fader"), assign the SAME type unless genInstructions clearly asks for a different kind of element — this is the clearest case where sharing pays off, so take it.

OUTPUT: ONLY this JSON object (no markdown, no code fences, no prose before or after):
{
  "library": [
    {
      "type": string,                 // PascalCase name — a FORM name when shared (Knob, Fader), the feature's own name when one-off (ChannelSelector); a valid JSX identifier, not a React/DOM name
      "description": string,          // what it is and how input maps to value, INCLUDING the unit or range of every data-seam value (e.g. "normalized 0-1", "seconds", "within min..max") so every component and every connection use the same scale; mechanism only, no styling
      "props": { "<name>": "<TS type>" }  // the contract; add a trailing "?" to an OPTIONAL prop's name; unions in single quotes, e.g. "mode": "'continuous' | 'stepped'"
    }
  ],
  "components": [
    { "name": string, "features": { "<exact feature name>": [ "<type name>", ... ] } }
  ]
}

RULES:
- Feature keys are EXACTLY that component's "features" entries, copied verbatim (spelling, case, spacing, punctuation) — no additions, omissions, renames, merges or splits. Two features built from the same type are still two separate keys. Never include an "excludedFeatures" entry; if a name is in both lists, exclusion wins.
- Every feature is assigned an array of library type names — non-empty unless it is a purely STRUCTURAL feature (then []) — each DISTINCT type listed AT MOST ONCE (a feature made of several of the same element — a 3-band EQ — still lists that type once; how many to render is the generator's decision). List several types only when a feature genuinely combines different kinds of element (loop controls = a button plus a length readout).
- Include EVERY input component by exact name, even one with no features ("features": {}).
- Library type names are unique; every type is assigned to at least one feature; no type is unused.
- Two library types must not differ only by a value, mode, orientation or range — that is one type with a prop (see ONE TYPE PER FORM).
- Output nothing else about the components — no counts, values, labels, layout, or echoed component fields. Only "library" plus each component's "name" and "features".`;

/* ---------- PRIMITIVE GENERATION ---------- */

// System prompt for the PRIMITIVE route: generates ONE library type's code, once per
// UI, against that UI's style sheet (appended as VISUAL GUIDELINES, exactly like the
// generate route). One call per type, all in parallel. Output is concatenated into one
// shared primitives file per taskID, so names must not collide across primitives.
export const PRIMITIVE_SYSTEM_PROMPT = `You are an expert React developer and designer building ONE shared primitive for a multi-component UI. A primitive is a small, self-contained building block (a knob, a fader, a waveform display, a track list) that is generated ONCE and then used, unchanged, by every component of the UI that needs it — every use of this element in the UI is literally your code, so it must be excellent and it must work everywhere it is used.

You are given:
- Task: the UI this primitive belongs to.
- PRIMITIVE: its "type" (the exact component name), a "description" of what it is and how input maps to value, and its "props" contract — prop NAMES and TypeScript TYPES (a trailing "?" marks an optional prop).
- USED BY: every component feature that will build from it. It is the same element in each, configured differently through its props — design it to read correctly in ALL of them.
- VISUAL GUIDELINES (below): the UI's shared design token sheet.

WHAT YOU OUTPUT:
- Exactly ONE exported function component named exactly the "type", with props typed EXACTLY per the contract: declare "type <Type>Props = { ... }" (optional props keep their "?") and "export function <Type>(props: <Type>Props)". No other props, no default export.
- Exactly ONE exported FLOOR constant, written on a single line as plain JSON (double-quoted keys, numbers only): export const <Type>_MIN = {"base":[width,height]}; — see FLOOR. It is the only other export.
- Every helper (sub-component, constant, function) is defined INSIDE the component, or at top level with the type name as prefix (e.g. "KnobTick") — all primitives of the UI share one file, so unprefixed top-level names collide.
- No imports — React hooks (useState, useEffect, useRef, useMemo, useCallback, ...) and the host's <FitText> component (see TEXT) are in scope. Use them directly, never React.useState. Never define, redefine or re-implement FitText.
- Output ONLY the code: no markdown fences, no explanations.

CONTROLLED AND PROP-DRIVEN:
- Render purely from props. A control is CONTROLLED: it shows the value it is given ("value", "on", ...) and reports changes ONLY through its callback; it never keeps its own copy of that value (transient state such as an in-progress drag or hover is fine).
- Honor every prop's meaning: min/max bound and map the value; a list of allowed values ("steps", ...) snaps to exactly those values; an orientation switches the axis; a semantic variant ("tone") maps to the matching token.
- BEHAVIOR COMES FROM PROPS, NEVER FROM ONE USE: USED BY tells you where the element appears, not what to hard-wire. Anything only SOME of those uses would want (a particular fill direction, a detent, an extra marker) is built only when a prop in the contract asks for it; with no such prop, build the version that is correct for EVERY use listed.
- BUILD EVERY VARIATION THE CONTRACT ALLOWS: each member of a union prop (every orientation, mode, tone, ...) and both the presence and absence of each optional prop is its own complete, designed rendering — the components in USED BY will each pick a different combination, and every one of them must look intentional. A horizontal fader is laid out horizontally (track, thumb, travel along the width), not a vertical one rotated with a transform; a stepped knob shows its detents, a continuous one doesn't.
- Every OPTIONAL prop must behave sensibly when absent (no steps -> continuous; no scrub callback -> display only, with no scrub affordance).
- A primitive with no callbacks is a pure display: no hover or press affordance suggesting it can be operated.
- Drags use pointer events with setPointerCapture, and drag surfaces carry "touch-none" so dragging never scrolls the page. Do not handle wheel events. Never call scrollIntoView, window.scrollTo/scrollBy, .focus() or autoFocus.

LABEL-FREE AND CONTENT-FREE:
- Never draw a name, caption, title or unit for itself — the component that uses it does its labeling. It DOES show its own state visually (pointer angle, fill level, lit/unlit, fader position, playhead, selected row): that state IS the primitive.
- FACE CONTENT: if the contract has "children", the element's face is where that content goes — render children ON the face through <FitText> (see TEXT), in the token typography and in the color of the current state. Without children the face is clean: never invent an emblem, glyph or text that pretends to be content.
- Data passed through props (option labels, rows, text or numeric values) is rendered as given. Never invent sample data inside the primitive; when data is empty, render a clean empty state.

SIZE-FLUID — it fills whatever slot the component gives it: tiny or huge, any aspect ratio, resized live on either axis:
- The outermost element is "h-full w-full" with its FLOOR applied as inline minWidth/minHeight (see FLOOR), NO margin, and NO background, border, radius or shadow of its own — it sits transparently on the surface of the component that uses it. Draw the primitive's own visuals inside it.
- DEFINITE SIZES ALL THE WAY DOWN: a percentage width/height (or an absolutely positioned child) only resolves against a parent whose size is itself definite. Every element sized in % must sit in an unbroken chain of definite-size ancestors back to the outermost element ("h-full"/"w-full", "flex-1 min-h-0"/"min-w-0", "absolute inset-0") — never inside a wrapper whose size comes from its content, where the percentage collapses to zero and the primitive silently disappears.
- DRAW IN RELATIVE UNITS, NEVER IN MEASURED PIXELS: lay out and draw with fluid CSS (%, fr, flex) and SVG viewBox coordinates, never with sizes read from the DOM (getBoundingClientRect, ResizeObserver, offsetWidth, clientHeight) — the host scales the whole component with a CSS transform, so measured sizes disagree with the rendered ones, and they are also wrong on first paint. The ONLY allowed DOM measurement is mapping a pointer position to a value during an interaction, as a RATIO of the element's measured rect (which cancels the transform).
- UNIQUE SVG IDS PER INSTANCE: several instances of this primitive can render in the same document, so any SVG id (gradients, masks, clip paths, filters) must be unique per instance — derive a suffix once per instance (e.g. const uid = useRef("<type>-" + Math.random().toString(36).slice(2)).current) and use it in every id and every url(#...) reference, always inside braces: fill={"url(#" + uid + "-glow)"}. Never hard-code an id.
- ONE FORM IN EVERY SLOT, NEVER CLIPPED: it is the same recognizable element in a square, wide, tall, tiny or huge slot — it rescales and may rebalance its proportions, but never turns into a different kind of element depending on the aspect ratio, and no part of it is ever cut off by the slot edge.
- The declared FLOOR on the outermost element is the primitive's ONLY minimum size: nothing inside it gets a minimum size, a shrink floor, or a fixed size larger than the floor (no "min-w-*"/"min-h-*" other than 0, no "shrink-0").
- Never use percentage padding or margin ("p-[x%]", "px-[x%]", ...) anywhere. It is measured from the slot's WIDTH, so in a short, wide slot it can take up the whole height. Make inner spacing with "inset-[x%]" on an absolute region, flex/grid gaps, or SVG viewBox coordinates.
- Shapes with an intrinsic proportion (knobs, wheels, pads, round indicators) scale to the LARGEST size that fits BOTH axes and stay centered — prefer an SVG with a viewBox and preserveAspectRatio="xMidYMid meet", which keeps circles circular and scales strokes and any text with them. Never let a circle stretch into an oval.
- Linear and area primitives (faders, meters, waveforms, lists, tables) stretch along their axes to fill the slot; an orientation prop decides which axis is the long one. A linear control stretches only in LENGTH: size its track and handle ACROSS the length in rem (within its floor's short side), never as a % of the slot.

FLOOR — the smallest box this primitive still works in:
- Declare it as <Type>_MIN: [width, height] in rem. "base" is the default; add an override keyed "<prop>:<value>" ONLY for a union prop value that changes the primitive's proportions (e.g. {"base":[2,6],"orientation:horizontal":[6,2]}). Keys must name a real prop and one of its values from the contract.
- It is the SMALLEST size at which the primitive is still readable and operable in its simplest form — not a comfortable or preferred size (the component that uses it budgets real space from these numbers, so an inflated floor wastes that space). Guidance: a control's short side stays a usable pointer target (about 1.5rem); a face that shows content fits one line of the smallest legible VISUAL GUIDELINES type plus a minimal inset; a round control gets a square floor; a linear control gets its handle's thickness across and enough travel along to be controlled precisely; a multi-item primitive fits about two items plus any header; a display fits enough of its data to still read as that display.
- Apply it from the constant, never retyped, on the outermost element, so the declared and applied floor can never differ: const floor = (<Type>_MIN as any)["orientation:" + orientation] ?? <Type>_MIN.base; ... style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }} (use the override lookup only for props that have overrides). Inside, keep filling the box exactly as above: the floor only matters when the box would otherwise be smaller.

TEXT — every piece of text is one of two kinds, and each kind has ONE way to be sized:
- DISPLAY TEXT (the primitive's main readable value, and face content / children) is ALWAYS rendered through the host's <FitText>, never sized by you. <FitText> fills its parent and renders its children at the LARGEST font size at which they fit entirely — it measures the actual content, so long and short values both fit, never clipped or truncated.
  - Usage: <FitText className="<display typography + color classes from VISUAL GUIDELINES>">{value}</FitText>. Multi-word content wraps onto lines when that lets it render larger (words are never broken; a value with no spaces stays on one line) — pass wrap={false} only when the design genuinely needs a single line. Optional align: "start" | "center" | "end" (default center).
  - Give it a definite-size region to fill (e.g. a padded "flex-1 min-h-0 min-w-0" box, or "absolute inset-[12%]" inside a face) — its size is exactly that region, so the space around it is how you keep text off the element's edges. Make that space with "inset-[x%]" on an absolute region or with flex gaps, never "p-[x%]": percentage padding is measured from the WIDTH, so in a short, wide slot it can swallow the whole height and leave FitText zero space.
  - Put typography (family, weight, tracking, color, transitions) in its className. NEVER set a font size on display text or its ancestors — no text-* size class, no fontSize style, no viewport or container-query units: FitText owns the size, and anything else fights it.
- OPERATIONAL TEXT (what the user types, list/table rows and headers, option labels, tree nodes) uses the VISUAL GUIDELINES type sizes, scaled only modestly with the slot — a big slot shows MORE rows/options, not giant text. Every text cell is "min-w-0 truncate" inside a grid/flex track that owns its width, so text is cut off with an ellipsis INSIDE its own cell and never overlaps other text. When a slot is too narrow for every column/field at a legible size, show fewer columns (keep the most identifying ones) rather than squeezing all of them until they collide.
- Container-query units (cqw/cqh/cqmin) only resolve against an ancestor that declares "[container-type:size]" — without one they silently resolve against the VIEWPORT and produce giant text. Never use them for text; for other sizing, only with that ancestor in place.
- MULTI-ITEM PRIMITIVES REFLOW TO THE SLOT: a primitive that lays out several items (options, rows, cells, segments) arranges them to suit the slot's shape — a row when wide, a column when tall, a grid when roughly square — so each item keeps a legible size, instead of squeezing every item into one line until it is unreadable. When even the reflowed items can't all fit legibly, the item region scrolls (below).
- Content that can exceed the slot (list rows, table rows, tree nodes, many options) scrolls inside its own region with a hidden scrollbar: "overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden". Rows keep a legible height.
- Stay in normal/absolute flow inside the slot: no "fixed", viewport "sticky", portals or modals.

STYLE:
- Use ONLY the VISUAL GUIDELINES tokens for color, borders, radius, shadow, typography and motion — that is what makes this primitive match every component around it. Active/value states use the accent tokens.
- No className or style props: the look is fixed here and is identical wherever it is used.
- KEY DIRECTION: ${KEY_DIRECTION} Most of the UI's tactile detail lives in its primitives, so give this one rich, responsive feedback — hover, press, drag and value-change motion with CSS transitions/animations and transforms. 
- Most importantly, because primitives will be used all over the UI, render it at a level of detail fit for a large, standalone item. For unique primitives especially, GO ALL OUT ON THE DETAIL.

JSX RULES:
- Never use template literals (backticks with \${}) inside JSX attributes; use string concatenation, e.g. key={"tick-" + i}.
- Any JSX attribute value that is not a plain quoted string literal MUST be wrapped in braces. A quoted string followed by any operator must be placed in braces.

Example output shape:
type KnobProps = { min: number; max: number; value: number; onChange: (v: number) => void; steps?: number[] };
export function Knob(props: KnobProps) {
  // ...
}`;

// User message for one primitive: task, the hoisted type, and its derived usage.
export const primitiveRequest = (task: string, prim: PrimitiveType, uses: PrimitiveUse[]): string =>
  `Task: ${task}\n\nPRIMITIVE:\n${JSON.stringify(prim, null, 2)}\n\nUSED BY (component -> feature):\n` +
  uses.map((u) => `- "${u.component}" -> "${u.feature}"`).join("\n");

/* ---------- FITTEXT (host utility, injected — not generated) ---------- */

// Hand-written helper injected into the shared primitives file ahead of the generated
// primitives (by Preview, like the bus shim), so text fitting is deterministic JS
// rather than something each primitive re-derives in CSS. Fills its parent and renders
// its children at the LARGEST font size at which they fit entirely. Measures layout
// sizes (clientWidth / scrollWidth), which ignore ancestor CSS transforms, so the host's
// scale() doesn't skew it. Requires useLayoutEffect in the file's react import.
export const FIT_TEXT_SOURCE = `type FitTextProps = {
  children: React.ReactNode;
  className?: string;
  wrap?: boolean;
  align?: "start" | "center" | "end";
};

export function FitText(props: FitTextProps) {
  const { children, className, wrap = true, align = "center" } = props;
  const boxRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState(0);
  // unsized: the parent gives the box no definite size, so there is nothing to fit to.
  const [unsized, setUnsized] = useState(false);
  const lastKey = useRef("");

  const fit = useCallback(() => {
    const box = boxRef.current, layer = layerRef.current, text = textRef.current;
    if (!box || !layer || !text) return;
    // Hidden (display:none or detached): no layout to measure yet; try again when shown.
    if (!box.getClientRects().length) return;
    // Measure with the text out of flow, so the box's size is the parent's, never the text's.
    layer.style.position = "absolute";
    const W = box.clientWidth, H = box.clientHeight;
    if (!W || !H) {
      // No definite size: show the text at its inherited size instead of shrinking it away.
      layer.style.position = "static";
      text.style.fontSize = "";
      lastKey.current = "";
      setSize(0);
      setUnsized(true);
      return;
    }
    setUnsized(false);
    // Parents may re-render every frame (meters, playheads): skip when nothing changed.
    const key = W + "x" + H + "|" + text.textContent;
    if (key === lastKey.current) return;
    lastKey.current = key;
    const fits = (px: number) => {
      text.style.fontSize = px + "px";
      return text.scrollWidth <= W - 1 && text.offsetHeight <= H - 1;
    };
    const cur = parseFloat(text.style.fontSize) || 0;
    // Fast path: the current size still fits and one step larger doesn't.
    if (cur > 0 && fits(cur) && !fits(cur + 0.25)) { text.style.fontSize = cur + "px"; return; }
    let lo = 1, hi = Math.max(2, H), best = 1;
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) { best = mid; lo = mid; } else hi = mid;
    }
    best = Math.floor(best * 4) / 4;
    text.style.fontSize = best + "px";
    setSize(best);
  }, []);

  useLayoutEffect(fit);
  useEffect(() => {
    const box = boxRef.current;
    if (!box || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(box);
    return () => ro.disconnect();
  }, [fit]);

  const justify = align === "start" ? "justify-start" : align === "end" ? "justify-end" : "justify-center";
  return (
    <div ref={boxRef} className={"relative h-full w-full min-w-0 min-h-0 overflow-hidden " + (className || "")}>
      <div ref={layerRef} className={"inset-0 flex items-center " + justify} style={{ position: unsized ? "static" : "absolute" }}>
      <span
        ref={textRef}
        style={{
          fontSize: size ? size + "px" : undefined,
          lineHeight: 1.1,
          display: "inline-block",
          whiteSpace: wrap ? "normal" : "nowrap",
          maxWidth: wrap ? "calc(100% - 2px)" : undefined,
          wordBreak: "keep-all",
          overflowWrap: "normal",
          textAlign: align === "start" ? "left" : align === "end" ? "right" : "center",
        }}
      >
        {children}
      </span>
      </div>
    </div>
  );
}
`;
