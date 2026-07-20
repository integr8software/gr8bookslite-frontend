"use client";

import { useEffect, useMemo, useState } from "react";
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
import { WarehouseStorageTableColumns } from "@/app/src/constants/modules/maintenance/warehouse-storage/WarehouseStorageConstants";
import {
	createWarehouseStorageRows,
	createWarehouseStorageListRecords,
	removeWarehouseStorageRecord,
	upsertWarehouseStorageRecord,
} from "@/app/src/data/modules/maintenance/warehouse-storage/WarehouseStorageData";
import { createWarehouseStorageDemoWarehouses } from "@/app/src/data/modules/maintenance/warehouse-storage/WarehouseStorageMockData";
import { useWarehousesStore } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouses";
import type { WarehouseStorageListRecord } from "@/app/src/types/modules/maintenance/warehouse-storage/WarehouseStorageTypes";
import type {
	WarehouseModuleActionMode,
	WarehouseModuleFormValues,
	WarehouseModuleRecord,
} from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";

export function useWarehouseStorageListPage() {
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
	const [statusFilter, setStatusFilterState] = useState("All");
	const [warehouseFilter, setWarehouseFilterState] = useState("All");
	const [viewMode, setViewMode] = useState<"List" | "Map">("List");
	const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
	const [draftWarehouses, setDraftWarehouses] = useState<typeof warehouses>([]);
	const [pendingDelete, setPendingDelete] =
		useState<WarehouseModuleRecord | null>(null);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "warehouse", desc: false },
	]);
	const demoWarehouses = useMemo(() => createWarehouseStorageDemoWarehouses(warehouses), [warehouses]);
	const displayWarehouses = draftWarehouses.length > 0 ? draftWarehouses : demoWarehouses;
	const records = useMemo(() => createWarehouseStorageRows(displayWarehouses), [displayWarehouses]);
	const listRecords = useMemo(() => createWarehouseStorageListRecords(displayWarehouses), [displayWarehouses]);
	const filteredRecords = useMemo(
		() => filterWarehouseModuleRows(records, query, statusFilter, warehouseFilter),
		[query, records, statusFilter, warehouseFilter],
	);
	const filteredListRecords = useMemo(
		() => filterWarehouseStorageListRecords(listRecords, query, statusFilter, warehouseFilter),
		[listRecords, query, statusFilter, warehouseFilter],
	);
	const columns = useMemo(
		() => createWarehouseModuleColumns(WarehouseStorageTableColumns),
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
	const statistics = getWarehouseModuleStatistics(listRecords);
	const selectedRecord = selectedRecordId
		? listRecords.find((record) => record.id === selectedRecordId || record.recordId === selectedRecordId) ?? null
		: null;

	useEffect(() => {
		setDraftWarehouses(createWarehouseStorageDemoWarehouses(warehouses));
	}, [warehouses]);

	function setQuery(value: string) {
		setQueryState(value);
		table.setPageIndex(0);
	}

	function setStatusFilter(value: string) {
		setStatusFilterState(value);
		table.setPageIndex(0);
	}

	function setWarehouseFilter(value: string) {
		setWarehouseFilterState(value);
		table.setPageIndex(0);
	}

	function resetFilters() {
		setQueryState("");
		setStatusFilterState("All");
		setWarehouseFilterState("All");
		table.setPageIndex(0);
	}

	function confirmDelete() {
		if (!pendingDelete) {
			return;
		}

		const changedWarehouse = removeWarehouseStorageRecord(
			pendingDelete,
			displayWarehouses,
		);

		if (changedWarehouse) {
			const nextWarehouses = displayWarehouses.map((warehouse) =>
				warehouse.id === changedWarehouse.id ? changedWarehouse : warehouse,
			);

			setDraftWarehouses(nextWarehouses);
			if (!changedWarehouse.id.startsWith("demo-")) {
				updateWarehouse(changedWarehouse);
			}
		}

		setPendingDelete(null);
	}

	function saveLocation(
		form: WarehouseModuleFormValues,
		record?: WarehouseStorageListRecord,
		mode: WarehouseModuleActionMode = record ? "edit" : "add",
	) {
		const row = record ? createWarehouseModuleRecordFromLocation(record) : undefined;
		const nextWarehouses = upsertWarehouseStorageRecord({
			form,
			mode,
			row,
			warehouses: displayWarehouses,
		});
		const changedWarehouses = nextWarehouses.filter(
			(warehouse, index) => warehouse !== displayWarehouses[index],
		);

		setDraftWarehouses(nextWarehouses);
		changedWarehouses.forEach((changedWarehouse) => {
			if (!changedWarehouse.id.startsWith("demo-")) {
				updateWarehouse(changedWarehouse);
			}
		});
	}

	return {
		confirmDelete,
		filteredRecords,
		filteredListRecords,
		isLoading,
		isMutating,
		isRefreshing,
		lastSyncedAt,
		listRecords,
		pendingDelete,
		query,
		selectedRecord,
		setSelectedRecordId,
		records,
		refreshRecords: refreshWarehouses,
		resetFilters,
		saveLocation,
		setPendingDelete,
		setQuery,
		setStatusFilter,
		setViewMode,
		setWarehouseFilter,
		statistics,
		statuses,
		statusFilter,
		table,
		viewMode,
		warehouseFilter,
		warehouses: displayWarehouses,
	};
}

function createWarehouseModuleRecordFromLocation(record: WarehouseStorageListRecord): WarehouseModuleRecord {
	return {
		id: record.id,
		kind: "warehouse-storage",
		recordId: record.recordId,
		status: record.status,
		values: record.values,
		warehouseId: record.warehouseId,
	};
}

function createWarehouseModuleColumns(
	columns: typeof WarehouseStorageTableColumns,
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
	warehouseFilter: string,
) {
	const normalizedQuery = normalizeLowercaseText(query);

	return rows.filter(
		(row) =>
			(warehouseFilter === "All" || row.warehouseId === warehouseFilter) &&
			(statusFilter === "All" || row.status === statusFilter) &&
			(!normalizedQuery ||
				[row.status, ...row.values]
					.join(" ")
					.toLowerCase()
					.includes(normalizedQuery)),
	);
}

function filterWarehouseStorageListRecords(
	rows: WarehouseStorageListRecord[],
	query: string,
	statusFilter: string,
	warehouseFilter: string,
) {
	const normalizedQuery = normalizeLowercaseText(query);

	return rows.filter(
		(row) =>
			(warehouseFilter === "All" || row.warehouseId === warehouseFilter) &&
			(statusFilter === "All" || row.status === statusFilter) &&
			(!normalizedQuery ||
				[row.status, row.path, ...row.values]
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

function getWarehouseModuleStatistics(rows: WarehouseStorageListRecord[]) {
	const activeRecords = rows.filter((row) => row.status === "Active").length;
	const blockedRecords = rows.filter((row) => row.status === "Blocked" || row.status === "Inactive").length;
	const capacityTrackedRecords = rows.filter((row) => row.location.capacity?.trim()).length;

	return {
		activeRecords,
		blockedRecords,
		capacityTrackedRecords,
		otherRecords: rows.length - activeRecords,
		totalRecords: rows.length,
	};
}
