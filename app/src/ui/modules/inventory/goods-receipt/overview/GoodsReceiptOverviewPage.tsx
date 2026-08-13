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
import { GoodsReceiptRecordActions } from "@/app/src/ui/modules/inventory/goods-receipt/overview/GoodsReceiptRecordActions";

export function GoodsReceiptOverviewPage() {
	const { receipts, lastSyncedAt, updateReceiptStatus } =
		useGoodsReceiptStore();
	const tableState = useGoodsReceiptTable(receipts);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Goods Receipt"
				description="Prepare warehouse receipts, references, Party Code details, and received item entries."
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
				emptyDescription="Try a different GR number, transaction type, Party Code, reference, or status."
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
							placeholder="Search by GR no., transaction type, Party Code, or reference"
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
	const draftCount = countGoodsReceiptsByStatus(records, "Draft");
	const postedCount = countGoodsReceiptsByStatus(records, "Posted");
	const disapprovedCount = countGoodsReceiptsByStatus(records, "Disapproved");
	const forApprovalCount = countGoodsReceiptsByStatus(records, "For Approval");
	const cancelledCount = countGoodsReceiptsByStatus(records, "Cancelled");

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
					label: "Draft",
					value: draftCount,
					summary: formatGoodsReceiptPercentage(draftCount, records.length),
					icon: Clock3,
					iconClassName: "bg-emerald-50 text-emerald-700",
				},
				{
					label: "For Approval",
					value: forApprovalCount,
					summary: formatGoodsReceiptPercentage(forApprovalCount, records.length),
					icon: Clock3,
					iconClassName: "bg-offwhite text-darknavy",
				},
				{
					label: "Posted",
					value: postedCount,
					summary: formatGoodsReceiptPercentage(postedCount, records.length),
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
					label: "Cancelled",
					value: cancelledCount,
					summary: formatGoodsReceiptPercentage(cancelledCount, records.length),
					icon: Ban,
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
	Cancelled: Ban,
	Disapproved: XCircle,
	Draft: Clock3,
	"For Approval": Clock3,
	Posted: PackageCheck,
} satisfies Record<GoodsReceiptStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
	Cancelled: "bg-darknavy/10 text-darknavy/70",
	Disapproved: "bg-coralpink/15 text-coralpink",
	Draft: "bg-offwhite text-darknavy/70",
	"For Approval": "bg-offwhite text-darknavy",
	Posted: "bg-citron/25 text-darknavy",
} satisfies Record<GoodsReceiptStatus, string>;
