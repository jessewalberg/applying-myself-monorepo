"use client";

import React, { useEffect, lazy, Suspense, useState } from "react";
import { FileText, History, Settings, LogOut, Coins, Loader2, Shield } from "lucide-react";
import { useSession } from "@/features/auth/useSession";
import InlineAuthPanel from "@/features/auth/InlineAuthPanel";
import { trackExtensionEvent } from "@/core/analytics/track";
import ApplyingMyselfLogo from "./components/ApplyingMyselfLogo";
import EnvironmentBanner from "../components/EnvironmentBanner";

const GenerateTab = lazy(() => import("./components/GenerateTab"));
const HistoryTab = lazy(() => import("./components/HistoryTab"));
const SettingsTab = lazy(() => import("./components/SettingsTab"));

type TabType = "generate" | "history" | "settings";

const TABS = [
  { id: "generate" as const, label: "Generate", icon: FileText },
  { id: "history" as const, label: "History", icon: History },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("generate");
  const {
    user,
    setUser,
    isAuthenticated,
    loading,
    debugStage,
    initialize,
    logout,
    isClerkLoaded,
    isClerkSignedIn,
  } = useSession();

  const handleTabChange = (tab: TabType): void => {
    void trackExtensionEvent("extension_tab_changed", {
      from_tab: activeTab,
      to_tab: tab,
      user_plan: user?.plan || "none",
      user_credits: (user?.credits || 0).toString(),
    });
    setActiveTab(tab);
  };

  useEffect(() => {
    void trackExtensionEvent("extension_popup_opened");
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isClerkLoaded || !isClerkSignedIn || isAuthenticated || loading) return;
    void initialize();
  }, [initialize, isAuthenticated, isClerkLoaded, isClerkSignedIn, loading]);

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
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background text-foreground">
        <Loader2 className="w-6 h-6 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen debugStage={debugStage} />;
  }

  return (
    <div className="flex flex-col h-[520px] w-[380px] bg-background text-foreground overflow-hidden">
      <EnvironmentBanner />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <ApplyingMyselfLogo className="" size={20} />
          <span className="font-display italic text-sm text-foreground">
            applying myself
          </span>
          <span className="text-primary text-lg leading-none">.</span>
        </div>
        <div className="flex items-center gap-2">
          {user?.isAdmin && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Shield className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-semibold text-amber-400">Admin</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Coins className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold text-primary">
              {user?.credits ?? 0}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border bg-card shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                isActive
                  ? "text-primary border-primary bg-primary/5"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-4">
        <Suspense fallback={<TabLoadingFallback />}>
          {activeTab === "generate" && (
            <GenerateTab user={user} onUserUpdate={setUser} />
          )}
          {activeTab === "history" && (
            <HistoryTab user={user} refreshTrigger={activeTab} />
          )}
          {activeTab === "settings" && (
            <SettingsTab user={user} onUserUpdate={setUser} />
          )}
        </Suspense>
      </div>
    </div>
  );
};

const TabLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="w-5 h-5 text-primary animate-spin mb-2" />
    <p className="text-xs text-muted-foreground">Loading...</p>
  </div>
);

const AuthScreen: React.FC<{ debugStage: string }> = ({ debugStage }) => {
  return <InlineAuthPanel variant="popup" debugStage={debugStage} />;
};

export default App;
