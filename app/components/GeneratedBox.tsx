import { GeneratedBoxProps, numGridBlocksWide, XY, defaultXY} from '../utils/spec';
import { useGetCode } from '../utils/helpers';
import { useState, useEffect, useRef } from 'react';
import ComponentSelector from './ComponentSelector';
import Preview from './Preview';

// Created from drag interaction in Spacial Grid
export default function GeneratedBox({ props, isSelected, handleSelect, handleDeselect, blockSize, gridRef } 
  : { 
      props : GeneratedBoxProps, 
      isSelected : boolean, 
      handleSelect : (e : React.MouseEvent)=>void,
      handleDeselect : ()=>void,
      blockSize : number
      gridRef : HTMLDivElement
    }) {

  // Get the width and height in blocks of the box
  const blockDim : XY = {x: props.colEnd - props.colStart, y: props.rowEnd - props.rowStart}

  // Grab the async code setter handleSend and state vars
  const { handleSend, generatedCode, isGenerating } = useGetCode();

  // Track box drag
  const [isMouseDragging, setIsMouseDragging] = useState<boolean>(false);
  // Persist and track coords of box, set initial values
  const [blockPos, setBlockPos] = useState<XY>({x: props.colStart, y: props.rowStart});
  // Store offset from the initial mouseDown to the top left corner of the box
  const offset = useRef<XY>(defaultXY);
  // Helper to convert to block coords
  const pixToBlock = (p : number) => (Math.floor(p/blockSize) + 1);

  // To both send the prompt and deselect the component
  const clickedComponentOption = (prompt : string) => {
    handleDeselect();
    handleSend(prompt);
  }

  // To to set the selected key and initiate drag
  const handleMouseDown = (e : React.MouseEvent) => {
    handleSelect(e);
    setIsMouseDragging(true);

    // Remove offset of grid from window
    const rect = gridRef.getBoundingClientRect();
    const localPos : XY = { x: e.clientX - rect.left, y: e.clientY - rect.top}; 

    // Set the offset in grid coords
    offset.current = {
      x: pixToBlock(localPos.x) - blockPos.x,
      y: pixToBlock(localPos.y) - blockPos.y
    }
  }

  // Drag effect
  useEffect(()=>{
    const handleMouseMove = (e: MouseEvent) => {
      // Remove offset of grid from window
      const rect = gridRef.getBoundingClientRect();
      const localPos : XY = { x: e.clientX - rect.left, y: e.clientY - rect.top}; 
      const mStartCol = pixToBlock(localPos.x) - offset.current.x;
      const mStartRow = pixToBlock(localPos.y) - offset.current.y;
      setBlockPos({x: mStartCol, y: mStartRow});
    }
    const handleMouseUp = (e: MouseEvent) => {
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

  // To flip the popup menu if needed 
  const shouldRenderRight = ((blockPos.x + blockDim.x) > numGridBlocksWide - (Math.ceil(320/blockSize)));
  const shouldRenderUp = ((blockPos.y + blockDim.y) > Math.ceil((window.scrollY + window.innerHeight - 462)/blockSize) + 1);
  
  return (
    // Generated Box 
    <div
      className='relative pointer-events-auto'
      style={{
        gridColumn: `${blockPos.x} / ${blockPos.x + 1 + blockDim.x}`,
        gridRow: `${blockPos.y} / ${blockPos.y + 1 + blockDim.y}`
      }}
      onMouseDown={handleMouseDown}
    >
      {/* STYLING (two layers because shadows don't work with backdrop blur*/}
      <div className={`absolute inset-0 shadow-custom rounded-lg border-2 ${isSelected ? 'border-borderactive' : "border-borderinactive"}`}/>
      <div className={`flex justify-center items-center size-full z-10 backdrop-blur-sm rounded-lg border-2 ${isSelected ? 'border-borderactive' : "border-borderinactive"} bg-emptycomponent/10`}>
        {isGenerating ? (
          <div className="flex justify-center items-center animate-vertical-shimmer size-full rounded-lg bg-neutral-900 border border-white/5">
            {/* Generating | Empty | Showing code preview */}
            <span>generating...</span> 
          </div>
        ) : (generatedCode == "") ? (
          <span>empty</span>
        ) : (
          <Preview code={generatedCode} />
        )}
      </div>

      {/* Component Selector Popup Menu*/}
      {(isSelected && !isMouseDragging) && (
        // Aligns it depending on how close the menu is to all four edges
        <div 
          className={`absolute ${shouldRenderRight 
            ? (shouldRenderUp ? 'bottom-0 right-full mr-2' : 'top-0 right-full mr-2')
            : (shouldRenderUp ? 'bottom-0 left-full ml-2' : 'top-0 left-full ml-2')
          } z-50 transition-all`}
          onMouseDown={(e) => e.stopPropagation()} // To prevent calling the parent box's handleSelect
        >
          <ComponentSelector 
            onSend={clickedComponentOption} // onMouseDown -> send -> handleSend -> Calls API Endpoint
          />
        </div>
      )}

    </div>
  );
}