"use client";

import { BadgePercent, CheckCircle2, Tags, Ticket, Users } from "lucide-react";
import { useWorkspaceVouchersAndCouponsPage } from "@/app/src/hooks/workspace/vouchers-and-coupons/useWorkspaceVouchersAndCouponsPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";
import { WorkspaceVouchersAndCouponsTable } from "@/app/src/ui/workspace/vouchers-and-coupons/WorkspaceVouchersAndCouponsTable";

export function WorkspaceVouchersAndCouponsPage() {
	const page = useWorkspaceVouchersAndCouponsPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Workspace billing"
				title="Vouchers and Coupons"
				description="Subscriber voucher and coupon assignments based on the master subscriber setup."
			/>
			<ModuleMetrics
				metrics={[
					{
						icon: Tags,
						label: "Assigned",
						helper: "Filtered assignments",
						tone: "blue",
						value: page.summary.totalRecords,
					},
					{
						icon: Ticket,
						label: "Available",
						helper: "Subscriber status",
						tone: "violet",
						value: page.summary.availableRecords,
					},
					{
						icon: CheckCircle2,
						label: "Applicable",
						helper: "Active codes",
						tone: "emerald",
						value: page.summary.canApplyRecords,
					},
					{
						icon: BadgePercent,
						label: "Used",
						helper: "Invoice-linked",
						tone: "cyan",
						value: page.summary.usedRecords,
					},
					{
						icon: Users,
						label: "Subscribers",
						helper: "Companies with assignments",
						tone: "slate",
						value: page.summary.subscriberCount,
					},
				]}
			/>
			<WorkspaceVouchersAndCouponsTable {...page} />
		</section>
	);
}
