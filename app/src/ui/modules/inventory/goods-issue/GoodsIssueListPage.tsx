"use client";

import Link from "next/link";
import {
	Ban,
	CheckCircle2,
	Clock3,
	Download,
	PackageCheck,
	PackageMinus,
	Plus,
	Search,
	Upload,
	XCircle,
} from "lucide-react";
import {
	countGoodsIssuesByStatus,
	formatGoodsIssueCurrency,
	formatGoodsIssueDate,
	formatGoodsIssuePercentage,
	isGoodsIssueActiveStatus,
} from "@/app/src/data/modules/inventory/goods-issue/GoodsIssueData";
import {
	GoodsIssueHref,
	GoodsIssueStatusFilterOptions,
	GoodsIssueTablePaginationStorageKey,
} from "@/app/src/constants/modules/inventory/goods-issue/GoodsIssueConstants";
import {
	useGoodsIssueStore,
	useGoodsIssueTable,
} from "@/app/src/hooks/modules/inventory/goods-issue/useGoodsIssue";
import type {
	GoodsIssueRecord,
	GoodsIssueStatus,
} from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";
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
import { GoodsIssueRecordActions } from "@/app/src/ui/modules/inventory/goods-issue/GoodsIssueRecordActions";

export function GoodsIssueListPage() {
	const { issues, lastSyncedAt, updateIssueStatus } = useGoodsIssueStore();
	const tableState = useGoodsIssueTable(issues);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Goods Issue"
				description="Prepare source warehouse issues, references, VCE details, and item entries."
				eyebrow={
					<>
						<PackageMinus className="h-3.5 w-3.5" aria-hidden="true" />
						Inventory
					</>
				}
				actions={<GoodsIssueHeaderActions />}
			/>

			<GoodsIssueMetrics records={issues} />

			<ModuleTable
				emptyDescription="Try a different GI number, transaction type, VCE, reference, or status."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No goods issues matched"
				minWidthClassName="min-w-[92rem]"
				paginationLabel="entries"
				paginationStorageKey={GoodsIssueTablePaginationStorageKey}
				lastSyncedAt={lastSyncedAt}
				pageSizeOptions={[5, 10, 15, 20, 25, 50]}
				table={tableState.table}
				tableTitle="Goods issue entries"
				toolbar={
					<ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
						<ModuleTableSearch
							label="Search Goods Issues"
							value={tableState.query}
							onChange={tableState.setQuery}
							placeholder="Search by GI no., transaction type, VCE, or reference"
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
							options={GoodsIssueStatusFilterOptions}
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
							{formatGoodsIssueDate(original.documentDate)}
						</td>
						<td className="px-4 py-4">{original.transactionType}</td>
						<td className="px-4 py-4">{original.vceName}</td>
						<td className="px-4 py-4">{original.referenceNo}</td>
						<td className="px-4 py-4 font-semibold text-darknavy">
							{formatGoodsIssueCurrency(original.totalAmount)}
						</td>
						<td className="px-4 py-4">
							<GoodsIssueStatusBadge status={original.status} />
						</td>
						<td className="px-4 py-4 text-center">
							<GoodsIssueRecordActions
								record={original}
								onUpdateStatus={updateIssueStatus}
							/>
						</td>
					</tr>
				)}
			/>
		</section>
	);
}

function GoodsIssueHeaderActions() {
	return (
		<>
			<div className="flex lg:hidden">
				<ModuleActionMenu
					className="[&>button]:h-10 [&>button]:w-10"
					items={GoodsIssueOverflowItems}
					label="Goods Issue actions"
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
				href={`${GoodsIssueHref}/add`}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Start New Goods Issue
			</Link>
		</>
	);
}

const GoodsIssueOverflowItems = [
	{ icon: Upload, label: "Upload", onSelect: () => undefined, type: "button" },
	{ icon: Download, label: "Export", onSelect: () => undefined, type: "button" },
] satisfies ModuleActionMenuItem[];

function GoodsIssueMetrics({ records }: { records: GoodsIssueRecord[] }) {
	const activeCount = records.filter((record) =>
		isGoodsIssueActiveStatus(record.status),
	).length;
	const approvedCount = countGoodsIssuesByStatus(records, "Approved");
	const disapprovedCount = countGoodsIssuesByStatus(records, "Disapproved");
	const pendingCount = countGoodsIssuesByStatus(records, "Pending");
	const closedCount = countGoodsIssuesByStatus(records, "Closed");

	return (
		<ModuleStatisticCards
			className="2xl:grid-cols-6"
			items={[
				{
					label: "Total Issues",
					value: records.length,
					summary: "All time",
					icon: PackageMinus,
					iconClassName: "bg-skyblue/20 text-skyblue",
				},
				{
					label: "Active",
					value: activeCount,
					summary: formatGoodsIssuePercentage(activeCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-emerald-50 text-emerald-700",
				},
				{
					label: "Pending",
					value: pendingCount,
					summary: formatGoodsIssuePercentage(pendingCount, records.length),
					icon: Clock3,
					iconClassName: "bg-offwhite text-darknavy",
				},
				{
					label: "Approved",
					value: approvedCount,
					summary: formatGoodsIssuePercentage(approvedCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-citron/25 text-darknavy",
				},
				{
					label: "Disapproved",
					value: disapprovedCount,
					summary: formatGoodsIssuePercentage(disapprovedCount, records.length),
					icon: XCircle,
					iconClassName: "bg-coralpink/15 text-coralpink",
				},
				{
					label: "Closed",
					value: closedCount,
					summary: formatGoodsIssuePercentage(closedCount, records.length),
					icon: PackageCheck,
					iconClassName: "bg-skyblue/15 text-skyblue",
				},
			]}
		/>
	);
}

function GoodsIssueStatusBadge({ status }: { status: GoodsIssueStatus }) {
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
} satisfies Record<GoodsIssueStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
	Active: "bg-citron/25 text-darknavy",
	Approved: "bg-citron/25 text-darknavy",
	Cancelled: "bg-darknavy/10 text-darknavy/70",
	Closed: "bg-skyblue/20 text-darknavy",
	Disapproved: "bg-coralpink/15 text-coralpink",
	Draft: "bg-offwhite text-darknavy/70",
	Pending: "bg-offwhite text-darknavy",
} satisfies Record<GoodsIssueStatus, string>;
