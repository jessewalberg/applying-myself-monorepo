"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function NewCoverLetterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    tone: "professional",
    length: "medium",
    customInstructions: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      // TODO: Implement cover letter generation with Convex
      await new Promise(resolve => setTimeout(resolve, 3000)); // Mock delay
      console.log("Generating cover letter:", formData);
      
      // Redirect back to cover letters list
      router.push("/dashboard/cover-letters");
    } catch (error) {
      console.error("Error generating cover letter:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <Link
          href="/dashboard/cover-letters"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Cover Letters</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Generate Cover Letter</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create a personalized cover letter for your job application.
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleGenerate} className="space-y-6">
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
              <p className="text-xs text-gray-500 mt-1">
                Adding the job description helps create a more targeted cover letter.
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customization</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="form-label">Tone</label>
                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleInputChange}
                  className="input-field"
                  disabled={isGenerating}
                >
                  <option value="professional">Professional</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="creative">Creative</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
              <div>
                <label className="form-label">Length</label>
                <select
                  name="length"
                  value={formData.length}
                  onChange={handleInputChange}
                  className="input-field"
                  disabled={isGenerating}
                >
                  <option value="short">Short (200-300 words)</option>
                  <option value="medium">Medium (300-400 words)</option>
                  <option value="long">Long (400-500 words)</option>
                </select>
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

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cost</h3>
                <p className="text-sm text-gray-600">This will use 2 credits from your account</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">2 Credits</p>
                <p className="text-sm text-gray-500">Remaining: 8</p>
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
              className="btn-primary"
              disabled={isGenerating || !formData.jobTitle || !formData.companyName}
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </div>
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