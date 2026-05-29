"use client";

import { BadgePercent, CheckCircle2, Tags, Ticket, Users } from "lucide-react";
import { useWorkspaceVoucherCouponPromotionPage } from "@/app/src/hooks/workspace/voucher-coupon-promotion/useWorkspaceVoucherCouponPromotionPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";
import { WorkspaceVoucherCouponPromotionTable } from "@/app/src/ui/workspace/voucher-coupon-promotion/WorkspaceVoucherCouponPromotionTable";

export function WorkspaceVoucherCouponPromotionPage() {
	const page = useWorkspaceVoucherCouponPromotionPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Workspace billing"
				title="Voucher, Coupon, Promotion"
				description="Subscriber promotion assignments based on the master promotion and subscriber promotion setup."
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
						helper: "Active master codes",
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
			<WorkspaceVoucherCouponPromotionTable {...page} />
		</section>
	);
}

