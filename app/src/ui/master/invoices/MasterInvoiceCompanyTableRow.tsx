import { Building2, Calendar, ChevronRight, CreditCard, GitBranch, Users } from "lucide-react";
import Link from "next/link";
import { getMasterInvoiceSubscriberHref } from "@/app/src/constants/master/invoices/MasterInvoiceConstants";
import { formatMasterInvoiceCurrency } from "@/app/src/data/master/invoices/MasterInvoiceData";
import { formatMasterSubscriptionDate } from "@/app/src/data/master/subscriptions/MasterSubscriptionData";
import type { MasterInvoiceCompanyRowItem } from "@/app/src/hooks/master/invoices/useMasterInvoiceListPage";
import { MasterInvoiceCompanyStatusBadge } from "@/app/src/ui/master/invoices/MasterInvoiceBadges";

type MasterInvoiceCompanyTableRowProps = {
	row: MasterInvoiceCompanyRowItem;
};

export function MasterInvoiceCompanyTableRow({ row }: MasterInvoiceCompanyTableRowProps) {
	const { subscriber, plan, summary } = row;
	const viewHref = getMasterInvoiceSubscriberHref(subscriber.id);

	return (
		<tr className="align-top transition hover:bg-skyblue/5">
			<td className="px-4 py-4">
				<div className="min-w-0">
					<Link
						href={viewHref}
						className="group inline-flex items-center gap-1.5 font-semibold text-darknavy hover:text-skyblue"
					>
						<span className="truncate">{subscriber.name}</span>
						<ChevronRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
					</Link>
					<p className="mt-0.5 truncate text-xs text-darknavy/50">
						Owner: {subscriber.ownerName}
					</p>
					<p className="mt-1 truncate text-[0.6875rem] font-medium text-darknavy/40">
						ID: {subscriber.id}
					</p>
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="min-w-0">
					<p className="truncate font-semibold text-darknavy">
						{plan?.name ?? "Custom / Unassigned"}
					</p>
					<div className="mt-1.5 flex flex-wrap items-center gap-1.5">
						<span className="rounded-md bg-offwhite px-2 py-0.5 text-xs font-semibold text-darknavy/65 ring-1 ring-darknavy/10">
							{subscriber.billingCycle}
						</span>
						<span className="text-xs text-darknavy/45">
							{subscriber.durationMonths} mo.
						</span>
					</div>
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="grid gap-1 text-xs">
					<div className="flex items-center gap-1.5 text-darknavy/70">
						<Building2 className="h-3.5 w-3.5 text-darknavy/40" />
						<span className="font-semibold text-darknavy">{subscriber.companyCount}</span>
						<span>companies</span>
					</div>
					<div className="flex items-center gap-1.5 text-darknavy/70">
						<GitBranch className="h-3.5 w-3.5 text-darknavy/40" />
						<span className="font-semibold text-darknavy">{subscriber.branchCount}</span>
						<span>branches</span>
					</div>
					<div className="flex items-center gap-1.5 text-darknavy/70">
						<Users className="h-3.5 w-3.5 text-darknavy/40" />
						<span className="font-semibold text-darknavy">{subscriber.userCount}</span>
						<span>users</span>
					</div>
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="min-w-0">
					<p className="text-sm font-semibold text-darknavy">
						{formatMasterInvoiceCurrency(summary.paidAmount)}
					</p>
					<div className="mt-1 flex flex-wrap items-center gap-1 text-xs">
						<span className="font-medium text-emerald-700">
							{summary.paidInvoices} paid
						</span>
						{summary.pendingInvoices > 0 ? (
							<span className="text-darknavy/40">
								• <span className="font-medium text-amber-700">{summary.pendingInvoices} pending</span>
							</span>
						) : null}
						{summary.failedInvoices > 0 ? (
							<span className="text-darknavy/40">
								• <span className="font-medium text-rose-600">{summary.failedInvoices} failed</span>
							</span>
						) : null}
					</div>
					{summary.lastTransactionDate ? (
						<p className="mt-1 text-[0.6875rem] text-darknavy/45">
							Last: {formatMasterSubscriptionDate(summary.lastTransactionDate)}
						</p>
					) : null}
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="grid gap-1.5">
					<div>
						<MasterInvoiceCompanyStatusBadge status={subscriber.status} />
					</div>
					<div className="flex items-center gap-1 text-xs text-darknavy/55">
						<Calendar className="h-3.5 w-3.5 text-darknavy/38" />
						<span>{formatMasterSubscriptionDate(subscriber.renewalDate)}</span>
					</div>
				</div>
			</td>
			<td className="px-4 py-4 text-right">
				<Link
					href={viewHref}
					className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-darknavy/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-darknavy shadow-sm transition hover:border-skyblue hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
				>
					<CreditCard className="h-4 w-4 shrink-0 text-darknavy/60" />
					<span>View Ledger</span>
				</Link>
			</td>
		</tr>
	);
}

