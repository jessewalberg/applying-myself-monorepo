// Pure prompt-building helpers extracted from ai.ts

export interface CoverLetterPromptInput {
  jobTitle: string;
  company: string;
  jobDescription: string;
  resumeText: string;
  preferences?: {
    tone?: "professional" | "casual" | "enthusiastic";
    focus?: "experience" | "skills" | "achievements";
    length?: "short" | "medium" | "long";
  };
}

/**
 * Build the user-facing prompt for cover letter generation.
 * Mirrors the prompt construction in convex/ai.ts → generateCoverLetter handler.
 */
export function buildCoverLetterPrompt(input: CoverLetterPromptInput): string {
  const tone = input.preferences?.tone || "professional";
  const focus = input.preferences?.focus || "experience";
  const length = input.preferences?.length || "medium";

  return `Write a compelling cover letter for this job application:

Job Title: ${input.jobTitle}
Company: ${input.company}
Job Description: ${input.jobDescription}

Candidate Resume:
${input.resumeText}

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
}

/**
 * The system prompt used for cover letter generation.
 */
export const COVER_LETTER_SYSTEM_PROMPT =
  "You are an expert cover letter writer who creates compelling, personalized cover letters that get results.";
