"use client";

import Link from "next/link";
import { BadgePercent, CalendarDays, Check, Plus, Tags, Ticket } from "lucide-react";
import { MasterPromotionAddHref } from "@/app/src/constants/master/promotions/MasterPromotionConstants";
import { useMasterPromotionListPage } from "@/app/src/hooks/master/promotions/useMasterPromotionListPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { MasterPromotionTable } from "@/app/src/ui/master/promotions/MasterPromotionTable";

export function MasterPromotionListPage() {
	const page = useMasterPromotionListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Discounts"
				title="Promotions"
				description="Manage promo codes, coupons, vouchers, event promos, billing-cycle coverage, target plans, limits, expiration, starting dates, and status."
				actions={
					<Link
						href={MasterPromotionAddHref}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Promotion
					</Link>
				}
			/>
			<MasterPromotionSummaryCards summary={page.summary} />
			<MasterPromotionTable {...page} />
			<AppDialog
				isOpen={Boolean(page.pendingDeleteRecord)}
				title="Delete promotion?"
				description={`This will remove ${page.pendingDeleteRecord?.name ?? "the selected promotion"}.`}
				confirmLabel="Delete"
				tone="danger"
				onCancel={() => page.setPendingDeleteRecord(null)}
				onConfirm={page.confirmDeleteRecord}
			/>
		</section>
	);
}

function MasterPromotionSummaryCards({
	summary,
}: {
	summary: {
		activeRecords: number;
		couponRecords: number;
		eventPromoRecords: number;
		totalRecords: number;
		voucherRecords: number;
	};
}) {
	const metrics = [
		{
			icon: Tags,
			label: "Total Promotions",
			tone: "bg-skyblue/12 text-darknavy",
			value: summary.totalRecords,
		},
		{
			icon: Check,
			label: "Active",
			tone: "bg-citron/35 text-darknavy",
			value: summary.activeRecords,
		},
		{
			icon: BadgePercent,
			label: "Coupons",
			tone: "bg-offwhite text-darknavy",
			value: summary.couponRecords,
		},
		{
			icon: Ticket,
			label: "Vouchers",
			tone: "bg-coralpink/12 text-coralpink",
			value: summary.voucherRecords,
		},
		{
			icon: CalendarDays,
			label: "Event Promos",
			tone: "bg-skyblue/12 text-darknavy",
			value: summary.eventPromoRecords,
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
