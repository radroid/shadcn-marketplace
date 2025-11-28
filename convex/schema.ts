import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    users: defineTable({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        image: v.optional(v.string()),
        tokenIdentifier: v.string(), // For Clerk/Auth setup
    }).index('by_token', ['tokenIdentifier']),

    // Public Catalog: The "Marketplace" entries
    catalogComponents: defineTable({
        name: v.string(),           // e.g. "Gradient Button"
        description: v.string(),    // e.g. "A button with a nice gradient"
        componentId: v.string(),    // specific slug/id e.g. "gradient-button"

        // The core code
        code: v.string(),           // Main component code (React/TSX)
        previewCode: v.string(),    // Example usage code (renders the component)

        // Organization
        category: v.string(),       // e.g. "Buttons", "Cards"
        tags: v.optional(v.array(v.string())),

        // Metadata
        authorId: v.optional(v.id("users")), // Who created it (if user submitted)
        isPublic: v.boolean(),      // If true, shows in marketplace

        // File Support
        extraFiles: v.optional(v.array(v.object({
            path: v.string(), // e.g. "/lib/utils.ts"
            content: v.string()
        }))),

        // Dependencies
        dependencies: v.optional(v.record(v.string(), v.string())),
        registryDependencies: v.optional(v.array(v.string())),

        // Theme/CSS
        globalCss: v.optional(v.string()), // Theme CSS for the component
    })
        .index('by_componentId', ['componentId'])
        .index('by_category', ['category']),

    // User Projects: A container for a user's customized components
    projects: defineTable({
        name: v.string(),
        userId: v.id("users"),
        globalCss: v.string(),
    }).index('by_user', ['userId']),

    // Saved/Customized Components (UserComponents)
    userComponents: defineTable({
        projectId: v.optional(v.id("projects")), // Optional link to a project
        userId: v.id("users"),
        catalogComponentId: v.optional(v.string()), // Link back to original if it was forked

        name: v.string(),
        code: v.string(),           // User's customized version
        previewCode: v.string(),    // User's customized preview
        globalCss: v.optional(v.string()), // User's customized global CSS
        dependencies: v.optional(v.record(v.string(), v.string())),
        registryDependencies: v.optional(v.array(v.string())),
        deletedAt: v.optional(v.number()), // Timestamp when deleted (for 7-day trash policy)
    })
        .index('by_project', ['projectId'])
        .index('by_user', ['userId']),
})
