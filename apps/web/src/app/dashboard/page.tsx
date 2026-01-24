"use client";

import { api } from "@job-analyzer/backend/convex/_generated/api";
import { useQuery } from "convex/react";
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
import { Skeleton } from "@/components/ui/skeleton";

const jobTypeLabel = {
	"full-time": "Full-time",
	"part-time": "Part-time",
	contract: "Contract",
	internship: "Internship",
} as const;

export default function DashboardPage() {
	const jobs = useQuery(api.jobs.listAll);

	const totalApplicants =
		jobs?.reduce((acc, job) => acc + job.applicationCount, 0) ?? 0;
	const openJobs = jobs?.filter((j) => j.isOpen).length ?? 0;

	return (
		<div className="container mx-auto max-w-6xl px-4 py-8">
			<div className="mb-8 flex items-start justify-between gap-4">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">
						Recruiter Dashboard
					</h1>
					<p className="mt-2 text-muted-foreground">
						Manage job postings and review applicants.
					</p>
				</div>
				<Button render={<Link href="/dashboard/jobs/new" />}>
					<Plus className="size-4" />
					Create Job
				</Button>
			</div>

			{/* Stats */}
			<div className="mb-8 grid gap-4 sm:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total Jobs</CardDescription>
						<CardTitle className="text-3xl">{jobs?.length ?? "-"}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Open Positions</CardDescription>
						<CardTitle className="text-3xl">{openJobs}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total Applicants</CardDescription>
						<CardTitle className="text-3xl">{totalApplicants}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			{/* Jobs List */}
			<Card>
				<CardHeader>
					<CardTitle>All Jobs</CardTitle>
					<CardDescription>
						Click on a job to view applicants and rankings.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{jobs === undefined ? (
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
					) : jobs.length === 0 ? (
						<div className="py-12 text-center">
							<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
								<Briefcase className="size-8 text-muted-foreground" />
							</div>
							<p className="mb-4 text-muted-foreground">
								No jobs yet. Create your first posting!
							</p>
							<Button render={<Link href="/dashboard/jobs/new" />}>
								<Plus className="size-4" />
								Create Job
							</Button>
						</div>
					) : (
						<div className="space-y-2">
							{jobs.map((job) => (
								<Link
									className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
									href={`/dashboard/jobs/${job._id}`}
									key={job._id}
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
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
