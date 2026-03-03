"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Briefcase,
  User,
  Settings,
  CreditCard,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from '@app/convex-client';
import { ApplyingMyselfLogo } from "./ApplyingMyselfLogo";
import { useClerk } from "@clerk/nextjs";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const router = useRouter();
  const { signOut } = useClerk();

  // Ensure user profile exists and fetch user data
  const ensureUserProfile = useMutation(api.userHelpers.ensureUserProfile);
  const [profileEnsured, setProfileEnsured] = useState(false);

  useEffect(() => {
    ensureUserProfile({})
      .then(() => setProfileEnsured(true))
      .catch((error) => {
        console.error("Failed to ensure user profile:", error);
      });
  }, [ensureUserProfile]);

  // Fetch user profile data
  const userProfile = useQuery(api.userHelpers.getUserProfile, profileEnsured ? {} : "skip");

  // Create user object for compatibility
  const user = userProfile ? {
    name: userProfile.name,
    email: userProfile.email,
    credits: userProfile.credits,
    plan: userProfile.plan
  } : null;

  // Get current path for navigation highlighting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const menuButton = document.getElementById('menu-button');

      if (sidebar && !sidebar.contains(event.target as Node) &&
        menuButton && !menuButton.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [sidebarOpen]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenu = document.getElementById('user-menu');
      const userButton = document.getElementById('user-button');

      if (userMenu && !userMenu.contains(event.target as Node) &&
        userButton && !userButton.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Briefcase },
    { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
    { name: 'Cover Letters', href: '/dashboard/cover-letters', icon: FileText },
    { name: 'Resumes', href: '/dashboard/resumes', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  ];

  // Helper function to check if route is active
  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(href);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        id="sidebar"
        className={`fixed top-0 left-0 z-50 h-full w-80 max-w-xs bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile sidebar header */}
          <div className="flex flex-shrink-0 items-center px-4 pb-4 border-b border-gray-200">
            <ApplyingMyselfLogo size="md" className="drop-shadow-sm" />
            <span className="ml-2 text-xl font-bold text-gray-900">Applying Myself</span>
          </div>

          {/* Mobile navigation */}
          <div className="flex-1 pt-5 pb-4 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors duration-150 ${isActive
                      ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`mr-4 h-6 w-6 flex-shrink-0 ${isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile user info */}
            <div className="mt-6 pt-6 border-t border-gray-200 px-2">
              <div className="flex items-center px-2 py-3">
                <User className="h-8 w-8 rounded-full bg-gray-200 p-1" />
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-900">
                    {user?.name || user?.email || 'User'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.credits || 0} credits • {user?.plan || 'None'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  handleSignOut();
                }}
                className="w-full flex items-center px-2 py-3 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
              >
                <LogOut className="mr-4 h-6 w-6 flex-shrink-0 text-gray-400" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:z-30">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200 shadow-sm">
          <div className="flex flex-shrink-0 items-center px-4 py-4 border-b border-gray-200">
            <ApplyingMyselfLogo size="md" className="drop-shadow-sm" />
            <span className="ml-2 text-xl font-bold text-gray-900">Applying Myself</span>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
              {navigation.map((item) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors duration-150 ${isActive
                      ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <item.icon className={`mr-3 h-6 w-6 flex-shrink-0 ${isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
          <button
            id="menu-button"
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:px-8 lg:py-4 lg:border-b lg:border-gray-200 lg:bg-white">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              id="user-button"
              type="button"
              className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-8 w-8 rounded-full bg-gray-200 p-1" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || user?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.credits || 0} credits • {user?.plan || 'None'}
                    </p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </button>

            {userMenuOpen && (
              <div id="user-menu" className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Link
                  href="/dashboard/settings/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="inline h-4 w-4 mr-2" />
                  Your Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="inline h-4 w-4 mr-2" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleSignOut();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="inline h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 
