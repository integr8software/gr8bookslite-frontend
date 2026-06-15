"use client";

import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { CheckCircle2, CirclePause, Layers, Package, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
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

const ItemBundlesHref = "/maintenance/item-management/item-bundles";

type BundleRow = {
	bundleItem: string;
	bundlePrice: number;
	code: string;
	components: BundleComponent[];
	id: string;
	name: string;
	status: "Active" | "Inactive";
	totalCost: number;
};

type BundleComponent = {
	cost: number;
	item: string;
	quantity: number;
	sellingPrice: number;
};

const BundleRows: BundleRow[] = [
	{
		id: "bundle-office-starter",
		code: "BND-2001",
		name: "Starter Office Bundle",
		bundleItem: "Starter Office Bundle",
		components: [
			{ cost: 185, item: "Office Paper A4", quantity: 5, sellingPrice: 235 },
			{ cost: 48, item: "Thermal Receipt Roll", quantity: 10, sellingPrice: 72 },
		],
		bundlePrice: 1750,
		status: "Active",
		totalCost: 1405,
	},
	{
		id: "bundle-pos-kit",
		code: "BND-2002",
		name: "POS Counter Kit",
		bundleItem: "POS Counter Kit",
		components: [
			{ cost: 48, item: "Thermal Receipt Roll", quantity: 20, sellingPrice: 72 },
			{ cost: 28, item: "Barcode Labels", quantity: 10, sellingPrice: 45 },
		],
		bundlePrice: 1850,
		status: "Active",
		totalCost: 1240,
	},
	{
		id: "bundle-onboarding-archive",
		code: "BND-2003",
		name: "Archived Onboarding Kit",
		bundleItem: "Onboarding Kit",
		components: [
			{ cost: 320, item: "Forms Pack", quantity: 1, sellingPrice: 450 },
			{ cost: 185, item: "Office Paper A4", quantity: 2, sellingPrice: 235 },
		],
		bundlePrice: 950,
		status: "Inactive",
		totalCost: 690,
	},
];

export function ItemBundlesListPage() {
	const [rows, setRows] = useState<BundleRow[]>(BundleRows);
	const [pendingStatusRow, setPendingStatusRow] = useState<BundleRow | null>(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("All");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "bundleItem", desc: false },
	]);
	const filteredRows = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return rows.filter(
			(row) =>
				(statusFilter === "All" || row.status === statusFilter) &&
				(!normalizedQuery ||
					[
						row.code,
						row.bundleItem,
						row.components
							.map((component) => `${component.item} x${component.quantity}`)
							.join(" "),
						row.status,
					]
						.join(" ")
						.toLowerCase()
						.includes(normalizedQuery)),
		);
	}, [query, rows, statusFilter]);
	const columns = useMemo<ColumnDef<BundleRow>[]>(
		() => [
			createColumn("code", "Bundle Code", "w-[10rem]"),
			createColumn("bundleItem", "Bundle Item", "w-[16rem]"),
			createColumn("components", "Component Items", "w-[24rem]"),
			createColumn("totalCost", "Total Cost", "w-[10rem] text-right"),
			createComputedColumn("originalSelling", "Original Selling", "w-[11rem] text-right"),
			createColumn("bundlePrice", "Bundle Price", "w-[10rem] text-right"),
			createComputedColumn("savings", "Savings", "w-[10rem] text-right"),
			createColumn("status", "Status", "w-[9rem]"),
			{
				id: "actions",
				header: "Actions",
				enableSorting: false,
				meta: { className: "w-[10rem] text-center" },
			},
		],
		[],
	);
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredRows,
		columns,
		state: { pagination, sorting },
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});
	const activeCount = rows.filter((row) => row.status === "Active").length;
	const nextPendingStatus =
		pendingStatusRow?.status === "Active" ? "Inactive" : "Active";

	function confirmStatusChange() {
		if (!pendingStatusRow) {
			return;
		}

		setRows((currentRows) =>
			currentRows.map((row) =>
				row.id === pendingStatusRow.id
					? { ...row, status: nextPendingStatus }
					: row,
			),
		);
		setPendingStatusRow(null);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Item Bundles"
				description="Maintain grouped sales items with component items, quantities, bundle price, and status."
				eyebrow={
					<>
						<Layers className="h-3.5 w-3.5" aria-hidden="true" />
						Item management
					</>
				}
				actions={
					<Link href={`${ItemBundlesHref}/add`} className={moduleHeaderActionClassNames.primary}>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Bundle
					</Link>
				}
			/>
			<ModuleMetrics
				metrics={[
					{ helper: "Bundle records", icon: Layers, label: "Total Bundles", value: rows.length },
					{ helper: "Available for selling", icon: CheckCircle2, label: "Active", tone: "emerald", value: activeCount },
					{ helper: "Kept for history", icon: CirclePause, label: "Inactive", tone: "amber", value: rows.length - activeCount },
					{ helper: "Component lines", icon: Package, label: "Components", tone: "violet", value: rows.reduce((total, row) => total + row.components.length, 0) },
				]}
			/>
			<ModuleTable
				emptyDescription="Add a bundle to group multiple component items under one sales item."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No item bundles found"
				minWidthClassName="min-w-[96rem]"
				paginationStorageKey="maintenance.item-management.item-bundles"
				table={table}
				toolbar={
					<ModuleTableToolbar>
						<ModuleTableSearch
							label="Search item bundles"
							placeholder="Search by bundle, code, component, or status"
							value={query}
							onChange={(value) => {
								setQuery(value);
								table.setPageIndex(0);
							}}
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={statusFilter}
							options={[
								{ label: "All", value: "All" },
								{ label: "Active", value: "Active" },
								{ label: "Inactive", value: "Inactive" },
							]}
							onChange={(value) => {
								setStatusFilter(value);
								table.setPageIndex(0);
							}}
						/>
						<ModuleTableResetButton
							onClick={() => {
								setQuery("");
								setStatusFilter("All");
								table.setPageIndex(0);
							}}
						/>
					</ModuleTableToolbar>
				}
				renderRow={({ id, original }) => (
					<tr
						key={id}
						className="module-table-row border-b border-darknavy/8 last:border-b-0"
					>
						<td className="px-4 py-4 font-semibold">{original.code}</td>
						<td className="px-4 py-4">{original.bundleItem}</td>
						<td className="px-4 py-4 text-darknavy/70">
							<div className="font-medium text-darknavy">
								{formatComponents(original.components)}
							</div>
						</td>
						<td className="px-4 py-4 text-right font-semibold">
							{formatCurrency(original.totalCost)}
						</td>
						<td className="px-4 py-4 text-right font-semibold">
							{formatCurrency(getComponentSellingTotal(original.components))}
						</td>
						<td className="px-4 py-4 text-right font-semibold">
							{formatCurrency(original.bundlePrice)}
						</td>
						<td className="px-4 py-4 text-right font-semibold">
							{formatCurrency(
								Math.max(
									getComponentSellingTotal(original.components) -
										original.bundlePrice,
									0,
								),
							)}
						</td>
						<td className="px-4 py-4">
							<StatusBadge status={original.status} />
						</td>
						<td className="px-4 py-4 text-center">
							<ModuleTableActions className="justify-center">
								<ModuleTableActionLink
									variant="view"
									href={`${ItemBundlesHref}/view/${original.id}`}
									label={`View ${original.bundleItem}`}
								/>
								<ModuleTableActionLink
									variant="edit"
									href={`${ItemBundlesHref}/edit/${original.id}`}
									label={`Edit ${original.bundleItem}`}
								/>
								<ModuleTableActionButton
									variant={original.status === "Active" ? "inactive" : "active"}
									label={
										original.status === "Active"
											? `Set ${original.bundleItem} inactive`
											: `Set ${original.bundleItem} active`
									}
									onClick={() => setPendingStatusRow(original)}
								/>
							</ModuleTableActions>
						</td>
					</tr>
				)}
			/>
			<AppDialog
				isOpen={Boolean(pendingStatusRow)}
				title={`Set bundle ${nextPendingStatus.toLowerCase()}?`}
				description={
					pendingStatusRow
						? `${pendingStatusRow.bundleItem} will be marked as ${nextPendingStatus}.`
						: ""
				}
				confirmLabel={`Set ${nextPendingStatus}`}
				tone={nextPendingStatus === "Inactive" ? "danger" : "success"}
				onCancel={() => setPendingStatusRow(null)}
				onConfirm={confirmStatusChange}
			/>
		</section>
	);
}

function StatusBadge({ status }: { status: string }) {
	return (
		<span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
			{status}
		</span>
	);
}

function formatCurrency(value: number) {
	return new Intl.NumberFormat("en-US", {
		currency: "PHP",
		style: "currency",
	}).format(value);
}

function formatComponents(components: BundleComponent[]) {
	return components
		.map((component) => `${component.item} x${component.quantity}`)
		.join(", ");
}

function getComponentSellingTotal(components: BundleComponent[]) {
	return components.reduce(
		(total, component) => total + component.sellingPrice * component.quantity,
		0,
	);
}

function createColumn(
	key: keyof BundleRow,
	header: string,
	className: string,
): ColumnDef<BundleRow> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}

function createComputedColumn(
	id: string,
	header: string,
	className: string,
): ColumnDef<BundleRow> {
	return {
		id,
		header,
		enableSorting: false,
		meta: { className },
	};
}
