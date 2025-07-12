import React, { useState, useEffect } from 'react';
import {
  FileText,
  Briefcase,
  Download,
  Copy,
  Settings,
  History,
  CreditCard,
  User,
  ChevronRight,
  Check,
  AlertCircle,
  LogOut,
  CheckCircle,
  Loader,
  ExternalLink
} from 'lucide-react';
import { StorageService } from '@/services/storage';
import { convexApi } from '@/services/convexApi';
import TabNavigation from './components/TabNavigation';
import GenerateTab from './components/GenerateTab';
import HistoryTab from './components/HistoryTab';
import SettingsTab from './components/SettingsTab';
import ApplyingMyselfLogo from './components/ApplyingMyselfLogo';
import EnvironmentBanner from '../components/EnvironmentBanner';
import type { User as UserType } from '@/types';
import './popup.css';

type TabType = 'generate' | 'history' | 'settings';

// Simple analytics tracking for Chrome extension
const trackExtensionEvent = (eventName: string, properties: Record<string, string> = {}) => {
  try {
    // Try to send analytics event to background script or API
    if (chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'ANALYTICS_EVENT',
        eventName,
        properties: {
          source: 'chrome_extension_popup',
          timestamp: new Date().toISOString(),
          ...properties
        }
      });
    }

    // Also log to console for debugging
    console.log('Extension Analytics:', eventName, properties);
  } catch (error) {
    console.warn('Failed to track extension event:', error);
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('generate');
  const [user, setUser] = useState<UserType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleTabChange = (tab: string): void => {
    const newTab = tab as TabType;

    // Track tab change
    trackExtensionEvent('extension_tab_changed', {
      from_tab: activeTab,
      to_tab: newTab,
      user_plan: user?.plan || 'none',
      user_credits: (user?.credits || 0).toString()
    });

    setActiveTab(newTab);
  };

  useEffect(() => {
    // Track popup opened
    trackExtensionEvent('extension_popup_opened');
    initializeApp();
  }, []);

  const initializeApp = async (): Promise<void> => {
    try {
      setLoading(true);

      // Initialize authentication from storage
      const isAuthenticated = await convexApi.initializeFromStorage();

      if (isAuthenticated) {
        // Get user profile to populate the UI
        const userProfile = await convexApi.getUserProfile();

        if (userProfile) {
          const userData = {
            id: userProfile._id,
            email: userProfile.email,
            name: userProfile.name,
            credits: userProfile.credits || 0,
            plan: userProfile.plan,
          };

          // Store user data for faster loading next time
          await StorageService.setUserData(userData);

          setUser(userData);
          setIsAuthenticated(true);

          // Track successful authentication from storage
          trackExtensionEvent('extension_auth_restored', {
            user_plan: userData.plan || 'none',
            user_credits: userData.credits.toString(),
            has_name: userData.name ? 'true' : 'false'
          });
        } else {
          // Token is invalid
          await handleLogout();
        }
      } else {
        // Track unauthenticated session
        trackExtensionEvent('extension_session_unauthenticated');
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);

      // Track initialization failure
      trackExtensionEvent('extension_init_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      setIsAuthenticated(false);
      // Clear invalid token
      await StorageService.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials: { email: string; password: string }): Promise<void> => {
    type SignInResponse = { success: boolean; token?: unknown; error?: string };

    // Track login attempt
    trackExtensionEvent('extension_login_attempted', {
      email: credentials.email
    });

    try {
      const response: SignInResponse = await convexApi.signIn(credentials);
      if (response.success && typeof response.token === 'string') {
        await StorageService.setToken(response.token);
        // Token is already set in convexApi.signIn(), so we can directly get user profile
        const userProfile = await convexApi.getUserProfile();

        if (userProfile) {
          const userData = {
            id: userProfile._id,
            email: userProfile.email,
            name: userProfile.name,
            credits: userProfile.credits || 0,
            plan: userProfile.plan,
          };

          // Store user data for persistence
          await StorageService.setUserData(userData);

          setUser(userData);
          setIsAuthenticated(true);

          // Track successful login
          trackExtensionEvent('extension_login_successful', {
            user_plan: userData.plan || 'none',
            user_credits: userData.credits.toString(),
            has_name: userData.name ? 'true' : 'false'
          });
        } else {
          throw new Error('Failed to get user profile');
        }
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      // Track login failure
      trackExtensionEvent('extension_login_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: credentials.email
      });

      throw error;
    }
  };

  const handleLogout = async (): Promise<void> => {
    // Track logout
    trackExtensionEvent('extension_logout', {
      user_plan: user?.plan || 'none',
      user_credits: (user?.credits || 0).toString()
    });

    await convexApi.signOut();
    await StorageService.clearAll(); // Clear all stored data including user data
    setUser(null);
    setIsAuthenticated(false);
  };

  // Set data attribute for CSS targeting
  useEffect(() => {
    document.body.setAttribute('data-extension-popup', 'true');
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="extension-container">
      <EnvironmentBanner />
      <Header user={user} onLogout={handleLogout} />

      <TabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
      />

      <div className="tab-content">
        {activeTab === 'generate' && (
          <GenerateTab user={user} onUserUpdate={setUser} />
        )}
        {activeTab === 'history' && (
          <HistoryTab user={user} refreshTrigger={activeTab} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab user={user} onUserUpdate={setUser} />
        )}
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

interface AuthScreenProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await onLogin({ email: formData.email, password: formData.password });
      } else {
        // Track signup attempt
        trackExtensionEvent('extension_signup_attempted', {
          email: formData.email,
          has_name: formData.name ? 'true' : 'false'
        });

        await convexApi.signUp(formData);
        await onLogin({ email: formData.email, password: formData.password });

        // Track successful signup
        trackExtensionEvent('extension_signup_successful', {
          email: formData.email
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Authentication failed';
      setError(errorMessage);

      // Track auth failure
      trackExtensionEvent(`extension_${isLogin ? 'login' : 'signup'}_failed`, {
        error: errorMessage,
        email: formData.email
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthToggle = () => {
    const newMode = !isLogin;

    // Track auth mode toggle
    trackExtensionEvent('extension_auth_mode_toggled', {
      from_mode: isLogin ? 'login' : 'signup',
      to_mode: newMode ? 'login' : 'signup'
    });

    setIsLogin(newMode);
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="brand">
          <ApplyingMyselfLogo className="brand-icon" size={32} />
          <h1>Applying Myself</h1>
        </div>
        <p>AI-Powered Cover Letter Generator</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter your password"
            required
          />
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
        </button>

        <div className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="link-button"
            onClick={handleAuthToggle}
            disabled={loading}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </form>
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
      <span>{user?.name || user?.email || 'User'}</span>
      <button className="user-menu" onClick={onLogout}>
        <LogOut size={14} />
      </button>
    </div>
  </div>
);

// Export the tracking function for use in other components
export { trackExtensionEvent };

export default App;