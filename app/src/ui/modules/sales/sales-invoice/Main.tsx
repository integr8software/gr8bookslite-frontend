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
} from "lucide-react";
import {
	countSalesInvoicesByStatus,
	formatSalesInvoiceCurrency,
	formatSalesInvoiceDate,
	formatSalesInvoicePercentage,
	isSalesInvoiceActiveStatus,
} from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceData";
import {
	SalesInvoiceHref,
	SalesInvoiceStatusFilterOptions,
	SalesInvoiceTablePaginationStorageKey,
} from "@/app/src/constants/modules/sales/sales-invoice/SalesInvoiceConstants";
import {
	useSalesInvoiceStore,
	useSalesInvoiceTable,
} from "@/app/src/hooks/modules/sales/sales-invoice/useSalesInvoice";
import type {
	SalesInvoiceRecord,
	SalesInvoiceStatus,
} from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function SalesInvoiceMain() {
	const { invoices, lastSyncedAt, updateInvoiceStatus } = useSalesInvoiceStore();
	const tableState = useSalesInvoiceTable(invoices);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Sales Invoice"
				description="Prepare sales invoices, review customer billing details, and track invoice status."
				eyebrow={
					<>
						<FileText className="h-3.5 w-3.5" aria-hidden="true" />
						Sales
					</>
				}
				actions={<SalesInvoiceListHeaderActions />}
			/>

			<SalesInvoiceMetrics records={invoices} />

			<ModuleTable
				emptyDescription="Try a different invoice number, customer, reference, amount, or status."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No sales invoices matched"
				lastSyncedAt={lastSyncedAt}
				minWidthClassName="min-w-[88rem]"
				pageSizeOptions={[5, 10, 15, 20, 25, 50]}
				paginationLabel="entries"
				paginationStorageKey={SalesInvoiceTablePaginationStorageKey}
				table={tableState.table}
				tableTitle="Sales invoice entries"
				toolbar={
					<ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
						<ModuleTableSearch
							label="Search Sales Invoices"
							value={tableState.query}
							onChange={tableState.setQuery}
							placeholder="Search by invoice no., customer, or reference"
						/>
						<DateRangePicker
							label="Date Range"
							value={tableState.dateRange}
							onChange={tableState.setDateRange}
						/>
						<AmountRangePicker
							label="Amount"
							value={tableState.amountRange}
							onChange={tableState.setAmountRange}
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={tableState.statusFilter}
							options={SalesInvoiceStatusFilterOptions}
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
							{original.invoiceNo}
						</td>
						<td className="px-4 py-4">
							{formatSalesInvoiceDate(original.invoiceDate)}
						</td>
						<td className="px-4 py-4">{original.customerName}</td>
						<td className="px-4 py-4">{original.referenceNo}</td>
						<td className="px-4 py-4">
							{formatSalesInvoiceDate(original.dueDate)}
						</td>
						<td className="px-4 py-4 font-semibold text-darknavy">
							{formatSalesInvoiceCurrency(original.amount)}
						</td>
						<td className="px-4 py-4">
							<SalesInvoiceStatusBadge status={original.status} />
						</td>
						<td className="px-4 py-4 text-center">
							<SalesInvoiceRecordActions
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

function SalesInvoiceListHeaderActions() {
	return (
		<>
			<div className="flex lg:hidden">
				<ModuleActionMenu
					className="[&>button]:h-10 [&>button]:w-10"
					items={SalesInvoiceListOverflowItems}
					label="Sales Invoice list actions"
				/>
			</div>
			<div className="hidden items-center gap-2 lg:flex">
				<button type="button" className={moduleHeaderActionClassNames.secondary}>
					<Upload className="h-4 w-4" aria-hidden="true" />
					Upload
				</button>
				<button type="button" className={moduleHeaderActionClassNames.secondary}>
					<Download className="h-4 w-4" aria-hidden="true" />
					Export
				</button>
			</div>
			<Link
				href={`${SalesInvoiceHref}/add`}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Start New Sales Invoice
			</Link>
		</>
	);
}

function SalesInvoiceMetrics({ records }: { records: SalesInvoiceRecord[] }) {
	const activeCount = records.filter((record) =>
		isSalesInvoiceActiveStatus(record.status),
	).length;
	const approvedCount = countSalesInvoicesByStatus(records, "Approved");
	const pendingCount = countSalesInvoicesByStatus(records, "Pending");
	const draftCount = countSalesInvoicesByStatus(records, "Draft");
	const closedCount = countSalesInvoicesByStatus(records, "Closed");

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
					summary: formatSalesInvoicePercentage(activeCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-emerald-50 text-emerald-700",
				},
				{
					label: "Pending",
					value: pendingCount,
					summary: formatSalesInvoicePercentage(pendingCount, records.length),
					icon: Clock3,
					iconClassName: "bg-offwhite text-darknavy",
				},
				{
					label: "Approved",
					value: approvedCount,
					summary: formatSalesInvoicePercentage(approvedCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-citron/25 text-darknavy",
				},
				{
					label: "Draft",
					value: draftCount,
					summary: formatSalesInvoicePercentage(draftCount, records.length),
					icon: Clock3,
					iconClassName: "bg-darknavy/10 text-darknavy",
				},
				{
					label: "Closed",
					value: closedCount,
					summary: formatSalesInvoicePercentage(closedCount, records.length),
					icon: PackageCheck,
					iconClassName: "bg-skyblue/15 text-skyblue",
				},
			]}
		/>
	);
}

function SalesInvoiceRecordActions({
	onUpdateStatus,
	record,
}: {
	onUpdateStatus: (record: SalesInvoiceRecord, status: SalesInvoiceStatus) => void;
	record: SalesInvoiceRecord;
}) {
	return (
		<ModuleTableActions className="justify-center">
			<ModuleTableActionLink
				href={`${SalesInvoiceHref}/view/${record.id}`}
				label={`View ${record.invoiceNo}`}
				variant="view"
			/>
			<ModuleTableActionLink
				href={`${SalesInvoiceHref}/edit/${record.id}`}
				label={`Edit ${record.invoiceNo}`}
				variant="edit"
			/>
			<ModuleTableActionButton
				label={
					record.status === "Cancelled"
						? `Reactivate ${record.invoiceNo}`
						: `Cancel ${record.invoiceNo}`
				}
				onClick={() =>
					onUpdateStatus(
						record,
						record.status === "Cancelled" ? "Active" : "Cancelled",
					)
				}
				variant={record.status === "Cancelled" ? "active" : "inactive"}
			/>
		</ModuleTableActions>
	);
}

function SalesInvoiceStatusBadge({ status }: { status: SalesInvoiceStatus }) {
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

const SalesInvoiceListOverflowItems = [
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

const statusIconByStatus = {
	Active: CheckCircle2,
	Approved: CheckCircle2,
	Cancelled: Ban,
	Closed: PackageCheck,
	Draft: Clock3,
	Pending: Clock3,
} satisfies Record<SalesInvoiceStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
	Active: "bg-citron/25 text-darknavy",
	Approved: "bg-citron/25 text-darknavy",
	Cancelled: "bg-darknavy/10 text-darknavy/70",
	Closed: "bg-skyblue/20 text-darknavy",
	Draft: "bg-offwhite text-darknavy/70",
	Pending: "bg-offwhite text-darknavy",
} satisfies Record<SalesInvoiceStatus, string>;
