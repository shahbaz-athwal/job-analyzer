"use client";

import { useQuery } from "convex/react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function ApplicationSuccessPage() {
  const params = useParams();
  const jobId = params.id as Id<"jobs">;
  const job = useQuery(api.jobs.get, { id: jobId });

  return (
    <div className="container mx-auto flex max-w-lg flex-col items-center px-4 py-16">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 className="size-10 text-green-600 dark:text-green-400" />
      </div>

      <Card className="w-full text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Application Submitted!</CardTitle>
          <CardDescription className="text-base">
            Thank you for applying
            {job ? ` to ${job.title} at ${job.company}` : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="mb-2 flex items-center justify-center gap-2 font-medium text-sm">
              <Sparkles className="size-4 text-amber-500" />
              AI Analysis in Progress
            </div>
            <p className="text-muted-foreground text-sm">
              Your resume is being analyzed against the job requirements. The
              recruiter will see your match score and qualifications summary.
            </p>
          </div>

          <div className="text-muted-foreground text-sm">
            <p className="mb-1">What happens next?</p>
            <ul className="space-y-1 text-left">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                AI analyzes your resume for skill matches
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                Recruiter reviews candidates by ranking
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                You'll be contacted if selected
              </li>
            </ul>
          </div>

          <Button className="w-full" render={<Link href="/jobs" />}>
            Browse More Jobs
            <ArrowRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
