export default {
  providers: [
    {
      // Clerk JWT issuer domain, for example:
      // https://clerk.applyingmyself.com
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "https://clerk.invalid",
      applicationID: process.env.CLERK_JWT_AUDIENCE || "convex",
    },
  ],
};
