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
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { StorageLocationsTableColumns } from "@/app/src/constants/modules/maintenance/storage-locations/StorageLocationConstants";
import {
	createStorageLocationRows,
	removeStorageLocationRecord,
} from "@/app/src/data/modules/maintenance/storage-locations/StorageLocationData";
import { useWarehousesStore } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouses";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";

export function useStorageLocationsListPage() {
	const {
		isLoading,
		isMutating,
		isRefreshing,
		lastSyncedAt,
		refreshWarehouses,
		updateWarehouse,
		warehouses,
	} = useWarehousesStore();
	const [query, setQueryState] = useState("");
	const [statusFilter, setStatusFilterState] = useState("Active");
	const [pendingDelete, setPendingDelete] =
		useState<WarehouseModuleRecord | null>(null);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "warehouse", desc: false },
	]);
	const records = useMemo(() => createStorageLocationRows(warehouses), [warehouses]);
	const filteredRecords = useMemo(
		() => filterWarehouseModuleRows(records, query, statusFilter),
		[query, records, statusFilter],
	);
	const columns = useMemo(
		() => createWarehouseModuleColumns(StorageLocationsTableColumns),
		[],
	);
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredRecords,
		columns,
		state: { pagination, sorting },
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});
	const statuses = getWarehouseModuleStatuses(records);
	const statistics = getWarehouseModuleStatistics(records);

	function setQuery(value: string) {
		setQueryState(value);
		table.setPageIndex(0);
	}

	function setStatusFilter(value: string) {
		setStatusFilterState(value);
		table.setPageIndex(0);
	}

	function resetFilters() {
		setQueryState("");
		setStatusFilterState("Active");
		table.setPageIndex(0);
	}

	function confirmDelete() {
		if (!pendingDelete) {
			return;
		}

		const changedWarehouse = removeStorageLocationRecord(
			pendingDelete,
			warehouses,
		);

		if (changedWarehouse) {
			updateWarehouse(changedWarehouse);
		}

		setPendingDelete(null);
	}

	return {
		confirmDelete,
		filteredRecords,
		isLoading,
		isMutating,
		isRefreshing,
		lastSyncedAt,
		pendingDelete,
		query,
		records,
		refreshRecords: refreshWarehouses,
		resetFilters,
		setPendingDelete,
		setQuery,
		setStatusFilter,
		statistics,
		statuses,
		statusFilter,
		table,
	};
}

function createWarehouseModuleColumns(
	columns: typeof StorageLocationsTableColumns,
): ColumnDef<WarehouseModuleRecord>[] {
	return columns.map((column) => {
		if (!("valueIndex" in column)) {
			return {
				id: column.id,
				header: column.label,
				enableSorting: false,
				meta: { className: column.className },
			};
		}

		return {
			id: column.id,
			accessorFn: (row) => row.values[column.valueIndex] ?? "",
			header: column.label,
			sortingFn: "alphanumeric",
			meta: { className: column.className },
		};
	});
}

function filterWarehouseModuleRows(
	rows: WarehouseModuleRecord[],
	query: string,
	statusFilter: string,
) {
	const normalizedQuery = normalizeLowercaseText(query);

	return rows.filter(
		(row) =>
			(statusFilter === "All" || row.status === statusFilter) &&
			(!normalizedQuery ||
				[row.status, ...row.values]
					.join(" ")
					.toLowerCase()
					.includes(normalizedQuery)),
	);
}

function getWarehouseModuleStatuses(rows: WarehouseModuleRecord[]) {
	return Array.from(new Set(rows.map((row) => row.status).filter(Boolean))).sort(
		(first, second) => first.localeCompare(second),
	);
}

function getWarehouseModuleStatistics(rows: WarehouseModuleRecord[]) {
	const activeRecords = rows.filter((row) => row.status === "Active").length;

	return {
		activeRecords,
		otherRecords: rows.length - activeRecords,
		totalRecords: rows.length,
	};
}
