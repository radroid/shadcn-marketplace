import registry from "./registry.json";

export function getThemeCss(themeName: string = "default"): string {
    const theme = registry.items.find((item) => item.name === themeName);
    if (!theme) {
        console.warn(`Theme '${themeName}' not found in registry. Using default.`);
        return getThemeCss("default");
    }

    const { light, dark, theme: shared } = theme.cssVars;

    const lightVars = Object.entries(light)
        .map(([key, value]) => `    --${key}: ${value};`)
        .join("\n");

    const darkVars = Object.entries(dark)
        .map(([key, value]) => `    --${key}: ${value};`)
        .join("\n");

    const sharedVars = Object.entries(shared)
        .map(([key, value]) => `    --${key}: ${value};`)
        .join("\n");

    return `@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

:root {
${sharedVars}
${lightVars}
}

.dark {
${darkVars}
}
`;
}

export const DEFAULT_GLOBAL_CSS = getThemeCss("default");
