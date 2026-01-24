"use client";

import { api } from "@job-analyzer/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type JobType = "full-time" | "part-time" | "contract" | "internship";

export default function CreateJobPage() {
	const router = useRouter();
	const createJob = useMutation(api.jobs.create);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [title, setTitle] = useState("");
	const [company, setCompany] = useState("");
	const [location, setLocation] = useState("");
	const [type, setType] = useState<JobType>("full-time");
	const [description, setDescription] = useState("");
	const [requirements, setRequirements] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!(title && company && location && description && requirements)) return;

		setIsSubmitting(true);
		try {
			const jobId = await createJob({
				title,
				company,
				location,
				type,
				description,
				requirements,
			});
			router.push(`/dashboard/jobs/${jobId}`);
		} catch (error) {
			console.error("Failed to create job:", error);
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container mx-auto max-w-2xl px-4 py-8">
			<Link
				className="mb-6 inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
				href="/dashboard"
			>
				<ArrowLeft className="size-4" />
				Back to dashboard
			</Link>

			<Card>
				<CardHeader>
					<CardTitle>Create New Job</CardTitle>
					<CardDescription>
						Fill out the details for your new job posting.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-6" onSubmit={handleSubmit}>
						<div className="grid gap-6 sm:grid-cols-2">
							<div className="space-y-2">
								<label className="font-medium text-sm" htmlFor="title">
									Job Title *
								</label>
								<Input
									id="title"
									onChange={(e) => setTitle(e.target.value)}
									placeholder="e.g. Senior Software Engineer"
									required
									value={title}
								/>
							</div>

							<div className="space-y-2">
								<label className="font-medium text-sm" htmlFor="company">
									Company *
								</label>
								<Input
									id="company"
									onChange={(e) => setCompany(e.target.value)}
									placeholder="e.g. Acme Corp"
									required
									value={company}
								/>
							</div>

							<div className="space-y-2">
								<label className="font-medium text-sm" htmlFor="location">
									Location *
								</label>
								<Input
									id="location"
									onChange={(e) => setLocation(e.target.value)}
									placeholder="e.g. San Francisco, CA / Remote"
									required
									value={location}
								/>
							</div>

							<div className="space-y-2">
								<label className="font-medium text-sm">Job Type *</label>
								<Select
									onValueChange={(v) => setType(v as JobType)}
									value={type}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectPopup>
										<SelectItem value="full-time">Full-time</SelectItem>
										<SelectItem value="part-time">Part-time</SelectItem>
										<SelectItem value="contract">Contract</SelectItem>
										<SelectItem value="internship">Internship</SelectItem>
									</SelectPopup>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<label className="font-medium text-sm" htmlFor="description">
								Job Description *
							</label>
							<Textarea
								className="min-h-32"
								id="description"
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Describe the role, responsibilities, and what makes it exciting..."
								required
								value={description}
							/>
						</div>

						<div className="space-y-2">
							<label className="font-medium text-sm" htmlFor="requirements">
								Requirements *
							</label>
							<Textarea
								className="min-h-32"
								id="requirements"
								onChange={(e) => setRequirements(e.target.value)}
								placeholder="List required skills, experience, and qualifications..."
								required
								value={requirements}
							/>
							<p className="text-muted-foreground text-xs">
								Be specific about required skills for better AI matching.
							</p>
						</div>

						<div className="flex gap-4">
							<Button
								render={<Link href="/dashboard" />}
								type="button"
								variant="outline"
							>
								Cancel
							</Button>
							<Button
								disabled={
									isSubmitting ||
									!title ||
									!company ||
									!location ||
									!description ||
									!requirements
								}
								type="submit"
							>
								{isSubmitting ? (
									<>
										<Loader2 className="size-4 animate-spin" />
										Creating...
									</>
								) : (
									<>
										<Plus className="size-4" />
										Create Job
									</>
								)}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
