import React, { useState, useEffect } from "react";
import {
  User,
  CreditCard,
  Shield,
  ExternalLink,
  LogOut,
  AlertCircle,
  Briefcase,
  Loader2,
  Coins,
} from "lucide-react";
import { ConvexApiService } from "@/services/convexApi";
import CONFIG from "@/config";
import type { SettingsTabProps, User as ExtensionUser } from "@/types";

const convexApi = ConvexApiService.getInstance();

type SettingsUser = ExtensionUser & {
  subscriptionStatus?: string;
};

const SettingsTab: React.FC<SettingsTabProps> = ({ user, onUserUpdate }) => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userProfile, setUserProfile] = useState<SettingsUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await convexApi.getUserProfile();
        setUserProfile(profile as SettingsUser);
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUserProfile();
  }, []);

  const userData: SettingsUser | null = userProfile ?? (user ? { ...user } : null);

  if (loading || !userData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-primary animate-spin mb-2" />
        <p className="text-xs text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  const handleManageBilling = () =>
    window.open(`${CONFIG.SITE_URL}/dashboard/billing`, "_blank");
  const handleManageSettings = () =>
    window.open(`${CONFIG.SITE_URL}/dashboard/settings`, "_blank");
  const handleOpenJobs = () =>
    window.open(`${CONFIG.SITE_URL}/dashboard/jobs`, "_blank");

  const handleSignOut = async () => {
    if (isSigningOut) return;
    try {
      setIsSigningOut(true);
      await convexApi.signOut();
      if (onUserUpdate) onUserUpdate(null);
    } catch (error) {
      console.error("Failed to sign out:", error);
      setIsSigningOut(false);
    }
  };

  const formatPlan = (plan: string) =>
    plan === "none" ? "Free" : plan.charAt(0).toUpperCase() + plan.slice(1);

  const getSubStatus = () => {
    if (userData.subscriptionStatus) {
      const map: Record<string, { text: string; cls: string }> = {
        active: { text: "Active", cls: "text-green-400" },
        canceled: { text: "Canceled", cls: "text-red-400" },
        past_due: { text: "Past Due", cls: "text-red-400" },
        incomplete: { text: "Incomplete", cls: "text-yellow-400" },
        trialing: { text: "Trial", cls: "text-blue-400" },
      };
      return map[userData.subscriptionStatus] || { text: "Unknown", cls: "text-muted-foreground" };
    }
    if (userData.plan && userData.plan !== "none")
      return { text: "Active", cls: "text-green-400" };
    return { text: "No Subscription", cls: "text-muted-foreground" };
  };

  const subStatus = getSubStatus();

  return (
    <div className="flex flex-col gap-4">
      {/* Account */}
      <Section title="Account" icon={User}>
        <div className="space-y-2">
          <Row label="Email" value={userData.email} />
          <Row label="Name" value={userData.name} />
          <Row
            label="Plan"
            value={
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                {formatPlan(userData.plan)}
              </span>
            }
          />
          {userData.subscriptionStatus && (
            <Row
              label="Status"
              value={
                <span className={`text-xs font-medium ${subStatus.cls}`}>
                  {subStatus.text}
                </span>
              }
            />
          )}
        </div>
      </Section>

      {/* Credits */}
      <Section title="Billing & Credits" icon={CreditCard}>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Coins className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">
              {userData.credits || 0}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Credits Remaining
            </p>
          </div>
        </div>

        {userData.plan === "none" && (
          <div className="rounded-md border border-primary/20 bg-primary/5 p-3 mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertCircle className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs text-foreground font-medium">
                Upgrade for monthly credits
              </p>
            </div>
            <div className="space-y-1 text-[11px] text-muted-foreground">
              <p><span className="font-semibold text-foreground">Starter:</span> $9/mo - 50 credits</p>
              <p><span className="font-semibold text-foreground">Pro:</span> $19/mo - 150 credits</p>
              <p><span className="font-semibold text-foreground">Hired:</span> $49/mo - 500 credits</p>
            </div>
          </div>
        )}

        <ActionButton onClick={handleManageBilling} label="Manage Billing" />
      </Section>

      {/* Jobs */}
      <Section title="Job Applications" icon={Briefcase}>
        <p className="text-xs text-muted-foreground mb-3">
          Track and manage your job applications with detailed analytics.
        </p>
        <ActionButton onClick={handleOpenJobs} label="Manage Applications" />
      </Section>

      {/* Settings */}
      <Section title="Settings" icon={Shield}>
        <p className="text-xs text-muted-foreground mb-3">
          Manage profile, notifications, and security on the web dashboard.
        </p>
        <ActionButton onClick={handleManageSettings} label="Open Settings" />
      </Section>

      {/* Privacy */}
      <Section title="Privacy & Security" icon={Shield}>
        <p className="text-xs text-muted-foreground mb-3">
          Your data is encrypted and secure.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() =>
              window.open(`${CONFIG.SITE_URL}/privacy`, "_blank")
            }
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Privacy Policy
          </button>
          <button
            onClick={() =>
              window.open(`${CONFIG.SITE_URL}/terms`, "_blank")
            }
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Terms of Service
          </button>
        </div>
      </Section>

      {/* Sign out + version */}
      <div className="pt-2 border-t border-border space-y-3">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold hover:bg-destructive/20 disabled:opacity-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          {isSigningOut ? "Signing Out..." : "Sign Out"}
        </button>
        <p className="text-center text-[10px] text-muted-foreground">
          Version 1.0.0
        </p>
      </div>
    </div>
  );
};

/* ---------- Sub-components ---------- */

const Section: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <div className="rounded-lg border border-border bg-card p-3">
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
      <Icon className="w-4 h-4 text-primary" />
      <h4 className="text-xs font-semibold text-foreground">{title}</h4>
    </div>
    {children}
  </div>
);

const Row: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-xs text-foreground font-medium">{value}</span>
  </div>
);

const ActionButton: React.FC<{
  onClick: () => void;
  label: string;
}> = ({ onClick, label }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-border bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
  >
    <ExternalLink className="w-3.5 h-3.5" />
    {label}
  </button>
);

export default SettingsTab;
