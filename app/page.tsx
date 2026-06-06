'use client';
import { useState } from "react";
import SpatialGrid from "./components/SpatialGrid";
import Taskbar from "./components/Taskbar";

export default function Home() {
  // Interact Mode lives here so both the Taskbar and the grid can share it
  const [interactMode, setInteractMode] = useState<boolean>(false);

  // A submitted dashboard task. The `id` makes each submission distinct so the
  // grid re-runs generation even if the same prompt text is entered twice.
  const [taskRequest, setTaskRequest] = useState<{ prompt: string; id: number } | null>(null);

  // True while the grid is planning/laying out a dashboard.
  const [isDesigning, setIsDesigning] = useState<boolean>(false);

  return (
    <>
      <Taskbar
        interactMode={interactMode}
        onInteractModeChange={setInteractMode}
        onGenerate={(prompt) => setTaskRequest({ prompt, id: Date.now() })}
        isDesigning={isDesigning}
      />
      <SpatialGrid interactMode={interactMode} taskRequest={taskRequest} setIsDesigning={setIsDesigning} />
    </>
  );
}
