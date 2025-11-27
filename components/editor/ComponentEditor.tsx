"use client";

import React, { useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import {
  useActiveCode,
  SandpackStack,
  useSandpack,
  SandpackProvider,
  SandpackPreview,
  SandpackLayout,
} from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";
import { EditorTabs } from "./EditorTabs";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save, Undo } from "lucide-react";
import { DEFAULT_GLOBAL_CSS } from "./theme-generator";

interface MonacoEditorInternalProps {
  readOnly?: boolean;
  componentPath: string;
  saveStatus?: SaveStatus;
  onSave?: (files: Record<string, { code: string }>) => void;
  initialCode: string;
}

function MonacoEditorInternal({
  readOnly,
  componentPath,
  saveStatus = "idle",
  onSave,
  initialCode,
}: MonacoEditorInternalProps) {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(sandpack.files);
    }
  };

  const handleUndo = () => {
    editorRef.current?.trigger("source", "undo", null);
  };

  const handleReset = () => {
    updateCode(initialCode);
  };

  return (
    <SandpackStack style={{ height: "100%", margin: 0 }}>
      <div className="flex items-center justify-between bg-muted/50 pr-4 border-b border-border h-10 shrink-0">
        <EditorTabs />
        <div className="flex items-center gap-2">
          <SaveStatusIndicator status={saveStatus} />
          {!readOnly && (
            <>
              <div className="h-4 w-px bg-border mx-2" />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleUndo}
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleReset}
                title="Reset to last saved"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-7 px-3 ml-2"
                onClick={handleSave}
                disabled={saveStatus === "saving"}
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          background: "var(--background)",
          height: "calc(100% - 40px)",
        }}
      >
        <Editor
          width="100%"
          height="100%"
          language="typescript"
          theme={theme === "dark" ? "vs-dark" : "light"}
          key={sandpack.activeFile}
          defaultValue={code}
          onChange={(value) => updateCode(value || "")}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            readOnly: readOnly,
            renderValidationDecorations: "off",
            showUnused: false,
            showDeprecated: false,
          }}
        />
      </div>
    </SandpackStack>
  );
}

interface ComponentEditorProps {
  code: string;
  previewCode: string;
  globalCss?: string;
  readOnly?: boolean;
  onSave?: (files: Record<string, { code: string }>) => void;
  dependencies?: Record<string, string>;
  componentName: string;
  saveStatus?: SaveStatus;
}

const getAppCode = (isDark: boolean) => `import React, { useEffect } from "react";
import * as Preview from "./Preview";
import { cn } from "@/lib/utils";

export default function App() {
  const isDark = ${isDark};

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDark]);

  const Component =
    Preview.default ||
    Object.values(Preview).find((exp: unknown) => typeof exp === "function");

  if (!Component) {
    return (
      <div className="p-4 text-red-500">
        Could not find a component to render. Please export a component from your preview code.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center p-4 transition-colors duration-300",
        isDark ? "bg-background text-foreground" : "bg-background text-foreground"
      )}
    >
      <Component />
    </div>
  );
}`;

function CodeSync({
  code,
  previewCode,
  globalCss,
  componentPath,
  isDark,
}: {
  code: string;
  previewCode: string;
  globalCss: string;
  componentPath: string;
  isDark: boolean;
}) {
  const { sandpack } = useSandpack();
  const prevCodeRef = useRef(code);
  const prevPreviewCodeRef = useRef(previewCode);
  const prevCssRef = useRef(globalCss);
  const prevIsDarkRef = useRef(isDark);

  React.useEffect(() => {
    if (code !== prevCodeRef.current) {
      sandpack.updateFile(componentPath, code);
      prevCodeRef.current = code;
    }

    if (previewCode !== prevPreviewCodeRef.current) {
      sandpack.updateFile("/Preview.tsx", previewCode);
      prevPreviewCodeRef.current = previewCode;
    }

    if (globalCss !== prevCssRef.current) {
      sandpack.updateFile("/styles/globals.css", globalCss);
      prevCssRef.current = globalCss;
    }

    if (isDark !== prevIsDarkRef.current) {
      sandpack.updateFile("/App.tsx", getAppCode(isDark));
      prevIsDarkRef.current = isDark;
    }
  }, [code, previewCode, globalCss, componentPath, isDark, sandpack]);

  return null;
}

export default function ComponentEditor({
  code,
  previewCode,
  globalCss,
  readOnly,
  onSave,
  dependencies,
  componentName,
  saveStatus,
}: ComponentEditorProps) {
  const { theme, resolvedTheme } = useTheme();
  const componentPath = `/components/ui/${componentName}.tsx`;
  const effectiveCss =
    globalCss && globalCss.trim().length > 0 ? globalCss : DEFAULT_GLOBAL_CSS;

  const isDark = React.useMemo(() => resolvedTheme === "dark", [resolvedTheme]);

  // Keep dependency array minimal so SandpackProvider doesn't remount.
  const files = React.useMemo(
    () => ({
      "/App.tsx": getAppCode(resolvedTheme === "dark"),
      "/Preview.tsx": previewCode,
      [componentPath]: code,
      "/lib/utils.ts": {
        code: `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,
        hidden: true,
      },
      "/styles/globals.css": effectiveCss,
      "/tsconfig.json": {
        code: `{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["**/*.ts", "**/*.tsx"]
}`,
        hidden: true,
      },
    }),
    [componentPath]
  );

  const options = React.useMemo(
    () => ({
      externalResources: ["https://unpkg.com/@tailwindcss/browser@4"],
      classes: {
        "sp-layout": "!h-[calc(100vh-60px)]",
      },
      activeFile: "/Preview.tsx",
      visibleFiles: ["/Preview.tsx", componentPath, "/styles/globals.css"],
      showUnused: false,
      showDeprecated: false,
      resizablePanels: true,
    }),
    [componentPath]
  );

  const serializedDependencies = JSON.stringify(dependencies);
  const customSetup = React.useMemo(
    () => ({
      dependencies: {
        "lucide-react": "latest",
        clsx: "latest",
        "tailwind-merge": "latest",
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "@types/node": "^20.0.0",
        ...(dependencies || {}),
      },
    }),
    [serializedDependencies]
  );

  return (
    <SandpackProvider
      template="react-ts"
      theme={theme === "dark" ? "dark" : "light"}
      files={files}
      options={options}
      customSetup={customSetup}
    >
      <CodeSync
        code={code}
        previewCode={previewCode}
        globalCss={effectiveCss}
        componentPath={componentPath}
        isDark={isDark}
      />
      <SandpackLayout>
        <MonacoEditorInternal
          readOnly={readOnly}
          onSave={onSave}
          componentPath={componentPath}
          saveStatus={saveStatus}
          initialCode={code}
        />
        <SandpackPreview style={{ height: "100%" }} />
      </SandpackLayout>
    </SandpackProvider>
  );
}

