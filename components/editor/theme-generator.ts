import registry from "./registry.json";

// Non-color CSS variable keys that should not be wrapped in color functions
const NON_COLOR_KEYS = new Set([
  "radius",
  "font-sans",
  "font-serif",
  "font-mono",
  "spacing",
  "tracking-normal",
  "tracking-tighter",
  "tracking-tight",
  "tracking-wide",
  "tracking-wider",
  "tracking-widest",
  "letter-spacing",
  "shadow-color",
  "shadow-opacity",
  "shadow-blur",
  "shadow-spread",
  "shadow-offset-x",
  "shadow-offset-y",
  "shadow-x",
  "shadow-y",
  "shadow-2xs",
  "shadow-xs",
  "shadow-sm",
  "shadow",
  "shadow-md",
  "shadow-lg",
  "shadow-xl",
  "shadow-2xl",
]);

export function getThemeCss(themeName: string = "default"): string {
  const theme = registry.items.find((item) => item.name === themeName);
  if (!theme) {
    console.warn(`Theme '${themeName}' not found in registry. Using default.`);
    return getThemeCss("default");
  }

  const { light, dark, theme: shared } = theme.cssVars;

  // Format CSS values properly
  const formatValue = (key: string, value: string): string => {
    // If it's a non-color value, return as-is
    if (NON_COLOR_KEYS.has(key)) {
      return value;
    }
    // If it's already wrapped in a function (oklch, hsl, rgb, etc.), return as-is
    if (value.includes("(")) {
      return value;
    }
    // If it starts with # (hex color), return as-is
    if (value.startsWith("#")) {
      return value;
    }
    // Format bare HSL values: "0 0% 100%" -> "hsl(0 0% 100%)"
    if (/^\d+(\s+\d+%){2}$/.test(value.trim())) {
      return `hsl(${value})`;
    }
    return value;
  };

  const lightVars = Object.entries(light || {})
    .map(([key, value]) => `  --${key}: ${formatValue(key, value as string)};`)
    .join("\n");

  const darkVars = Object.entries(dark || {})
    .map(([key, value]) => `  --${key}: ${formatValue(key, value as string)};`)
    .join("\n");

  const sharedVars = shared
    ? Object.entries(shared)
        .map(([key, value]) => `  --${key}: ${value};`)
        .join("\n")
    : "";

  // Destructive foreground (if not in registry, add default)
  const hasDestructiveForeground = light && "destructive-foreground" in light;
  const destructiveForegroundVar = hasDestructiveForeground
    ? ""
    : "\n  --destructive-foreground: hsl(0 0% 98%);";

  const hasDestructiveForegroundDark = dark && "destructive-foreground" in dark;
  const destructiveDarkVar = hasDestructiveForegroundDark
    ? ""
    : "\n  --destructive-foreground: hsl(0 0% 98%);";

  return `:root {
${sharedVars ? sharedVars + "\n" : ""}${lightVars}${destructiveForegroundVar}
}

.dark {
${darkVars}${destructiveDarkVar}
}

*,
*::before,
*::after {
  border-color: var(--border);
  outline-color: var(--ring);
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans, "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  letter-spacing: var(--tracking-normal, 0em);
}
`;
}

export const DEFAULT_GLOBAL_CSS = getThemeCss("default");
