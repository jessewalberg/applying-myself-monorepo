"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@applyingmyself/convex-client";
import { type GenericId as Id } from "convex/values";
import { Copy, Download, RotateCcw, Save, ArrowLeft, Sparkles, FileText } from "lucide-react";
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
import { Separator } from "@applyingmyself/ui/components/separator";
import { useCopyToClipboard } from "@applyingmyself/ui/hooks/useCopyToClipboard";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";

type GenerateState = "idle" | "generating" | "done" | "error";

export function GenerateClient() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { copied, copy } = useCopyToClipboard();

  // Convex hooks — only active when signed in
  const ensureUserProfile = useMutation(api.userHelpers.ensureUserProfile);
  const generateCoverLetter = useMutation(api.coverLetters.generateFromForm);
  const [profileEnsured, setProfileEnsured] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      ensureUserProfile({}).then(() => setProfileEnsured(true));
    }
  }, [isSignedIn, ensureUserProfile]);

  const resumesQuery = useQuery(
    api.resumes.getResumes,
    isSignedIn && profileEnsured ? {} : "skip"
  );
  const resumes = resumesQuery?.resumes || [];
  const userProfile = useQuery(
    api.userHelpers.getUserProfile,
    isSignedIn && profileEnsured ? {} : "skip"
  );

  // Form state
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [state, setState] = useState<GenerateState>("idle");
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-select most recent resume
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
      router.push("/login?redirect=/generate");
      return;
    }

    if (!selectedResumeId || !jobTitle.trim() || !companyName.trim()) {
      setErrorMsg("Please fill in job title, company name, and select a resume.");
      return;
    }

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
        createJobApplication: false,
      });

      setGeneratedId(result.coverLetter._id);
      // The cover letter content is generated async by an AI action.
      // We'll poll for it via the cover letter query below.
      setState("done");
    } catch (error: unknown) {
      setState("error");
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
    if (coverLetterQuery && coverLetterQuery.content) {
      const isPlaceholder =
        coverLetterQuery.content === "Generating your personalized cover letter...";
      if (!isPlaceholder) {
        setGeneratedContent(coverLetterQuery.content);
      }
    }
  }, [coverLetterQuery]);

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
                  {isSignedIn && resumes.length > 0 ? (
                    <div>
                      <Label>Resume</Label>
                      <Select
                        value={selectedResumeId}
                        onValueChange={setSelectedResumeId}
                        disabled={state === "generating"}
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
                  ) : isSignedIn ? (
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
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      <Link
                        href="/login?redirect=/generate"
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </Link>{" "}
                      to select a resume and generate.
                    </div>
                  )}

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
                </CardContent>
              </Card>

              {/* Generate button */}
              {errorMsg && (
                <p className="text-sm text-destructive">{errorMsg}</p>
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
