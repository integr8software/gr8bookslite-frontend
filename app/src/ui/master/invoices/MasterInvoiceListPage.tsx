"use client";

import { useState } from "react";
import {
	AlertTriangle,
	Building2,
	CalendarClock,
	ReceiptText,
} from "lucide-react";
import { type MasterInvoiceAnalyticsMetric } from "@/app/src/data/master/invoices/MasterInvoiceAnalyticsData";
import { formatMasterInvoiceCurrency } from "@/app/src/data/master/invoices/MasterInvoiceData";
import { useMasterInvoiceListPage } from "@/app/src/hooks/master/invoices/useMasterInvoiceListPage";
import { MasterInvoiceAnalyticsChart } from "@/app/src/ui/master/invoices/MasterInvoiceAnalyticsChart";
import { MasterInvoiceCompanyTable } from "@/app/src/ui/master/invoices/MasterInvoiceCompanyTable";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function MasterInvoiceListPage() {
	const page = useMasterInvoiceListPage();
	const [activeChartMetric, setActiveChartMetric] =
		useState<MasterInvoiceAnalyticsMetric | null>(null);

	function handleToggleMetric(metric: MasterInvoiceAnalyticsMetric) {

		setActiveChartMetric((current) => (current === metric ? null : metric));
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Platform Financials"
				title="Revenue & Transactions"
				description="Organized billing, subscription status, collected revenues, pending payments, and transaction records across all subscriber companies."
			/>
			<ModuleStatisticCards
				items={[
					{
						icon: Building2,
						isActive: activeChartMetric === "subscribers",
						label: "Subscribers",
						helper: "Active & scheduled",
						onClick: () => handleToggleMetric("subscribers"),
						tone: "blue",
						value: page.metrics.totalSubscribers,
					},
					{
						icon: ReceiptText,
						isActive: activeChartMetric === "collected",
						label: "Total Collected",
						helper: `${page.metrics.totalInvoicesCount} total transactions`,
						onClick: () => handleToggleMetric("collected"),
						tone: "emerald",
						value: formatMasterInvoiceCurrency(page.metrics.totalCollectedRevenue),
					},
					{
						icon: CalendarClock,
						isActive: activeChartMetric === "pending",
						label: "Pending Revenue",
						helper: `${page.metrics.pendingInvoiceCount} pending collections`,
						onClick: () => handleToggleMetric("pending"),
						tone: "amber",
						value: formatMasterInvoiceCurrency(page.metrics.totalPendingRevenue),
					},
					{
						icon: AlertTriangle,
						isActive: activeChartMetric === "attention",
						label: "Needs Attention",
						helper: `${page.metrics.failedInvoiceCount} failed invoices`,
						onClick: () => handleToggleMetric("attention"),
						tone: "red",
						value: `${page.metrics.pastDueSubscribers} past due`,
					},
				]}
			/>
			{activeChartMetric ? (
				<MasterInvoiceAnalyticsChart
					activeMetric={activeChartMetric}
					onClose={() => setActiveChartMetric(null)}
					onSelectMetric={(m) => setActiveChartMetric(m)}
				/>
			) : null}
			<MasterInvoiceCompanyTable {...page} />
		</section>
	);
}



