"use client";

import { useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
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
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn, formatRelativeDate } from "@/lib/utils";

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
    <div className="flex h-screen overflow-hidden">
      {/* Left Side - 55% */}
      <div className="w-full overflow-y-auto p-8 lg:w-[60%]">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/dashboard" />}>
                All Jobs
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<Link href={`/dashboard/jobs/${jobId}`} />}
              >
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-bold text-2xl tracking-tight">
              {application.name}
            </h1>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    // biome-ignore lint/a11y/useAnchorContent: Button children provide accessible content
                    <a href={`mailto:${application.email}`} />
                  }
                >
                  <Button size="icon" variant="outline">
                    <Mail className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipPopup>{application.email}</TooltipPopup>
              </Tooltip>
              {application.phone && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      // biome-ignore lint/a11y/useAnchorContent: Button children provide accessible content
                      <a href={`tel:${application.phone}`} />
                    }
                  >
                    <Button size="icon" variant="outline">
                      <Phone className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipPopup>{application.phone}</TooltipPopup>
                </Tooltip>
              )}
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
                >
                  <Download className="size-4" />
                  Download Resume
                </Button>
              )}
            </div>
          </div>
          <p className="mt-1 text-muted-foreground">
            Applied for {job?.title} at {job?.company}
          </p>
          <span className="mt-2 flex items-center gap-1.5 text-muted-foreground text-sm">
            <Clock className="size-4" />
            Applied {formatRelativeDate(application.submittedAt)}
          </span>
        </div>

        {/* Analysis Content */}
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
      </div>

      {/* Right Half - Highlighted Resume */}
      {application.status === "reviewed" && analysis?.resumeMarkdown && (
        <div className="hidden border-l bg-muted/30 lg:block lg:w-1/2">
          <div className="sticky top-0 h-screen overflow-y-auto p-8">
            <h2 className="mb-6 font-bold text-2xl">Resume Analysis</h2>
            <HighlightedResume
              highlightedSections={analysis.highlightedSections}
              markdown={analysis.resumeMarkdown}
            />
          </div>
        </div>
      )}
    </div>
  );
}
