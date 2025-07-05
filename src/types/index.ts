import type { ChromeMessage } from './chrome';

export interface User {
    id: string;
    email: string;
    name: string;
    credits: number;
    plan: 'none' | 'starter' | 'pro' | 'hired';
    createdAt?: string;
    updatedAt?: string;
}

export interface JobData {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    requirements: string[];
    salary?: string;
    type?: string;
    postedDate?: string;
    url: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Resume {
    id: string;
    userId: string;
    filename: string;
    url: string;
    createdAt: string;
    updatedAt: string;
}

export interface CoverLetter {
    id: string;
    userId: string;
    extractedJobId: string | null;
    resumeId: string;
    jobTitle: string | null;
    company: string | null;
    content: string;
    creditsUsed: number;
    preferences: string | null;
    createdAt: string;
}

export interface JobApplication {
    _id: string;
    _creationTime: number;
    userProfileId: string;
    jobTitle: string;
    companyName: string;
    location?: string;
    salary?: string;
    status?: "applied" | "interviewing" | "offered" | "rejected" | "withdrawn";
    appliedDate?: number;
    notes?: string;
    jobUrl?: string;
    jobType?: "full-time" | "part-time" | "contract" | "internship" | "freelance";
    resumeId?: string;
    coverLetterId?: string;
}

export interface ExtractedJob {
    _creationTime: number;
    _id: string;
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
    userProfileId: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}

export interface CoverLettersResponse {
    coverLetters: CoverLetter[];
    pagination: Pagination;
}

export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface GenerateCoverLetterRequest {
    jobId: string;
    resumeId: string;
    tone?: string;
    length?: string;
    additionalNotes?: string;
}

export interface GenerateCoverLetterResponse {
    coverLetter: {
        id: string;
        userId: string;
        extractedJobId: string | null;
        resumeId: string;
        jobTitle: string | null;
        company: string | null;
        content: string;
        creditsUsed: number;
        preferences: string | null;
        createdAt: string;
    };
    tokensUsed: number;
    remainingCredits: number;
}

export interface GenerateCoverLetterFromContentRequest {
    extractedContent: ExtractedContent;
    resumeId: string;
    tone?: string;
    length?: string;
    additionalNotes?: string;
}

// NEW: Content extraction interfaces
export interface ExtractedContent {
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
}

export interface PageMetadata {
    domain: string;
    path: string;
    pageType: string;
    wordCount: number;
    hasImages: boolean;
    hasVideo: boolean;
    structuredData: any[];
    metaTags: Record<string, string>;
    openGraph: Record<string, string>;
    headings: Array<{ level: number, text: string }>;
    mainContent: Array<{ selector: string, text: string }>;
    timestamp: string;
}

// Chrome Extension Types
export interface JobSiteConfig {
    name: string;
    hostname: string;
    patterns: string[];
    selectors: {
        title: string;
        company: string;
        location: string;
        description?: string;
        salary?: string;
    };
}

// React Component Props
export interface TabNavigationProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    user: User | null;
}

export interface GenerateTabProps {
    user: User | null;
    onUserUpdate: (user: User) => void;
}

export interface HistoryTabProps {
    user: User | null;
    refreshTrigger?: string;
}

export interface SettingsTabProps {
    user: User | null;
    onUserUpdate: (user: User) => void;
}

// Storage Types
export interface StorageData {
    authToken?: string;
    userData?: User;
    settings?: UserSettings;
    lastExtractedJob?: ExtractedContent;
    extractionTimestamp?: number;
}

export interface UserSettings {
    autoDetect: boolean;
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
}

// Error Types
export interface APIError {
    message: string;
    status?: number;
    code?: string;
}