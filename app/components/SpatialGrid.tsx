'use client'
import { useRef, useEffect, useState } from 'react';
import GeneratedBox from './GeneratedBox';
import { XY, defaultXY, GeneratedBoxProps, DefaultCompSpec, Placement, numGridBlocksWide, numVHTall } from '../utils/spec';
import { DEFAULT_SPEC } from '../utils/defaultSpec';
import { validateLayout, logDefaultSpec, resolveComponentSpec } from '../utils/helpers';

// How many times to re-ask the layout route for a valid (gap-free) tiling
const LAYOUT_RETRIES = 3;

export default function SpacialGrid({ interactMode, taskRequest, setIsDesigning, setHasEmptyTarget }
  : { interactMode: boolean; taskRequest: { prompt: string; id: number } | null; setIsDesigning: React.Dispatch<React.SetStateAction<boolean>>; setHasEmptyTarget: React.Dispatch<React.SetStateAction<boolean>> }) {
  /* STATE/REF VARS */

  // Used for dragging logic
  const [isMouseDragging, setIsMouseDragging] = useState<boolean>(false);
  // Initializes on mouse down -> Calculates box dimensions
  const initMousePosition = useRef<XY>(defaultXY);
  // Dimensions of the box that is created from dragging
  const [boxDimensions, setBoxDimensions] = useState<XY>(defaultXY);
  // Position of the box
  const boxPosition = useRef<XY>(defaultXY);
  // To get the relative x and y position of cursor if grid becomes embedded
  const gridRef = useRef<HTMLDivElement>(null); 
  // To enable its calculation within a useEffect
  const [gridBlockSize, setGridBlockSize] = useState<number>(0);
  // Canvas pixel width (= viewport width at 100% zoom), set explicitly so a browser
  // zoom is NOT re-fitted away: on zoom the canvas keeps its px width and the document
  // provides a viewport-anchored horizontal scrollbar (see DASHBOARD_GENERATOR.md §6).
  const [canvasWidth, setCanvasWidth] = useState<number>(0);
  // Tracks created elements
  const [elementArr, setElementArr] = useState<GeneratedBoxProps[]>([]);
  // Tracks the currently generated element
  const currElement = useRef<GeneratedBoxProps>(null);
  // The currently selected path: keys from the top-level box down to the deepest
  // drilled-in box. Empty = nothing selected. Variable-length so nested groups
  // can be drilled into to any depth (selectionPath[0] is always the top-level box).
  const [selectionPath, setSelectionPath] = useState<string[]>([]);

  // Right-click context menu over the selected root group: an "Ungroup" button at
  // the cursor (grid-relative coords) + which root it targets. null = closed.
  const [ungroupMenu, setUngroupMenu] = useState<{ x: number; y: number; rootKey: string } | null>(null);


  /* SPEC MODIFIERS */

  // Shared, runtime-extendable registry of components + customizations
  // Passed down to all boxes
  const [defaultSpec, setDefaultSpec] = useState<DefaultCompSpec[]>(DEFAULT_SPEC);

  // Per-UI style registry: taskRequest.id (styleID) -> the coherent visual style
  // produced for that whole generated dashboard. Every box of a generated UI
  // carries its styleID and looks its style up here, so independently generated
  // components share one identity. Passed down to all boxes (like defaultSpec).
  const [styleSpec, setStyleSpec] = useState<Record<number, string>>({});

  // Dev: print the component registry on mount and whenever it changes.
  useEffect(() => {
    logDefaultSpec(defaultSpec);
  }, [defaultSpec]);


  /* DASHBOARD GENERATOR (task prompt -> plan -> layout -> auto boxes) */

  // Calls the layout route and re-asks (feeding back the validation error) until
  // it returns a tiling that fully covers the window with no gaps/overlaps.
  const fetchValidLayout = async (task: string, components: DefaultCompSpec[], cols: number, rows: number): Promise<Placement[] | null> => {
    let previousError: string | undefined;
    for (let attempt = 1; attempt <= LAYOUT_RETRIES; attempt++) {
      try {
        const res = await fetch('/api/layout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Send the FULL specs so layout has complete context
          body: JSON.stringify({ task, components, cols, rows, previousError }),
        });
        if (!res.ok) throw new Error(`request failed (${res.status})`);
        const placements = await res.json() as Placement[];

        const { ok, error } = validateLayout(placements, cols, rows);
        if (ok) return placements;

        previousError = error;
        console.error(`Layout attempt ${attempt}/${LAYOUT_RETRIES} invalid: ${error}`);
      } catch (e) {
        previousError = e instanceof Error ? e.message : String(e);
        console.error(`Layout attempt ${attempt}/${LAYOUT_RETRIES} errored:`, e);
      }
    }
    console.error(`Layout failed after ${LAYOUT_RETRIES} attempts. Last error: ${previousError}`);
    return null;
  };

  // Full pipeline: decompose the task into component specs, register them, lay
  // them out across the visible window, then drop in self-generating boxes.
  const runDashboardGeneration = async (task: string, target: GeneratedBoxProps | null): Promise<GeneratedBoxProps | null> => {
    setIsDesigning(true);
    try {
      // 0. TARGET BOUNDS + PIXEL AREA: generate WITHIN a selected empty box if there
      //    is one; otherwise fill the whole VISIBLE window. Computed FIRST so the
      //    planner can scale its decisions to the actual available pixel area. The
      //    parent box occupies these bounds; the layout tiles its w x h interior in
      //    LOCAL coords (1..w / 1..h), which drop straight into the parent's inner grid.
      const colStart = target ? target.colStart : 1;
      const rowStart = target ? target.rowStart : 1;
      const colEnd = target ? target.colEnd : numGridBlocksWide;
      const rowEnd = target ? target.rowEnd : Math.max(1, Math.floor(window.innerHeight / (gridBlockSize || 1)));
      const w = colEnd - colStart + 1;
      const h = rowEnd - rowStart + 1;
      const widthPx = Math.round(w * gridBlockSize);   // available pixel area for the planner
      const heightPx = Math.round(h * gridBlockSize);

      // 1. PLAN: task + available pixel area -> functionality and space aware. The
      //    planner only splits into multiple components if the area justifies it.
      const planRes = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, width: widthPx, height: heightPx }),
      });
      if (!planRes.ok) throw new Error(`plan request failed (${planRes.status})`);
      const specs = await planRes.json() as DefaultCompSpec[];
      if (!specs.length) throw new Error('planner returned no components');

      // 1b. STYLE: derive ONE coherent visual style for this whole UI from its
      //     components, so every box generates with a matching identity. The styler
      //     gets the specs RESOLVED to the same { name, genInstructions, include,
      //     exclude } protocol shape the generator sees per component (active set =
      //     each preset's defaults). Always called for an auto-gen UI; only manual
      //     boxes (no styleID) skip a style and get the generate route's fallback.
      const resolvedSpecs = specs.map((s) =>
        JSON.parse(resolveComponentSpec({ name: s.name, specArrIdx: s.spec.defaultSpecArrIdx }, specs)));
      const styleRes = await fetch('/api/style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, components: resolvedSpecs }),
      });
      if (!styleRes.ok) throw new Error(`style request failed (${styleRes.status})`);
      const style = (await styleRes.json()).style as string;

      // 2. Register the new presets + this UI's style. The awaited layout call
      //    below lets this state commit before any boxes are created, so each box
      //    mounts with a defaultSpec prop that already contains its spec (no
      //    /api/spec re-fetch) and a styleSpec that already holds its style.
      setDefaultSpec((prev) => [...prev, ...specs]);
      setStyleSpec((prev) => ({ ...prev, [taskRequest!.id]: style }));

      // 3. LAYOUT: tile the box interior (w x h).
      const placements: Placement[] | null = specs.length === 1
        // Single component -> fill the whole box (nothing to tile/validate).
        ? [{ name: specs[0].name, colStart: 1, colEnd: w, rowStart: 1, rowEnd: h }]
        // Multiple -> ask the layout route to tile the box interior (w x h).
        : await fetchValidLayout(task, specs, w, h);
      if (!placements) return null; // exhausted retries; already logged

      // 4. Wrap the placements as CHILDREN of ONE parent (group) box. Each child
      //    keeps its local coords + autoName and self-generates on mount.
      const parentKey = `group-${taskRequest!.id}`;
      const children: GeneratedBoxProps[] = placements.map((p, i) => ({
        colStart: p.colStart,
        colEnd: p.colEnd,
        rowStart: p.rowStart,
        rowEnd: p.rowEnd,
        key: `${parentKey}-child-${i}`,
        autoName: p.name, // Lets the leaf box know to self-generate
        isChild: true,
        styleID: taskRequest!.id, // Key into styleSpec -> this UI's shared style
      }));

      // The parent occupies the target bounds (drawn box or full window); the
      // effect appends it to elementArr (replacing the targeted empty box).
      return { colStart, colEnd, rowStart, rowEnd, key: parentKey, children };
    } catch (e) {
      console.error('Dashboard generation error:', e);
      return null;
    } finally {
      setIsDesigning(false);
    }
  };

  // The selected box, if it's an empty generation target: a task submitted now will
  // FILL this box instead of the window. This single derived value drives both the
  // actual targeting (task effect below) and the Taskbar's blue "targeting" highlight.
  const emptyTarget = elementArr.find((el) => el.key === selectionPath[0] && el.isEmpty) ?? null;

  // Mirror "an empty box is targeted" up to the Taskbar so it can show the same blue
  // highlight a selected single-component box gets, signalling where the UI will land.
  useEffect(() => {
    setHasEmptyTarget(!!emptyTarget);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!emptyTarget]);

  // Run the generator whenever a new task is submitted from the Taskbar, then
  // append the single parent box it produced (the push is the separate step,
  // outside runDashboardGeneration, per the design).
  useEffect(() => {
    if (taskRequest && taskRequest.prompt.trim()) {
      // Generate INTO a selected empty box if there is one, else fill the window.
      const target = emptyTarget;
      runDashboardGeneration(taskRequest.prompt.trim(), target)
        .then((parent) => {
          if (!parent) return;
          // Replace the targeted empty box (if any) with the generated group.
          setElementArr((prev) => [...prev.filter((el) => el.key !== target?.key), parent]);
          if (target) setSelectionPath([]);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskRequest?.id]);


  /* SELECTION-DRIVEN HELPERS (empty tracking + ungroup) */

  // Targeting groundwork: a box reports the first time it generates -> it's no
  // longer an empty drop-target for multi-component UI call. Only top-level boxes live in elementArr.
  const markNonEmpty = (key: string) =>
    setElementArr((prev) => prev.map((el) => (el.key === key ? { ...el, isEmpty: false } : el)));

  // Persist a moved/resized top-level box's new block coords back to elementArr, so
  // any consumer reading from elementArr uses its CURRENT position, not where it
  // spawned. (A box's live position otherwise lives only in GeneratedBox state after
  // creation.) Two consumers depend on this: ungroup (flattening a moved group to
  // global coords) and empty-box targeting (runDashboardGeneration places the new UI
  // at a target box's bounds). Runs for ALL top-level boxes incl. manual ones — a
  // manual empty box can be moved/resized before being used as a generation target.
  const syncBounds = (key: string, b: { colStart: number; colEnd: number; rowStart: number; rowEnd: number }) =>
    setElementArr((prev) => prev.map((el) => (el.key === key ? { ...el, ...b } : el)));

  // Recursively flatten a group: every leaf descendant becomes a top-level box at
  // GLOBAL coords (local coords + each ancestor's accumulated origin offset), with
  // isChild cleared so it rejoins the main grid. Used in ungroup
  const flattenToGlobal = (box: GeneratedBoxProps, baseCol: number, baseRow: number): GeneratedBoxProps[] => {
    const g = {
      colStart: box.colStart + baseCol, colEnd: box.colEnd + baseCol,
      rowStart: box.rowStart + baseRow, rowEnd: box.rowEnd + baseRow,
    };
    if (!box.children?.length) return [{ ...box, ...g, isChild: false, children: undefined }];
    // This box's children are local to its origin -> base for them is its global origin - 1.
    return box.children.flatMap((c) => flattenToGlobal(c, g.colStart - 1, g.rowStart - 1));
  };

  // Ungroup a top-level group: replace it in elementArr with its flattened leaves.
  // Triggered by the right-click "Ungroup" button (below).
  const ungroup = (parent: GeneratedBoxProps) => {
    if (!parent.children?.length) return;
    const freed = parent.children.flatMap((c) => flattenToGlobal(c, parent.colStart - 1, parent.rowStart - 1));
    setElementArr((prev) => [...prev.filter((el) => el.key !== parent.key), ...freed]);
    setSelectionPath([]);
  };


  /* MAIN PHYSICAL/VISUAL LOGIC */

  // Entering interact mode deselects any selected box
  useEffect(() => {
    if (interactMode) setSelectionPath([]);
  }, [interactMode]);

  // Initial useEffect on mount
  useEffect(() => {
    // Track devicePixelRatio to tell a real window resize (dpr unchanged) apart from a
    // browser zoom (dpr changes). On zoom we DON'T re-fit — the browser magnifies the
    // canvas natively and the document scrolls — so the resize listener no longer
    // instantly cancels the zoom (the old flicker-back-to-100%).
    let lastDpr = window.devicePixelRatio;

    // Recompute block size + canvas width from the viewport (window-resize path).
    const setGridSize = () => {
      const w = document.documentElement.clientWidth;
      setCanvasWidth(w);
      setGridBlockSize(w / numGridBlocksWide);
    };
    setGridSize();

    const onResize = () => {
      const dpr = window.devicePixelRatio;
      if (dpr !== lastDpr) { lastDpr = dpr; return; } // browser zoom -> leave the canvas alone
      setGridSize();                                  // true window resize -> re-fit
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Delete/Backspace removes the selected top-level box (unless typing in a field).
  // Acts on the top-level box (selectionPath[0]) — a group is removed whole.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      // Don't hijack typing in inputs/textareas (e.g. prompt or custom fields)
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (!selectionPath.length) return; // nothing selected

      e.preventDefault();
      // Filters through and removes the top-level box matching the selection
      const rootKey = selectionPath[0];
      setElementArr((prev) => prev.filter((el) => el.key !== rootKey));
      setSelectionPath([]);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectionPath]);

  // Register mouse down event listener to grid (THIS IS FOR THE DOTTED DRAG BOX THAT CREATES THE GENERATED BOX)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only the left button does meta interaction; right-click is the context menu.
    if (e.button !== 0) return;
    // In interact mode the grid does no meta interaction (no create/deselect)
    if (interactMode) return;
    // Routes behavior depending on if an element is highlighted
    if (selectionPath.length === 0) {
      // Remove offset of grid from window
      const rect = gridRef.current!.getBoundingClientRect();
      const localPos : XY = { x: e.clientX - rect.left, y: e.clientY - rect.top};

      // Updates the ref var to location of mouseDown
      initMousePosition.current = localPos;

      // Temporarily update the box's position on click (before mouse move happens)
      boxPosition.current = {x: initMousePosition.current.x, y: initMousePosition.current.y};

      // Triggers next useEffect
      setIsMouseDragging(true);
    }
    else {
      // Clears the current selection
      setSelectionPath([]);
    }
  }

  // Right-click context menu. Selected EMPTY box -> delete it (same as the Delete
  // key). Drilled in (intermediary/leaf selected) -> back out (clear the path). Just
  // the root GROUP selected -> pop an "Ungroup" button at the cursor. Anything else ->
  // clear. Always suppresses the native browser menu.
  const handleContextMenu = (e: React.MouseEvent) => {
    if (interactMode) return;
    e.preventDefault();
    // A selected empty box is a throwaway drop-target — right-click discards it.
    if (emptyTarget) {
      setElementArr((prev) => prev.filter((el) => el.key !== emptyTarget.key));
      setSelectionPath([]);
      setUngroupMenu(null);
      return;
    }
    const root = selectionPath.length === 1
      ? elementArr.find((el) => el.key === selectionPath[0])
      : null;
    if (root?.children?.length) {
      const rect = gridRef.current!.getBoundingClientRect();
      setUngroupMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top, rootKey: root.key });
    } else {
      setSelectionPath([]); // drilled in, or a non-group selection -> back out
      setUngroupMenu(null);
    }
  };

  // Produces dragging effect from mouse move/up (THIS IS FOR THE DOTTED DRAG BOX THAT CREATES THE GENERATED BOX)
  useEffect(() => {

    // Sets dimensions of the created box
    const handleMouseMove = (e: MouseEvent) => {
      // Remove offset of grid from window
      const rect = gridRef.current!.getBoundingClientRect();
      const localPos : XY = { x: e.clientX - rect.left, y: e.clientY - rect.top}; 

      // From differences in current mouse position from initial position
      const width = Math.abs(localPos.x - initMousePosition.current.x);
      const height = Math.abs(localPos.y - initMousePosition.current.y);
      setBoxDimensions({ x: width, y: height });

      // Calculate box's top left edge depending on if user drags up/left
      boxPosition.current.x = Math.min(initMousePosition.current.x, localPos.x);
      boxPosition.current.y = Math.min(initMousePosition.current.y, localPos.y);

    }

    // Leaves dragging state
    const handleMouseUp = (e: MouseEvent) => {
      // Clears the drag box 
      setBoxDimensions({ x: 0, y: 0 });
      // Allows event listeners to be cleared
      setIsMouseDragging(false);

      // Creates new element
      setElementArr((prev) => [...prev, currElement.current!]);
      // Selects it
      setSelectionPath([currElement.current!.key]);
    }

    if (isMouseDragging) {
      // Attach event handlers if initiated into drag
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "grabbing"; // Change to grabby hand
      document.body.style.userSelect = 'none'; // Can't highlight text during drag
    }

    // Clean up event listeners and cursor styles when going out of drag mode
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = '';
    };

  }, [isMouseDragging, gridBlockSize]);

  // Calculate number of grid rows in overlay
  const overlayRows = Math.ceil(((gridRef.current?.getBoundingClientRect().height) ?? 0)/(gridBlockSize || 1));

  // Get drag box properties
  const xPos = boxPosition.current.x;
  const yPos = boxPosition.current.y;
  const width = boxDimensions.x;
  const height = boxDimensions.y;

  const xEndPos = xPos + width;
  const yEndPos = yPos + height;

  // Derives list of tuples representing blocks directly from drag box dimensions
  const gridBlockArr : XY[] = []; // Cleared when mouse stops dragging

  // Only recalculates during mouse drag
  if (isMouseDragging) {
    // EX: From columns 1 to 3, rows 5 to 6 (1 indexed)
    const colStart = Math.floor(xPos / gridBlockSize) + 1;
    const colEnd = Math.ceil(xEndPos / gridBlockSize);
    const rowStart = Math.floor(yPos / gridBlockSize) + 1;
    const rowEnd = Math.ceil(yEndPos / gridBlockSize);

    // Store these dimensions to use once mouse up triggers -> new element
    currElement.current = {
      colStart,
      colEnd,
      rowStart,
      rowEnd,
      key : `${Date.now()}-${elementArr.length}`, // Initialized on creation
      isEmpty: true, // Manual boxes start empty (a drop-target) until they generate
    };

    for (let i = colStart; i <= colEnd; i ++) {
      for (let j = rowStart; j <= rowEnd; j ++) {
        // List of blocks, EX: {column 3, row 3}
        gridBlockArr.push({x: i, y: j});
      }
    }
  }

  
  /* JSX */
  return (
    // Background grid: Visual layer. Interact mode -> white, no dots
    <div
      className={`flex relative overflow-hidden ${interactMode ? 'bg-white' : 'bg-canvas'}`}
      style={{
        // Explicit px width (falls back to 100% pre-measure). Wider than the viewport
        // when zoomed in -> the document scrolls horizontally instead of clipping.
        width: canvasWidth ? `${canvasWidth}px` : '100%',
        height: `${numVHTall}vh`,
        // Creates the dots (hidden in interact mode)
        ...(interactMode ? {} : {
          backgroundImage: `radial-gradient(circle, var(--color-dots) 1.5px, transparent 1px)`,
          backgroundSize: `${gridBlockSize}px ${gridBlockSize}px`,
          backgroundPosition: `-${gridBlockSize/2}px -${gridBlockSize/2}px`
        })
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      ref={gridRef}
    >
      {/* Overlay grid: Functional layer */}
      <div
        className='inset-0 absolute grid overflow-hidden pointer-events-none'
        style={{
          // Creates a css grid
          gridTemplateColumns: `repeat(${numGridBlocksWide}, ${gridBlockSize}px)`,
          gridTemplateRows: `repeat(${overlayRows}, ${gridBlockSize}px)`
        }}
      >
        {/* Generated Boxes */}
        {elementArr.map((element) => (
          <GeneratedBox
            props={element}
            key={element.key}
            // Path-based selection: a top-level box's path is just its own key.
            path={[element.key]}
            selectionPath={selectionPath}
            setSelectionPath={setSelectionPath}
            blockSize={gridBlockSize}
            gridRef={gridRef.current!}
            interactMode={interactMode}
            defaultSpec={defaultSpec}
            setDefaultSpec={setDefaultSpec}
            styleSpec={styleSpec}
            markNonEmpty={markNonEmpty}
            syncBounds={syncBounds}
          >

          </GeneratedBox>
        ))}
      </div>

      {/* Overlapped grid blocks */}
      {isMouseDragging && (
        // Creates the grid blocks that the dragbox overlaps with
        gridBlockArr.map((block)=>(
          <div
            className="absolute bg-gridblocks animate-blockGrow"
            style={{
              width: gridBlockSize,
              height: gridBlockSize,
              left: (block.x - 1) * gridBlockSize,
              top: (block.y - 1) * gridBlockSize
            }}
            key={`${block.x}-${block.y}`}
          >
          </div>
        ))
      )}

      {/* Dragbox, created if mouse is dragging, is invisible */}
      {isMouseDragging && (
        <div
          className='absolute overflow-hidden border-2 border-highlightbox border-dotted pointer-events-none'
          style={{
            // Pass in box props
            width, // Assumes + 'px'
            height,
            left: xPos,
            top: yPos
          }}
        >
        </div>
      )}

      {/* Right-click ungroup menu. A shield over the WHOLE workspace absorbs any
          other mouse event (dismissing the menu) so the click can't select or
          deselect a box; inset-0 follows the grid's size on resize automatically.
          The Ungroup button sits above it at the cursor. */}
      {ungroupMenu && (
        <>
          <div
            className="absolute inset-0 z-40"
            onMouseDown={(e) => { e.stopPropagation(); setUngroupMenu(null); }}
            onWheel={() => setUngroupMenu(null)}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setUngroupMenu(null); }}
          />
          <button
            type="button"
            className="absolute z-50 rounded-lg border border-white/10 bg-menu px-4 py-2 text-sm text-white/90 shadow-2xl hover:bg-menuhover"
            style={{ left: ungroupMenu.x, top: ungroupMenu.y }}
            onMouseDown={(e) => {
              e.stopPropagation(); // don't let the shield/grid see this click
              const root = elementArr.find((el) => el.key === ungroupMenu.rootKey);
              if (root) ungroup(root);
              setUngroupMenu(null);
            }}
          >
            Ungroup
          </button>
        </>
      )}
    </div>
  );
}