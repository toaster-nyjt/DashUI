'use client'
import { useRef, useEffect, useState } from 'react';
import GeneratedBox from './GeneratedBox';
import { XY, defaultXY, GeneratedBoxProps, DefaultCompSpec, Placement, numGridBlocksWide, numVHTall } from '../utils/spec';
import { DEFAULT_SPEC } from '../utils/defaultSpec';
import { validateLayout } from '../utils/helpers';

// How many times to re-ask the layout route for a valid (gap-free) tiling
const LAYOUT_RETRIES = 3;

export default function SpacialGrid({ interactMode, taskRequest, setIsDesigning }
  : { interactMode: boolean; taskRequest: { prompt: string; id: number } | null; setIsDesigning: React.Dispatch<React.SetStateAction<boolean>> }) {
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
  // Tracks created elements
  const [elementArr, setElementArr] = useState<GeneratedBoxProps[]>([]);
  // Tracks the currently generated element
  const currElement = useRef<GeneratedBoxProps>(null);
  // Tracks which element is currently selected
  const [selectedID, setSelectedID] = useState<string | null>('');


  /* DEFAULT SPEC MODIFIERS */

  // Shared, runtime-extendable registry of components + customizations
  // Passed down to all boxes
  const [defaultSpec, setDefaultSpec] = useState<DefaultCompSpec[]>(DEFAULT_SPEC);


  /* DASHBOARD GENERATOR (task prompt -> plan -> layout -> auto boxes) */

  // Calls the layout route and re-asks (feeding back the validation error) until
  // it returns a tiling that fully covers the window with no gaps/overlaps.
  const fetchValidLayout = async (task: string, names: string[], cols: number, rows: number): Promise<Placement[] | null> => {
    let previousError: string | undefined;
    for (let attempt = 1; attempt <= LAYOUT_RETRIES; attempt++) {
      try {
        const res = await fetch('/api/layout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task, components: names, cols, rows, previousError }),
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
  const runDashboardGeneration = async (task: string) => {
    setIsDesigning(true);
    try {
      // 1. PLAN: task -> functionality-aware component presets
      const planRes = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task }),
      });
      if (!planRes.ok) throw new Error(`plan request failed (${planRes.status})`);
      const specs = await planRes.json() as DefaultCompSpec[];
      if (!specs.length) throw new Error('planner returned no components');

      // 2. Register the new presets. The awaited layout call below lets this
      //    state commit before any boxes are created, so each box mounts with a
      //    defaultSpec prop that already contains its spec (no /api/spec re-fetch).
      setDefaultSpec((prev) => [...prev, ...specs]);

      // 3. LAYOUT: tile the VISIBLE window (in block units) with the components.
      const cols = numGridBlocksWide;
      const rows = Math.max(1, Math.floor(window.innerHeight / (gridBlockSize || 1)));
      let placements: Placement[] | null;

      // If its a single component, place it centered at a quarter size of the window 
      if (specs.length === 1) {
        const w = Math.max(1, Math.floor(cols / 2));
        const h = Math.max(1, Math.floor(rows / 2));
        const colStart = Math.floor((cols - w) / 2) + 1; // 1-indexed, inclusive
        const rowStart = Math.floor((rows - h) / 2) + 1;
        placements = [{
          name: specs[0].name,
          colStart,
          colEnd: colStart + w - 1,
          rowStart,
          rowEnd: rowStart + h - 1,
        }];
      // If multiple components, call layout route to fill the whole window with one box.
      } else {
        placements = await fetchValidLayout(task, specs.map((s) => s.name), cols, rows);
      }
      if (!placements) return; // exhausted retries; already logged

      // 4. Drop in boxes carrying their assigned name -> each self-generates
      // This is how the grid gets the auto generated component(s)
      setElementArr((prev) => [
        ...prev,
        ...placements.map((p, i) => ({
          colStart: p.colStart,
          colEnd: p.colEnd,
          rowStart: p.rowStart,
          rowEnd: p.rowEnd,
          key: `auto-${taskRequest!.id}-${i}`,
          autoName: p.name, // Lets box know to self generate
        })),
      ]);
    } catch (e) {
      console.error('Dashboard generation error:', e);
    } finally {
      setIsDesigning(false);
    }
  };

  // Run the generator whenever a new task is submitted from the Taskbar
  useEffect(() => {
    if (taskRequest && taskRequest.prompt.trim()) {
      runDashboardGeneration(taskRequest.prompt.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskRequest?.id]);


  /* MAIN PHYSICAL/VISUAL LOGIC */

  // Entering interact mode deselects any selected box
  useEffect(() => {
    if (interactMode) setSelectedID('');
  }, [interactMode]);

  // Initial useEffect on mount
  useEffect(() => {
    // Calculates gridblock size based on screen width, after component mounts
    const setGridSize = () => {  
      if (!gridRef.current) return;
      setGridBlockSize((gridRef.current!.getBoundingClientRect().width)/numGridBlocksWide);
    }
    setGridSize();

    // Such that if window is resized the size recalculates
    window.addEventListener("resize", setGridSize);
    return ()=>{window.removeEventListener("resize", setGridSize);}
  }, []);

  // Delete/Backspace removes the selected box (unless typing in a field)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      // Don't hijack typing in inputs/textareas (e.g. prompt or custom fields)
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (!selectedID) return; // nothing selected

      e.preventDefault();
      // Filters through and removes the box that has the key equal to the current selected id
      setElementArr((prev) => prev.filter((el) => el.key !== selectedID));
      setSelectedID('');
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedID]);

  // Register mouse down event listener to grid (THIS IS FOR THE DOTTED DRAG BOX THAT CREATES THE GENERATED BOX)
  const handleMouseDown = (e: React.MouseEvent) => {
    // In interact mode the grid does no meta interaction (no create/deselect)
    if (interactMode) return;
    // Routes behavior depending on if an element is highlighted
    if (selectedID === '') {
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
      // Clears any selected id
      setSelectedID('');
    }
  }

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
      setSelectedID(currElement.current!.key);
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
        height: `${numVHTall}vh`,
        // Creates the dots (hidden in interact mode)
        ...(interactMode ? {} : {
          backgroundImage: `radial-gradient(circle, var(--color-dots) 1.5px, transparent 1px)`,
          backgroundSize: `${gridBlockSize}px ${gridBlockSize}px`,
          backgroundPosition: `-${gridBlockSize/2}px -${gridBlockSize/2}px`
        })
      }}
      onMouseDown={handleMouseDown}
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
            // Directly pass in derived props seperately so they update
            isSelected={selectedID === element.key}
            handleSelect={(e : React.MouseEvent) => {
              // Mousedown -> Registers ONLY in the child Generated Box element
              e.stopPropagation();
              setSelectedID(element.key);
            }}
            blockSize={gridBlockSize}
            gridRef={gridRef.current!}
            interactMode={interactMode}
            defaultSpec={defaultSpec}
            setDefaultSpec={setDefaultSpec}
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
    </div>
  );
}