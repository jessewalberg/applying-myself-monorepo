"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@applyingmyself/convex-client";
import { type GenericId as Id } from "convex/values";
import { Copy, Download, RotateCcw, Save, ArrowLeft, Sparkles, FileText, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@applyingmyself/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@applyingmyself/ui/components/card";
import { Textarea } from "@applyingmyself/ui/components/textarea";
import { Input } from "@applyingmyself/ui/components/input";
import { Label } from "@applyingmyself/ui/components/label";
import { Badge } from "@applyingmyself/ui/components/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@applyingmyself/ui/components/select";
import { useCopyToClipboard } from "@applyingmyself/ui/hooks/useCopyToClipboard";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { homepageDraft } from "@/lib/homepageDraft";
import { captureWebEvent } from "@/lib/analytics";

type GenerateState = "idle" | "generating" | "done" | "error";

type ResumeListItem = {
  _id: string;
  filename: string;
  createdAt: number;
};

const EMPTY_RESUMES: ResumeListItem[] = [];

export function GenerateClient() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { copied, copy } = useCopyToClipboard();

  // Convex hooks — only active when signed in
  const ensureUserProfile = useMutation(api.userHelpers.ensureUserProfile);
  const generateCoverLetter = useMutation(api.coverLetters.generateFromForm);
  const retryCoverLetterGeneration = useMutation(api.coverLetters.retryGeneration);
  const [profileEnsured, setProfileEnsured] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      ensureUserProfile({}).then(() => setProfileEnsured(true));
    }
  }, [isSignedIn, ensureUserProfile]);

  useEffect(() => {
    captureWebEvent("generate_viewed", {
      signed_in: isSignedIn,
    });
  }, [isSignedIn]);

  const resumesQuery = useQuery(
    api.resumes.getResumes,
    isSignedIn && profileEnsured ? {} : "skip"
  );
  const resumes = resumesQuery?.resumes ?? EMPTY_RESUMES;
  const userProfile = useQuery(
    api.userHelpers.getUserProfile,
    isSignedIn && profileEnsured ? {} : "skip"
  );

  // Convex mutations for resume upload from homepage
  const uploadResume = useMutation(api.resumes.upload);
  const completeUpload = useMutation(api.resumes.completeUpload);

  // Form state
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [trackApplication, setTrackApplication] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [state, setState] = useState<GenerateState>("idle");
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const logGenerate = (event: string, details: Record<string, unknown> = {}) => {
    console.info(`[web.generate] ${event}`, details);
  };

  // Pending resume file carried from homepage (for users who aren't signed in yet)
  const [pendingResumeFile, setPendingResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeUploadDone, setResumeUploadDone] = useState(false);

  // Consume draft data from homepage on mount
  useEffect(() => {
    const draft = homepageDraft.consume();
    if (draft.jobDescription) {
      setJobDescription(draft.jobDescription);
    }
    if (draft.resumeFile) {
      setPendingResumeFile(draft.resumeFile);
    }
  }, []);

  // Auto-upload pending resume once the user is signed in
  useEffect(() => {
    if (!pendingResumeFile || !isSignedIn || !profileEnsured || resumeUploading || resumeUploadDone) return;

    const doUpload = async () => {
      setResumeUploading(true);
      try {
        const file = pendingResumeFile;
        const { uploadUrl } = await uploadResume({
          filename: file.name.replace(/\.[^/.]+$/, ""),
          fileSize: file.size,
          mimeType: file.type,
        });

        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) throw new Error(`Upload failed: ${result.statusText}`);

        const { storageId } = await result.json();
        const { resumeId } = await completeUpload({
          filename: file.name.replace(/\.[^/.]+$/, ""),
          fileSize: file.size,
          mimeType: file.type,
          storageId,
        });

        setSelectedResumeId(resumeId);
        setResumeUploadDone(true);
        captureWebEvent("resume_auto_upload_succeeded", {
          file_type: file.type || "unknown",
          file_size: file.size,
        });
      } catch (err) {
        console.error("Auto-upload failed:", err);
        captureWebEvent("resume_auto_upload_failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        // Don't block the user — they can still pick a resume manually
      } finally {
        setResumeUploading(false);
        setPendingResumeFile(null);
      }
    };

    doUpload();
  }, [pendingResumeFile, isSignedIn, profileEnsured, resumeUploading, resumeUploadDone, uploadResume, completeUpload]);

  // Auto-select most recent resume (if we didn't just upload one)
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      const mostRecent = resumes.reduce((a: (typeof resumes)[number], b: (typeof resumes)[number]) =>
        a.createdAt > b.createdAt ? a : b
      );
      setSelectedResumeId(mostRecent._id);
    }
  }, [resumes, selectedResumeId]);

  const handleGenerate = async () => {
    if (!isSignedIn) {
      captureWebEvent("generate_redirected_to_login");
      router.push("/login?redirect=/generate");
      return;
    }

    if (!selectedResumeId || !jobTitle.trim() || !companyName.trim()) {
      setErrorMsg("Please fill in job title, company name, and select a resume.");
      return;
    }

    captureWebEvent("generate_started", {
      tone,
      length,
      has_job_description: Boolean(jobDescription.trim()),
      track_application: trackApplication,
    });
    logGenerate("started", {
      tone,
      length,
      company: companyName.trim(),
      jobTitle: jobTitle.trim(),
      hasJobDescription: Boolean(jobDescription.trim()),
      trackApplication,
    });

    setState("generating");
    setErrorMsg("");
    setGeneratedContent("");

    try {
      const result = await generateCoverLetter({
        resumeId: selectedResumeId as Id<"resumes">,
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim(),
        jobDescription: jobDescription.trim() || undefined,
        preferences: {
          tone: tone as "professional" | "casual" | "enthusiastic",
          length: length as "short" | "medium" | "long",
        },
        createJobApplication: trackApplication,
      });

      setGeneratedId(result.coverLetter._id);
      setState("generating");
      logGenerate("queued", {
        coverLetterId: result.coverLetter._id,
        generationStatus: result.coverLetter.generationStatus,
      });
      captureWebEvent("generate_requested", {
        tone,
        length,
        track_application: trackApplication,
      });
    } catch (error: unknown) {
      setState("error");
      logGenerate("request_failed", {
        error: error instanceof Error ? error.message : "unknown",
      });
      captureWebEvent("generate_failed", {
        error: error instanceof Error ? error.message : "unknown",
      });
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Failed to generate. Please try again."
      );
    }
  };

  // Poll for generated content
  const coverLetterQuery = useQuery(
    api.coverLetters.getCoverLetter,
    generatedId ? { coverLetterId: generatedId as Id<"coverLetters"> } : "skip"
  );

  useEffect(() => {
    if (!coverLetterQuery) {
      return;
    }

    logGenerate("status_update", {
      coverLetterId: coverLetterQuery._id,
      generationStatus: coverLetterQuery.generationStatus,
      generationAttempts: coverLetterQuery.generationAttempts,
    });

    if (coverLetterQuery.generationStatus === "failed") {
      setState("error");
      setGeneratedContent("");
      setErrorMsg(
        coverLetterQuery.generationError ||
          "Cover letter generation failed. Retry to try again."
      );
      captureWebEvent("generate_failed", {
        cover_letter_id: coverLetterQuery._id,
        error:
          coverLetterQuery.generationError || "cover_letter_generation_failed",
      });
      return;
    }

    if (coverLetterQuery.generationStatus === "completed" && coverLetterQuery.content) {
      setGeneratedContent(coverLetterQuery.content);
      setState("done");
      setErrorMsg("");
      captureWebEvent("generate_completed", {
        cover_letter_id: coverLetterQuery._id,
        company: companyName.trim() || undefined,
      });
      return;
    }

    setState("generating");
  }, [companyName, coverLetterQuery]);

  const handleRetry = async () => {
    if (!generatedId) {
      await handleGenerate();
      return;
    }

    setState("generating");
    setErrorMsg("");
    setGeneratedContent("");
    logGenerate("retry_started", { coverLetterId: generatedId });
    captureWebEvent("generate_retry_started", {
      cover_letter_id: generatedId,
    });

    try {
      const result = await retryCoverLetterGeneration({
        coverLetterId: generatedId as Id<"coverLetters">,
      });
      setGeneratedId(result.coverLetter._id);
      setState("generating");
      logGenerate("retry_queued", {
        coverLetterId: result.coverLetter._id,
        generationAttempts: result.coverLetter.generationAttempts,
      });
    } catch (error: unknown) {
      setState("error");
      const message =
        error instanceof Error ? error.message : "Failed to retry generation.";
      setErrorMsg(message);
      logGenerate("retry_failed", {
        coverLetterId: generatedId,
        error: message,
      });
      captureWebEvent("generate_retry_failed", {
        cover_letter_id: generatedId,
        error: message,
      });
    }
  };

  const hasCredits = (userProfile?.credits || 0) >= 2;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              Generate a cover letter<span className="text-primary">.</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Fill in the details and we&apos;ll create a personalized letter for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8">
            {/* LEFT — Form */}
            <div className="space-y-6">
              {/* Job info */}
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Job Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Job Title *</Label>
                    <Input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g., Senior Frontend Engineer"
                      className="mt-1.5"
                      disabled={state === "generating"}
                    />
                  </div>
                  <div>
                    <Label>Company *</Label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g., Linear"
                      className="mt-1.5"
                      disabled={state === "generating"}
                    />
                  </div>
                  <div>
                    <Label>Job Description</Label>
                    <Textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description for a more personalized result..."
                      className="mt-1.5 min-h-[120px]"
                      disabled={state === "generating"}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Resume + options */}
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pending resume upload indicator */}
                  {resumeUploading && (
                    <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      <span className="text-sm text-foreground">Uploading your resume...</span>
                    </div>
                  )}
                  {resumeUploadDone && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 p-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-foreground">Resume uploaded from homepage</span>
                    </div>
                  )}
                  {/* Not-signed-in user with a pending file */}
                  {!isSignedIn && pendingResumeFile && (
                    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/70 p-3">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        <span className="text-foreground font-medium">{pendingResumeFile.name}</span>
                        {" "}&mdash;{" "}
                        <Link href="/login?redirect=/generate" className="text-primary hover:underline">
                          sign in
                        </Link>{" "}
                        to upload and generate.
                      </span>
                    </div>
                  )}
                  {isSignedIn && resumes.length > 0 ? (
                    <div>
                      <Label>Resume</Label>
                      <Select
                        value={selectedResumeId}
                        onValueChange={setSelectedResumeId}
                        disabled={state === "generating" || resumeUploading}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select a resume" />
                        </SelectTrigger>
                        <SelectContent>
                          {resumes.map((r: (typeof resumes)[number]) => (
                            <SelectItem key={r._id} value={r._id}>
                              {r.filename}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : isSignedIn && !resumeUploading ? (
                    <div className="text-sm text-muted-foreground">
                      No resumes uploaded.{" "}
                      <Link
                        href="/dashboard/resumes/upload"
                        className="text-primary hover:underline"
                      >
                        Upload one
                      </Link>{" "}
                      to get started.
                    </div>
                  ) : !isSignedIn && !pendingResumeFile ? (
                    <div className="text-sm text-muted-foreground">
                      <Link
                        href="/login?redirect=/generate"
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </Link>{" "}
                      to select a resume and generate.
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tone</Label>
                      <Select
                        value={tone}
                        onValueChange={setTone}
                        disabled={state === "generating"}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Length</Label>
                      <Select
                        value={length}
                        onValueChange={setLength}
                        disabled={state === "generating"}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {isSignedIn && (
                    <div className="rounded-lg border border-border/60 bg-background/70 p-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          checked={trackApplication}
                          onChange={(e) => setTrackApplication(e.target.checked)}
                          disabled={state === "generating"}
                        />
                        <span className="text-sm text-secondary-foreground">
                          Track this in Job Applications
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            Automatically creates a job application entry after generation.
                          </span>
                        </span>
                      </label>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Generate button */}
              {errorMsg && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-sm text-destructive">{errorMsg}</p>
                  {generatedId ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      disabled={state === "generating"}
                      className="mt-3 gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retry generation
                    </Button>
                  ) : null}
                </div>
              )}

              {isSignedIn && !hasCredits && (
                <p className="text-sm text-destructive">
                  Insufficient credits. You need at least 2 credits.{" "}
                  <Link
                    href="/dashboard/billing"
                    className="text-primary hover:underline"
                  >
                    Get more
                  </Link>
                </p>
              )}

              <Button
                onClick={handleGenerate}
                disabled={
                  state === "generating" ||
                  (isSignedIn && (!hasCredits || resumes.length === 0))
                }
                size="lg"
                className="w-full gap-2"
              >
                {state === "generating" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Cover Letter
                  </>
                )}
              </Button>

              {isSignedIn && (
                <p className="text-xs text-muted-foreground text-center">
                  Cost: 2 credits &middot; Remaining:{" "}
                  {userProfile?.credits ?? "..."}
                </p>
              )}
            </div>

            {/* RIGHT — Output area */}
            <div>
              {state === "idle" && !generatedContent && (
                <Card className="bg-card/30 border-dashed border-border/40 min-h-[500px] flex items-center justify-center">
                  <CardContent className="text-center py-16">
                    <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">
                      Your cover letter will appear here
                    </p>
                    <p className="text-muted-foreground/60 text-xs mt-1">
                      Fill in the details on the left and hit generate
                    </p>
                  </CardContent>
                </Card>
              )}

              {state === "generating" && !generatedContent && (
                <Card className="bg-card/60 backdrop-blur-sm border-border/50 min-h-[500px]">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                        Generating
                      </span>
                    </div>
                    <div className="space-y-3">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-4 bg-muted/50 rounded animate-pulse"
                          style={{
                            width: `${60 + Math.random() * 40}%`,
                            animationDelay: `${i * 100}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {(generatedContent || state === "error") && (
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  {generatedContent && (
                    <>
                      {/* Toolbar */}
                      <div className="flex items-center gap-2 px-6 py-3 border-b border-border/40">
                        <Badge variant="outline" className="text-xs gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Complete
                        </Badge>
                        <div className="flex-1" />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copy(generatedContent)}
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const blob = new Blob([generatedContent], {
                              type: "text/plain",
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `cover-letter-${companyName || "draft"}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setState("idle");
                            setGeneratedContent("");
                            setGeneratedId(null);
                          }}
                          title="Regenerate"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        {isSignedIn && generatedId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(
                                `/dashboard/cover-letters/${generatedId}`
                              )
                            }
                            title="View in dashboard"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <CardContent className="p-8">
                        <div className="font-mono text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap">
                          {generatedContent}
                        </div>
                      </CardContent>

                      {copied && (
                        <div className="px-6 pb-4">
                          <Badge variant="secondary" className="text-xs">
                            Copied to clipboard
                          </Badge>
                        </div>
                      )}
                    </>
                  )}

                  {state === "error" && !generatedContent && (
                    <CardContent className="p-8 text-center">
                      <p className="text-destructive text-sm mb-4">
                        {errorMsg || "Something went wrong."}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setState("idle")}
                      >
                        Try again
                      </Button>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Sign up prompt for anonymous users post-generation */}
              {!isSignedIn && generatedContent && (
                <Card className="mt-4 bg-primary/5 border-primary/20">
                  <CardContent className="p-4 flex items-center justify-between">
                    <p className="text-sm text-foreground">
                      Sign up to save your cover letters and track applications.
                    </p>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/register">Sign up free</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
