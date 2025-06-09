"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

type StatusType = "applied" | "interviewing" | "offered" | "rejected" | "withdrawn";

export default function NewJobApplicationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    location: "",
    salary: "",
    status: "applied" as StatusType,
    jobUrl: "",
    notes: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // TODO: Create new job application with Convex
      console.log("Creating job:", formData);
      
      // Redirect back to jobs list
      router.push("/dashboard/jobs");
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Job Applications</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Job Application</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track a new job application to stay organized.
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Software Engineer"
                  required
                />
              </div>
              <div>
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Google"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              <div>
                <label className="form-label">Salary Range</label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., $120,000 - $150,000"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Job URL</label>
              <input
                type="url"
                name="jobUrl"
                value={formData.jobUrl}
                onChange={handleInputChange}
                className="input-field"
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Link to the job posting for easy reference.
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h2>
            
            <div className="mb-4">
              <label className="form-label">Application Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            <div>
              <label className="form-label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="input-field"
                placeholder="Any notes about this application, interview details, contacts, etc..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Link
              href="/dashboard/jobs"
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={!formData.jobTitle || !formData.companyName}
            >
              Add Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 