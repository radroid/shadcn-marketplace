const fs = require('fs');
const path = require('path');

const csvPath = '/Users/rajdholakia/.gemini/antigravity/scratch/shadcn-marketplace/shadcn-components - shadcn-components (2).csv';
const previewsDir = '/Users/rajdholakia/.gemini/antigravity/scratch/shadcn-marketplace/components/previews';
const uiDir = '/Users/rajdholakia/.gemini/antigravity/scratch/shadcn-marketplace/components/ui';
const registryPath = '/Users/rajdholakia/.gemini/antigravity/scratch/shadcn-marketplace/components/registry.tsx';

const fileContent = fs.readFileSync(csvPath, 'utf8');

function parseCSV(text) {
    const results = [];
    let row = [];
    let inQuote = false;
    let currentField = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (inQuote && nextChar === '"') {
                currentField += '"';
                i++; // Skip next quote
            } else {
                inQuote = !inQuote;
            }
        } else if (char === ',' && !inQuote) {
            row.push(currentField);
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !inQuote) {
            if (char === '\r' && nextChar === '\n') i++;
            row.push(currentField);
            if (row.length > 1) results.push(row);
            row = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }
    if (row.length > 0) results.push(row);
    return results;
}

const rows = parseCSV(fileContent);
const data = rows.slice(1); // Skip header

const registryImports = [];
const registryMap = [];

// Ensure directories exist
if (!fs.existsSync(previewsDir)) fs.mkdirSync(previewsDir, { recursive: true });
if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });

data.forEach(row => {
    const componentId = row[0];
    let code = row[7];
    let previewCode = row[8];

    if (!componentId) return;

    // Clean up code strings (remove wrapping quotes if parser didn't catch them all, though it should have)
    // The parser handles the outer quotes. But sometimes CSVs have extra escaping.
    // The parser above handles "" -> " inside quotes.

    // Check if component exists in uiDir
    const componentFile = path.join(uiDir, `${componentId}.tsx`);
    if (!fs.existsSync(componentFile)) {
        console.log(`Creating missing component: ${componentId}`);
        // Remove leading/trailing backticks if present (common in markdown code blocks in CSV)
        code = code.replace(/^`|`$/g, '');
        // Fix imports if needed? Assuming code is valid.
        fs.writeFileSync(componentFile, code);
    }

    // Create preview file
    const previewFile = path.join(previewsDir, `${componentId}-preview.tsx`);

    // Clean preview code
    previewCode = previewCode.replace(/^`|`$/g, '');

    // Ensure imports point to the correct location
    // Replace @/components/ui/accordion with @/components/ui/accordion
    // It should already be correct, but let's make sure we don't have relative imports that break

    // Some preview codes might be "export function Demo() ..."
    // We need to make sure it has a default export or we export it as default
    if (!previewCode.includes('export default')) {
        // Find the exported function name
        const match = previewCode.match(/export function (\w+)/);
        if (match) {
            previewCode += `\n\nexport default ${match[1]};`;
        }
    }

    fs.writeFileSync(previewFile, previewCode);

    // Add to registry
    const componentName = componentId.replace(/-./g, x => x[1].toUpperCase()); // camelCase for variable name
    const importName = `${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Preview`;

    registryImports.push(`import ${importName} from "@/components/previews/${componentId}-preview";`);
    registryMap.push(`  "${componentId}": ${importName},`);
});

const registryContent = `import React from "react";

${registryImports.join('\n')}

export const REGISTRY: Record<string, React.ComponentType> = {
${registryMap.join('\n')}
};
`;

fs.writeFileSync(registryPath, registryContent);
console.log('Registry and previews generated successfully.');
