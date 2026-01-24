"use client";

import { api } from "@job-analyzer/backend/convex/_generated/api";
import type { Id } from "@job-analyzer/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	ArrowLeft,
	Briefcase,
	Check,
	Clock,
	FileText,
	Loader2,
	MapPin,
	Upload,
	X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

export default function JobDetailPage() {
	const params = useParams();
	const router = useRouter();
	const jobId = params.id as Id<"jobs">;

	const job = useQuery(api.jobs.get, { id: jobId });
	const generateUploadUrl = useMutation(api.files.generateUploadUrl);
	const submitApplication = useMutation(api.applications.submit);

	const [showForm, setShowForm] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadedFile, setUploadedFile] = useState<{
		storageId: Id<"_storage">;
		name: string;
	} | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	// Form state
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [coverLetter, setCoverLetter] = useState("");

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			const file = acceptedFiles[0];
			if (!file) return;

			setIsUploading(true);
			try {
				const uploadUrl = await generateUploadUrl();
				const response = await fetch(uploadUrl, {
					method: "POST",
					headers: { "Content-Type": file.type },
					body: file,
				});
				const { storageId } = await response.json();
				setUploadedFile({ storageId, name: file.name });
			} catch (error) {
				console.error("Upload failed:", error);
			} finally {
				setIsUploading(false);
			}
		},
		[generateUploadUrl]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { "application/pdf": [".pdf"] },
		maxFiles: 1,
		disabled: isUploading,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!(uploadedFile && name && email)) return;

		setIsSubmitting(true);
		try {
			await submitApplication({
				jobId,
				name,
				email,
				phone: phone || undefined,
				coverLetter: coverLetter || undefined,
				resumeFileId: uploadedFile.storageId,
				resumeFileName: uploadedFile.name,
			});
			router.push(`/jobs/${jobId}/apply/success`);
		} catch (error) {
			console.error("Submission failed:", error);
			setIsSubmitting(false);
		}
	};

	if (job === undefined) {
		return (
			<div className="container mx-auto max-w-4xl px-4 py-8">
				<Skeleton className="mb-4 h-8 w-48" />
				<Skeleton className="mb-8 h-6 w-32" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (job === null) {
		return (
			<div className="container mx-auto max-w-4xl px-4 py-8">
				<Card>
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
							<Briefcase className="size-8 text-muted-foreground" />
						</div>
						<CardTitle>Job Not Found</CardTitle>
						<CardDescription>
							This position may have been removed or is no longer available.
						</CardDescription>
						<Button className="mt-4" render={<Link href="/jobs" />}>
							<ArrowLeft className="size-4" />
							Back to Jobs
						</Button>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<Link
				className="mb-6 inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
				href="/jobs"
			>
				<ArrowLeft className="size-4" />
				Back to all jobs
			</Link>

			<div className="mb-8">
				<div className="mb-4 flex flex-wrap items-start justify-between gap-4">
					<div>
						<h1 className="font-bold text-3xl tracking-tight">{job.title}</h1>
						<p className="mt-1 text-lg text-muted-foreground">{job.company}</p>
					</div>
					<Badge size="lg" variant={jobTypeBadgeVariant[job.type]}>
						{jobTypeLabel[job.type]}
					</Badge>
				</div>
				<div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
					<span className="flex items-center gap-1.5">
						<MapPin className="size-4" />
						{job.location}
					</span>
					<span className="flex items-center gap-1.5">
						<Clock className="size-4" />
						Posted {new Date(job.createdAt).toLocaleDateString()}
					</span>
				</div>
			</div>

			<div className="grid gap-8 lg:grid-cols-[1fr_320px]">
				<div className="space-y-8">
					<Card>
						<CardHeader>
							<CardTitle>About this role</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="prose prose-sm dark:prose-invert max-w-none">
								<p className="whitespace-pre-wrap">{job.description}</p>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Requirements</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="prose prose-sm dark:prose-invert max-w-none">
								<p className="whitespace-pre-wrap">{job.requirements}</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="lg:sticky lg:top-4 lg:self-start">
					{showForm ? (
						<Card>
							<CardHeader>
								<CardTitle>Apply for this position</CardTitle>
								<CardDescription>
									Fill out the form below to submit your application.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form className="space-y-4" onSubmit={handleSubmit}>
									<div className="space-y-2">
										<label className="font-medium text-sm" htmlFor="name">
											Full Name *
										</label>
										<Input
											id="name"
											onChange={(e) => setName(e.target.value)}
											placeholder="John Doe"
											required
											value={name}
										/>
									</div>

									<div className="space-y-2">
										<label className="font-medium text-sm" htmlFor="email">
											Email *
										</label>
										<Input
											id="email"
											onChange={(e) => setEmail(e.target.value)}
											placeholder="john@example.com"
											required
											type="email"
											value={email}
										/>
									</div>

									<div className="space-y-2">
										<label className="font-medium text-sm" htmlFor="phone">
											Phone
										</label>
										<Input
											id="phone"
											onChange={(e) => setPhone(e.target.value)}
											placeholder="+1 (555) 000-0000"
											type="tel"
											value={phone}
										/>
									</div>

									<div className="space-y-2">
										<label className="font-medium text-sm" htmlFor="cover">
											Cover Letter
										</label>
										<Textarea
											className="min-h-24"
											id="cover"
											onChange={(e) => setCoverLetter(e.target.value)}
											placeholder="Tell us why you're a great fit..."
											value={coverLetter}
										/>
									</div>

									<div className="space-y-2">
										<label className="font-medium text-sm">Resume *</label>
										{uploadedFile ? (
											<div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
												<div className="flex items-center gap-2">
													<FileText className="size-4 text-primary" />
													<span className="truncate text-sm">
														{uploadedFile.name}
													</span>
												</div>
												<Button
													onClick={() => setUploadedFile(null)}
													size="icon-xs"
													type="button"
													variant="ghost"
												>
													<X className="size-4" />
												</Button>
											</div>
										) : (
											<div
												{...getRootProps()}
												className={cn(
													"cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
													isDragActive
														? "border-primary bg-primary/5"
														: "border-input hover:border-primary/50"
												)}
											>
												<input {...getInputProps()} />
												<div className="flex flex-col items-center gap-2">
													{isUploading ? (
														<Loader2 className="size-8 animate-spin text-muted-foreground" />
													) : (
														<Upload className="size-8 text-muted-foreground" />
													)}
													<div className="text-sm">
														<span className="font-medium text-primary">
															Upload PDF
														</span>{" "}
														<span className="text-muted-foreground">
															or drag and drop
														</span>
													</div>
												</div>
											</div>
										)}
									</div>

									<Button
										className="w-full"
										disabled={isSubmitting || !uploadedFile || !name || !email}
										type="submit"
									>
										{isSubmitting ? (
											<>
												<Loader2 className="size-4 animate-spin" />
												Submitting...
											</>
										) : (
											<>
												<Check className="size-4" />
												Submit Application
											</>
										)}
									</Button>
								</form>
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardHeader>
								<CardTitle>Interested?</CardTitle>
								<CardDescription>
									Apply now and get matched instantly with AI analysis.
								</CardDescription>
							</CardHeader>
							<CardContent>
								{job.isOpen ? (
									<Button
										className="w-full"
										onClick={() => setShowForm(true)}
										size="lg"
									>
										Apply Now
									</Button>
								) : (
									<div className="rounded-lg bg-muted p-4 text-center text-muted-foreground text-sm">
										This position is no longer accepting applications.
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
