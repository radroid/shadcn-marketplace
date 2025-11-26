"use client";

import React from "react";
import Editor from "@monaco-editor/react";
import {
  useActiveCode,
  SandpackStack,
  FileTabs,
  useSandpack,
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";

interface MonacoEditorInternalProps {
  readOnly?: boolean;
  onChange?: (files: Record<string, { code: string }>) => void;
  componentPath: string;
  saveStatus?: SaveStatus;
}

function MonacoEditorInternal({ readOnly, onChange, componentPath, saveStatus = 'idle' }: MonacoEditorInternalProps) {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();
  const { theme } = useTheme();
  const previousFilesRef = React.useRef<Record<string, { code: string }>>(sandpack.files);

  // Listen to file changes and trigger onChange with debounce
  React.useEffect(() => {
    if (!onChange) return;

    // Check if files actually changed by comparing the specific files we care about
    const previewCode = sandpack.files["/Preview.tsx"]?.code;
    const componentCode = sandpack.files[componentPath]?.code;
    const globalCss = sandpack.files["/styles/globals.css"]?.code;

    const prevPreviewCode = previousFilesRef.current["/Preview.tsx"]?.code;
    const prevComponentCode = previousFilesRef.current[componentPath]?.code;
    const prevGlobalCss = previousFilesRef.current["/styles/globals.css"]?.code;

    // Only trigger if the relevant files actually changed
    if (
      previewCode === prevPreviewCode &&
      componentCode === prevComponentCode &&
      globalCss === prevGlobalCss
    ) {
      return;
    }

    // Update the ref to track current state
    previousFilesRef.current = sandpack.files;

    // Debounce: wait 2 seconds after last change
    const timer = setTimeout(() => {
      onChange(sandpack.files);
    }, 2000);

    return () => clearTimeout(timer);
  }, [sandpack.files, onChange, componentPath]);

  return (
    <SandpackStack style={{ height: "100%", margin: 0 }}>
      <div className="flex items-center justify-between bg-[#1e1e1e] pr-4 border-b border-[#2e2e2e]">
        <FileTabs />
        <SaveStatusIndicator status={saveStatus} />
      </div>
      <div style={{ flex: 1, paddingTop: 8, background: "#1e1e1e", height: "100%" }}>
        <Editor
          width="100%"
          height="100%"
          language="typescript"
          theme={theme === "dark" ? "vs-dark" : "light"}
          key={sandpack.activeFile}
          defaultValue={code}
          onChange={(value) => updateCode(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            readOnly: readOnly,
          }}
        />
      </div>
    </SandpackStack>
  );
}

import { DEFAULT_GLOBAL_CSS } from "./theme-generator";

interface ComponentEditorProps {
  code: string;
  previewCode: string;
  globalCss?: string;
  readOnly?: boolean;
  onChange?: (files: Record<string, { code: string }>) => void;
  dependencies?: Record<string, string>;
  componentName: string; // e.g. "button"
  saveStatus?: SaveStatus;
}

export default function ComponentEditor({ code, previewCode, globalCss, readOnly, onChange, dependencies, componentName, saveStatus }: ComponentEditorProps) {
  // We place the component in the correct path so imports work naturally
  const componentPath = `/components/ui/${componentName}.tsx`;

  // Default Tailwind directives if globalCss is empty
  const effectiveCss = globalCss && globalCss.trim().length > 0 ? globalCss : DEFAULT_GLOBAL_CSS;

  const files = {
    "/App.tsx": `import React from "react";
      import * as Preview from "./Preview";

      export default function App() {
  // Dynamically find the component to render
  // Priority: default export -> first function export
  const Component = Preview.default || Object.values(Preview).find((exp: unknown) => typeof exp === 'function');

      if (!Component) {
    return (
      <div className="p-4 text-red-500">
        Could not find a component to render. Please export a component from your preview code.
      </div>
      );
  }

      return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <Component />
      </div>
      );
}`,
    "/Preview.tsx": previewCode,
    [componentPath]: code,
    "/lib/utils.ts": {
      code: `import {type ClassValue, clsx } from "clsx"
      import {twMerge} from "tailwind-merge"

      export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
      `,
      hidden: true,
    },
    "/styles/globals.css": effectiveCss,
    "/tsconfig.json": {
      code: `{
        "compilerOptions": {
        "baseUrl": ".",
      "paths": {
        "@/*": ["./*"]
    }
  }
}`,
      hidden: true,
    },
    "/tailwind.config.js": {
      code: `/** @type {import('tailwindcss').Config} */
      module.exports = {
        darkMode: ["class"],
      content: ["./App.tsx", "./Preview.tsx", "./components/**/*.{ts, tsx}"],
      theme: {
        extend: {
        colors: {
        border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
      foreground: "hsl(var(--primary-foreground))",
        },
      secondary: {
        DEFAULT: "hsl(var(--secondary))",
      foreground: "hsl(var(--secondary-foreground))",
        },
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
      foreground: "hsl(var(--destructive-foreground))",
        },
      muted: {
        DEFAULT: "hsl(var(--muted))",
      foreground: "hsl(var(--muted-foreground))",
        },
      accent: {
        DEFAULT: "hsl(var(--accent))",
      foreground: "hsl(var(--accent-foreground))",
        },
      popover: {
        DEFAULT: "hsl(var(--popover))",
      foreground: "hsl(var(--popover-foreground))",
        },
      card: {
        DEFAULT: "hsl(var(--card))",
      foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
      },
    },
  },
}`,
      hidden: true,
    },
  };

  return (
    <SandpackProvider
      template="react-ts"
      theme="dark"
      files={files}
      options={{
        externalResources: ["https://cdn.tailwindcss.com"],
        classes: {
          "sp-layout": "!h-[calc(100vh-60px)]", // Adjust based on header height
        },
        activeFile: "/Preview.tsx", // Open Preview.tsx by default for editing
        visibleFiles: ["/Preview.tsx", componentPath, "/styles/globals.css"],
      }}
      customSetup={{
        dependencies: {
          "lucide-react": "latest",
          "clsx": "latest",
          "tailwind-merge": "latest",
          ...dependencies,
        },
      }}
    >
      <SandpackLayout>
        <MonacoEditorInternal readOnly={readOnly} onChange={onChange} componentPath={componentPath} saveStatus={saveStatus} />
        <SandpackPreview style={{ height: "100%" }} />
      </SandpackLayout>
    </SandpackProvider>
  );
}
