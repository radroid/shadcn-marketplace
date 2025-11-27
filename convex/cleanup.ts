import { internalAction } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Cleanup function to permanently delete components that have been in trash for more than 7 days
 * This should be scheduled to run daily
 */
export const cleanupDeletedComponents = internalAction({
  handler: async (ctx) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    // Get all deleted components
    const deletedComponents = await ctx.runQuery(api.components.listDeletedComponents, {
      beforeTimestamp: sevenDaysAgo,
    });

    // Permanently delete each component
    for (const component of deletedComponents) {
      await ctx.runMutation(api.components.permanentlyDeleteUserComponent, {
        id: component._id,
      });
    }

    return { deleted: deletedComponents.length };
  },
});

