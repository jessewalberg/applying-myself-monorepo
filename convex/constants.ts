// Constants for the job application backend
export const CREDITS = {
  // Action costs
  JOB_EXTRACTION: 1,
  RESUME_UPLOAD: 1,
  COVER_LETTER_GENERATION: 3,
  RESUME_TEXT_EXTRACTION: 2,
  
  // Plan credits
  FREE_TIER_CREDITS: 10,
  FREE_SIGNUP_BONUS: 10, // Same as free tier credits
  STARTER_CREDITS: 100,
  PRO_CREDITS: 500,
  ENTERPRISE_CREDITS: 2000,
} as const;

export const PLANS = {
  FREE: "free",
  STARTER: "starter", 
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  CANCELED: "canceled", 
  INCOMPLETE: "incomplete",
  INCOMPLETE_EXPIRED: "incomplete_expired",
  PAST_DUE: "past_due",
  TRIALING: "trialing",
  UNPAID: "unpaid",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  SUCCEEDED: "succeeded",
  FAILED: "failed", 
  CANCELED: "canceled",
  REFUNDED: "refunded",
} as const;

export const CREDIT_TRANSACTION_TYPES = {
  EARNED: "earned",
  SPENT: "spent",
  REFUNDED: "refunded",
  EXPIRED: "expired",
} as const;

export const COVER_LETTER_PREFERENCES = {
  TONE: {
    PROFESSIONAL: "professional",
    CASUAL: "casual",
    ENTHUSIASTIC: "enthusiastic",
  },
  FOCUS: {
    EXPERIENCE: "experience",
    SKILLS: "skills", 
    ACHIEVEMENTS: "achievements",
  },
  LENGTH: {
    SHORT: "short",
    MEDIUM: "medium",
    LONG: "long",
  },
} as const;

export const AI_LIMITS = {
  MAX_TOKENS: 15000,
  MIN_HTML_LENGTH: 100,
  MIN_FILENAME_LENGTH: 1,
  MIN_NAME_LENGTH: 2,
  MIN_PASSWORD_LENGTH: 8,
  
  // Plan limits
  free: {
    maxCoverLetters: 5,
    maxResumes: 3,
    maxJobExtractions: 10,
    credits: 10,
    monthlyCredits: 10,
  },
  starter: {
    maxCoverLetters: 50,
    maxResumes: 10,
    maxJobExtractions: 100,
    credits: 100,
    monthlyCredits: 100,
  },
  pro: {
    maxCoverLetters: 200,
    maxResumes: 50,
    maxJobExtractions: 500,
    credits: 500,
    monthlyCredits: 500,
  },
  enterprise: {
    maxCoverLetters: 1000,
    maxResumes: 200,
    maxJobExtractions: 2000,
    credits: 2000,
    monthlyCredits: 2000,
  },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

export const FILE_TYPES = {
  PDF: "application/pdf",
  TEXT: "text/",
  DOCUMENT: "document",
} as const;
