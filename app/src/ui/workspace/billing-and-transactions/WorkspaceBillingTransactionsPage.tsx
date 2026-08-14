"use client";

import {
	CalendarClock,
	CreditCard,
	FileText,
	ReceiptText,
	WalletCards,
} from "lucide-react";
import { WorkspaceBillingTransactionTabs } from "@/app/src/constants/workspace/billing-and-transactions/WorkspaceBillingTransactionsConstants";
import {
	formatWorkspaceBillingTransactionAmount,
	formatWorkspaceBillingTransactionDate,
} from "@/app/src/data/workspace/billing-and-transactions/WorkspaceBillingTransactionsData";
import { useWorkspaceBillingTransactionsPage } from "@/app/src/hooks/workspace/billing-and-transactions/useWorkspaceBillingTransactionsPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { WorkspaceBillingTransactionDetailDrawer } from "@/app/src/ui/workspace/billing-and-transactions/WorkspaceBillingTransactionDetailDrawer";
import { WorkspaceBillingTransactionsTable } from "@/app/src/ui/workspace/billing-and-transactions/WorkspaceBillingTransactionsTable";

export function WorkspaceBillingTransactionsPage() {
	const page = useWorkspaceBillingTransactionsPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Workspace billing"
				title="Billing & Transactions"
				description="Review provider-neutral billing summaries, invoices, payments, subscription renewals, and add-on charges for the workspace."
			/>

			<ModuleTabs
				activeTab={page.activeSection}
				ariaLabel="Billing and transactions sections"
				onTabChange={page.setActiveSection}
				tabs={WorkspaceBillingTransactionTabs}
			/>

			{page.activeSection === "overview" ? (
				<>
					<ModuleStatisticCards
						items={[
							{
								icon: WalletCards,
								label: "Current Plan",
								helper: page.subscription?.status ?? "Mock data",
								tone: "blue",
								value: page.summary.currentPlan,
							},
							{
								icon: CreditCard,
								label: "Billing Mode",
								helper: "Workspace default",
								tone: "violet",
								value: page.summary.billingMode,
							},
							{
								icon: CalendarClock,
								label: "Next Billing",
								helper: "Renewal date",
								tone: "amber",
								value: formatWorkspaceBillingTransactionDate(
									page.summary.nextBillingDate,
								),
							},
							{
								icon: ReceiptText,
								label: "Outstanding",
								helper: "Open balance",
								tone: "cyan",
								value: formatWorkspaceBillingTransactionAmount(
									page.summary.outstandingBalance,
								),
							},
						]}
					/>

					<div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
						<WorkspaceBillingTotalsCard
							totalBilled={page.summary.totalBilled}
							totalPaid={page.summary.totalPaid}
						/>
						<WorkspaceBillingRecentTransactions
							onSelectRecord={page.setSelectedRecordId}
							records={page.recentRecords}
						/>
					</div>
				</>
			) : null}

			<WorkspaceBillingTransactionsTable page={page} />

			<WorkspaceBillingTransactionDetailDrawer
				record={page.selectedRecord}
				onClose={() => page.setSelectedRecordId(null)}
			/>
		</section>
	);
}

function WorkspaceBillingTotalsCard({
	totalBilled,
	totalPaid,
}: {
	totalBilled: number;
	totalPaid: number;
}) {
	const rows = [
		{ label: "Total Billed", value: totalBilled },
		{ label: "Total Paid", value: totalPaid },
	];

	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
			<div className="flex items-center gap-3">
				<span className="flex h-10 w-10 items-center justify-center rounded-lg bg-skyblue/12 text-skyblue">
					<FileText className="h-5 w-5" aria-hidden="true" />
				</span>
				<div>
					<h2 className="text-base font-semibold text-darknavy">
						Billing Summary
					</h2>
					<p className="text-sm text-darknavy/58">
						Mock totals across plan charges, renewals, companies, users, and add-ons.
					</p>
				</div>
			</div>
			<div className="mt-5 grid gap-3 sm:grid-cols-2">
				{rows.map((row) => (
					<div
						key={row.label}
						className="rounded-lg border border-darknavy/10 bg-offwhite p-4"
					>
						<p className="text-xs font-semibold uppercase tracking-[0.12em] text-darknavy/45">
							{row.label}
						</p>
						<p className="mt-2 text-2xl font-semibold text-darknavy">
							{formatWorkspaceBillingTransactionAmount(row.value)}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}

function WorkspaceBillingRecentTransactions({
	onSelectRecord,
	records,
}: {
	onSelectRecord: (recordId: string) => void;
	records: ReturnType<typeof useWorkspaceBillingTransactionsPage>["recentRecords"];
}) {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
			<h2 className="text-base font-semibold text-darknavy">
				Recent Transactions
			</h2>
			<div className="mt-4 grid gap-2">
				{records.map((record) => (
					<button
						key={record.id}
						type="button"
						onClick={() => onSelectRecord(record.id)}
						className="grid gap-2 rounded-lg border border-darknavy/10 p-3 text-left transition hover:border-skyblue/45 hover:bg-skyblue/5 sm:grid-cols-[1fr_auto]"
					>
						<span className="min-w-0">
							<span className="block truncate text-sm font-semibold text-darknavy">
								{record.description}
							</span>
							<span className="mt-1 block text-xs text-darknavy/55">
								{record.invoiceNo} ·{" "}
								{formatWorkspaceBillingTransactionDate(record.date)}
							</span>
						</span>
						<span
							className={joinClasses(
								"text-sm font-semibold",
								record.amount < 0 ? "text-emerald-700" : "text-darknavy",
							)}
						>
							{formatWorkspaceBillingTransactionAmount(record.amount)}
						</span>
					</button>
				))}
			</div>
		</section>
	);
}
