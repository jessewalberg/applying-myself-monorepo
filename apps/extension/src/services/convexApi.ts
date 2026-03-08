import * as authClient from "@/core/convex/authClient";
import * as resumeClient from "@/core/convex/resumeClient";
import * as jobsClient from "@/core/convex/jobsClient";
import * as coverLetterClient from "@/core/convex/coverLetterClient";
import * as billingClient from "@/core/convex/billingClient";
import { clearConvexAuthToken, isConvexAuthenticated, setConvexAuthToken } from "@/core/convex/client";

export class ConvexApiService {
  private static instance: ConvexApiService;

  static getInstance(): ConvexApiService {
    if (!ConvexApiService.instance) {
      ConvexApiService.instance = new ConvexApiService();
    }

    return ConvexApiService.instance;
  }

  setAuth(token: string): void {
    setConvexAuthToken(token);
  }

  clearAuth(): void {
    clearConvexAuthToken();
  }

  isAuthenticated(): boolean {
    return isConvexAuthenticated();
  }

  initializeFromStorage = authClient.initializeFromStorage;
  authenticateWithClerkToken = authClient.authenticateWithClerkToken;
  syncWithWebApp = authClient.syncWithWebApp;
  validateToken = authClient.validateToken;
  signIn = authClient.signIn;
  signUp = authClient.signUp;
  signOut = authClient.signOut;
  ensureUserProfile = authClient.ensureUserProfile;
  getUserProfile = authClient.getUserProfile;

  getResumes = resumeClient.getResumes;
  getResumeDownloadUrl = resumeClient.getResumeDownloadUrl;
  uploadResume = resumeClient.uploadResume;

  extractJobFromHTML = jobsClient.extractJobFromHTML;
  createJobApplicationFromExtracted = jobsClient.createJobApplicationFromExtracted;
  getJobApplications = jobsClient.getJobApplications;
  getExtractedJobs = jobsClient.getExtractedJobs;

  generateCoverLetterFromContent = coverLetterClient.generateCoverLetterFromContent;
  retryCoverLetterGeneration = coverLetterClient.retryCoverLetterGeneration;
  getCoverLetters = coverLetterClient.getCoverLetters;

  createBillingSession = billingClient.createBillingSession;
  getDashboardData = billingClient.getDashboardData;
  getCreditStats = billingClient.getCreditStats;
}

export const convexApi = ConvexApiService.getInstance();
