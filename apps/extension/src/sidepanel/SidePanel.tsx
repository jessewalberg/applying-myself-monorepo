"use client";

import React, { useEffect, useState, lazy, Suspense } from "react";
import {
  History,
  Settings,
  LogOut,
  Coins,
  Loader2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import CONFIG from "@/config";
import { useSession } from "@/features/auth/useSession";
import InlineAuthPanel from "@/features/auth/InlineAuthPanel";
import { trackExtensionEvent } from "@/core/analytics/track";
import ApplyingMyselfLogo from "../popup/components/ApplyingMyselfLogo";
import EnvironmentBanner from "../components/EnvironmentBanner";

const GenerateTab = lazy(() => import("../popup/components/GenerateTab"));
const HistoryTab = lazy(() => import("../popup/components/HistoryTab"));
const SettingsTab = lazy(() => import("../popup/components/SettingsTab"));

type TabType = "generate" | "history" | "settings";

const TABS = [
  { id: "generate" as const, label: "Generate", icon: Sparkles },
  { id: "history" as const, label: "History", icon: History },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

const SidePanel: React.FC = () => {
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

  useEffect(() => {
    void trackExtensionEvent("extension_sidepanel_opened");
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isClerkLoaded || !isClerkSignedIn || isAuthenticated || loading) return;
    void initialize();
  }, [initialize, isAuthenticated, isClerkLoaded, isClerkSignedIn, loading]);

  const handleLogout = async () => {
    void trackExtensionEvent("extension_logout");
    await logout();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
        <Loader2 className="w-6 h-6 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen debugStage={debugStage} />;
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <EnvironmentBanner />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <ApplyingMyselfLogo size={22} />
          <span className="font-display italic text-base text-foreground">
            applying myself
          </span>
          <span className="text-primary text-xl leading-none">.</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Coins className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">
              {user?.credits ?? 0}
            </span>
          </div>
          <button
            onClick={() =>
              window.open(`${CONFIG.SITE_URL}/dashboard`, "_blank")
            }
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Open Dashboard"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
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
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? "text-primary border-primary bg-primary/5"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content — more spacious than popup */}
      <div className="flex-1 overflow-y-auto p-5">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-5 h-5 text-primary animate-spin mb-2" />
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          }
        >
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

const AuthScreen: React.FC<{ debugStage: string }> = ({ debugStage }) => {
  return <InlineAuthPanel variant="sidepanel" debugStage={debugStage} />;
};

export default SidePanel;
