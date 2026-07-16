"use client";

import Link from "next/link";
import {
	Ban,
	CheckCircle2,
	Clock3,
	Download,
	FileText,
	PackageCheck,
	Plus,
	Search,
	Upload,
	XCircle,
} from "lucide-react";
import {
	countBillingInvoicesByStatus,
	formatBillingInvoiceCurrency,
	formatBillingInvoiceDate,
	formatBillingInvoicePercentage,
	isBillingInvoiceActiveStatus,
} from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import {
	BillingInvoiceHref,
	BillingInvoiceStatusFilterOptions,
	BillingInvoiceTablePaginationStorageKey,
} from "@/app/src/constants/modules/sales/billing-invoice/BillingInvoiceConstants";
import {
	useBillingInvoiceStore,
	useBillingInvoiceTable,
} from "@/app/src/hooks/modules/sales/billing-invoice/useBillingInvoice";
import type {
	BillingInvoiceRecord,
	BillingInvoiceStatus,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { BillingInvoiceRecordActions } from "@/app/src/ui/modules/sales/billing-invoice/BillingInvoiceRecordActions";

export function BillingInvoiceListPage() {
	const { invoices, lastSyncedAt, updateInvoiceStatus } =
		useBillingInvoiceStore();
	const tableState = useBillingInvoiceTable(invoices);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Billing Invoice"
				description="Prepare billing charges, tax amounts, shipment references, and invoice line entries."
				eyebrow={
					<>
						<FileText className="h-3.5 w-3.5" aria-hidden="true" />
						Sales
					</>
				}
				actions={<BillingInvoiceListHeaderActions />}
			/>

			<BillingInvoiceMetrics records={invoices} />

			<ModuleTable
				emptyDescription="Try a different transaction number, customer, invoice, reference, or status."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No billing invoices matched"
				minWidthClassName="min-w-[88rem]"
				paginationLabel="entries"
				paginationStorageKey={BillingInvoiceTablePaginationStorageKey}
				lastSyncedAt={lastSyncedAt}
				pageSizeOptions={[5, 10, 15, 20, 25, 50]}
				table={tableState.table}
				tableTitle="Billing invoice entries"
				toolbar={
					<ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
						<ModuleTableSearch
							label="Search Billing Invoices"
							value={tableState.query}
							onChange={tableState.setQuery}
							placeholder="Search by trans no., customer, invoice no., or reference"
						/>
						<DateRangePicker
							label="Date Range"
							value={tableState.dateRange}
							onChange={tableState.setDateRange}
						/>
						<AmountRangePicker
							label="Gross Amount"
							value={tableState.amountRange}
							onChange={tableState.setAmountRange}
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={tableState.statusFilter}
							options={BillingInvoiceStatusFilterOptions}
							onChange={(value) =>
								tableState.setStatusFilter(
									value as Parameters<typeof tableState.setStatusFilter>[0],
								)
							}
						/>
						<ModuleTableResetButton onClick={tableState.resetFilters} />
					</ModuleTableToolbar>
				}
				renderRow={({ id, original }) => (
					<tr
						key={id}
						className="module-table-row border-b border-darknavy/8 last:border-b-0"
					>
						<td className="px-4 py-4 font-semibold text-skyblue">
							{original.transactionNo}
						</td>
						<td className="px-4 py-4">
							{formatBillingInvoiceDate(original.documentDate)}
						</td>
						<td className="px-4 py-4">{original.customerName}</td>
						<td className="px-4 py-4">{original.invoiceNo}</td>
						<td className="px-4 py-4">{original.referenceNo}</td>
						<td className="px-4 py-4 font-semibold text-darknavy">
							{formatBillingInvoiceCurrency(original.amount)}
						</td>
						<td className="px-4 py-4">
							<BillingInvoiceStatusBadge status={original.status} />
						</td>
						<td className="px-4 py-4 text-center">
							<BillingInvoiceRecordActions
								record={original}
								onUpdateStatus={updateInvoiceStatus}
							/>
						</td>
					</tr>
				)}
			/>
		</section>
	);
}

function BillingInvoiceListHeaderActions() {
	return (
		<>
			<div className="flex lg:hidden">
				<ModuleActionMenu
					className="[&>button]:h-10 [&>button]:w-10"
					items={BillingInvoiceListOverflowItems}
					label="Billing Invoice list actions"
				/>
			</div>
			<div className="hidden items-center gap-2 lg:flex">
				<button
					type="button"
					className={moduleHeaderActionClassNames.secondary}
				>
					<Upload className="h-4 w-4" aria-hidden="true" />
					Upload
				</button>
				<button
					type="button"
					className={moduleHeaderActionClassNames.secondary}
				>
					<Download className="h-4 w-4" aria-hidden="true" />
					Export
				</button>
			</div>
			<Link
				href={`${BillingInvoiceHref}/add`}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Start New Billing Invoice
			</Link>
		</>
	);
}

const BillingInvoiceListOverflowItems = [
	{
		icon: Upload,
		label: "Upload",
		onSelect: () => undefined,
		type: "button",
	},
	{
		icon: Download,
		label: "Export",
		onSelect: () => undefined,
		type: "button",
	},
] satisfies ModuleActionMenuItem[];

function BillingInvoiceMetrics({
	records,
}: {
	records: BillingInvoiceRecord[];
}) {
	const activeCount = records.filter((record) =>
		isBillingInvoiceActiveStatus(record.status),
	).length;
	const approvedCount = countBillingInvoicesByStatus(records, "Approved");
	const disapprovedCount = countBillingInvoicesByStatus(records, "Disapproved");
	const pendingCount = countBillingInvoicesByStatus(records, "Pending");
	const closedCount = countBillingInvoicesByStatus(records, "Closed");

	return (
		<ModuleStatisticCards
			className="2xl:grid-cols-6"
			items={[
				{
					label: "Total Invoices",
					value: records.length,
					summary: "All time",
					icon: FileText,
					iconClassName: "bg-skyblue/20 text-skyblue",
				},
				{
					label: "Active",
					value: activeCount,
					summary: formatBillingInvoicePercentage(activeCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-emerald-50 text-emerald-700",
				},
				{
					label: "Pending",
					value: pendingCount,
					summary: formatBillingInvoicePercentage(pendingCount, records.length),
					icon: Clock3,
					iconClassName: "bg-offwhite text-darknavy",
				},
				{
					label: "Approved",
					value: approvedCount,
					summary: formatBillingInvoicePercentage(approvedCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-citron/25 text-darknavy",
				},
				{
					label: "Disapproved",
					value: disapprovedCount,
					summary: formatBillingInvoicePercentage(
						disapprovedCount,
						records.length,
					),
					icon: XCircle,
					iconClassName: "bg-coralpink/15 text-coralpink",
				},
				{
					label: "Closed",
					value: closedCount,
					summary: formatBillingInvoicePercentage(closedCount, records.length),
					icon: PackageCheck,
					iconClassName: "bg-skyblue/15 text-skyblue",
				},
			]}
		/>
	);
}

function BillingInvoiceStatusBadge({
	status,
}: {
	status: BillingInvoiceStatus;
}) {
	const Icon = statusIconByStatus[status];

	return (
		<span
			className={joinClasses(
				"inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
				statusClassNameByStatus[status],
			)}
		>
			<Icon className="h-3.5 w-3.5" aria-hidden="true" />
			{status}
		</span>
	);
}

const statusIconByStatus = {
	Active: CheckCircle2,
	Approved: CheckCircle2,
	Cancelled: Ban,
	Closed: PackageCheck,
	Disapproved: XCircle,
	Draft: Clock3,
	Pending: Clock3,
} satisfies Record<BillingInvoiceStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
	Active: "bg-citron/25 text-darknavy",
	Approved: "bg-citron/25 text-darknavy",
	Cancelled: "bg-darknavy/10 text-darknavy/70",
	Closed: "bg-skyblue/20 text-darknavy",
	Disapproved: "bg-coralpink/15 text-coralpink",
	Draft: "bg-offwhite text-darknavy/70",
	Pending: "bg-offwhite text-darknavy",
} satisfies Record<BillingInvoiceStatus, string>;

