"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { FunctionReturnType } from "convex/server";
import { ArrowRight, Briefcase, Globe, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Frame } from "@/components/ui/frame";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { api } from "@/convex/_generated/api";
import { useSheetState } from "@/hooks/use-sheet-state";
import { cn } from "@/lib/utils";

type Job = FunctionReturnType<typeof api.jobs.listAll>[number];

const jobTypeConfig = {
  "full-time": {
    label: "Full-time",
    variant: "info" as const,
  },
  "part-time": {
    label: "Part-time",
    variant: "success" as const,
  },
  contract: {
    label: "Contract",
    variant: "warning" as const,
  },
  internship: {
    label: "Internship",
    variant: "secondary" as const,
  },
} as const;

interface JobsListProps {
  jobs: Job[] | undefined;
}

const columnHelper = createColumnHelper<Job>();

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

function JobsListEmpty() {
  const { openSheet } = useSheetState();

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
      <Button onClick={() => openSheet("create-job")}>
        <Plus className="size-4" />
        Create Job
      </Button>
    </Empty>
  );
}

function JobItem({ job }: { job: Job }) {
  const config = jobTypeConfig[job.type];
  const isRemote = job.location.toLowerCase() === "remote";
  const hasApplicants = job.applicationCount > 0;

  return (
    <Link
      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
      href={`/jobs/${job._id}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-thin text-foreground">{job.title}</span>
          {!job.isOpen && (
            <Badge size="sm" variant="outline">
              Closed
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-muted-foreground text-sm">{job.company}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge size="sm" variant={config.variant}>
            {config.label}
          </Badge>
          {isRemote ? (
            <span className="inline-flex items-center gap-1 font-medium text-primary text-xs">
              <Globe className="size-3" />
              Remote
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">
              {job.location}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex items-center gap-1.5 text-sm tabular-nums",
            hasApplicants ? "text-foreground" : "text-muted-foreground/50"
          )}
        >
          <Users
            className={cn(
              "size-4",
              hasApplicants ? "opacity-70" : "opacity-40"
            )}
          />
          {job.applicationCount}
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

function JobsTable({ jobs }: { jobs: Job[] }) {
  const router = useRouter();

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: () => <span className="text-foreground/70">Title</span>,
        cell: (info) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground/85">
              {info.getValue()}
            </span>
            {!info.row.original.isOpen && (
              <Badge size="sm" variant="outline">
                Closed
              </Badge>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("company", {
        header: () => <span className="text-foreground/70">Company</span>,
        cell: (info) => (
          <span className="text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("type", {
        header: () => <span className="text-foreground/70">Type</span>,
        cell: (info) => {
          const config = jobTypeConfig[info.getValue()];
          return (
            <Badge size="sm" variant={config.variant}>
              {config.label}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("location", {
        header: () => <span className="text-foreground/70">Location</span>,
        cell: (info) => {
          const location = info.getValue();
          const isRemote = location.toLowerCase() === "remote";
          return isRemote ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-primary">
              <Globe className="size-3.5" />
              Remote
            </span>
          ) : (
            <span>{location}</span>
          );
        },
      }),
      columnHelper.accessor("applicationCount", {
        header: () => (
          <span className="text-right text-foreground/70">Applicants</span>
        ),
        cell: (info) => {
          const count = info.getValue();
          const isEmpty = count === 0;
          return (
            <div
              className={cn(
                "flex items-center justify-end gap-1.5 tabular-nums",
                isEmpty ? "text-muted-foreground/50" : "text-foreground"
              )}
            >
              <Users
                className={cn("size-4", isEmpty ? "opacity-40" : "opacity-70")}
              />
              {count}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: () => (
          <div className="flex justify-end">
            <ArrowRight className="size-4 text-muted-foreground" />
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Frame className="w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  className={cn(
                    header.column.id === "applicationCount" && "text-right"
                  )}
                  key={header.id}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row, index) => (
            <TableRow
              className={cn(
                "cursor-pointer transition-colors",
                index % 2 === 1 && "bg-muted/30",
                "hover:bg-accent/50"
              )}
              key={row.id}
              onClick={() => router.push(`/jobs/${row.original._id}`)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Frame>
  );
}

export function JobsList({ jobs }: JobsListProps) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="font-semibold text-lg">All Jobs</h2>
        <p className="text-muted-foreground text-sm">
          Click on a job to view applicants and rankings.
        </p>
      </div>

      {jobs === undefined && <JobsListSkeleton />}
      {jobs?.length === 0 && <JobsListEmpty />}

      {jobs && jobs.length > 0 && (
        <>
          {/* Desktop: Framed Table */}
          <div className="hidden md:block">
            <JobsTable jobs={jobs} />
          </div>

          {/* Mobile: Card list */}
          <div className="space-y-2 md:hidden">
            {jobs.map((job) => (
              <JobItem job={job} key={job._id} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
