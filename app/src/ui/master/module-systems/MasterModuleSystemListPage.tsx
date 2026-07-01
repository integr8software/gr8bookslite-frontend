"use client";

import Link from "next/link";
import { Check, CircleOff, Layers3, ListTree, Plus } from "lucide-react";
import { MasterModuleSystemAddHref } from "@/app/src/constants/master/module-systems/MasterModuleSystemConstants";
import { useMasterModuleSystemListPage } from "@/app/src/hooks/master/module-systems/useMasterModuleSystemListPage";
import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { MasterModuleSystemTable } from "@/app/src/ui/master/module-systems/MasterModuleSystemTable";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function MasterModuleSystemListPage() {
	const listPage = useMasterModuleSystemListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Master"
				title="System Maintenance"
				description="Classify modules into systems, assign available modules, and configure each system's default sidebar template."
				actions={
					<Link
						href={MasterModuleSystemAddHref}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add System
					</Link>
				}
			/>

			<MasterModuleSystemSummaryCards
				isLoading={listPage.isLoading}
				summary={listPage.summary}
			/>

			<MasterModuleSystemTable {...listPage} />
		</section>
	);
}

function MasterModuleSystemSummaryCards({
	isLoading,
	summary,
}: {
	isLoading: boolean;
	summary: {
		activeSystems: number;
		configuredSidebars: number;
		inactiveSystems: number;
		totalSystems: number;
	};
}) {
	const metrics = [
		{
			icon: Layers3,
			label: "Total System",
			tone: "bg-skyblue/12 text-darknavy",
			value: summary.totalSystems,
		},
		{
			icon: Check,
			label: "Active",
			tone: "bg-citron/35 text-darknavy",
			value: summary.activeSystems,
		},
		{
			icon: CircleOff,
			label: "Inactive",
			tone: "bg-coralpink/12 text-coralpink",
			value: summary.inactiveSystems,
		},
		{
			icon: ListTree,
			label: "Sidebar Templates",
			tone: "bg-skyblue/12 text-darknavy",
			value: summary.configuredSidebars,
		},
	];

	return (
		<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
			{metrics.map((metric) => {
				const Icon = metric.icon;

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
							{isLoading ? (
								<AppSkeleton className="h-7 w-14 rounded-md" />
							) : (
								metric.value
							)}
						</div>
					</article>
				);
			})}
		</div>
	);
}
