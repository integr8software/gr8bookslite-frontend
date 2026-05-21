import { Building2, GitBranch, ShieldCheck, Users } from "lucide-react";

export function CompanySummaryCards({
	activeCompanies,
	totalBranches,
	totalCompanies,
	totalUsers,
}: {
	activeCompanies: number;
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
		<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
			{cards.map((card) => {
				const Icon = card.icon;

				return (
					<article
						key={card.label}
						className="rounded-lg border border-darknavy/10 bg-white p-3 shadow-sm"
					>
						<div className="flex items-center justify-between gap-3">
							<span className="flex h-8 w-8 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
								<Icon className="h-4 w-4" aria-hidden="true" />
							</span>
							<span className="rounded bg-darknavy/5 px-2 py-1 text-xs font-semibold text-darknavy/55">
								Workspace
							</span>
						</div>
						<p className="mt-3 text-xs font-medium text-darknavy/55">
							{card.label}
						</p>
						<p className="mt-1 text-xl font-semibold text-darknavy">
							{card.value}
						</p>
						<p className="mt-1 text-xs text-darknavy/55">
							{card.supportingText}
						</p>
					</article>
				);
			})}
		</section>
	);
}
