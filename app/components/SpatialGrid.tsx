'use client'
import { useRef, useEffect, useState } from 'react';
import GeneratedBox from './GeneratedBox';
import { XY, defaultXY, GeneratedBoxProps } from '../utils/spec';

export default function SpacialGrid() {
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

  /* LOGIC */
  // Initial useEffect on mount
  useEffect(() => {
    // Calculates gridblock size based on screen width, after component mounts
    const setGridSize = () => {  
      if (!gridRef.current) return;
      setGridBlockSize((gridRef.current!.getBoundingClientRect().width)/30);
    }
    setGridSize();

    // Such that if window is resized the size recalculates
    window.addEventListener("resize", setGridSize);
    return ()=>{window.removeEventListener("resize", setGridSize);}
  }, []);

  // Register mouse down event listener to grid
  const handleMouseDown = (e: React.MouseEvent) => {
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

  // Produces dragging effect from mouse move/up
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
      setElementArr((prev) => [...prev, currElement.current!])
      // currElement.current = null;
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
    // Background grid: Visual layer
    <div
      className='h-[250vh] flex relative overflow-hidden bg-bgdarkblue'
      style={{
        // Creates the dots
        backgroundImage: `radial-gradient(circle, var(--color-dots) 1px, transparent 1px)`,
        backgroundSize: `${gridBlockSize}px ${gridBlockSize}px`,
        backgroundPosition: `-${gridBlockSize/2}px -${gridBlockSize/2}px`
      }}
      onMouseDown={handleMouseDown}
      ref={gridRef}
    >
      {/* Overlay grid: Functional layer */}
      <div
        className='inset-0 absolute grid overflow-hidden pointer-events-none'
        style={{
          // Creates a css grid
          gridTemplateColumns: `repeat(30, ${gridBlockSize}px)`,
          gridTemplateRows: `repeat(${overlayRows}, ${gridBlockSize}px)`
        }}
      >
        {/* Generated Boxes */}
        {elementArr.map((element) => (
          <GeneratedBox 
            props={element}       
            key={`${element.colStart}-${element.rowStart}`}
          >
            
          </GeneratedBox>
        ))}
      </div>

      {/* Overlapped grid blocks */}
      {isMouseDragging && (
        // Creates the grid blocks that the dragbox overlaps with
        gridBlockArr.map((block)=>(
          <div
            className="absolute bg-highlightbox animate-blockGrow"
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
          className='absolute overflow-hidden pointer-events-none'
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