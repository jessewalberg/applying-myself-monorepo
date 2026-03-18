import { v, ConvexError } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { getCurrentUserProfile } from "./userHelpers";
import { api } from "./_generated/api";
import { CREDITS, PAGINATION } from "./constants";
import type { Doc, Id } from "./_generated/dataModel";

// Helper function to convert null values to undefined for Convex validation
function cleanNullValues<T extends Record<string, any>>(obj: T): T {
  const cleaned = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    cleaned[key as keyof T] = value === null ? undefined : value;
  }
  return cleaned;
}

// Intelligent company name guessing from domain and URL patterns
function intelligentCompanyGuess(domain: string, url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();

    // Skip common job board domains
    const jobBoards = ['indeed', 'linkedin', 'glassdoor', 'monster', 'dice', 'ziprecruiter', 'simplyhired'];
    const isJobBoard = jobBoards.some(board => hostname.includes(board));

    if (isJobBoard) {
      // Try to extract company from path for job boards
      if (hostname.includes('linkedin') && pathname.includes('/company/')) {
        const companyMatch = pathname.match(/\/company\/([^\/]+)/);
        if (companyMatch) {
          return formatCompanyName(companyMatch[1]);
        }
      }
      
      if (pathname.includes('/') && pathname.length > 1) {
        const pathParts = pathname.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          return formatCompanyName(pathParts[0]);
        }
      }
      
      return "Unknown Company";
    }

    // Extract from subdomain patterns
    if (hostname.startsWith('jobs.') || hostname.startsWith('careers.')) {
      const mainDomain = hostname.replace(/^(jobs|careers)\./, '');
      return formatCompanyName(mainDomain.split('.')[0]);
    }

    // Extract from main domain
    const domainParts = hostname.split('.');
    const mainDomain = domainParts[domainParts.length - 2]; // Get the part before .com/.org etc
    
    if (mainDomain && mainDomain.length > 1) {
      return formatCompanyName(mainDomain);
    }

    return "Unknown Company";
  } catch (error) {
    console.error('Error parsing URL for company guess:', error);
    return "Unknown Company";
  }
}

// Format domain/path part into proper company name
function formatCompanyName(input: string): string {
  if (!input) return "Unknown Company";
  
  // Remove common suffixes and clean up
  const cleaned = input
    .replace(/[-_]/g, ' ')
    .replace(/\b(inc|llc|corp|ltd|company|co)\b/gi, '')
    .trim();
  
  // Capitalize first letter of each word
  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim() || "Unknown Company";
}

// Extract job information from HTML content with AI (synchronous processing)
export const extractFromHTML = action({
  args: {
    html: v.string(),
    url: v.string(),
    title: v.optional(v.string()),
    maxTokens: v.optional(v.number()),
  },
  returns: v.object({
    title: v.string(),
    company: v.string(),
    location: v.string(),
    description: v.string(),
    requirements: v.array(v.string()),
    salary: v.optional(v.string()),
    type: v.optional(v.string()),
    postedDate: v.optional(v.string()),
    url: v.string(),
    confidence: v.number(),
    pageType: v.string(),
    domain: v.string(),
    remainingCredits: v.number(),
  }),
  handler: async (ctx, args): Promise<{
    title: string;
    company: string;
    location: string;
    description: string;
    requirements: string[];
    salary?: string;
    type?: string;
    postedDate?: string;
    url: string;
    confidence: number;
    pageType: string;
    domain: string;
    remainingCredits: number;
  }> => {
    // Validate input
    if (args.html.length < 100) {
      throw new ConvexError("HTML content too short");
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(args.url);
    } catch {
      throw new ConvexError("Invalid URL");
    }
    const domain = parsedUrl.hostname;

    // Check user authentication and credits via mutation
    const { newBalance, jobId } = await ctx.runMutation(api.jobs.createJobRecord, {
      url: args.url,
      title: args.title,
    });

    try {
      // Use AI to extract job information
      const { extractJobFromHTML } = await import("../lib/ai");
      
      const result = await extractJobFromHTML(
        args.html,
        args.url,
        args.title || "",
        args.maxTokens || 15000
      );

      let extractedContent: {
        title: string;
        company: string;
        location: string;
        description: string;
        requirements: string[];
        salary?: string;
        type?: string;
        postedDate?: string;
        url: string;
        confidence: number;
        pageType: string;
        domain: string;
        remainingCredits: number;
      };

      if (result.success && result.jobData) {
        const normalizedJobData = cleanNullValues(result.jobData);

        // AI extraction successful
        extractedContent = {
          title: normalizedJobData.title || args.title || "Job Position",
          company: normalizedJobData.company || "Unknown Company",
          location: normalizedJobData.location || "Not specified",
          description: normalizedJobData.description || "No description available",
          requirements: normalizedJobData.requirements || [],
          salary: normalizedJobData.salary,
          type: normalizedJobData.jobType,
          postedDate: undefined,
          url: args.url,
          confidence: result.confidence,
          pageType: normalizedJobData.pageType || "job",
          domain,
          remainingCredits: newBalance,
        };

        // Update job record with AI results
        await ctx.runMutation(api.jobs.updateJobData, {
          jobId,
          extractedData: cleanNullValues({
            title: normalizedJobData.title,
            company: normalizedJobData.company,
            location: normalizedJobData.location,
            description: normalizedJobData.description,
            salary: normalizedJobData.salary,
            jobType: normalizedJobData.jobType,
            experience: normalizedJobData.experience,
            requirements: normalizedJobData.requirements,
            skills: normalizedJobData.skills,
            benefits: normalizedJobData.benefits,
            industry: normalizedJobData.industry,
            remote: normalizedJobData.remote,
            pageType: normalizedJobData.pageType || "job",
            confidence: result.confidence,
          }),
        });

      } else {
        // AI extraction failed, use intelligent fallback
        console.error("AI extraction failed:", result.error);
        const company = intelligentCompanyGuess(domain, args.url);
        
        extractedContent = {
          title: args.title || "Job Position",
          company,
          location: "Not specified",
          description: "Unable to extract detailed job information. Please review the original posting.",
          requirements: ["Please review original job posting for requirements"],
          salary: undefined,
          type: undefined,
          postedDate: undefined,
          url: args.url,
          confidence: 0.2,
          pageType: "job",
          domain,
          remainingCredits: newBalance,
        };

        // Update job record with fallback data
        await ctx.runMutation(api.jobs.updateJobData, {
          jobId,
          extractedData: {
            title: extractedContent.title,
            company: extractedContent.company,
            location: extractedContent.location,
            description: extractedContent.description,
            salary: extractedContent.salary,
            jobType: extractedContent.type,
            experience: undefined,
            requirements: extractedContent.requirements,
            skills: [],
            benefits: [],
            industry: undefined,
            remote: undefined,
            pageType: extractedContent.pageType,
            confidence: extractedContent.confidence,
          },
        });
      }

      return extractedContent;

    } catch (error) {
      console.error("Job extraction error:", error);
      
      // Create minimal fallback data
      const company = intelligentCompanyGuess(domain, args.url);
      
      const fallbackContent = {
        title: args.title || "Job Position",
        company,
        location: "Not specified",
        description: "Failed to extract job information. Please review the original posting.",
        requirements: ["Please review original job posting"],
        salary: undefined,
        type: undefined,
        postedDate: undefined,
        url: args.url,
        confidence: 0.1,
        pageType: "job",
        domain,
        remainingCredits: newBalance,
      };

      // Update job record with error state
      await ctx.runMutation(api.jobs.updateJobData, {
        jobId,
        extractedData: {
          title: fallbackContent.title,
          company: fallbackContent.company,
          location: fallbackContent.location,
          description: fallbackContent.description,
          salary: fallbackContent.salary,
          jobType: fallbackContent.type,
          experience: undefined,
          requirements: fallbackContent.requirements,
          skills: [],
          benefits: [],
          industry: undefined,
          remote: undefined,
          pageType: fallbackContent.pageType,
          confidence: fallbackContent.confidence,
        },
      });

      return fallbackContent;
    }
  },
});

// Helper mutation to create job record and handle credits
export const createJobRecord = mutation({
  args: {
    url: v.string(),
    title: v.optional(v.string()),
  },
  returns: v.object({
    newBalance: v.number(),
    jobId: v.id("extractedJobs"),
  }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    // Check credits
    const creditsRequired = CREDITS.JOB_EXTRACTION;
    const currentCredits = userProfile.credits || 0;
    if (currentCredits < creditsRequired) {
      throw new ConvexError("Insufficient credits. Please upgrade your plan or purchase more credits.");
    }

    // Deduct credits
    const newBalance = currentCredits - creditsRequired;
    await ctx.db.patch(userProfile._id, {
      credits: newBalance,
      updatedAt: Date.now(),
    });

    // Log credit transaction
    await ctx.db.insert("creditTransactions", {
      userProfileId: userProfile._id,
      type: "spent",
      amount: creditsRequired,
      balance: newBalance,
      source: "extract-from-html",
      description: "Job extraction from HTML",
      createdAt: Date.now(),
    });

    // Create initial job record
    const jobId = await ctx.db.insert("extractedJobs", {
      userProfileId: userProfile._id,
      url: args.url,
      title: args.title || "Job Position",
      company: "Processing...",
      location: "Processing...",
      description: "Processing job content...",
      salary: undefined,
      jobType: undefined,
      requirements: [],
      pageType: "job",
      confidence: 0.0,
      extractedAt: Date.now(),
    });

    return {
      newBalance,
      jobId,
    };
  },
});

// Update job with extracted data (called by AI action)
export const updateJobData = mutation({
  args: {
    jobId: v.id("extractedJobs"),
    extractedData: v.object({
      title: v.optional(v.string()),
      company: v.optional(v.string()),
      location: v.optional(v.string()),
      description: v.optional(v.string()),
      salary: v.optional(v.string()),
      jobType: v.optional(v.string()),
      experience: v.optional(v.string()),
      requirements: v.optional(v.array(v.string())),
      skills: v.optional(v.array(v.string())),
      benefits: v.optional(v.array(v.string())),
      industry: v.optional(v.string()),
      remote: v.optional(v.string()),
      pageType: v.string(),
      confidence: v.number(),
    }),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      ...args.extractedData,
    });
    
    return { success: true };
  },
});

// Get the latest extraction for a specific URL
export const getLatestExtractionByUrl = query({
  args: {
    url: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("extractedJobs"),
      _creationTime: v.number(),
      userProfileId: v.id("userProfiles"),
      url: v.string(),
      title: v.optional(v.string()),
      company: v.optional(v.string()),
      location: v.optional(v.string()),
      salary: v.optional(v.string()),
      jobType: v.optional(v.string()),
      experience: v.optional(v.string()),
      requirements: v.optional(v.array(v.string())),
      description: v.optional(v.string()),
      benefits: v.optional(v.array(v.string())),
      skills: v.optional(v.array(v.string())),
      industry: v.optional(v.string()),
      remote: v.optional(v.string()),
      pageType: v.optional(v.string()),
      confidence: v.optional(v.number()),
      extractedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    const job = await ctx.db
      .query("extractedJobs")
      .withIndex("by_user_date", (q) => q.eq("userProfileId", userProfile._id))
      .filter((q) => q.eq(q.field("url"), args.url))
      .order("desc")
      .first();

    return job;
  },
});

// Get all extracted jobs for the current user
export const getExtractedJobs = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.object({
    jobs: v.array(v.object({
      _id: v.id("extractedJobs"),
      _creationTime: v.number(),
      userProfileId: v.id("userProfiles"),
      url: v.string(),
      title: v.optional(v.string()),
      company: v.optional(v.string()),
      location: v.optional(v.string()),
      salary: v.optional(v.string()),
      jobType: v.optional(v.string()),
      experience: v.optional(v.string()),
      requirements: v.optional(v.array(v.string())),
      description: v.optional(v.string()),
      benefits: v.optional(v.array(v.string())),
      skills: v.optional(v.array(v.string())),
      industry: v.optional(v.string()),
      remote: v.optional(v.string()),
      pageType: v.optional(v.string()),
      confidence: v.optional(v.number()),
      extractedAt: v.number(),
    })),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    const limit = Math.min(args.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    
    const jobs = await ctx.db
      .query("extractedJobs")
      .withIndex("by_user_date", (q) => q.eq("userProfileId", userProfile._id))
      .order("desc")
      .take(limit + 1);

    const hasMore = jobs.length > limit;
    const results = hasMore ? jobs.slice(0, limit) : jobs;

    return {
      jobs: results,
      hasMore,
    };
  },
});

// Get a specific extracted job
export const getExtractedJob = query({
  args: {
    jobId: v.id("extractedJobs"),
  },
  returns: v.union(
    v.object({
      _id: v.id("extractedJobs"),
      _creationTime: v.number(),
      userProfileId: v.id("userProfiles"),
      url: v.string(),
      title: v.optional(v.string()),
      company: v.optional(v.string()),
      location: v.optional(v.string()),
      salary: v.optional(v.string()),
      jobType: v.optional(v.string()),
      experience: v.optional(v.string()),
      requirements: v.optional(v.array(v.string())),
      description: v.optional(v.string()),
      benefits: v.optional(v.array(v.string())),
      skills: v.optional(v.array(v.string())),
      industry: v.optional(v.string()),
      remote: v.optional(v.string()),
      pageType: v.optional(v.string()),
      confidence: v.optional(v.number()),
      extractedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    const job = await ctx.db.get(args.jobId);
    if (!job || job.userProfileId !== userProfile._id) {
      return null;
    }
    
    return job;
  },
});

// Delete an extracted job
export const deleteExtractedJob = mutation({
  args: {
    jobId: v.id("extractedJobs"),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    const job = await ctx.db.get(args.jobId);
    if (!job || job.userProfileId !== userProfile._id) {
      throw new ConvexError("Job not found or access denied");
    }
    
    await ctx.db.delete(args.jobId);
    
    return { success: true };
  },
});

// Get job extraction statistics
export const getJobStats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    thisMonth: v.number(),
    totalCreditsSpent: v.number(),
  }),
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    const allJobs = await ctx.db
      .query("extractedJobs")
      .withIndex("by_user_date", (q) => q.eq("userProfileId", userProfile._id))
      .collect();
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonth = allJobs.filter(
      job => job.extractedAt >= startOfMonth.getTime()
    ).length;
    
    const totalCreditsSpent = allJobs.length * CREDITS.JOB_EXTRACTION;
    
    return {
      total: allJobs.length,
      thisMonth,
      totalCreditsSpent,
    };
  },
});
