"use client";

import Link from "next/link";
import {
	createColumnHelper,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Boxes, Clock3, Download, PackageCheck, Plus, Search, Upload } from "lucide-react";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";

const InventoryAccountHref = "/inventory/inventory-account";

type InventoryAccountListRecord = {
	id: string;
	documentNo: string;
	documentDate: string;
	warehouse: string;
	itemCategory: string;
	status: string;
};

export function InventoryAccountMain() {
	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data: InventoryAccountRecords,
		columns: InventoryAccountColumns,
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
				title="Inventory Account"
				description="Review inventory account counts, compare stock on hand with physical count, and prepare count variance entries."
				eyebrow={
					<>
						<Boxes className="h-3.5 w-3.5" aria-hidden="true" />
						Inventory
					</>
				}
				actions={<InventoryAccountListHeaderActions />}
			/>

			<ModuleStatisticCards
				className="2xl:grid-cols-4"
				items={[
					{
						label: "Total Counts",
						value: InventoryAccountRecords.length,
						summary: "All time",
						icon: Boxes,
						iconClassName: "bg-skyblue/20 text-skyblue",
					},
					{
						label: "Draft",
						value: 0,
						summary: "Pending completion",
						icon: Clock3,
						iconClassName: "bg-offwhite text-darknavy",
					},
					{
						label: "Approved",
						value: 0,
						summary: "Ready for posting",
						icon: PackageCheck,
						iconClassName: "bg-citron/25 text-darknavy",
					},
					{
						label: "Variance Items",
						value: 0,
						summary: "Needs review",
						icon: PackageCheck,
						iconClassName: "bg-skyblue/15 text-skyblue",
					},
				]}
			/>

			<ModuleTable
				emptyDescription="Start a new inventory account count to capture warehouse stock on hand, physical count, and variance."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No inventory account records yet"
				minWidthClassName="min-w-[78rem]"
				pageSizeOptions={[5, 10, 15, 20, 25, 50]}
				paginationLabel="records"
				paginationStorageKey="inventory-inventory-account"
				table={table}
				tableTitle="Inventory account records"
				renderRow={({ id, original }) => (
					<tr
						key={id}
						className="module-table-row border-b border-darknavy/8 last:border-b-0"
					>
						<td className="px-4 py-4 font-semibold text-skyblue">
							{original.documentNo}
						</td>
						<td className="px-4 py-4">{original.documentDate}</td>
						<td className="px-4 py-4">{original.warehouse}</td>
						<td className="px-4 py-4">{original.itemCategory}</td>
						<td className="px-4 py-4">{original.status}</td>
					</tr>
				)}
			/>
		</section>
	);
}

function InventoryAccountListHeaderActions() {
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
				href={`${InventoryAccountHref}/add`}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Start New Inventory Account
			</Link>
		</>
	);
}

const columnHelper = createColumnHelper<InventoryAccountListRecord>();

const InventoryAccountColumns = [
	columnHelper.accessor("documentNo", {
		header: "Trans No.",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("documentDate", {
		header: "Document Date",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("warehouse", {
		header: "Warehouse",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("itemCategory", {
		header: "Item Category",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("status", {
		header: "Status",
		cell: (info) => info.getValue(),
	}),
];

const InventoryAccountRecords: InventoryAccountListRecord[] = [];
