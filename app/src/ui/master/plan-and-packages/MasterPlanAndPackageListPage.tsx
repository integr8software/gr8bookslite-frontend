"use client";

import Link from "next/link";
import {
	BadgePercent,
	Check,
	Layers3,
	Package,
	Plus,
	ToggleLeft,
} from "lucide-react";
import { MasterPlanAndPackageAddHref } from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import { useMasterPlanAndPackageListPage } from "@/app/src/hooks/master/plan-and-packages/useMasterPlanAndPackageListPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { MasterPlanAndPackageTable } from "@/app/src/ui/master/plan-and-packages/MasterPlanAndPackageTable";

export function MasterPlanAndPackageListPage() {
	const page = useMasterPlanAndPackageListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Subscription & Billing"
				title="Plan and Packages"
				description="Maintain plan records, activation status, module entitlements, pricing terms, and company, branch, and user scale rules."
				actions={
					<Link
						href={MasterPlanAndPackageAddHref}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Plan
					</Link>
				}
			/>
			<MasterPlanAndPackageSummaryCards
				isLoading={page.isLoading}
				summary={page.summary}
			/>
			<MasterPlanAndPackageTable {...page} />
		</section>
	);
}

function MasterPlanAndPackageSummaryCards({
	isLoading,
	summary,
}: {
	isLoading: boolean;
	summary: {
		activePlans: number;
		addOnScalePlans: number;
		draftPlans: number;
		enabledModules: number;
		inactivePlans: number;
		totalPlans: number;
	};
}) {
	const metrics = [
		{
			icon: Package,
			label: "Total Plans",
			tone: "bg-skyblue/12 text-darknavy",
			value: summary.totalPlans,
		},
		{
			icon: Check,
			label: "Active",
			tone: "bg-citron/35 text-darknavy",
			value: summary.activePlans,
		},
		{
			icon: BadgePercent,
			label: "Draft",
			tone: "bg-offwhite text-darknavy",
			value: summary.draftPlans,
		},
		{
			icon: ToggleLeft,
			label: "Inactive",
			tone: "bg-coralpink/12 text-coralpink",
			value: summary.inactivePlans,
		},
		{
			icon: Layers3,
			label: "Enabled Modules",
			tone: "bg-skyblue/12 text-darknavy",
			value: summary.enabledModules,
		},
		{
			icon: BadgePercent,
			label: "Scale Add-ons",
			tone: "bg-offwhite text-darknavy",
			value: summary.addOnScalePlans,
		},
	];

	return (
		<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
			{metrics.map((metric) => {
				const Icon = metric.icon;
				const value = isLoading ? (
					<AppSkeleton className="h-7 w-14 rounded-md" />
				) : (
					metric.value
				);

				return (
					<article
						key={metric.label}
						className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm"
					>
						<div className="flex items-center justify-between gap-3">
							<p className="text-sm font-medium text-darknavy/58">
								{metric.label}
							</p>
							<span
								className={joinClasses(
									"flex h-9 w-9 items-center justify-center rounded-lg",
									metric.tone,
								)}
							>
								<Icon className="h-4 w-4" aria-hidden="true" />
							</span>
						</div>
						<div className="mt-3 text-2xl font-semibold text-darknavy">
							{value}
						</div>
					</article>
				);
			})}
		</div>
	);
}
