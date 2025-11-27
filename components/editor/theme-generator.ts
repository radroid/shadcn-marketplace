import registry from "./registry.json";

export function getThemeCss(themeName: string = "default"): string {
  const theme = registry.items.find((item) => item.name === themeName);
  if (!theme) {
    console.warn(`Theme '${themeName}' not found in registry. Using default.`);
    return getThemeCss("default");
  }

  const { light, dark, theme: shared } = theme.cssVars;

  // Convert HSL to OKLCH format (simplified - in production you'd want proper conversion)
  // For now, we'll use the values as-is from registry (they're in HSL format)
  // You may need to convert them to OKLCH if your design system uses OKLCH

  // Format HSL color values properly (wrap in hsl() if it's a color value)
  const formatColorValue = (key: string, value: string): string => {
    // If it's radius or other non-color values, return as-is
    if (key === "radius") {
      return value;
    }
    // If it's already wrapped in a function, return as-is
    if (value.includes("(") || value.includes("oklch") || value.includes("rgb")) {
      return value;
    }
    // Format HSL values: "0 0% 100%" -> "hsl(0 0% 100%)"
    if (/^\d+(\s+\d+%){2}$/.test(value.trim())) {
      return `hsl(${value})`;
    }
    return value;
  };

  const lightVars = Object.entries(light)
    .map(([key, value]) => `  --${key}: ${formatColorValue(key, value)};`)
    .join("\n");

  const darkVars = Object.entries(dark)
    .map(([key, value]) => `  --${key}: ${formatColorValue(key, value)};`)
    .join("\n");

  const sharedVars = Object.entries(shared)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join("\n");

  // Destructive foreground (if not in registry, add default)
  const destructiveForegroundLight =
    light["destructive-foreground"] ||
    formatColorValue("destructive-foreground", "0 0% 98%");
  const destructiveForegroundDark =
    dark["destructive-foreground"] ||
    formatColorValue("destructive-foreground", "0 0% 98%");

  // Only add destructive-foreground if it's not already in the vars
  const hasDestructiveForeground = "destructive-foreground" in light;
  const destructiveForegroundVar = hasDestructiveForeground
    ? ""
    : `\n  --destructive-foreground: ${destructiveForegroundLight};`;

  const destructiveDarkVar = hasDestructiveForeground
    ? ""
    : `\n  --destructive-foreground: ${destructiveForegroundDark};`;

  return `:root {
${sharedVars}
${lightVars}${destructiveForegroundVar}
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
}
`;
}

export const DEFAULT_GLOBAL_CSS = getThemeCss("default");
