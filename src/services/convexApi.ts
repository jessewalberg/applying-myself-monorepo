import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import CONFIG from '@/config';
import { StorageService } from './storage';
import type { 
  User, 
  Resume, 
  CoverLetter, 
  AuthResponse, 
  GenerateCoverLetterFromContentRequest,
  GenerateCoverLetterResponse,
  ExtractedContent
} from '@/types';

const client = new ConvexHttpClient(CONFIG.CONVEX_URL);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface JobData {
  url: string;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  salary?: string;
  jobType?: string;
  experience?: string;
  requirements?: string[];
  skills?: string[];
  benefits?: string[];
  industry?: string;
  remote?: string;
  pageType: string;
  confidence: number;
  domain: string;
}

type CoverLetterTone = "professional" | "casual" | "enthusiastic";
type CoverLetterLength = "short" | "medium" | "long";

export class ConvexApiService {
  private static instance: ConvexApiService;
  private authToken: string | null = null;

  private constructor() {
    this.initializeAuth();
  }

  private safeISOString(timestamp: number): string {
    try {
      if (!timestamp) return new Date().toISOString();
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return new Date().toISOString();
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  public static getInstance(): ConvexApiService {
    if (!ConvexApiService.instance) {
      ConvexApiService.instance = new ConvexApiService();
    }
    return ConvexApiService.instance;
  }

  private async initializeAuth(): Promise<void> {
    try {
      const token = await StorageService.getToken();
      const userData = await StorageService.getUserData();
      
      if (token && userData?.id) {
        this.authToken = token;
        client.setAuth(token);
        
        // Validate the stored token
        const isValid = await this.validateToken();
        if (!isValid) {
          if (CONFIG.ENVIRONMENT === 'development') {
            console.log('🔐 Stored token invalid, cleared authentication');
          }
          return;
        }
        
        // Log authentication status in development
        if (CONFIG.ENVIRONMENT === 'development') {
          console.log('🔐 Convex client initialized with user:', userData.email);
        }
      }
    } catch (error) {
      if (CONFIG.ENVIRONMENT === 'development') {
        console.log('🔐 No existing authentication found');
      }
    }
  }

  // Set authentication token for all API calls
  setAuth(token: string) {
    this.authToken = token;
    client.setAuth(token);
  }

  // Clear authentication
  clearAuth() {
    this.authToken = null;
    client.clearAuth();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  // Validate current token by making a test API call
  async validateToken(): Promise<boolean> {
    if (!this.authToken) return false;
    
    try {
      await client.query(api.userHelpers.getUserProfile);
      return true;
    } catch (error) {
      if (error instanceof Error && 
          (error.message?.includes("Unauthenticated") || 
           error.message?.includes("Could not verify token claim"))) {
        this.clearAuth();
        await StorageService.clearAll();
        return false;
      }
      // Other errors don't necessarily mean invalid token
      return true;
    }
  }

  // Sign in with Convex Auth
  async signIn(credentials: LoginCredentials) {
    try {
      // Clear any existing invalid auth first
      this.clearAuth();
      
      const result = await client.action(api.auth.signIn, {
        provider: "password",
        params: {
          email: credentials.email,
          password: credentials.password,
          flow: "signIn",
        },
      });
      
      // Handle the actual response structure from Convex Auth
      const token = result?.value?.tokens?.token || result?.tokens?.token;
      if (token) {
        this.setAuth(token);
        
        // Store credentials for persistence
        await StorageService.setToken(token);
        
        // Ensure user profile exists
        await this.ensureUserProfile();
        
        return { success: true, token };
      }
      
      return { success: false, error: "Sign in failed" };
    } catch (error: unknown) {
      console.error("Sign in error:", error);
      
      // Clear auth on sign in failure
      this.clearAuth();
      
      // Handle specific Convex Auth errors
      if (error instanceof Error && 
          (error.message?.includes("Unauthenticated") || 
           error.message?.includes("Could not verify token claim"))) {
        return { 
          success: false, 
          error: "Invalid credentials or session expired. Please try again."
        };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Sign in failed"
      };
    }
  }

  // Sign up with Convex Auth
  async signUp(credentials: RegisterCredentials) {
    try {
      const result = await client.action(api.auth.signIn, {
        provider: "password",
        params: {
          email: credentials.email,
          password: credentials.password,
          flow: "signUp",
        },
      });
      
      // Handle the actual response structure from Convex Auth
      const token = result?.value?.tokens?.token || result?.tokens?.token;
      if (token) {
        this.setAuth(token);
        
        // Create user profile
        await client.mutation(api.userHelpers.createUserProfile, {
          email: credentials.email,
          name: credentials.name,
        });
        
        return { success: true, token };
      }
      
      return { success: false, error: "Sign up failed" };
    } catch (error: unknown) {
      console.error("Sign up error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Sign up failed" 
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      if (this.authToken) {
        await client.action(api.auth.signOut);
      }
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      this.clearAuth();
    }
  }

  // Ensure user profile exists (for migration/setup)
  async ensureUserProfile() {
    try {
      if (!this.authToken) return;
      
      await client.mutation(api.userHelpers.ensureUserProfile);
    } catch (error) {
      console.error("Error ensuring user profile:", error);
    }
  }

  // Get user profile
  async getUserProfile() {
    try {
      if (!this.authToken) {
        throw new Error("Not authenticated");
      }
      
      return await client.query(api.userHelpers.getUserProfile);
    } catch (error: unknown) {
      console.error("Get user profile error:", error);
      
      // Handle authentication errors by clearing invalid tokens
      if (error instanceof Error && 
          (error.message?.includes("Unauthenticated") || 
           error.message?.includes("Could not verify token claim"))) {
        console.log("🔐 Token invalid, clearing authentication");
        this.clearAuth();
        await StorageService.clearAll();
        throw new Error("Authentication expired. Please sign in again.");
      }
      
      if (error instanceof Error && error.message?.includes("User profile not found")) {
        // Try to create profile
        await this.ensureUserProfile();
        return await client.query(api.userHelpers.getUserProfile);
      }
      
      throw error;
    }
  }

  // Check credits
  async checkCredits(requiredCredits: number) {
    try {
      if (!this.authToken) {
        throw new Error("Not authenticated");
      }
      
      return await client.query(api.credits.checkCredits, {
        requiredCredits,
      });
    } catch (error) {
      console.error("Check credits error:", error);
      throw error;
    }
  }

  // Extract job data from HTML content with AI processing
  async extractJobData(jobData: JobData & { html: string }) {
    try {
      if (!this.authToken) {
        throw new Error("Authentication required");
      }

      const result = await client.action(api.jobs.extractJobWithAI, {
        url: jobData.url,
        title: jobData.title || '',
        html: jobData.html,
        maxTokens: 15000
      });

      if (result) {
        return {
          success: true,
          job: result,
          remainingCredits: result.remainingCredits
        };
      }

      return { success: false, error: "Failed to extract job data" };
    } catch (error: unknown) {
      console.error("Job extraction error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to extract job data" 
      };
    }
  }

  // Get user's extracted jobs
  async getUserJobs(limit?: number) {
    try {
      if (!this.authToken) {
        throw new Error("Authentication required");
      }

      const jobs = await client.query(api.jobs.getExtractedJobs, {
        limit: limit || 50
      });

      return jobs || [];
    } catch (error: unknown) {
      console.error("Error fetching jobs:", error);
      return [];
    }
  }

  // Delete an extracted job
  async deleteJob(jobId: Id<"extractedJobs">) {
    try {
      if (!this.authToken) {
        throw new Error("Authentication required");
      }

      await client.mutation(api.jobs.deleteExtractedJob, {
        jobId: jobId
      });

      return { success: true };
    } catch (error: unknown) {
      console.error("Error deleting job:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to delete job" 
      };
    }
  }

  // Resume management
  public async getResumes(): Promise<Resume[]> {
    try {
      if (!this.authToken) {
        throw new Error("Authentication required");
      }

      const result = await client.query(api.resumes.getResumes, {
        limit: 50
      });
      
      return result.resumes.map((resume: Doc<"resumes">) => ({
        id: resume._id,
        userId: resume.userProfileId,
        filename: resume.filename,
        url: resume.fileId,
        createdAt: this.safeISOString(resume._creationTime),
        updatedAt: this.safeISOString(resume.updatedAt),
      }));
    } catch (error: unknown) {
      console.error('❌ Failed to get resumes:', error);
      throw new Error('Failed to get resumes');
    }
  }

  public async uploadResume(file: File): Promise<{ resume: Resume; remainingCredits: number }> {
    try {
      if (!this.authToken) {
        throw new Error("Authentication required");
      }
      
      if (CONFIG.ENVIRONMENT === 'development') {
        console.log('📄 Uploading resume:', file.name);
      }

      // Step 1: Get upload URL
      const uploadResult = await client.mutation(api.resumes.upload, {
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      // Step 2: Upload the file to Convex storage
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const uploadResponse = await fetch(uploadResult.uploadUrl, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage');
      }

      const uploadResponseData = await uploadResponse.json();
      const storageId = uploadResponseData.storageId;

      if (!storageId) {
        throw new Error('No storage ID returned from upload');
      }

      // Step 3: Complete the upload by creating the resume record
      const completeResult = await client.mutation(api.resumes.completeUpload, {
        storageId,
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      const userProfile = await this.getUserProfile();

      const resumeData: Resume = {
        id: completeResult.resumeId,
        userId: userProfile._id,
        filename: file.name,
        url: `resume_${completeResult.resumeId}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        resume: resumeData,
        remainingCredits: completeResult.remainingCredits,
      };
    } catch (error: unknown) {
      console.error('❌ Failed to upload resume:', error);
      throw new Error('Failed to upload resume');
    }
  }

  // Job extraction with AI processing (shows loading spinner)
  public async extractJobFromHTML(htmlContent: string, url: string, title: string): Promise<ExtractedContent & { remainingCredits: number }> {
    try {
      if (!this.authToken) {
        throw new Error("Authentication required");
      }
      
      if (CONFIG.ENVIRONMENT === 'development') {
        console.log('🔍 Extracting job from HTML with AI:', { url, title });
      }

      // Use the synchronous action that includes AI processing
      const result = await client.action(api.jobs.extractFromHTML, {
        html: htmlContent,
        url,
        title,
      });

      return result;
    } catch (error: unknown) {
      console.error('❌ Failed to extract job from HTML:', error);
      throw new Error('Failed to extract job information');
    }
  }

  // Cover letter generation with polling for AI updates
  public async generateCoverLetterFromContent(
    data: GenerateCoverLetterFromContentRequest,
    onProgress?: (content: string) => void
  ): Promise<GenerateCoverLetterResponse> {
    try {
      if (!this.authToken) {
        throw new Error("Authentication required");
      }
      
      if (CONFIG.ENVIRONMENT === 'development') {
        console.log('✍️ Generating cover letter for:', data.extractedContent.company);
      }

      // Start the generation process
      const result = await client.mutation(api.coverLetters.generate, {
        resumeId: data.resumeId as Id<"resumes">,
        extractedContent: data.extractedContent,
        preferences: {
          tone: (data.tone as CoverLetterTone) || 'professional',
          length: (data.length as CoverLetterLength) || 'medium',
        },
      });

      if (!result.coverLetter) {
        throw new Error('Cover letter generation failed');
      }
      
      const coverLetterId = result.coverLetter._id;
      
      // Show initial placeholder content
      if (onProgress) {
        onProgress(result.coverLetter.content);
      }

      // Poll for AI-generated content
      const finalCoverLetter = await this.pollForCoverLetterCompletion(coverLetterId, onProgress);

      return {
        coverLetter: {
          id: finalCoverLetter._id,
          userId: finalCoverLetter.userProfileId,
          extractedJobId: finalCoverLetter.extractedJobId || null,
          resumeId: finalCoverLetter.resumeId,
          jobTitle: finalCoverLetter.jobTitle || null,
          company: finalCoverLetter.company || null,
          content: finalCoverLetter.content,
          creditsUsed: finalCoverLetter.creditsUsed,
          preferences: finalCoverLetter.preferences ? JSON.stringify(finalCoverLetter.preferences) : null,
          createdAt: this.safeISOString(finalCoverLetter._creationTime),
        },
        tokensUsed: result.tokensUsed || 0,
        remainingCredits: result.remainingCredits || 0,
      };
    } catch (error: unknown) {
      console.error('❌ Failed to generate cover letter:', error);
      throw new Error('Failed to generate cover letter');
    }
  }

  // Poll for cover letter completion
  private async pollForCoverLetterCompletion(
    coverLetterId: string,
    onProgress?: (content: string) => void,
    maxAttempts: number = 20
  ): Promise<Doc<"coverLetters">> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const coverLetter = await client.query(api.coverLetters.getCoverLetter, {
          coverLetterId: coverLetterId as Id<"coverLetters">
        });

        if (!coverLetter) {
          throw new Error('Cover letter not found');
        }

        // Check if AI generation is complete (content is no longer placeholder)
        const isPlaceholder = coverLetter.content.includes('Generating your personalized cover letter');
        
        if (!isPlaceholder) {
          if (CONFIG.ENVIRONMENT === 'development') {
            console.log('✅ Cover letter generation completed after', attempt + 1, 'attempts');
          }
          return coverLetter;
        }

        // Update progress
        if (onProgress) {
          onProgress(coverLetter.content);
        }

        // Wait before next poll (exponential backoff)
        const delay = Math.min(1000 + (attempt * 500), 3000);
        await new Promise(resolve => setTimeout(resolve, delay));

      } catch (error) {
        console.error(`❌ Polling attempt ${attempt + 1} failed:`, error);
        if (attempt === maxAttempts - 1) {
          throw error;
        }
      }
    }

    throw new Error('Cover letter generation timed out. Please try again.');
  }

  public async getCoverLetters(): Promise<CoverLetter[]> {
    try {
      if (!this.authToken) {
        throw new Error("Authentication required");
      }

      const result = await client.query(api.coverLetters.getCoverLetters, {
        limit: 50
      });
      
      return result.coverLetters.map((cl: Doc<"coverLetters">) => ({
        id: cl._id,
        userId: cl.userProfileId,
        extractedJobId: cl.extractedJobId || null,
        resumeId: cl.resumeId,
        jobTitle: cl.jobTitle || null,
        company: cl.company || null,
        content: cl.content,
        creditsUsed: cl.creditsUsed,
        preferences: cl.preferences ? JSON.stringify(cl.preferences) : null,
        createdAt: this.safeISOString(cl._creationTime),
      }));
    } catch (error: unknown) {
      console.error('❌ Failed to get cover letters:', error);
      throw new Error('Failed to get cover letters');
    }
  }

  // Billing
  public async createBillingSession(priceId: string): Promise<{ url: string }> {
    try {
      if (!this.authToken) {
        throw new Error("Authentication required");
      }

      const result = await client.mutation(api.billing.createSubscriptionCheckout, {
        priceId,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/cancel`,
      });
      
      return { url: result.checkoutUrl };
    } catch (error: unknown) {
      console.error('❌ Failed to create billing session:', error);
      throw new Error('Failed to create billing session');
    }
  }

  // Dashboard data
  public async getDashboardData() {
    try {
      if (!this.authToken) {
        throw new Error("Authentication required");
      }

      return await client.query(api.users.getDashboard);
    } catch (error: unknown) {
      console.error('❌ Failed to get dashboard data:', error);
      throw new Error('Failed to get dashboard data');
    }
  }

  public async getCreditStats() {
    try {
      if (!this.authToken) {
        throw new Error("Authentication required");
      }

      return await client.query(api.credits.getCreditStats);
    } catch (error: unknown) {
      console.error('❌ Failed to get credit stats:', error);
      throw new Error('Failed to get credit stats');
    }
  }
}

export const convexApi = ConvexApiService.getInstance(); 