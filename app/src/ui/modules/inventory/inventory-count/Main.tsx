"use client";

import Link from "next/link";
import { useState } from "react";
import {
	createColumnHelper,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	Ban,
	CheckCircle2,
	ClipboardList,
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
} from "lucide-react";
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

const InventoryCountHref = "/inventory/inventory-count";

type InventoryCountRecord = {
	id: string;
	countNo: string;
	countDate: string;
	warehouse: string;
	category: string;
	totalItems: number;
	variance: string;
	status: InventoryCountStatus;
};

type InventoryCountStatus =
	| "Approved"
	| "Cancelled"
	| "Disapproved"
	| "Draft"
	| "In Progress";

export function InventoryCountMain() {
	const [records, setRecords] = useState(InventoryCountRecords);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
	const table = useReactTable({
		data: records,
		columns: InventoryCountColumns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 5,
			},
		},
	});

	function updateInventoryCountStatus(
		record: InventoryCountRecord,
		status: InventoryCountStatus,
	) {
		setRecords((currentRecords) =>
			currentRecords.map((currentRecord) =>
				currentRecord.id === record.id
					? { ...currentRecord, status }
					: currentRecord,
			),
		);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Inventory Count"
				description="Record physical inventory counts, compare counted quantities, and review warehouse variances."
				eyebrow={
					<>
						<ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
						Inventory
					</>
				}
				actions={<InventoryCountHeaderActions />}
			/>

			<ModuleStatisticCards
				className="2xl:grid-cols-4"
				items={[
					{
						label: "Count Sheets",
						value: records.length,
						summary: "All time",
						icon: ClipboardList,
						iconClassName: "bg-skyblue/20 text-skyblue",
					},
					{
						label: "In Progress",
						value: records.filter(
							(record) => record.status === "In Progress",
						).length,
						summary: "Open counts",
						icon: Clock3,
						iconClassName: "bg-offwhite text-darknavy",
					},
					{
						label: "Approved",
						value: records.filter(
							(record) => record.status === "Approved",
						).length,
						summary: "Finalized",
						icon: PackageCheck,
						iconClassName: "bg-citron/25 text-darknavy",
					},
					{
						label: "Items Counted",
						value: records.reduce(
							(total, record) => total + record.totalItems,
							0,
						),
						summary: "Across sheets",
						icon: PackageCheck,
						iconClassName: "bg-skyblue/15 text-skyblue",
					},
				]}
			/>

			<ModuleTable
				emptyDescription="Start a new inventory count to capture warehouse stock quantities."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No inventory counts yet"
				minWidthClassName="min-w-[76rem]"
				pageSizeOptions={[5, 10, 15, 20, 25, 50]}
				paginationLabel="records"
				paginationStorageKey="inventory-inventory-count"
				table={table}
				tableTitle="Inventory count sheets"
				renderRow={({ id, original }) => (
					<tr
						key={id}
						className="module-table-row border-b border-darknavy/8 last:border-b-0"
					>
						<td className="px-4 py-4 font-semibold text-skyblue">
							{original.countNo}
						</td>
						<td className="px-4 py-4">{original.countDate}</td>
						<td className="px-4 py-4">{original.warehouse}</td>
						<td className="px-4 py-4">{original.category}</td>
						<td className="px-4 py-4">{original.totalItems}</td>
						<td className="px-4 py-4 font-semibold text-darknavy">
							{original.variance}
						</td>
						<td className="px-4 py-4">{original.status}</td>
						<td className="px-4 py-4 text-center">
							<InventoryCountRecordActions
								record={original}
								onUpdateStatus={updateInventoryCountStatus}
							/>
						</td>
					</tr>
				)}
			/>
		</section>
	);
}

function InventoryCountRecordActions({
	onUpdateStatus,
	record,
}: {
	onUpdateStatus: (
		record: InventoryCountRecord,
		status: InventoryCountStatus,
	) => void;
	record: InventoryCountRecord;
}) {
	const isApproved = record.status === "Approved";
	const isDisapproved = record.status === "Disapproved";
	const isCancelled = record.status === "Cancelled";
	const canEdit = canEditInventoryCountStatus(record.status);
	const undoStatus: InventoryCountStatus = "In Progress";
	const cancelStatus: InventoryCountStatus = isCancelled
		? "Draft"
		: "Cancelled";
	const overflowItems: ModuleActionMenuItem[] = [
		{
			disabled: !canApproveInventoryCountStatus(record.status),
			icon: isApproved ? Undo2 : CheckCircle2,
			label: isApproved ? "Undo Approved" : "Approve",
			onSelect: () =>
				onUpdateStatus(record, isApproved ? undoStatus : "Approved"),
			type: "button",
		},
		{
			disabled: !canDisapproveInventoryCountStatus(record.status),
			icon: isDisapproved ? Undo2 : ThumbsDown,
			label: isDisapproved ? "Undo Disapproved" : "Disapprove",
			onSelect: () =>
				onUpdateStatus(record, isDisapproved ? undoStatus : "Disapproved"),
			tone: isDisapproved ? "default" : "danger",
			type: "button",
		},
		{
			disabled: !canCancelInventoryCountStatus(record.status),
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
				href={`${InventoryCountHref}/view/${record.id}`}
				icon={Eye}
				label={`View inventory count ${record.countNo}`}
				title="View"
				variant="view"
			/>
			{canEdit ? (
				<ModuleTableActionLink
					href={`${InventoryCountHref}/edit/${record.id}`}
					icon={Edit3}
					label={`Edit inventory count ${record.countNo}`}
					title="Edit"
					variant="edit"
				/>
			) : (
				<ModuleTableActionButton
					disabled
					icon={Edit3}
					label={`Edit inventory count ${record.countNo}`}
					title="Edit"
					variant="edit"
				/>
			)}
			<ModuleActionMenu
				className="[&>button]:h-9 [&>button]:w-9"
				items={overflowItems}
				label={`More actions for inventory count ${record.countNo}`}
			/>
		</ModuleTableActions>
	);
}

function canEditInventoryCountStatus(status: InventoryCountStatus) {
	return status === "Draft" || status === "In Progress";
}

function canApproveInventoryCountStatus(status: InventoryCountStatus) {
	return (
		status === "Draft" ||
		status === "In Progress" ||
		status === "Approved"
	);
}

function canDisapproveInventoryCountStatus(status: InventoryCountStatus) {
	return (
		status === "Draft" ||
		status === "In Progress" ||
		status === "Disapproved"
	);
}

function canCancelInventoryCountStatus(status: InventoryCountStatus) {
	return status !== "Approved";
}

function InventoryCountHeaderActions() {
	return (
		<>
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
				href={`${InventoryCountHref}/add`}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Start New Inventory Count
			</Link>
		</>
	);
}

const columnHelper = createColumnHelper<InventoryCountRecord>();

const InventoryCountColumns = [
	columnHelper.accessor("countNo", {
		header: "Count No.",
		meta: { className: "w-[12rem]" },
	}),
	columnHelper.accessor("countDate", {
		header: "Count Date",
		meta: { className: "w-[10rem]" },
	}),
	columnHelper.accessor("warehouse", {
		header: "Warehouse",
		meta: { className: "w-[14rem]" },
	}),
	columnHelper.accessor("category", {
		header: "Item Category",
		meta: { className: "w-[14rem]" },
	}),
	columnHelper.accessor("totalItems", {
		header: "Items",
		meta: { className: "w-[8rem]" },
	}),
	columnHelper.accessor("variance", {
		header: "Variance",
		meta: { className: "w-[10rem]" },
	}),
	columnHelper.accessor("status", {
		header: "Status",
		meta: { className: "w-[10rem]" },
	}),
	columnHelper.display({
		id: "actions",
		header: "Actions",
		meta: { className: "w-[10rem] text-center" },
	}),
];

const InventoryCountRecords: InventoryCountRecord[] = [
	{
		id: "inc-001",
		countNo: "INC-2026-0001",
		countDate: "2026-07-12",
		warehouse: "Main Warehouse",
		category: "Finished Goods",
		totalItems: 128,
		variance: "-3.00",
		status: "Approved",
	},
	{
		id: "inc-002",
		countNo: "INC-2026-0002",
		countDate: "2026-07-15",
		warehouse: "Cebu Warehouse",
		category: "Raw Materials",
		totalItems: 86,
		variance: "0.00",
		status: "In Progress",
	},
	{
		id: "inc-003",
		countNo: "INC-2026-0003",
		countDate: "2026-07-17",
		warehouse: "Davao Warehouse",
		category: "Packaging",
		totalItems: 42,
		variance: "5.00",
		status: "Draft",
	},
];
