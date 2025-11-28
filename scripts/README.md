# Production Deployment Script

This script allows you to deploy components from a CSV file to your Convex database.

## Prerequisites

1. Make sure your `.env.local` file contains your Convex deployment URL:
   ```
   NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
   ```
   
   For production deployments, set this to your production Convex URL.

2. Ensure the CSV file is in the project root with the name:
   ```
   shadcn-components - shadcn-components (2).csv
   ```

## CSV Format

The CSV file should have the following columns:
- `componentId` - Unique identifier for the component
- `name` - Component display name
- `description` - Component description
- `category` - Component category
- `tags` - JSON array of tags (e.g., `["ui", "shadcn"]`)
- `author` - Author name
- `version` - Version string
- `code` - Main component code (can be multiline)
- `previewCode` - Preview/example code (can be multiline)
- `dependencies` - JSON array of dependencies (optional, will be extracted from code)
- `files` - JSON array of file objects
- `createdAt` - Timestamp
- `updatedAt` - Timestamp
- `isPublic` - Boolean (TRUE/FALSE)
- `registryDependencies` - JSON array of component IDs (optional, will be extracted from code)

## Usage

Run the deployment script:

```bash
pnpm deploy-to-convex
```

Or directly with tsx:

```bash
npx tsx scripts/deploy-to-convex.ts
```

## How It Works

1. **Reads CSV**: Parses the CSV file from the project root
2. **Extracts Dependencies**: Automatically extracts NPM package dependencies from component code
3. **Extracts Registry Dependencies**: Automatically extracts component imports (`@/components/ui/...`) from code
4. **Validates**: Validates that referenced components exist in the catalog
5. **Imports to Convex**: Inserts components in batches of 50
6. **Skips Duplicates**: Automatically skips components that already exist (based on componentId)

## Features

- ✅ **Automatic Dependency Extraction**: Extracts NPM dependencies directly from `import` statements in code
- ✅ **Automatic Registry Dependency Extraction**: Finds and validates component imports
- ✅ **Code Cleaning**: Automatically cleans up formatting artifacts (backticks, escaped quotes)
- ✅ **Validation**: Validates component IDs and dependencies before import
- ✅ **Batch Processing**: Processes components in batches for efficiency
- ✅ **Error Handling**: Provides detailed error reporting
- ✅ **Progress Tracking**: Shows real-time progress and summary

## Handling Code with Special Characters

When storing code that contains special characters (quotes, backticks, template literals, CSS selectors, etc.), the script automatically handles:

### Code Cleaning

The script includes robust code cleaning that handles:
- **CSV double-quote escaping**: Converts `""` to `"` (standard CSV escaping)
- **JSON-encoded strings**: Properly decodes JSON-encoded code strings
- **Markdown code blocks**: Removes backtick wrappers from code blocks
- **Complex syntax**: Handles template literals, JSX attributes, CSS selectors with brackets, etc.

### Validation

Before storing, the script validates code and reports:
- Unclosed quotes in JSX attributes
- Mismatched brackets
- Other syntax issues

### Storage in Convex

**Important**: Convex natively handles ANY string content including:
- ✅ Single and double quotes
- ✅ Backticks (template literals)
- ✅ Special characters (`<`, `>`, `[`, `]`, `{`, `}`, etc.)
- ✅ CSS selectors with complex syntax
- ✅ Unicode characters
- ✅ Newlines and whitespace

When storing code directly in Convex (not from CSV), you don't need any special encoding - just pass the code string directly. Convex handles all escaping internally.

### Example: Storing Chart Code

The chart component code you provided can be stored directly:

```typescript
// No special encoding needed - Convex handles everything
await createUserComponent({
  code: chartCodeString, // Your full chart code with all special characters
  previewCode: previewCodeString,
  // ... other fields
});
```

The script automatically cleans and validates code from CSV files. When storing code directly via the API, Convex handles everything automatically.

## Notes

- The script takes precedence over CSV dependency columns - it extracts dependencies directly from code
- Components are inserted in batches of 50 for efficiency
- The script automatically handles JSON parsing for tags, dependencies, and files
- Registry dependencies are validated against existing components in Convex
- Components with missing required fields are skipped with warnings
- **Code with special characters is automatically cleaned and validated** before storage

## Production Deployment

For production deployments:

1. Ensure your production Convex URL is set in `.env.local`
2. Verify your CSV file is up to date
3. Run the deployment script
4. Review the summary output for any errors or warnings
