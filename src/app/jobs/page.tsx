"use client";

import { useQuery } from "convex/react";
import { Briefcase, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";

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

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<div className="mb-8">
				<h1 className="font-bold text-3xl tracking-tight">Open Positions</h1>
				<p className="mt-2 text-muted-foreground">
					Find your next opportunity. Apply with your resume and let AI match
					your skills.
				</p>
			</div>

			{jobs === undefined && (
				<div className="grid gap-4">
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className="mb-2 h-6 w-48" />
								<Skeleton className="h-4 w-32" />
								<div className="mt-4 flex gap-4">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-24" />
								</div>
							</CardHeader>
						</Card>
					))}
				</div>
			)}
			{jobs?.length === 0 && (
				<Card>
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
							<Briefcase className="size-8 text-muted-foreground" />
						</div>
						<CardTitle>No Open Positions</CardTitle>
						<CardDescription>
							Check back later for new opportunities.
						</CardDescription>
					</CardHeader>
				</Card>
			)}
			{jobs && jobs.length > 0 && (
				<div className="grid gap-4">
					{jobs.map((job) => (
						<Link href={`/jobs/${job._id}`} key={job._id}>
							<Card className="transition-colors hover:border-primary/50 hover:bg-accent/30">
								<CardHeader>
									<div className="flex items-start justify-between gap-4">
										<div className="min-w-0 flex-1">
											<CardTitle className="text-xl">{job.title}</CardTitle>
											<CardDescription className="mt-1 text-base">
												{job.company}
											</CardDescription>
										</div>
										<Badge variant={jobTypeBadgeVariant[job.type]}>
											{jobTypeLabel[job.type]}
										</Badge>
									</div>
									<div className="mt-4 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
										<span className="flex items-center gap-1.5">
											<MapPin className="size-4" />
											{job.location}
										</span>
										<span className="flex items-center gap-1.5">
											<Clock className="size-4" />
											{new Date(job.createdAt).toLocaleDateString()}
										</span>
									</div>
								</CardHeader>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
