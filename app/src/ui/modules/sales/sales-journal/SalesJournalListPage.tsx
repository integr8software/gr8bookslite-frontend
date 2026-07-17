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
	SalesJournalHref,
	SalesJournalStatusFilterOptions,
	SalesJournalTablePaginationStorageKey,
} from "@/app/src/constants/modules/sales/sales-journal/SalesJournalConstants";
import {
	formatSalesJournalAmount,
	getSalesJournalTotals,
} from "@/app/src/data/modules/sales/sales-journal/SalesJournalData";
import { useSalesJournalListPage } from "@/app/src/hooks/modules/sales/sales-journal/useSalesJournalListPage";
import type {
	SalesJournalRecord,
	SalesJournalStatus,
} from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
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
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function SalesJournalListPage() {
	const {
		amountRange,
		dateRange,
		handleConfirmDelete,
		handleQueryChange,
		isLoading,
		isMutating,
		lastSyncedAt,
		pendingDeleteRecord,
		query,
		records,
		resetFilters,
		setAmountRange,
		setDateRange,
		setPendingDeleteRecord,
		setStatusFilter,
		statusFilter,
		table,
		updateRecordStatus,
	} = useSalesJournalListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Sales Journal"
				description="Search sales journals, review document dates, and create or update accounting entries."
				eyebrow={
					<>
						<FileText className="h-3.5 w-3.5" aria-hidden="true" />
						Sales
					</>
				}
				actions={<SalesJournalListHeaderActions />}
			/>

			<SalesJournalMetrics records={records} />

			<ModuleTable
				emptyDescription="Try a different document number, party, date, amount, or status."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No sales journals matched"
				isLoading={isLoading}
				lastSyncedAt={lastSyncedAt}
				minWidthClassName="min-w-[86rem]"
				pageSizeOptions={[5, 10, 15, 20, 25, 50]}
				paginationLabel="entries"
				paginationStorageKey={SalesJournalTablePaginationStorageKey}
				table={table}
				tableTitle="Journal entries"
				toolbar={
					<ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
						<ModuleTableSearch
							label="Search sales journals"
							value={query}
							onChange={handleQueryChange}
							placeholder="Search by document no., party, remarks, or status"
						/>
						<DateRangePicker
							label="Document Date"
							value={dateRange}
							onChange={setDateRange}
						/>
						<AmountRangePicker
							label="Debit Amount"
							value={amountRange}
							onChange={setAmountRange}
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={statusFilter}
							options={SalesJournalStatusFilterOptions}
							onChange={(value) =>
								setStatusFilter(
									value as Parameters<typeof setStatusFilter>[0],
								)
							}
						/>
						<ModuleTableResetButton onClick={resetFilters} />
					</ModuleTableToolbar>
				}
				renderRow={({ id, original }) => {
					const totals = getSalesJournalTotals(original.lines);

					return (
						<tr
							key={id}
							className="module-table-row border-b border-darknavy/8 last:border-b-0"
						>
							<td className="px-4 py-4 font-semibold text-skyblue">
								{original.documentNo}
							</td>
							<td className="px-4 py-4">
								{formatSalesJournalDate(original.documentDate)}
							</td>
							<td className="px-4 py-4">{original.partyName}</td>
							<td className="px-4 py-4">{original.currency}</td>
							<td className="px-4 py-4 font-semibold text-darknavy">
								{formatSalesJournalAmount(totals.totalDebit)}
							</td>
							<td className="px-4 py-4 font-semibold text-darknavy">
								{formatSalesJournalAmount(totals.totalCredit)}
							</td>
							<td className="px-4 py-4">
								<SalesJournalStatusBadge status={original.status} />
							</td>
							<td className="px-4 py-4 text-center">
								<SalesJournalRecordActions
									record={original}
									onDeleteRecord={setPendingDeleteRecord}
									onUpdateStatus={updateRecordStatus}
								/>
							</td>
						</tr>
					);
				}}
			/>

			<AppDialog
				isOpen={Boolean(pendingDeleteRecord)}
				isPending={isMutating}
				title="Delete sales journal?"
				description={`This will remove ${pendingDeleteRecord?.documentNo ?? "the selected sales journal"}.`}
				confirmLabel="Delete Sales Journal"
				tone="danger"
				onCancel={() => setPendingDeleteRecord(null)}
				onConfirm={handleConfirmDelete}
			/>
		</section>
	);
}

function SalesJournalListHeaderActions() {
	return (
		<>
			<div className="flex lg:hidden">
				<ModuleActionMenu
					className="[&>button]:h-10 [&>button]:w-10"
					items={SalesJournalListOverflowItems}
					label="Sales journal list actions"
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
				href={`${SalesJournalHref}/add`}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Start New Sales Journal
			</Link>
		</>
	);
}

const SalesJournalListOverflowItems = [
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

function SalesJournalMetrics({ records }: { records: SalesJournalRecord[] }) {
	const draftCount = countSalesJournalsByStatus(records, "Draft");
	const openCount = countSalesJournalsByStatus(records, "Open");
	const approvedCount = countSalesJournalsByStatus(records, "Approved");
	const closedCount = countSalesJournalsByStatus(records, "Closed");
	const totalDebit = records.reduce(
		(sum, record) => sum + getSalesJournalTotals(record.lines).totalDebit,
		0,
	);

	return (
		<ModuleStatisticCards
			className="2xl:grid-cols-5"
			items={[
				{
					label: "Total Journals",
					value: records.length,
					summary: "All time",
					icon: FileText,
					iconClassName: "bg-skyblue/20 text-skyblue",
				},
				{
					label: "Open",
					value: openCount,
					summary: formatSalesJournalPercentage(openCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-emerald-50 text-emerald-700",
				},
				{
					label: "Draft",
					value: draftCount,
					summary: formatSalesJournalPercentage(draftCount, records.length),
					icon: Clock3,
					iconClassName: "bg-offwhite text-darknavy",
				},
				{
					label: "Approved",
					value: approvedCount,
					summary: formatSalesJournalPercentage(approvedCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-citron/25 text-darknavy",
				},
				{
					label: "Total Debit",
					value: formatSalesJournalAmount(totalDebit),
					summary: `${closedCount} closed`,
					icon: PackageCheck,
					iconClassName: "bg-skyblue/15 text-skyblue",
				},
			]}
		/>
	);
}

function SalesJournalRecordActions({
	onDeleteRecord,
	onUpdateStatus,
	record,
}: {
	record: SalesJournalRecord;
	onDeleteRecord: (record: SalesJournalRecord) => void;
	onUpdateStatus: (
		record: SalesJournalRecord,
		status: SalesJournalStatus,
	) => void;
}) {
	const isApproved = record.status === "Approved";
	const isCancelled = record.status === "Cancelled";
	const items: ModuleActionMenuItem[] = [
		{
			href: `${SalesJournalHref}/view/${record.id}`,
			icon: Search,
			label: "View",
			type: "link",
		},
		...(canEditSalesJournalStatus(record.status)
			? [
					{
						href: `${SalesJournalHref}/edit/${record.id}`,
						icon: FileText,
						label: "Edit",
						type: "link",
					} satisfies ModuleActionMenuItem,
				]
			: []),
		{
			disabled: !canApproveSalesJournalStatus(record.status),
			icon: CheckCircle2,
			label: isApproved ? "Undo Approved" : "Approve",
			onSelect: () => onUpdateStatus(record, isApproved ? "Open" : "Approved"),
			type: "button",
		},
		{
			disabled: record.status === "Closed",
			icon: Ban,
			label: isCancelled ? "Uncancelled" : "Cancel",
			onSelect: () => onUpdateStatus(record, isCancelled ? "Draft" : "Cancelled"),
			tone: isCancelled ? "default" : "danger",
			type: "button",
		},
		{
			icon: Ban,
			label: "Delete",
			onSelect: () => onDeleteRecord(record),
			tone: "danger",
			type: "button",
		},
	];

	return (
		<ModuleTableActions className="!justify-center">
			<ModuleActionMenu
				items={items}
				label={`Actions for sales journal ${record.documentNo}`}
			/>
		</ModuleTableActions>
	);
}

function SalesJournalStatusBadge({ status }: { status: SalesJournalStatus }) {
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

function canEditSalesJournalStatus(status: SalesJournalStatus) {
	return status === "Draft" || status === "Open";
}

function canApproveSalesJournalStatus(status: SalesJournalStatus) {
	return status === "Draft" || status === "Open" || status === "Approved";
}

function countSalesJournalsByStatus(
	records: SalesJournalRecord[],
	status: SalesJournalStatus,
) {
	return records.filter((record) => record.status === status).length;
}

function formatSalesJournalDate(value: string) {
	return new Intl.DateTimeFormat("en-PH", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
}

function formatSalesJournalPercentage(value: number, total: number) {
	if (total === 0) {
		return "0.00% of total";
	}

	return `${((value / total) * 100).toFixed(2)}% of total`;
}

const statusIconByStatus = {
	Approved: CheckCircle2,
	Cancelled: Ban,
	Closed: PackageCheck,
	Draft: Clock3,
	Open: CheckCircle2,
} satisfies Record<SalesJournalStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
	Approved: "bg-citron/25 text-darknavy",
	Cancelled: "bg-darknavy/10 text-darknavy/70",
	Closed: "bg-skyblue/20 text-darknavy",
	Draft: "bg-offwhite text-darknavy/70",
	Open: "bg-citron/25 text-darknavy",
} satisfies Record<SalesJournalStatus, string>;
