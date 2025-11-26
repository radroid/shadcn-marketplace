import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

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

        return await ctx.db
            .query("userComponents")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
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
        });
    },
});
