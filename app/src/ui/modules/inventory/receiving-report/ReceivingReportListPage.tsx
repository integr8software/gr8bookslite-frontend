"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
	createColumnHelper,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	Ban,
	Boxes,
	CheckCircle2,
	Clock3,
	Download,
	Edit3,
	Eye,
	PackageCheck,
	Plus,
	Search,
	ThumbsDown,
	Undo2,
	Upload,
	XCircle,
} from "lucide-react";
import {
	countReceivingReportsByStatus,
	formatReceivingReportCurrency,
	formatReceivingReportDate,
	formatReceivingReportPercentage,
	type ReceivingReportRecord,
	type ReceivingReportStatus,
} from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";
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
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { useReceivingReportListRecords } from "@/app/src/ui/modules/inventory/receiving-report/useReceivingReportListRecords";

const ReceivingReportHref = "/inventory/receiving-report";
const ReceivingReportTablePaginationStorageKey = "inventory-receiving-report";

type DateRangeValue = {
	from: string;
	to: string;
};

type AmountRangeValue = {
	from: string;
	to: string;
};

export function ReceivingReportListPage() {
	const { records, updateReceivingReportStatus } = useReceivingReportListRecords();
	const [query, setQuery] = useState("");
	const [dateRange, setDateRange] = useState<DateRangeValue>({
		from: "",
		to: "",
	});
	const [amountRange, setAmountRange] = useState<AmountRangeValue>({
		from: "",
		to: "",
	});
	const [statusFilter, setStatusFilter] = useState("all");
	const filteredRecords = useMemo(
		() =>
			filterReceivingReports(records, {
				amountRange,
				dateRange,
				query,
				statusFilter,
			}),
		[amountRange, dateRange, query, records, statusFilter],
	);

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data: filteredRecords,
		columns: ReceivingReportColumns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 5,
			},
		},
	});

	function resetFilters() {
		setQuery("");
		setDateRange({ from: "", to: "" });
		setAmountRange({ from: "", to: "" });
		setStatusFilter("all");
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Receiving Report"
				description="Search receiving reports, review warehouse receipts, and create or update received item entries."
				eyebrow={
					<>
						<Boxes className="h-3.5 w-3.5" aria-hidden="true" />
						Inventory
					</>
				}
				actions={<ReceivingReportListHeaderActions />}
			/>

			<ReceivingReportMetrics records={records} />

			<ModuleTable
				emptyDescription="Try a different RR no., vendor, Party Code, PO no., status, date, or amount range."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No receiving reports matched"
				minWidthClassName="min-w-[92rem]"
				pageSizeOptions={[5, 10, 15, 20, 25, 50]}
				paginationLabel="entries"
				paginationStorageKey={ReceivingReportTablePaginationStorageKey}
				table={table}
				tableTitle="Receiving report entries"
				toolbar={
					<ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
						<ModuleTableSearch
							label="Search Receiving Reports"
							value={query}
							onChange={setQuery}
							placeholder="Search by RR no., vendor, Party Code, or PO no."
						/>
						<DateRangePicker
							label="Date Range"
							value={dateRange}
							onChange={setDateRange}
						/>
						<AmountRangePicker
							label="Amount"
							value={amountRange}
							onChange={setAmountRange}
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={statusFilter}
							options={ReceivingReportStatusFilterOptions}
							onChange={setStatusFilter}
						/>
						<ModuleTableResetButton onClick={resetFilters} />
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
							{formatReceivingReportDate(original.documentDate)}
						</td>
						<td className="px-4 py-4">{original.vceName}</td>
						<td className="px-4 py-4">{original.vceCode}</td>
						<td className="px-4 py-4">{original.poNo}</td>
						<td className="px-4 py-4">{original.warehouse}</td>
						<td className="px-4 py-4 font-semibold text-darknavy">
							{formatReceivingReportCurrency(original.netAmount)}
						</td>
						<td className="px-4 py-4">
							<ReceivingReportStatusBadge status={original.status} />
						</td>
						<td className="px-4 py-4 text-center">
							<ReceivingReportRecordActions
								record={original}
								onUpdateStatus={updateReceivingReportStatus}
							/>
						</td>
					</tr>
				)}
			/>
		</section>
	);
}

function ReceivingReportListHeaderActions() {
	return (
		<>
			<div className="flex lg:hidden">
				<ModuleActionMenu
					className="[&>button]:h-10 [&>button]:w-10"
					items={ReceivingReportOverflowItems}
					label="Receiving Report actions"
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
				href={`${ReceivingReportHref}/add`}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Start New Receiving Report
			</Link>
		</>
	);
}

function ReceivingReportMetrics({
	records,
}: {
	records: ReceivingReportRecord[];
}) {
	const approvedCount = countReceivingReportsByStatus(records, "Approved");
	const draftCount = countReceivingReportsByStatus(records, "Draft");
	const pendingCount = countReceivingReportsByStatus(records, "Pending");
	const closedCount = countReceivingReportsByStatus(records, "Closed");
	const totalNet = records.reduce((sum, record) => sum + record.netAmount, 0);

	return (
		<ModuleStatisticCards
			className="2xl:grid-cols-5"
			items={[
				{
					label: "Total Reports",
					value: records.length,
					summary: "All time",
					icon: Boxes,
					iconClassName: "bg-skyblue/20 text-skyblue",
				},
				{
					label: "Draft",
					value: draftCount,
					summary: formatReceivingReportPercentage(draftCount, records.length),
					icon: Clock3,
					iconClassName: "bg-offwhite text-darknavy",
				},
				{
					label: "Pending",
					value: pendingCount,
					summary: formatReceivingReportPercentage(pendingCount, records.length),
					icon: Clock3,
					iconClassName: "bg-offwhite text-darknavy",
				},
				{
					label: "Approved",
					value: approvedCount,
					summary: formatReceivingReportPercentage(approvedCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-citron/25 text-darknavy",
				},
				{
					label: "Total Net",
					value: formatReceivingReportCurrency(totalNet),
					summary: `${closedCount} closed`,
					icon: PackageCheck,
					iconClassName: "bg-skyblue/15 text-skyblue",
				},
			]}
		/>
	);
}

function ReceivingReportStatusBadge({
	status,
}: {
	status: ReceivingReportStatus;
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

function ReceivingReportRecordActions({
	onUpdateStatus,
	record,
}: {
	onUpdateStatus: (
		record: ReceivingReportRecord,
		status: ReceivingReportStatus,
	) => void;
	record: ReceivingReportRecord;
}) {
	const isApproved = record.status === "Approved";
	const isDisapproved = record.status === "Disapproved";
	const isCancelled = record.status === "Cancelled";
	const canEdit = canEditReceivingReportStatus(record.status);
	const undoStatus: ReceivingReportStatus = "Draft";
	const cancelStatus: ReceivingReportStatus = isCancelled ? "Draft" : "Cancelled";
	const overflowItems: ModuleActionMenuItem[] = [
		{
			disabled: !canApproveReceivingReportStatus(record.status),
			icon: isApproved ? Undo2 : CheckCircle2,
			label: isApproved ? "Undo Approved" : "Approve",
			onSelect: () =>
				onUpdateStatus(record, isApproved ? undoStatus : "Approved"),
			type: "button",
		},
		{
			disabled: !canDisapproveReceivingReportStatus(record.status),
			icon: isDisapproved ? Undo2 : ThumbsDown,
			label: isDisapproved ? "Undo Disapproved" : "Disapprove",
			onSelect: () =>
				onUpdateStatus(record, isDisapproved ? undoStatus : "Disapproved"),
			tone: isDisapproved ? "default" : "danger",
			type: "button",
		},
		{
			disabled: !canCancelReceivingReportStatus(record.status),
			icon: isCancelled ? Undo2 : Ban,
			label: isCancelled ? "Uncancelled" : "Cancel",
			onSelect: () => onUpdateStatus(record, cancelStatus),
			tone: isCancelled ? "default" : "danger",
			type: "button",
		},
	];

	return (
		<ModuleTableActions className="!justify-center">
			<ModuleTableActionLink
				href={`${ReceivingReportHref}/view/${record.id}`}
				icon={Eye}
				label={`View receiving report ${record.transactionNo}`}
				title="View"
				variant="view"
			/>
			{canEdit ? (
				<ModuleTableActionLink
					href={`${ReceivingReportHref}/edit/${record.id}`}
					icon={Edit3}
					label={`Edit receiving report ${record.transactionNo}`}
					title="Edit"
					variant="edit"
				/>
			) : (
				<ModuleTableActionButton
					disabled
					icon={Edit3}
					label={`Edit receiving report ${record.transactionNo}`}
					title="Edit"
					variant="edit"
				/>
			)}
			<ModuleActionMenu
				className="[&>button]:h-9 [&>button]:w-9"
				items={overflowItems}
				label={`More actions for receiving report ${record.transactionNo}`}
			/>
		</ModuleTableActions>
	);
}

function canEditReceivingReportStatus(status: ReceivingReportStatus) {
	return status === "Draft" || status === "Pending";
}

function canApproveReceivingReportStatus(status: ReceivingReportStatus) {
	return status === "Draft" || status === "Pending" || status === "Approved";
}

function canDisapproveReceivingReportStatus(status: ReceivingReportStatus) {
	return status === "Draft" || status === "Pending" || status === "Disapproved";
}

function canCancelReceivingReportStatus(status: ReceivingReportStatus) {
	return status !== "Closed";
}

function filterReceivingReports(
	records: ReceivingReportRecord[],
	filters: {
		amountRange: AmountRangeValue;
		dateRange: DateRangeValue;
		query: string;
		statusFilter: string;
	},
) {
	const normalizedQuery = filters.query.trim().toLowerCase();
	const fromDate = parseIsoDate(filters.dateRange.from);
	const toDate = parseIsoDate(filters.dateRange.to);
	const fromAmount = parseAmount(filters.amountRange.from);
	const toAmount = parseAmount(filters.amountRange.to);

	return records.filter((record) => {
		if (normalizedQuery) {
			const haystack = [
				record.transactionNo,
				record.vceName,
				record.vceCode,
				record.poNo,
				record.warehouse,
				record.status,
			]
				.join(" ")
				.toLowerCase();

			if (!haystack.includes(normalizedQuery)) {
				return false;
			}
		}

		if (filters.statusFilter !== "all" && record.status !== filters.statusFilter) {
			return false;
		}

		const recordDate = parseIsoDate(record.documentDate);

		if (fromDate && recordDate && recordDate.getTime() < fromDate.getTime()) {
			return false;
		}

		if (toDate && recordDate && recordDate.getTime() > toDate.getTime()) {
			return false;
		}

		if (fromAmount != null && record.netAmount < fromAmount) {
			return false;
		}

		if (toAmount != null && record.netAmount > toAmount) {
			return false;
		}

		return true;
	});
}

function parseAmount(value: string) {
	if (!value.trim()) {
		return null;
	}

	const amount = Number.parseFloat(value.replace(/,/g, ""));

	return Number.isFinite(amount) ? amount : null;
}

function parseIsoDate(value: string) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return null;
	}

	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(year, month - 1, day);

	if (
		date.getFullYear() !== year ||
		date.getMonth() !== month - 1 ||
		date.getDate() !== day
	) {
		return null;
	}

	return date;
}

const ReceivingReportOverflowItems = [
	{ icon: Upload, label: "Upload", onSelect: () => undefined, type: "button" },
	{ icon: Download, label: "Export", onSelect: () => undefined, type: "button" },
] satisfies ModuleActionMenuItem[];

const ReceivingReportStatusFilterOptions = [
	{ label: "All Statuses", value: "all" },
	{ label: "Draft", value: "Draft" },
	{ label: "Pending", value: "Pending" },
	{ label: "Approved", value: "Approved" },
	{ label: "Disapproved", value: "Disapproved" },
	{ label: "Closed", value: "Closed" },
	{ label: "Cancelled", value: "Cancelled" },
] as const;

const statusIconByStatus = {
	Approved: CheckCircle2,
	Cancelled: Ban,
	Closed: PackageCheck,
	Disapproved: XCircle,
	Draft: Clock3,
	Pending: Clock3,
} satisfies Record<ReceivingReportStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
	Approved: "bg-citron/25 text-darknavy",
	Cancelled: "bg-darknavy/10 text-darknavy/70",
	Closed: "bg-skyblue/20 text-darknavy",
	Disapproved: "bg-coralpink/15 text-coralpink",
	Draft: "bg-offwhite text-darknavy/70",
	Pending: "bg-offwhite text-darknavy",
} satisfies Record<ReceivingReportStatus, string>;

const columnHelper = createColumnHelper<ReceivingReportRecord>();

const ReceivingReportColumns = [
	columnHelper.accessor("transactionNo", {
		header: "RR No.",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("documentDate", {
		header: "Document Date",
		cell: (info) => formatReceivingReportDate(info.getValue()),
	}),
	columnHelper.accessor("vceName", {
		header: "Vendor",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("vceCode", {
		header: "Party Code",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("poNo", {
		header: "PO No.",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("warehouse", {
		header: "Warehouse",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("netAmount", {
		header: "Net Amount",
		cell: (info) => formatReceivingReportCurrency(info.getValue()),
		meta: { className: "text-right" },
	}),
	columnHelper.accessor("status", {
		header: "Status",
		cell: (info) => info.getValue(),
	}),
	columnHelper.display({
		id: "actions",
		header: "Actions",
		meta: { className: "text-center" },
	}),
];
