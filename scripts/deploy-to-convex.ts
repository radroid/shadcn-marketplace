#!/usr/bin/env tsx

/**
 * Production-ready script to deploy components from CSV to Convex.
 * 
 * This script:
 * - Reads components from CSV file
 * - Extracts and validates NPM dependencies from component code
 * - Extracts and validates registry dependencies (component imports) from code
 * - Imports all components to Convex with proper dependencies
 * 
 * Usage:
 *   pnpm deploy-to-convex
 * 
 * Environment Setup:
 *   Set NEXT_PUBLIC_CONVEX_URL or CONVEX_URL in .env.local file
 *   This should point to your production Convex deployment
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
  console.error('❌ Error: NEXT_PUBLIC_CONVEX_URL or CONVEX_URL environment variable is required');
  console.error('Please set it in your .env.local file or export it as an environment variable');
  process.exit(1);
}

const CSV_FILE_PATH = path.join(
  process.cwd(),
  'shadcn-components - shadcn-components (2).csv'
);

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
  dependencies: string; // JSON string (may be outdated)
  files: string;
  createdAt: string;
  updatedAt: string;
  isPublic: string;
  registryDependencies?: string; // JSON string (may be outdated)
}

interface ParsedComponent {
  componentId: string;
  name: string;
  description: string;
  category: string;
  code: string;
  previewCode: string;
  tags?: string[];
  dependencies?: Record<string, string>;
  registryDependencies?: string[];
  isPublic: boolean;
  extraFiles?: Array<{ path: string; content: string }>;
  globalCss?: string;
}

// Default dependencies that are always available (don't need to be tracked)
const DEFAULT_DEPENDENCIES = new Set([
  'react',
  'react-dom',
  'react/jsx-runtime',
]);

/**
 * Parse JSON field from CSV, handling various edge cases
 */
function parseJSONField<T>(field: string, defaultValue: T): T {
  if (!field || field.trim() === '' || field === 'null' || field === 'undefined') {
    return defaultValue;
  }
  try {
    const cleaned = field.replace(/""/g, '"');
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.warn(`Failed to parse JSON field: ${field.substring(0, 50)}...`);
    return defaultValue;
  }
}

/**
 * Extract NPM package dependencies from code
 */
function extractDependencies(code: string): Set<string> {
  const dependencies = new Set<string>();
  
  // Match import statements: import ... from "package-name"
  const importRegex = /from\s+["']([^"']+)["']/g;
  
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const packageName = match[1];
    if (packageName) {
      // Skip relative imports, internal aliases, and default dependencies
      if (
        !packageName.startsWith('.') &&
        !packageName.startsWith('@/') &&
        !packageName.startsWith('~/') &&
        !DEFAULT_DEPENDENCIES.has(packageName)
      ) {
        // Extract package name (handle scoped packages)
        const packageBase = packageName.split('/')[0];
        if (packageBase.startsWith('@')) {
          // Scoped package: @scope/package
          const parts = packageName.split('/');
          if (parts.length >= 2) {
            dependencies.add(`${parts[0]}/${parts[1]}`);
          }
        } else {
          dependencies.add(packageBase);
        }
      }
    }
  }
  
  return dependencies;
}

/**
 * Extract registry dependencies (component imports) from code
 */
function extractRegistryDependencies(code: string): Set<string> {
  const registryDeps = new Set<string>();
  
  // Match imports from @/components/ui/... paths
  const importRegex = /from\s+["']@\/components\/ui\/([^"']+)["']/g;
  
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const componentPath = match[1];
    if (componentPath) {
      const componentId = componentPath.split('/').pop()?.replace(/\.tsx?$/, '') || componentPath;
      registryDeps.add(componentId);
    }
  }
  
  return registryDeps;
}

/**
 * Clean code string by removing backticks and fixing escaped quotes
 */
function cleanCode(code: string): string {
  let cleaned = code.trim();
  
  // Remove leading backtick-quote pattern
  cleaned = cleaned.replace(/^`"/, '"');
  
  // Remove trailing backtick
  cleaned = cleaned.replace(/`"$/, '"');
  
  // Remove standalone backticks at start/end
  if (cleaned.startsWith('`') && cleaned.endsWith('`')) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // Replace double-escaped quotes
  cleaned = cleaned.replace(/""/g, '"');
  
  return cleaned.trim();
}

/**
 * Get all dependencies from component code
 */
function getDependenciesFromCode(code: string, previewCode: string): Record<string, string> | undefined {
  const codeDeps = extractDependencies(code);
  const previewDeps = extractDependencies(previewCode);
  
  const allDeps = new Set<string>();
  [...codeDeps, ...previewDeps].forEach(dep => {
    if (dep && dep.trim() !== '') {
      allDeps.add(dep);
    }
  });
  
  if (allDeps.size === 0) return undefined;
  
  const deps: Record<string, string> = {};
  Array.from(allDeps).sort().forEach(dep => {
    deps[dep] = 'latest';
  });
  
  return deps;
}

/**
 * Get registry dependencies from component code
 */
function getRegistryDependenciesFromCode(
  code: string,
  previewCode: string,
  currentComponentId: string,
  validComponentIds: Set<string>
): string[] {
  const codeRegistryDeps = extractRegistryDependencies(code);
  const previewRegistryDeps = extractRegistryDependencies(previewCode);
  
  const allRegistryDeps = new Set<string>();
  
  [...codeRegistryDeps, ...previewRegistryDeps].forEach(dep => {
    // Don't include self-references and validate component exists
    if (dep && dep !== currentComponentId && validComponentIds.has(dep)) {
      allRegistryDeps.add(dep);
    }
  });
  
  return Array.from(allRegistryDeps).sort();
}

function parseTags(tagsStr: string): string[] | undefined {
  const parsed = parseJSONField<string[]>(tagsStr, []);
  return parsed.length > 0 ? parsed : undefined;
}

function parseFiles(filesStr: string): Array<{ path: string; content: string }> | undefined {
  const parsed = parseJSONField<Array<{ path: string; type?: string; content?: string }>>(filesStr, []);
  if (parsed.length === 0) return undefined;
  
  const extraFiles = parsed
    .filter((file) => file.path && file.type !== 'registry:ui')
    .map((file) => ({
      path: file.path,
      content: file.content || '',
    }));
  
  return extraFiles.length > 0 ? extraFiles : undefined;
}

function parseBoolean(value: string): boolean {
  return value?.toUpperCase() === 'TRUE' || value === 'true' || value === '1';
}

/**
 * Transform CSV row to ParsedComponent with extracted dependencies
 */
function transformRow(
  row: CSVRow,
  validComponentIds: Set<string>
): ParsedComponent {
  const cleanedCode = cleanCode(row.code);
  const cleanedPreviewCode = cleanCode(row.previewCode);
  
  // Extract dependencies from code (this takes precedence over CSV)
  const dependencies = getDependenciesFromCode(cleanedCode, cleanedPreviewCode);
  
  // Extract registry dependencies from code (this takes precedence over CSV)
  const registryDependencies = getRegistryDependenciesFromCode(
    cleanedCode,
    cleanedPreviewCode,
    row.componentId,
    validComponentIds
  );
  
  return {
    componentId: row.componentId.trim(),
    name: row.name.trim(),
    description: row.description.trim(),
    category: row.category.trim(),
    code: cleanedCode,
    previewCode: cleanedPreviewCode,
    tags: parseTags(row.tags),
    dependencies: dependencies,
    registryDependencies: registryDependencies.length > 0 ? registryDependencies : undefined,
    isPublic: parseBoolean(row.isPublic),
    extraFiles: parseFiles(row.files),
  };
}

async function main() {
  console.log('🚀 Starting production deployment to Convex...\n');
  console.log(`📁 Reading CSV from: ${CSV_FILE_PATH}`);
  console.log(`📡 Target Convex: ${CONVEX_URL}\n`);
  
  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`❌ Error: CSV file not found at ${CSV_FILE_PATH}`);
    process.exit(1);
  }

  // Read and parse CSV
  console.log('📖 Parsing CSV...');
  const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
    quote: '"',
    escape: '"',
    bom: true,
  }) as CSVRow[];

  console.log(`✅ Parsed ${records.length} rows from CSV\n`);

  // Build map of all component IDs for validation
  const csvComponentIds = new Set<string>();
  records.forEach(row => {
    csvComponentIds.add(row.componentId);
  });

  // Connect to Convex
  console.log('📡 Connecting to Convex...');
  const client = new ConvexClient(CONVEX_URL);
  
  // Fetch existing components to validate registry dependencies
  console.log('📥 Fetching existing components from Convex...');
  const existingComponents = await client.query(api.components.list, {});
  const convexComponentIds = new Set<string>();
  existingComponents.forEach(comp => {
    convexComponentIds.add(comp.componentId);
  });
  console.log(`✅ Found ${convexComponentIds.size} existing components in Convex\n`);

  // For new deployments, we'll validate against CSV components
  // For updates, we'll validate against existing Convex components
  const validComponentIds = convexComponentIds.size > 0 
    ? convexComponentIds 
    : csvComponentIds;

  // Transform and validate components
  console.log('🔄 Processing components and extracting dependencies...');
  const components: ParsedComponent[] = [];
  const errors: Array<{ componentId: string; error: string }> = [];
  
  for (const row of records) {
    try {
      const component = transformRow(row, validComponentIds);
      
      // Validate required fields
      if (!component.componentId || !component.name || !component.code || !component.previewCode) {
        errors.push({
          componentId: row.componentId || 'unknown',
          error: 'Missing required fields',
        });
        continue;
      }
      
      components.push(component);
    } catch (error) {
      errors.push({
        componentId: row.componentId || 'unknown',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  console.log(`✅ Processed ${components.length} components`);
  if (errors.length > 0) {
    console.log(`⚠️  ${errors.length} components had errors:`);
    errors.slice(0, 5).forEach(({ componentId, error }) => {
      console.log(`   - ${componentId}: ${error}`);
    });
    if (errors.length > 5) {
      console.log(`   ... and ${errors.length - 5} more errors`);
    }
    console.log();
  }

  // Import to Convex in batches
  const BATCH_SIZE = 50;
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  console.log(`📦 Importing components in batches of ${BATCH_SIZE}...\n`);

  for (let i = 0; i < components.length; i += BATCH_SIZE) {
    const batch = components.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(components.length / BATCH_SIZE);

    console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} components)...`);

    try {
      const result = await client.mutation(api.components.bulkInsertCatalogComponents, {
        components: batch,
      });

      totalInserted += result.inserted;
      totalSkipped += result.skipped;
      totalFailed += batch.length - result.inserted - result.skipped;

      console.log(`   ✅ ${result.inserted} inserted, ${result.skipped} skipped\n`);
    } catch (error) {
      console.error(`   ❌ Error: ${error}\n`);
      totalFailed += batch.length;
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(50));
  console.log('✨ Deployment Complete!');
  console.log('='.repeat(50));
  console.log(`📊 Summary:`);
  console.log(`   - Components processed: ${components.length}`);
  console.log(`   - Successfully inserted: ${totalInserted}`);
  console.log(`   - Skipped (duplicates): ${totalSkipped}`);
  console.log(`   - Failed: ${totalFailed}`);
  console.log(`   - Errors during processing: ${errors.length}`);
  
  if (totalInserted > 0) {
    console.log(`\n✅ Successfully deployed ${totalInserted} components to Convex!`);
  }
  
  if (totalFailed > 0 || errors.length > 0) {
    console.log(`\n⚠️  Please review the errors above before proceeding.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

