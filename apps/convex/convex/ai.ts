import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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
    console.log("Generating cover letter for:", args.company, args.jobTitle);
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    let coverLetterContent: string;
    let tokensUsed = 0;

    try {
      const tone = args.preferences?.tone || "professional";
      const focus = args.preferences?.focus || "experience";
      const length = args.preferences?.length || "medium";

      const prompt = `Write a compelling cover letter for this job application:

Job Title: ${args.jobTitle}
Company: ${args.company}
Job Description: ${args.jobDescription}

Candidate Resume:
${args.resumeText}

Instructions:
- Tone: ${tone}
- Focus on: ${focus}
- Length: ${length}
- Write in first person as the candidate
- Be specific and connect resume experience to job requirements
- Include 2-3 relevant achievements or skills
- Professional formatting
- No placeholder text or brackets
- End with a call to action

Generate a personalized cover letter that will get this candidate noticed:`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert cover letter writer who creates compelling, personalized cover letters that get results.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 600
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const result = await response.json();
      coverLetterContent = result.choices[0].message.content;
      tokensUsed = result.usage?.total_tokens || 0;

      console.log(`AI cover letter generated successfully, tokens used: ${tokensUsed}`);

    } catch (error) {
      console.error("AI generation failed:", error);
      
      // Simple fallback
      coverLetterContent = `Dear Hiring Manager,

I am excited to apply for the ${args.jobTitle} position at ${args.company}.

Based on my background and the role requirements, I believe I would be a strong addition to your team. My experience aligns well with what you're looking for, and I'm eager to contribute to ${args.company}'s continued success.

Thank you for considering my application. I look forward to discussing how I can contribute to your team.

Best regards,
[Your Name]`;

      tokensUsed = 50;
    }

    // Update the cover letter with generated content
    await ctx.runMutation(api.coverLetters.updateContent, {
      coverLetterId: args.coverLetterId,
      content: coverLetterContent,
      tokensUsed,
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