"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@applyingmyself/convex-client";
import { type GenericId as Id } from "convex/values";
import {
  FileText,
  Copy,
  Trash2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@applyingmyself/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@applyingmyself/ui/components/card";
import { Badge } from "@applyingmyself/ui/components/badge";
import { Skeleton } from "@applyingmyself/ui/components/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@applyingmyself/ui/components/dialog";
import { Separator } from "@applyingmyself/ui/components/separator";
import { useCopyToClipboard } from "@applyingmyself/ui/hooks/useCopyToClipboard";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export function HistoryClient() {
  const { isSignedIn, isLoaded } = useAuth();
  const { copied, copy } = useCopyToClipboard();
  const ensureUserProfile = useMutation(api.userHelpers.ensureUserProfile);
  const deleteCoverLetter = useMutation(api.coverLetters.deleteCoverLetter);
  const [profileEnsured, setProfileEnsured] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      ensureUserProfile({}).then(() => setProfileEnsured(true));
    }
  }, [isSignedIn, ensureUserProfile]);

  const coverLettersQuery = useQuery(
    api.coverLetters.getCoverLetters,
    isSignedIn && profileEnsured ? {} : "skip"
  );
  const coverLetters = coverLettersQuery?.coverLetters || [];
  const isLoading = isSignedIn && coverLettersQuery === undefined;

  const selectedLetter = coverLetters.find((l: (typeof coverLetters)[number]) => l._id === selectedId);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this cover letter?")) return;
    await deleteCoverLetter({ coverLetterId: id as Id<"coverLetters"> });
    if (selectedId === id) setSelectedId(null);
  };

  // Not signed in
  if (isLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <main className="pt-32 pb-16 px-6 text-center">
          <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="font-display text-3xl text-foreground mb-3">
            Sign in to view your history
          </h1>
          <p className="text-muted-foreground mb-8">
            Your generated cover letters are saved to your account.
          </p>
          <Button asChild>
            <Link href="/login?redirect=/history">Sign in</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
              <h1 className="font-display text-3xl md:text-4xl text-foreground">
                Your cover letters<span className="text-primary">.</span>
              </h1>
              <p className="mt-2 text-muted-foreground">
                {coverLetters.length} letter{coverLetters.length !== 1 ? "s" : ""}{" "}
                generated
              </p>
            </div>
            <Button asChild>
              <Link href="/generate" className="gap-2">
                <Sparkles className="w-4 h-4" />
                New Letter
              </Link>
            </Button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-card/40 border-border/30">
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                    <Separator className="my-3" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && coverLetters.length === 0 && (
            <Card className="bg-card/30 border-dashed border-border/40">
              <CardContent className="py-20 text-center">
                <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  No cover letters yet
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Generate your first cover letter and it will appear here for
                  easy access.
                </p>
                <Button asChild>
                  <Link href="/generate">Generate Your First Letter</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Grid */}
          {!isLoading && coverLetters.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coverLetters.map((letter: (typeof coverLetters)[number]) => {
                const isGenerating =
                  letter.content ===
                  "Generating your personalized cover letter...";
                const date = new Date(
                  letter.createdAt || letter._creationTime
                );

                return (
                  <Card
                    key={letter._id}
                    className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-border transition-all cursor-pointer group"
                    onClick={() => setSelectedId(letter._id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">
                            {letter.jobTitle || "Cover Letter"}
                          </CardTitle>
                          <CardDescription className="truncate">
                            {letter.company || "Unknown Company"}
                          </CardDescription>
                        </div>
                        {isGenerating ? (
                          <Badge
                            variant="outline"
                            className="text-xs gap-1 shrink-0"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Generating
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs gap-1 shrink-0"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Done
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3">
                        {date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-secondary-foreground line-clamp-3">
                        {isGenerating
                          ? "Your cover letter is being generated..."
                          : letter.content}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Dialog for full letter view */}
      <Dialog
        open={!!selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedLetter?.jobTitle || "Cover Letter"}
            </DialogTitle>
            <DialogDescription>
              {selectedLetter?.company || "Unknown Company"} &middot;{" "}
              {selectedLetter &&
                new Date(
                  selectedLetter.createdAt || selectedLetter._creationTime
                ).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
            </DialogDescription>
          </DialogHeader>

          <Separator />

          {selectedLetter && (
            <div className="font-mono text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap py-4">
              {selectedLetter.content}
            </div>
          )}

          <Separator />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => selectedLetter && copy(selectedLetter.content)}
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={() => selectedId && handleDelete(selectedId)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  );
}
