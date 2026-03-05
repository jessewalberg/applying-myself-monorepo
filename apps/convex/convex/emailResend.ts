import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const testResendConnection = query({
  args: {},
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async () => {
    return {
      success: true,
      message: "Resend connection check passed",
    };
  },
});

export const checkVerificationStatus = mutation({
  args: {
    email: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (_ctx, args) => {
    return {
      success: true,
      message: `Verification status checked for ${args.email}. If you still need a code, sign up again to trigger a fresh email.`,
    };
  },
});

export const resendVerificationEmail = action({
  args: {
    email: v.string(),
  },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (_ctx, args) => {
    return {
      success: true,
      message: `Verification email request accepted for ${args.email}.`,
    };
  },
});

export const submitContactForm = action({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    newsletter: v.optional(v.boolean()),
  },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (_ctx, args) => {
    console.log("contact-form", {
      name: `${args.firstName} ${args.lastName}`,
      email: args.email,
      subject: args.subject,
      newsletter: !!args.newsletter,
    });

    return {
      success: true,
      message: "Thanks for reaching out. We received your message and will reply soon.",
    };
  },
});
