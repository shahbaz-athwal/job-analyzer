"use client";

import { useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  Mail,
  Minus,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HighlightedResume } from "@/components/highlighted-resume";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ButtonGroup, GroupSeparator } from "@/components/ui/group";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn, formatRelativeDate } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getScoreProgressColor(score: number) {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-amber-500";
  return "text-red-500";
}

function getScoreTextColor(score: number) {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function CircularProgress({
  value,
  size = 120,
  strokeWidth = 10,
  className,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative inline-flex", className)}>
      <svg aria-hidden="true" className="-rotate-90" height={size} width={size}>
        <title>Match score progress</title>
        {/* Background circle */}
        <circle
          className="text-muted"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          className={cn(
            "transition-all duration-500 ease-out",
            getScoreProgressColor(value)
          )}
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-bold text-2xl tabular-nums",
            getScoreTextColor(value)
          )}
        >
          {value}%
        </span>
      </div>
    </div>
  );
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
            <Button render={<Link href={`/jobs/${jobId}`} />}>
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
              <BreadcrumbLink render={<Link href="/" />}>
                All Jobs
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={`/jobs/${jobId}`} />}>
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
          <div className="flex items-start gap-4">
            {/* Avatar with Initials */}
            <Avatar className="size-14 text-lg">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(application.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="font-bold text-2xl tracking-tight">
                    {application.name}
                  </h1>
                  {/* Grouped Meta Information */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="size-3.5" />
                      {job?.title} at {job?.company}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      Applied {formatRelativeDate(application.submittedAt)}
                    </span>
                  </div>
                </div>

                {/* Consolidated Action Buttons */}
                <ButtonGroup aria-label="Contact actions">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          render={
                            // biome-ignore lint/a11y/useAnchorContent: aria-label provides accessible content
                            <a
                              aria-label="Send email"
                              href={`mailto:${application.email}`}
                            />
                          }
                          size="icon"
                          variant="outline"
                        />
                      }
                    >
                      <Mail className="size-4" />
                    </TooltipTrigger>
                    <TooltipPopup>{application.email}</TooltipPopup>
                  </Tooltip>
                  {application.phone && (
                    <>
                      <GroupSeparator />
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              render={
                                // biome-ignore lint/a11y/useAnchorContent: aria-label provides accessible content
                                <a
                                  aria-label="Call phone"
                                  href={`tel:${application.phone}`}
                                />
                              }
                              size="icon"
                              variant="outline"
                            />
                          }
                        >
                          <Phone className="size-4" />
                        </TooltipTrigger>
                        <TooltipPopup>{application.phone}</TooltipPopup>
                      </Tooltip>
                    </>
                  )}
                  {application.resumeUrl && (
                    <>
                      <GroupSeparator />
                      <Button
                        render={
                          // biome-ignore lint/a11y/useAnchorContent: aria-label provides accessible content
                          <a
                            aria-label="Download resume"
                            href={application.resumeUrl}
                            rel="noopener noreferrer"
                            target="_blank"
                          />
                        }
                        variant="outline"
                      >
                        <Download className="size-4" />
                        Download
                      </Button>
                    </>
                  )}
                </ButtonGroup>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Content */}
        <div className="space-y-8">
          {/* Processing State */}
          {application.status === "processing" && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Analyzing Resume</h3>
              <p className="mt-1 text-muted-foreground text-sm">
                AI is analyzing this candidate's qualifications. This usually
                takes a few seconds.
              </p>
            </div>
          )}

          {/* Error State */}
          {application.status === "error" && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-8 text-destructive" />
              </div>
              <h3 className="font-semibold text-lg">Analysis Failed</h3>
              <p className="mt-1 text-muted-foreground text-sm">
                There was an error analyzing this resume. This could be due to
                an unsupported PDF format.
              </p>
            </div>
          )}

          {application.status === "reviewed" && analysis && (
            <>
              {/* Match Score Section */}
              <section>
                <div className="flex items-center gap-6">
                  <CircularProgress value={analysis.score} />
                  <div className="flex-1 pt-2">
                    <p
                      className={cn(
                        "font-semibold text-lg",
                        getScoreTextColor(analysis.score)
                      )}
                    >
                      {getScoreLabel(analysis.score)}
                    </p>
                    <ul className="mt-3 space-y-1.5 text-muted-foreground text-sm leading-relaxed">
                      {analysis.summaryPoints.map((point: string) => (
                        <li className="flex gap-2" key={point}>
                          <span className="text-muted-foreground/60">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <div className="-mx-8 h-px bg-border" />
              {/* Skills Analysis Section */}
              <section>
                <div className="space-y-5">
                  <div>
                    <p className="mb-2.5 font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                      Matched Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.matchedSkills.map((skill) => (
                        <Badge
                          className="font-semibold"
                          key={skill}
                          size="lg"
                          variant="success"
                        >
                          <CheckCircle2 className="size-3.5" />
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
                    <p className="mb-2.5 font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                      Skill Gaps
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingSkills.map((skill) => (
                        <Badge
                          className="text-muted-foreground line-through decoration-muted-foreground/50"
                          key={skill}
                          size="lg"
                          variant="outline"
                        >
                          <Minus className="size-3.5 opacity-50" />
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
                </div>
              </section>
            </>
          )}

          {/* Cover Letter Section */}
          {application.coverLetter && (
            <>
              <hr className="border-border" />
              <section>
                <h2 className="mb-4 font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                  Cover Letter
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {application.coverLetter}
                </p>
              </section>
            </>
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
