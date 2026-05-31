'use client';
import { useState } from "react";
import SpatialGrid from "./components/SpatialGrid";
import Taskbar from "./components/Taskbar";

export default function Home() {
  // Interact Mode lives here so both the Taskbar and the grid can share it
  const [interactMode, setInteractMode] = useState<boolean>(false);

  return (
    <>
      <Taskbar interactMode={interactMode} onInteractModeChange={setInteractMode} />
      <SpatialGrid interactMode={interactMode} />
    </>
  );
}
