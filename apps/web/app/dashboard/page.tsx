"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@applyingmyself/convex-client";
import { type GenericId as Id } from "convex/values";
import {
  CreditCard,
  FileText,
  Briefcase,
  ArrowUpRight,
  Plus,
  Upload,
  Sparkles,
  Clock3,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@applyingmyself/ui/components/card";
import { Button } from "@applyingmyself/ui/components/button";
import { Badge } from "@applyingmyself/ui/components/badge";

type CoverLetter = {
  _id: Id<"coverLetters">;
  _creationTime: number;
  createdAt?: number;
  jobTitle?: string;
  company?: string;
};

type JobApplication = {
  _id: Id<"jobApplications">;
  _creationTime: number;
  createdAt: number;
  updatedAt: number;
  appliedDate?: number;
  jobTitle: string;
  companyName: string;
  status?: "applied" | "interviewing" | "offered" | "rejected" | "withdrawn";
};

type ActivityItem = {
  type: "cover-letter" | "application";
  id: string;
  title: string;
  subtitle: string;
  timestamp: number;
  href: string;
  status?: JobApplication["status"];
};

const EMPTY_COVER_LETTERS: CoverLetter[] = [];
const EMPTY_JOB_APPLICATIONS: JobApplication[] = [];

const statusClassName: Record<NonNullable<JobApplication["status"]>, string> = {
  applied: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  interviewing: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  offered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  rejected: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  withdrawn: "bg-slate-500/15 text-slate-400 border-slate-500/20",
};

export default function DashboardPage() {
  const ensureUserProfile = useMutation(api.userHelpers.ensureUserProfile);
  const [profileEnsured, setProfileEnsured] = useState(false);

  useEffect(() => {
    ensureUserProfile({}).then(() => setProfileEnsured(true));
  }, [ensureUserProfile]);

  const userProfile = useQuery(api.userHelpers.getUserProfile, profileEnsured ? {} : "skip");
  const coverLettersQuery = useQuery(api.coverLetters.getCoverLetters, profileEnsured ? {} : "skip");
  const jobApplicationsQuery = useQuery(
    api.jobApplications.getJobApplications,
    profileEnsured ? {} : "skip"
  );

  const coverLetters: CoverLetter[] = coverLettersQuery?.coverLetters ?? EMPTY_COVER_LETTERS;
  const jobApplications: JobApplication[] =
    jobApplicationsQuery?.jobApplications ?? EMPTY_JOB_APPLICATIONS;
  const isLoading =
    !profileEnsured ||
    userProfile === undefined ||
    coverLettersQuery === undefined ||
    jobApplicationsQuery === undefined;

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const thisMonthCoverLetters = coverLetters.filter(
    (letter) => (letter.createdAt || letter._creationTime) >= thisMonth.getTime()
  ).length;
  const thisMonthApplications = jobApplications.filter(
    (app) => (app.appliedDate || app.updatedAt || app.createdAt || app._creationTime) >= thisMonth.getTime()
  ).length;

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const coverLetterItems: ActivityItem[] = coverLetters.map((letter) => ({
      type: "cover-letter",
      id: letter._id,
      title: letter.jobTitle || "Cover letter",
      subtitle: letter.company || "Generated cover letter",
      timestamp: letter.createdAt || letter._creationTime,
      href: `/dashboard/cover-letters/${letter._id}`,
    }));

    const applicationItems: ActivityItem[] = jobApplications.map((app) => ({
      type: "application",
      id: app._id,
      title: app.jobTitle,
      subtitle: app.companyName,
      timestamp: app.appliedDate || app.updatedAt || app.createdAt || app._creationTime,
      href: "/dashboard/jobs",
      status: app.status,
    }));

    return [...coverLetterItems, ...applicationItems]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8);
  }, [coverLetters, jobApplications]);

  const stats = [
    {
      name: "Available Credits",
      value: isLoading ? "..." : String(userProfile?.credits || 0),
      href: "/dashboard/billing",
      description: "View billing details",
      icon: CreditCard,
    },
    {
      name: "This Month Activity",
      value: isLoading ? "..." : String(thisMonthCoverLetters + thisMonthApplications),
      href: "/dashboard/billing",
      description: "Letters + applications",
      icon: Clock3,
    },
    {
      name: "Cover Letters",
      value: isLoading ? "..." : String(coverLetters.length),
      href: "/dashboard/cover-letters",
      description: "Manage generated letters",
      icon: FileText,
    },
    {
      name: "Applications",
      value: isLoading ? "..." : String(jobApplications.length),
      href: "/dashboard/jobs",
      description: "Track interview progress",
      icon: Briefcase,
    },
  ];

  const formatActivityTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground">
          Dashboard<span className="text-primary">.</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Overview of your credits, generated letters, and application pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="h-full bg-card/60 border-border/50 hover:border-border transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-semibold text-foreground mt-2">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1 bg-card/60 border-border/50">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump to your most common workflows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-between">
              <Link href="/generate">
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate cover letter
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/dashboard/resumes/upload">
                <span className="inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload resume
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/dashboard/jobs/new">
                <span className="inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add job application
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 bg-card/60 border-border/50">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Latest generated letters and application status updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading activity...</p>
            ) : recentActivity.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/50 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No recent activity yet. Generate your first cover letter to get started.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/generate">Generate first letter</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.href}
                    className="block rounded-lg border border-border/60 bg-background/60 px-4 py-3 hover:border-border transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {item.type === "application" ? "Application" : "Cover letter"} ·{" "}
                          {formatActivityTime(item.timestamp)}
                        </p>
                      </div>
                      {item.status ? (
                        <Badge variant="outline" className={statusClassName[item.status]}>
                          {item.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline">generated</Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
