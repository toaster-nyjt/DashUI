import { GeneratedBoxProps, XY, defaultXY, CompSpec, DefaultCompSpec } from '../utils/spec';
import { useGetCode } from '../utils/useGetCode';
import { resolveComponentSpec } from '../utils/helpers';
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
export default function GeneratedBox({ props, path, selectionPath, setSelectionPath, blockSize, gridRef, interactMode, defaultSpec, setDefaultSpec, isChild = false, markNonEmpty, syncBounds }
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
      defaultSpec : DefaultCompSpec[]
      setDefaultSpec : React.Dispatch<React.SetStateAction<DefaultCompSpec[]>>
      // True for any box rendered inside a parent (any depth). Only the root (false) drags.
      isChild? : boolean
      // Targeting groundwork: a box reports when it first generates (no longer empty).
      markNonEmpty? : (key : string) => void
      // Persist a moved/resized box's new block coords back to elementArr (top-level
      // only) so consumers like ungroup read where it IS, not where it spawned.
      syncBounds? : (key : string, b : { colStart : number; colEnd : number; rowStart : number; rowEnd : number }) => void
    }) {

  /* DATA LAYER STATE VARS */

  // The chosen component type + active customizations for this box
  const [compSpec, setCompSpec] = useState<CompSpec>({ name: '', specArrIdx: [] });
  // True while the LLM generates a customization preset for a custom component
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
  // cover the fractional-pixel seam between them (see DASHBOARD_GENERATOR.md §6).
  const seamBleed = interactMode && isChild && !hasChildren;

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

  // Finds and generates existing component in default or generates the DefaultCompSpec for a custom component, sets compSpec
  const handleUpdateNameAndSend = async (name : string) => {
    let def = defaultSpec.find((d) => d.name === name) as DefaultCompSpec; 
    let specList = defaultSpec; // To add in the new generated spec immediately to use list in handleSend without waiting for state setter

    // If the name isn't in default spec list -> Custom name entered -> Updates default spec
    if (!def) {
      setIsLoadingSpec(true); // Sets loading wheel
      try {
        // Calls the spec custom component instructions API route
        const res = await fetch('/api/spec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }), // Literally send the name of the custom component, could be "Fidget Spinner"
        });
        if (!res.ok) throw new Error('spec generation failed');

        // New spec created
        const createdSpec = await res.json() as DefaultCompSpec;
        setDefaultSpec((prev) => [...prev, createdSpec]); // add to the shared registry (queues state setter)
        def = createdSpec;
        specList = [...defaultSpec, createdSpec]; // update local list

      } catch (e) {
        console.error(e);
        setIsLoadingSpec(false);
        return;
      }

      setIsLoadingSpec(false); // Unsets loading wheel
    }

    // Next spec state for this box
    const next : CompSpec = { name, specArrIdx: def.spec.defaultSpecArrIdx }; // Initial active customizations get set to the default idxs
    setCompSpec(next);

    // Calls code setter with rebuild instuction prompt, initiates new code gen stream
    // THIS IS WHERE ALL COMPONENT SPECS -> CODE
    handleSend(resolveComponentSpec(next, specList), true, boxSize);
  }

  /* MAIN CUSTOMIZATION (SPEC) HANDLER */ 

  // Toggle a customization on or off, updates default spec for custom customizations, sets compSpec fully regenerates component
  const handleUpdateSpecAndSend = (toAdd : boolean, specName : string) => {

    // Get the index from default spec list of spec given its name if it exists
    const specNameIndex = (defaultSpec.find((d) => d.name === compSpec.name) as DefaultCompSpec)
      ?.spec.specArr.indexOf(specName);
    
    // Meaning user is adding a new customization under the current component
    if (specNameIndex === -1) {
      // Creates a local modified defaultSpec w/ custom spec used in both setting default spec state and resolveComponentSpec
      const specList = defaultSpec.map((d) =>
      d.name === compSpec.name
        ? { ...d, spec: { ...d.spec, specArr: [...d.spec.specArr, specName] } }
        : d
      );

      // Calls setter for defaultSpec to append new customization
      setDefaultSpec(specList);

      const def = specList.find((d) => d.name === compSpec.name);
      const index = def!.spec.specArr.length - 1;
      const next : CompSpec = { ...compSpec, specArrIdx: [...compSpec.specArrIdx, index] };
      setCompSpec(next); // Modifies compSpec

      // Calls code setter with rebuild instuction prompt and new appended spec list, initiates new code gen stream
      handleSend(resolveComponentSpec(next, specList), true, boxSize);
      return;
    }
    
    // Modifies compSpec to either include or exclude the customization in question
    // using local specArrIdx to work around waiting for compSpec setter
    const specArrIdx = toAdd 
      ? [...compSpec.specArrIdx, specNameIndex]
      : compSpec.specArrIdx.filter((i) => i !== specNameIndex);
    const next : CompSpec = { ...compSpec, specArrIdx };
    setCompSpec(next);

    // Calls code setter with rebuild instuction prompt, initiates new code gen stream
    handleSend(resolveComponentSpec(next, defaultSpec), true, boxSize);
  }

  /* AUTO GENERATION LOGIC (from dashboard generator) */

  // A box created by the dashboard generator carries its assigned
  // component name and generates itself once on mount. Its spec is already in the
  // registry (the generator committed setDefaultSpec before creating boxes), so
  useEffect(() => {
    if (props.autoName) {
      handleUpdateNameAndSend(props.autoName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Targeting groundwork: the first time this box generates it stops being an
  // empty drop-target. Only top-level boxes live in elementArr, so only they report.
  useEffect(() => {
    if (isGenerating && isRoot) markNonEmpty?.(props.key);
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
  }, [showPopup, compSpec, isLoadingSpec, blockPos, blockDim, blockSize]);


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
                defaultSpec={defaultSpec}
                setDefaultSpec={setDefaultSpec}
              />
            ))}
          </div>
        ) : isGenerating ? (
          <div className="flex justify-center items-center animate-vertical-shimmer size-full rounded-lg bg-neutral-900 border border-white/5">
            {/* Generating | Empty | Showing code preview */}
            <span>generating...</span>
          </div>
        ) : (generatedCode == "") ? (
          <span>empty</span>
        ) : (
          <Preview
            code={generatedCode}
            boxSize={boxSize}
            isSideDragging={isSideDragging}
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
          {compSpec.name === '' ? (
            <ComponentSelector
              names={defaultSpec.map((d) => d.name)}
              loading={isLoadingSpec} // Passes down loading state
              onSend={handleUpdateNameAndSend} // pick component -> generate it -> populate Preview
            />
          ) : (
            // Current component-specific customizations, shown after a component populates the box
            <CustomizationSelector
              compSpec={compSpec}
              defaultSpec={defaultSpec}
              onSend={handleUpdateSpecAndSend} // (toAdd, name) -> regenerate w/ new customization spec
            />
          )}
        </div>
      )}

    </div>
  );
}