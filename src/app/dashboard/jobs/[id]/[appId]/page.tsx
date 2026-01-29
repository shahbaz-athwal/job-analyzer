"use client";

import { useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HighlightedResume } from "@/components/highlighted-resume";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreBgColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Partial Match";
  return "Low Match";
}

export default function ApplicantDetailPage() {
  const params = useParams();
  const jobId = params.id as Id<"jobs">;
  const appId = params.appId as Id<"applications">;

  const application = useQuery(api.applications.get, { id: appId });

  if (application === undefined) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (application === null) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <User />
              </EmptyMedia>
              <EmptyTitle>Application Not Found</EmptyTitle>
              <EmptyDescription>
                This application may have been deleted.
              </EmptyDescription>
            </EmptyHeader>
            <Button render={<Link href={`/dashboard/jobs/${jobId}`} />}>
              <ArrowLeft className="size-4" />
              Back to Applicants
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  const { analysis, job } = application;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard" />}>
              All Jobs
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={`/dashboard/jobs/${jobId}`} />}>
              {job?.title ?? "Job"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{application.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Applicant Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-bold text-2xl tracking-tight">
              {application.name}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Applied for {job?.title} at {job?.company}
            </p>
          </div>
          {application.resumeUrl && (
            <Button
              render={
                // biome-ignore lint/a11y/useAnchorContent: Button children provide accessible content
                <a
                  href={application.resumeUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                />
              }
              variant="outline"
            >
              <Download className="size-4" />
              Download Resume
            </Button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <a
            className="flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
            href={`mailto:${application.email}`}
          >
            <Mail className="size-4" />
            {application.email}
          </a>
          {application.phone && (
            <a
              className="flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
              href={`tel:${application.phone}`}
            >
              <Phone className="size-4" />
              {application.phone}
            </a>
          )}
          <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Clock className="size-4" />
            Applied {new Date(application.submittedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {/* Score Card */}
          {application.status === "processing" && (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
                <CardTitle>Analyzing Resume</CardTitle>
                <CardDescription>
                  AI is analyzing this candidate's qualifications. This usually
                  takes a few seconds.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
          {application.status === "error" && (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="size-8 text-destructive" />
                </div>
                <CardTitle>Analysis Failed</CardTitle>
                <CardDescription>
                  There was an error analyzing this resume. This could be due to
                  an unsupported PDF format.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
          {application.status === "reviewed" && analysis && (
            <>
              {/* Score Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Match Score</span>
                    <span
                      className={cn(
                        "font-bold text-3xl tabular-nums",
                        getScoreColor(analysis.score)
                      )}
                    >
                      {analysis.score}%
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {getScoreLabel(analysis.score)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={analysis.score}>
                    <ProgressTrack className="h-3">
                      <ProgressIndicator
                        className={getScoreBgColor(analysis.score)}
                      />
                    </ProgressTrack>
                  </Progress>
                  <p className="mt-4 text-muted-foreground text-sm">
                    {analysis.summary}
                  </p>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Skills Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="mb-2 font-medium text-sm">Matched Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.matchedSkills.map((skill) => (
                        <Badge key={skill} variant="success">
                          <CheckCircle2 className="size-3" />
                          {skill}
                        </Badge>
                      ))}
                      {analysis.matchedSkills.length === 0 && (
                        <span className="text-muted-foreground text-sm">
                          No matching skills identified
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 font-medium text-sm">Missing Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingSkills.map((skill) => (
                        <Badge key={skill} variant="error">
                          <XCircle className="size-3" />
                          {skill}
                        </Badge>
                      ))}
                      {analysis.missingSkills.length === 0 && (
                        <span className="text-muted-foreground text-sm">
                          All required skills found
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Highlighted Resume */}
              {analysis.resumeMarkdown && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resume Analysis</CardTitle>
                    <CardDescription>
                      Highlighted sections show relevant matches to the job
                      requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HighlightedResume
                      highlightedSections={analysis.highlightedSections}
                      markdown={analysis.resumeMarkdown}
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Cover Letter */}
          {application.coverLetter && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">
                  {application.coverLetter}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4" />
                Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-muted-foreground text-sm">
                {application.resumeFileName}
              </p>
              {application.resumeUrl && (
                <Button
                  className="w-full"
                  render={
                    // biome-ignore lint/a11y/useAnchorContent: Button children provide accessible content
                    <a
                      href={application.resumeUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    />
                  }
                  variant="outline"
                >
                  <ExternalLink className="size-4" />
                  View Resume
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Applicant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                render={
                  // biome-ignore lint/a11y/useAnchorContent: Button children provide accessible content
                  <a href={`mailto:${application.email}`} />
                }
                variant="outline"
              >
                <Mail className="size-4" />
                Send Email
              </Button>
              {application.phone && (
                <Button
                  className="w-full"
                  render={
                    // biome-ignore lint/a11y/useAnchorContent: Button children provide accessible content
                    <a href={`tel:${application.phone}`} />
                  }
                  variant="outline"
                >
                  <Phone className="size-4" />
                  Call
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
