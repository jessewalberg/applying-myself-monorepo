import { mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const makeFirstAdmin = mutation({
  args: {
    email: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx, args) => {
    const existingAdmin = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("isAdmin"), true))
      .first();

    if (existingAdmin) {
      return {
        success: true,
        message: "Admin already exists. No changes made.",
      };
    }

    let target = null;
    if (args.email) {
      const normalizedEmail = args.email.toLowerCase().trim();
      target = await ctx.db
        .query("userProfiles")
        .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
        .unique();
    }

    if (!target) {
      target = await ctx.db.query("userProfiles").first();
    }

    if (!target) {
      throw new ConvexError("No users available to promote to admin");
    }

    await ctx.db.patch(target._id, {
      isAdmin: true,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: `User ${target.email} is now admin`,
    };
  },
});
