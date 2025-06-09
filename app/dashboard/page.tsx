"use client";

import { CreditCardIcon, DocumentTextIcon, DocumentIcon, BriefcaseIcon } from "@heroicons/react/24/outline";

export default function DashboardPage() {
  // TODO: Add API calls once Convex functions are deployed
  // const creditStats = useQuery(api.credits.getCreditStats);
  // const userProfile = useQuery(api.users.getUserProfile);

  const stats = [
    {
      name: "Credits This Month",
      value: 0, // creditStats?.thisMonthUsed || 0,
      icon: CreditCardIcon,
      color: "bg-purple-500",
    },
    {
      name: "Total Credits Used",
      value: 0, // creditStats?.totalUsed || 0,
      icon: CreditCardIcon,
      color: "bg-blue-500",
    },
    {
      name: "Cover Letters",
      value: "Coming Soon",
      icon: DocumentTextIcon,
      color: "bg-green-500",
    },
    {
      name: "Applications",
      value: "Coming Soon",
      icon: BriefcaseIcon,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Here's an overview of your account.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn-primary">
              Generate Cover Letter
            </button>
            <button className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors">
              Upload Resume
            </button>
            <button className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors">
              Add Job Application
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8">
            <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent activity yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Start by generating your first cover letter!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 