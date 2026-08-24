"use client";

import {
	AlertTriangle,
	ArrowLeft,
	Building2,
	Calendar,
	CheckCircle2,
	CreditCard,
	FileText,
	GitBranch,
	Layers,
	ReceiptText,
	Users,
} from "lucide-react";
import Link from "next/link";
import { MasterInvoicesHref } from "@/app/src/constants/master/invoices/MasterInvoiceConstants";
import {
	formatMasterInvoiceCurrency,
	formatMasterInvoiceDate,
} from "@/app/src/data/master/invoices/MasterInvoiceData";
import {
	calculateMasterSubscriptionAmountLeft,
	calculateMasterSubscriptionQuote,
	formatMasterSubscriptionDate,
	MasterSubscriptionVolumeRules,
} from "@/app/src/data/master/subscriptions/MasterSubscriptionData";
import { useMasterInvoiceSubscriberPage } from "@/app/src/hooks/master/invoices/useMasterInvoiceSubscriberPage";
import type {
	MasterInvoiceRecord,
	MasterInvoiceSubscriberTab,
} from "@/app/src/types/master/invoices/MasterInvoiceTypes";
import {
	MasterInvoiceCompanyStatusBadge,
	MasterInvoicePaymentMethodBadge,
	MasterInvoiceStatusBadge,
	MasterInvoiceTransactionTypeBadge,
} from "@/app/src/ui/master/invoices/MasterInvoiceBadges";
import { MasterInvoiceTable } from "@/app/src/ui/master/invoices/MasterInvoiceTable";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function MasterInvoiceSubscriberPage({
	subscriberId,
}: {
	subscriberId: string;
}) {
	const page = useMasterInvoiceSubscriberPage(subscriberId);
	const { subscriber, plan, summary, activeTab, setActiveTab } = page;

	if (!subscriber || !summary) {
		return (
			<ModuleNotFound
				actionHref={MasterInvoicesHref}
				actionLabel="Back to Revenue & Transactions"
				description="The requested subscriber billing record does not exist or has been removed."
				title="Subscriber not found"
			/>
		);
	}

	const tabs = [
		{ id: "overview" as const, label: "Overview" },
		{
			id: "transactions" as const,
			label: "Transactions",
			badge: page.invoices.length,
		},
		{
			id: "payments" as const,
			label: "Payments",
			badge: summary.paidInvoices,
		},
		{ id: "plan" as const, label: "Plan & Pricing" },
	];

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Subscriber Financials"
				title={subscriber.name}
				description={`${subscriber.name} (${plan?.name ?? "Custom Plan"}) financial ledger, invoice history, payment breakdown, and usage quotas.`}
				actions={
					<Link
						href={MasterInvoicesHref}
						className="inline-flex h-10 items-center gap-2 rounded-lg border border-darknavy/10 bg-white px-3.5 text-sm font-semibold text-darknavy shadow-sm transition hover:bg-darknavy/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
					>
						<ArrowLeft className="h-4 w-4" aria-hidden="true" />
						Back to All Subscribers
					</Link>
				}
			/>

			<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
				<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
					<div>
						<div className="flex items-center gap-2.5">
							<h2 className="text-lg font-bold text-darknavy">{subscriber.name}</h2>
							<MasterInvoiceCompanyStatusBadge status={subscriber.status} />
						</div>
						<p className="mt-1 text-xs text-darknavy/55">
							Owner: <span className="font-semibold text-darknavy">{subscriber.ownerName}</span> · Plan:{" "}
							<span className="font-semibold text-darknavy">{plan?.name ?? "Custom"}</span> · Cycle:{" "}
							<span className="font-semibold text-darknavy">{subscriber.billingCycle}</span> · ID:{" "}
							<span className="font-mono text-darknavy/70">{subscriber.id}</span>
						</p>
					</div>
					<div className="flex items-center gap-3">
						<div className="text-right">
							<p className="text-xs font-semibold uppercase tracking-wider text-darknavy/45">
								Total Collected
							</p>
							<p className="text-lg font-bold text-emerald-700">
								{formatMasterInvoiceCurrency(summary.paidAmount)}
							</p>
						</div>
					</div>
				</div>

				<ModuleTabs<MasterInvoiceSubscriberTab>
					activeTab={activeTab}
					ariaLabel={`${subscriber.name} financial tabs`}
					onTabChange={setActiveTab}
					tabs={tabs}
				/>
			</div>

			{activeTab === "overview" ? (
				<SubscriberOverviewTab page={page} />
			) : null}

			{activeTab === "transactions" ? (
				<SubscriberTransactionsTab page={page} />
			) : null}

			{activeTab === "payments" ? (
				<SubscriberPaymentsTab page={page} />
			) : null}

			{activeTab === "plan" ? (
				<SubscriberPlanTab page={page} />
			) : null}
		</section>
	);
}

function SubscriberOverviewTab({
	page,
}: {
	page: ReturnType<typeof useMasterInvoiceSubscriberPage>;
}) {
	const { subscriber, plan, summary } = page;
	if (!subscriber || !summary) return null;

	return (
		<div className="grid gap-5">
			<ModuleStatisticCards
				items={[
					{
						icon: ReceiptText,
						label: "Total Collected",
						helper: `${summary.paidInvoices} paid invoices`,
						tone: "emerald",
						value: formatMasterInvoiceCurrency(summary.paidAmount),
					},
					{
						icon: Calendar,
						label: "Pending Invoices",
						helper: `${summary.pendingInvoices} awaiting settlement`,
						tone: "amber",
						value: formatMasterInvoiceCurrency(summary.pendingAmount),
					},
					{
						icon: AlertTriangle,
						label: "Failed Invoices",
						helper: `${summary.failedInvoices} declined charges`,
						tone: "red",
						value: summary.failedInvoices,
					},

					{
						icon: FileText,
						label: "Total Invoices",
						helper: `Lifetime records`,
						tone: "blue",
						value: summary.totalInvoices,
					},
				]}
			/>

			<div className="grid gap-5 lg:grid-cols-2">
				<article className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
					<h3 className="text-base font-semibold text-darknavy">
						Subscriber Account Profile
					</h3>
					<div className="mt-4 divide-y divide-darknavy/8 text-sm">
						<div className="flex items-center justify-between py-2.5">
							<span className="text-darknavy/55">Company Name</span>
							<span className="font-semibold text-darknavy">{subscriber.name}</span>
						</div>
						<div className="flex items-center justify-between py-2.5">
							<span className="text-darknavy/55">Account Owner</span>
							<span className="font-semibold text-darknavy">{subscriber.ownerName}</span>
						</div>
						<div className="flex items-center justify-between py-2.5">
							<span className="text-darknavy/55">Subscription Status</span>
							<MasterInvoiceCompanyStatusBadge status={subscriber.status} />
						</div>
						<div className="flex items-center justify-between py-2.5">
							<span className="text-darknavy/55">Billing Cycle</span>
							<span className="font-semibold text-darknavy">{subscriber.billingCycle}</span>
						</div>
						<div className="flex items-center justify-between py-2.5">
							<span className="text-darknavy/55">Renewal / Expiry Date</span>
							<span className="font-semibold text-darknavy">
								{formatMasterSubscriptionDate(subscriber.renewalDate)}
							</span>
						</div>
						<div className="flex items-center justify-between py-2.5">
							<span className="text-darknavy/55">Subscription Duration</span>
							<span className="font-semibold text-darknavy">{subscriber.durationMonths} months</span>
						</div>
					</div>
				</article>

				<article className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
					<h3 className="text-base font-semibold text-darknavy">
						Usage & Resource Allocations
					</h3>
					<div className="mt-4 grid grid-cols-3 gap-3">
						<div className="rounded-lg bg-offwhite p-3 text-center">
							<Building2 className="mx-auto h-5 w-5 text-darknavy/50" />
							<p className="mt-1 text-xl font-bold text-darknavy">{subscriber.companyCount}</p>
							<p className="text-xs text-darknavy/55">Companies</p>
						</div>
						<div className="rounded-lg bg-offwhite p-3 text-center">
							<GitBranch className="mx-auto h-5 w-5 text-darknavy/50" />
							<p className="mt-1 text-xl font-bold text-darknavy">{subscriber.branchCount}</p>
							<p className="text-xs text-darknavy/55">Branches</p>
						</div>
						<div className="rounded-lg bg-offwhite p-3 text-center">
							<Users className="mx-auto h-5 w-5 text-darknavy/50" />
							<p className="mt-1 text-xl font-bold text-darknavy">{subscriber.userCount}</p>
							<p className="text-xs text-darknavy/55">Users</p>
						</div>
					</div>
					<div className="mt-5 rounded-lg border border-darknavy/8 bg-offwhite/50 p-3.5">
						<div className="flex items-center gap-2 text-xs font-semibold text-darknavy/60">
							<Layers className="h-4 w-4 text-skyblue" />
							<span>Active Plan Entitlements: {plan?.name ?? "Custom"}</span>
						</div>
						<p className="mt-1.5 text-xs text-darknavy/50">
							{plan?.description ?? "Standard subscribed module tier and features."}
						</p>
					</div>
				</article>
			</div>

			<article className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<div className="flex items-center justify-between">
					<h3 className="text-base font-semibold text-darknavy">
						Recent Transactions
					</h3>
					<button
						type="button"
						onClick={() => page.setActiveTab("transactions")}
						className="text-xs font-semibold text-skyblue hover:underline"
					>
						View all {summary.totalInvoices} transactions →
					</button>
				</div>
				<div className="mt-4 overflow-x-auto">
					<table className="w-full min-w-[50rem] border-collapse text-left text-sm text-darknavy">
						<thead className="bg-offwhite text-xs font-bold uppercase tracking-[0.08em] text-darknavy/55">
							<tr>
								<th className="px-4 py-2.5">Invoice #</th>
								<th className="px-4 py-2.5">Type</th>
								<th className="px-4 py-2.5">Availed Item</th>
								<th className="px-4 py-2.5">Date</th>
								<th className="px-4 py-2.5">Payment</th>
								<th className="px-4 py-2.5">Amount</th>
								<th className="px-4 py-2.5">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-darknavy/10">
							{summary.recentInvoices.map((invoice) => (
								<tr key={invoice.id} className="transition hover:bg-skyblue/5">
									<td className="px-4 py-3 font-semibold text-darknavy">
										{invoice.invoiceNo}
									</td>
									<td className="px-4 py-3">
										<MasterInvoiceTransactionTypeBadge
											transactionType={invoice.transactionType}
										/>
									</td>
									<td className="px-4 py-3 text-xs text-darknavy/75">
										{invoice.availedItem}
									</td>
									<td className="px-4 py-3 text-xs text-darknavy/60">
										{formatMasterInvoiceDate(invoice.transactionDate)}
									</td>
									<td className="px-4 py-3">
										<MasterInvoicePaymentMethodBadge
											paymentMethod={invoice.paymentMethod}
										/>
									</td>
									<td className="px-4 py-3 font-semibold text-darknavy">
										{formatMasterInvoiceCurrency(invoice.amount)}
									</td>
									<td className="px-4 py-3">
										<MasterInvoiceStatusBadge status={invoice.status} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</article>
		</div>
	);
}

function SubscriberTransactionsTab({
	page,
}: {
	page: ReturnType<typeof useMasterInvoiceSubscriberPage>;
}) {
	return (
		<MasterInvoiceTable
			paymentMethodFilter={page.paymentMethodFilter}
			query={page.query}
			resetFilters={page.resetFilters}
			setPaymentMethodFilter={page.setPaymentMethodFilter}
			setQuery={page.setQuery}
			setStatusFilter={page.setStatusFilter}
			setTransactionTypeFilter={page.setTransactionTypeFilter}
			statusFilter={page.statusFilter}
			table={page.table}
			transactionTypeFilter={page.transactionTypeFilter}
		/>
	);
}

function SubscriberPaymentsTab({
	page,
}: {
	page: ReturnType<typeof useMasterInvoiceSubscriberPage>;
}) {
	const { invoices, summary } = page;
	const paidInvoices = invoices.filter((i) => i.status === "Paid");

	return (
		<div className="grid gap-5">
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<article className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
					<div className="flex items-center gap-2">
						<CreditCard className="h-4 w-4 text-skyblue" />
						<p className="text-xs font-semibold text-darknavy/55">Paid Transactions</p>
					</div>
					<p className="mt-2 text-2xl font-bold text-darknavy">{paidInvoices.length}</p>
				</article>
				<article className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
					<div className="flex items-center gap-2">
						<CheckCircle2 className="h-4 w-4 text-emerald-600" />
						<p className="text-xs font-semibold text-darknavy/55">Settled Amount</p>
					</div>
					<p className="mt-2 text-2xl font-bold text-emerald-700">
						{formatMasterInvoiceCurrency(summary?.paidAmount ?? 0)}
					</p>
				</article>
			</div>

			<article className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
				<div className="border-b border-darknavy/10 p-4">
					<h3 className="text-base font-semibold text-darknavy">
						Payment Settlement Ledger
					</h3>
					<p className="mt-0.5 text-xs text-darknavy/50">
						All successful and completed payment settlements for this subscriber.
					</p>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full min-w-[55rem] border-collapse text-left text-sm text-darknavy">
						<thead className="bg-offwhite text-xs font-bold uppercase tracking-[0.08em] text-darknavy/55">
							<tr>
								<th className="px-4 py-3">Reference No</th>
								<th className="px-4 py-3">Invoice No</th>
								<th className="px-4 py-3">Date</th>
								<th className="px-4 py-3">Payment Method</th>
								<th className="px-4 py-3">Billing Period</th>
								<th className="px-4 py-3">Settled Amount</th>
								<th className="px-4 py-3">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-darknavy/10">
							{paidInvoices.length > 0 ? (
								paidInvoices.map((record) => (
									<tr key={record.id} className="transition hover:bg-skyblue/5">
										<td className="px-4 py-3.5 font-mono text-xs font-semibold text-darknavy">
											{record.referenceNo}
										</td>
										<td className="px-4 py-3.5 font-semibold text-darknavy">
											{record.invoiceNo}
										</td>
										<td className="px-4 py-3.5 text-xs text-darknavy/65">
											{formatMasterInvoiceDate(record.transactionDate)}
										</td>
										<td className="px-4 py-3.5">
											<MasterInvoicePaymentMethodBadge
												paymentMethod={record.paymentMethod}
											/>
										</td>
										<td className="px-4 py-3.5 text-xs text-darknavy/60">
											{record.billingPeriod}
										</td>
										<td className="px-4 py-3.5 font-semibold text-darknavy">
											{formatMasterInvoiceCurrency(record.amount)}
										</td>
										<td className="px-4 py-3.5">
											<MasterInvoiceStatusBadge status={record.status} />
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={7}
										className="px-4 py-8 text-center text-sm font-medium text-darknavy/50"
									>
										No settled payments found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</article>
		</div>
	);
}

function SubscriberPlanTab({
	page,
}: {
	page: ReturnType<typeof useMasterInvoiceSubscriberPage>;
}) {
	const { subscriber, plan } = page;
	if (!subscriber || !plan) return null;

	const quote = calculateMasterSubscriptionQuote({
		plan,
		rules: MasterSubscriptionVolumeRules.filter((r) => r.planId === plan.id),
		values: {
			branches: subscriber.branchCount,
			companies: subscriber.companyCount,
			users: subscriber.userCount,
		},
	});

	const amountLeft = calculateMasterSubscriptionAmountLeft({
		billingCycle: subscriber.billingCycle,
		monthlyTotal: quote.total,
	});

	return (
		<div className="grid gap-5 lg:grid-cols-2">
			<article className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<h3 className="text-base font-semibold text-darknavy">
					Subscribed Plan: {plan.name}
				</h3>
				<p className="mt-1 text-xs text-darknavy/50">{plan.description}</p>

				<div className="mt-4 divide-y divide-darknavy/8 text-sm">
					<div className="flex items-center justify-between py-2.5">
						<span className="text-darknavy/55">Plan Code</span>
						<span className="font-mono text-xs font-semibold text-darknavy">{plan.code}</span>
					</div>
					<div className="flex items-center justify-between py-2.5">
						<span className="text-darknavy/55">Monthly Base Price</span>
						<span className="font-semibold text-darknavy">
							{formatMasterInvoiceCurrency(plan.monthlyBasePrice)} / mo
						</span>
					</div>
					<div className="flex items-center justify-between py-2.5">
						<span className="text-darknavy/55">Included Entities</span>
						<span className="font-semibold text-darknavy">
							{plan.includedCompanies} company • {plan.includedBranches} branches • {plan.includedUsers} users
						</span>
					</div>
					<div className="flex items-center justify-between py-2.5">
						<span className="text-darknavy/55">Calculated Monthly Rate</span>
						<span className="text-base font-bold text-darknavy">
							{formatMasterInvoiceCurrency(quote.total)} / mo
						</span>
					</div>
					<div className="flex items-center justify-between py-2.5">
						<span className="text-darknavy/55">Cycle Estimated Charge ({subscriber.billingCycle})</span>
						<span className="text-base font-bold text-emerald-700">
							{formatMasterInvoiceCurrency(amountLeft)}
						</span>
					</div>
				</div>
			</article>

			<article className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<h3 className="text-base font-semibold text-darknavy">
					Overage & Scaling Price Structure
				</h3>
				<div className="mt-4 divide-y divide-darknavy/8 text-sm">
					<div className="flex items-center justify-between py-2.5">
						<span className="text-darknavy/55">Company Overage Rate</span>
						<span className="font-semibold text-darknavy">
							{formatMasterInvoiceCurrency(plan.pricing.company)} / company
						</span>
					</div>
					<div className="flex items-center justify-between py-2.5">
						<span className="text-darknavy/55">Branch Overage Rate</span>
						<span className="font-semibold text-darknavy">
							{formatMasterInvoiceCurrency(plan.pricing.branch)} / branch
						</span>
					</div>
					<div className="flex items-center justify-between py-2.5">
						<span className="text-darknavy/55">User Overage Rate</span>
						<span className="font-semibold text-darknavy">
							{formatMasterInvoiceCurrency(plan.pricing.user)} / user
						</span>
					</div>
					<div className="flex items-center justify-between py-2.5">
						<span className="text-darknavy/55">Volume Discount Tier</span>
						<span className="font-semibold text-emerald-700">
							{quote.effectiveDiscountPercent}% discount applied
						</span>
					</div>
				</div>
			</article>
		</div>
	);
}
