// Authentication helper functions
// Note: This is a simplified implementation. In production, use proper JWT libraries and secure practices.

import type { Id } from "../convex/_generated/dataModel";

export interface JWTPayload {
  userId: Id<"users">;
  email: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  iat: number;
  exp: number;
}

export interface SessionData {
  userId: Id<"users">;
  email: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  expiresAt: number;
}

// Simple JWT-like token creation (for development only)
// In production, use a proper JWT library with proper signing
export function createToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + (7 * 24 * 60 * 60), // 7 days
  };

  // Simple base64 encoding (NOT secure for production)
  const encoded = btoa(JSON.stringify(fullPayload));
  return `mock_jwt_${encoded}`;
}

// Simple token verification (for development only)
export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!token.startsWith('mock_jwt_')) {
      return null;
    }

    const encoded = token.replace('mock_jwt_', '');
    const decoded = atob(encoded);
    const payload = JSON.parse(decoded) as JWTPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Extract user ID from authorization header
export function extractUserIdFromAuth(authHeader: string | null): Id<"users"> | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);
  
  return payload?.userId || null;
}

// Create session data from user info
export function createSession(user: {
  _id: Id<"users">;
  email: string;
  plan: "free" | "starter" | "pro" | "enterprise";
}): SessionData {
  return {
    userId: user._id,
    email: user.email,
    plan: user.plan,
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days in milliseconds
  };
}

// Validate session data
export function isValidSession(session: SessionData): boolean {
  return session.expiresAt > Date.now();
}

// Hash password using Web Crypto API (for Cloudflare Workers compatibility)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}

// Generate secure random string for API keys, etc.
export function generateSecureId(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use crypto.getRandomValues for secure randomness
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomArray[i] % chars.length];
  }
  
  return result;
}

// Rate limiting helpers
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export interface RateLimitState {
  count: number;
  resetTime: number;
}

export function checkRateLimit(
  state: RateLimitState | null,
  config: RateLimitConfig
): { allowed: boolean; newState: RateLimitState } {
  const now = Date.now();
  
  // If no previous state or window has expired, start fresh
  if (!state || now >= state.resetTime) {
    return {
      allowed: true,
      newState: {
        count: 1,
        resetTime: now + config.windowMs,
      },
    };
  }
  
  // Check if within limits
  if (state.count < config.maxRequests) {
    return {
      allowed: true,
      newState: {
        count: state.count + 1,
        resetTime: state.resetTime,
      },
    };
  }
  
  // Rate limit exceeded
  return {
    allowed: false,
    newState: state,
  };
}

// Common rate limit configurations
export const RATE_LIMITS = {
  AUTH: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  API: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
  UPLOAD: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 uploads per minute
  AI: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 AI requests per minute
} as const;
