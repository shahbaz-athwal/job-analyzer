"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { CreateJobSheet } from "./_components/create-job-sheet";
import { DashboardStats } from "./_components/dashboard-stats";
import { JobsList } from "./_components/jobs-list";

export default function DashboardPage() {
  const jobs = useQuery(api.jobs.listAll);
  const [sheetOpen, setSheetOpen] = useState(false);

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
        <CreateJobSheet onOpenChange={setSheetOpen} open={sheetOpen} />
      </div>

      <DashboardStats
        openJobs={openJobs}
        totalApplicants={totalApplicants}
        totalJobs={jobs?.length}
      />

      <JobsList jobs={jobs} onCreateClick={() => setSheetOpen(true)} />
    </div>
  );
}
