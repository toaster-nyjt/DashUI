import {
  SandpackProvider,
  SandpackPreview,
  SandpackLayout,
} from "@codesandbox/sandpack-react";

export default function Preview({ code } : { code : string }) {

  // Prepend React imports if not already present
  const hasReactImport = code.includes("import") && code.includes("react");
  const componentCode = hasReactImport
    ? code
    : `import { useState, useEffect, useRef, useMemo, useCallback } from "react";\n\n${code}`;

  // Wrap the generated component in an App that renders it
  const bgColor =  "bg-zinc-950";
  const appCode = `import GeneratedComponent from "./GeneratedComponent";

export default function App() {
  return (
    <div className="min-h-screen ${bgColor} p-8">
      <GeneratedComponent />
    </div>
  );
}`;

  const files = {
    "/App.tsx": appCode,
    "/GeneratedComponent.tsx": componentCode,
  };

  return (
    <div className="h-full" style={{ backgroundColor: 'var(--bg-secondary)' }}>
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
            "sp-wrapper": "!h-full",
            "sp-layout": "!h-full !border-0 !bg-transparent",
            "sp-preview": "!h-full",
            "sp-preview-container": "!h-full",
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
  ); 

}