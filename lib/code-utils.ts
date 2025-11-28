/**
 * Client-side utility functions for preparing code strings for storage in Convex
 * 
 * IMPORTANT: Convex natively handles any string content including:
 * - Quotes (single and double)
 * - Backticks (template literals)
 * - Special characters (brackets, CSS selectors, etc.)
 * - Unicode characters
 * - Newlines and whitespace
 * 
 * When storing code directly in Convex (via mutations), you can pass the code
 * string directly without any special encoding. Convex handles all escaping internally.
 * 
 * These utilities are primarily for validation and cleaning if needed.
 */

/**
 * Validates code string and checks for common syntax issues
 * Useful for catching problems before storing in database
 */
export function validateCodeString(code: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!code || typeof code !== 'string') {
    errors.push('Code must be a non-empty string');
    return { isValid: false, errors, warnings };
  }
  
  // Check for unclosed quotes in JSX attributes
  // Pattern: <Component prop=">  or defaultValue=">  (missing closing quote before >)
  const unclosedQuotePatterns = [
    /<[^>]*\s+\w+="\s*>/g,  // Attribute with unclosed quote: prop=">
    /defaultValue=">/g,      // Specific pattern: defaultValue=">
    /defaultValue='>/g,      // Single quote version: defaultValue='>
  ];
  
  for (const pattern of unclosedQuotePatterns) {
    if (pattern.test(code)) {
      errors.push('Found unclosed quotes in JSX attributes (check defaultValue and other attributes)');
      break;
    }
  }
  
  // Basic bracket matching check (simple heuristic)
  const openBrackets = (code.match(/</g) || []).length;
  const closeBrackets = (code.match(/>/g) || []).length;
  if (Math.abs(openBrackets - closeBrackets) > 0) {
    warnings.push(`Possible mismatched brackets (${openBrackets} < vs ${closeBrackets} >)`);
  }
  
  // Check for obvious parsing issues
  if (code.includes('defaultValue=">') || code.includes("defaultValue='>")) {
    errors.push('Found unclosed quote in defaultValue attribute');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Prepare code for storage in Convex
 * 
 * Note: In most cases, you don't need this function. Convex handles any string content.
 * Use this only if you need to clean/prepare code before storing.
 * 
 * @param code - The code string to prepare
 * @returns The code ready for storage (usually just trimmed)
 */
export function prepareCodeForStorage(code: string): string {
  if (!code || typeof code !== 'string') {
    return '';
  }
  
  // Just trim - Convex handles everything else
  // If you're storing code directly from user input or editor,
  // you typically don't need any cleaning
  return code.trim();
}

/**
 * Example usage with chart code (or any code with special characters):
 * 
 * ```typescript
 * import { validateCodeString } from '@/lib/code-utils';
 * import { useMutation } from 'convex/react';
 * import { api } from '@/convex/_generated/api';
 * 
 * // Your chart code - use it EXACTLY as-is, no encoding needed!
 * const chartCode = `"use client"
 * 
 * import * as React from "react"
 * import * as RechartsPrimitive from "recharts"
 * import { cn } from "@/lib/utils"
 * 
 * // ... rest of your code with all the special characters ...
 * `;
 * 
 * // Optional: validate before saving
 * const validation = validateCodeString(chartCode);
 * if (!validation.isValid) {
 *   console.error('Code validation errors:', validation.errors);
 *   return; // Don't save if validation fails
 * }
 * 
 * // Store directly - just pass the string as-is!
 * const createComponent = useMutation(api.components.createUserComponent);
 * await createComponent({
 *   name: "Chart Component",
 *   code: chartCode,  // ← Just pass the string directly!
 *   previewCode: previewCodeString,
 *   // ... other fields
 * });
 * ```
 * 
 * **Key Points:**
 * 
 * 1. **Use template literals (backticks)** for multi-line code:
 *    ```typescript
 *    const code = `your code here`;
 *    ```
 * 
 * 2. **No JSON.stringify() needed** - Convex handles strings natively
 * 
 * 3. **No escaping required** - quotes, backticks, special chars all work as-is
 * 
 * 4. **Just pass the string directly** to the Convex mutation
 * 
 * 5. **Optional validation** - use validateCodeString() to catch issues early
 */

