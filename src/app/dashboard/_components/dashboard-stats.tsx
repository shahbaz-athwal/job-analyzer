import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardStatsProps {
  totalJobs: number | undefined;
  openJobs: number;
  totalApplicants: number;
}

export function DashboardStats({
  totalJobs,
  openJobs,
  totalApplicants,
}: DashboardStatsProps) {
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Jobs</CardDescription>
          <CardTitle className="text-3xl">{totalJobs ?? "-"}</CardTitle>
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
  );
}
