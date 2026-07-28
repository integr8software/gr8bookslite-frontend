"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { WarehouseInventoryStockTableColumns } from "@/app/src/constants/modules/warehouse-management/warehouse-inventory-stock/WarehouseInventoryStockConstants";
import { createWarehouseInventoryStockRows } from "@/app/src/data/modules/warehouse-management/warehouse-inventory-stock/WarehouseInventoryStockData";
import { createWarehouseStorageDemoWarehouses } from "@/app/src/data/modules/warehouse-management/warehouse-storage/WarehouseStorageMockData";
import { useWarehousesStore } from "@/app/src/hooks/modules/warehouse-management/warehouses/useWarehouses";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseModuleTypes";

export function useWarehouseInventoryStockListPage() {
  const searchParams = useSearchParams();
  const warehouseId = searchParams.get("warehouseId")?.trim() ?? "";
  const { isLoading, isRefreshing, lastSyncedAt, refreshWarehouses, warehouses } =
    useWarehousesStore();
  const displayWarehouses = useMemo(
    () => createWarehouseStorageDemoWarehouses(warehouses),
    [warehouses],
  );
  const [query, setQueryState] = useState("");
  const [statusFilter, setStatusFilterState] = useState("Active");
  const [warehouseFilter, setWarehouseFilterState] = useState(warehouseId || "All");
  const [locationFilter, setLocationFilterState] = useState("All");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: "warehouse", desc: false }]);
  const records = useMemo(() => createWarehouseInventoryStockRows(displayWarehouses), [displayWarehouses]);
  const filteredRecords = useMemo(
    () => filterWarehouseModuleRows(records, query, statusFilter, warehouseFilter, locationFilter),
    [locationFilter, query, records, statusFilter, warehouseFilter],
  );
  const columns = useMemo(
    () => createWarehouseModuleColumns(WarehouseInventoryStockTableColumns),
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
  const locationCodes = useMemo(() => getWarehouseInventoryLocationCodes(records, warehouseFilter), [records, warehouseFilter]);

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
    setLocationFilterState("All");
    table.setPageIndex(0);
  }

  function setLocationFilter(value: string) {
    setLocationFilterState(value);
    table.setPageIndex(0);
  }

  function resetFilters() {
    setQueryState("");
    setStatusFilterState("Active");
    setWarehouseFilterState(warehouseId || "All");
    setLocationFilterState("All");
    table.setPageIndex(0);
  }

  return {
    filteredRecords,
    isLoading,
    isRefreshing,
    lastSyncedAt,
    locationCodes,
    locationFilter,
    query,
    records,
    refreshRecords: refreshWarehouses,
    resetFilters,
    setQuery,
    setLocationFilter,
    setStatusFilter,
    setWarehouseFilter,
    statuses,
    statusFilter,
    table,
    warehouseFilter,
    warehouses: displayWarehouses,
  };
}

function createWarehouseModuleColumns(
  columns: typeof WarehouseInventoryStockTableColumns,
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
  warehouseId: string,
  locationCode: string,
) {
  const normalizedQuery = normalizeLowercaseText(query);

  return rows.filter(
    (row) =>
      (!warehouseId || warehouseId === "All" || row.warehouseId === warehouseId) &&
      (locationCode === "All" || row.values[10] === locationCode) &&
      (statusFilter === "All" || row.status === statusFilter) &&
      (!normalizedQuery ||
        [row.status, ...row.values].join(" ").toLowerCase().includes(normalizedQuery)),
  );
}

function getWarehouseInventoryLocationCodes(rows: WarehouseModuleRecord[], warehouseId: string) {
  return Array.from(
    new Set(
      rows
        .filter((row) => !warehouseId || warehouseId === "All" || row.warehouseId === warehouseId)
        .map((row) => row.values[10])
        .filter((value): value is string => Boolean(value && value !== "-")),
    ),
  ).sort((first, second) => first.localeCompare(second));
}

function getWarehouseModuleStatuses(rows: WarehouseModuleRecord[]) {
  return Array.from(new Set(rows.map((row) => row.status).filter(Boolean))).sort((first, second) =>
    first.localeCompare(second),
  );
}
