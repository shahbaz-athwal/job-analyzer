"use client";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { ModeToggle } from "./mode-toggle";

export default function Header() {
	const pathname = usePathname();

	const links = [
		{ to: "/jobs", label: "Find Jobs" },
		{ to: "/dashboard", label: "Recruiter" },
	] as const;

	return (
		<div className="border-b bg-background/80 backdrop-blur-sm">
			<div className="container mx-auto flex flex-row items-center justify-between px-4 py-3">
				<div className="flex items-center gap-8">
					<Link
						className="flex items-center gap-2 font-semibold tracking-tight"
						href="/"
					>
						<Briefcase className="size-5" />
						<span className="hidden sm:inline">HireRank</span>
					</Link>
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
				<div className="flex items-center gap-2">
					<ModeToggle />
				</div>
			</div>
		</div>
	);
}
