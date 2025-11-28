#!/usr/bin/env node
/**
 * Script to analyze CSV for commonly imported shadcn components and update dependencies in Convex
 * 
 * Usage:
 *   npx tsx scripts/analyze-and-update-dependencies.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { ConvexClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Get Convex URL from environment
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.error('Error: NEXT_PUBLIC_CONVEX_URL or CONVEX_URL environment variable is required');
  console.error('Please set it in your .env.local file or export it as an environment variable');
  process.exit(1);
}

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
};

// Standard dependencies that should always be included (handled by Sandpack defaults)
const DEFAULT_DEPENDENCIES = new Set([
  'react',
  'react-dom',
  '@types/react',
  '@types/react-dom',
  '@types/node',
]);

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

function extractShadcnComponentImports(code: string): Set<string> {
  const components = new Set<string>();
  
  // Match imports from @/components/ui/
  // Pattern: import ... from "@/components/ui/component-name"
  const importRegex = /from\s+["']@\/components\/ui\/([^"']+)["']/g;
  
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const componentName = match[1];
    if (componentName) {
      components.add(componentName);
    }
  }
  
  return components;
}

function getDependenciesFromComponent(code: string, previewCode: string): Record<string, string> {
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
  
  // Convert to record with versions
  const deps: Record<string, string> = {};
  for (const dep of allDeps) {
    deps[dep] = DEPENDENCY_VERSIONS[dep] || 'latest';
  }
  
  return deps;
}

async function main() {
  console.log('🚀 Starting dependency analysis and update...');
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
  
  // Step 1: Analyze commonly imported shadcn components
  console.log('\n🔍 Analyzing commonly imported shadcn components...');
  const componentImportCounts = new Map<string, number>();
  
  for (const row of records) {
    try {
      const cleanedCode = cleanCode(row.code);
      const cleanedPreviewCode = cleanCode(row.previewCode);
      
      const codeImports = extractShadcnComponentImports(cleanedCode);
      const previewImports = extractShadcnComponentImports(cleanedPreviewCode);
      
      // Count all imported components
      const allImports = new Set([...codeImports, ...previewImports]);
      for (const component of allImports) {
        componentImportCounts.set(component, (componentImportCounts.get(component) || 0) + 1);
      }
    } catch (error) {
      console.error(`❌ Error processing ${row.componentId}:`, error);
      continue;
    }
  }
  
  // Sort by frequency
  const sortedComponents = Array.from(componentImportCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20); // Top 20
  
  console.log('\n📊 Most commonly imported shadcn components:');
  sortedComponents.forEach(([component, count]) => {
    console.log(`   - ${component}: ${count} imports`);
  });
  
  // Step 2: Extract dependencies for each component
  console.log('\n🔍 Extracting dependencies from component code...');
  
  const componentDependencies = new Map<string, Record<string, string>>();
  
  for (const row of records) {
    try {
      const cleanedCode = cleanCode(row.code);
      const cleanedPreviewCode = cleanCode(row.previewCode);
      
      // Extract dependencies from both code and previewCode
      const dependencies = getDependenciesFromComponent(cleanedCode, cleanedPreviewCode);
      
      componentDependencies.set(row.componentId, dependencies);
    } catch (error) {
      console.error(`❌ Error processing ${row.componentId}:`, error);
      continue;
    }
  }
  
  console.log(`✅ Extracted dependencies for ${componentDependencies.size} components`);
  
  // Step 3: Update dependencies in Convex
  console.log(`\n📡 Connecting to Convex at ${CONVEX_URL}...`);
  
  const client = new ConvexClient(CONVEX_URL!);
  
  console.log('🔄 Updating dependencies in Convex...');
  
  let updated = 0;
  let errors = 0;
  
  // Process in batches
  const BATCH_SIZE = 50;
  const componentIds = Array.from(componentDependencies.keys());
  
  for (let i = 0; i < componentIds.length; i += BATCH_SIZE) {
    const batch = componentIds.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(componentIds.length / BATCH_SIZE);
    
    console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} components)...`);
    
    for (const componentId of batch) {
      try {
        const dependencies = componentDependencies.get(componentId);
        if (!dependencies || Object.keys(dependencies).length === 0) {
          continue;
        }
        
        await client.mutation(api.components.updateComponentDependencies, {
          componentId,
          dependencies,
        });
        
        updated++;
      } catch (error) {
        console.error(`❌ Error updating ${componentId}:`, error);
        errors++;
      }
    }
    
    console.log(`✅ Batch ${batchNumber} complete`);
  }
  
  console.log('\n✨ Update complete!');
  console.log(`📊 Summary:`);
  console.log(`   - Components processed: ${componentDependencies.size}`);
  console.log(`   - Successfully updated: ${updated}`);
  console.log(`   - Errors: ${errors}`);
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

