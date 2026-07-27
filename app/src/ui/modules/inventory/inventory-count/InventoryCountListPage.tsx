"use client";

import Link from "next/link";
import {
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
import { InventoryCountHref, InventoryCountTablePaginationStorageKey } from "@/app/src/constants/modules/inventory/inventory-count/InventoryCountConstants";
import {
	canApproveInventoryCountStatus,
	canCancelInventoryCountStatus,
	canDisapproveInventoryCountStatus,
	canEditInventoryCountStatus,
	useInventoryCountListPage,
} from "@/app/src/hooks/modules/inventory/inventory-count/useInventoryCountListPage";
import type {
	InventoryCountRecord,
	InventoryCountStatus,
} from "@/app/src/types/modules/inventory/inventory-count/InventoryCountTypes";
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

export function InventoryCountListPage() {
	const page = useInventoryCountListPage();

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
	const table = useReactTable({
		data: page.records,
		columns: page.columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 5,
			},
		},
	});

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Inventory Count"
				description="Record inventory counts, compare counted quantities, and review warehouse variances."
				eyebrow={
					<>
						<ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
						Inventory
					</>
				}
				actions={<InventoryCountHeaderActions />}
			/>

			<InventoryCountStatisticCards records={page.records} />

			<ModuleTable
				emptyDescription="Start a new inventory count to capture warehouse stock quantities."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No inventory counts yet"
				minWidthClassName="min-w-[72rem]"
				pageSizeOptions={[5, 10, 15, 20, 25, 50]}
				paginationLabel="records"
				paginationStorageKey={InventoryCountTablePaginationStorageKey}
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
						<td className="px-4 py-4">{original.uploader}</td>
						<td className="px-4 py-4">{original.category}</td>
						<td className="px-4 py-4">{original.totalItems}</td>
						<td className="px-4 py-4 font-semibold text-darknavy">
							{original.variance}
						</td>
						<td className="px-4 py-4">{original.status}</td>
						<td className="px-4 py-4 text-center">
							<InventoryCountRecordActions
								record={original}
								onUpdateStatus={page.updateInventoryCountStatus}
							/>
						</td>
					</tr>
				)}
			/>
		</section>
	);
}

function InventoryCountStatisticCards({
	records,
}: {
	records: InventoryCountRecord[];
}) {
	return (
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
					value: records.filter((record) => record.status === "In Progress").length,
					summary: "Open counts",
					icon: Clock3,
					iconClassName: "bg-offwhite text-darknavy",
				},
				{
					label: "Approved",
					value: records.filter((record) => record.status === "Approved").length,
					summary: "Finalized",
					icon: PackageCheck,
					iconClassName: "bg-citron/25 text-darknavy",
				},
				{
					label: "Items Counted",
					value: records.reduce((total, record) => total + record.totalItems, 0),
					summary: "Across sheets",
					icon: PackageCheck,
					iconClassName: "bg-skyblue/15 text-skyblue",
				},
			]}
		/>
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
				Add Inventory Count
			</Link>
		</>
	);
}
