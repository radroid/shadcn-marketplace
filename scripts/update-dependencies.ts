#!/usr/bin/env node
/**
 * Script to update dependencies in CSV based on actual imports in component code
 * 
 * Usage:
 *   npx tsx scripts/update-dependencies.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const CSV_FILE_PATH = path.join(process.cwd(), 'shadcn-components - shadcn-components (2).csv');

interface CSVRow {
  componentId: string;
  name: string;
  description: string;
  category: string;
  tags: string;
  author: string;
  version: string;
  code: string;
  previewCode: string;
  dependencies: string;
  files: string;
  createdAt: string;
  updatedAt: string;
  isPublic: string;
}

// Map of common dependencies with their versions
const DEPENDENCY_VERSIONS: Record<string, string> = {
  '@radix-ui/react-accordion': 'latest',
  '@radix-ui/react-alert-dialog': 'latest',
  '@radix-ui/react-avatar': 'latest',
  '@radix-ui/react-checkbox': 'latest',
  '@radix-ui/react-collapsible': 'latest',
  '@radix-ui/react-context-menu': 'latest',
  '@radix-ui/react-dialog': 'latest',
  '@radix-ui/react-dropdown-menu': 'latest',
  '@radix-ui/react-hover-card': 'latest',
  '@radix-ui/react-label': 'latest',
  '@radix-ui/react-menubar': 'latest',
  '@radix-ui/react-navigation-menu': 'latest',
  '@radix-ui/react-popover': 'latest',
  '@radix-ui/react-progress': 'latest',
  '@radix-ui/react-radio-group': 'latest',
  '@radix-ui/react-scroll-area': 'latest',
  '@radix-ui/react-select': 'latest',
  '@radix-ui/react-separator': 'latest',
  '@radix-ui/react-slider': 'latest',
  '@radix-ui/react-slot': 'latest',
  '@radix-ui/react-switch': 'latest',
  '@radix-ui/react-tabs': 'latest',
  '@radix-ui/react-toggle': 'latest',
  '@radix-ui/react-toggle-group': 'latest',
  '@radix-ui/react-tooltip': 'latest',
  '@radix-ui/react-aspect-ratio': 'latest',
  '@radix-ui/react-use-controllable-state': 'latest',
  'class-variance-authority': 'latest',
  'clsx': 'latest',
  'tailwind-merge': 'latest',
  'lucide-react': 'latest',
  'cmdk': 'latest',
  'react-day-picker': 'latest',
  'date-fns': 'latest',
  'recharts': '2.15.4',
  'vaul': 'latest',
  'input-otp': 'latest',
  '@hookform/resolvers': 'latest',
  'react-hook-form': 'latest',
  'zod': 'latest',
  '@tabler/icons-react': 'latest',
  'next': 'latest',
  'react': 'latest',
  'react-dom': 'latest',
};

// Standard dependencies that should always be included (handled by Sandpack defaults)
const DEFAULT_DEPENDENCIES = new Set([
  'react',
  'react-dom',
  '@types/react',
  '@types/react-dom',
  '@types/node',
]);

function extractDependencies(code: string): Set<string> {
  const dependencies = new Set<string>();
  
  // Match import statements
  // Pattern: import ... from "package-name" or import ... from 'package-name'
  const importRegex = /from\s+["']([^"']+)["']/g;
  
  // Match require statements
  const requireRegex = /require\(["']([^"']+)["']\)/g;
  
  let match;
  
  // Extract from imports
  while ((match = importRegex.exec(code)) !== null) {
    const packageName = match[1];
    // Only include external packages (not relative imports or @/ aliases)
    if (packageName && !packageName.startsWith('.') && !packageName.startsWith('@/') && !packageName.startsWith('next/')) {
      // Handle scoped packages like @radix-ui/react-accordion
      if (packageName.startsWith('@')) {
        // For scoped packages, take the scope and package name (first 2 parts)
        // e.g., @radix-ui/react-accordion -> @radix-ui/react-accordion
        const parts = packageName.split('/');
        if (parts.length >= 2) {
          dependencies.add(`${parts[0]}/${parts[1]}`);
        } else {
          dependencies.add(parts[0]);
        }
      } else {
        // For non-scoped packages, take just the package name (first part)
        // e.g., lucide-react -> lucide-react
        dependencies.add(packageName.split('/')[0]);
      }
    }
  }
  
  // Extract from requires
  while ((match = requireRegex.exec(code)) !== null) {
    const packageName = match[1];
    if (packageName && !packageName.startsWith('.') && !packageName.startsWith('@/') && !packageName.startsWith('next/')) {
      if (packageName.startsWith('@')) {
        const parts = packageName.split('/');
        if (parts.length >= 2) {
          dependencies.add(`${parts[0]}/${parts[1]}`);
        } else {
          dependencies.add(parts[0]);
        }
      } else {
        dependencies.add(packageName.split('/')[0]);
      }
    }
  }
  
  return dependencies;
}

function getDependenciesFromComponent(code: string, previewCode: string): string[] {
  const codeDeps = extractDependencies(code);
  const previewDeps = extractDependencies(previewCode);
  
  // Combine both sets and filter out default dependencies and internal imports
  const allDeps = new Set<string>();
  
  // Add all dependencies except defaults
  [...codeDeps, ...previewDeps].forEach(dep => {
    // Skip default dependencies that are always available
    if (!DEFAULT_DEPENDENCIES.has(dep) && 
        !dep.startsWith('@/') &&  // Skip internal aliases
        !dep.startsWith('.') &&   // Skip relative imports
        dep.trim() !== '') {      // Skip empty strings
      allDeps.add(dep);
    }
  });
  
  // Convert to sorted array
  return Array.from(allDeps).sort();
}

function cleanCode(code: string): string {
  let cleaned = code.trim();
  
  // Remove leading backtick-quote pattern if present
  cleaned = cleaned.replace(/^`"/, '"');
  
  // Remove trailing backtick if it's at the end before closing quote
  cleaned = cleaned.replace(/`"$/, '"');
  
  // Remove standalone backticks at start/end
  if (cleaned.startsWith('`') && cleaned.endsWith('`')) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // Replace double-escaped quotes with single quotes
  cleaned = cleaned.replace(/""/g, '"');
  
  return cleaned.trim();
}

async function main() {
  console.log('🚀 Starting dependency update...');
  console.log(`📁 Reading CSV from: ${CSV_FILE_PATH}`);
  
  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`Error: CSV file not found at ${CSV_FILE_PATH}`);
    process.exit(1);
  }

  // Read CSV file
  const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
  
  console.log('📖 Parsing CSV...');
  
  // Parse CSV with proper options for multiline fields
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
    quote: '"',
    escape: '"',
    bom: true,
  }) as CSVRow[];

  console.log(`✅ Parsed ${records.length} rows from CSV`);
  console.log('🔍 Extracting dependencies from component code...');

  let updated = 0;
  const updates: Array<{ componentId: string; old: string; new: string[] }> = [];

  // Process each component
  for (const row of records) {
    try {
      const cleanedCode = cleanCode(row.code);
      const cleanedPreviewCode = cleanCode(row.previewCode);
      
      // Extract dependencies from both code and previewCode
      const dependencies = getDependenciesFromComponent(cleanedCode, cleanedPreviewCode);
      
      // Format as JSON array string (matching CSV format)
      const dependenciesJson = JSON.stringify(dependencies);
      
      // Only update if dependencies changed
      if (row.dependencies !== dependenciesJson) {
        updates.push({
          componentId: row.componentId,
          old: row.dependencies,
          new: dependencies,
        });
        row.dependencies = dependenciesJson;
        updated++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${row.componentId}:`, error);
      continue;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   - Components processed: ${records.length}`);
  console.log(`   - Components updated: ${updated}`);
  
  if (updated > 0) {
    console.log(`\n🔄 Writing updated CSV...`);
    
    // Convert back to CSV format
    const output = stringify(records, {
      header: true,
      columns: Object.keys(records[0] || {}),
      quoted: true,
      quoted_empty: false,
      escape: '"',
    });
    
    // Write to file
    fs.writeFileSync(CSV_FILE_PATH, output, 'utf-8');
    
    console.log(`✅ Updated CSV file saved!`);
    
    // Show some examples of updates
    if (updates.length > 0) {
      console.log(`\n📝 Sample updates (first 5):`);
      updates.slice(0, 5).forEach(({ componentId, old, new: newDeps }) => {
        console.log(`   - ${componentId}:`);
        console.log(`     Old: ${old.substring(0, 80)}...`);
        console.log(`     New: ${JSON.stringify(newDeps)}`);
      });
    }
  } else {
    console.log(`\n✨ No updates needed - all dependencies are already correct!`);
  }
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

