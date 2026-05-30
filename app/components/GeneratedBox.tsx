import { GeneratedBoxProps, numGridBlocksWide, XY, defaultXY, CompSpec, DefaultCompSpec } from '../utils/spec';
import { useGetCode } from '../utils/helpers';
import { buildInstructions } from '../utils/defaultSpec';
import { useState, useEffect, useRef } from 'react';
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

// Created from drag interaction in Spacial Grid
export default function GeneratedBox({ props, isSelected, handleSelect, blockSize, gridRef, interactMode, defaultSpec, addNewCompName, addNewCompSpec }
  : {
      props : GeneratedBoxProps,
      isSelected : boolean,
      handleSelect : (e : React.MouseEvent)=>void,
      blockSize : number
      gridRef : HTMLDivElement
      interactMode : boolean
      defaultSpec : DefaultCompSpec[]
      addNewCompName : (newComp : DefaultCompSpec) => void
      addNewCompSpec : (name : string, customization : string) => number
    }) {

  // Get the width and height in blocks of the box (stateful so it can be resized)
  const [blockDim, setBlockDim] = useState<XY>({x: props.colEnd - props.colStart, y: props.rowEnd - props.rowStart});

  // Grab the async code setter handleSend and state vars
  const { handleSend, generatedCode, isGenerating } = useGetCode();

  // Track box drag
  const [isMouseDragging, setIsMouseDragging] = useState<boolean>(false);
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

  // The chosen component type + active customizations for this box
  const [compSpec, setCompSpec] = useState<CompSpec>({ name: '', specArrIdx: [] });
  // True while the LLM generates a customization preset for a custom name
  const [isLoadingSpec, setIsLoadingSpec] = useState<boolean>(false);
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

  // Pick a component type: load its default customizations and generate. For a
  // custom name (not in the registry), first generate its preset via the LLM.
  const handleUpdateNameAndSend = async (name : string) => {
    let def = defaultSpec.find((d) => d.name === name);
    let specList = defaultSpec;

    if (!def) {
      setIsLoadingSpec(true);
      try {
        const res = await fetch('/api/spec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error('spec generation failed');
        const created = await res.json() as DefaultCompSpec;
        addNewCompName(created);            // add to the shared registry
        def = created;
        specList = [...defaultSpec, created]; // registry state is async; use locally now
      } catch (e) {
        console.error(e);
        setIsLoadingSpec(false);
        return;
      }
      setIsLoadingSpec(false);
    }

    const next : CompSpec = { name, specArrIdx: def.spec.defaultSpecArrIdx };
    setCompSpec(next);
    handleSend(buildInstructions(next, specList), true); // full regenerate
  }

  // Toggle a customization on/off, then full-regenerate
  const handleUpdateSpecAndSend = (toAdd : boolean, specNameIndex : number) => {
    const specArrIdx = toAdd
      ? [...compSpec.specArrIdx, specNameIndex]
      : compSpec.specArrIdx.filter((i) => i !== specNameIndex);
    const next : CompSpec = { ...compSpec, specArrIdx };
    setCompSpec(next);
    handleSend(buildInstructions(next, defaultSpec), true);
  }

  // Add a new customization under the current type, activate it, regenerate
  const handleAddCustomSpec = (customization : string) => {
    const index = addNewCompSpec(compSpec.name, customization);
    const next : CompSpec = { ...compSpec, specArrIdx: [...compSpec.specArrIdx, index] };
    setCompSpec(next);
    // registry state is async, so augment locally for this build
    const specList = defaultSpec.map((d) =>
      d.name === compSpec.name
        ? { ...d, spec: { ...d.spec, specArr: [...d.spec.specArr, customization] } }
        : d
    );
    handleSend(buildInstructions(next, specList), true);
  }

  // To to set the selected key and initiate drag
  const handleMouseDown = (e : React.MouseEvent) => {
    handleSelect(e);
    setIsMouseDragging(true);

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
    const handleMouseMove = (e: MouseEvent) => {
      // Remove offset of grid from window
      const rect = gridRef.getBoundingClientRect();
      const localPos : XY = { x: e.clientX - rect.left, y: e.clientY - rect.top};

      // When move -> Inject block pos with actual pixel values
      setBlockPos({
        x: localPos.x - offset.current.x, 
        y: localPos.y - offset.current.y
      });
    }
    const handleMouseUp = (e: MouseEvent) => {
      // Convert the pixel positions back into block positions after drag
      setBlockPos({ 
        x: pixToBlock(blockPosLiveRef.current!.x),
        y: pixToBlock(blockPosLiveRef.current!.y)
      })

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
      setBlockPos({ x: pixToBlock(r.left), y: pixToBlock(r.top) });
      setBlockDim({ x: pixToBlockDim(r.width), y: pixToBlockDim(r.height) });
      setResizeDir(null);
      setResizeRect(null);
    }

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeUp);
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeUp);
      document.body.style.userSelect = '';
    }
  }, [resizeDir])

  // To flip the popup menu if needed
  const shouldRenderRight = ((blockPos.x + blockDim.x) > numGridBlocksWide - (Math.ceil(320/blockSize)));
  const shouldRenderUp = ((blockPos.y + blockDim.y) > Math.ceil((window.scrollY + window.innerHeight - 462)/blockSize) + 1);
  
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
    // If not dragged, snap to grid and display in grid
    className : 'relative pointer-events-auto',
    style : {
        gridColumn: `${blockPos.x} / ${blockPos.x + 1 + blockDim.x}`,
        gridRow: `${blockPos.y} / ${blockPos.y + 1 + blockDim.y}`
    },
    onMouseDown: handleMouseDown
  }
  

  return (
    // Generated Box 
    <div
      {...boxDivProp}
    >
      {/* STYLING (two layers because shadows don't work with backdrop blur).
          Borders/shadow/frosting are hidden in interact mode for a clean look. */}
      {!interactMode && (
        <div className={`absolute inset-0 shadow-custom rounded-lg border-2 ${isSelected ? 'border-borderactive' : "border-borderinactive"}`}/>
      )}
      <div className={`flex justify-center items-center size-full overflow-hidden z-10 rounded-lg ${interactMode ? '' : `backdrop-blur-sm border-2 ${isSelected ? 'border-borderactive' : "border-borderinactive"} bg-emptycomponent/10`}`}>
        {isGenerating ? (
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

      {/* Meta mode: a transparent overlay above the preview captures clicks for
          select/move, since the Sandpack iframe would otherwise swallow them.
          Absent in interact mode so the component itself is clickable. */}
      {!interactMode && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute inset-0 z-10 cursor-grab"
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
          don't trigger the box move-drag or grid deselect. */}
      {(isSelected && !isMouseDragging) && RESIZE_HANDLES.map((h) => (
        <div
          key={h.dir}
          onMouseDown={(e) => handleResizeDown(e, h.dir)}
          className={`absolute ${h.cls} ${h.dir.length === 2 ? 'z-30 bg-borderactive rounded-sm' : 'z-20'}`}
          style={{ cursor: h.cursor }}
        />
      ))}

      {/* Popup menu: pick a type first, then customize once a type is chosen */}
      {(isSelected && !isMouseDragging && !isResizing && !interactMode) && (
        // Aligns it depending on how close the menu is to all four edges
        <div
          className={`absolute ${shouldRenderRight
            ? (shouldRenderUp ? 'bottom-0 right-full mr-2' : 'top-0 right-full mr-2')
            : (shouldRenderUp ? 'bottom-0 left-full ml-2' : 'top-0 left-full ml-2')
          } z-50 transition-all`}
          onMouseDown={(e) => e.stopPropagation()} // To prevent calling the parent box's handleSelect
        >
          {compSpec.name === '' ? (
            <ComponentSelector
              names={defaultSpec.map((d) => d.name)}
              loading={isLoadingSpec}
              onSend={handleUpdateNameAndSend} // pick type -> generate
            />
          ) : (
            <CustomizationSelector
              compSpec={compSpec}
              defaultSpec={defaultSpec}
              onToggle={handleUpdateSpecAndSend}   // (toAdd, index) -> regenerate
              onAddCustom={handleAddCustomSpec}    // new customization -> regenerate
            />
          )}
        </div>
      )}

    </div>
  );
}