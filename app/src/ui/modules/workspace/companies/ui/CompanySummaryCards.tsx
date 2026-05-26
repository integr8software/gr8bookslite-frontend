import { Building2, GitBranch, ShieldCheck, Users } from "lucide-react";
import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";

export function CompanySummaryCards({
	activeCompanies,
	isLoading = false,
	totalBranches,
	totalCompanies,
	totalUsers,
}: {
	activeCompanies: number;
	isLoading?: boolean;
	totalBranches: number;
	totalCompanies: number;
	totalUsers: number;
}) {
	const cards = [
		{
			icon: Building2,
			label: "Total Companies",
			supportingText: `${activeCompanies} active companies`,
			value: totalCompanies,
		},
		{
			icon: Users,
			label: "Total Users",
			supportingText: "Company-level users",
			value: totalUsers,
		},
		{
			icon: GitBranch,
			label: "Branches",
			supportingText: "Across all companies",
			value: totalBranches,
		},
		{
			icon: ShieldCheck,
			label: "Workspace Scope",
			supportingText: "Company, branch, and role setup",
			value: "Admin",
		},
	];

	return (
		<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{cards.map((card) => {
				const Icon = card.icon;

				return (
					<article
						key={card.label}
						className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm"
					>
						<div className="flex items-center justify-between gap-3">
							<span className="flex h-11 w-11 items-center justify-center rounded-lg bg-skyblue/15 text-darknavy">
								<Icon className="h-5 w-5" aria-hidden="true" />
							</span>
							{isLoading ? (
								<AppSkeleton className="h-8 w-24 rounded-md" />
							) : (
								<span className="rounded-md bg-darknavy/5 px-3 py-1.5 text-sm font-semibold text-darknavy/55">
									Workspace
								</span>
							)}
						</div>
						{isLoading ? (
							<div className="mt-5 grid gap-3">
								<AppSkeleton className="h-4 w-32 rounded-md" />
								<AppSkeleton className="h-8 w-14 rounded-md" />
								<AppSkeleton className="h-4 w-40 rounded-md" />
							</div>
						) : (
							<>
								<p className="mt-4 text-sm font-medium text-darknavy/55">
									{card.label}
								</p>
								<p className="mt-1 text-3xl font-semibold text-darknavy">
									{card.value}
								</p>
								<p className="mt-2 text-sm text-darknavy/55">
									{card.supportingText}
								</p>
							</>
						)}
					</article>
				);
			})}
		</section>
	);
}
