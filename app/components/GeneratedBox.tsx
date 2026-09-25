import { GeneratedBoxProps, XY, defaultXY, ComponentInstance, ComponentDef, PrimitiveSet, LeafPrimitives } from '../utils/spec';
import { useGetCode } from '../utils/useGetCode';
import { resolveComponent, leafLibrary } from '../utils/helpers';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import ComponentSelector from './ComponentSelector';
import CustomizationSelector from './CustomizationSelector';
import Preview from './Preview';

// Resize handles. Single-letter dirs = sides (reflow), two-letter = corners (zoom).
const RESIZE_HANDLES = [
  { dir: 'n',  cls: 'top-0 left-0 w-full h-1.5',     cursor: 'ns-resize' },
  { dir: 's',  cls: 'bottom-0 left-0 w-full h-1.5',  cursor: 'ns-resize' },
  { dir: 'e',  cls: 'top-0 right-0 h-full w-1.5',    cursor: 'ew-resize' },
  { dir: 'w',  cls: 'top-0 left-0 h-full w-1.5',     cursor: 'ew-resize' },
  { dir: 'nw', cls: 'top-0 left-0 w-3 h-3',          cursor: 'nwse-resize' },
  { dir: 'ne', cls: 'top-0 right-0 w-3 h-3',         cursor: 'nesw-resize' },
  { dir: 'sw', cls: 'bottom-0 left-0 w-3 h-3',       cursor: 'nesw-resize' },
  { dir: 'se', cls: 'bottom-0 right-0 w-3 h-3',      cursor: 'nwse-resize' },
];

// Cross-instance scratch for drill-on-mouseup: a child records its path here on
// mousedown; the ROOT box reads it in its drag mouseup and commits the drill ONLY
// if no drag happened — so moving the UI never briefly flashes a child selection.
// Safe as a single module-level value because only one box interaction can be in
// flight at a time, and it's cleared at the end of every interaction.
let pendingDrillPath: string[] | null = null;

// Created from drag interaction in Spacial Grid, 
// Contains a bunch of low level visual layer transformations for the boxes,
// and the main logic behind the prompt routing
export default function GeneratedBox({ props, path, selectionPath, setSelectionPath, blockSize, gridRef, interactMode, componentRegistry, setComponentRegistry, styleSpec, primitiveSpec, isChild = false, markNonEmpty, syncBounds, reportCode, wiredCode, wiringLeaves }
  : {
      props : GeneratedBoxProps,
      // This box's path from its top-level root, e.g. [rootKey] or [rootKey, childKey].
      path : string[],
      // The globally selected path (owned by SpatialGrid).
      selectionPath : string[],
      setSelectionPath : React.Dispatch<React.SetStateAction<string[]>>,
      blockSize : number
      gridRef : HTMLDivElement
      interactMode : boolean
      componentRegistry : ComponentDef[]
      setComponentRegistry : React.Dispatch<React.SetStateAction<ComponentDef[]>>
      // Per-UI style registry (taskID -> style). A box of a generated UI looks up
      // its style here by props.taskID; manual boxes have no taskID and get the
      // generate route's fallback style.
      styleSpec : Record<number, string>
      // Per-UI primitive registry (taskID -> PrimitiveSet). A leaf of a UI that has one
      // builds from its primitives; everything else is hand-built.
      primitiveSpec : Record<number, PrimitiveSet>
      // True for any box rendered inside a parent (any depth). Only the root (false) drags.
      isChild? : boolean
      // Targeting groundwork: a box reports when it first generates (no longer empty).
      markNonEmpty? : (key : string) => void
      // Persist a moved/resized box's new block coords back to elementArr (top-level
      // only) so consumers like ungroup read where it IS, not where it spawned.
      syncBounds? : (key : string, b : { colStart : number; colEnd : number; rowStart : number; rowEnd : number }) => void
      // A UI leaf reports its finished code up (keyed by box key) so SpatialGrid can
      // collect the whole UI's code once every leaf is done, then wire it (Path route).
      reportCode? : (key : string, code : string) => void
      // leafKey -> wired code from the Path route. When this leaf has an entry, it
      // renders the wired code (bus.emit/on injected) in place of its generated code.
      wiredCode? : Record<string, string>
      // Leaf keys currently being rewired by the Path route -> show the generation
      // shimmer while wiring runs (this leaf isn't running its own useGetCode stream).
      wiringLeaves? : Set<string>
    }) {

  /* DATA LAYER STATE VARS */

  // The chosen component type + active features for this box
  const [instance, setInstance] = useState<ComponentInstance>({ name: '', activeIdx: [] });
  // True while the LLM generates a definition for a custom component
  const [isLoadingSpec, setIsLoadingSpec] = useState<boolean>(false);


  /* VISUAL LAYER STATE VARS */

  // Get the width and height in blocks of the box (stateful so it can be resized)
  const [blockDim, setBlockDim] = useState<XY>({x: props.colEnd - props.colStart, y: props.rowEnd - props.rowStart});

  // Grab the async code setter handleSend and state vars
  const { handleSend, generatedCode, isGenerating } = useGetCode();

  // Track box drag
  const [isMouseDragging, setIsMouseDragging] = useState<boolean>(false);
  // Popup menu visibility, independent of selection (could be selected -> click component -> still selected with menu closed)
  const [menuOpen, setMenuOpen] = useState<boolean>(true);
  // Persist and track coords of box, set initial values
  const [blockPos, setBlockPos] = useState<XY>({x: props.colStart, y: props.rowStart});
  // Resize: compass dir ('e','se',...) while resizing, null otherwise
  const [resizeDir, setResizeDir] = useState<string | null>(null);
  // Live pixel rect while resizing (top-left + size, grid-relative)
  const [resizeRect, setResizeRect] = useState<{left:number;top:number;width:number;height:number} | null>(null);
  // Mouse + box rect captured at resize start
  const resizeStart = useRef<{mx:number;my:number;rect:{left:number;top:number;width:number;height:number}} | null>(null);
  // Live rect ref so mouseup can snap without stale closure
  const resizeRectLive = useRef(resizeRect);
  resizeRectLive.current = resizeRect;

  const isResizing = resizeDir !== null;
  const isSideDragging = isResizing && resizeDir!.length === 1;

  /* NESTING + PATH-BASED SELECTION */

  // The one top-level box per group (lives in elementArr). Only it drags + gets
  // the purple outline. Anything spawned inside a parent has isChild = true.
  const isRoot = !isChild;
  // A parent/group when it carries children (render them instead of a Preview).
  const hasChildren = !!props.children?.length;
  // On the selected path: this box's full path is a prefix of the selected path.
  const onPath = path.length <= selectionPath.length && path.every((k, i) => selectionPath[i] === k);
  // The focus (deepest selected) when the selected path ends exactly at this box.
  const isFocus = onPath && selectionPath.length === path.length;

  // Corner treatment: components INSIDE a UI (children) are square; the root and
  // manual boxes are rounded. The root's content wrapper masks the UI's outer
  // corners (rounded + overflow-hidden), so the square children get clipped to a
  // rounded silhouette while internal divisions stay sharp.
  const roundCls = isChild ? 'rounded-none' : 'rounded-lg';

  // SELECTION-PATH STYLING. Every box on the selection path is "activated":
  // brighter color, a glow, and a slightly thicker border. Color is by role —
  // root UI = purple, nested sub-group = yellow, leaf = green; a standalone manual
  // box keeps blue. Groups draw their outline on a top overlay (groupOutlineCls);
  // leaves draw it on the box layers (leafBorderCls) + an inset glow when active.
  const leafBorderCls = isRoot
    ? (onPath ? 'border-2 border-borderactive' : 'border-2 border-borderinactive') // manual box: blue
    : (onPath ? 'border-2 border-bordergreen' : 'border border-borderchild');      // UI leaf: green / white
  const groupOutlineCls = isRoot
    ? (onPath ? 'border-4 border-bordergroup-active shadow-glow-purple' : 'border-[3px] border-bordergroup')
    : (onPath ? 'border-[3px] border-borderyellow shadow-glow-yellow' : 'border-2 border-borderchild');

  // Which box's overlay catches a click AND shields the Sandpack iframe beneath it.
  // A LEAF overlay is ALWAYS active in meta-edit mode — otherwise its iframe becomes
  // interactive once the focus moves off its parent. Drill-in is governed by GROUP
  // overlays: a group catches clicks until it's selected, then goes click-through so
  // the clicks fall to its children's overlays (one level at a time).
  const overlayActive = hasChildren ? !onPath : true;

  // Interact-mode leaf tiles bleed 1px past their cell to overlap neighbours and
  // cover the fractional-pixel seam between them (see UI_GENERATOR.md §6).
  const seamBleed = interactMode && isChild && !hasChildren;

  // Wired code (from the Path route) takes precedence over this leaf's own
  // generated code once its UI has been wired. undefined until then.
  const wired = wiredCode?.[props.key];
  const codeToShow = wired ?? generatedCode;

  // True while the Path route is rewiring this leaf (it isn't running its own gen
  // stream, so isGenerating stays false) — drives the shimmer for wiring feedback.
  const isWiring = !!wiringLeaves?.has(props.key);

  // Refs + viewport position for the popup menu (kept on-screen). Starts offscreen.
  const boxRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState<XY>({ x: -9999, y: -9999 });
  // Ref of block position, used for mouse up after drag ends
  const blockPosLiveRef = useRef<XY>(null);
  // Store offset from the initial mouseDown to the top left corner of the box
  const offset = useRef<XY>(defaultXY);
  // Helper to convert to block coords
  const pixToBlock = (p : number) => (Math.round(p/blockSize) + 1);
  // Helper to convert to pixels
  const blockToPix = (b : number) => ((b - 1) * blockSize);
  // Inverse of blockToPix for a length (in pixels) back to block dimensions
  const pixToBlockDim = (p : number) => (Math.round(p / blockSize) - 1);

  // Pixel dimensions of the box. While resizing, use the live rect so Preview
  // scales/reflows in real time; otherwise derive from the snapped block dims.
  const boxSize : XY = (isResizing && resizeRect)
    ? { x: resizeRect.width, y: resizeRect.height }
    : { x: blockToPix(blockDim.x + 2), y: blockToPix(blockDim.y + 2) };

  // Ref to the live position (is pixel value when accessed by handleMouseUp)
  blockPosLiveRef.current = {
    x: blockPos.x,
    y: blockPos.y
  }

  /* MAIN COMPONENT GENERATION HANDLER */

  // Look up this box's coherent UI style (if it belongs to a generated UI).
  // undefined for manual boxes -> the generate route applies its fallback style.
  const resolveStyle = (taskID? : number) =>
    taskID !== undefined ? styleSpec[taskID] : undefined;

  // This box's UI primitives (undefined for manual boxes and UIs without primitives), and
  // the part of them the generate route needs: the usable library + floors.
  const resolvePrims = (taskID? : number) =>
    taskID !== undefined ? primitiveSpec[taskID] : undefined;
  const leafPrims = (prims? : PrimitiveSet) : LeafPrimitives | undefined =>
    prims && { library: leafLibrary(prims), floors: prims.floors };

  // Finds and generates existing component in the registry or generates the ComponentDef for a custom component, sets the instance
  const handleUpdateNameAndSend = async (name : string, taskID? : number) => {
    let def = componentRegistry.find((d) => d.name === name) as ComponentDef;
    let registryList = componentRegistry; // To add in the new generated def immediately to use in handleSend without waiting for state setter

    // If the name isn't in the registry -> Custom name entered -> Updates the registry
    if (!def) {
      setIsLoadingSpec(true); // Sets loading wheel
      try {
        // Calls the custom component definition API route
        const res = await fetch('/api/spec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }), // Literally send the name of the custom component, could be "Fidget Spinner"
        });
        if (!res.ok) throw new Error('definition generation failed');

        // New definition created
        const createdDef = await res.json() as ComponentDef;
        setComponentRegistry((prev) => [...prev, createdDef]); // add to the shared registry (queues state setter)
        def = createdDef;
        registryList = [...componentRegistry, createdDef]; // update local list

      } catch (e) {
        console.error(e);
        setIsLoadingSpec(false);
        return;
      }

      setIsLoadingSpec(false); // Unsets loading wheel
    }

    // Next instance state for this box
    const next : ComponentInstance = { name, activeIdx: def.defaultActiveIdx }; // Initial active features get set to the default idxs
    setInstance(next);

    // Calls code setter with rebuild instuction prompt, initiates new code gen stream
    // THIS IS WHERE ALL COMPONENT DEFINITIONS -> CODE. style (if any) keeps this box visually
    // coherent with the rest of its generated UI.
    const prims = resolvePrims(taskID);
    handleSend(resolveComponent(next, registryList, prims), true, boxSize, resolveStyle(taskID), leafPrims(prims), { taskID, leafKey: props.key });
  }

  /* MAIN FEATURE HANDLER */

  // Toggle a feature on or off, updates the registry for custom features, sets the instance, fully regenerates component
  const handleUpdateFeatureAndSend = (toAdd : boolean, featureName : string) => {

    // Get the index from the registry of the feature given its name if it exists
    const featureIndex = (componentRegistry.find((d) => d.name === instance.name) as ComponentDef)
      ?.features.indexOf(featureName);

    // Meaning user is adding a new feature under the current component
    if (featureIndex === -1) {
      // Creates a local modified registry w/ custom feature used in both setting registry state and resolveComponent
      const registryList = componentRegistry.map((d) =>
      d.name === instance.name
        ? { ...d, features: [...d.features, featureName] }
        : d
      );

      // Calls setter for the registry to append new feature
      setComponentRegistry(registryList);

      const def = registryList.find((d) => d.name === instance.name);
      const index = def!.features.length - 1;
      const next : ComponentInstance = { ...instance, activeIdx: [...instance.activeIdx, index] };
      setInstance(next); // Modifies the instance

      // Calls code setter with rebuild instuction prompt and new appended registry, initiates new code gen stream
      const prims = resolvePrims(props.taskID);
      handleSend(resolveComponent(next, registryList, prims), true, boxSize, resolveStyle(props.taskID), leafPrims(prims), { taskID: props.taskID, leafKey: props.key });
      return;
    }

    // Modifies the instance to either include or exclude the feature in question
    // using local activeIdx to work around waiting for the instance setter
    const activeIdx = toAdd
      ? [...instance.activeIdx, featureIndex]
      : instance.activeIdx.filter((i) => i !== featureIndex);
    const next : ComponentInstance = { ...instance, activeIdx };
    setInstance(next);

    // Calls code setter with rebuild instuction prompt, initiates new code gen stream
    const prims = resolvePrims(props.taskID);
    handleSend(resolveComponent(next, componentRegistry, prims), true, boxSize, resolveStyle(props.taskID), leafPrims(prims), { taskID: props.taskID, leafKey: props.key });
  }

  /* AUTO GENERATION LOGIC (from UI generator) */

  // A box created by the UI generator carries its assigned
  // component name and generates itself once on mount. Its spec is already in the
  // registry (the generator committed setComponentRegistry before creating boxes)
  useEffect(() => {
    if (props.autoName) {
      handleUpdateNameAndSend(props.autoName, props.taskID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Targeting groundwork: the first time this box generates it stops being an
  // empty drop-target. Only top-level boxes live in elementArr, so only they report.
  useEffect(() => {
    if (isGenerating && isRoot) markNonEmpty?.(props.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating]);

  // Code hoist: whenever a UI leaf FINISHES generating, report its final code up so
  // SpatialGrid can collect the whole UI (keyed by taskID) and wire it. Fires on
  // first gen and on every re-gen (customization), keeping the collected code fresh.
  // Only UI leaves (props.autoName) participate; manual boxes never wire.
  useEffect(() => {
    if (!isGenerating && props.autoName && generatedCode) reportCode?.(props.key, generatedCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating]);

  /* MAIN PHYSICAL/VISUAL LOGIC */

  // Reopen the menu whenever this box becomes the selected one (selecting it
  // fresh or re-selecting after a deselect always shows the menu).
  useEffect(() => {
    if (isFocus) setMenuOpen(true);
  }, [isFocus]);

  // Mousedown handler for the ROOT box (its outer div + its own overlay). A
  // child's overlay does NOT stopPropagation, so a click inside a selected group
  // also bubbles here — that's how a body-drag moves the whole group while a
  // child stays clickable (drag vs. drill-in is resolved on mouseup by didDrag).
  const handleMouseDown = (e : React.MouseEvent) => {
    if (e.button !== 0) return;                      // left button only; right-click = grid context menu
    e.stopPropagation();                            // keep the grid from deselecting/creating
    if (!onPath) setSelectionPath(path);            // select this root (skipped if a child of it was clicked)
    if (isFocus && !hasChildren) setMenuOpen((prev) => !prev); // re-click a focused leaf toggles its menu
    setIsMouseDragging(true);                       // arm a (root-only) drag

    // Remove offset of grid from window
    const rect = gridRef.getBoundingClientRect();
    const localPos : XY = { x: e.clientX - rect.left, y: e.clientY - rect.top};

    // Set the offset in pixels
    offset.current = {
      x: localPos.x - blockToPix(blockPos.x),
      y: localPos.y - blockToPix(blockPos.y)
    }

    // When move -> Inject block pos with actual pixel values (INITIAL SET)
    setBlockPos({
        x: localPos.x - offset.current.x,
        y: localPos.y - offset.current.y
    });
  }

  // Mousedown handler for a CHILD's click-overlay: drill the selection into this
  // child, or: Deliberately does NOT stopPropagation so it bubbles to the root's
  // handler, arming a potential group-move that mouseup resolves.
  const handleChildDown = (e : React.MouseEvent) => {
    if (e.button !== 0) return; // Prevents pendingDrillPath from stashing a potential selection (so future drills start fresh) if you right clicked with a group selected
    // Record the pending drill but doesn't commit it here; the root commits it on MOUSEUP if it wasn't a drag
    pendingDrillPath = path;
  }

  // Start a resize from a handle; dir is a compass string like 'e','se','n'
  const handleResizeDown = (e : React.MouseEvent, dir : string) => {
    e.stopPropagation(); // Don't trigger box move-drag or grid deselect
    // Current box rect in grid-relative pixels
    const rect = {
      left: blockToPix(blockPos.x),
      top: blockToPix(blockPos.y),
      width: blockToPix(blockDim.x + 2),
      height: blockToPix(blockDim.y + 2),
    };
    resizeStart.current = { mx: e.clientX, my: e.clientY, rect };
    setResizeRect(rect);
    setResizeDir(dir);
  }

  // Drag effect
  useEffect(()=>{
    let didDrag = false; // Used to stop submenus opening after a drag
    const handleMouseMove = (e: MouseEvent) => {
      didDrag = true;
      // Remove offset of grid from window
      const rect = gridRef.getBoundingClientRect();
      const localPos : XY = { x: e.clientX - rect.left, y: e.clientY - rect.top};

      // Box pixel size, used to clamp it within the grid bounds (no off-screen)
      const boxW = blockToPix(blockDim.x + 2);
      const boxH = blockToPix(blockDim.y + 2);

      // When move -> Inject clamped pixel position so the box stays on the grid
      setBlockPos({
        x: Math.max(0, Math.min(localPos.x - offset.current.x, rect.width - boxW)),
        y: Math.max(0, Math.min(localPos.y - offset.current.y, rect.height - boxH))
      });
    }
    const handleMouseUp = (e: MouseEvent) => {
      // Convert the pixel positions back into block positions after drag
      const newPos = {
        x: pixToBlock(blockPosLiveRef.current!.x),
        y: pixToBlock(blockPosLiveRef.current!.y)
      };
      setBlockPos(newPos);

      if (didDrag) {
        setMenuOpen(false); // Prevent the cycling of open/closing the menu after drag -> Just close it
        // A body-drag on a group is a MOVE, not a drill-in: snap the selection
        // back to this root so a child clicked to start the drag isn't left focused.
        if (hasChildren) setSelectionPath(path);
        // Persist the new position to elementArr so ungroup (and anything reading
        // the box's coords) uses where it is NOW, not where it spawned. A move keeps
        // size, so blockDim is unchanged.
        if (isRoot) syncBounds?.(props.key, { colStart: newPos.x, colEnd: newPos.x + blockDim.x, rowStart: newPos.y, rowEnd: newPos.y + blockDim.y });
      } else if (pendingDrillPath) {
        // A click (no drag) on a child -> commit the drill NOW, on mouseup.
        setSelectionPath(pendingDrillPath);
      }
      pendingDrillPath = null; // always clear the scratch at the end of the interaction
      setIsMouseDragging(false);
    }
    
    // Attach event listeners
    if (isMouseDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMouseDragging])

  // Resize effect (mirrors the drag effect above)
  useEffect(() => {
    if (!resizeDir) return;
    const start = resizeStart.current!;
    const isCorner = resizeDir.length === 2;
    const minSize = blockSize;

    const handleResizeMove = (e : MouseEvent) => {
      const dx = e.clientX - start.mx;
      const dy = e.clientY - start.my;
      let { left, top, width, height } = start.rect;
      const right = start.rect.left + start.rect.width;
      const bottom = start.rect.top + start.rect.height;

      if (isCorner) {
        // Aspect-locked zoom: move the dragged corner along the box's diagonal.
        // Projecting the mouse delta onto the diagonal keeps the scale factor a
        // continuous function of the cursor, so it never jumps.
        const dirX = resizeDir.includes('e') ? dx : -dx;
        const dirY = resizeDir.includes('s') ? dy : -dy;
        const W = start.rect.width, H = start.rect.height;
        let s = 1 + (dirX * W + dirY * H) / (W * W + H * H);
        s = Math.max(s, minSize / W, minSize / H);
        width = W * s;
        height = H * s;
        if (resizeDir.includes('w')) left = right - width;
        if (resizeDir.includes('n')) top = bottom - height;
      } else {
        // Single axis -> reflow
        if (resizeDir.includes('e')) width = Math.max(minSize, start.rect.width + dx);
        if (resizeDir.includes('s')) height = Math.max(minSize, start.rect.height + dy);
        if (resizeDir.includes('w')) { width = Math.max(minSize, start.rect.width - dx); left = right - width; }
        if (resizeDir.includes('n')) { height = Math.max(minSize, start.rect.height - dy); top = bottom - height; }
      }
      setResizeRect({ left, top, width, height });
    }

    const handleResizeUp = () => {
      // Snap the live pixel rect back to block units, then exit resize mode
      const r = resizeRectLive.current!;
      const newPos = { x: pixToBlock(r.left), y: pixToBlock(r.top) };
      const newDim = { x: pixToBlockDim(r.width), y: pixToBlockDim(r.height) };
      setBlockPos(newPos);
      setBlockDim(newDim);
      setResizeDir(null);
      setResizeRect(null);
      // Keep elementArr's coords in sync with the resized box (top-level only).
      if (isRoot) syncBounds?.(props.key, { colStart: newPos.x, colEnd: newPos.x + newDim.x, rowStart: newPos.y, rowEnd: newPos.y + newDim.y });
    }

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeUp);
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeUp);
      document.body.style.userSelect = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizeDir])

  // Whether either of the popup menu should currently be shown. Only the focused
  // (deepest selected) LEAF shows it — a group is a container, not a component.
  const showPopup = isFocus && !hasChildren && menuOpen && !isMouseDragging && !isResizing && !interactMode;

  // Position the popup beside the box (preferring the right, then left), and if
  // there's no room beside it (e.g. a wide header) drop it below/above. Always
  // clamped to stay fully on screen. useLayoutEffect (not useEffect) so the
  // measure-and-place happens before paint — otherwise the popup flashes at its
  // stale position for one frame before snapping into place.
  useLayoutEffect(() => {
    if (!showPopup) return;

    const place = () => {
      if (!boxRef.current || !popupRef.current) return;
      const box = boxRef.current.getBoundingClientRect();
      const pop = popupRef.current.getBoundingClientRect();
      const gap = 8;
      const vw = window.innerWidth, vh = window.innerHeight;
      const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi));

      let x: number, y: number;
      if (box.right + gap + pop.width <= vw) {        // room on the right (preferred)
        x = box.right + gap;
        y = clamp(box.top, 0, vh - pop.height);
      } else if (box.left - gap - pop.width >= 0) {   // else room on the left
        x = box.left - gap - pop.width;
        y = clamp(box.top, 0, vh - pop.height);
      } else {                                         // no room beside -> below, else above
        y = box.bottom + gap + pop.height <= vh ? box.bottom + gap : box.top - gap - pop.height;
        x = clamp(box.left, 0, vw - pop.width);
      }
      setPopupPos({ x: clamp(x, 0, vw - pop.width), y: clamp(y, 0, vh - pop.height) });
    };

    place();
    // Keep it attached/on-screen as the page scrolls or the window resizes
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [showPopup, instance, isLoadingSpec, blockPos, blockDim, blockSize]);


  // Conditional behavior depending on if its being dragged
  const boxDivProp = interactMode ? {
    // Interact mode: stay placed in the grid, no meta interaction. pointer-events-auto
    // re-enables the component (the grid overlay is pointer-events-none).
    className : 'relative pointer-events-auto',
    style : {
        gridColumn: `${blockPos.x} / ${blockPos.x + 1 + blockDim.x}`,
        gridRow: `${blockPos.y} / ${blockPos.y + 1 + blockDim.y}`
    },
  } : (isResizing && resizeRect) ? {
    // If being resized, position/size freely from the live pixel rect
    className : 'absolute',
    style : {
        top: resizeRect.top,
        left: resizeRect.left,
        width: resizeRect.width,
        height: resizeRect.height
    },
  } : isMouseDragging ? {
    // If being dragged, do not snap to grid
    className : 'absolute',
    style : {
        top: blockPos.y,
        left: blockPos.x,
        width: blockToPix(blockDim.x + 2),
        height: blockToPix(blockDim.y + 2)
    },
  } : {
    // If not dragged, snap to grid and display in grid. Only the root wires
    // onMouseDown (drag/select); a child's clicks arrive via its overlay, which
    // bubbles up to here for group-move.
    className : 'relative pointer-events-auto',
    style : {
        gridColumn: `${blockPos.x} / ${blockPos.x + 1 + blockDim.x}`,
        gridRow: `${blockPos.y} / ${blockPos.y + 1 + blockDim.y}`
    },
    onMouseDown: isRoot ? handleMouseDown : undefined // Adds clicked-on logic (root only)
  }
  

  return (
    /* GENERATED BOX */
    <div
      ref={boxRef}
      {...boxDivProp}
    >
      {/* STYLING (two layers because shadows don't work with backdrop blur).
          Borders/shadow/frosting are hidden in interact mode for a clean look. A
          group drops the frosting (children show through) and draws its purple
          outline ON TOP (below). Nested components carry no glow so internal
          divisions stay crisp; the group's border lives in the top overlay. */}
      {!interactMode && (
        <div className={`absolute inset-0 ${(isRoot && !hasChildren) ? 'shadow-custom' : ''} ${roundCls} ${hasChildren ? '' : leafBorderCls}`}/>
      )}
      {/* For a group, this content wrapper is the rounding MASK: rounded +
          overflow-hidden clips the square children so only the UI's outermost
          corners round off. */}
      <div
        className={`flex justify-center items-center size-full overflow-hidden z-10 ${roundCls} ${(interactMode || hasChildren) ? '' : `backdrop-blur-sm ${leafBorderCls} bg-emptycomponent/40`}`}
        style={seamBleed ? { width: 'calc(100% + 1px)', height: 'calc(100% + 1px)' } : undefined}
      >

        {hasChildren ? (
          // Parent (group): an inner CSS grid that fills this box. 1fr tracks
          // scale with the box (and with blockSize on window resize), so nested
          // children render pixel-identical to sitting on the main grid.
          <div
            className="grid size-full"
            style={{
              gridTemplateColumns: `repeat(${blockDim.x + 1}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${blockDim.y + 1}, minmax(0, 1fr))`,
            }}
          >
            {props.children!.map((child) => (
              <GeneratedBox
                key={child.key}
                props={child}
                isChild={true}
                path={[...path, child.key]}
                selectionPath={selectionPath}
                setSelectionPath={setSelectionPath}
                blockSize={blockSize}
                gridRef={gridRef}
                interactMode={interactMode}
                componentRegistry={componentRegistry}
                setComponentRegistry={setComponentRegistry}
                styleSpec={styleSpec}
                primitiveSpec={primitiveSpec}
                reportCode={reportCode}
                wiredCode={wiredCode}
                wiringLeaves={wiringLeaves}
              />
            ))}
          </div>
        ) : (isGenerating || isWiring) ? (
          <div className="flex justify-center items-center animate-vertical-shimmer size-full rounded-lg bg-neutral-900 border border-white/5">
            {/* Generating (own stream) | Wiring (Path route) | Empty | Preview */}
            <span>{isWiring && !isGenerating ? 'wiring...' : 'generating...'}</span>
          </div>
        ) : (codeToShow == "") ? (
          <span>empty</span>
        ) : (
          <Preview
            // Remount (fresh iframe) when this leaf becomes wired or its wiring
            // changes, so the injected bus re-initializes and re-registers cleanly.
            key={wired ? `w${wired.length}` : 'gen'}
            code={codeToShow}
            boxSize={boxSize}
            isSideDragging={isSideDragging}
            taskID={props.taskID}
            primitives={resolvePrims(props.taskID)?.code}
          />
        )}

      </div>

      {/* VISUAL / POINTER SHIELDS AND OVERLAYS */}

      {/* Group outline drawn ON TOP of the children (above the mask) so it traces
          the rounded UI silhouette and isn't covered by the corner components.
          Brighter + thicker + glowing when the group is on the selection path.
          Click-through so it never blocks selection/drill-in. */}
      {!interactMode && hasChildren && (
        <div className={`absolute inset-0 z-20 ${roundCls} ${groupOutlineCls} pointer-events-none`}/>
      )}

      {/* Activated leaf: an inset glow ring on top of the preview (the green
          border lives on the box layers; this adds the "glow"). Inset so it stays
          contained and never bleeds over neighbouring components. Click-through. */}
      {!interactMode && isChild && !hasChildren && onPath && (
        <div className={`absolute inset-0 z-20 ${roundCls} pointer-events-none shadow-glow-green`}/>
      )}

      {/* A transparent overlay above the preview captures clicks for
          select/move/drill-in, since the Sandpack iframe would otherwise swallow
          them. pointer-events toggles by overlayActive: a group yields this
          surface to its children once it's ON the selection path (overlayActive =
          !onPath); a leaf overlay is ALWAYS active, so clicks reach it only when
          its ancestor groups have gone click-through. Absent in interact mode. */}
      {!interactMode && (
        <div
          onMouseDown={isChild ? handleChildDown : handleMouseDown}
          className={`absolute inset-0 z-10 ${isRoot ? 'cursor-grab' : 'cursor-pointer'} ${overlayActive ? 'pointer-events-auto' : 'pointer-events-none'}`}
        />
      )}

      {/* Drag shield: while dragging/resizing, cover the whole viewport (above
          every iframe) so mousemove/mouseup always reach the document, instead
          of being swallowed by a Sandpack iframe the cursor passes over. */}
      {(isMouseDragging || isResizing) && (
        <div
          className="fixed inset-0 z-9999 pointer-events-auto"
          style={{ cursor: isMouseDragging ? 'grabbing' : 'default' }}
        />
      )}

      {/* Resize handles (sides reflow, corners zoom). Stop propagation so they
          don't trigger the box move-drag or grid deselect. Only a selected
          standalone manual box resizes — groups and children never do. */}
      {(onPath && !isMouseDragging && isRoot && !hasChildren && !isGenerating) && RESIZE_HANDLES.map((h) => (
        <div
          key={h.dir}
          onMouseDown={(e) => handleResizeDown(e, h.dir)}
          className={`absolute ${h.cls} ${h.dir.length === 2 ? 'z-30 bg-borderactive rounded-sm' : 'z-20'}`}
          style={{ cursor: h.cursor }}
        />
      ))}

      {/* MENUS */}

      {/* Popup menu: pick a type first, then customize once a type is chosen.
          Positioned in viewport coords (see effect) to always stay on screen. */}
      {showPopup && (
        <div
          ref={popupRef}
          className="fixed z-50"
          style={{ top: popupPos.y, left: popupPos.x }} // Logic behind the popup not being offscreen
          onMouseDown={(e) => e.stopPropagation()} // Don't let popup clicks reselect/drag the box
        >
          {/* Empty component -> Show component menu */}
          {instance.name === '' ? (
            <ComponentSelector
              names={componentRegistry.map((d) => d.name)}
              loading={isLoadingSpec} // Passes down loading state
              onSend={handleUpdateNameAndSend} // pick component -> generate it -> populate Preview
            />
          ) : (
            // Current component-specific features, shown after a component populates the box
            <CustomizationSelector
              instance={instance}
              componentRegistry={componentRegistry}
              onSend={handleUpdateFeatureAndSend} // (toAdd, name) -> regenerate w/ new feature
            />
          )}
        </div>
      )}

    </div>
  );
}