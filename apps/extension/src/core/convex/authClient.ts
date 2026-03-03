import { api } from "@app/convex-client";
import { StorageService } from "@/services/storage";
import CONFIG from "@/config";
import {
  clearConvexAuthToken,
  convexClient,
  getConvexAuthToken,
  isAuthFailureError,
  isConvexAuthenticated,
  setConvexAuthToken,
} from "./client";

type ClerkGetToken = (options?: { template?: string }) => Promise<string | null>;

export const validateToken = async (): Promise<boolean> => {
  if (!isConvexAuthenticated()) return false;

  try {
    await convexClient.query(api.userHelpers.getUserProfile);
    return true;
  } catch (error) {
    if (isAuthFailureError(error)) {
      clearConvexAuthToken();
      await StorageService.clearAll();
      return false;
    }

    return true;
  }
};

export const initializeFromStorage = async (): Promise<boolean> => {
  try {
    const token = await StorageService.getToken();
    if (!token) {
      return false;
    }

    setConvexAuthToken(token);
    const isValid = await validateToken();
    if (!isValid) {
      clearConvexAuthToken();
      await StorageService.clearAll();
      return false;
    }

    return true;
  } catch (error) {
    if (CONFIG.ENVIRONMENT === "development") {
      console.log("🔐 Failed to initialize from storage:", error);
    }
    return false;
  }
};

export const authenticateWithClerkToken = async (getToken: ClerkGetToken): Promise<boolean> => {
  const token = await getToken({ template: CONFIG.CLERK.JWT_TEMPLATE });
  if (!token) {
    clearConvexAuthToken();
    await StorageService.clearAll();
    return false;
  }

  if (getConvexAuthToken() !== token) {
    setConvexAuthToken(token);
    await StorageService.setToken(token);
  }

  const isValid = await validateToken();
  if (!isValid) {
    return false;
  }

  await ensureUserProfile();
  return true;
};

export const ensureUserProfile = async (): Promise<void> => {
  try {
    if (!isConvexAuthenticated()) return;
    await convexClient.mutation(api.userHelpers.ensureUserProfile, {});
    await convexClient.mutation(api.userHelpers.claimArchivedEntitlements, {});
  } catch (error) {
    console.error("Error ensuring user profile:", error);
  }
};

export const getUserProfile = async () => {
  if (!isConvexAuthenticated()) {
    throw new Error("Not authenticated");
  }

  try {
    return await convexClient.query(api.userHelpers.getUserProfile);
  } catch (error) {
    if (isAuthFailureError(error)) {
      clearConvexAuthToken();
      await StorageService.clearAll();
      throw new Error("Authentication expired. Please sign in again.");
    }

    if (error instanceof Error && error.message?.includes("User profile not found")) {
      await ensureUserProfile();
      return convexClient.query(api.userHelpers.getUserProfile);
    }

    throw error;
  }
};

export const signIn = async () => {
  return {
    success: false,
    error: "Direct extension credentials are removed. Use Clerk sign-in.",
  };
};

export const signUp = async () => {
  return {
    success: false,
    error: "Direct extension signup is removed. Use Clerk sign-up.",
  };
};

export const signOut = async (): Promise<void> => {
  clearConvexAuthToken();
  await StorageService.clearAll();
};

export const syncWithWebApp = async (): Promise<{ success: boolean; user?: unknown; error?: string }> => {
  return {
    success: true,
  };
};
