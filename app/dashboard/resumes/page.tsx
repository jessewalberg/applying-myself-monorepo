"use client";

import { useState } from "react";
import Link from "next/link";
import { DocumentIcon, PlusIcon, TrashIcon, StarIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convexApi";
import { Dropdown } from "@/components/ui/Dropdown";
import { type GenericId as Id } from "convex/values";

export default function ResumesPage() {
  // Fetch resumes from Convex
  const resumesQuery = useQuery(api.resumes.getResumes, {});
  const deleteResume = useMutation(api.resumes.deleteResume);
  const setDefaultResume = useMutation(api.resumes.setDefault);

  const resumes: Array<{
    _creationTime: number;
    _id: Id<"resumes">;
    createdAt: number;
    extractedText?: string;
    fileId: Id<"_storage">;
    fileSize: number;
    filename: string;
    isDefault?: boolean;
    mimeType: string;
    updatedAt: number;
    userProfileId: Id<"userProfiles">;
  }> = resumesQuery?.resumes || [];
  const isLoading = resumesQuery === undefined;

  // Count default resumes
  const defaultResumeCount = resumes.filter(resume => resume.isDefault).length;

  // State for filter dropdown
  const [sortBy, setSortBy] = useState("all");

  // Sort resumes based on selected option
  const sortedResumes = [...resumes].sort((a, b) => {
    switch (sortBy) {
      case "default":
        // Default resumes first, then by creation date (newest first)
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return b.createdAt - a.createdAt;
      case "newest":
        // Newest first
        return b.createdAt - a.createdAt;
      case "all":
      default:
        // Default order (as returned from backend)
        return 0;
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSetDefault = async (resumeId: Id<"resumes">) => {
    try {
      await setDefaultResume({ resumeId });
    } catch (error) {
      console.error('Error setting default resume:', error);
      alert('Failed to set default resume. Please try again.');
    }
  };

  const handleDelete = async (resumeId: Id<"resumes">) => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      await deleteResume({ resumeId });
    } catch (error) {
      console.error('Error deleting resume:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resumes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload and manage your resumes for job applications.
          </p>
        </div>
        <Link
          href="/dashboard/resumes/upload"
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Upload Resume</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DocumentIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Resumes</p>
              <p className="text-2xl font-semibold text-gray-900">{resumes.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <StarIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Default Resume</p>
              <p className="text-2xl font-semibold text-gray-900">
                {defaultResumeCount}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CloudArrowUpIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Storage Used</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatFileSize(resumes.reduce((total, resume) => total + resume.fileSize, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumes List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Your Resumes</h2>
          <div className="flex space-x-2">
            <Dropdown
              options={[
                { value: "all", label: "All Resumes" },
                { value: "default", label: "Default First" },
                { value: "newest", label: "Newest First" },
              ]}
              value={sortBy}
              onChange={setSortBy}
              className="min-w-[140px]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-12">
            <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes uploaded</h3>
            <p className="text-gray-500 mb-6">
              Upload your first resume to get started with job applications.
            </p>
            <Link href="/dashboard/resumes/upload" className="btn-primary">
              Upload Your First Resume
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedResumes.map((resume) => (
              <div key={resume._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DocumentIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{resume.filename}</h3>
                        {resume.isDefault && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <StarIconSolid className="w-3 h-3 mr-1" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{resume.filename}</p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(resume.fileSize)} • Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                        {resume.extractedText ? (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Text Extracted
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⏳ Processing
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {resume.isDefault ? (
                      <span className="text-yellow-600 text-sm font-medium flex items-center space-x-1">
                        <StarIconSolid className="w-4 h-4" />
                        <span>Default</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(resume._id)}
                        className="text-gray-500 hover:text-yellow-600 text-sm font-medium flex items-center space-x-1 transition-colors"
                      >
                        <StarIcon className="w-4 h-4" />
                        <span>Set Default</span>
                      </button>
                    )}
                    <Link
                      href={`/dashboard/resumes/${resume._id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </Link>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(resume._id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span>Delete</span>
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