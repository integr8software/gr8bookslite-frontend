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
import { WarehouseTransfersTableColumns } from "@/app/src/constants/modules/warehouse-management/warehouse-transfers/WarehouseTransferConstants";
import {
  createWarehouseTransferRows,
  removeWarehouseTransferRecord,
} from "@/app/src/data/modules/warehouse-management/warehouse-transfers/WarehouseTransferData";
import { useWarehousesStore } from "@/app/src/hooks/modules/warehouse-management/warehouses/useWarehouses";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseModuleTypes";

export function useWarehouseTransfersListPage() {
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
  const [pendingDelete, setPendingDelete] = useState<WarehouseModuleRecord | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const records = useMemo(() => createWarehouseTransferRows(warehouses), [warehouses]);
  const filteredRecords = useMemo(
    () => filterWarehouseModuleRows(records, query, statusFilter, warehouseFilter),
    [query, records, statusFilter, warehouseFilter],
  );
  const columns = useMemo(() => createWarehouseModuleColumns(WarehouseTransfersTableColumns), []);
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

    const changedWarehouse = removeWarehouseTransferRecord(pendingDelete, warehouses);

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
    setWarehouseFilter,
    statuses,
    statusFilter,
    table,
    warehouseFilter,
    warehouses,
  };
}

function createWarehouseModuleColumns(
  columns: typeof WarehouseTransfersTableColumns,
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
        [row.status, ...row.values].join(" ").toLowerCase().includes(normalizedQuery)),
  );
}

function getWarehouseModuleStatuses(rows: WarehouseModuleRecord[]) {
  return Array.from(new Set(rows.map((row) => row.status).filter(Boolean))).sort((first, second) =>
    first.localeCompare(second),
  );
}
