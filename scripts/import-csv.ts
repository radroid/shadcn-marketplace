#!/usr/bin/env node
/**
 * Script to bulk import components from CSV to Convex
 * 
 * Usage:
 *   npx tsx scripts/import-csv.ts
 * 
 * Make sure to set CONVEX_URL environment variable or it will use the one from .env.local
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
  tags: string; // JSON string
  author: string;
  version: string;
  code: string;
  previewCode: string;
  dependencies: string; // JSON string
  files: string; // JSON string
  createdAt: string;
  updatedAt: string;
  isPublic: string; // "TRUE" or "FALSE"
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
  isPublic: boolean;
  extraFiles?: Array<{ path: string; content: string }>;
  globalCss?: string;
}

function parseJSONField<T>(field: string, defaultValue: T): T {
  if (!field || field.trim() === '' || field === 'null' || field === 'undefined') {
    return defaultValue;
  }
  try {
    // Handle double-escaped JSON strings from CSV
    const cleaned = field.replace(/""/g, '"');
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.warn(`Failed to parse JSON field: ${field.substring(0, 50)}...`, e);
    return defaultValue;
  }
}

function parseTags(tagsStr: string): string[] | undefined {
  const parsed = parseJSONField<string[]>(tagsStr, []);
  return parsed.length > 0 ? parsed : undefined;
}

function parseDependencies(depsStr: string): Record<string, string> | undefined {
  const parsed = parseJSONField<string[]>(depsStr, []);
  if (parsed.length === 0) return undefined;
  
  // Convert array of dependency names to a record
  // For now, we'll just use the dependency names without versions
  // You may need to adjust this based on your CSV format
  const deps: Record<string, string> = {};
  for (const dep of parsed) {
    // If it's a simple string, use "latest" as version
    // If it's already in "package@version" format, parse it
    if (typeof dep === 'string') {
      const match = dep.match(/^(.+)@(.+)$/);
      if (match) {
        deps[match[1]] = match[2];
      } else {
        deps[dep] = 'latest';
      }
    }
  }
  return Object.keys(deps).length > 0 ? deps : undefined;
}

function parseFiles(filesStr: string): Array<{ path: string; content: string }> | undefined {
  const parsed = parseJSONField<Array<{ path: string; type?: string; content?: string }>>(filesStr, []);
  if (parsed.length === 0) return undefined;
  
  // Extract file paths from the files array
  // Note: The CSV may not include file content, so we'll just extract paths
  const extraFiles = parsed
    .filter((file) => file.path && file.type !== 'registry:ui')
    .map((file) => ({
      path: file.path,
      content: file.content || '', // CSV might not have content
    }));
  
  return extraFiles.length > 0 ? extraFiles : undefined;
}

function cleanCode(code: string): string {
  // Clean up code field - remove leading backtick if it's just formatting
  // The CSV might have backticks as delimiters or formatting
  let cleaned = code.trim();
  
  // Remove leading backtick-quote pattern if present (e.g., `"use client" becomes "use client")
  cleaned = cleaned.replace(/^`"/, '"');
  
  // Remove trailing backtick if it's at the end before closing quote
  cleaned = cleaned.replace(/`"$/, '"');
  
  // Replace double-escaped quotes with single quotes
  cleaned = cleaned.replace(/""/g, '"');
  
  return cleaned.trim();
}

function parseBoolean(value: string): boolean {
  return value?.toUpperCase() === 'TRUE' || value === 'true' || value === '1';
}

function transformRow(row: CSVRow): ParsedComponent {
  return {
    componentId: row.componentId.trim(),
    name: row.name.trim(),
    description: row.description.trim(),
    category: row.category.trim(),
    code: cleanCode(row.code),
    previewCode: cleanCode(row.previewCode),
    tags: parseTags(row.tags),
    dependencies: parseDependencies(row.dependencies),
    isPublic: parseBoolean(row.isPublic),
    extraFiles: parseFiles(row.files),
  };
}

async function main() {
  console.log('🚀 Starting CSV import...');
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
  
  // Transform rows to match Convex schema
  console.log('🔄 Transforming data...');
  const components: ParsedComponent[] = [];
  
  for (const row of records) {
    try {
      const component = transformRow(row);
      
      // Validate required fields
      if (!component.componentId || !component.name || !component.code || !component.previewCode) {
        console.warn(`⚠️  Skipping row with missing required fields: ${component.componentId || 'unknown'}`);
        continue;
      }
      
      components.push(component);
    } catch (error) {
      console.error(`❌ Error transforming row:`, error);
      console.error(`Row data:`, JSON.stringify(row, null, 2).substring(0, 200));
      continue;
    }
  }

  console.log(`✅ Transformed ${components.length} components`);
  console.log(`📡 Connecting to Convex at ${CONVEX_URL}...`);

  // Initialize Convex client
  // CONVEX_URL is guaranteed to be a string at this point due to the check above
  const client = new ConvexClient(CONVEX_URL!);

  // Batch insert components (insert in chunks to avoid overwhelming the system)
  const BATCH_SIZE = 50;
  let totalInserted = 0;
  let totalSkipped = 0;

  console.log(`📦 Inserting components in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < components.length; i += BATCH_SIZE) {
    const batch = components.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(components.length / BATCH_SIZE);

    console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} components)...`);

    try {
      const result = await client.mutation(api.components.bulkInsertCatalogComponents, {
        components: batch,
      });

      totalInserted += result.inserted;
      totalSkipped += result.skipped;

      console.log(`✅ Batch ${batchNumber} complete: ${result.inserted} inserted, ${result.skipped} skipped`);
    } catch (error) {
      console.error(`❌ Error inserting batch ${batchNumber}:`, error);
      // Continue with next batch
    }
  }

  console.log('\n✨ Import complete!');
  console.log(`📊 Summary:`);
  console.log(`   - Total components processed: ${components.length}`);
  console.log(`   - Successfully inserted: ${totalInserted}`);
  console.log(`   - Skipped (duplicates): ${totalSkipped}`);
  console.log(`   - Failed: ${components.length - totalInserted - totalSkipped}`);
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

