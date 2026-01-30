"use client";

import { useQuery } from "convex/react";
import { Suspense } from "react";
import { api } from "@/convex/_generated/api";
import {
  CreateJobSheet,
  CreateJobTrigger,
} from "./_components/create-job-sheet";
import { JobsList } from "./_components/jobs-list";

function DashboardContent() {
  const jobs = useQuery(api.jobs.listAll);

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
        <CreateJobTrigger />
      </div>

      <JobsList jobs={jobs} />
      <CreateJobSheet />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
