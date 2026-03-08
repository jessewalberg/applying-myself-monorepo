import { useCallback, useMemo, useState } from "react";
import { useAuth, useClerk } from "@clerk/chrome-extension";
import { convexApi } from "@/services/convexApi";
import { StorageService } from "@/services/storage";
import CONFIG from "@/config";
import type { User } from "@/types";

const mapUserProfile = (userProfile: {
  _id: string;
  email: string;
  name: string;
  credits?: number;
  plan: User["plan"];
  isAdmin?: boolean;
}): User => ({
  id: userProfile._id,
  email: userProfile.email,
  name: userProfile.name,
  credits: userProfile.credits || 0,
  plan: userProfile.plan,
  isAdmin: !!userProfile.isAdmin,
});

export const useSession = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut: clerkSignOut } = useClerk();

  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [debugStage, setDebugStage] = useState("idle");

  const logDev = (...args: unknown[]) => {
    if (CONFIG.ENVIRONMENT === "development") {
      console.log("[extension-session]", ...args);
    }
  };

  const initialize = useCallback(async () => {
    setLoading(true);

    try {
      setDebugStage(`initialize:start loaded=${String(isLoaded)} signedIn=${String(isSignedIn)}`);
      logDev("initialize:start", { isLoaded, isSignedIn });

      if (!isLoaded) {
        setDebugStage("initialize:clerk-not-loaded");
        logDev("initialize:clerk-not-loaded");
        setIsAuthenticated(false);
        return;
      }

      if (!isSignedIn) {
        setDebugStage("initialize:not-signed-in");
        logDev("initialize:not-signed-in");
        await convexApi.signOut();
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const hasAuth = await convexApi.authenticateWithClerkToken(getToken);
      if (!hasAuth) {
        setDebugStage("initialize:no-convex-auth");
        logDev("initialize:no-convex-auth");
        setIsAuthenticated(false);
        return;
      }

      const profile = await convexApi.getUserProfile();
      if (!profile) {
        setDebugStage("initialize:missing-profile");
        logDev("initialize:missing-profile");
        await StorageService.clearAll();
        setIsAuthenticated(false);
        return;
      }

      const mappedUser = mapUserProfile(profile);
      await StorageService.setUserData(mappedUser);
      setUser(mappedUser);
      setIsAuthenticated(true);
      setDebugStage(`initialize:success user=${mappedUser.email}`);
      logDev("initialize:success", { userId: mappedUser.id, email: mappedUser.email });
    } catch (error) {
      console.error("Failed to initialize session:", error);
      setDebugStage(
        `initialize:error ${error instanceof Error ? error.message : String(error)}`
      );
      logDev("initialize:error", error);
      await StorageService.clearAll();
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      logDev("initialize:end");
    }
  }, [getToken, isLoaded, isSignedIn]);

  const logout = useCallback(async () => {
    await clerkSignOut();
    await convexApi.signOut();
    await StorageService.clearAll();
    setUser(null);
    setIsAuthenticated(false);
  }, [clerkSignOut]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated,
      loading,
      debugStage,
      initialize,
      logout,
      isClerkLoaded: isLoaded,
      isClerkSignedIn: isSignedIn,
    }),
    [debugStage, initialize, isAuthenticated, isLoaded, isSignedIn, loading, logout, user]
  );

  return value;
};
