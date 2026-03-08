import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { generateCoverLetter as generateCoverLetterWithOpenRouter } from "../lib/ai";

export const generateCoverLetter = action({
  args: {
    coverLetterId: v.id("coverLetters"),
    resumeText: v.string(),
    jobDescription: v.string(),
    company: v.string(),
    jobTitle: v.string(),
    preferences: v.optional(v.object({
      tone: v.optional(v.union(v.literal("professional"), v.literal("casual"), v.literal("enthusiastic"))),
      focus: v.optional(v.union(v.literal("experience"), v.literal("skills"), v.literal("achievements"))),
      length: v.optional(v.union(v.literal("short"), v.literal("medium"), v.literal("long"))),
    })),
  },
  returns: v.object({
    success: v.boolean(),
    tokensUsed: v.number(),
  }),
  handler: async (ctx, args) => {
    console.info("[convex.ai.generateCoverLetter] started", {
      coverLetterId: args.coverLetterId,
      company: args.company,
      jobTitle: args.jobTitle,
    });
    
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key not configured");
    }

    let coverLetterContent: string;
    let tokensUsed = 0;

    try {
      const result = await generateCoverLetterWithOpenRouter(
        {
          title: args.jobTitle,
          company: args.company,
          description: args.jobDescription,
          requirements: [],
          skills: [],
          benefits: [],
        },
        args.resumeText,
        args.preferences
      );
      coverLetterContent = result.content;
      tokensUsed = result.tokensUsed;

      console.info("[convex.ai.generateCoverLetter] completed", {
        coverLetterId: args.coverLetterId,
        tokensUsed,
      });

    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown OpenRouter generation error";
      console.error("[convex.ai.generateCoverLetter] failed", {
        coverLetterId: args.coverLetterId,
        error: errorMessage,
      });

      await ctx.runMutation(api.coverLetters.updateContent, {
        coverLetterId: args.coverLetterId,
        content: "Cover letter generation failed. Retry to try again.",
        generationStatus: "failed",
        generationError: errorMessage,
        tokensUsed: 0,
      });

      throw error;
    }

    // Update the cover letter with generated content
    await ctx.runMutation(api.coverLetters.updateContent, {
      coverLetterId: args.coverLetterId,
      content: coverLetterContent,
      tokensUsed,
      generationStatus: "completed",
      generationError: null,
    });

    return {
      success: true,
      tokensUsed,
    };
  },
});

export const extractJobFromHTML = action({
  args: {
    jobId: v.id("extractedJobs"),
    html: v.string(),
    url: v.string(),
    title: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    confidence: v.number(),
  }),
  handler: async (ctx, args) => {
    console.log("Extracting job data with AI from:", args.url);
    
    try {
      // Import the AI service dynamically to avoid bundling issues
      const { extractJobFromHTML } = await import("../lib/ai");
      
      // Use AI to extract job information
      const result = await extractJobFromHTML(
        args.html,
        args.url,
        args.title || "",
        15000 // maxTokens
      );

      if (!result.success || !result.jobData) {
        console.error("AI extraction failed:", result.error);
        
        // Fallback to basic parsing if AI fails
        const domain = new URL(args.url).hostname;
        const company = domain.split('.')[0]?.replace(/[^a-zA-Z]/g, '') || "Unknown Company";
        
        const fallbackData = {
          title: args.title || "Software Engineer",
          company: company.charAt(0).toUpperCase() + company.slice(1),
          location: "Not specified",
          description: "Unable to extract job description with AI. Please review the original posting.",
          salary: undefined,
          jobType: undefined,
          experience: undefined,
          requirements: ["Please review original job posting"],
          skills: [],
          benefits: [],
          industry: "Technology",
          remote: "unknown",
          pageType: "job",
          confidence: 0.2,
        };

        await ctx.runMutation(api.jobs.updateJobData, {
          jobId: args.jobId,
          extractedData: fallbackData,
        });

        return {
          success: true,
          confidence: fallbackData.confidence,
        };
      }

      // Map AI result to our schema format
      const extractedData = {
        title: result.jobData.title || args.title || "Software Engineer",
        company: result.jobData.company || "Unknown Company",
        location: result.jobData.location || "Not specified",
        description: result.jobData.description || "No description available",
        salary: result.jobData.salary || undefined,
        jobType: result.jobData.jobType || undefined,
        experience: result.jobData.experience || undefined,
        requirements: result.jobData.requirements || [],
        skills: result.jobData.skills || [],
        benefits: result.jobData.benefits || [],
        industry: result.jobData.industry || undefined,
        remote: result.jobData.remote || undefined,
        pageType: result.jobData.pageType || "job",
        confidence: result.confidence,
      };

      // Update the job with AI-extracted data
      await ctx.runMutation(api.jobs.updateJobData, {
        jobId: args.jobId,
        extractedData,
      });

      console.log(`AI extraction completed with confidence: ${result.confidence}, tokens used: ${result.tokensUsed}`);

      return {
        success: true,
        confidence: result.confidence,
      };

    } catch (error) {
      console.error("AI extraction error:", error);
      
      // Fallback to basic parsing on error
      const domain = new URL(args.url).hostname;
      const company = domain.split('.')[0]?.replace(/[^a-zA-Z]/g, '') || "Unknown Company";
      
      const fallbackData = {
        title: args.title || "Job Position",
        company: company.charAt(0).toUpperCase() + company.slice(1),
        location: "Not specified",
        description: "AI extraction failed. Please review the original job posting for details.",
        salary: undefined,
        jobType: undefined,
        experience: undefined,
        requirements: ["Please review original job posting"],
        skills: [],
        benefits: [],
        industry: undefined,
        remote: "unknown",
        pageType: "job",
        confidence: 0.1,
      };

      await ctx.runMutation(api.jobs.updateJobData, {
        jobId: args.jobId,
        extractedData: fallbackData,
      });

      return {
        success: true,
        confidence: 0.1,
      };
    }
  },
});

export const extractTextFromResume = action({
  args: {
    resumeId: v.id("resumes"),
    fileId: v.id("_storage"),
    mimeType: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    console.log("Extracting text from resume:", args.fileId);
    
    // TODO: Implement actual resume text extraction based on file type
    // For PDFs, use pdf-parse or similar
    // For DOCX, use mammoth or similar
    
    const fileUrl = await ctx.storage.getUrl(args.fileId);
    if (!fileUrl) {
      throw new Error("File not found");
    }
    
    // Placeholder text extraction
    const extractedText = "John Doe\nSoftware Engineer\n\nExperience:\n- 5 years of full-stack development\n- Proficient in JavaScript, TypeScript, React, Node.js\n- Experience with databases and cloud platforms\n\nEducation:\n- Bachelor's in Computer Science";

    // Update the resume with extracted text
    await ctx.runMutation(api.resumes.updateExtractedText, {
      resumeId: args.resumeId,
      extractedText,
    });

    return {
      success: true,
    };
  },
}); 
