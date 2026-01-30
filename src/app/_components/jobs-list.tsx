"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { FunctionReturnType } from "convex/server";
import { ArrowRight, Briefcase, Plus, Users } from "lucide-react";
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

type Job = FunctionReturnType<typeof api.jobs.listAll>[number];

const jobTypeLabel = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
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
  return (
    <Link
      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
      href={`/jobs/${job._id}`}
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

function JobsTable({ jobs }: { jobs: Job[] }) {
  const router = useRouter();

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Title",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{info.getValue()}</span>
            {!info.row.original.isOpen && (
              <Badge size="sm" variant="outline">
                Closed
              </Badge>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("company", {
        header: "Company",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => jobTypeLabel[info.getValue()],
      }),
      columnHelper.accessor("location", {
        header: "Location",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("applicationCount", {
        header: "Applicants",
        cell: (info) => (
          <div className="flex items-center gap-1.5">
            <Users className="size-4 text-muted-foreground" />
            {info.getValue()}
          </div>
        ),
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
                <TableHead key={header.id}>
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
          {table.getRowModel().rows.map((row) => (
            <TableRow
              className="cursor-pointer"
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
