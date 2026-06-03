"use client";

import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { MasterSubscriberManagementAddHref } from "@/app/src/constants/master/subscriber-management/MasterSubscriberManagementConstants";
import { useMasterSubscriberManagementListPage } from "@/app/src/hooks/master/subscriber-management/useMasterSubscriberManagementListPage";
import type { MasterSubscriberManagementSummaryMetric } from "@/app/src/types/master/subscriber-management/MasterSubscriberManagementTypes";
import { MasterSubscriberManagementTable } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementTable";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function MasterSubscriberManagementListPage() {
	const page = useMasterSubscriberManagementListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				titleAs="h1"
				title="Subscribers"
				description="View and manage all subscribers in your system."
				eyebrow={
					<>
						<Users className="h-3.5 w-3.5" aria-hidden="true" />
						Master subscribers
					</>
				}
				actions={
					<Link
						href={MasterSubscriberManagementAddHref}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Subscriber
					</Link>
				}
			/>
			<SubscriberSummaryCards metrics={page.metrics} />
			<MasterSubscriberManagementTable {...page} />
		</section>
	);
}

function SubscriberSummaryCards({
	metrics,
}: {
	metrics: MasterSubscriberManagementSummaryMetric[];
}) {
	return (
		<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
			{metrics.map((metric) => {
				const Icon = metric.icon;

				return (
					<article
						key={metric.label}
						className="grid min-h-32 grid-cols-[4rem_1fr] items-center gap-4 rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5"
					>
						<span
							className={joinClasses(
								"flex h-16 w-16 items-center justify-center rounded-2xl",
								getMetricToneClassName(metric.tone),
							)}
						>
							<Icon className="h-8 w-8" aria-hidden="true" />
						</span>
						<span className="min-w-0">
							<span className="block text-sm font-semibold text-darknavy/70">
								{metric.label}
							</span>
							<span className="mt-2 block text-3xl font-bold leading-none text-darknavy">
								{metric.value}
							</span>
							<span className="mt-3 block text-sm font-medium text-darknavy/60">
								{metric.helper}
							</span>
						</span>
					</article>
				);
			})}
		</div>
	);
}

function getMetricToneClassName(
	tone: MasterSubscriberManagementSummaryMetric["tone"],
) {
	switch (tone) {
		case "blue":
			return "bg-skyblue/14 text-blue-700";
		case "emerald":
			return "bg-emerald-500/14 text-emerald-700";
		case "amber":
			return "bg-orange-500/12 text-orange-600";
		case "rose":
			return "bg-coralpink/12 text-coralpink";
	}
}
