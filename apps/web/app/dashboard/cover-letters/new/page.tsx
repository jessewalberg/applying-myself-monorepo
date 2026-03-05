"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useQuery, useMutation } from "convex/react";
import { api } from '@applyingmyself/convex-client';
import { Dropdown } from "@/components/ui/Dropdown";
import { type GenericId as Id } from "convex/values";

export default function NewCoverLetterPage() {
  const router = useRouter();
  const ensureUserProfile = useMutation(api.userHelpers.ensureUserProfile);
  const generateCoverLetter = useMutation(api.coverLetters.generateFromForm);
  const [profileEnsured, setProfileEnsured] = useState(false);

  useEffect(() => {
    ensureUserProfile({}).then(() => setProfileEnsured(true));
  }, [ensureUserProfile]);

  const resumesQuery = useQuery(api.resumes.getResumes, profileEnsured ? {} : "skip");
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

  const userProfile = useQuery(api.userHelpers.getUserProfile, profileEnsured ? {} : "skip");

  const mostRecentResume = resumes.length > 0
    ? resumes.reduce((a, b) => (a.createdAt > b.createdAt ? a : b))
    : null;

  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    tone: "professional",
    length: "medium",
    customInstructions: "",
  });

  const [createJobApplication, setCreateJobApplication] = useState(false);
  const [jobApplicationData, setJobApplicationData] = useState({
    jobUrl: "",
    location: "",
    salary: "",
    jobType: "full-time",
    notes: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const hasEnoughCredits = (userProfile?.credits || 0) >= 2;

  useEffect(() => {
    if (mostRecentResume && !selectedResumeId) {
      setSelectedResumeId(mostRecentResume._id);
    }
  }, [mostRecentResume, selectedResumeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleJobApplicationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJobApplicationData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedResumeId) {
      alert("Please select a resume");
      return;
    }

    if (!formData.jobTitle.trim() || !formData.companyName.trim()) {
      alert("Please fill in the job title and company name");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateCoverLetter({
        resumeId: selectedResumeId as Id<"resumes">,
        jobTitle: formData.jobTitle.trim(),
        companyName: formData.companyName.trim(),
        jobDescription: formData.jobDescription.trim() || undefined,
        preferences: {
          tone: formData.tone as "professional" | "casual" | "enthusiastic",
          length: formData.length as "short" | "medium" | "long",
          customInstructions: formData.customInstructions.trim() || undefined,
        },
        createJobApplication,
        jobApplicationData: createJobApplication ? {
          jobUrl: jobApplicationData.jobUrl.trim() || undefined,
          location: jobApplicationData.location.trim() || undefined,
          salary: jobApplicationData.salary.trim() || undefined,
          jobType: jobApplicationData.jobType as "full-time" | "part-time" | "contract" | "internship" | "freelance",
          notes: jobApplicationData.notes.trim() || undefined,
        } : undefined,
      });

      console.log("Cover letter generation started:", result);
      router.push(`/dashboard/cover-letters/${result.coverLetter._id}`);
    } catch (error: unknown) {
      console.error("Error generating cover letter:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate cover letter. Please try again.";
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <Link
          href="/dashboard/cover-letters"
          className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Cover Letters</span>
        </Link>
        <h1 className="font-display text-3xl text-foreground">
          Generate Cover Letter<span className="text-primary">.</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create a personalized cover letter for your job application.
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Resume Picker */}
          <div className="rounded-xl p-6 bg-card/60 border border-border/50 mb-4">
            <label className="form-label">Resume *</label>
            <Dropdown
              options={resumes.length === 0
                ? [{ value: "", label: "No resumes found" }]
                : resumes.map((resume) => ({
                  value: resume._id,
                  label: `${resume.filename}${resume.createdAt ? ` - Uploaded ${new Date(resume.createdAt).toLocaleDateString()}` : ""}`
                }))
              }
              value={selectedResumeId}
              onChange={setSelectedResumeId}
              placeholder="Select a resume"
              disabled={isGenerating || resumes.length === 0}
            />
            {resumes.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                You have no resumes uploaded. <Link href="/dashboard/resumes/upload" className="text-primary underline">Upload one</Link> to get started.
              </p>
            )}
          </div>

          <div className="rounded-xl p-6 bg-card/60 border border-border/50">
            <h2 className="text-lg font-semibold text-foreground mb-4">Job Information</h2>

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
                  disabled={isGenerating}
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
                  disabled={isGenerating}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Job Description</label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                rows={4}
                className="input-field"
                placeholder="Paste the job description here for a more personalized cover letter..."
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Adding the job description helps create a more targeted cover letter.
              </p>
            </div>
          </div>

          <div className="rounded-xl p-6 bg-card/60 border border-border/50">
            <h2 className="text-lg font-semibold text-foreground mb-4">Customization</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="form-label">Tone</label>
                <Dropdown
                  options={[
                    { value: "professional", label: "Professional" },
                    { value: "enthusiastic", label: "Enthusiastic" },
                    { value: "creative", label: "Creative" },
                    { value: "formal", label: "Formal" },
                  ]}
                  value={formData.tone}
                  onChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="form-label">Length</label>
                <Dropdown
                  options={[
                    { value: "short", label: "Short (200-300 words)" },
                    { value: "medium", label: "Medium (300-400 words)" },
                    { value: "long", label: "Long (400-500 words)" },
                  ]}
                  value={formData.length}
                  onChange={(value) => setFormData(prev => ({ ...prev, length: value }))}
                  disabled={isGenerating}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Custom Instructions</label>
              <textarea
                name="customInstructions"
                value={formData.customInstructions}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
                placeholder="Any specific points you'd like to highlight or mention..."
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Job Tracking Section */}
          <div className="rounded-xl p-6 bg-card/60 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Job Application Tracking</h2>
                <p className="text-sm text-muted-foreground">Optionally track this job application in your dashboard</p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={createJobApplication}
                  onChange={(e) => setCreateJobApplication(e.target.checked)}
                  className="w-4 h-4 text-primary bg-card border-border rounded focus:ring-primary focus:ring-2"
                  disabled={isGenerating}
                />
                <span className="ml-2 text-sm font-medium text-secondary-foreground">Track this application</span>
              </label>
            </div>

            {createJobApplication && (
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Job URL</label>
                    <input
                      type="url"
                      name="jobUrl"
                      value={jobApplicationData.jobUrl}
                      onChange={handleJobApplicationChange}
                      className="input-field"
                      placeholder="https://company.com/jobs/123"
                      disabled={isGenerating}
                    />
                  </div>
                  <div>
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={jobApplicationData.location}
                      onChange={handleJobApplicationChange}
                      className="input-field"
                      placeholder="e.g., San Francisco, CA"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Salary</label>
                    <input
                      type="text"
                      name="salary"
                      value={jobApplicationData.salary}
                      onChange={handleJobApplicationChange}
                      className="input-field"
                      placeholder="e.g., $120,000 - $150,000"
                      disabled={isGenerating}
                    />
                  </div>
                  <div>
                    <label className="form-label">Job Type</label>
                    <Dropdown
                      options={[
                        { value: "full-time", label: "Full-time" },
                        { value: "part-time", label: "Part-time" },
                        { value: "contract", label: "Contract" },
                        { value: "internship", label: "Internship" },
                        { value: "freelance", label: "Freelance" },
                      ]}
                      value={jobApplicationData.jobType}
                      onChange={(value) => setJobApplicationData(prev => ({ ...prev, jobType: value }))}
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Notes</label>
                  <textarea
                    name="notes"
                    value={jobApplicationData.notes}
                    onChange={handleJobApplicationChange}
                    rows={3}
                    className="input-field"
                    placeholder="Any notes about this application..."
                    disabled={isGenerating}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl p-6 bg-card/60 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Cost</h3>
                <p className="text-sm text-muted-foreground">This will use 2 credits from your account</p>
                {!hasEnoughCredits && (
                  <p className="text-sm text-destructive mt-1">
                    Insufficient credits. You need at least 2 credits to generate a cover letter.
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">2 Credits</p>
                <p className={`text-sm ${hasEnoughCredits ? 'text-muted-foreground' : 'text-destructive'}`}>
                  Remaining: {userProfile?.credits || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Link
              href="/dashboard/cover-letters"
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isGenerating || !formData.jobTitle || !formData.companyName || !hasEnoughCredits || resumes.length === 0}
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                  <span>Generating...</span>
                </div>
              ) : !hasEnoughCredits ? (
                "Insufficient Credits"
              ) : resumes.length === 0 ? (
                "No Resumes Available"
              ) : (
                "Generate Cover Letter"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
