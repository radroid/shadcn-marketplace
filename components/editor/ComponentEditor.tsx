"use client";

import React, { useRef, useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import {
  useActiveCode,
  SandpackStack,
  useSandpack,
  SandpackProvider,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";
import { EditorTabs } from "./EditorTabs";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save, Undo } from "lucide-react";
import { DEFAULT_GLOBAL_CSS, getThemeCss } from "./theme-generator";
import { ThemeSelector } from "./ThemeSelector";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

interface MonacoEditorInternalProps {
  readOnly?: boolean;
  componentPath: string;
  saveStatus?: SaveStatus;
  onSave?: (files: Record<string, { code: string }>) => void;
  onCodeChange?: (files: Record<string, { code: string }>) => void;
  initialCode: string;
}

function MonacoEditorInternal({
  readOnly,
  componentPath,
  saveStatus = "idle",
  onSave,
  onCodeChange,
  initialCode,
  currentTheme,
  onThemeChange,
  componentDisplayName,
  componentDescription,
}: MonacoEditorInternalProps & {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  componentDisplayName?: string;
  componentDescription?: string;
}) {
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
    if (onCodeChange) {
      onCodeChange(sandpack.files);
    }
  };

  const handleUndo = () => {
    editorRef.current?.trigger("source", "undo", null);
  };

  const handleReset = () => {
    updateCode(initialCode);
  };

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || "";
    // Update the code in Sandpack - this will trigger the preview to update
    updateCode(newCode);
    
    // Call onCodeChange callback with updated files
    if (onCodeChange) {
      // Create updated files object with the new code for the active file
      const updatedFiles = {
        ...sandpack.files,
        [sandpack.activeFile]: {
          ...sandpack.files[sandpack.activeFile],
          code: newCode,
        },
      };
      onCodeChange(updatedFiles);
    }
  };

  return (
    <SandpackStack style={{ height: "100%", margin: 0 }}>
      <div className="bg-muted/50 border-b border-border shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0 shrink">
            {componentDisplayName && (
              <h1 className="font-semibold truncate">{componentDisplayName}</h1>
            )}
            {componentDescription && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">{componentDescription}</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="flex items-center gap-2">
              <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
              <SaveStatusIndicator status={saveStatus} />
            </div>
            {!readOnly && (
              <div className="flex items-center gap-1">
                <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
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
                  className="h-7 px-3 ml-1"
                  onClick={handleSave}
                  disabled={saveStatus === "saving"}
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-border h-10">
          <EditorTabs />
        </div>
      </div>
      <div
        style={{
          flex: 1,
          background: "var(--background)",
          height: "calc(100% - 90px)",
        }}
      >
        <Editor
          width="100%"
          height="100%"
          language="typescript"
          theme={theme === "dark" ? "vs-dark" : "light"}
          key={sandpack.activeFile}
          defaultValue={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            readOnly: readOnly,
            renderValidationDecorations: "off",
            showUnused: false,
            showDeprecated: false,
            automaticLayout: true,
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
  onCodeChange?: (files: Record<string, { code: string }>) => void;
  dependencies?: Record<string, string>;
  componentName: string;
  saveStatus?: SaveStatus;
  componentDisplayName?: string;
  componentDescription?: string;
}

const getAppCode = (isDark: boolean) => `import React, { useEffect, useLayoutEffect } from "react";
import * as Preview from "./Preview";
import { cn } from "@/lib/utils";
import "./styles/globals.css";

const configureTailwind = () => {
  if (typeof window === "undefined") return;
  
  const setConfig = () => {
    if (typeof window.tailwind !== "undefined") {
      window.tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              background: "var(--background)",
              foreground: "var(--foreground)",
              card: "var(--card)",
              "card-foreground": "var(--card-foreground)",
              popover: "var(--popover)",
              "popover-foreground": "var(--popover-foreground)",
              primary: "var(--primary)",
              "primary-foreground": "var(--primary-foreground)",
              secondary: "var(--secondary)",
              "secondary-foreground": "var(--secondary-foreground)",
              muted: "var(--muted)",
              "muted-foreground": "var(--muted-foreground)",
              accent: "var(--accent)",
              "accent-foreground": "var(--accent-foreground)",
              destructive: "var(--destructive)",
              "destructive-foreground": "var(--destructive-foreground)",
              border: "var(--border)",
              input: "var(--input)",
              ring: "var(--ring)",
              sidebar: "var(--sidebar)",
              "sidebar-foreground": "var(--sidebar-foreground)",
              "sidebar-primary": "var(--sidebar-primary)",
              "sidebar-primary-foreground": "var(--sidebar-primary-foreground)",
              "sidebar-accent": "var(--sidebar-accent)",
              "sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
              "sidebar-border": "var(--sidebar-border)",
              "sidebar-ring": "var(--sidebar-ring)",
              "chart-1": "var(--chart-1)",
              "chart-2": "var(--chart-2)",
              "chart-3": "var(--chart-3)",
              "chart-4": "var(--chart-4)",
              "chart-5": "var(--chart-5)"
            },
            borderRadius: {
              xs: "calc(var(--radius) - 6px)",
              sm: "calc(var(--radius) - 4px)",
              md: "calc(var(--radius) - 2px)",
              lg: "var(--radius)",
              xl: "calc(var(--radius) + 4px)"
            },
            boxShadow: {
              "2xs": "var(--shadow-2xs)",
              xs: "var(--shadow-xs)",
              sm: "var(--shadow-sm)",
              DEFAULT: "var(--shadow)",
              md: "var(--shadow-md)",
              lg: "var(--shadow-lg)",
              xl: "var(--shadow-xl)",
              "2xl": "var(--shadow-2xl)"
            },
            fontFamily: {
              sans: "var(--font-sans, ui-sans-serif, system-ui)",
              mono: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo)",
              serif: "var(--font-serif, ui-serif, Georgia)"
            },
            letterSpacing: {
              tighter: "var(--tracking-tighter, -0.05em)",
              tight: "var(--tracking-tight, -0.025em)",
              normal: "var(--tracking-normal, 0em)",
              wide: "var(--tracking-wide, 0.025em)",
              wider: "var(--tracking-wider, 0.05em)",
              widest: "var(--tracking-widest, 0.1em)"
            },
            spacing: {
              px: "1px",
              0: "0",
              0.5: "calc(var(--spacing, 0.25rem) * 0.5)",
              1: "var(--spacing, 0.25rem)",
              1.5: "calc(var(--spacing, 0.25rem) * 1.5)",
              2: "calc(var(--spacing, 0.25rem) * 2)",
              2.5: "calc(var(--spacing, 0.25rem) * 2.5)",
              3: "calc(var(--spacing, 0.25rem) * 3)",
              3.5: "calc(var(--spacing, 0.25rem) * 3.5)",
              4: "calc(var(--spacing, 0.25rem) * 4)",
              5: "calc(var(--spacing, 0.25rem) * 5)",
              6: "calc(var(--spacing, 0.25rem) * 6)",
              7: "calc(var(--spacing, 0.25rem) * 7)",
              8: "calc(var(--spacing, 0.25rem) * 8)",
              9: "calc(var(--spacing, 0.25rem) * 9)",
              10: "calc(var(--spacing, 0.25rem) * 10)",
              11: "calc(var(--spacing, 0.25rem) * 11)",
              12: "calc(var(--spacing, 0.25rem) * 12)",
              14: "calc(var(--spacing, 0.25rem) * 14)",
              16: "calc(var(--spacing, 0.25rem) * 16)",
              20: "calc(var(--spacing, 0.25rem) * 20)",
              24: "calc(var(--spacing, 0.25rem) * 24)",
              28: "calc(var(--spacing, 0.25rem) * 28)",
              32: "calc(var(--spacing, 0.25rem) * 32)",
              36: "calc(var(--spacing, 0.25rem) * 36)",
              40: "calc(var(--spacing, 0.25rem) * 40)",
              44: "calc(var(--spacing, 0.25rem) * 44)",
              48: "calc(var(--spacing, 0.25rem) * 48)",
              52: "calc(var(--spacing, 0.25rem) * 52)",
              56: "calc(var(--spacing, 0.25rem) * 56)",
              60: "calc(var(--spacing, 0.25rem) * 60)",
              64: "calc(var(--spacing, 0.25rem) * 64)",
              72: "calc(var(--spacing, 0.25rem) * 72)",
              80: "calc(var(--spacing, 0.25rem) * 80)",
              96: "calc(var(--spacing, 0.25rem) * 96)"
            }
          }
        }
      };
      return true;
    }
    return false;
  };
  
  // Try to set config immediately
  if (!setConfig()) {
    // If tailwind isn't loaded yet, poll for it
    const interval = setInterval(() => {
      if (setConfig()) {
        clearInterval(interval);
      }
    }, 50);
    // Stop trying after 5 seconds
    setTimeout(() => clearInterval(interval), 5000);
  }
};

export default function App() {
  const isDark = ${isDark};

  // Use useLayoutEffect to set dark mode class before first paint
  useLayoutEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    configureTailwind();
  }, []);

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
    let needsRefresh = false;

    if (code !== prevCodeRef.current) {
      sandpack.updateFile(componentPath, code);
      prevCodeRef.current = code;
      needsRefresh = true;
    }

    if (previewCode !== prevPreviewCodeRef.current) {
      sandpack.updateFile("/Preview.tsx", previewCode);
      prevPreviewCodeRef.current = previewCode;
      needsRefresh = true;
    }

    if (globalCss !== prevCssRef.current) {
      sandpack.updateFile("/styles/globals.css", globalCss);
      prevCssRef.current = globalCss;
      needsRefresh = true;
    }

    if (isDark !== prevIsDarkRef.current) {
      sandpack.updateFile("/App.tsx", getAppCode(isDark));
      prevIsDarkRef.current = isDark;
      needsRefresh = true;
    }

    // Force a refresh of the preview when dark mode changes
    if (needsRefresh && sandpack.runSandpack) {
      // Small delay to ensure file updates are processed
      setTimeout(() => {
        sandpack.runSandpack();
      }, 100);
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
  onCodeChange,
  dependencies,
  componentName,
  saveStatus,
  componentDisplayName,
  componentDescription,
}: ComponentEditorProps) {
  const { theme, resolvedTheme } = useTheme();
  const componentPath = `/components/ui/${componentName}.tsx`;
  const [currentTheme, setCurrentTheme] = useState("default");
  const [generatedCss, setGeneratedCss] = useState(DEFAULT_GLOBAL_CSS);
  const [isThemeManuallySelected, setIsThemeManuallySelected] = useState(false);

  // Update CSS when theme changes
  const handleThemeChange = (newTheme: string) => {
    setCurrentTheme(newTheme);
    setGeneratedCss(getThemeCss(newTheme));
    setIsThemeManuallySelected(true);
  };

  // Use generated CSS when a theme is manually selected, otherwise fall back to globalCss prop
  const effectiveCss = isThemeManuallySelected
    ? generatedCss
    : globalCss && globalCss.trim().length > 0
      ? globalCss
      : generatedCss;

  const isDark = React.useMemo(() => resolvedTheme === "dark", [resolvedTheme]);

  // Include currentTheme to ensure SandpackProvider remounts with new theme CSS.
  // Include isDark to ensure initial render has correct dark mode state.
  const files = React.useMemo(
    () => ({
      "/App.tsx": getAppCode(isDark),
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
    [componentPath, isDark, effectiveCss, code, previewCode, globalCss]
  );

  const options = React.useMemo(
    () => ({
      externalResources: [
        "https://cdn.tailwindcss.com?plugins=forms,typography",
        // Google Fonts used by tweakcn themes
        "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&family=Source+Serif+4:wght@200..900&family=Geist+Mono:wght@100..900&family=Bricolage+Grotesque:wght@200..800&family=Playfair+Display:wght@400..900&family=DM+Serif+Display&family=IBM+Plex+Mono:wght@100..700&family=Fira+Code:wght@300..700&family=Space+Grotesk:wght@300..700&family=Source+Code+Pro:wght@200..900&family=Outfit:wght@100..900&family=Poppins:wght@100..900&family=DM+Sans:wght@100..900&family=Lora:wght@400..700&family=Merriweather:wght@300..900&family=Rubik:wght@300..900&family=Space+Mono:wght@400;700&family=Archivo:wght@100..900&family=Inconsolata:wght@200..900&family=Montserrat:wght@100..900&family=Lato:wght@100..900&family=Nunito:wght@200..900&family=Quicksand:wght@300..700&family=Raleway:wght@100..900&family=Work+Sans:wght@100..900&family=Karla:wght@200..800&family=Press+Start+2P&family=Pixelify+Sans:wght@400..700&family=VT323&family=Courier+Prime:wght@400;700&display=swap",
      ],
      activeFile: "/Preview.tsx",
      visibleFiles: ["/Preview.tsx", componentPath, "/styles/globals.css"],
      showUnused: false,
      showDeprecated: false,
      // Enable immediate preview updates when code changes
      recompileMode: "immediate" as const,
      recompileDelay: 0,
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
    <div className="h-full w-full">
      <SandpackProvider
        key={`sandpack-${currentTheme}-${isDark ? "dark" : "light"}`}
        template="react-ts"
        theme={theme === "dark" ? "dark" : "light"}
        files={files}
        options={options}
        customSetup={customSetup}
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <CodeSync
          code={code}
          previewCode={previewCode}
          globalCss={effectiveCss}
          componentPath={componentPath}
          isDark={isDark}
        />
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 min-h-0"
        >
          <ResizablePanel defaultSize={50} minSize={25}>
            <MonacoEditorInternal
              readOnly={readOnly}
              onSave={onSave}
              onCodeChange={onCodeChange}
              componentPath={componentPath}
              saveStatus={saveStatus}
              initialCode={code}
              currentTheme={currentTheme}
              onThemeChange={handleThemeChange}
              componentDisplayName={componentDisplayName}
              componentDescription={componentDescription}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={25}>
            <div className="h-full w-full p-4 bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="h-full w-full bg-background rounded-md overflow-hidden shadow-sm border border-border/50">
                <SandpackPreview
                  style={{ height: "100%", width: "100%" }}
                  showOpenInCodeSandbox={false}
                  showRefreshButton={true}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </SandpackProvider>
    </div>
  );
}

