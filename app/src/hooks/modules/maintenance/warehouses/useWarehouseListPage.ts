"use client";

import { useMemo, useState } from "react";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { WarehouseTableColumns } from "@/app/src/constants/modules/maintenance/warehouses/WarehouseConstants";
import type {
	WarehouseRecord,
	WarehouseStatus,
	WarehouseTableColumnKey,
	WarehouseTableRecord,
} from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";
import { useWarehousesStore } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouses";
import { getWarehouseAvailableBranchLabel } from "@/app/src/data/modules/maintenance/warehouses/WarehouseData";

export function useWarehouseListPage() {
	const {
		deleteWarehouse,
		isLoading,
		isMutating,
		lastSyncedAt,
		warehouses,
	} = useWarehousesStore();
	const [query, setQuery] = useState("");
	const [branchFilter, setBranchFilterState] = useState("All");
	const [statusFilter, setStatusFilterState] = useState<WarehouseStatus | "All">(
		"Active",
	);
	const [pendingDeleteWarehouse, setPendingDeleteWarehouse] =
		useState<WarehouseRecord | null>(null);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const tableWarehouses = useMemo<WarehouseTableRecord[]>(
		() =>
			warehouses.map((warehouse) => ({
				...warehouse,
				availableBranchLabel: getWarehouseAvailableBranchLabel(warehouse),
				totalItems: warehouse.items.length,
				inventoryValue: warehouse.items.reduce(
					(total, item) => total + item.onHand * item.unitCost,
					0,
				),
			})),
		[warehouses],
	);
	const branchFilterOptions = useMemo(
		() =>
			createUniqueSortedOptions(
				tableWarehouses.flatMap((warehouse) =>
					warehouse.availableBranches.length > 0
						? warehouse.availableBranches
						: [warehouse.branchName],
				),
			),
		[tableWarehouses],
	);
	const filteredWarehouses = useMemo(() => {
		const normalizedQuery = normalizeLowercaseText(query);

		return tableWarehouses.filter((warehouse) =>
			(branchFilter === "All" ||
				warehouse.availableBranches.includes(branchFilter) ||
				warehouse.branchName === branchFilter) &&
			(statusFilter === "All" || warehouse.status === statusFilter) &&
			(!normalizedQuery ||
			[
				warehouse.code,
				warehouse.name,
				warehouse.availableBranchLabel,
				warehouse.managerName,
				warehouse.status,
				warehouse.address,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery)),
		);
	}, [branchFilter, query, statusFilter, tableWarehouses]);
	const columns = useMemo<ColumnDef<WarehouseTableRecord>[]>(
		() =>
			WarehouseTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createWarehouseColumn(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredWarehouses,
		columns,
		state: {
			pagination,
			sorting,
		},
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	function handleQueryChange(value: string) {
		setQuery(value);
		table.setPageIndex(0);
	}

	function resetFilters() {
		setBranchFilterState("All");
		setQuery("");
		setStatusFilterState("Active");
		table.setPageIndex(0);
	}

	function setBranchFilter(value: string) {
		setBranchFilterState(value);
		table.setPageIndex(0);
	}

	function setStatusFilter(value: string) {
		setStatusFilterState(value as WarehouseStatus | "All");
		table.setPageIndex(0);
	}

	function handleConfirmDelete() {
		if (!pendingDeleteWarehouse) {
			return;
		}

		deleteWarehouse(pendingDeleteWarehouse.id);
		setPendingDeleteWarehouse(null);
	}

	return {
		branchFilter,
		branchFilterOptions,
		handleConfirmDelete,
		handleQueryChange,
		isLoading,
		isMutating,
		lastSyncedAt,
		pendingDeleteWarehouse,
		query,
		resetFilters,
		setBranchFilter,
		setPendingDeleteWarehouse,
		setStatusFilter,
		statusFilter,
		table,
		warehouses,
	};
}

function createWarehouseColumn(
	key: WarehouseTableColumnKey,
	header: string,
	className: string,
): ColumnDef<WarehouseTableRecord> {
	return {
		accessorKey: key,
		header,
		cell:
			key === "inventoryValue"
				? ({ getValue }) =>
						new Intl.NumberFormat("en-US", {
							currency: "PHP",
							style: "currency",
						}).format(Number(getValue()))
				: undefined,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}

function createUniqueSortedOptions(values: string[]) {
	return Array.from(
		new Set(values.filter((value) => value.trim().length > 0)),
	).sort((first, second) => first.localeCompare(second));
}
