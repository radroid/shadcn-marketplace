"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
  SandpackLayout,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";
import { SaveStatus } from "./SaveStatusIndicator";
import { EditorToolbar } from "./EditorToolbar";
import { EditorTabs } from "./EditorTabs";
import { DEFAULT_GLOBAL_CSS, getThemeCss } from "./theme-generator";
import { getAppCode, UTILS_CODE, TSCONFIG_CODE } from "./sandpack-app-template";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

// =============================================================================
// Types
// =============================================================================

export interface ComponentEditorProps {
  /** The component source code */
  code: string;
  /** The preview/demo code that uses the component */
  previewCode: string;
  /** Optional global CSS styles */
  globalCss?: string;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Callback when user saves */
  onSave?: (files: Record<string, { code: string }>) => void;
  /** Callback when code changes */
  onCodeChange?: (files: Record<string, { code: string }>) => void;
  /** NPM dependencies for the component */
  dependencies?: Record<string, string>;
  /** Component name (used for file path) */
  componentName: string;
  /** Current save status */
  saveStatus?: SaveStatus;
  /** Display name shown in toolbar */
  componentDisplayName?: string;
  /** Description shown in toolbar */
  componentDescription?: string;
}

// =============================================================================
// Constants
// =============================================================================

const EXTERNAL_RESOURCES = [
  "https://cdn.tailwindcss.com?plugins=forms,typography",
  // Google Fonts used by tweakcn themes
  "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&family=Source+Serif+4:wght@200..900&family=Geist+Mono:wght@100..900&family=Bricolage+Grotesque:wght@200..800&family=Playfair+Display:wght@400..900&family=DM+Serif+Display&family=IBM+Plex+Mono:wght@100..700&family=Fira+Code:wght@300..700&family=Space+Grotesk:wght@300..700&family=Source+Code+Pro:wght@200..900&family=Outfit:wght@100..900&family=Poppins:wght@100..900&family=DM+Sans:wght@100..900&family=Lora:wght@400..700&family=Merriweather:wght@300..900&family=Rubik:wght@300..900&family=Space+Mono:wght@400;700&family=Archivo:wght@100..900&family=Inconsolata:wght@200..900&family=Montserrat:wght@100..900&family=Lato:wght@100..900&family=Nunito:wght@200..900&family=Quicksand:wght@300..700&family=Raleway:wght@100..900&family=Work+Sans:wght@100..900&family=Karla:wght@200..800&family=Press+Start+2P&family=Pixelify+Sans:wght@400..700&family=VT323&family=Courier+Prime:wght@400;700&display=swap",
];

const DEFAULT_DEPENDENCIES = {
  "lucide-react": "latest",
  clsx: "latest",
  "tailwind-merge": "latest",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@types/node": "^20.0.0",
};

// =============================================================================
// Internal Editor Component (lives inside SandpackProvider)
// =============================================================================

interface InternalEditorProps {
  componentPath: string;
  initialCode: string;
  readOnly?: boolean;
  saveStatus: SaveStatus;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  onSave?: (files: Record<string, { code: string }>) => void;
  onCodeChange?: (files: Record<string, { code: string }>) => void;
  componentDisplayName?: string;
  componentDescription?: string;
  lastSavedFiles?: Record<string, { code: string }>;
  onLastSavedUpdate?: (files: Record<string, { code: string }>) => void;
}

function InternalEditor({
  componentPath,
  initialCode,
  readOnly,
  saveStatus,
  currentTheme,
  onThemeChange,
  onSave,
  onCodeChange,
  componentDisplayName,
  componentDescription,
  lastSavedFiles,
  onLastSavedUpdate,
}: InternalEditorProps) {
  const { sandpack } = useSandpack();
  const saveStatusRef = useRef(saveStatus);
  
  // Keep ref in sync with saveStatus
  useEffect(() => {
    saveStatusRef.current = saveStatus;
  }, [saveStatus]);
  
  // Update last saved files when save is successful
  useEffect(() => {
    if (saveStatus === 'saved' && onLastSavedUpdate) {
      // Create a snapshot of current files as the last saved state
      const savedFiles: Record<string, { code: string }> = {};
      for (const [path, file] of Object.entries(sandpack.files)) {
        const fileCode = typeof file === 'string' ? file : file.code;
        savedFiles[path] = { code: fileCode };
      }
      onLastSavedUpdate(savedFiles);
    }
  }, [saveStatus, sandpack.files, onLastSavedUpdate]);

  // Track if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (!lastSavedFiles) return false;
    
    const currentFiles = sandpack.files;
    const savedFiles = lastSavedFiles;
    
    // Helper to get code from file (handles both string and object formats)
    const getFileCode = (file: string | { code: string } | { code: string; hidden?: boolean }): string => {
      return typeof file === 'string' ? file : file.code;
    };
    
    // Check if any file has changed
    for (const [path, file] of Object.entries(currentFiles)) {
      const savedFile = savedFiles[path];
      const currentCode = getFileCode(file);
      const savedCode = savedFile ? getFileCode(savedFile) : '';
      
      if (currentCode !== savedCode) {
        return true;
      }
    }
    
    // Check if any saved file was deleted
    for (const path of Object.keys(savedFiles)) {
      if (!currentFiles[path]) {
        return true;
      }
    }
    
    return false;
  }, [sandpack.files, lastSavedFiles]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(sandpack.files);
    }
    if (onCodeChange) {
      onCodeChange(sandpack.files);
    }
    // Note: lastSavedFiles will be updated when saveStatus becomes 'saved'
  }, [onSave, onCodeChange, sandpack.files]);

  const handleReset = useCallback(() => {
    if (!lastSavedFiles) {
      // Fallback to resetting to initial if no saved state
      sandpack.resetFile(sandpack.activeFile);
      return;
    }
    
    // Reset all files to last saved state
    for (const [path, file] of Object.entries(lastSavedFiles)) {
      sandpack.updateFile(path, file.code);
    }
  }, [sandpack, lastSavedFiles]);

  // Auto-save every 30 seconds when there are unsaved changes
  useEffect(() => {
    // Only auto-save if there are changes and not currently saving
    if (!hasChanges || saveStatusRef.current === 'saving' || !onSave) {
      return;
    }

    const autoSaveInterval = setInterval(() => {
      // Double-check that we still have changes and aren't saving
      // Use ref to get current saveStatus value
      if (saveStatusRef.current !== 'saving') {
        handleSave();
      }
    }, 30000); // 30 seconds

    return () => {
      clearInterval(autoSaveInterval);
    };
  }, [hasChanges, handleSave, onSave]);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <EditorToolbar
        componentDisplayName={componentDisplayName}
        componentDescription={componentDescription}
        currentTheme={currentTheme}
        onThemeChange={onThemeChange}
        saveStatus={saveStatus}
        readOnly={readOnly}
        onReset={handleReset}
        onSave={handleSave}
        hasChanges={hasChanges}
      />

      {/* File Tabs */}
      <div className="border-b border-border bg-muted/50">
        <EditorTabs />
      </div>

      {/* Code Editor */}
      <div className="flex-1 min-h-0">
        <SandpackCodeEditor
          showTabs={false}
          showLineNumbers
          showInlineErrors
          wrapContent
          readOnly={readOnly}
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
}

// =============================================================================
// Preview Panel Component
// =============================================================================

function PreviewPanel() {
  return (
    <div className="h-full w-full p-4 bg-muted/30 rounded-lg flex items-center justify-center">
      <div className="h-full w-full bg-background rounded-md overflow-hidden shadow-sm border border-border/50">
        <SandpackPreview
          style={{ height: "100%", width: "100%" }}
          showOpenInCodeSandbox={false}
          showRefreshButton
        />
      </div>
    </div>
  );
}

// =============================================================================
// Hooks
// =============================================================================

function useEffectiveCss(
  globalCss: string | undefined,
  isThemeManuallySelected: boolean,
  generatedCss: string
) {
  return useMemo(() => {
    if (isThemeManuallySelected) {
      return generatedCss;
    }
    if (globalCss && globalCss.trim().length > 0) {
      return globalCss;
    }
    return generatedCss;
  }, [globalCss, isThemeManuallySelected, generatedCss]);
}

function useSandpackFiles(
  componentPath: string,
  code: string,
  previewCode: string,
  effectiveCss: string,
  isDark: boolean
) {
  return useMemo(
    () => ({
      "/App.tsx": getAppCode(isDark),
      "/Preview.tsx": previewCode,
      [componentPath]: code,
      "/lib/utils.ts": {
        code: UTILS_CODE,
        hidden: true,
      },
      "/styles/globals.css": effectiveCss,
      "/tsconfig.json": {
        code: TSCONFIG_CODE,
        hidden: true,
      },
    }),
    [componentPath, isDark, effectiveCss, code, previewCode]
  );
}

function useSandpackOptions(componentPath: string) {
  return useMemo(
    () => ({
      externalResources: EXTERNAL_RESOURCES,
      activeFile: "/Preview.tsx",
      visibleFiles: ["/Preview.tsx", componentPath, "/styles/globals.css"],
      autoReload: true,
      autorun: true,
      recompileMode: "immediate" as const,
      recompileDelay: 0,
    }),
    [componentPath]
  );
}

function useSandpackSetup(dependencies?: Record<string, string>) {
  const serializedDeps = JSON.stringify(dependencies);
  return useMemo(
    () => ({
      dependencies: {
        ...DEFAULT_DEPENDENCIES,
        ...(dependencies || {}),
      },
    }),
    [serializedDeps]
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function ComponentEditor({
  code,
  previewCode,
  globalCss,
  readOnly,
  onSave,
  onCodeChange,
  dependencies,
  componentName,
  saveStatus = "idle",
  componentDisplayName,
  componentDescription,
}: ComponentEditorProps) {
  const { theme, resolvedTheme } = useTheme();
  const componentPath = `/components/ui/${componentName}.tsx`;

  // Theme state
  const [currentTheme, setCurrentTheme] = useState("default");
  const [generatedCss, setGeneratedCss] = useState(DEFAULT_GLOBAL_CSS);
  const [isThemeManuallySelected, setIsThemeManuallySelected] = useState(false);
  
  // Track last saved files state
  const [lastSavedFiles, setLastSavedFiles] = useState<Record<string, { code: string }> | undefined>(undefined);

  const handleThemeChange = useCallback((newTheme: string) => {
    setCurrentTheme(newTheme);
    setGeneratedCss(getThemeCss(newTheme));
    setIsThemeManuallySelected(true);
  }, []);

  // Computed values
  const isDark = useMemo(() => resolvedTheme === "dark", [resolvedTheme]);
  const effectiveCss = useEffectiveCss(globalCss, isThemeManuallySelected, generatedCss);

  // Sandpack configuration
  const files = useSandpackFiles(componentPath, code, previewCode, effectiveCss, isDark);
  const options = useSandpackOptions(componentPath);
  const customSetup = useSandpackSetup(dependencies);

  // Initialize last saved files when component data changes
  useEffect(() => {
    if (files && Object.keys(files).length > 0) {
      // Create a deep copy of the files for last saved state
      const savedFiles: Record<string, { code: string }> = {};
      for (const [path, file] of Object.entries(files)) {
        savedFiles[path] = { code: typeof file === 'string' ? file : file.code };
      }
      setLastSavedFiles(savedFiles);
    }
  }, [code, previewCode, effectiveCss]); // Update when source data changes

  // Note: lastSavedFiles is updated in InternalEditor when saveStatus becomes 'saved'

  // Key for forcing SandpackProvider remount when theme changes
  const providerKey = `sandpack-${currentTheme}-${isDark ? "dark" : "light"}`;

  return (
    <div className="h-full w-full">
      <SandpackProvider
        key={providerKey}
        template="react-ts"
        theme={theme === "dark" ? "dark" : "light"}
        files={files}
        options={options}
        customSetup={customSetup}
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
          {/* Editor Panel */}
          <ResizablePanel defaultSize={50} minSize={25}>
            <InternalEditor
              componentPath={componentPath}
              initialCode={code}
              readOnly={readOnly}
              saveStatus={saveStatus}
              currentTheme={currentTheme}
              onThemeChange={handleThemeChange}
              onSave={onSave}
              onCodeChange={onCodeChange}
              componentDisplayName={componentDisplayName}
              componentDescription={componentDescription}
              lastSavedFiles={lastSavedFiles}
              onLastSavedUpdate={setLastSavedFiles}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Preview Panel */}
          <ResizablePanel defaultSize={50} minSize={25}>
            <PreviewPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </SandpackProvider>
    </div>
  );
}
