/**
 * Utility functions for cleaning and preparing code strings for storage in Convex
 * 
 * These functions handle:
 * - Removing markdown code block wrappers
 * - Cleaning up escaped quotes from CSV files
 * - Validating code structure
 * - Preparing code for safe storage
 */

/**
 * Clean code string by removing backticks and fixing escaped quotes
 * This function properly handles:
 * - CSV double-quote escaping ("") -> single quote (")
 * - JSON-encoded strings
 * - Code blocks wrapped in backticks
 * - Complex code with special characters (quotes, backticks, template literals, etc.)
 */
export function cleanCode(code: string): string {
  if (!code || typeof code !== 'string') {
    return '';
  }
  
  let cleaned = code.trim();
  
  // If the code is wrapped as a JSON string (starts/ends with quotes), try to parse it
  // This handles cases where the CSV stored the code as a JSON-encoded string
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    try {
      // Try parsing as JSON string
      const parsed = JSON.parse(cleaned);
      if (typeof parsed === 'string') {
        cleaned = parsed;
      }
    } catch (e) {
      // Not a valid JSON string, continue with normal cleaning
    }
  }
  
  // Remove markdown code block wrappers (```typescript ... ``` or ```tsx ... ```)
  const codeBlockRegex = /^```(?:typescript|tsx|ts|javascript|jsx|js)?\n?([\s\S]*?)\n?```$/;
  const codeBlockMatch = cleaned.match(codeBlockRegex);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
  }
  
  // Remove standalone backticks at start/end (but preserve backticks in template literals)
  // Only remove if the entire string is wrapped in backticks (markdown inline code)
  if (cleaned.startsWith('`') && cleaned.endsWith('`') && 
      cleaned.split('`').length === 3) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // Handle CSV double-quote escaping: "" becomes "
  // CSV escaping: a quote inside a field is represented as ""
  // However, the CSV parser should already handle this, so we do a conservative replacement
  cleaned = cleaned.replace(/""/g, '"');
  
  return cleaned.trim();
}

/**
 * Validate that code is properly formatted after cleaning
 * Returns an error message if there are issues, or null if valid
 */
export function validateCode(code: string, componentId: string, codeType: 'code' | 'previewCode'): string | null {
  if (!code || code.trim().length === 0) {
    return null; // Empty code is valid (some components might not have preview code)
  }
  
  // Check for common issues that indicate parsing problems
  const issues: string[] = [];
  
  // Check for unclosed quotes in JSX attributes
  // Look for patterns like: <Component prop=">  (missing closing quote)
  const unclosedQuoteRegex = /<[^>]*\s+[^=]*="\s*>/;
  if (unclosedQuoteRegex.test(code)) {
    issues.push('Possible unclosed quotes in JSX attributes');
  }
  
  if (issues.length > 0) {
    return `Component ${componentId} (${codeType}): ${issues.join(', ')}`;
  }
  
  return null;
}

/**
 * Prepare code for storage in Convex
 * 
 * Note: Convex natively handles any string content including:
 * - Quotes (single and double)
 * - Backticks (template literals)
 * - Special characters
 * - Unicode characters
 * - Newlines and whitespace
 * 
 * This function just ensures the code is clean and properly formatted.
 * No encoding is needed - Convex handles all escaping internally.
 * 
 * @param code - The raw code string to prepare
 * @returns Cleaned code ready for storage
 */
export function prepareCodeForStorage(code: string): string {
  return cleanCode(code);
}

/**
 * Prepare code when reading from CSV
 * Use this when importing from CSV files where escaping might be an issue
 */
export function prepareCodeFromCSV(code: string): string {
  return cleanCode(code);
}

