/**
 * EXAMPLE: How to store code with special characters in Convex
 * 
 * This file shows exactly how to use the chart code (or any code) when storing in Convex.
 * 
 * DO NOT import this file in production - it's just for reference!
 */

// ============================================================================
// OPTION 1: Using a template literal (RECOMMENDED)
// ============================================================================

const chartCode = `"use client"

import * as React from "react"

import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

// ... rest of your code ...`;

// When storing in Convex:
// ✅ CORRECT: Just pass the string directly
// await createComponent({ code: chartCode, ... });

// ❌ WRONG: Don't do this
// await createComponent({ code: JSON.stringify(chartCode), ... });
// await createComponent({ code: escape(chartCode), ... });

// ============================================================================
// OPTION 2: Reading from a file or variable
// ============================================================================

// If you have the code in a variable already:
let myCode: string = "..."; // your code here

// Just use it directly:
// await createComponent({ code: myCode, ... });

// ============================================================================
// OPTION 3: If you need to copy-paste code
// ============================================================================

/**
 * Step 1: Copy your entire code (all lines)
 * 
 * Step 2: Wrap it in backticks (template literals):
 * 
 * const code = `
 * [paste your code here exactly as-is]
 * `;
 * 
 * Step 3: Pass it directly to Convex:
 * 
 * await createComponent({ code, ... });
 */

// ============================================================================
// COMPLETE EXAMPLE
// ============================================================================

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Example component that saves chart code to Convex
 */
export function useSaveChartComponent() {
  const createComponent = useMutation(api.components.createUserComponent);
  
  return async (chartCode: string, previewCode: string) => {
    // ✅ This is all you need - just pass the strings directly!
    await createComponent({
      name: "Chart Component",
      code: chartCode,        // ← Your chart code string (with all special chars)
      previewCode: previewCode, // ← Your preview code string
      category: "Charts",
      // ... other required fields
    });
  };
}

// ============================================================================
// IMPORTANT NOTES
// ============================================================================

/**
 * ✅ DO:
 * - Use template literals (backticks) for multi-line code
 * - Pass strings directly to Convex mutations
 * - Use the exact code as-is (no escaping)
 * 
 * ❌ DON'T:
 * - Don't use JSON.stringify() on the code string
 * - Don't manually escape quotes or special characters
 * - Don't encode to base64 or other formats
 * - Don't wrap in extra quotes
 * 
 * Convex handles ALL string escaping automatically!
 */

