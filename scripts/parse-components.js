const fs = require('fs');
const path = require('path');

const csvPath = '/Users/rajdholakia/.gemini/antigravity/scratch/shadcn-marketplace/shadcn-components - shadcn-components (2).csv';
const fileContent = fs.readFileSync(csvPath, 'utf8');

// Simple CSV parser that handles quoted fields with newlines
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
            if (row.length > 1) results.push(row); // Skip empty rows
            row = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }
    return results;
}

const rows = parseCSV(fileContent);
// Skip header
const data = rows.slice(1);

const componentIds = data.map(row => row[0]).filter(id => id && id.trim() !== '');
console.log(JSON.stringify(componentIds));
