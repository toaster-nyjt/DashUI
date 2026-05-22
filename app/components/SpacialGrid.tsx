'use client'
import { useRef, useEffect, useState } from 'react';

// Tuple Type
type XY = {
  x: number;
  y: number;
}

// To bypass ts type check
const defaultXY = {x: -1, y: -1};

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
  const [gridBlockSize, setGridBlockSize] = useState<number>(0);

  /* LOGIC */
  // Register mouse down event listener to grid
  const handleMouseDown = (e: React.MouseEvent) => {
    // Remove offset of grid from window
    const rect = gridRef.current!.getBoundingClientRect();
    const localPos : XY = { x: e.clientX - rect.left, y: e.clientY - rect.top}; 

    // Updates the ref var to location of mouseDown
    initMousePosition.current = localPos;

    // Triggers next useEffect
    setIsMouseDragging(true);
  }

  // Calculates gridblock size based on screen width
  useEffect(() => {
    const setGridSize = () => {  
      if (!gridRef.current) return;  
      setGridBlockSize((gridRef.current.getBoundingClientRect().width)/30);
    }
    setGridSize();

    // Such that if window is resized the size recalculates
    window.addEventListener("resize", setGridSize);
    return ()=>{window.removeEventListener("resize", setGridSize);}
  }, []);

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
      // Clears the box 
      setBoxDimensions({ x: 0, y: 0 });
      // Allows event listeners to be cleared
      setIsMouseDragging(false);
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

  }, [isMouseDragging]);

  // Get box properties
  const xPos = boxPosition.current.x;
  const yPos = boxPosition.current.y;
  const width = boxDimensions.x;
  const height = boxDimensions.y;

  /* JSX */
  return (
    // Grid background
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
      {/* Dragbox, only display if mouse is dragging */}
      {isMouseDragging && (
        <div
          className='absolute overflow-hidden bg-highlightbox pointer-events-none'
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