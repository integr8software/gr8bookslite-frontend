"use client";

import Link from "next/link";
import {
	Check,
	Layers3,
	Plus,
	Puzzle,
	ToggleLeft,
} from "lucide-react";
import { MasterAddOnAddHref } from "@/app/src/constants/master/add-ons/MasterAddOnConstants";
import { useMasterAddOnListPage } from "@/app/src/hooks/master/add-ons/useMasterAddOnListPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { MasterAddOnTable } from "@/app/src/ui/master/add-ons/MasterAddOnTable";

export function MasterAddOnListPage() {
	const page = useMasterAddOnListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Subscription & Billing"
				title="Add-Ons"
				description="Manage optional module add-ons, pricing configurations, and feature entitlements that extend base subscription plans."
				actions={
					<Link
						href={MasterAddOnAddHref}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Add-On
					</Link>
				}
			/>
			<MasterAddOnSummaryCards
				isLoading={page.isLoading}
				summary={page.summary}
			/>
			<MasterAddOnTable {...page} />
		</section>
	);
}

function MasterAddOnSummaryCards({
	isLoading,
	summary,
}: {
	isLoading: boolean;
	summary: {
		activeAddOns: number;
		inactiveAddOns: number;
		linkedModules: number;
		totalAddOns: number;
	};
}) {
	const metrics = [
		{
			icon: Puzzle,
			label: "Total Add-Ons",
			tone: "bg-skyblue/12 text-darknavy",
			value: summary.totalAddOns,
		},
		{
			icon: Check,
			label: "Active",
			tone: "bg-citron/35 text-darknavy",
			value: summary.activeAddOns,
		},
		{
			icon: ToggleLeft,
			label: "Inactive",
			tone: "bg-coralpink/12 text-coralpink",
			value: summary.inactiveAddOns,
		},
		{
			icon: Layers3,
			label: "Linked Modules",
			tone: "bg-skyblue/12 text-darknavy",
			value: summary.linkedModules,
		},
	];

	return (
		<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
								<Icon
									className="h-4 w-4"
									aria-hidden="true"
								/>
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
