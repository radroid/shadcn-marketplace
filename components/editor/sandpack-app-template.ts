/**
 * App template code for the Sandpack preview.
 * This configures Tailwind CSS and handles dark mode.
 */

export const getAppCode = (isDark: boolean) => `import React, { useEffect, useLayoutEffect } from "react";
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

/**
 * Utility code for cn function
 */
export const UTILS_CODE = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`;

/**
 * TypeScript config for Sandpack
 */
export const TSCONFIG_CODE = `{
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
}`;

