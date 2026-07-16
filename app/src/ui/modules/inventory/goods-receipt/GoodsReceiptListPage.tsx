"use client";

import Link from "next/link";
import {
	Ban,
	CheckCircle2,
	Clock3,
	Download,
	PackageCheck,
	PackagePlus,
	Plus,
	Search,
	Upload,
	XCircle,
} from "lucide-react";
import {
	countGoodsReceiptsByStatus,
	formatGoodsReceiptCurrency,
	formatGoodsReceiptDate,
	formatGoodsReceiptPercentage,
	isGoodsReceiptActiveStatus,
} from "@/app/src/data/modules/inventory/goods-receipt/GoodsReceiptData";
import {
	GoodsReceiptHref,
	GoodsReceiptStatusFilterOptions,
	GoodsReceiptTablePaginationStorageKey,
} from "@/app/src/constants/modules/inventory/goods-receipt/GoodsReceiptConstants";
import {
	useGoodsReceiptStore,
	useGoodsReceiptTable,
} from "@/app/src/hooks/modules/inventory/goods-receipt/useGoodsReceipt";
import type {
	GoodsReceiptRecord,
	GoodsReceiptStatus,
} from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
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
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { GoodsReceiptRecordActions } from "@/app/src/ui/modules/inventory/goods-receipt/GoodsReceiptRecordActions";

export function GoodsReceiptListPage() {
	const { receipts, lastSyncedAt, updateReceiptStatus } =
		useGoodsReceiptStore();
	const tableState = useGoodsReceiptTable(receipts);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Goods Receipt"
				description="Prepare warehouse receipts, references, VCE details, and received item entries."
				eyebrow={
					<>
						<PackagePlus className="h-3.5 w-3.5" aria-hidden="true" />
						Inventory
					</>
				}
				actions={<GoodsReceiptHeaderActions />}
			/>

			<GoodsReceiptMetrics records={receipts} />

			<ModuleTable
				emptyDescription="Try a different GR number, transaction type, VCE, reference, or status."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No goods receipts matched"
				minWidthClassName="min-w-[92rem]"
				paginationLabel="entries"
				paginationStorageKey={GoodsReceiptTablePaginationStorageKey}
				lastSyncedAt={lastSyncedAt}
				pageSizeOptions={[5, 10, 15, 20, 25, 50]}
				table={tableState.table}
				tableTitle="Goods receipt entries"
				toolbar={
					<ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
						<ModuleTableSearch
							label="Search Goods Receipts"
							value={tableState.query}
							onChange={tableState.setQuery}
							placeholder="Search by GR no., transaction type, VCE, or reference"
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
							options={GoodsReceiptStatusFilterOptions}
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
							{formatGoodsReceiptDate(original.documentDate)}
						</td>
						<td className="px-4 py-4">{original.transactionType}</td>
						<td className="px-4 py-4">{original.vceName}</td>
						<td className="px-4 py-4">{original.referenceNo}</td>
						<td className="px-4 py-4 font-semibold text-darknavy">
							{formatGoodsReceiptCurrency(original.totalAmount)}
						</td>
						<td className="px-4 py-4">
							<GoodsReceiptStatusBadge status={original.status} />
						</td>
						<td className="px-4 py-4 text-center">
							<GoodsReceiptRecordActions
								record={original}
								onUpdateStatus={updateReceiptStatus}
							/>
						</td>
					</tr>
				)}
			/>
		</section>
	);
}

function GoodsReceiptHeaderActions() {
	return (
		<>
			<div className="flex lg:hidden">
				<ModuleActionMenu
					className="[&>button]:h-10 [&>button]:w-10"
					items={GoodsReceiptOverflowItems}
					label="Goods Receipt actions"
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
				href={`${GoodsReceiptHref}/add`}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Start New Goods Receipt
			</Link>
		</>
	);
}

const GoodsReceiptOverflowItems = [
	{ icon: Upload, label: "Upload", onSelect: () => undefined, type: "button" },
	{ icon: Download, label: "Export", onSelect: () => undefined, type: "button" },
] satisfies ModuleActionMenuItem[];

function GoodsReceiptMetrics({ records }: { records: GoodsReceiptRecord[] }) {
	const activeCount = records.filter((record) =>
		isGoodsReceiptActiveStatus(record.status),
	).length;
	const approvedCount = countGoodsReceiptsByStatus(records, "Approved");
	const disapprovedCount = countGoodsReceiptsByStatus(records, "Disapproved");
	const pendingCount = countGoodsReceiptsByStatus(records, "Pending");
	const closedCount = countGoodsReceiptsByStatus(records, "Closed");

	return (
		<ModuleStatisticCards
			className="2xl:grid-cols-6"
			items={[
				{
					label: "Total Receipts",
					value: records.length,
					summary: "All time",
					icon: PackagePlus,
					iconClassName: "bg-skyblue/20 text-skyblue",
				},
				{
					label: "Active",
					value: activeCount,
					summary: formatGoodsReceiptPercentage(activeCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-emerald-50 text-emerald-700",
				},
				{
					label: "Pending",
					value: pendingCount,
					summary: formatGoodsReceiptPercentage(pendingCount, records.length),
					icon: Clock3,
					iconClassName: "bg-offwhite text-darknavy",
				},
				{
					label: "Approved",
					value: approvedCount,
					summary: formatGoodsReceiptPercentage(approvedCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-citron/25 text-darknavy",
				},
				{
					label: "Disapproved",
					value: disapprovedCount,
					summary: formatGoodsReceiptPercentage(disapprovedCount, records.length),
					icon: XCircle,
					iconClassName: "bg-coralpink/15 text-coralpink",
				},
				{
					label: "Closed",
					value: closedCount,
					summary: formatGoodsReceiptPercentage(closedCount, records.length),
					icon: PackageCheck,
					iconClassName: "bg-skyblue/15 text-skyblue",
				},
			]}
		/>
	);
}

function GoodsReceiptStatusBadge({ status }: { status: GoodsReceiptStatus }) {
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
} satisfies Record<GoodsReceiptStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
	Active: "bg-citron/25 text-darknavy",
	Approved: "bg-citron/25 text-darknavy",
	Cancelled: "bg-darknavy/10 text-darknavy/70",
	Closed: "bg-skyblue/20 text-darknavy",
	Disapproved: "bg-coralpink/15 text-coralpink",
	Draft: "bg-offwhite text-darknavy/70",
	Pending: "bg-offwhite text-darknavy",
} satisfies Record<GoodsReceiptStatus, string>;
