"use client";

import React, { useMemo } from "react";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import registry from "./registry.json";
import { detectThemeFromCss, getThemeCss } from "./theme-generator";

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  globalCss?: string;
}

// Helper function to normalize color values for comparison
function normalizeColorValue(value: string): string {
  // Remove whitespace
  return value.trim().toLowerCase();
}

// Helper function to convert oklch to RGB
// Uses OKLAB color space conversion
function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  // Convert hue from degrees to radians
  const hRad = (h * Math.PI) / 180;
  
  // Calculate a and b from chroma and hue (OKLCH to OKLAB)
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  
  // Convert OKLAB to linear RGB using OKLAB to linear sRGB matrix
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
  
  // Apply inverse of the OKLAB forward transform (cubic)
  const l_3 = l_ * l_ * l_;
  const m_3 = m_ * m_ * m_;
  const s_3 = s_ * s_ * s_;
  
  // Convert from linear LMS to linear RGB
  let r = +4.0767416621 * l_3 - 3.3077115913 * m_3 + 0.2309699292 * s_3;
  let g = -1.2684380046 * l_3 + 2.6097574011 * m_3 - 0.3413193965 * s_3;
  let b_ = -0.0041960863 * l_3 - 0.7034186147 * m_3 + 1.7076147010 * s_3;
  
  // Apply sRGB gamma correction
  const gamma = (val: number) => {
    if (val <= 0.0031308) {
      return 12.92 * val;
    }
    return 1.055 * Math.pow(val, 1.0 / 2.4) - 0.055;
  };
  
  r = gamma(r);
  g = gamma(g);
  b_ = gamma(b_);
  
  // Clamp and convert to 0-255
  const r255 = Math.max(0, Math.min(255, Math.round(r * 255)));
  const g255 = Math.max(0, Math.min(255, Math.round(g * 255)));
  const b255 = Math.max(0, Math.min(255, Math.round(b_ * 255)));
  
  return [r255, g255, b255];
}

// Helper function to convert oklch to a usable CSS color
function oklchToColor(l: number, c: number, h: number): string {
  try {
    const [r, g, b] = oklchToRgb(l, c, h);
    return `rgb(${r}, ${g}, ${b})`;
  } catch (e) {
    // Fallback to HSL approximation if conversion fails
    const lightness = Math.max(0, Math.min(100, l * 100));
    const maxChroma = 0.4;
    const normalizedChroma = Math.min(1, c / maxChroma);
    const saturation = Math.max(0, Math.min(100, normalizedChroma * 100));
    const hue = Math.round(h);
    return `hsl(${hue}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
  }
}

// Helper function to extract a color from CSS variable value for preview
// This converts various color formats to a usable CSS color
function extractColorFromValue(value: string): string {
  if (!value) return "#ffffff";
  
  const trimmed = value.trim();
  
  // Handle oklch format: oklch(1 0 0) or oklch(0.5 0.2 250)
  if (trimmed.startsWith("oklch(")) {
    const match = trimmed.match(/oklch\(([^)]+)\)/);
    if (match) {
      const parts = match[1].trim().split(/\s+/).filter(p => p);
      if (parts.length >= 1) {
        const l = parseFloat(parts[0]) || 0;
        const c = parts.length >= 2 ? parseFloat(parts[1]) || 0 : 0;
        const h = parts.length >= 3 ? parseFloat(parts[2]) || 0 : 0;
        return oklchToColor(l, c, h);
      }
    }
  }
  
  // Handle hex colors
  if (trimmed.startsWith("#")) {
    return trimmed;
  }
  
  // Handle hsl/rgb colors
  if (trimmed.startsWith("hsl(") || trimmed.startsWith("rgb(")) {
    return trimmed;
  }
  
  // Try to parse as a simple color name or fallback
  return trimmed || "#ffffff";
}

// Create a style preview component for a theme with 4 color dots
function ThemePreview({ themeName }: { themeName: string }) {
  const theme = registry.items.find((item) => item.name === themeName);
  
  if (!theme || !theme.cssVars) {
    return (
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <div className="w-2.5 h-2.5 rounded-full border border-border/50 bg-muted" />
        <div className="w-2.5 h-2.5 rounded-full border border-border/50 bg-muted" />
        <div className="w-2.5 h-2.5 rounded-full border border-border/50 bg-muted" />
        <div className="w-2.5 h-2.5 rounded-full border border-border/50 bg-muted" />
      </div>
    );
  }

  const lightVars = theme.cssVars.light || {};
  
  // Extract the 4 most important colors
  const primary = extractColorFromValue(
    (lightVars.primary as string) || "#000000"
  );
  const secondary = extractColorFromValue(
    (lightVars.secondary as string) || (lightVars.muted as string) || "#f5f5f5"
  );
  const accent = extractColorFromValue(
    (lightVars.accent as string) || primary
  );
  const destructive = extractColorFromValue(
    (lightVars.destructive as string) || "#ef4444"
  );

  return (
    <div className="flex items-center gap-0.5 flex-shrink-0" title={theme.label || themeName}>
      <div
        className="w-2.5 h-2.5 rounded-full border border-border/30 shadow-sm"
        style={{ backgroundColor: primary }}
        title="Primary"
      />
      <div
        className="w-2.5 h-2.5 rounded-full border border-border/30 shadow-sm"
        style={{ backgroundColor: secondary }}
        title="Secondary"
      />
      <div
        className="w-2.5 h-2.5 rounded-full border border-border/30 shadow-sm"
        style={{ backgroundColor: accent }}
        title="Accent"
      />
      <div
        className="w-2.5 h-2.5 rounded-full border border-border/30 shadow-sm"
        style={{ backgroundColor: destructive }}
        title="Destructive"
      />
    </div>
  );
}

export function ThemeSelector({
  currentTheme,
  onThemeChange,
  globalCss,
}: ThemeSelectorProps) {
  // Detect the current theme from globalCss if provided
  const detectedTheme = useMemo(() => {
    if (globalCss) {
      return detectThemeFromCss(globalCss);
    }
    return currentTheme;
  }, [globalCss, currentTheme]);

  // Use detected theme if it's different from currentTheme and globalCss is provided
  const effectiveTheme = useMemo(() => {
    // If globalCss is provided, use detected theme (which could be "custom")
    if (globalCss) {
      return detectedTheme;
    }
    return currentTheme;
  }, [globalCss, detectedTheme, currentTheme]);

  const handleThemeSelect = (value: string) => {
    if (value === effectiveTheme) return;
    onThemeChange(value);
  };

  // Helper to get theme font
  const getThemeFont = (themeName: string): string | undefined => {
    const theme = registry.items.find((item) => item.name === themeName);
    if (!theme || !theme.cssVars) return undefined;
    
    // Check theme.shared first, then light
    const sharedVars = theme.cssVars.theme || {};
    const lightVars = theme.cssVars.light || {};
    
    // Font can be in theme.shared as font-sans, or in light as font-sans
    const fontSans = (sharedVars["font-sans"] as string) || (lightVars["font-sans"] as string);
    
    if (fontSans) {
      // Extract the first font family name (before the first comma)
      // This ensures we use the primary font name that should be loaded
      const firstFont = fontSans.split(',')[0].trim().replace(/['"]/g, '');
      
      // Return the full font stack for proper fallback, but prioritize the first font
      // This ensures the font loads if available, but falls back gracefully
      return fontSans.replace(/['"]/g, '');
    }
    
    return undefined;
  };

  // Helper to get primary color for a theme
  const getPrimaryColor = (themeName: string): string | undefined => {
    const theme = registry.items.find((item) => item.name === themeName);
    if (!theme || !theme.cssVars) return undefined;
    
    const lightVars = theme.cssVars.light || {};
    const primary = lightVars.primary as string;
    
    if (primary) {
      return extractColorFromValue(primary);
    }
    
    return undefined;
  };

  // Create options from registry
  const options: ComboboxOption[] = useMemo(() => {
    const themeOptions: ComboboxOption[] = registry.items
      .filter((item) => item.type === "registry:style")
      .map((item) => {
        const themeFont = getThemeFont(item.name);
        const primaryColor = getPrimaryColor(item.name);
        const label = item.label || item.name;
        
        return {
          value: item.name,
          label: label,
          preview: <ThemePreview themeName={item.name} />,
          // Store font and primary color for use in rendering
          fontFamily: themeFont,
          primaryColor: primaryColor,
        };
      });

    // Add "Custom" option if the detected theme is custom or if we're using custom
    const isCustom = effectiveTheme === "custom" || detectedTheme === "custom";
    if (isCustom) {
      // Check if custom is already in the list (shouldn't be, but just in case)
      const hasCustom = themeOptions.some(opt => opt.value === "custom");
      if (!hasCustom) {
        themeOptions.push({
          value: "custom",
          label: "Custom",
          preview: (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full border border-border/30 shadow-sm bg-purple-500" />
              <div className="w-2.5 h-2.5 rounded-full border border-border/30 shadow-sm bg-pink-500" />
              <div className="w-2.5 h-2.5 rounded-full border border-border/30 shadow-sm bg-orange-500" />
              <div className="w-2.5 h-2.5 rounded-full border border-border/30 shadow-sm bg-red-500" />
            </div>
          ),
          primaryColor: "#a855f7", // purple-500
        });
      }
    }

    return themeOptions;
  }, [effectiveTheme, detectedTheme]);

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="theme-selector" className="text-sm font-medium whitespace-nowrap">
        Style:
      </Label>
      <Combobox
        options={options}
        value={effectiveTheme}
        onValueChange={handleThemeSelect}
        placeholder="Select style..."
        emptyText="No style found."
        className="w-[180px]"
      />
    </div>
  );
}
