"use client";

import Link from "next/link";
import { Button } from "@applyingmyself/ui/components/button";
import { Card, CardContent } from "@applyingmyself/ui/components/card";
import { Badge } from "@applyingmyself/ui/components/badge";
import {
  Briefcase,
  FileText,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { useScrollAnimation } from "@applyingmyself/ui/hooks/useScrollAnimation";

type Status = "applied" | "interviewing" | "offered" | "rejected";

const SAMPLE_APPLICATIONS: {
  company: string;
  role: string;
  status: Status;
  date: string;
}[] = [
  {
    company: "Linear",
    role: "Frontend Engineer",
    status: "interviewing",
    date: "Mar 2",
  },
  {
    company: "Vercel",
    role: "Senior Design Engineer",
    status: "applied",
    date: "Feb 28",
  },
  {
    company: "Stripe",
    role: "Product Designer",
    status: "offered",
    date: "Feb 25",
  },
  {
    company: "Notion",
    role: "Full-Stack Engineer",
    status: "interviewing",
    date: "Feb 22",
  },
  {
    company: "Figma",
    role: "Staff Designer",
    status: "rejected",
    date: "Feb 18",
  },
];

const statusStyle: Record<Status, string> = {
  applied: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  interviewing: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  offered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  rejected: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

const stats = [
  { label: "Applications", value: "24", icon: Briefcase, color: "text-blue-400" },
  { label: "Cover Letters", value: "18", icon: FileText, color: "text-primary" },
  { label: "Interview Rate", value: "33%", icon: TrendingUp, color: "text-emerald-400" },
];

export function DashboardPreviewSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">
            Your job search, organized<span className="text-primary">.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl">
            Every application, interview, and offer in one place.
            No more spreadsheets.
          </p>

          {/* Dashboard mockup */}
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 overflow-hidden">
            <CardContent className="p-0">
              {/* Stats bar */}
              <div className="grid grid-cols-3 divide-x divide-border/50 border-b border-border/50">
                {stats.map((stat, i) => (
                  <div
                    key={stat.label}
                    className={`p-5 transition-all duration-700 ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                    style={{ transitionDelay: `${300 + i * 100}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        {stat.label}
                      </span>
                    </div>
                    <p className="text-2xl font-semibold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Application list */}
              <div className="divide-y divide-border/40">
                {SAMPLE_APPLICATIONS.map((app, i) => (
                  <div
                    key={app.company}
                    className={`flex items-center justify-between px-5 py-3.5 transition-all duration-700 ${
                      isVisible
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-4"
                    }`}
                    style={{ transitionDelay: `${500 + i * 80}ms` }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {app.company[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {app.role}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {app.company}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {app.date}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${statusStyle[app.status]}`}
                      >
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-muted-foreground text-sm">
              Track every application from{" "}
              <span className="text-foreground font-semibold">
                applied
              </span>{" "}
              to{" "}
              <span className="text-emerald-400 font-semibold">offered</span>.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/register">
                Start tracking free
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
