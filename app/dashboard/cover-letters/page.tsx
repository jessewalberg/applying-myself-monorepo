"use client";

import { useState } from "react";
import Link from "next/link";
import { DocumentTextIcon, PlusIcon, ClockIcon, CheckCircleIcon, EyeIcon } from "@heroicons/react/24/outline";

interface CoverLetter {
  id: string;
  jobTitle: string;
  companyName: string;
  content: string;
  createdAt: string;
  tone: string;
  length: string;
}

export default function CoverLettersPage() {
  // Mock data - will be replaced with real data from Convex
  const coverLetters: CoverLetter[] = [];

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
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Generate Cover Letter</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Generated</p>
              <p className="text-2xl font-semibold text-gray-900">{coverLetters.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
        <div className="card">
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
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Your Cover Letters</h2>
          <div className="flex space-x-2">
            <select className="input-field text-sm">
              <option>All</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
        </div>

        {coverLetters.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cover letters yet</h3>
            <p className="text-gray-500 mb-6">
              Generate your first cover letter to get started!
            </p>
            <Link href="/dashboard/cover-letters/new" className="btn-primary">
              Generate Your First Cover Letter
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {coverLetters.map((letter) => (
              <div key={letter.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{letter.jobTitle}</h3>
                    <p className="text-sm text-gray-500">{letter.companyName}</p>
                    <p className="text-xs text-gray-400 mt-1">{letter.createdAt}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/cover-letters/${letter.id}`}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                    <button className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                      Download
                    </button>
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