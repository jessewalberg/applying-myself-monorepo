import React, { useState, useEffect } from "react";
import {
  Globe,
  FileText,
  Download,
  Copy,
  Check,
  CheckCircle,
  AlertCircle,
  Upload,
  Briefcase,
  RefreshCw,
  ChevronDown,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { convexApi } from "@/services/convexApi";
import type {
  GenerateTabProps,
  Resume,
  ExtractedContent,
  User,
} from "@/types";
import { useResumeLibrary } from "@/features/generate/hooks/useResumeLibrary";
import { useExtractJob } from "@/features/generate/hooks/useExtractJob";
import { useGenerateCoverLetter } from "@/features/generate/hooks/useGenerateCoverLetter";

type ApplicationStatus =
  | "applied"
  | "interviewing"
  | "offered"
  | "rejected"
  | "withdrawn";

const GenerateTab: React.FC<GenerateTabProps> = ({ user, onUserUpdate }) => {
  const [step, setStep] = useState(1);
  const {
    resumes,
    selectedResume,
    setSelectedResume,
    loadResumes,
    uploadResume,
    getDownloadUrl,
  } = useResumeLibrary();
  const {
    extractedData,
    extractedJobId,
    setExtractedData,
    checkForExtractedContent,
    extractFromActiveTab,
  } = useExtractJob();
  const { generate } = useGenerateCoverLetter();
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  // Job tracking state
  const [trackApplication, setTrackApplication] = useState(false);
  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatus>("applied");
  const [applicationNotes, setApplicationNotes] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading user data...</p>
      </div>
    );
  }

  useEffect(() => {
    void loadResumes();
    void checkForExtractedContent().then((snapshot) => {
      if (snapshot) {
        setStep(2);
      }
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".download-dropdown")) {
        setShowDownloadOptions(false);
      }
    };
    if (showDownloadOptions) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showDownloadOptions]);

  const handleExtractContent = async (): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const result = await extractFromActiveTab();
      onUserUpdate({ ...user, credits: result.remainingCredits });
      setStep(2);
    } catch (err: unknown) {
      console.error("Content extraction error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to extract content."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (file: File): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const uploadResult = await uploadResume(file);
      onUserUpdate({ ...user, credits: uploadResult.remainingCredits });
    } catch (err: unknown) {
      console.error("Failed to upload resume:", err);
      setError("Failed to upload resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async (): Promise<void> => {
    if (!selectedResume || !extractedData) {
      setError("Please select a resume and extract job content first.");
      return;
    }
    setLoading(true);
    setError("");
    setCoverLetter("Generating your personalized cover letter...");
    setStep(3);
    try {
      const response = await generate({
        selectedResume,
        extractedData,
        extractedJobId,
        trackApplication,
        applicationOptions: {
          status: applicationStatus,
          appliedDate: Date.now(),
          notes: applicationNotes,
          resumeId: selectedResume.id,
        },
        onProgress: (progressContent: string) => {
          setCoverLetter(progressContent);
        },
      });
      setCoverLetter(response.coverLetter.content);
      const updatedUserProfile = await convexApi.getUserProfile();
      if (updatedUserProfile) {
        const updatedUser: User = {
          id: updatedUserProfile._id,
          email: updatedUserProfile.email,
          name: updatedUserProfile.name,
          credits: updatedUserProfile.credits || 0,
          plan: updatedUserProfile.plan,
        };
        onUserUpdate(updatedUser);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate cover letter. Please try again."
      );
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      setError("Failed to copy to clipboard.");
    }
  };

  const handleDownloadAsGoogleDoc = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      chrome.tabs.create({ url: "https://docs.google.com/document/create" });
      setShowDownloadOptions(false);
      alert(
        "Cover letter copied to clipboard!\n\nGoogle Docs will open in a new tab.\nPaste (Ctrl+V / Cmd+V) your cover letter."
      );
    } catch (err) {
      console.error("Failed to open Google Docs:", err);
      setError("Failed to open Google Docs.");
    }
  };

  const handleDownloadAsWordDoc = async (): Promise<void> => {
    try {
      const { generateDocx, generateCoverLetterFilename } = await import(
        "@/utils/documentGenerator"
      );
      const filename = generateCoverLetterFilename(
        extractedData?.company,
        extractedData?.title,
        "docx"
      );
      await generateDocx({
        title: `Cover Letter - ${extractedData?.title || "Position"}`,
        company: extractedData?.company,
        content: coverLetter,
        createdAt: Date.now(),
        filename,
      });
      setShowDownloadOptions(false);
    } catch (err) {
      console.error("Failed to download Word document:", err);
      setError("Failed to download document.");
    }
  };

  const handleDownloadAsPdf = async (): Promise<void> => {
    try {
      const { generatePdf, generateCoverLetterFilename } = await import(
        "@/utils/documentGenerator"
      );
      const filename = generateCoverLetterFilename(
        extractedData?.company,
        extractedData?.title,
        "pdf"
      );
      await generatePdf({
        title: `Cover Letter - ${extractedData?.title || "Position"}`,
        company: extractedData?.company,
        content: coverLetter,
        createdAt: Date.now(),
        filename,
      });
      setShowDownloadOptions(false);
    } catch (err) {
      console.error("Failed to download PDF:", err);
      setError("Failed to download PDF.");
    }
  };

  const handleResumeDownload = async (resume: Resume): Promise<void> => {
    try {
      const downloadUrl = await getDownloadUrl(resume.id);
      if (downloadUrl) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = resume.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError("Failed to get download URL.");
      }
    } catch (err) {
      console.error("Failed to download resume:", err);
      setError("Failed to download resume.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Steps indicator */}
      <div className="flex justify-center gap-3 mb-2">
        {[1, 2, 3].map((stepNum) => (
          <div
            key={stepNum}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
              step === stepNum
                ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110"
                : step > stepNum
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
            }`}
          >
            {step > stepNum ? <Check className="w-3 h-3" /> : stepNum}
          </div>
        ))}
      </div>

      {/* Step 1: Extract */}
      {step === 1 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Extract Page Content
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Navigate to a job posting and extract details
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Navigate to any job posting webpage and click below to extract the
            job details for your cover letter.
          </p>
          <button
            onClick={handleExtractContent}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting...
              </>
            ) : (
              "Extract Current Page"
            )}
          </button>
        </div>
      )}

      {/* Step 2: Review & Select Resume */}
      {step === 2 && extractedData && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3 mb-4">
            <Briefcase className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Content Extracted
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review the extracted information
              </p>
            </div>
          </div>

          <ContentPreview data={extractedData} />

          {/* Job Tracking Toggle */}
          <div className="mt-4 rounded-md border border-border p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={trackApplication}
                onChange={(e) => setTrackApplication(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-xs font-medium text-foreground">
                Track as job application
              </span>
            </label>

            {trackApplication && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground w-14 shrink-0">
                    Status:
                  </label>
                  <select
                    value={applicationStatus}
                    onChange={(e) =>
                      setApplicationStatus(
                        e.target.value as ApplicationStatus
                      )
                    }
                    className="flex-1 text-xs rounded-md bg-background border border-border text-foreground px-2 py-1.5 focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offered">Offered</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
                <div className="flex items-start gap-2">
                  <label className="text-xs text-muted-foreground w-14 shrink-0 mt-1.5">
                    Notes:
                  </label>
                  <textarea
                    value={applicationNotes}
                    onChange={(e) => setApplicationNotes(e.target.value)}
                    placeholder="Add notes..."
                    rows={2}
                    className="flex-1 text-xs rounded-md bg-background border border-border text-foreground px-2 py-1.5 resize-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            )}
          </div>

          <ResumeSelector
            resumes={resumes}
            selectedResume={selectedResume}
            onResumeSelect={setSelectedResume}
            onResumeUpload={handleResumeUpload}
            onResumeDownload={handleResumeDownload}
            loading={loading}
          />

          <button
            onClick={handleGenerateCoverLetter}
            disabled={!selectedResume || loading}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Cover Letter (3 credits)"
            )}
          </button>
        </div>
      )}

      {/* Step 3: Cover Letter Result */}
      {step === 3 && coverLetter && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3 mb-4">
            <FileText className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {loading ? "Generating Cover Letter" : "Cover Letter Ready"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {loading
                  ? "AI is creating your personalized cover letter..."
                  : "Your personalized cover letter"}
              </p>
            </div>
          </div>

          {loading &&
            coverLetter.includes("Generating your personalized") && (
              <div className="flex items-center gap-2 mb-3 p-2 rounded-md bg-primary/5 border border-primary/10">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground">
                  Analyzing the job posting and your resume...
                </span>
              </div>
            )}

          <textarea
            value={coverLetter}
            readOnly
            rows={8}
            className={`w-full text-xs leading-relaxed rounded-md bg-background border border-border text-foreground p-3 resize-y font-mono focus:outline-none focus:ring-1 focus:ring-primary ${
              loading ? "opacity-60" : ""
            }`}
          />

          {!loading && (
            <>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCopyToClipboard}
                  disabled={copySuccess}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-border bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>

                <div className="download-dropdown relative flex-1">
                  <button
                    onClick={() =>
                      setShowDownloadOptions(!showDownloadOptions)
                    }
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showDownloadOptions && (
                    <div className="absolute bottom-full mb-1 left-0 right-0 rounded-md border border-border bg-popover shadow-lg z-10 overflow-hidden">
                      <button
                        onClick={handleDownloadAsGoogleDoc}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-popover-foreground hover:bg-secondary transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <div className="text-left">
                          <div className="font-medium">Google Docs</div>
                          <div className="text-muted-foreground text-[10px]">
                            Edit online
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={handleDownloadAsWordDoc}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-popover-foreground hover:bg-secondary transition-colors border-t border-border"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <div className="text-left">
                          <div className="font-medium">Word Document</div>
                          <div className="text-muted-foreground text-[10px]">
                            .docx format
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={handleDownloadAsPdf}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-popover-foreground hover:bg-secondary transition-colors border-t border-border"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <div className="text-left">
                          <div className="font-medium">PDF</div>
                          <div className="text-muted-foreground text-[10px]">
                            .pdf format
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setStep(1);
                  setExtractedData(null);
                  setCoverLetter("");
                }}
                className="w-full mt-2 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Extract Another Page
              </button>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};

/* ---------- Sub-components ---------- */

const ContentPreview: React.FC<{ data: ExtractedContent }> = ({ data }) => (
  <div className="rounded-md border border-border bg-background p-3 space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {data.domain}
      </span>
      {data.confidence !== undefined && (
        <span className="text-[10px] font-medium text-primary">
          {Math.round(data.confidence * 100)}% confidence
        </span>
      )}
    </div>
    {data.title && (
      <p className="text-xs font-semibold text-foreground">{data.title}</p>
    )}
    {data.company && (
      <p className="text-xs text-muted-foreground">{data.company}</p>
    )}
    {data.location && (
      <p className="text-[11px] text-muted-foreground">{data.location}</p>
    )}
    {data.description && (
      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
        {data.description.substring(0, 200)}...
      </p>
    )}
  </div>
);

interface ResumeSelectorProps {
  resumes: Resume[];
  selectedResume: Resume | null;
  onResumeSelect: (resume: Resume) => void;
  onResumeUpload: (file: File) => Promise<void>;
  onResumeDownload: (resume: Resume) => Promise<void>;
  loading: boolean;
}

const ResumeSelector: React.FC<ResumeSelectorProps> = ({
  resumes,
  selectedResume,
  onResumeSelect,
  onResumeUpload,
  onResumeDownload,
  loading,
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      onResumeUpload(file);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {/* Upload */}
      <div>
        <input
          type="file"
          id="resume-upload"
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
          disabled={loading}
        />
        <label
          htmlFor="resume-upload"
          className="flex items-center justify-center gap-2 p-3 rounded-md border-2 border-dashed border-border text-xs font-medium text-primary cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload New Resume
        </label>
      </div>

      {/* Resume list */}
      {resumes.length > 0 && (
        <div className="rounded-md border border-border overflow-hidden">
          <div className="px-3 pt-2 pb-1">
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Select Resume
            </h4>
          </div>
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className={`flex items-center justify-between px-3 py-2.5 border-t border-border cursor-pointer transition-colors ${
                selectedResume?.id === resume.id
                  ? "bg-primary/5 border-l-2 border-l-primary"
                  : "hover:bg-secondary/50"
              }`}
            >
              <div
                className="flex items-center gap-2 flex-1 min-w-0"
                onClick={() => onResumeSelect(resume)}
              >
                <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {resume.filename}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onResumeDownload(resume);
                }}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Download"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerateTab;
