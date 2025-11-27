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
  const destructiveForegroundLight = light["destructive-foreground"] || formatColorValue("destructive-foreground", "0 0% 98%");
  const destructiveForegroundDark = dark["destructive-foreground"] || formatColorValue("destructive-foreground", "0 0% 98%");

  // Only add destructive-foreground if it's not already in the vars
  const hasDestructiveForeground = "destructive-foreground" in light;
  const destructiveForegroundVar = hasDestructiveForeground
    ? ""
    : `\n  --destructive-foreground: ${destructiveForegroundLight};`;

  return `@custom-variant dark (&:is(.dark *));

:root {
${sharedVars}
${lightVars}${destructiveForegroundVar}
}

.dark {
${darkVars}${hasDestructiveForeground ? "" : `\n  --destructive-foreground: ${destructiveForegroundDark};`}
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;
}

export const DEFAULT_GLOBAL_CSS = getThemeCss("default");
