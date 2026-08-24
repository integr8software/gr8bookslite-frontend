"use client";

import {
	AlertTriangle,
	Building2,
	CalendarClock,
	ReceiptText,
} from "lucide-react";
import { formatMasterInvoiceCurrency } from "@/app/src/data/master/invoices/MasterInvoiceData";
import { useMasterInvoiceListPage } from "@/app/src/hooks/master/invoices/useMasterInvoiceListPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { MasterInvoiceCompanyTable } from "@/app/src/ui/master/invoices/MasterInvoiceCompanyTable";

export function MasterInvoiceListPage() {
	const page = useMasterInvoiceListPage();

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
						label: "Subscribers",
						helper: "Active & scheduled",
						tone: "blue",
						value: page.metrics.totalSubscribers,
					},
					{
						icon: ReceiptText,
						label: "Total Collected",
						helper: `${page.metrics.totalInvoicesCount} total transactions`,
						tone: "emerald",
						value: formatMasterInvoiceCurrency(page.metrics.totalCollectedRevenue),
					},
					{
						icon: CalendarClock,
						label: "Pending Revenue",
						helper: `${page.metrics.pendingInvoiceCount} pending collections`,
						tone: "amber",
						value: formatMasterInvoiceCurrency(page.metrics.totalPendingRevenue),
					},
					{
						icon: AlertTriangle,
						label: "Needs Attention",
						helper: `${page.metrics.failedInvoiceCount} failed invoices`,
						tone: "red",
						value: `${page.metrics.pastDueSubscribers} past due`,
					},

				]}
			/>
			<MasterInvoiceCompanyTable {...page} />
		</section>
	);
}


