import {
	ArrowRight,
	BarChart3,
	Briefcase,
	FileSearch,
	Sparkles,
	Users,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function Home() {
	return (
		<div className="flex flex-col">
			{/* Hero Section */}
			<section className="relative overflow-hidden py-20 md:py-32">
				<div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-3xl text-center">
						<div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm backdrop-blur-sm">
							<Sparkles className="size-4 text-amber-500" />
							<span className="text-muted-foreground">
								AI-Powered Hiring Platform
							</span>
						</div>
						<h1 className="mb-6 font-bold text-4xl tracking-tight md:text-6xl">
							Hire Smarter with{" "}
							<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								AI-Ranked
							</span>{" "}
							Candidates
						</h1>
						<p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
							Upload resumes, let AI analyze qualifications, and find the
							perfect match for your team. Fast, unbiased, and data-driven.
						</p>
						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Button render={<Link href="/jobs" />} size="lg">
								<Briefcase className="size-4" />
								Browse Jobs
							</Button>
							<Button
								render={<Link href="/dashboard" />}
								size="lg"
								variant="outline"
							>
								Recruiter Dashboard
								<ArrowRight className="size-4" />
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="border-t bg-muted/30 py-20">
				<div className="container mx-auto px-4">
					<h2 className="mb-12 text-center font-semibold text-2xl tracking-tight">
						How It Works
					</h2>
					<div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
						<Card>
							<CardHeader>
								<div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10">
									<FileSearch className="size-6 text-primary" />
								</div>
								<CardTitle>Smart Analysis</CardTitle>
								<CardDescription>
									AI extracts key skills and experience from resumes, matching
									them against job requirements automatically.
								</CardDescription>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader>
								<div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10">
									<BarChart3 className="size-6 text-primary" />
								</div>
								<CardTitle>Ranked Results</CardTitle>
								<CardDescription>
									Candidates are scored 0-100 based on qualification match, with
									detailed breakdowns of strengths and gaps.
								</CardDescription>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader>
								<div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10">
									<Users className="size-6 text-primary" />
								</div>
								<CardTitle>Unbiased Hiring</CardTitle>
								<CardDescription>
									Focus on skills and experience. AI ignores demographic info to
									help reduce unconscious bias.
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-t py-20">
				<div className="container mx-auto px-4 text-center">
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						Ready to transform your hiring?
					</h2>
					<p className="mb-8 text-muted-foreground">
						Create your first job posting in minutes.
					</p>
					<Button render={<Link href="/dashboard/jobs/new" />} size="lg">
						Create Job Posting
						<ArrowRight className="size-4" />
					</Button>
				</div>
			</section>
		</div>
	);
}
