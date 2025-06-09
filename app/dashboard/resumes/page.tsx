"use client";

import Link from "next/link";
import { DocumentIcon, PlusIcon, TrashIcon, StarIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

interface Resume {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ResumesPage() {
  // Mock data - will be replaced with real data from Convex
  const resumes: Resume[] = [];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSetDefault = async (resumeId: string) => {
    try {
      // TODO: Implement set default with Convex
      console.log('Setting default resume:', resumeId);
    } catch (error) {
      console.error('Error setting default resume:', error);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      // TODO: Implement delete with Convex
      console.log('Deleting resume:', resumeId);
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
                {resumes.find(r => r.isDefault) ? '1' : '0'}
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
            <select className="input-field text-sm">
              <option>All Resumes</option>
              <option>Default First</option>
              <option>Newest First</option>
            </select>
          </div>
        </div>

        {resumes.length === 0 ? (
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
            {resumes.map((resume) => (
              <div key={resume.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DocumentIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{resume.name}</h3>
                        {resume.isDefault && (
                          <StarIconSolid className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{resume.fileName}</p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(resume.fileSize)} • Uploaded {resume.createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!resume.isDefault && (
                      <button
                        onClick={() => handleSetDefault(resume.id)}
                        className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center space-x-1"
                      >
                        <StarIcon className="w-4 h-4" />
                        <span>Set Default</span>
                      </button>
                    )}
                    <Link
                      href={`/dashboard/resumes/${resume.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </Link>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(resume.id)}
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