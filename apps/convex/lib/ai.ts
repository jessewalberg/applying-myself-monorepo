// convex/lib/ai.ts

// Type definitions for AI processing
interface JobExtractionData {
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
  jobType?: string;
  experience?: string;
  requirements?: string[];
  description?: string;
  benefits?: string[];
  skills?: string[];
  industry?: string;
  remote?: string;
  pageType?: string;
  confidence?: number;
  url?: string;
  domain?: string;
}

interface CoverLetterPreferences {
  tone?: 'professional' | 'casual' | 'enthusiastic';
  focus?: 'experience' | 'skills' | 'achievements';
  length?: 'short' | 'medium' | 'long';
}

interface ChatCompletionUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface ChatCompletionMessage {
  role: string;
  content: string;
}

interface ChatCompletionChoice {
  index: number;
  message: ChatCompletionMessage;
  finish_reason: string;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage: ChatCompletionUsage;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatCompletionMessage[];
  temperature: number;
  max_tokens: number;
  response_format?: { type: "json_object" };
}

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4o";

function getOpenRouterApiKey() {
  return process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
}

async function createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    throw new Error("OpenRouter API key not configured");
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://applyingmyself.com",
      "X-Title": process.env.OPENROUTER_APP_NAME || "ApplyingMyself",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json() as ChatCompletionResponse;
}

// Extract job information from HTML content
export async function extractJobFromHTML(
  html: string, 
  url: string, 
  title: string, 
  maxTokens = 15000
) {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    return {
      success: false,
      error: "OpenRouter API key not configured",
      jobData: null,
      confidence: 0,
      tokensUsed: 0
    };
  }

  const cleanedHtml = cleanHTML(html, maxTokens);
  
  const prompt = `
Analyze this job posting content and extract structured information. Return ONLY valid JSON with these exact fields:

{
  "title": "exact job title",
  "company": "company name",
  "location": "location (city, state/country)",
  "salary": "salary range or compensation",
  "jobType": "full-time/part-time/contract/internship",
  "experience": "experience level required",
  "requirements": ["requirement 1", "requirement 2"],
  "description": "brief job description (2-3 sentences)",
  "benefits": ["benefit 1", "benefit 2"],
  "skills": ["skill 1", "skill 2"],
  "industry": "industry/sector",
  "remote": "remote/hybrid/on-site",
  "pageType": "job" or "general",
  "confidence": 0.8,
  "url": "${url}",
  "domain": "${new URL(url).hostname}"
  }

CRITICAL INSTRUCTIONS FOR COMPANY NAME EXTRACTION:
The company name is the most important field. Use these strategies in order of priority:

1. DIRECT CONTENT SEARCH: Look for explicit company names in:
   - Page headers, titles, H1/H2 tags
   - "About [Company]" sections
   - Copyright notices "© 2024 [Company Name]"
   - Job descriptions mentioning "Join [Company]" or "Working at [Company]"
   - Branded elements, logos descriptions

2. URL PATTERN ANALYSIS: 
   - If URL like "jobs.apple.com" → extract "Apple"
   - If URL like "linkedin.com/company/microsoft" → extract "Microsoft"  
   - If URL like "careers.stripe.com" → extract "Stripe"
   - If URL like "greenhouse.io/shopify" → extract "Shopify"

3. INTELLIGENT DOMAIN GUESSING (last resort):
   - amazon.com → "Amazon"
   - netflix.com → "Netflix" 
   - shopify.com → "Shopify"
   - stripe.com → "Stripe"
   - Convert domain to proper company name format

4. NEVER USE JOB BOARD NAMES:
   - NEVER use "Indeed", "LinkedIn", "Glassdoor", "Monster", etc.
   - These are job platforms, not the hiring company
   - Always look for the actual employer

Content to analyze:
Title: ${title}
URL: ${url}
Content: ${cleanedHtml}

Use your best judgement to extract the information. Use null for missing fields. Set pageType to "job" if this is clearly a job posting, "general" otherwise.
`;

  try {
    const result = await createChatCompletion({
      model: process.env.OPENROUTER_EXTRACTION_MODEL || DEFAULT_OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a precise content analyzer. Extract only accurate information that is clearly stated in the content. Return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });
    const extractedText = result.choices[0].message.content;

    // Parse JSON response
    let jobData: JobExtractionData;
    try { 
      jobData = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Try to extract JSON from response if parsing fails
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jobData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    // Calculate confidence score based on extracted fields
    const fields = Object.keys(jobData).filter(key => 
      jobData[key as keyof JobExtractionData] !== null && 
      jobData[key as keyof JobExtractionData] !== '' && 
      jobData[key as keyof JobExtractionData] !== undefined &&
      !(Array.isArray(jobData[key as keyof JobExtractionData]) && (jobData[key as keyof JobExtractionData] as unknown[]).length === 0)
    );
    
    // Higher confidence for more fields and job-specific content
    let confidence = Math.min(fields.length / 10, 1);
    if (jobData.title && jobData.company) confidence += 0.1;
    if (jobData.pageType === 'job') confidence += 0.2;
    confidence = Math.min(confidence, 1);

    return {
      success: true,
      jobData,
      confidence: Math.round(confidence * 100) / 100,
      extractedFields: fields,
      tokensUsed: result.usage?.total_tokens || 0
    };

  } catch (error) {
    console.error('AI extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI extraction failed',
      jobData: null,
      confidence: 0,
      tokensUsed: 0
    };
  }
}

// Generate cover letter
export async function generateCoverLetter(
  jobData: JobExtractionData, 
  resumeText: string, 
  preferences: CoverLetterPreferences = {}
) {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    throw new Error("OpenRouter API key not configured");
  }

  // Truncate resume text to avoid token limits
  const truncatedResume = resumeText.substring(0, 8000);
  
  const prompt = `
You are an expert cover letter writer with 15+ years of experience. Create a personalized, compelling cover letter based on the job information and candidate's resume.

Job Information:
${JSON.stringify(jobData, null, 2)}

Resume Content:
${truncatedResume}

Writing Preferences:
- Tone: ${preferences.tone || 'professional'}
- Focus: ${preferences.focus || 'experience'}
- Length: ${preferences.length || 'medium'}

Create a compelling cover letter that:
1. Opens with enthusiasm for the specific role and company
2. Connects the candidate's experience directly to job requirements
3. Highlights 2-3 most relevant achievements with quantifiable results
4. Shows genuine knowledge of the company/industry
5. Uses the specified tone throughout
6. Ends with a confident call to action
7. Length guidelines:
   - Short: 2-3 paragraphs (200-300 words)
   - Medium: 3-4 paragraphs (300-450 words)
   - Long: 4-5 paragraphs (450-600 words)

Important guidelines:
- Write in first person as the candidate
- Be specific and avoid generic phrases
- Match the company's culture and tone if evident
- Include relevant keywords from the job posting
- Format as clean, readable text
- No placeholder text or brackets
- Professional closing with candidate's interest in next steps

Generate the cover letter now:
`;

  try {
    const result = await createChatCompletion({
      model: process.env.OPENROUTER_GENERATION_MODEL || DEFAULT_OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert cover letter writer who creates compelling, personalized cover letters that get results. Write professionally but with personality that matches the specified tone.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });
    const coverLetterContent = result.choices[0].message.content;

    return {
      content: coverLetterContent,
      tokensUsed: result.usage?.total_tokens || 0
    };

  } catch (error) {
    console.error('Cover letter generation error:', error);
    throw new Error('Failed to generate cover letter: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Extract text from resume file
export async function extractTextFromResume(fileUrl: string, mimeType: string): Promise<string> {
  if (mimeType.includes('pdf')) {
    // For PDFs, we need a proper PDF parser. For now, return a placeholder
    // In production, you would use a library like pdf-parse or pdf2pic + OCR
    console.warn('PDF text extraction not fully implemented. Consider using a PDF parsing library.');
    return `[PDF Resume Content - ${mimeType}]\n\nNote: This is a PDF file. Text extraction from PDFs requires additional processing. Please ensure your resume content is accessible for the best cover letter generation results.`;
  } else if (mimeType.includes('word')) {
    // For Word documents, return as-is for now (would need proper parser)
    try {
      const response = await fetch(fileUrl);
      return await response.text();
    } catch (error) {
      return `[Word Document - ${mimeType}]\n\nUnable to extract text from Word document.`;
    }
  } else {
    // Plain text or other formats
    try {
      const response = await fetch(fileUrl);
      return await response.text();
    } catch (error) {
      return `[Document - ${mimeType}]\n\nUnable to extract text from document.`;
    }
  }
}

// Helper function to clean HTML content
function cleanHTML(html: string, maxTokens: number): string {
  // Remove script tags, style tags, and comments
  let cleaned = html
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<!--.*?-->/gs, '')
    .replace(/<[^>]+>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Remove HTML entities
    .trim();

  // Truncate to maxTokens (rough estimate: 1 token ≈ 4 characters)
  const maxChars = maxTokens * 3.5; // Be conservative with token estimation
  if (cleaned.length > maxChars) {
    cleaned = cleaned.substring(0, maxChars) + '...';
  }

  return cleaned;
}
