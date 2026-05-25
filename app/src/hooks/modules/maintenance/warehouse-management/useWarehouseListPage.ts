"use client";

import { useMemo, useState } from "react";
import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { WarehouseManagementTableColumns } from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import type {
	WarehouseRecord,
	WarehouseTableColumnKey,
} from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";
import { useWarehouseManagementStore } from "@/app/src/hooks/modules/maintenance/warehouse-management/useWarehouseManagement";

export function useWarehouseListPage() {
	const {
		deleteWarehouse,
		isLoading,
		isMutating,
		warehouses,
	} = useWarehouseManagementStore();
	const [query, setQuery] = useState("");
	const [pendingDeleteWarehouse, setPendingDeleteWarehouse] =
		useState<WarehouseRecord | null>(null);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const filteredWarehouses = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		if (!normalizedQuery) {
			return warehouses;
		}

		return warehouses.filter((warehouse) =>
			[
				warehouse.name,
				warehouse.branchName,
				warehouse.availability,
				warehouse.availableBranches.join(" "),
				warehouse.managerName,
				warehouse.status,
				warehouse.address,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery),
		);
	}, [query, warehouses]);
	const columns = useMemo<ColumnDef<WarehouseRecord>[]>(
		() =>
			WarehouseManagementTableColumns.map((column) => {
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

	function handleConfirmDelete() {
		if (!pendingDeleteWarehouse) {
			return;
		}

		deleteWarehouse(pendingDeleteWarehouse.id);
		setPendingDeleteWarehouse(null);
	}

	return {
		handleConfirmDelete,
		handleQueryChange,
		isLoading,
		isMutating,
		pendingDeleteWarehouse,
		query,
		setPendingDeleteWarehouse,
		table,
	};
}

function createWarehouseColumn(
	key: WarehouseTableColumnKey,
	header: string,
	className: string,
): ColumnDef<WarehouseRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
