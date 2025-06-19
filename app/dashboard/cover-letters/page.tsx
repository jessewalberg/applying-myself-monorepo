"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DocumentTextIcon, PlusIcon, ClockIcon, CheckCircleIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convexApi";
import { Dropdown } from "@/components/ui/Dropdown";
import { type GenericId as Id } from "convex/values";

export default function CoverLettersPage() {
  const ensureUserProfile = useMutation(api.userHelpers.ensureUserProfile);
  const [profileEnsured, setProfileEnsured] = useState(false);

  useEffect(() => {
    ensureUserProfile({}).then(() => setProfileEnsured(true));
  }, [ensureUserProfile]);

  // Fetch cover letters from Convex
  const coverLettersQuery = useQuery(api.coverLetters.getCoverLetters, profileEnsured ? {} : "skip");
  const coverLetters: Array<{
    _creationTime: number;
    _id: Id<"coverLetters">;
    company?: string;
    content: string;
    createdAt?: number;
    creditsUsed: number;
    extractedJobId?: Id<"extractedJobs">;
    jobTitle?: string;
    preferences?: {
      tone?: string;
      length?: string;
      customInstructions?: string;
    };
    resumeId: Id<"resumes">;
    userProfileId: Id<"userProfiles">;
  }> = coverLettersQuery?.coverLetters || [];
  const isLoading = coverLettersQuery === undefined;

  // Calculate stats
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const thisMonthCount = coverLetters.filter(letter =>
    (letter.createdAt || letter._creationTime) >= thisMonth.getTime()
  ).length;

  // Filter state
  const [filterBy, setFilterBy] = useState("all");

  // Filter cover letters based on selected option
  const filteredCoverLetters = coverLetters.filter(letter => {
    const letterDate = new Date(letter.createdAt || letter._creationTime);
    const now = new Date();

    switch (filterBy) {
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return letterDate >= weekAgo;
      case "month":
        return letterDate >= thisMonth;
      case "generating":
        return letter.content === "Generating your personalized cover letter...";
      case "complete":
        return letter.content !== "Generating your personalized cover letter...";
      case "all":
      default:
        return true;
    }
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cover Letters</h1>
          <p className="mt-1 text-sm text-gray-600">
            Generate personalized cover letters for your job applications.
          </p>
        </div>
        <Link
          href="/dashboard/cover-letters/new"
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Generate Cover Letter</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Generated</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? "..." : coverLetters.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? "..." : thisMonthCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Time</p>
              <p className="text-2xl font-semibold text-gray-900">30s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Letters List */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your Cover Letters</h2>
            {!isLoading && (
              <p className="text-sm text-gray-500 mt-1">
                Showing {filteredCoverLetters.length} of {coverLetters.length} cover letters
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <Dropdown
              options={[
                { value: "all", label: "All Letters" },
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
                { value: "generating", label: "Generating" },
                { value: "complete", label: "Complete" },
              ]}
              value={filterBy}
              onChange={setFilterBy}
              className="min-w-[140px]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading cover letters...</p>
          </div>
        ) : filteredCoverLetters.length === 0 && coverLetters.length > 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cover letters match your filter</h3>
            <p className="text-gray-500 mb-6">
              Try selecting a different filter option to see your cover letters.
            </p>
            <button
              onClick={() => setFilterBy("all")}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Show All Cover Letters
            </button>
          </div>
        ) : coverLetters.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cover letters yet</h3>
            <p className="text-gray-500 mb-6">
              Generate your first cover letter to get started!
            </p>
            <Link
              href="/dashboard/cover-letters/new"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Generate Your First Cover Letter
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCoverLetters.map((letter) => (
              <div key={letter._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {letter.jobTitle || 'Cover Letter'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {letter.company || 'Unknown Company'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(letter.createdAt || letter._creationTime).toLocaleDateString()} at{' '}
                      {new Date(letter.createdAt || letter._creationTime).toLocaleTimeString()}
                    </p>
                    <div className="mt-1">
                      {letter.content === "Generating your personalized cover letter..." ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <div className="animate-spin rounded-full h-2 w-2 border-b border-yellow-600 mr-1"></div>
                          Generating...
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Complete
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/cover-letters/${letter._id}`}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}