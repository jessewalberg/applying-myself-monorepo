import React, { useState, useEffect } from 'react';
import { User, CreditCard, Shield, ExternalLink, LogOut, AlertCircle, Briefcase } from 'lucide-react';
import { ConvexApiService } from '@/services/convexApi';
import type { SettingsTabProps } from '@/types';

const convexApi = ConvexApiService.getInstance();

const SettingsTab: React.FC<SettingsTabProps> = ({ user, onUserUpdate }) => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load fresh user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await convexApi.getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Use fresh profile data if available, fallback to prop data
  const userData = userProfile || user;

  if (loading || !userData) {
    return (
      <div className="settings-tab">
        <div className="loading-message">Loading user data...</div>
      </div>
    );
  }

  const handleManageBilling = (): void => {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://applyingmyself.com'
      : 'http://localhost:3000';
    window.open(`${baseUrl}/dashboard/billing`, '_blank');
  };

  const handleManageSettings = (): void => {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://applyingmyself.com'
      : 'http://localhost:3000';
    window.open(`${baseUrl}/dashboard/settings`, '_blank');
  };

  const handleOpenJobsDashboard = (): void => {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://applyingmyself.com'
      : 'http://localhost:3000';
    window.open(`${baseUrl}/dashboard/jobs`, '_blank');
  };

  const handleSignOut = async (): Promise<void> => {
    if (isSigningOut) return;

    try {
      setIsSigningOut(true);
      await convexApi.signOut();
      // Trigger parent component update - pass undefined to indicate signed out
      if (onUserUpdate) {
        onUserUpdate(undefined as any);
      }
    } catch (error) {
      console.error('Failed to sign out:', error);
      setIsSigningOut(false);
    }
  };

  // Format plan name for display
  const formatPlanName = (plan: string) => {
    if (plan === 'none') return 'None';
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  // Get subscription status display
  const getSubscriptionStatus = () => {
    if (userData.subscriptionStatus) {
      switch (userData.subscriptionStatus) {
        case "active":
          return { text: "Active", color: "text-green-600" };
        case "canceled":
          return { text: "Canceled", color: "text-red-600" };
        case "past_due":
          return { text: "Past Due", color: "text-red-600" };
        case "incomplete":
          return { text: "Incomplete", color: "text-yellow-600" };
        case "trialing":
          return { text: "Trial", color: "text-blue-600" };
        default:
          return { text: "Unknown", color: "text-gray-600" };
      }
    }

    if (userData.plan && userData.plan !== "none") {
      return { text: "Active", color: "text-green-600" };
    }

    return { text: "No Subscription", color: "text-gray-600" };
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="settings-tab">
      <SettingsSection title="Account" icon={User}>
        <div className="account-info">
          <div className="info-row">
            <span>Email:</span>
            <span>{userData.email}</span>
          </div>
          <div className="info-row">
            <span>Name:</span>
            <span>{userData.name}</span>
          </div>
          <div className="info-row">
            <span>Plan:</span>
            <span className="plan-badge">{formatPlanName(userData.plan)}</span>
          </div>
          {userData.subscriptionStatus && (
            <div className="info-row">
              <span>Status:</span>
              <span className={subscriptionStatus.color}>{subscriptionStatus.text}</span>
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="Billing & Credits" icon={CreditCard}>
        <div className="credits-info">
          <div className="credits-display">
            <span className="credits-number">{userData.credits || 0}</span>
            <span className="credits-label">Credits Remaining</span>
          </div>

          {userData.plan === 'none' && (
            <div className="upgrade-prompt">
              <div className="upgrade-info">
                <AlertCircle size={16} />
                <p>Upgrade to get monthly credits and unlimited access</p>
              </div>
              <div className="plan-options">
                <div className="plan-option">
                  <strong>Starter:</strong> $9/month - 50 credits
                </div>
                <div className="plan-option">
                  <strong>Pro:</strong> $19/month - 150 credits
                </div>
                <div className="plan-option">
                  <strong>Hired:</strong> $49/month - 500 credits
                </div>
              </div>
            </div>
          )}

          <button className="secondary-button" onClick={handleManageBilling}>
            <ExternalLink size={16} />
            Manage Billing & Subscriptions
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Job Applications" icon={Briefcase}>
        <div className="settings-actions">
          <p className="settings-description">
            Track and manage your job applications. View detailed analytics and update statuses.
          </p>
          <button className="secondary-button" onClick={() => handleOpenJobsDashboard()}>
            <ExternalLink size={16} />
            Manage Job Applications
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Settings & Preferences" icon={Shield}>
        <div className="settings-actions">
          <p className="settings-description">
            Manage your profile, notifications, and security settings on the web dashboard.
          </p>
          <button className="secondary-button" onClick={handleManageSettings}>
            <ExternalLink size={16} />
            Open Settings Dashboard
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Privacy & Security" icon={Shield}>
        <div className="privacy-info">
          <p>Your data is encrypted and secure. We never share your information with third parties.</p>
          <div className="privacy-links">
            <button
              className="link-button"
              onClick={() => window.open('https://applyingmyself.com/privacy', '_blank')}
            >
              <ExternalLink size={16} />
              Privacy Policy
            </button>
            <button
              className="link-button"
              onClick={() => window.open('https://applyingmyself.com/terms', '_blank')}
            >
              <ExternalLink size={16} />
              Terms of Service
            </button>
          </div>
        </div>
      </SettingsSection>

      <div className="settings-footer">
        <button
          className="danger-button"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut size={16} />
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </button>
        <div className="version-info">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
};

interface SettingsSectionProps {
  title: string;
  icon: React.ComponentType<{ size?: number | string }>;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon: Icon, children }) => (
  <div className="settings-section">
    <div className="section-header">
      <Icon size={18} />
      <h4>{title}</h4>
    </div>
    <div className="section-content">
      {children}
    </div>
  </div>
);

export default SettingsTab;