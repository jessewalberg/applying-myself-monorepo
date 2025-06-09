"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserIcon, BellIcon, ShieldCheckIcon, CreditCardIcon } from "@heroicons/react/24/outline";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { 
      id: "profile", 
      name: "Profile", 
      icon: UserIcon, 
      href: "/dashboard/settings/profile" 
    },
    { 
      id: "notifications", 
      name: "Notifications", 
      icon: BellIcon, 
      href: "/dashboard/settings/notifications" 
    },
    { 
      id: "security", 
      name: "Security", 
      icon: ShieldCheckIcon, 
      href: "/dashboard/settings/security" 
    },
    { 
      id: "billing", 
      name: "Billing", 
      icon: CreditCardIcon, 
      href: "/dashboard/settings/billing" 
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === tab.href
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
} 