"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@applyingmyself/convex-client";
import { Button } from "@applyingmyself/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@applyingmyself/ui/components/card";
import { Input } from "@applyingmyself/ui/components/input";
import { Label } from "@applyingmyself/ui/components/label";
import { Textarea } from "@applyingmyself/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@applyingmyself/ui/components/select";

type ApplicationStatus =
  | "applied"
  | "interviewing"
  | "offered"
  | "rejected"
  | "withdrawn";

type JobType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "freelance";

export default function NewJobPage() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const ensureUserProfile = useMutation(api.userHelpers.ensureUserProfile);
  const createJobApplication = useMutation(api.jobApplications.create);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isLoaded && userId) {
      ensureUserProfile({}).catch(() => undefined);
    }
  }, [ensureUserProfile, isLoaded, userId]);

  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobUrl: "",
    location: "",
    salary: "",
    jobType: "full-time" as JobType,
    status: "applied" as ApplicationStatus,
    appliedDate: "",
    notes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const normalizeOptional = (value: string): string | undefined => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const parseAppliedDate = (value: string): number | undefined => {
    if (!value) return undefined;
    const timestamp = new Date(`${value}T12:00:00`).getTime();
    return Number.isFinite(timestamp) ? timestamp : undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      await createJobApplication({
        jobTitle: formData.jobTitle.trim(),
        companyName: formData.companyName.trim(),
        jobUrl: normalizeOptional(formData.jobUrl),
        location: normalizeOptional(formData.location),
        salary: normalizeOptional(formData.salary),
        jobType: formData.jobType,
        status: formData.status,
        appliedDate: parseAppliedDate(formData.appliedDate),
        notes: normalizeOptional(formData.notes),
      });

      router.push("/dashboard/jobs?created=1");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create job application. Please try again.";
      setErrorMsg(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to job applications
        </Link>
        <h1 className="font-display text-3xl text-foreground">
          Add job application<span className="text-primary">.</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Capture this role so you can track progress in your pipeline.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Job information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  placeholder="e.g., Software Engineer"
                  required
                  disabled={isSubmitting}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="e.g., Google"
                  required
                  disabled={isSubmitting}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., San Francisco, CA"
                  disabled={isSubmitting}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="salary">Salary Range</Label>
                <Input
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="e.g., $100k - $150k"
                  disabled={isSubmitting}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Job Type</Label>
                <Select
                  value={formData.jobType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, jobType: value as JobType }))
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="appliedDate">Applied Date</Label>
                <Input
                  id="appliedDate"
                  name="appliedDate"
                  type="date"
                  value={formData.appliedDate}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="jobUrl">Job URL</Label>
              <Input
                id="jobUrl"
                name="jobUrl"
                type="url"
                value={formData.jobUrl}
                onChange={handleInputChange}
                placeholder="https://..."
                disabled={isSubmitting}
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Application details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as ApplicationStatus,
                  }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="mt-1.5"
                placeholder="Any details about the role, process, or contacts..."
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>

        {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

        <div className="flex items-center justify-end gap-3">
          <Button asChild type="button" variant="outline" disabled={isSubmitting}>
            <Link href="/dashboard/jobs">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !formData.jobTitle.trim() || !formData.companyName.trim()}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Add Application"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
