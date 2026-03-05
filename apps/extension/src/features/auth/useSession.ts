import { useCallback, useMemo, useState } from "react";
import { useAuth, useClerk } from "@clerk/chrome-extension";
import { convexApi } from "@/services/convexApi";
import { StorageService } from "@/services/storage";
import type { User } from "@/types";

const mapUserProfile = (userProfile: {
  _id: string;
  email: string;
  name: string;
  credits?: number;
  plan: User["plan"];
}): User => ({
  id: userProfile._id,
  email: userProfile.email,
  name: userProfile.name,
  credits: userProfile.credits || 0,
  plan: userProfile.plan,
});

export const useSession = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut: clerkSignOut } = useClerk();

  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const initialize = useCallback(async () => {
    setLoading(true);

    try {
      if (!isLoaded) {
        setIsAuthenticated(false);
        return;
      }

      if (!isSignedIn) {
        await convexApi.signOut();
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const hasAuth = await convexApi.authenticateWithClerkToken(getToken);
      if (!hasAuth) {
        setIsAuthenticated(false);
        return;
      }

      const profile = await convexApi.getUserProfile();
      if (!profile) {
        await StorageService.clearAll();
        setIsAuthenticated(false);
        return;
      }

      const mappedUser = mapUserProfile(profile);
      await StorageService.setUserData(mappedUser);
      setUser(mappedUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to initialize session:", error);
      await StorageService.clearAll();
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
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
      initialize,
      logout,
      isClerkLoaded: isLoaded,
      isClerkSignedIn: isSignedIn,
    }),
    [initialize, isAuthenticated, isLoaded, isSignedIn, loading, logout, user]
  );

  return value;
};
