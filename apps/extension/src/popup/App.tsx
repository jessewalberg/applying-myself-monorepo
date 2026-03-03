import React, { useEffect, lazy, Suspense } from "react";
import { User, LogOut } from "lucide-react";
import { SignIn } from "@clerk/chrome-extension";
import CONFIG from "@/config";
import { useSession } from "@/features/auth/useSession";
import { trackExtensionEvent } from "@/core/analytics/track";
import TabNavigation from "./components/TabNavigation";
import ApplyingMyselfLogo from "./components/ApplyingMyselfLogo";
import EnvironmentBanner from "../components/EnvironmentBanner";
import type { User as UserType } from "@/types";

const GenerateTab = lazy(() => import("./components/GenerateTab"));
const HistoryTab = lazy(() => import("./components/HistoryTab"));
const SettingsTab = lazy(() => import("./components/SettingsTab"));

type TabType = "generate" | "history" | "settings";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<TabType>("generate");
  const { user, setUser, isAuthenticated, loading, initialize, logout } = useSession();

  const handleTabChange = (tab: string): void => {
    const newTab = tab as TabType;

    void trackExtensionEvent("extension_tab_changed", {
      from_tab: activeTab,
      to_tab: newTab,
      user_plan: user?.plan || "none",
      user_credits: (user?.credits || 0).toString(),
    });

    setActiveTab(newTab);
  };

  useEffect(() => {
    void trackExtensionEvent("extension_popup_opened");
    void initialize();
  }, [initialize]);

  const handleLogout = async (): Promise<void> => {
    void trackExtensionEvent("extension_logout", {
      user_plan: user?.plan || "none",
      user_credits: (user?.credits || 0).toString(),
    });

    await logout();
  };

  useEffect(() => {
    document.body.setAttribute("data-extension-popup", "true");
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="extension-container">
      <EnvironmentBanner />
      <Header user={user} onLogout={handleLogout} />

      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="tab-content">
        <Suspense fallback={<TabLoadingFallback />}>
          {activeTab === "generate" && <GenerateTab user={user} onUserUpdate={setUser} />}
          {activeTab === "history" && <HistoryTab user={user} refreshTrigger={activeTab} />}
          {activeTab === "settings" && <SettingsTab user={user} onUserUpdate={setUser} />}
        </Suspense>
      </div>
    </div>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>Loading Applying Myself...</p>
  </div>
);

const TabLoadingFallback: React.FC = () => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>Loading tab...</p>
  </div>
);

const AuthScreen: React.FC = () => {
  if (!CONFIG.CLERK.PUBLISHABLE_KEY) {
    return (
      <div className="auth-container">
        <div className="auth-header">
          <div className="brand">
            <ApplyingMyselfLogo className="brand-icon" size={32} />
            <h1>Applying Myself</h1>
          </div>
          <p>Missing Clerk publishable key in extension environment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="brand">
          <ApplyingMyselfLogo className="brand-icon" size={32} />
          <h1>Applying Myself</h1>
        </div>
        <p>Sign in with Clerk to continue.</p>
      </div>
      <div className="auth-form">
        <SignIn
          fallbackRedirectUrl="/"
          appearance={{
            elements: {
              card: "shadow-none border-0 w-full",
            },
          }}
        />
      </div>
    </div>
  );
};

interface HeaderProps {
  user: UserType | null;
  onLogout: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => (
  <div className="header">
    <div className="brand">
      <ApplyingMyselfLogo className="brand-icon" size={20} />
      <span className="brand-text">Applying Myself</span>
    </div>
    <div className="user-info">
      <User size={16} />
      <span>{user?.name || user?.email || "User"}</span>
      <button className="user-menu" onClick={onLogout}>
        <LogOut size={14} />
      </button>
    </div>
  </div>
);

export default App;
