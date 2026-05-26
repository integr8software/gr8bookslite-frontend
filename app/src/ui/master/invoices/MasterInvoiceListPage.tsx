"use client";

import {
	Banknote,
	CircleDollarSign,
	FileText,
	ReceiptText,
	Users,
} from "lucide-react";
import { formatMasterInvoiceCurrency } from "@/app/src/data/master/invoices/MasterInvoiceData";
import { useMasterInvoiceListPage } from "@/app/src/hooks/master/invoices/useMasterInvoiceListPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { MasterInvoiceTable } from "@/app/src/ui/master/invoices/MasterInvoiceTable";

export function MasterInvoiceListPage() {
	const page = useMasterInvoiceListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Subscriber Billing"
				title="Invoices"
				description="Review subscriber transactions, what each company availed, the transaction date, payment method, reference number, amount, and payment status."
			/>
			<MasterInvoiceSummaryCards summary={page.summary} />
			<MasterInvoiceTable {...page} />
		</section>
	);
}

function MasterInvoiceSummaryCards({
	summary,
}: {
	summary: {
		failedInvoices: number;
		paidAmount: number;
		paidInvoices: number;
		pendingInvoices: number;
		subscriberCount: number;
		totalInvoices: number;
	};
}) {
	const metrics = [
		{
			icon: FileText,
			label: "Total Invoices",
			tone: "bg-skyblue/12 text-darknavy",
			value: summary.totalInvoices,
		},
		{
			icon: ReceiptText,
			label: "Paid",
			tone: "bg-citron/35 text-darknavy",
			value: summary.paidInvoices,
		},
		{
			icon: Banknote,
			label: "Pending",
			tone: "bg-offwhite text-darknavy",
			value: summary.pendingInvoices,
		},
		{
			icon: CircleDollarSign,
			label: "Failed",
			tone: "bg-coralpink/12 text-coralpink",
			value: summary.failedInvoices,
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
			<article className="rounded-lg border border-darknavy/10 bg-darknavy p-4 text-white shadow-sm md:col-span-2 xl:col-span-5">
				<p className="text-sm font-semibold text-white/65">Paid revenue</p>
				<p className="mt-2 text-2xl font-semibold">
					{formatMasterInvoiceCurrency(summary.paidAmount)}
				</p>
			</article>
		</div>
	);
}
