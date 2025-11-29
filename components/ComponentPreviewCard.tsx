"use client";

import { useMemo } from "react";
import { SandpackProvider, SandpackPreview } from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";
import { getAppCode, UTILS_CODE, TSCONFIG_CODE } from "./editor/sandpack-app-template";
import { DEFAULT_GLOBAL_CSS } from "./editor/theme-generator";
import { REGISTRY } from "./registry";

// Constants matching ComponentEditor
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

interface ComponentPreviewCardProps {
  code: string;
  previewCode: string;
  globalCss?: string;
  dependencies?: Record<string, string>;
  componentName: string;
  registryDependenciesCode?: Record<string, { code: string; dependencies?: Record<string, string> }>;
  isUserComponent?: boolean;
}

export function ComponentPreviewCard({
  code,
  previewCode,
  globalCss,
  dependencies,
  componentName,
  registryDependenciesCode,
  isUserComponent = false,
}: ComponentPreviewCardProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark" || (resolvedTheme === undefined && theme === "dark");

  const componentPath = `/components/ui/${componentName}.tsx`;

  // Build registry dependency files
  const registryFiles = useMemo(() => {
    if (!registryDependenciesCode) return {};

    const files = Object.entries(registryDependenciesCode).reduce(
      (acc, [name, data]) => ({
        ...acc,
        [`/components/ui/${name}.tsx`]: {
          code: data.code,
          hidden: false,
        },
      }),
      {} as Record<string, { code: string; hidden: boolean }>
    );

    return files;
  }, [registryDependenciesCode]);

  // Match the exact file structure from ComponentEditor
  const files = useMemo(() => {
    const effectiveCss = globalCss || DEFAULT_GLOBAL_CSS;

    return {
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
      ...registryFiles,
    };
  }, [code, previewCode, globalCss, componentName, isDark, registryFiles]);

  // Match the exact options from ComponentEditor
  const registryFilePaths = useMemo(() => {
    if (!registryDependenciesCode) return [];
    return Object.keys(registryDependenciesCode).map(name => `/components/ui/${name}.tsx`);
  }, [registryDependenciesCode]);

  const options = useMemo(
    () => ({
      externalResources: EXTERNAL_RESOURCES,
      activeFile: "/Preview.tsx",
      visibleFiles: ["/Preview.tsx", componentPath, "/styles/globals.css", ...registryFilePaths],
      autoReload: true,
      autorun: true,
      recompileMode: "immediate" as const,
      recompileDelay: 0,
    }),
    [componentPath, registryFilePaths]
  );

  // Match the exact dependency setup from ComponentEditor
  const customSetup = useMemo(
    () => {
      // Collect all NPM dependencies from registry components
      const registryNpmDeps = registryDependenciesCode
        ? Object.values(registryDependenciesCode).reduce((acc, component) => {
          return { ...acc, ...(component.dependencies || {}) };
        }, {} as Record<string, string>)
        : {};

      return {
        dependencies: {
          ...DEFAULT_DEPENDENCIES,
          ...registryNpmDeps,
          ...(dependencies || {}),
        },
      };
    },
    [dependencies, registryDependenciesCode]
  );

  // Create a key that changes when component data changes to force Sandpack remount
  // This ensures live updates work correctly when component data changes
  // Using a hash-like approach based on content length and key parts
  const providerKey = useMemo(() => {
    const codeHash = code.length + (code.slice(0, 20) + code.slice(-20)).replace(/\s/g, '').length;
    const previewHash = previewCode.length + (previewCode.slice(0, 20) + previewCode.slice(-20)).replace(/\s/g, '').length;
    const cssHash = globalCss ? globalCss.length : 0;
    const registryHash = registryDependenciesCode 
      ? Object.keys(registryDependenciesCode).join(',') 
      : '';
    return `preview-${componentName}-${codeHash}-${previewHash}-${cssHash}-${registryHash}-${isDark ? "dark" : "light"}`;
  }, [componentName, code, previewCode, globalCss, registryDependenciesCode, isDark]);

  // Only use REGISTRY for catalog components, not user components
  // User components should always use Sandpack to show edited code
  const LocalPreview = !isUserComponent ? REGISTRY[componentName] : null;

  if (LocalPreview) {
    return (
      <div className="aspect-video w-full rounded-md border bg-muted/30 overflow-hidden flex items-center justify-center p-4">
        <div className="bg-background p-8 rounded-lg shadow-sm border flex items-center justify-center min-w-[200px] min-h-[100px]">
          <LocalPreview />
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-md border bg-muted overflow-hidden">
      <SandpackProvider
        key={providerKey}
        template="react-ts"
        theme={isDark ? "dark" : "light"}
        files={files}
        options={options}
        customSetup={customSetup}
        style={{ height: "100%", width: "100%" }}
      >
        <div className="h-full w-full">
          <SandpackPreview
            style={{ height: "100%", width: "100%" }}
            showOpenInCodeSandbox={true}
            showRefreshButton={false}
            showNavigator={false}
          />
        </div>
      </SandpackProvider>
    </div>
  );
}

