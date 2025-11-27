# CSV Import Script

This script allows you to bulk import components from a CSV file into your Convex database.

## Prerequisites

1. Make sure your `.env.local` file contains your Convex deployment URL:
   ```
   NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
   ```

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
- `dependencies` - JSON array of dependencies (e.g., `["@radix-ui/react-accordion"]`)
- `files` - JSON array of file objects
- `createdAt` - Timestamp
- `updatedAt` - Timestamp
- `isPublic` - Boolean (TRUE/FALSE)

## Usage

Run the import script:

```bash
pnpm import-csv
```

Or directly with tsx:

```bash
npx tsx scripts/import-csv.ts
```

## How It Works

1. The script reads the CSV file from the project root
2. Parses the CSV, handling multiline fields (code, previewCode)
3. Transforms the data to match the Convex schema
4. Inserts components in batches of 50 to avoid overwhelming the system
5. Skips components that already exist (based on componentId)
6. Provides progress updates and a summary

## Notes

- The script automatically skips duplicate components (components with the same `componentId`)
- Components are inserted in batches for efficiency
- The script handles JSON parsing for tags, dependencies, and files
- Code fields are cleaned to remove formatting artifacts

