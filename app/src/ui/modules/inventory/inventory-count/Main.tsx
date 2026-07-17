"use client";

import Link from "next/link";
import {
	createColumnHelper,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ClipboardList,
	Clock3,
	Download,
	PackageCheck,
	Plus,
	Search,
	Upload,
} from "lucide-react";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import {
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
	status: "Draft" | "In Progress" | "Approved";
};

export function InventoryCountMain() {
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
	const table = useReactTable({
		data: InventoryCountRecords,
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
						value: InventoryCountRecords.length,
						summary: "All time",
						icon: ClipboardList,
						iconClassName: "bg-skyblue/20 text-skyblue",
					},
					{
						label: "In Progress",
						value: InventoryCountRecords.filter(
							(record) => record.status === "In Progress",
						).length,
						summary: "Open counts",
						icon: Clock3,
						iconClassName: "bg-offwhite text-darknavy",
					},
					{
						label: "Approved",
						value: InventoryCountRecords.filter(
							(record) => record.status === "Approved",
						).length,
						summary: "Finalized",
						icon: PackageCheck,
						iconClassName: "bg-citron/25 text-darknavy",
					},
					{
						label: "Items Counted",
						value: InventoryCountRecords.reduce(
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
							<ModuleTableActions className="justify-center">
								<ModuleTableActionLink
									href={`${InventoryCountHref}/view/${original.id}`}
									label={`View ${original.countNo}`}
									variant="view"
								/>
								<ModuleTableActionLink
									href={`${InventoryCountHref}/edit/${original.id}`}
									label={`Edit ${original.countNo}`}
									variant="edit"
								/>
							</ModuleTableActions>
						</td>
					</tr>
				)}
			/>
		</section>
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
