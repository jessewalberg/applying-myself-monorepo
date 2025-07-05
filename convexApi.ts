import { type FunctionReference, anyApi } from "convex/server";
import { type GenericId as Id } from "convex/values";

export const api: PublicApiType = anyApi as unknown as PublicApiType;
export const internal: InternalApiType = anyApi as unknown as InternalApiType;

export type PublicApiType = {
  resumes: {
    upload: FunctionReference<
      "mutation",
      "public",
      { fileSize: number; filename: string; mimeType: string },
      { uploadUrl: string }
    >;
    completeUpload: FunctionReference<
      "mutation",
      "public",
      {
        fileSize: number;
        filename: string;
        mimeType: string;
        storageId: Id<"_storage">;
      },
      { remainingCredits: number; resumeId: Id<"resumes"> }
    >;
    updateExtractedText: FunctionReference<
      "mutation",
      "public",
      { extractedText: string; resumeId: Id<"resumes"> },
      { success: boolean }
    >;
    getResumes: FunctionReference<
      "query",
      "public",
      { limit?: number },
      {
        hasMore: boolean;
        resumes: Array<{
          _creationTime: number;
          _id: Id<"resumes">;
          createdAt: number;
          extractedText?: string;
          fileId: Id<"_storage">;
          fileSize: number;
          filename: string;
          isDefault?: boolean;
          mimeType: string;
          updatedAt: number;
          userProfileId: Id<"userProfiles">;
        }>;
      }
    >;
    getResume: FunctionReference<
      "query",
      "public",
      { resumeId: Id<"resumes"> },
      {
        _creationTime: number;
        _id: Id<"resumes">;
        createdAt: number;
        extractedText?: string;
        fileId: Id<"_storage">;
        fileSize: number;
        filename: string;
        isDefault?: boolean;
        mimeType: string;
        updatedAt: number;
        userProfileId: Id<"userProfiles">;
      } | null
    >;
    getDownloadUrl: FunctionReference<
      "query",
      "public",
      { resumeId: Id<"resumes"> },
      string | null
    >;
    deleteResume: FunctionReference<
      "mutation",
      "public",
      { resumeId: Id<"resumes"> },
      { success: boolean }
    >;
    getResumeStats: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      { thisMonth: number; total: number; totalCreditsSpent: number }
    >;
    setDefault: FunctionReference<
      "mutation",
      "public",
      { resumeId: Id<"resumes"> },
      { success: boolean }
    >;
    getDefaultResume: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      {
        _creationTime: number;
        _id: Id<"resumes">;
        createdAt: number;
        extractedText?: string;
        fileId: Id<"_storage">;
        fileSize: number;
        filename: string;
        isDefault?: boolean;
        mimeType: string;
        updatedAt: number;
        userProfileId: Id<"userProfiles">;
      } | null
    >;
  };
  userHelpers: {
    clearAllUserData: FunctionReference<
      "mutation",
      "public",
      { confirmEmail: string },
      any
    >;
    createUserProfile: FunctionReference<
      "mutation",
      "public",
      { email: string; name: string },
      { userProfileId: Id<"userProfiles"> }
    >;
    debugAuthAccounts: FunctionReference<
      "mutation",
      "public",
      { email: string },
      any
    >;
    debugEmailVerification: FunctionReference<
      "mutation",
      "public",
      { code: string; email: string },
      any
    >;
    debugUserStatus: FunctionReference<
      "mutation",
      "public",
      { email: string },
      any
    >;
    deleteUserProfile: FunctionReference<
      "mutation",
      "public",
      Record<string, never>,
      {
        deletedItems: {
          coverLetters: number;
          creditTransactions: number;
          resumes: number;
          userProfile: boolean;
        };
        success: boolean;
      }
    >;
    ensureUserProfile: FunctionReference<
      "mutation",
      "public",
      { name?: string },
      { userProfileId: Id<"userProfiles"> }
    >;
    fixProviderNames: FunctionReference<
      "mutation",
      "public",
      { email: string },
      any
    >;
    getAllUsers: FunctionReference<
      "query",
      "public",
      { limit?: number },
      Array<{
        _id: Id<"userProfiles">;
        createdAt: number;
        credits?: number;
        email: string;
        isAdmin?: boolean;
        name: string;
        plan: "none" | "starter" | "pro" | "hired";
        subscriptionStatus?:
          | "active"
          | "canceled"
          | "incomplete"
          | "incomplete_expired"
          | "past_due"
          | "trialing"
          | "unpaid";
      }>
    >;
    getCurrentUserAdminStatus: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      {
        isAdmin: boolean;
        isAuthenticated: boolean;
        userProfile?: {
          _id: Id<"userProfiles">;
          email: string;
          isAdmin?: boolean;
          name: string;
          plan: "none" | "starter" | "pro" | "hired";
        };
      }
    >;
    getUserProfile: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      {
        _id: Id<"userProfiles">;
        createdAt: number;
        credits: number;
        email: string;
        name: string;
        plan: "none" | "starter" | "pro" | "hired";
        stripeCustomerId?: string;
        subscriptionStatus?:
          | "active"
          | "canceled"
          | "incomplete"
          | "incomplete_expired"
          | "past_due"
          | "trialing"
          | "unpaid";
        updatedAt: number;
      }
    >;
    getUserProfileId: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Id<"userProfiles">
    >;
    grantAdminAccess: FunctionReference<
      "mutation",
      "public",
      { userEmail: string },
      { message: string; success: boolean }
    >;
    isCurrentUserAdmin: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      boolean
    >;
    revokeAdminAccess: FunctionReference<
      "mutation",
      "public",
      { userEmail: string },
      { message: string; success: boolean }
    >;
    updateUserPlan: FunctionReference<
      "mutation",
      "public",
      {
        plan: "none" | "starter" | "pro" | "hired";
        stripeCustomerId?: string;
        stripeSubscriptionId?: string;
        subscriptionCurrentPeriodEnd?: string;
        subscriptionCurrentPeriodStart?: string;
        subscriptionStatus?:
          | "active"
          | "canceled"
          | "incomplete"
          | "incomplete_expired"
          | "past_due"
          | "trialing"
          | "unpaid";
      },
      { success: boolean }
    >;
    updateUserProfile: FunctionReference<
      "mutation",
      "public",
      {
        billingAddress?: {
          city: string;
          country: string;
          line1: string;
          line2?: string;
          postalCode: string;
          state: string;
        };
        email?: string;
        name?: string;
      },
      { success: boolean }
    >;
  };
  users: {
    getDashboard: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    getUserProfile: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    updateProfile: FunctionReference<
      "mutation",
      "public",
      { email?: string; name?: string },
      any
    >;
    getUserStats: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    deleteAccount: FunctionReference<
      "mutation",
      "public",
      { confirmation: string },
      any
    >;
  };
  auth: {
    isAuthenticated: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    signIn: FunctionReference<
      "action",
      "public",
      {
        calledBy?: string;
        params?: any;
        provider?: string;
        refreshToken?: string;
        verifier?: string;
      },
      any
    >;
    signOut: FunctionReference<"action", "public", Record<string, never>, any>;
  };
  billing: {
    getPricingPlans: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    getCurrentSubscription: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    createPaymentRecord: FunctionReference<
      "mutation",
      "public",
      {
        amount: number;
        currency: string;
        description: string;
        metadata?: any;
        status: "pending" | "succeeded" | "failed" | "canceled" | "refunded";
        stripeSessionId?: string;
        type: "subscription" | "credits" | "one_time";
        userProfileId: Id<"userProfiles">;
      },
      any
    >;
    createSubscriptionCheckout: FunctionReference<
      "action",
      "public",
      {
        cancelUrl: string;
        metadata?: any;
        priceId: string;
        successUrl: string;
      },
      any
    >;
    createCreditsCheckout: FunctionReference<
      "mutation",
      "public",
      {
        cancelUrl: string;
        creditPackageId: string;
        metadata?: any;
        successUrl: string;
      },
      any
    >;
    cancelSubscription: FunctionReference<
      "mutation",
      "public",
      { cancelAtPeriodEnd?: boolean },
      any
    >;
    reactivateSubscription: FunctionReference<
      "mutation",
      "public",
      Record<string, never>,
      any
    >;
    getPaymentHistory: FunctionReference<
      "query",
      "public",
      { limit?: number; page?: number },
      any
    >;
    getSubscriptionHistory: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    getBillingStats: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    updateBillingAddress: FunctionReference<
      "mutation",
      "public",
      {
        address: {
          city: string;
          country: string;
          line1: string;
          line2?: string;
          postalCode: string;
          state: string;
        };
      },
      any
    >;
    getBillingAddress: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    handleStripeWebhook: FunctionReference<
      "mutation",
      "public",
      { event: any },
      any
    >;
    testStripeIntegration: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    getWebhookStats: FunctionReference<
      "query",
      "public",
      { hours?: number },
      any
    >;
    getTransactionById: FunctionReference<
      "query",
      "public",
      { transactionId: string },
      any
    >;
    debugProcessSubscription: FunctionReference<
      "mutation",
      "public",
      { subscriptionId: string },
      any
    >;
    debugCancelSubscription: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    testCancelSubscription: FunctionReference<
      "mutation",
      "public",
      { cancelAtPeriodEnd?: boolean },
      any
    >;
  };
  coverLetters: {
    generateFromForm: FunctionReference<
      "mutation",
      "public",
      {
        companyName: string;
        createJobApplication?: boolean;
        jobApplicationData?: {
          jobType?:
            | "full-time"
            | "part-time"
            | "contract"
            | "internship"
            | "freelance";
          jobUrl?: string;
          location?: string;
          notes?: string;
          salary?: string;
        };
        jobDescription?: string;
        jobTitle: string;
        preferences?: {
          customInstructions?: string;
          length?: "short" | "medium" | "long";
          tone?: "professional" | "casual" | "enthusiastic";
        };
        resumeId: Id<"resumes">;
      },
      {
        coverLetter: {
          _creationTime: number;
          _id: Id<"coverLetters">;
          company?: string;
          content: string;
          createdAt: number;
          creditsUsed: number;
          extractedJobId?: Id<"extractedJobs">;
          jobTitle?: string;
          preferences?: any;
          resumeId: Id<"resumes">;
          userProfileId: Id<"userProfiles">;
        };
        remainingCredits: number;
        tokensUsed: number;
      }
    >;
    generate: FunctionReference<
      "mutation",
      "public",
      {
        extractedContent: {
          company?: string;
          confidence: number;
          description?: string;
          domain: string;
          location?: string;
          pageType: string;
          requirements?: Array<string>;
          salary?: string;
          skills?: Array<string>;
          title?: string;
          type?: string;
          url: string;
        };
        preferences?: {
          focus?: "experience" | "skills" | "achievements";
          length?: "short" | "medium" | "long";
          tone?: "professional" | "casual" | "enthusiastic";
        };
        resumeId: Id<"resumes">;
      },
      {
        coverLetter: {
          _creationTime: number;
          _id: Id<"coverLetters">;
          company?: string;
          content: string;
          createdAt: number;
          creditsUsed: number;
          extractedJobId?: Id<"extractedJobs">;
          jobTitle?: string;
          preferences?: any;
          resumeId: Id<"resumes">;
          userProfileId: Id<"userProfiles">;
        };
        remainingCredits: number;
        tokensUsed: number;
      }
    >;
    updateContent: FunctionReference<
      "mutation",
      "public",
      {
        content: string;
        coverLetterId: Id<"coverLetters">;
        tokensUsed?: number;
      },
      { success: boolean }
    >;
    getCoverLetters: FunctionReference<
      "query",
      "public",
      { limit?: number },
      {
        coverLetters: Array<{
          _creationTime: number;
          _id: Id<"coverLetters">;
          company?: string;
          content: string;
          createdAt?: number;
          creditsUsed: number;
          extractedJobId?: Id<"extractedJobs">;
          jobTitle?: string;
          preferences?: any;
          resumeId: Id<"resumes">;
          userProfileId: Id<"userProfiles">;
        }>;
        hasMore: boolean;
      }
    >;
    getCoverLetter: FunctionReference<
      "query",
      "public",
      { coverLetterId: Id<"coverLetters"> },
      {
        _creationTime: number;
        _id: Id<"coverLetters">;
        company?: string;
        content: string;
        createdAt?: number;
        creditsUsed: number;
        extractedJobId?: Id<"extractedJobs">;
        jobTitle?: string;
        preferences?: any;
        resumeId: Id<"resumes">;
        userProfileId: Id<"userProfiles">;
      } | null
    >;
    deleteCoverLetter: FunctionReference<
      "mutation",
      "public",
      { coverLetterId: Id<"coverLetters"> },
      { success: boolean }
    >;
    getCoverLetterStats: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      { thisMonth: number; total: number; totalCreditsSpent: number }
    >;
  };
  credits: {
    checkCredits: FunctionReference<
      "query",
      "public",
      { requiredCredits: number },
      any
    >;
    getUserCredits: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    addCredits: FunctionReference<
      "mutation",
      "public",
      {
        amount: number;
        description?: string;
        metadata?: any;
        source: string;
        sourceId?: string;
      },
      any
    >;
    deductCredits: FunctionReference<
      "mutation",
      "public",
      {
        amount: number;
        description?: string;
        metadata?: any;
        source: string;
        sourceId?: string;
      },
      any
    >;
    getCreditHistory: FunctionReference<
      "query",
      "public",
      {
        limit?: number;
        page?: number;
        type?: "earned" | "spent" | "refunded" | "expired";
      },
      any
    >;
    getCreditStats: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    checkSubscriptionLimits: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    getApiUsageStats: FunctionReference<
      "query",
      "public",
      { days?: number },
      any
    >;
  };
  jobApplications: {
    getJobApplications: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    create: FunctionReference<
      "mutation",
      "public",
      {
        appliedDate?: number;
        companyName: string;
        coverLetterId?: Id<"coverLetters">;
        jobTitle: string;
        jobType?:
          | "full-time"
          | "part-time"
          | "contract"
          | "internship"
          | "freelance";
        jobUrl?: string;
        location?: string;
        notes?: string;
        resumeId?: Id<"resumes">;
        salary?: string;
        status?:
          | "applied"
          | "interviewing"
          | "offered"
          | "rejected"
          | "withdrawn";
      },
      any
    >;
    updateStatus: FunctionReference<
      "mutation",
      "public",
      {
        jobApplicationId: Id<"jobApplications">;
        notes?: string;
        status:
          | "applied"
          | "interviewing"
          | "offered"
          | "rejected"
          | "withdrawn";
      },
      any
    >;
    update: FunctionReference<
      "mutation",
      "public",
      {
        appliedDate?: number;
        companyName?: string;
        jobApplicationId: Id<"jobApplications">;
        jobTitle?: string;
        jobType?:
          | "full-time"
          | "part-time"
          | "contract"
          | "internship"
          | "freelance";
        jobUrl?: string;
        location?: string;
        notes?: string;
        salary?: string;
        status?:
          | "applied"
          | "interviewing"
          | "offered"
          | "rejected"
          | "withdrawn";
      },
      any
    >;
    deleteJobApplication: FunctionReference<
      "mutation",
      "public",
      { jobApplicationId: Id<"jobApplications"> },
      any
    >;
    createFromExtractedJob: FunctionReference<
      "mutation",
      "public",
      {
        appliedDate?: number;
        coverLetterId?: Id<"coverLetters">;
        extractedJobId: Id<"extractedJobs">;
        notes?: string;
        resumeId?: Id<"resumes">;
        status?:
          | "applied"
          | "interviewing"
          | "offered"
          | "rejected"
          | "withdrawn";
      },
      any
    >;
    getJobApplication: FunctionReference<
      "query",
      "public",
      { jobApplicationId: Id<"jobApplications"> },
      any
    >;
  };
  jobs: {
    extractFromHTML: FunctionReference<
      "action",
      "public",
      { html: string; maxTokens?: number; title?: string; url: string },
      {
        company: string;
        confidence: number;
        description: string;
        domain: string;
        jobId: Id<"extractedJobs">;
        location: string;
        pageType: string;
        postedDate?: string;
        remainingCredits: number;
        requirements: Array<string>;
        salary?: string;
        title: string;
        type?: string;
        url: string;
      }
    >;
    createJobRecord: FunctionReference<
      "mutation",
      "public",
      { title?: string; url: string },
      { jobId: Id<"extractedJobs">; newBalance: number }
    >;
    updateJobData: FunctionReference<
      "mutation",
      "public",
      {
        extractedData: {
          benefits?: Array<string>;
          company?: string;
          confidence: number;
          description?: string;
          experience?: string;
          industry?: string;
          jobType?: string;
          location?: string;
          pageType: string;
          remote?: string;
          requirements?: Array<string>;
          salary?: string;
          skills?: Array<string>;
          title?: string;
        };
        jobId: Id<"extractedJobs">;
      },
      { success: boolean }
    >;
    getLatestExtractionByUrl: FunctionReference<
      "query",
      "public",
      { url: string },
      {
        _creationTime: number;
        _id: Id<"extractedJobs">;
        benefits?: Array<string>;
        company?: string;
        confidence?: number;
        description?: string;
        experience?: string;
        extractedAt: number;
        industry?: string;
        jobType?: string;
        location?: string;
        pageType?: string;
        remote?: string;
        requirements?: Array<string>;
        salary?: string;
        skills?: Array<string>;
        title?: string;
        url: string;
        userProfileId: Id<"userProfiles">;
      } | null
    >;
    getExtractedJobs: FunctionReference<
      "query",
      "public",
      { limit?: number },
      {
        hasMore: boolean;
        jobs: Array<{
          _creationTime: number;
          _id: Id<"extractedJobs">;
          benefits?: Array<string>;
          company?: string;
          confidence?: number;
          description?: string;
          experience?: string;
          extractedAt: number;
          industry?: string;
          jobType?: string;
          location?: string;
          pageType?: string;
          remote?: string;
          requirements?: Array<string>;
          salary?: string;
          skills?: Array<string>;
          title?: string;
          url: string;
          userProfileId: Id<"userProfiles">;
        }>;
      }
    >;
    getExtractedJob: FunctionReference<
      "query",
      "public",
      { jobId: Id<"extractedJobs"> },
      {
        _creationTime: number;
        _id: Id<"extractedJobs">;
        benefits?: Array<string>;
        company?: string;
        confidence?: number;
        description?: string;
        experience?: string;
        extractedAt: number;
        industry?: string;
        jobType?: string;
        location?: string;
        pageType?: string;
        remote?: string;
        requirements?: Array<string>;
        salary?: string;
        skills?: Array<string>;
        title?: string;
        url: string;
        userProfileId: Id<"userProfiles">;
      } | null
    >;
    deleteExtractedJob: FunctionReference<
      "mutation",
      "public",
      { jobId: Id<"extractedJobs"> },
      { success: boolean }
    >;
    getJobStats: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      { thisMonth: number; total: number; totalCreditsSpent: number }
    >;
  };
  ai: {
    generateCoverLetter: FunctionReference<
      "action",
      "public",
      {
        company: string;
        coverLetterId: Id<"coverLetters">;
        jobDescription: string;
        jobTitle: string;
        preferences?: {
          focus?: "experience" | "skills" | "achievements";
          length?: "short" | "medium" | "long";
          tone?: "professional" | "casual" | "enthusiastic";
        };
        resumeText: string;
      },
      { success: boolean; tokensUsed: number }
    >;
    extractJobFromHTML: FunctionReference<
      "action",
      "public",
      { html: string; jobId: Id<"extractedJobs">; title?: string; url: string },
      { confidence: number; success: boolean }
    >;
    extractTextFromResume: FunctionReference<
      "action",
      "public",
      { fileId: Id<"_storage">; mimeType: string; resumeId: Id<"resumes"> },
      { error?: string; extractedText?: string; success: boolean }
    >;
  };
  adminSetup: {
    makeFirstAdmin: FunctionReference<
      "mutation",
      "public",
      { userEmail: string },
      any
    >;
  };
  accountLinking: {
    checkAccountLinking: FunctionReference<
      "query",
      "public",
      { email: string },
      any
    >;
    getUserLinkedAccounts: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    logAccountLinking: FunctionReference<
      "mutation",
      "public",
      { provider: string },
      any
    >;
  };
  emailResend: {
    testResendConnection: FunctionReference<
      "mutation",
      "public",
      Record<string, never>,
      any
    >;
    checkVerificationStatus: FunctionReference<
      "mutation",
      "public",
      { email: string },
      any
    >;
    resendVerificationEmail: FunctionReference<
      "mutation",
      "public",
      { email: string },
      any
    >;
  };
};
export type InternalApiType = {};
