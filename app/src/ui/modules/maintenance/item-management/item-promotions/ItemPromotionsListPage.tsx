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
import { BadgePercent, CheckCircle2, CirclePause, Plus, Search, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";
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

const ItemPromotionsHref = "/maintenance/item-management/item-promotions";

type PromotionRow = {
	code: string;
	discountManagementRule: string;
	id: string;
	item: string;
	name: string;
	status: "Active" | "Inactive";
	type: string;
	validity: string;
	value: string;
};

const PromotionRows: PromotionRow[] = [
	{
		id: "promo-buy-one",
		code: "PROMO-001",
		name: "Buy 1 Take 1 Receipt Roll",
		type: "Buy 1 Take 1",
		discountManagementRule: "Linked: BOGO sales discount",
		item: "Thermal Receipt Roll",
		value: "Free matching item",
		validity: "2026-06-01 to 2026-06-30",
		status: "Active",
	},
	{
		id: "promo-bundle",
		code: "PROMO-002",
		name: "Starter Bundle Discount",
		type: "Bundle Discount",
		discountManagementRule: "Linked: item bundle fixed discount",
		item: "Starter Office Bundle",
		value: "PHP 250.00",
		validity: "2026-06-01 to 2026-07-15",
		status: "Active",
	},
	{
		id: "promo-vip",
		code: "PROMO-003",
		name: "VIP Paper Discount",
		type: "Percentage Discount",
		discountManagementRule: "Linked: VIP customer discount",
		item: "Office Paper A4",
		value: "10%",
		validity: "2026-05-01 to 2026-05-31",
		status: "Inactive",
	},
];

export function ItemPromotionsListPage() {
	const [rows, setRows] = useState<PromotionRow[]>(PromotionRows);
	const [pendingStatusRow, setPendingStatusRow] = useState<PromotionRow | null>(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("All");
	const [typeFilter, setTypeFilter] = useState("All");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const typeOptions = useMemo(
		() => Array.from(new Set(PromotionRows.map((row) => row.type))).sort(),
		[],
	);
	const filteredRows = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return rows.filter(
			(row) =>
				(statusFilter === "All" || row.status === statusFilter) &&
				(typeFilter === "All" || row.type === typeFilter) &&
				(!normalizedQuery ||
					[
						row.code,
						row.name,
						row.type,
						row.discountManagementRule,
						row.item,
						row.value,
						row.validity,
						row.status,
					]
						.join(" ")
						.toLowerCase()
						.includes(normalizedQuery)),
		);
	}, [query, rows, statusFilter, typeFilter]);
	const columns = useMemo<ColumnDef<PromotionRow>[]>(
		() => [
			createColumn("code", "Promotion Code", "w-[11rem]"),
			createColumn("name", "Promotion", "w-[18rem]"),
			createColumn("type", "Type", "w-[14rem]"),
			createColumn("item", "Item", "w-[14rem]"),
			createColumn("value", "Value", "w-[10rem]"),
			createColumn("discountManagementRule", "Discount Management", "w-[18rem]"),
			createColumn("validity", "Validity", "w-[16rem]"),
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
				title="Item Promotions"
				description="Maintain item-level promotions such as buy-one-take-one, bundle discounts, percentage discounts, and fixed discounts."
				eyebrow={
					<>
						<BadgePercent className="h-3.5 w-3.5" aria-hidden="true" />
						Item management
					</>
				}
				actions={
					<Link href={`${ItemPromotionsHref}/add`} className={moduleHeaderActionClassNames.primary}>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Promotion
					</Link>
				}
			/>
			<ModuleMetrics
				metrics={[
					{ helper: "Promotion records", icon: BadgePercent, label: "Total Promotions", value: rows.length },
					{ helper: "Available for transactions", icon: CheckCircle2, label: "Active", tone: "emerald", value: activeCount },
					{ helper: "Kept for history", icon: CirclePause, label: "Inactive", tone: "amber", value: rows.length - activeCount },
					{ helper: "Promotion methods", icon: Tag, label: "Types", tone: "violet", value: 4 },
				]}
			/>
			<ModuleTable
				emptyDescription="Add an item promotion to manage item-level discounts and offers."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No item promotions found"
				minWidthClassName="min-w-[116rem]"
				paginationStorageKey="maintenance.item-management.item-promotions"
				table={table}
				toolbar={
					<ModuleTableToolbar>
						<ModuleTableSearch
							label="Search item promotions"
							placeholder="Search by promotion, type, item, value, or status"
							value={query}
							onChange={(value) => {
								setQuery(value);
								table.setPageIndex(0);
							}}
						/>
						<ModuleTableFilterSelect
							label="Type"
							value={typeFilter}
							options={[
								{ label: "All", value: "All" },
								...typeOptions.map((type) => ({ label: type, value: type })),
							]}
							onChange={(value) => {
								setTypeFilter(value);
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
								setTypeFilter("All");
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
						<td className="px-4 py-4">{original.name}</td>
						<td className="px-4 py-4">{original.type}</td>
						<td className="px-4 py-4 text-darknavy/70">{original.item}</td>
						<td className="px-4 py-4 font-semibold">{original.value}</td>
						<td className="px-4 py-4 text-darknavy/70">
							{original.discountManagementRule}
						</td>
						<td className="px-4 py-4 text-darknavy/70">{original.validity}</td>
						<td className="px-4 py-4"><StatusBadge status={original.status} /></td>
						<td className="px-4 py-4 text-center">
							<ModuleTableActions className="justify-center">
								<ModuleTableActionLink
									variant="view"
									href={`${ItemPromotionsHref}/view/${original.id}`}
									label={`View ${original.name}`}
								/>
								<ModuleTableActionLink
									variant="edit"
									href={`${ItemPromotionsHref}/edit/${original.id}`}
									label={`Edit ${original.name}`}
								/>
								<ModuleTableActionButton
									variant={original.status === "Active" ? "inactive" : "active"}
									label={
										original.status === "Active"
											? `Set ${original.name} inactive`
											: `Set ${original.name} active`
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
				title={`Set promotion ${nextPendingStatus.toLowerCase()}?`}
				description={
					pendingStatusRow
						? `${pendingStatusRow.name} will be marked as ${nextPendingStatus}.`
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

function createColumn(
	key: keyof PromotionRow,
	header: string,
	className: string,
): ColumnDef<PromotionRow> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
