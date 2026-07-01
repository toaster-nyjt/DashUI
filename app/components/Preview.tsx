import { useRef } from "react";
import {
  SandpackProvider,
  SandpackPreview,
  SandpackLayout,
} from "@codesandbox/sandpack-react";
import { XY } from '../utils/spec';

// Container for the Sandpack iframe
// Controls zooming and scaling logic AFTER initial load in
// Differentiates between side dragging (resizing) and corner dragging (true scaling)
export default function Preview({
  code,
  isSideDragging = false, // Determines the scaling logic
  boxSize, // Dimensions of the box
  taskID // Set for a UI leaf: injects the runtime bus so wired components can talk
}: {
  code: string;
  isSideDragging?: boolean;
  boxSize: XY // Dimensions in pix of Generated box
  taskID?: number
}) {

  // Runtime message bus injected into every UI leaf (taskID defined). It gives the
  // generated/wired component `bus.emit(channel, payload)` + `bus.on(channel, handler)`
  // in scope, tunnelling over postMessage to the host relay (see SpatialGrid), which
  // fans messages out to the OTHER leaves of the same taskID. Absent for manual boxes.
  const busShim = taskID !== undefined
    ? `const __TASK_ID = ${taskID};
const bus = {
  emit: (channel, payload) => {
    try { window.parent.postMessage({ __uibus: true, type: "event", taskID: __TASK_ID, channel, payload }, "*"); } catch (e) {}
  },
  on: (channel, handler) => {
    const listener = (e) => {
      const d = e.data;
      if (d && d.__uibus && d.type === "event" && d.taskID === __TASK_ID && d.channel === channel) handler(d.payload);
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  },
};

`
    : "";

  // Hook imports (unless the code already imports from "react"), THEN the bus shim,
  // THEN the code — imports stay first so the common (no-import) case never emits a
  // statement before an import.
  const hasReactImport = /\bimport\b[^\n]*\bfrom\s*['"]react['"]/.test(code);
  const reactImport = hasReactImport ? "" : `import { useState, useEffect, useRef, useMemo, useCallback } from "react";\n\n`;
  const componentCode = reactImport + busShim + code;

  // Wrap the generated component in an App that fills the iframe. All
  // scaling lives host-side (below) because props can't cross the iframe
  // boundary without re-mounting Sandpack. A UI leaf's App also REGISTERS with the
  // host relay in a mount effect — AFTER the child's bus.on handlers attach (React
  // runs child effects before parent effects), so the relay's cached-value replay on
  // registration always lands on an attached listener (initial-sync guarantee).
  const bgColor = "bg-zinc-950";
  const appCode = `import GeneratedComponent from "./GeneratedComponent";${taskID !== undefined ? `\nimport { useEffect } from "react";` : ""}

export default function App() {${taskID !== undefined ? `
  useEffect(() => {
    window.parent.postMessage({ __uibus: true, type: "register", taskID: ${taskID} }, "*");
  }, []);` : ""}
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

  // Baseline = the "100% zoom" design resolution. scale = boxSize / baseSize.
  const baseSize = useRef<XY>(boxSize);
  // Zoom held constant across a side resize so reflow happens AT the current zoom.
  const sideZoom = useRef(1);
  const wasSideDragging = useRef(false);

  if (isSideDragging && !wasSideDragging.current) {
    // Side-drag start: capture the current zoom level to hold during the reflow
    sideZoom.current = baseSize.current.x ? boxSize.x / baseSize.current.x : 1;
  }
  if (!isSideDragging && wasSideDragging.current) {
    // Side-drag end: rebase so that same zoom persists with the new (reflowed) aspect
    baseSize.current = { x: boxSize.x / sideZoom.current, y: boxSize.y / sideZoom.current };
  }
  wasSideDragging.current = isSideDragging;

  // Side -> reflow at the held zoom; otherwise (corner / window) -> uniform zoom from baseline.
  const scale = isSideDragging
    ? sideZoom.current
    : (baseSize.current.x ? boxSize.x / baseSize.current.x : 1);

  return (
    <div
      className="h-full w-full overflow-hidden"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      {/* (100/scale)% then scaled by `scale` fills the wrapper exactly (plain 100%
          at scale 1). Filling the wrapper lets the leaf seam-bleed reach the bled
          edge — see UI_GENERATOR.md §6. transformOrigin pins it top-left. */}
      <div
        style={{
          width: (100 / scale) + "%",
          height: (100 / scale) + "%",
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
              // !rounded-none zeroes out Sandpack's own layout border-radius so the
              // preview is square — the GeneratedBox wrapper owns all corner rounding
              // (square for nested components, the root masks the UI's outer corners).
              "sp-wrapper": "!h-full !w-full !rounded-none",
              "sp-layout": "!h-full !w-full !border-0 !bg-transparent !rounded-none",
              "sp-preview": "!h-full !w-full !rounded-none",
              "sp-preview-container": "!h-full !w-full !rounded-none",
              "sp-preview-iframe": "!h-full !w-full !min-h-0 !rounded-none",
            },
          }}
        >
          <SandpackLayout>
            <SandpackPreview
              showNavigator={false}
              showOpenInCodeSandbox={false}
              showRefreshButton={false}
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  );

}
