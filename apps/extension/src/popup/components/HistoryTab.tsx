import React, { useState, useEffect } from "react";
import {
  FileText,
  Eye,
  Download,
  AlertCircle,
  Copy,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  Briefcase,
  Plus,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useHistoryData } from "@/features/history/useHistoryData";
import CONFIG from "@/config";
import { copyDocumentToClipboard } from "@/utils/documentGenerator";
import type { HistoryTabProps, CoverLetter } from "@/types";

const HistoryTab: React.FC<HistoryTabProps> = ({ user, refreshTrigger }) => {
  const {
    coverLetters,
    jobApplications,
    extractedJobs,
    loadHistory: loadHistoryData,
  } = useHistoryData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(
    null
  );
  const [activeView, setActiveView] = useState<
    "cover-letters" | "applications"
  >("cover-letters");

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading user data...</p>
      </div>
    );
  }

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");
      await loadHistoryData();
    } catch (err: unknown) {
      console.error("Failed to load history:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load history"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDashboard = (section: "cover-letters" | "jobs") => {
    const path =
      section === "cover-letters"
        ? "/dashboard/cover-letters"
        : "/dashboard/jobs";
    window.open(`${CONFIG.SITE_URL}${path}`, "_blank");
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      applied: {
        label: "Applied",
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      },
      interviewing: {
        label: "Interviewing",
        className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      },
      offered: {
        label: "Offered",
        className: "bg-green-500/10 text-green-400 border-green-500/20",
      },
      rejected: {
        label: "Rejected",
        className: "bg-red-500/10 text-red-400 border-red-500/20",
      },
      withdrawn: {
        label: "Withdrawn",
        className: "bg-secondary text-muted-foreground border-border",
      },
    };
    return map[status] || map.withdrawn;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-primary animate-spin mb-2" />
        <p className="text-xs text-muted-foreground">Loading history...</p>
      </div>
    );
  }

  if (selectedLetter) {
    return (
      <LetterViewer
        letter={selectedLetter}
        onBack={() => setSelectedLetter(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-foreground">Your History</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Cover letters and job applications
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex rounded-md border border-border bg-secondary/50 p-0.5">
        <button
          onClick={() => setActiveView("cover-letters")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors ${
            activeView === "cover-letters"
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-3 h-3" />
          Letters ({coverLetters.length})
        </button>
        <button
          onClick={() => setActiveView("applications")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors ${
            activeView === "applications"
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Briefcase className="w-3 h-3" />
          Jobs ({jobApplications.length + extractedJobs.length})
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() =>
            handleOpenDashboard(
              activeView === "cover-letters" ? "cover-letters" : "jobs"
            )
          }
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-border bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Full Dashboard
        </button>
        {activeView === "applications" && (
          <button
            onClick={() => handleOpenDashboard("jobs")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
          <button
            onClick={loadHistory}
            className="ml-auto text-xs font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Cover Letters View */}
      {activeView === "cover-letters" && (
        <>
          {coverLetters.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No cover letters yet"
              description="Generate your first cover letter using the Generate tab"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {coverLetters.map((letter) => (
                <div
                  key={letter.id}
                  className="rounded-md border border-border bg-card p-3 hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedLetter(letter)}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {letter.jobTitle || "Untitled Position"}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {letter.company || "Company"}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span>
                          {new Date(
                            letter.createdAt || Date.now()
                          ).toLocaleDateString()}
                        </span>
                        <span>{letter.creditsUsed || 0} credits</span>
                      </div>
                    </div>
                    <button
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Jobs View */}
      {activeView === "applications" && (
        <>
          {jobApplications.length === 0 && extractedJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs yet"
              description="Extract jobs from postings or track applications"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {jobApplications.map((app) => {
                const badge = getStatusBadge(app.status || "applied");
                return (
                  <div
                    key={`app-${app._id}`}
                    className="rounded-md border border-border bg-card p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-foreground truncate">
                          {app.jobTitle || "Untitled Position"}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          {app.companyName || "Company"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-muted-foreground">
                            {app.appliedDate
                              ? new Date(
                                  app.appliedDate
                                ).toLocaleDateString()
                              : "No date"}
                          </span>
                          {app.status && (
                            <span
                              className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold border ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenDashboard("jobs")}
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title="View in dashboard"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {extractedJobs.map((job) => (
                <div
                  key={`job-${job._id}`}
                  className="rounded-md border border-border bg-card p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {job.title || "Untitled Job"}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {job.company || "Unknown Company"}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(job.extractedAt).toLocaleDateString()}
                        </span>
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                          Extracted
                        </span>
                        {job.confidence && (
                          <span className="text-[10px] text-muted-foreground">
                            {Math.round(job.confidence * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenDashboard("jobs")}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ---------- Sub-components ---------- */

const EmptyState: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => (
  <div className="text-center py-8">
    <Icon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
    <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

interface LetterViewerProps {
  letter: CoverLetter;
  onBack: () => void;
}

const LetterViewer: React.FC<LetterViewerProps> = ({ letter, onBack }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const handleCopy = async () => {
    try {
      await copyDocumentToClipboard(letter.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownloadGoogleDoc = async () => {
    try {
      await copyDocumentToClipboard(letter.content);
      chrome.tabs.create({ url: "https://docs.google.com/document/create" });
      setShowDownloadOptions(false);
      alert(
        "Your cover letter has been copied.\n\nGoogle Docs will open a new blank document in a new tab.\nPaste (Ctrl+V / Cmd+V) to insert it."
      );
    } catch (err) {
      console.error("Failed:", err);
    }
  };

  const handleDownloadWord = async () => {
    try {
      const { generateDocx, generateCoverLetterFilename } = await import(
        "@/utils/documentGenerator"
      );
      const filename = generateCoverLetterFilename(
        letter.company || undefined,
        letter.jobTitle || undefined,
        "docx"
      );
      await generateDocx({
        title: `Cover Letter - ${letter.jobTitle || "Position"}`,
        company: letter.company || undefined,
        content: letter.content,
        createdAt: new Date(letter.createdAt).getTime(),
        filename,
      });
      setShowDownloadOptions(false);
    } catch (err) {
      console.error("Failed:", err);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const { generatePdf, generateCoverLetterFilename } = await import(
        "@/utils/documentGenerator"
      );
      const filename = generateCoverLetterFilename(
        letter.company || undefined,
        letter.jobTitle || undefined,
        "pdf"
      );
      await generatePdf({
        title: `Cover Letter - ${letter.jobTitle || "Position"}`,
        company: letter.company || undefined,
        content: letter.content,
        createdAt: new Date(letter.createdAt).getTime(),
        filename,
      });
      setShowDownloadOptions(false);
    } catch (err) {
      console.error("Failed:", err);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <div className="flex gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            {copySuccess ? (
              <>
                <CheckCircle className="w-3 h-3 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
          <div className="download-dropdown relative">
            <button
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <Download className="w-3 h-3" />
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
            {showDownloadOptions && (
              <div className="absolute top-full mt-1 right-0 w-40 rounded-md border border-border bg-popover shadow-lg z-10">
                <button
                  onClick={handleDownloadGoogleDoc}
                  className="w-full text-left px-3 py-2 text-xs text-popover-foreground hover:bg-secondary transition-colors"
                >
                  Copy + Open Docs
                </button>
                <button
                  onClick={handleDownloadWord}
                  className="w-full text-left px-3 py-2 text-xs text-popover-foreground hover:bg-secondary border-t border-border transition-colors"
                >
                  Word (.docx)
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="w-full text-left px-3 py-2 text-xs text-popover-foreground hover:bg-secondary border-t border-border transition-colors"
                >
                  PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Letter info */}
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          {letter.jobTitle || "Untitled Position"}
        </h3>
        <p className="text-xs text-muted-foreground">
          {letter.company || "Company"}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          Generated{" "}
          {new Date(letter.createdAt || Date.now()).toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <textarea
        value={letter.content}
        readOnly
        rows={14}
        className="w-full text-xs leading-relaxed rounded-md bg-background border border-border text-foreground p-3 resize-y font-mono focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
};

export default HistoryTab;
