import { useRef } from "react";
import {
  SandpackProvider,
  SandpackPreview,
  SandpackLayout,
} from "@codesandbox/sandpack-react";
import { XY } from '../utils/spec';

export default function Preview({
  code,
  isResizing = false, // Rebase after stopped resizing
  isSideDragging = false, // Determines the scaling logic 
  boxSize // Dimensions of the box
}: {
  code: string;
  isResizing?: boolean;
  isSideDragging?: boolean;
  boxSize: XY // Dimensions in pix of Generated box
}) {

  // Prepend React imports if not already present
  const hasReactImport = code.includes("import") && code.includes("react");
  const componentCode = hasReactImport
    ? code
    : `import { useState, useEffect, useRef, useMemo, useCallback } from "react";\n\n${code}`;

  // Wrap the generated component in an App that fills the iframe. All
  // scaling lives host-side (below) because props can't cross the iframe
  // boundary without re-mounting Sandpack.
  const bgColor = "bg-zinc-950";
  const appCode = `import GeneratedComponent from "./GeneratedComponent";

export default function App() {
  return (
    <div className="h-screen w-screen overflow-hidden ${bgColor}">
      <GeneratedComponent />
    </div>
  );
}`;

  const files = {
    "/App.tsx": appCode,
    "/GeneratedComponent.tsx": componentCode,
  };

  // Baseline (the "100% zoom" reference)
  const baseSize = useRef<XY>(boxSize); // Initially the dimensions

  // Rebases after resize
  const wasResizing = useRef(false);
  if (wasResizing.current && !isResizing) {
    // Updates baseSize
    baseSize.current = boxSize;
  }
  wasResizing.current = isResizing;

  // Side drag -> reflow (scale 1, content fills the new dimension via flex).
  // Otherwise (window resize, corner drag) -> uniform zoom from the baseline.
  const scale = !isSideDragging && baseSize.current && boxSize
    ? boxSize.x / baseSize.current.x : 1;
  // Pre-scale layout size: the baseline while zooming, the live box while reflowing.
  const inner = isSideDragging ? boxSize : baseSize.current;

  return (
    <div
      className="h-full w-full overflow-hidden"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      {/* Laid out at `inner`, then scaled. transformOrigin pins it to the
          top-left so the scaled content lines up with the box. */}
      <div
        style={{
          width: inner ? inner.x : "100%",
          height: inner ? inner.y : "100%",
          transform: "scale(" + scale + ")",
          transformOrigin: "top left",
        }}
      >
        <SandpackProvider
          template="react-ts"
          theme="dark"
          // Displays the App files within the panel
          files={files}
          customSetup={{
            dependencies: {
              "react": "^18.2.0",
              "react-dom": "^18.2.0",
            },
          }}
          options={{
            externalResources: [
              "https://cdn.tailwindcss.com",
            ],
            classes: {
              "sp-wrapper": "!h-full !w-full",
              "sp-layout": "!h-full !w-full !border-0 !bg-transparent",
              "sp-preview": "!h-full !w-full",
              "sp-preview-container": "!h-full !w-full",
            },
          }}
        >
          <SandpackLayout>
            <SandpackPreview
              showNavigator={false}
              showOpenInCodeSandbox={false}
              showRefreshButton={true}
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  );

}
