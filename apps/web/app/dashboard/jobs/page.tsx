"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { BriefcaseIcon, PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon, XCircleIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { useQuery, useMutation } from "convex/react";
import { api } from '@app/convex-client';
import { Dropdown } from "@/components/ui/Dropdown";
import { type GenericId as Id } from "convex/values";

// Extract types from API return types
type JobApplication = {
  _id: Id<"jobApplications">;
  _creationTime: number;
  userProfileId: Id<"userProfiles">;
  jobTitle: string;
  companyName: string;
  location?: string;
  salary?: string;
  status?: "applied" | "interviewing" | "offered" | "rejected" | "withdrawn";
  appliedDate?: number;
  notes?: string;
  jobUrl?: string;
  jobType?: "full-time" | "part-time" | "contract" | "internship" | "freelance";
  resumeId?: Id<"resumes">;
  coverLetterId?: Id<"coverLetters">;
};

type ExtractedJob = {
  _creationTime: number;
  _id: Id<"extractedJobs">;
  benefits?: Array<string>;
  company?: string;
  confidence?: number;
  description?: string;
  experience?: string;
  extractedAt: number;
  industry?: string;
  jobType?: string;
  location?: string;
  pageType?: string;
  remote?: string;
  requirements?: Array<string>;
  salary?: string;
  skills?: Array<string>;
  title?: string;
  url: string;
  userProfileId: Id<"userProfiles">;
};

// Combined type for display
interface CombinedJob {
  _id: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  salary?: string;
  status?: "applied" | "interviewing" | "offered" | "rejected" | "withdrawn";
  appliedDate?: number;
  notes?: string;
  jobUrl?: string;
  source: "application" | "extracted";
  extractedAt?: number;
  confidence?: number;
}

const statusColors = {
  applied: "bg-blue-100 text-blue-800",
  interviewing: "bg-yellow-100 text-yellow-800",
  offered: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  applied: "Applied",
  interviewing: "Interviewing",
  offered: "Offered",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<CombinedJob>>({});
  const [editingSource, setEditingSource] = useState<"application" | "extracted" | null>(null);

  // Convex hooks
  const ensureUserProfile = useMutation(api.userHelpers.ensureUserProfile);
  const createJobApplicationMutation = useMutation(api.jobApplications.create);
  const deleteJobApplicationMutation = useMutation(api.jobApplications.deleteJobApplication);
  const updateJobApplicationMutation = useMutation(api.jobApplications.update);
  const updateExtractedJobMutation = useMutation(api.jobs.updateJobData);
  const deleteExtractedJobMutation = useMutation(api.jobs.deleteExtractedJob);
  const [profileEnsured, setProfileEnsured] = useState(false);

  useEffect(() => {
    ensureUserProfile({}).then(() => setProfileEnsured(true));
  }, [ensureUserProfile]);

  // Get job applications and extracted jobs
  const jobApplicationsQuery = useQuery(api.jobApplications.getJobApplications, profileEnsured ? {} : "skip");
  const extractedJobsQuery = useQuery(api.jobs.getExtractedJobs, profileEnsured ? {} : "skip");

  const applications: JobApplication[] = jobApplicationsQuery?.jobApplications || [];
  const extractedJobs: ExtractedJob[] = extractedJobsQuery?.jobs || [];
  const isLoading = !profileEnsured || jobApplicationsQuery === undefined || extractedJobsQuery === undefined;

  // Combine both types into a unified list
  const combinedJobs: CombinedJob[] = [
    // Job applications
    ...applications.map((app): CombinedJob => ({
      _id: app._id,
      jobTitle: app.jobTitle,
      companyName: app.companyName,
      location: app.location,
      salary: app.salary,
      status: app.status,
      appliedDate: app.appliedDate,
      notes: app.notes,
      jobUrl: app.jobUrl,
      source: "application",
    })),
    // Extracted jobs
    ...extractedJobs.map((job): CombinedJob => ({
      _id: job._id,
      jobTitle: job.title || "Untitled Job",
      companyName: job.company || "Unknown Company",
      location: job.location,
      salary: job.salary,
      jobUrl: job.url,
      source: "extracted",
      extractedAt: job.extractedAt,
      confidence: job.confidence,
    })),
  ].sort((a, b) => {
    // Sort by most recent (appliedDate for applications, extractedAt for extracted jobs)
    const aDate = a.appliedDate || a.extractedAt || 0;
    const bDate = b.appliedDate || b.extractedAt || 0;
    return bDate - aDate;
  });

  const filteredJobs = combinedJobs.filter(job => {
    // Enhanced search - search in multiple fields
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" ||
      job.jobTitle.toLowerCase().includes(searchLower) ||
      job.companyName.toLowerCase().includes(searchLower) ||
      (job.location && job.location.toLowerCase().includes(searchLower)) ||
      (job.salary && job.salary.toLowerCase().includes(searchLower)) ||
      (job.notes && job.notes.toLowerCase().includes(searchLower));

    // Status filter
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "no-status" && !job.status) ||
      job.status === statusFilter;

    // Source filter
    const matchesSource = sourceFilter === "all" || job.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  // Clear search function
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSourceFilter("all");
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || sourceFilter !== "all";

  const getApplicationsByStatus = (status: keyof typeof statusLabels) => {
    return applications.filter(app => app.status === status).length;
  };



  const handleDelete = async (jobId: string) => {
    // Find the job to determine its source
    const job = combinedJobs.find(j => j._id === jobId);
    if (!job) return;

    const itemType = job.source === "application" ? "job application" : "extracted job";
    if (!confirm(`Are you sure you want to delete this ${itemType}?`)) {
      return;
    }

    try {
      if (job.source === "application") {
        await deleteJobApplicationMutation({
          jobApplicationId: jobId as Id<"jobApplications">,
        });
      } else {
        await deleteExtractedJobMutation({
          jobId: jobId as Id<"extractedJobs">,
        });
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert(`Failed to delete ${itemType}. Please try again.`);
    }
  };

  const handleEdit = (job: CombinedJob) => {
    setEditingId(job._id);
    setEditingSource(job.source);
    setEditingData({
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      location: job.location || "",
      salary: job.salary || "",
      status: job.status || "applied", // Default to "applied" if no status
      notes: job.notes || "",
      jobUrl: job.jobUrl || "",
    });
  };

  const handleSave = async () => {
    if (!editingId || !editingSource) return;

    try {
      if (editingSource === "application") {
        // Update job application
        await updateJobApplicationMutation({
          jobApplicationId: editingId as Id<"jobApplications">,
          jobTitle: editingData.jobTitle,
          companyName: editingData.companyName,
          location: editingData.location,
          salary: editingData.salary,
          status: editingData.status,
          notes: editingData.notes,
          jobUrl: editingData.jobUrl,
        });
      } else if (editingSource === "extracted") {
        // If status is set, convert extracted job to job application
        if (editingData.status) {
          // Create job application
          await createJobApplicationMutation({
            jobTitle: editingData.jobTitle || "Job Position",
            companyName: editingData.companyName || "Unknown Company",
            jobUrl: editingData.jobUrl,
            location: editingData.location,
            salary: editingData.salary,
            status: editingData.status,
            notes: editingData.notes,
            appliedDate: Date.now(),
          });

          // Delete the extracted job
          await deleteExtractedJobMutation({
            jobId: editingId as Id<"extractedJobs">,
          });
        } else {
          // Just update the extracted job
          await updateExtractedJobMutation({
            jobId: editingId as Id<"extractedJobs">,
            extractedData: {
              title: editingData.jobTitle,
              company: editingData.companyName,
              location: editingData.location,
              salary: editingData.salary,
              pageType: "job",
              confidence: 1.0, // Manual edit gets full confidence
            },
          });
        }
      }

      setEditingId(null);
      setEditingData({});
      setEditingSource(null);
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({});
    setEditingSource(null);
  };

  const handleEditingChange = (field: string, value: string) => {
    setEditingData((prev: Partial<CombinedJob>) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track and manage your job applications.
          </p>
        </div>
        <Link
          href="/dashboard/jobs/new"
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Application</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{getApplicationsByStatus("applied")}</p>
            <p className="text-sm text-gray-600">Applied</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{getApplicationsByStatus("interviewing")}</p>
            <p className="text-sm text-gray-600">Interviewing</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{getApplicationsByStatus("offered")}</p>
            <p className="text-sm text-gray-600">Offered</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{getApplicationsByStatus("rejected")}</p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{getApplicationsByStatus("withdrawn")}</p>
            <p className="text-sm text-gray-600">Withdrawn</p>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 mb-6">
        <div className="flex flex-col space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search jobs, companies, locations, salary, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-sm placeholder-gray-500"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  clearSearch();
                }
              }}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
              >
                <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              {/* Status Filter */}
              <Dropdown
                options={[
                  { value: "all", label: "All Status" },
                  { value: "applied", label: "Applied" },
                  { value: "interviewing", label: "Interviewing" },
                  { value: "offered", label: "Offered" },
                  { value: "rejected", label: "Rejected" },
                  { value: "withdrawn", label: "Withdrawn" },
                  { value: "no-status", label: "No Status" },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                className="min-w-[130px]"
              />

              {/* Source Filter */}
              <Dropdown
                options={[
                  { value: "all", label: "All Sources" },
                  { value: "application", label: "Applications" },
                  { value: "extracted", label: "Extracted Jobs" },
                ]}
                value={sourceFilter}
                onChange={setSourceFilter}
                className="min-w-[130px]"
              />

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <XCircleIcon className="h-3 w-3 mr-1" />
                  Clear All
                </button>
              )}
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-500">
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                <span>
                  Showing <span className="font-medium text-gray-900">{filteredJobs.length}</span> of{' '}
                  <span className="font-medium text-gray-900">{combinedJobs.length}</span> jobs
                  {hasActiveFilters && (
                    <span className="ml-1 text-purple-600">(filtered)</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-500">Active filters:</span>

              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Search: &ldquo;{searchTerm}&rdquo;
                  <button
                    onClick={clearSearch}
                    className="ml-1 hover:text-purple-600"
                  >
                    <XCircleIcon className="h-3 w-3" />
                  </button>
                </span>
              )}

              {statusFilter !== "all" && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Status: {statusFilter === "no-status" ? "No Status" : statusLabels[statusFilter as keyof typeof statusLabels] || statusFilter}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="ml-1 hover:text-blue-600"
                  >
                    <XCircleIcon className="h-3 w-3" />
                  </button>
                </span>
              )}

              {sourceFilter !== "all" && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Source: {sourceFilter === "application" ? "Applications" : "Extracted Jobs"}
                  <button
                    onClick={() => setSourceFilter("all")}
                    className="ml-1 hover:text-green-600"
                  >
                    <XCircleIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Applications List */}
      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading job applications...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {combinedJobs.length === 0 ? "No jobs yet" : "No jobs match your search"}
            </h3>
            <p className="text-gray-500 mb-6">
              {combinedJobs.length === 0
                ? "Start tracking job applications or extract jobs from job sites."
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {combinedJobs.length === 0 && (
              <Link href="/dashboard/jobs/new" className="btn-primary">
                Add Your First Application
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.filter(job => job._id).map((job) => {
                  const isEditing = editingId === job._id;

                  return (
                    <tr key={job._id} className={isEditing ? "bg-blue-50" : "hover:bg-gray-50"}>
                      <td className={`px-6 ${isEditing ? 'py-6 align-top' : 'py-4 whitespace-nowrap'}`}>
                        {isEditing ? (
                          <div className="space-y-3 min-w-[200px]">
                            <input
                              type="text"
                              value={editingData.jobTitle || ""}
                              onChange={(e) => handleEditingChange("jobTitle", e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              placeholder="Job Title"
                            />
                            <input
                              type="url"
                              value={editingData.jobUrl || ""}
                              onChange={(e) => handleEditingChange("jobUrl", e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              placeholder="Job URL (optional)"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {job.jobTitle}
                            </div>
                            {job.jobUrl && (
                              <a
                                href={job.jobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-purple-600 hover:text-purple-700"
                              >
                                View Job Posting
                              </a>
                            )}
                          </div>
                        )}
                      </td>
                      <td className={`px-6 ${isEditing ? 'py-6 align-top' : 'py-4 whitespace-nowrap'} text-sm text-gray-900`}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingData.companyName || ""}
                            onChange={(e) => handleEditingChange("companyName", e.target.value)}
                            className="w-full min-w-[150px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            placeholder="Company Name"
                          />
                        ) : (
                          job.companyName
                        )}
                      </td>
                      <td className={`px-6 ${isEditing ? 'py-6 align-top' : 'py-4 whitespace-nowrap'} text-sm text-gray-500`}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingData.location || ""}
                            onChange={(e) => handleEditingChange("location", e.target.value)}
                            className="w-full min-w-[120px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            placeholder="Location"
                          />
                        ) : (
                          job.location || "—"
                        )}
                      </td>
                      <td className={`px-6 ${isEditing ? 'py-6 align-top' : 'py-4 whitespace-nowrap'} text-sm text-gray-900`}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingData.salary || ""}
                            onChange={(e) => handleEditingChange("salary", e.target.value)}
                            className="w-full min-w-[120px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            placeholder="Salary"
                          />
                        ) : (
                          job.salary || "—"
                        )}
                      </td>
                      <td className={`px-6 ${isEditing ? 'py-6 align-top' : 'py-4 whitespace-nowrap'}`}>
                        {isEditing ? (
                          <div className="min-w-[140px]">
                            <Dropdown
                              options={[
                                { value: "applied", label: "Applied" },
                                { value: "interviewing", label: "Interviewing" },
                                { value: "offered", label: "Offered" },
                                { value: "rejected", label: "Rejected" },
                                { value: "withdrawn", label: "Withdrawn" },
                              ]}
                              value={editingData.status || "applied"}
                              onChange={(value) => handleEditingChange("status", value)}
                              className="w-full"
                            />
                            {job.source === "extracted" && (
                              <p className="text-xs text-gray-500 mt-1">
                                Setting status will convert to job application
                              </p>
                            )}
                          </div>
                        ) : (
                          job.status ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[job.status as keyof typeof statusColors]}`}>
                              {statusLabels[job.status as keyof typeof statusLabels]}
                            </span>
                          ) : job.source === "extracted" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Extracted
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Applied
                            </span>
                          )
                        )}
                      </td>
                      <td className={`px-6 ${isEditing ? 'py-6 align-top' : 'py-4 whitespace-nowrap'} text-sm text-gray-500`}>
                        {job.appliedDate ? new Date(job.appliedDate).toLocaleDateString() :
                          job.extractedAt ? new Date(job.extractedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className={`px-6 ${isEditing ? 'py-6 align-top' : 'py-4 whitespace-nowrap'} text-sm font-medium`}>
                        {isEditing ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSave}
                              className="text-green-600 hover:text-green-700 flex items-center space-x-1"
                            >
                              <CheckIcon className="w-4 h-4" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-gray-600 hover:text-gray-700 flex items-center space-x-1"
                            >
                              <XMarkIcon className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(job)}
                              className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                            >
                              <PencilIcon className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(job._id)}
                              className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 