"use client";

import { useQuery } from "convex/react";
import { Briefcase, Check, ChevronLeft, Clock, MapPin } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useSheetState } from "@/hooks/use-sheet-state";
import { cn } from "@/lib/utils";
import { ApplySheet, ApplyTrigger } from "./_components/apply-sheet";

const jobTypeBadgeVariant = {
  "full-time": "default",
  "part-time": "secondary",
  contract: "outline",
  internship: "info",
} as const;

const jobTypeLabel = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
} as const;

export default function JobsPage() {
  const jobs = useQuery(api.jobs.listOpen);
  const [selectedJobId, setSelectedJobId] = useQueryState("job");
  const [appliedJobs, setAppliedJobs] = useLocalStorage<string[]>(
    "applied-jobs",
    []
  );
  const { closeSheet } = useSheetState();

  useEffect(() => {
    if (
      jobs &&
      jobs.length > 0 &&
      !selectedJobId &&
      window.innerWidth >= 1024
    ) {
      setSelectedJobId(jobs[0]._id);
    }
  }, [jobs, selectedJobId, setSelectedJobId]);

  const selectedJob = jobs?.find((job) => job._id === selectedJobId);
  const isApplied = selectedJobId ? appliedJobs.includes(selectedJobId) : false;

  const handleApplySuccess = () => {
    if (selectedJobId) {
      setAppliedJobs((prev) => [...prev, selectedJobId]);
    }
    closeSheet();
  };

  const renderApplyButton = (fullWidth = false) => {
    if (!selectedJob) return null;

    const className = fullWidth ? "w-full" : undefined;

    if (!selectedJob.isOpen) {
      return (
        <Button className={className} disabled size="lg" variant="outline">
          Position Closed
        </Button>
      );
    }

    if (isApplied) {
      return (
        <Button className={className} disabled size="lg" variant="outline">
          <Check className="size-4" />
          Already Applied
        </Button>
      );
    }

    return <ApplyTrigger className={className} fullWidth={fullWidth} />;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6">
          <h1 className="font-bold text-2xl tracking-tight">Open Positions</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Find your next opportunity. Apply with your resume and let AI match
            your skills.
          </p>
        </div>
      </div>

      {/* Main content - Two column layout */}
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1">
        {/* Left column - Job list */}
        <div className="w-full border-r lg:w-[340px] lg:shrink-0">
          <ScrollArea className="h-full">
            <div className="p-3">
              {jobs === undefined && (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div className="rounded-lg border p-4" key={i}>
                      <Skeleton className="mb-2 h-5 w-3/4" />
                      <Skeleton className="mb-3 h-4 w-1/2" />
                      <div className="flex gap-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {jobs?.length === 0 && (
                <Card>
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Briefcase />
                      </EmptyMedia>
                      <EmptyTitle>No Open Positions</EmptyTitle>
                      <EmptyDescription>
                        Check back later for new opportunities.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </Card>
              )}

              {jobs && jobs.length > 0 && (
                <div className="space-y-2">
                  {jobs.map((job) => {
                    const isSelected = job._id === selectedJobId;
                    const jobApplied = appliedJobs.includes(job._id);

                    return (
                      <button
                        className={cn(
                          "w-full rounded-lg border p-4 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:border-muted-foreground/30 hover:bg-accent/50"
                        )}
                        key={job._id}
                        onClick={() => setSelectedJobId(job._id)}
                        type="button"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate font-semibold text-sm">
                                {job.title}
                              </h3>
                              {jobApplied && (
                                <Badge size="sm" variant="success">
                                  <Check className="size-3" />
                                  Applied
                                </Badge>
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-muted-foreground text-sm">
                              {job.company}
                            </p>
                          </div>
                          <Badge
                            className="shrink-0"
                            size="sm"
                            variant={jobTypeBadgeVariant[job.type]}
                          >
                            {jobTypeLabel[job.type]}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-muted-foreground text-xs">
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right column - Job details */}
        <div className="hidden flex-1 lg:block">
          <ScrollArea className="h-full">
            <div className="p-6">
              {!selectedJob && jobs !== undefined && (
                <div className="flex h-[60vh] items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Briefcase className="mx-auto mb-4 size-12 opacity-50" />
                    <p className="text-lg">Select a job to view details</p>
                  </div>
                </div>
              )}

              {jobs === undefined && (
                <div className="space-y-6">
                  <div>
                    <Skeleton className="mb-2 h-8 w-2/3" />
                    <Skeleton className="h-5 w-1/3" />
                  </div>
                  <Skeleton className="h-64 w-full" />
                </div>
              )}

              {selectedJob && (
                <div className="mx-auto max-w-3xl space-y-6">
                  {/* Job header */}
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="font-bold text-2xl tracking-tight">
                            {selectedJob.title}
                          </h2>
                          {isApplied && (
                            <Badge variant="success">
                              <Check className="size-3.5" />
                              Applied
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-lg text-muted-foreground">
                          {selectedJob.company}
                        </p>
                      </div>
                      <Badge
                        size="lg"
                        variant={jobTypeBadgeVariant[selectedJob.type]}
                      >
                        {jobTypeLabel[selectedJob.type]}
                      </Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-4" />
                        {selectedJob.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-4" />
                        Posted{" "}
                        {new Date(selectedJob.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Apply button */}
                  <div className="flex gap-3">{renderApplyButton()}</div>

                  {/* Job description */}
                  <Markdown>{selectedJob.description}</Markdown>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Mobile: Show job details when selected */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 bg-background lg:hidden">
            <div className="flex h-full flex-col">
              {/* Mobile header */}
              <div className="flex items-center gap-2 border-b px-2 py-3">
                <Button
                  onClick={() => setSelectedJobId(null)}
                  size="icon-sm"
                  variant="ghost"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">
                    {selectedJob.title}
                  </h2>
                  <p className="truncate text-muted-foreground text-sm">
                    {selectedJob.company}
                  </p>
                </div>
              </div>

              {/* Mobile content */}
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={jobTypeBadgeVariant[selectedJob.type]}>
                        {jobTypeLabel[selectedJob.type]}
                      </Badge>
                      {isApplied && (
                        <Badge variant="success">
                          <Check className="size-3.5" />
                          Applied
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-4" />
                        {selectedJob.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-4" />
                        Posted{" "}
                        {new Date(selectedJob.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="mb-4 font-semibold text-lg">
                        About this role
                      </h3>
                      <Markdown>{selectedJob.description}</Markdown>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Mobile footer with Apply button */}
              <div className="border-t bg-background p-4">
                {renderApplyButton(true)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Apply Sheet */}
      {selectedJob && (
        <ApplySheet
          company={selectedJob.company}
          jobId={selectedJob._id as Id<"jobs">}
          jobTitle={selectedJob.title}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}
