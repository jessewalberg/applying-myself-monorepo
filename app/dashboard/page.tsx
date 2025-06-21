"use client";

import { useState, useEffect } from "react";
import { CreditCardIcon, DocumentTextIcon, DocumentIcon, BriefcaseIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convexApi";
import { type GenericId as Id } from "convex/values";

// Type definitions
type JobApplication = {
  _id: Id<"jobApplications">;
  _creationTime: number;
  appliedDate?: number;
};

export default function DashboardPage() {
  const router = useRouter();

  // Ensure user profile exists
  const ensureUserProfile = useMutation(api.userHelpers.ensureUserProfile);
  const [profileEnsured, setProfileEnsured] = useState(false);

  useEffect(() => {
    ensureUserProfile({}).then(() => setProfileEnsured(true));
  }, [ensureUserProfile]);

  // Fetch data from Convex
  const userProfile = useQuery(api.userHelpers.getUserProfile, profileEnsured ? {} : "skip");
  const coverLettersQuery = useQuery(api.coverLetters.getCoverLetters, profileEnsured ? {} : "skip");
  const jobApplicationsQuery = useQuery(api.jobApplications.getJobApplications, profileEnsured ? {} : "skip");

  // Extract data with loading states
  const coverLetters = coverLettersQuery?.coverLetters || [];
  const jobApplications = jobApplicationsQuery?.jobApplications || [];
  const isLoading = !profileEnsured || userProfile === undefined || coverLettersQuery === undefined || jobApplicationsQuery === undefined;

  // Calculate this month's usage
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const thisMonthCoverLetters = coverLetters.filter(letter =>
    (letter.createdAt || letter._creationTime) >= thisMonth.getTime()
  ).length;

  const thisMonthApplications = jobApplications.filter((app: JobApplication) =>
    (app.appliedDate || app._creationTime) >= thisMonth.getTime()
  ).length;

  const handleGenerateCoverLetter = () => {
    router.push("/dashboard/cover-letters");
  };

  const handleUploadResume = () => {
    router.push("/dashboard/resumes/upload");
  };

  const handleAddJobApplication = () => {
    router.push("/dashboard/jobs/new");
  };

  const stats = [
    {
      name: "Available Credits",
      value: isLoading ? "..." : (userProfile?.credits || 0),
      icon: CreditCardIcon,
      color: "bg-purple-500",
      href: "/dashboard/billing",
      description: "View billing details"
    },
    {
      name: "This Month Activity",
      value: isLoading ? "..." : (thisMonthCoverLetters + thisMonthApplications),
      icon: CreditCardIcon,
      color: "bg-blue-500",
      href: "/dashboard/billing",
      description: "Cover letters + applications"
    },
    {
      name: "Cover Letters",
      value: isLoading ? "..." : coverLetters.length,
      icon: DocumentTextIcon,
      color: "bg-green-500",
      href: "/dashboard/cover-letters",
      description: "Manage cover letters"
    },
    {
      name: "Applications",
      value: isLoading ? "..." : jobApplications.length,
      icon: BriefcaseIcon,
      color: "bg-orange-500",
      href: "/dashboard/jobs",
      description: "Track applications"
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Here&rsquo;s an overview of your account.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="group block"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 cursor-pointer transition-all duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-gray-700 transition-colors duration-200">
                      {stat.name}
                    </dt>
                    <dd className="text-xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </dd>
                    <dd className="text-xs text-gray-400 group-hover:text-purple-600 transition-colors duration-200 mt-1">
                      {stat.description}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={handleGenerateCoverLetter}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span>Generate Cover Letter</span>
            </button>
            <button
              onClick={handleUploadResume}
              className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <DocumentIcon className="w-5 h-5" />
              <span>Upload Resume</span>
            </button>
            <button
              onClick={handleAddJobApplication}
              className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <BriefcaseIcon className="w-5 h-5" />
              <span>Add Job Application</span>
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8">
            <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No recent activity yet</p>
            <p className="text-sm text-gray-400 mb-6">
              Start by generating your first cover letter!
            </p>
            <button
              onClick={handleGenerateCoverLetter}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 