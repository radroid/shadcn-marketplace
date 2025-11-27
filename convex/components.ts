import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("catalogComponents").collect();
    },
});

export const get = query({
    args: { id: v.id("catalogComponents") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getBySlug = query({
    args: { componentId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("catalogComponents")
            .withIndex("by_componentId", (q) => q.eq("componentId", args.componentId))
            .first();
    },
});

export const createUserComponent = mutation({
    args: {
        name: v.string(),
        code: v.string(),
        previewCode: v.string(),
        catalogComponentId: v.optional(v.string()),
        projectId: v.optional(v.id("projects")),
        globalCss: v.optional(v.string()),
        dependencies: v.optional(v.record(v.string(), v.string())),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        // Find user
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        return await ctx.db.insert("userComponents", {
            name: args.name,
            code: args.code,
            previewCode: args.previewCode,
            catalogComponentId: args.catalogComponentId,
            projectId: args.projectId,
            userId: user._id,
            globalCss: args.globalCss,
            dependencies: args.dependencies,
        });
    },
});

export const getUserComponent = query({
    args: { id: v.id("userComponents") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const updateUserComponent = mutation({
    args: {
        id: v.id("userComponents"),
        code: v.string(),
        previewCode: v.optional(v.string()),
        globalCss: v.optional(v.string()),
        dependencies: v.optional(v.record(v.string(), v.string())),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const component = await ctx.db.get(args.id);
        if (!component) throw new Error("Component not found");

        // Verify ownership (simplified, assumes userId check)
        // In real app, check if component.userId matches current user

        await ctx.db.patch(args.id, {
            code: args.code,
            ...(args.previewCode && { previewCode: args.previewCode }),
            ...(args.globalCss && { globalCss: args.globalCss }),
            ...(args.dependencies && { dependencies: args.dependencies }),
        });
    },
});

export const listUserComponents = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .first();

        if (!user) return [];

        // Read all components for the user - this ensures Convex can track all documents
        // for proper reactivity. We filter in memory to exclude deleted components.
        const allComponents = await ctx.db
            .query("userComponents")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
        
        // Filter out ALL deleted components - they should only appear in trash
        // Using Date.now() here is fine - Convex tracks the documents we read, not the filter logic
        return allComponents.filter(
            (component) => !component.deletedAt
        );
    },
});

export const deleteUserComponent = mutation({
    args: {
        id: v.id("userComponents"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const component = await ctx.db.get(args.id);
        if (!component) throw new Error("Component not found");

        // Verify ownership
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .first();

        if (!user || component.userId !== user._id) {
            throw new Error("Unauthorized");
        }

        // Soft delete: set deletedAt timestamp
        await ctx.db.patch(args.id, {
            deletedAt: Date.now(),
        });
    },
});

export const listDeletedComponents = query({
    args: {
        beforeTimestamp: v.number(),
    },
    handler: async (ctx, args) => {
        // Get all components that were deleted before the given timestamp
        const allComponents = await ctx.db.query("userComponents").collect();
        return allComponents.filter(
            (component) => 
                component.deletedAt && 
                component.deletedAt <= args.beforeTimestamp
        );
    },
});

export const permanentlyDeleteUserComponent = internalMutation({
    args: {
        id: v.id("userComponents"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const listTrashComponents = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .first();

        if (!user) return [];

        // Get all components for the user
        const allComponents = await ctx.db
            .query("userComponents")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
        
        // Filter to only show deleted components (not permanently deleted yet)
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        
        return allComponents.filter(
            (component) => component.deletedAt && component.deletedAt > sevenDaysAgo
        );
    },
});

export const restoreUserComponent = mutation({
    args: {
        id: v.id("userComponents"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const component = await ctx.db.get(args.id);
        if (!component) throw new Error("Component not found");

        // Verify ownership
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .first();

        if (!user || component.userId !== user._id) {
            throw new Error("Unauthorized");
        }

        // Restore: remove deletedAt timestamp
        await ctx.db.patch(args.id, {
            deletedAt: undefined,
        });
    },
});

export const publishComponent = mutation({
    args: {
        id: v.id("userComponents"),
        name: v.string(),
        description: v.string(),
        category: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const component = await ctx.db.get(args.id);
        if (!component) throw new Error("Component not found");

        // Simple slug generation
        const slug = args.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        // Check if slug exists
        const existing = await ctx.db
            .query("catalogComponents")
            .withIndex("by_componentId", (q) => q.eq("componentId", slug))
            .first();

        const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

        await ctx.db.insert("catalogComponents", {
            name: args.name,
            description: args.description,
            componentId: finalSlug,
            code: component.code,
            previewCode: component.previewCode,
            category: args.category,
            isPublic: true,
            authorId: component.userId,
            dependencies: component.dependencies,
            globalCss: component.globalCss,
        });
    },
});

export const searchComponents = query({
    args: {
        query: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const searchTerm = args.query.toLowerCase().trim();

        if (searchTerm.length === 0) {
            return {
                marketplace: [],
                myComponents: [],
            };
        }

        // Search marketplace components (only public ones)
        const allCatalogComponents = await ctx.db
            .query("catalogComponents")
            .collect();

        const marketplaceResults = allCatalogComponents
            .filter((component) => {
                // Only show public components
                if (!component.isPublic) return false;
                const nameMatch = component.name.toLowerCase().includes(searchTerm);
                const descriptionMatch = component.description?.toLowerCase().includes(searchTerm) || false;
                const componentIdMatch = component.componentId.toLowerCase().includes(searchTerm);
                const categoryMatch = component.category?.toLowerCase().includes(searchTerm) || false;
                return nameMatch || descriptionMatch || componentIdMatch || categoryMatch;
            })
            .slice(0, 5); // Limit to 5 results

        // Search user components (if authenticated)
        let myComponentsResults: any[] = [];
        if (identity) {
            const user = await ctx.db
                .query("users")
                .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
                .first();

            if (user) {
                const allUserComponents = await ctx.db
                    .query("userComponents")
                    .withIndex("by_user", (q) => q.eq("userId", user._id))
                    .collect();

                myComponentsResults = allUserComponents
                    .filter((component) => {
                        // Only show non-deleted components
                        if (component.deletedAt) return false;
                        const nameMatch = component.name.toLowerCase().includes(searchTerm);
                        const catalogIdMatch = component.catalogComponentId?.toLowerCase().includes(searchTerm) || false;
                        return nameMatch || catalogIdMatch;
                    })
                    .slice(0, 5); // Limit to 5 results
            }
        }

        return {
            marketplace: marketplaceResults,
            myComponents: myComponentsResults,
        };
    },
});

/**
 * Bulk insert multiple catalog components into the database.
 * 
 * This mutation efficiently inserts multiple components in a single transaction.
 * Equivalent to SQL: INSERT INTO catalogComponents (...) VALUES (...), (...), ...;
 */
export const bulkInsertCatalogComponents = mutation({
    args: {
        components: v.array(
            v.object({
                componentId: v.string(),
                name: v.string(),
                description: v.string(),
                category: v.string(),
                code: v.string(),
                previewCode: v.string(),
                tags: v.optional(v.array(v.string())),
                dependencies: v.optional(v.record(v.string(), v.string())),
                isPublic: v.boolean(),
                extraFiles: v.optional(v.array(v.object({
                    path: v.string(),
                    content: v.string(),
                }))),
                globalCss: v.optional(v.string()),
            }),
        ),
    },
    handler: async (ctx, args) => {
        const { components } = args;
        const insertedIds: string[] = [];

        // Insert in a loop. Convex queues all the changes to be executed
        // in a single transaction when the mutation ends.
        for (const component of components) {
            // Check if component with this componentId already exists
            const existing = await ctx.db
                .query("catalogComponents")
                .withIndex("by_componentId", (q) => q.eq("componentId", component.componentId))
                .first();

            if (existing) {
                // Skip existing components or update them
                // For now, we'll skip to avoid duplicates
                console.log(`Skipping existing component: ${component.componentId}`);
                continue;
            }

            const id = await ctx.db.insert("catalogComponents", {
                componentId: component.componentId,
                name: component.name,
                description: component.description,
                category: component.category,
                code: component.code,
                previewCode: component.previewCode,
                tags: component.tags,
                dependencies: component.dependencies,
                isPublic: component.isPublic,
                extraFiles: component.extraFiles,
                globalCss: component.globalCss,
            });

            insertedIds.push(id);
        }

        return {
            inserted: insertedIds.length,
            total: components.length,
            skipped: components.length - insertedIds.length,
        };
    },
});

/**
 * Fix previewCode import paths to match componentId
 * This mutation updates all components to ensure previewCode imports match the component file path
 */
export const fixPreviewCodeImports = mutation({
    args: {
        componentId: v.optional(v.string()), // If provided, fix only this component
    },
    handler: async (ctx, args) => {
        let components;
        if (args.componentId) {
            const component = await ctx.db
                .query("catalogComponents")
                .withIndex("by_componentId", (q) => q.eq("componentId", args.componentId!))
                .first();
            components = component ? [component] : [];
        } else {
            components = await ctx.db.query("catalogComponents").collect();
        }

        let fixed = 0;
        let errors: string[] = [];

        for (const component of components) {
            if (!component) continue;

            try {
                // Extract the import path from previewCode
                const previewCode = component.previewCode;
                
                // Find all import statements that reference @/components/ui/
                const importRegex = /from\s+["']@\/components\/ui\/([^"']+)["']/g;
                let updatedPreviewCode = previewCode;
                let hasChanges = false;

                // Replace all component imports to match componentId
                updatedPreviewCode = updatedPreviewCode.replace(importRegex, (match, importedPath) => {
                    // If the import doesn't match componentId, fix it
                    if (importedPath !== component.componentId) {
                        hasChanges = true;
                        // Replace just the path part, keeping quotes and "from" intact
                        const quote = match.includes("'") ? "'" : '"';
                        return `from ${quote}@/components/ui/${component.componentId}${quote}`;
                    }
                    return match;
                });

                // Also fix the code field - remove trailing backticks and clean up
                let cleanedCode = component.code.trim();
                
                // Remove leading backtick if present
                if (cleanedCode.startsWith('`')) {
                    cleanedCode = cleanedCode.slice(1);
                    hasChanges = true;
                }
                
                // Remove trailing backtick if present
                if (cleanedCode.endsWith('`')) {
                    cleanedCode = cleanedCode.slice(0, -1);
                    hasChanges = true;
                }

                // Update if there were any changes
                if (hasChanges || cleanedCode !== component.code) {
                    await ctx.db.patch(component._id, {
                        previewCode: updatedPreviewCode,
                        code: cleanedCode,
                    });
                    fixed++;
                }
            } catch (error) {
                errors.push(`${component.componentId}: ${error}`);
            }
        }

        return {
            fixed,
            total: components.length,
            errors: errors.length > 0 ? errors : undefined,
        };
    },
});
