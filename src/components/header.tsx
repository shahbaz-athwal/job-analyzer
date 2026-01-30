"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const APPLICANT_PREVIEW_REGEX = /^\/dashboard\/jobs\/[^/]+\/[^/]+$/;

export default function Header() {
  const pathname = usePathname();

  const links = [
    { to: "/jobs", label: "Find Jobs" },
    { to: "/dashboard", label: "Recruiter" },
  ] as const;

  const isApplicantPreviewPage = pathname.match(APPLICANT_PREVIEW_REGEX);
  if (isApplicantPreviewPage) {
    return null;
  }

  return (
    <div className="border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex flex-row items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <nav className="flex gap-1">
            {links.map(({ to, label }) => {
              const isActive = pathname === to || pathname.startsWith(`${to}/`);
              return (
                <Link
                  className={cn(
                    "rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                  href={to}
                  key={to}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
