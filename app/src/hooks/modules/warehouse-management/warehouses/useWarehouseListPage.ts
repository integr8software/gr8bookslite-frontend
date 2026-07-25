"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  WarehouseDefaultColumnOrder,
  WarehouseDefaultColumnVisibility,
  WarehouseDefaultSorting,
  WarehouseTableColumns,
  WarehouseTablePaginationStorageKey,
  WarehouseTablePreferencesModuleKey,
  WarehouseTablePreferencesStorageKey,
} from "@/app/src/constants/modules/warehouse-management/warehouses/WarehouseConstants";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
  WarehouseRecord,
  WarehouseStatus,
  WarehouseTableColumnKey,
  WarehouseTableRecord,
} from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import { useWarehousesStore } from "@/app/src/hooks/modules/warehouse-management/warehouses/useWarehouses";
import { getWarehouseAvailableBranchLabel } from "@/app/src/data/modules/warehouse-management/warehouses/WarehouseData";
import { useTransactionNumberSetupStore } from "@/app/src/hooks/modules/system-administration/transaction-number-setup/useTransactionNumberSetup";

export function useWarehouseListPage() {
  const { setWarehouseStatus, isLoading, isMutating, isRefreshing, lastSyncedAt, permissions, refreshWarehouses, statistics, warehouses } = useWarehousesStore();
  const branchOptions = useTransactionNumberSetupStore(
    (state) => state.branchOptions,
  );
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilterState] = useState("All");
  const [statusFilter, setStatusFilterState] = useState<WarehouseStatus | "All">("Active");
  const [pendingDeleteWarehouse, setPendingDeleteWarehouse] = useState<WarehouseRecord | null>(null);
  const [pagination, setPagination] = useState<PaginationState>(getInitialWarehousePagination);
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const { columnOrder, columnVisibility, setColumnOrder, setColumnVisibility } = useTablePreferences({
    defaultColumnOrder: WarehouseDefaultColumnOrder,
    defaultColumnVisibility: WarehouseDefaultColumnVisibility,
    defaultSorting: WarehouseDefaultSorting,
    moduleKey: WarehouseTablePreferencesModuleKey,
    storageKey: WarehouseTablePreferencesStorageKey,
  });
  const tableWarehouses = useMemo<WarehouseTableRecord[]>(
    () =>
      warehouses.map((warehouse) => ({
        ...warehouse,
        availableBranchLabel: getWarehouseAvailableBranchLabel(warehouse),
        availableBranchNameSet: new Set([warehouse.branchName, ...warehouse.availableBranches].filter(Boolean)),
        totalItems: warehouse.items.length,
        inventoryValue: warehouse.items.reduce((total, item) => total + item.onHand * item.unitCost, 0),
      })),
    [warehouses],
  );
  const branchFilterOptions = useMemo(
    () => createUniqueSortedOptions(branchOptions.map((branch) => branch.name)),
    [branchOptions],
  );
  const filteredWarehouses = useMemo(() => {
    const normalizedQuery = normalizeLowercaseText(query);

    return tableWarehouses.filter(
      (warehouse) =>
        (branchFilter === "All" || isWarehouseAvailableForBranchName(warehouse, branchFilter)) &&
        (statusFilter === "All" || warehouse.status === statusFilter) &&
        (!normalizedQuery ||
          [warehouse.code, warehouse.name, warehouse.availableBranchLabel, warehouse.managerName, warehouse.status, warehouse.address]
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
            meta: { className: column.className, label: column.label },
          };
        }

        return createWarehouseColumn(column.key, column.label, column.className);
      }),
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  const table = useReactTable({
    data: filteredWarehouses,
    columns,
    initialState: {
      columnOrder: WarehouseDefaultColumnOrder,
      columnVisibility: WarehouseDefaultColumnVisibility,
      sorting: WarehouseDefaultSorting,
    },
    state: {
      columnOrder,
      columnVisibility,
      pagination,
      sorting,
    },
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    window.localStorage.setItem(getWarehousePaginationStorageKey(), JSON.stringify(pagination));
  }, [pagination]);

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

    void setWarehouseStatus(pendingDeleteWarehouse.id, pendingDeleteWarehouse.status === "Active" ? "Inactive" : "Active");
    setPendingDeleteWarehouse(null);
  }

  return {
    branchFilter,
    branchFilterOptions,
    filteredWarehouses,
    handleConfirmDelete,
    handleQueryChange,
    isLoading,
    isMutating,
    isRefreshing,
    lastSyncedAt,
    pendingDeleteWarehouse,
    permissions,
    query,
    refreshWarehouses,
    resetFilters,
    setBranchFilter,
    setPendingDeleteWarehouse,
    setStatusFilter,
    statistics,
    statusFilter,
    table,
    tableWarehouses,
    warehouses,
  };
}

function getInitialWarehousePagination(): PaginationState {
  if (typeof window === "undefined") {
    return { pageIndex: 0, pageSize: 5 };
  }

  try {
    const saved = window.localStorage.getItem(getWarehousePaginationStorageKey());
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<PaginationState>;
      if (typeof parsed.pageIndex === "number" && typeof parsed.pageSize === "number" && [5, 10, 15, 20, 25, 50].includes(parsed.pageSize)) {
        return { pageIndex: Math.max(0, parsed.pageIndex), pageSize: parsed.pageSize };
      }
    }
  } catch {
    // Use the shared table default when stored pagination is invalid.
  }

  return { pageIndex: 0, pageSize: 5 };
}

function getWarehousePaginationStorageKey() {
  return `gr8booksneo:module-table:${WarehouseTablePaginationStorageKey}:pagination`;
}

function createWarehouseColumn(key: WarehouseTableColumnKey, header: string, className: string): ColumnDef<WarehouseTableRecord> {
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
    meta: { className, label: header },
  };
}

function createUniqueSortedOptions(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0))).sort((first, second) => first.localeCompare(second));
}

function isWarehouseAvailableForBranchName(warehouse: WarehouseTableRecord, branchName: string) {
  if (warehouse.branchAvailabilityMode === "All Branches") {
    return true;
  }

  if (warehouse.branchAvailabilityMode === "Except Branches") {
    return !warehouse.availableBranches.includes(branchName);
  }

  return warehouse.availableBranchNameSet.has(branchName);
}
