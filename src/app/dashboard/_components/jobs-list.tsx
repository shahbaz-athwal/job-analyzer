import type { FunctionReturnType } from "convex/server";
import { ArrowRight, Briefcase, Plus, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { api } from "@/convex/_generated/api";

type Job = FunctionReturnType<typeof api.jobs.listAll>[number];

const jobTypeLabel = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
} as const;

interface JobsListProps {
  jobs: Job[] | undefined;
  onCreateClick: () => void;
}

function JobsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
          key={i}
        >
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

function JobsListEmpty({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Briefcase />
        </EmptyMedia>
        <EmptyTitle>No Jobs Yet</EmptyTitle>
        <EmptyDescription>
          Create your first posting to get started!
        </EmptyDescription>
      </EmptyHeader>
      <Button onClick={onCreateClick}>
        <Plus className="size-4" />
        Create Job
      </Button>
    </Empty>
  );
}

function JobItem({ job }: { job: Job }) {
  return (
    <Link
      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
      href={`/dashboard/jobs/${job._id}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{job.title}</span>
          {!job.isOpen && (
            <Badge size="sm" variant="outline">
              Closed
            </Badge>
          )}
        </div>
        <div className="mt-1 flex items-center gap-4 text-muted-foreground text-sm">
          <span>{job.company}</span>
          <span>{jobTypeLabel[job.type]}</span>
          <span>{job.location}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <Users className="size-4" />
          {job.applicationCount} applicant
          {job.applicationCount !== 1 ? "s" : ""}
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

export function JobsList({ jobs, onCreateClick }: JobsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Jobs</CardTitle>
        <CardDescription>
          Click on a job to view applicants and rankings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {jobs === undefined && <JobsListSkeleton />}
        {jobs?.length === 0 && <JobsListEmpty onCreateClick={onCreateClick} />}
        {jobs && jobs.length > 0 && (
          <div className="space-y-2">
            {jobs.map((job) => (
              <JobItem job={job} key={job._id} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
