"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  MapPin,
  PauseCircle,
  Phone,
  PlayCircle,
  Trash2,
  Users,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Frame } from "@/components/ui/frame";
import { Group, GroupSeparator } from "@/components/ui/group";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn, formatRelativeDate } from "@/lib/utils";

type Application = FunctionReturnType<
  typeof api.applications.listByJob
>[number];

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

const columnHelper = createColumnHelper<Application & { rank: number }>();

function ApplicantsTable({
  applications,
  jobId,
}: {
  applications: Application[];
  jobId: Id<"jobs">;
}) {
  const router = useRouter();

  const dataWithRank = useMemo(
    () => applications.map((app, index) => ({ ...app, rank: index + 1 })),
    [applications]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("rank", {
        header: "#",
        cell: (info) => (
          <div className="flex size-8 items-center justify-center rounded-full bg-muted font-semibold text-sm">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{info.getValue()}</span>
            {info.row.original.status === "processing" && (
              <Badge size="sm" variant="warning">
                <Loader2 className="size-3 animate-spin" />
                Analyzing
              </Badge>
            )}
            {info.row.original.status === "error" && (
              <Badge size="sm" variant="error">
                <AlertTriangle className="size-3" />
                Error
              </Badge>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Mail className="size-3.5" />
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        cell: (info) => {
          const phone = info.getValue();
          return phone ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="size-3.5" />
              {phone}
            </span>
          ) : (
            <span className="text-muted-foreground/50">—</span>
          );
        },
      }),
      columnHelper.accessor("analysis", {
        header: "Score",
        cell: (info) => {
          const analysis = info.getValue();
          if (!analysis) {
            return <span className="text-muted-foreground/50">—</span>;
          }
          return (
            <div className="flex items-center gap-3">
              <div className="w-20">
                <Progress value={analysis.score}>
                  <ProgressTrack className="h-2">
                    <ProgressIndicator
                      className={getScoreBgColor(analysis.score)}
                    />
                  </ProgressTrack>
                </Progress>
              </div>
              <span
                className={cn(
                  "w-10 font-semibold tabular-nums",
                  getScoreColor(analysis.score)
                )}
              >
                {analysis.score}%
              </span>
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
    data: dataWithRank,
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
              onClick={() => router.push(`/jobs/${jobId}/${row.original._id}`)}
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

function ApplicantCard({
  app,
  index,
  jobId,
}: {
  app: Application;
  index: number;
  jobId: Id<"jobs">;
}) {
  return (
    <Link
      className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50"
      href={`/jobs/${jobId}/${app._id}`}
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
  );
}

export default function JobDetailDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as Id<"jobs">;

  const job = useQuery(api.jobs.get, { id: jobId });
  const applications = useQuery(api.applications.listByJob, { jobId });
  const updateJob = useMutation(api.jobs.update);
  const deleteJob = useMutation(api.jobs.remove);
  const demoApply = useMutation(api.applications.demoApply);

  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  useEffect(() => {
    setIsDemoMode(localStorage.getItem("demo") === "true");
  }, []);

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
    router.push("/");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/job-listings?job=${jobId}`
    );
    toast.success("Link copied to clipboard");
  };

  const handleDemoApply = async () => {
    setIsDemoLoading(true);
    try {
      const count = await demoApply({ jobId });
      toast.success(`Created ${count} demo applications`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create demo applications"
      );
    } finally {
      setIsDemoLoading(false);
    }
  };

  if (job === undefined) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="mb-8 h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (job === null) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Frame>
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
            <Button render={<Link href="/" />}>
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Button>
          </Empty>
        </Frame>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>All Jobs</BreadcrumbLink>
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
              Created {formatRelativeDate(job.createdAt)}
            </span>
          </div>
        </div>
        <Group>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button onClick={handleCopyLink} variant="outline">
                  <ExternalLink className="size-4" />
                  Share
                </Button>
              }
            />
            <TooltipContent>Copy public link</TooltipContent>
          </Tooltip>
          <GroupSeparator />
          <Sheet onOpenChange={setIsDescriptionOpen} open={isDescriptionOpen}>
            <SheetTrigger
              render={
                <Button variant="outline">
                  <FileText className="size-4" />
                  Description
                </Button>
              }
            />
            <SheetContent side="right" variant="inset">
              <SheetHeader>
                <SheetTitle>Job Description</SheetTitle>
                <SheetDescription>
                  {job.title} at {job.company}
                </SheetDescription>
              </SheetHeader>
              <SheetPanel>
                <Markdown>{job.description}</Markdown>
              </SheetPanel>
            </SheetContent>
          </Sheet>
          <GroupSeparator />
          <Tooltip>
            <TooltipTrigger
              render={
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
              }
            />
            <TooltipContent>
              {job.isOpen
                ? "Stop accepting applications"
                : "Start accepting applications"}
            </TooltipContent>
          </Tooltip>
          <GroupSeparator />
          <Button onClick={handleDelete} variant="destructive-outline">
            <Trash2 className="size-4" />
            Delete
          </Button>
          {isDemoMode && (
            <>
              <GroupSeparator />
              <Button
                disabled={isDemoLoading}
                onClick={handleDemoApply}
                variant="outline"
              >
                {isDemoLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Wand2 className="size-4" />
                )}
                Demo Apply (20)
              </Button>
            </>
          )}
        </Group>
      </div>

      {/* Applicants Section */}
      <div>
        <div className="mb-4">
          <h2 className="flex items-center gap-2 font-semibold text-lg">
            <Users className="size-5" />
            Applicants
          </h2>
          <p className="text-muted-foreground text-sm">
            {applications?.length ?? 0} application
            {applications?.length !== 1 ? "s" : ""} ranked by AI score
          </p>
        </div>

        {applications === undefined && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton className="h-16" key={i} />
            ))}
          </div>
        )}

        {applications?.length === 0 && (
          <Frame>
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
              <Button onClick={handleCopyLink} variant="outline">
                <ExternalLink className="size-4" />
                Copy Job Link
              </Button>
            </Empty>
          </Frame>
        )}

        {applications && applications.length > 0 && (
          <>
            {/* Desktop: Table */}
            <div className="hidden md:block">
              <ApplicantsTable applications={applications} jobId={jobId} />
            </div>

            {/* Mobile: Card list */}
            <div className="space-y-2 md:hidden">
              {applications.map((app, index) => (
                <ApplicantCard
                  app={app}
                  index={index}
                  jobId={jobId}
                  key={app._id}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
