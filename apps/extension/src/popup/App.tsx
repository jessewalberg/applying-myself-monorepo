"use client";

import React, { useEffect, lazy, Suspense, useState } from "react";
import { FileText, History, Settings, LogOut, Coins, Loader2 } from "lucide-react";
import { SignIn } from "@clerk/chrome-extension";
import CONFIG from "@/config";
import { useSession } from "@/features/auth/useSession";
import { trackExtensionEvent } from "@/core/analytics/track";
import ApplyingMyselfLogo from "./components/ApplyingMyselfLogo";
import EnvironmentBanner from "../components/EnvironmentBanner";
import type { User as UserType } from "@/types";

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
  const { user, setUser, isAuthenticated, loading, initialize, logout } =
    useSession();

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
    return <AuthScreen />;
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

const AuthScreen: React.FC = () => {
  if (!CONFIG.CLERK.PUBLISHABLE_KEY) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background px-6 text-center">
        <ApplyingMyselfLogo size={40} />
        <h1 className="font-display italic text-lg text-foreground mt-4">
          applying myself<span className="text-primary">.</span>
        </h1>
        <p className="text-sm text-destructive mt-3">
          Missing Clerk publishable key.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background px-6">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-48 h-48 bg-primary/8 rounded-full blur-3xl" />

      <div className="relative z-10 text-center mb-6">
        <ApplyingMyselfLogo size={40} className="mx-auto" />
        <h1 className="font-display italic text-xl text-foreground mt-3">
          applying myself<span className="text-primary">.</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to generate cover letters
        </p>
      </div>

      <div className="relative z-10 w-full max-w-[300px] rounded-xl border border-border bg-card p-4">
        <SignIn
          fallbackRedirectUrl="/"
          appearance={{
            elements: {
              card: "shadow-none border-0 w-full bg-transparent",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton:
                "bg-secondary border-border text-foreground hover:bg-secondary/80",
              formFieldInput:
                "bg-background border-border text-foreground",
              footerActionLink: "text-primary hover:text-primary/80",
            },
          }}
        />
      </div>
    </div>
  );
};

export default App;
