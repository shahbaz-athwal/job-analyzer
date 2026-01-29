"use client";

import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  PauseCircle,
  Phone,
  PlayCircle,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Markdown } from "@/components/markdown";
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

const jobTypeLabel = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
} as const;

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

export default function JobDetailDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as Id<"jobs">;

  const job = useQuery(api.jobs.get, { id: jobId });
  const applications = useQuery(api.applications.listByJob, { jobId });
  const updateJob = useMutation(api.jobs.update);
  const deleteJob = useMutation(api.jobs.remove);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const handleToggleOpen = async () => {
    if (!job) return;
    await updateJob({ id: jobId, isOpen: !job.isOpen });
  };

  const handleDelete = async () => {
    // biome-ignore lint/suspicious/noAlert: Replace with custom dialog for production
    const confirmed = confirm(
      "Are you sure you want to delete this job and all applications?"
    );
    if (!confirmed) return;
    await deleteJob({ id: jobId });
    router.push("/dashboard");
  };

  if (job === undefined) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="mb-8 h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-96" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (job === null) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Card>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Briefcase />
              </EmptyMedia>
              <EmptyTitle>Job Not Found</EmptyTitle>
              <EmptyDescription>
                This job posting may have been deleted.
              </EmptyDescription>
            </EmptyHeader>
            <Button render={<Link href="/dashboard" />}>
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard" />}>
              All Jobs
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{job.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Job Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-2xl tracking-tight">{job.title}</h1>
            <Badge variant={job.isOpen ? "success" : "outline"}>
              {job.isOpen ? "Open" : "Closed"}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
            <span>{job.company}</span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {job.location}
            </span>
            <span>{jobTypeLabel[job.type]}</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              Created {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleToggleOpen} variant="outline">
            {job.isOpen ? (
              <>
                <PauseCircle className="size-4" />
                Close
              </>
            ) : (
              <>
                <PlayCircle className="size-4" />
                Reopen
              </>
            )}
          </Button>
          <Button onClick={handleDelete} variant="destructive-outline">
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Applicants List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5" />
                  Applicants
                </CardTitle>
                <CardDescription>
                  {applications?.length ?? 0} application
                  {applications?.length !== 1 ? "s" : ""} ranked by AI score
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {applications === undefined && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton className="h-24" key={i} />
                ))}
              </div>
            )}
            {applications?.length === 0 && (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Users />
                  </EmptyMedia>
                  <EmptyTitle>No Applications Yet</EmptyTitle>
                  <EmptyDescription>
                    Share your job posting to get applicants!
                  </EmptyDescription>
                </EmptyHeader>
                <Button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${window.location.origin}/jobs/${jobId}`
                    )
                  }
                  variant="outline"
                >
                  <ExternalLink className="size-4" />
                  Copy Job Link
                </Button>
              </Empty>
            )}
            {applications && applications.length > 0 && (
              <div className="space-y-3">
                {applications.map((app, index) => (
                  <Link
                    className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50"
                    href={`/dashboard/jobs/${jobId}/${app._id}`}
                    key={app._id}
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{app.name}</span>
                        {app.status === "processing" && (
                          <Badge size="sm" variant="warning">
                            <Loader2 className="size-3 animate-spin" />
                            Analyzing
                          </Badge>
                        )}
                        {app.status === "error" && (
                          <Badge size="sm" variant="error">
                            <AlertTriangle className="size-3" />
                            Error
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1">
                          <Mail className="size-3.5" />
                          {app.email}
                        </span>
                        {app.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3.5" />
                            {app.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    {app.analysis ? (
                      <div className="flex items-center gap-3">
                        <div className="w-24">
                          <Progress value={app.analysis.score}>
                            <ProgressTrack className="h-2">
                              <ProgressIndicator
                                className={getScoreBgColor(app.analysis.score)}
                              />
                            </ProgressTrack>
                          </Progress>
                        </div>
                        <span
                          className={cn(
                            "w-12 text-right font-semibold tabular-nums",
                            getScoreColor(app.analysis.score)
                          )}
                        >
                          {app.analysis.score}%
                        </span>
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                    ) : (
                      <ArrowRight className="size-4 text-muted-foreground" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Details Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div
                className={cn(
                  "text-muted-foreground text-sm",
                  !isDescriptionExpanded && "line-clamp-6"
                )}
              >
                <Markdown>{job.description}</Markdown>
              </div>
              <Button
                className="h-auto p-0"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                variant="link"
              >
                {isDescriptionExpanded ? (
                  <>
                    Show less
                    <ChevronUp className="size-4" />
                  </>
                ) : (
                  <>
                    Show more
                    <ChevronDown className="size-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Share Job</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${window.location.origin}/jobs/${jobId}`
                  )
                }
                variant="outline"
              >
                <ExternalLink className="size-4" />
                Copy Public Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
