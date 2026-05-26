"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, Plus, Tags, Ticket, Users } from "lucide-react";
import { MasterSubscriberPromotionAddHref } from "@/app/src/constants/master/subscriber-promotions/MasterSubscriberPromotionConstants";
import { useMasterSubscriberPromotionListPage } from "@/app/src/hooks/master/subscriber-promotions/useMasterSubscriberPromotionListPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { MasterSubscriberPromotionTable } from "@/app/src/ui/master/subscriber-promotions/MasterSubscriberPromotionTable";

export function MasterSubscriberPromotionListPage() {
	const page = useMasterSubscriberPromotionListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Subscriber Billing"
				title="Subscriber Promotions"
				description="Track promotions granted to subscribers, which codes were used, the related invoice when available, assignment mode, assigned date, and expiry."
				actions={
					<Link
						href={MasterSubscriberPromotionAddHref}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Give Promotion
					</Link>
				}
			/>
			<MasterSubscriberPromotionSummaryCards summary={page.summary} />
			<MasterSubscriberPromotionTable {...page} />
		</section>
	);
}

function MasterSubscriberPromotionSummaryCards({
	summary,
}: {
	summary: {
		availableAssignments: number;
		expiredAssignments: number;
		subscriberCount: number;
		totalAssignments: number;
		usedAssignments: number;
	};
}) {
	const metrics = [
		{
			icon: Tags,
			label: "Assigned",
			tone: "bg-skyblue/12 text-darknavy",
			value: summary.totalAssignments,
		},
		{
			icon: CheckCircle2,
			label: "Used",
			tone: "bg-citron/35 text-darknavy",
			value: summary.usedAssignments,
		},
		{
			icon: Ticket,
			label: "Available",
			tone: "bg-offwhite text-darknavy",
			value: summary.availableAssignments,
		},
		{
			icon: Clock3,
			label: "Expired",
			tone: "bg-coralpink/12 text-coralpink",
			value: summary.expiredAssignments,
		},
		{
			icon: Users,
			label: "Subscribers",
			tone: "bg-skyblue/12 text-darknavy",
			value: summary.subscriberCount,
		},
	];

	return (
		<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
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
						<p className="mt-3 text-2xl font-semibold text-darknavy">
							{metric.value}
						</p>
					</article>
				);
			})}
		</div>
	);
}
