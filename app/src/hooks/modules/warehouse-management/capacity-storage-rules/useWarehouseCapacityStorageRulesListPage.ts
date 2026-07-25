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
import { WarehouseCapacityStorageRulesConfigs } from "@/app/src/constants/modules/warehouse-management/capacity-storage-rules/WarehouseCapacityStorageRulesConstants";
import { createWarehouseCapacityStorageRulesRecords } from "@/app/src/data/modules/warehouse-management/capacity-storage-rules/WarehouseCapacityStorageRulesData";
import { MockWarehousesData } from "@/app/src/data/modules/warehouse-management/capacity-storage-rules/MockWarehousesData";
import type {
  WarehouseCapacityStorageRulesModule,
  WarehouseCapacityStorageRulesRecord,
} from "@/app/src/types/modules/warehouse-management/capacity-storage-rules/WarehouseCapacityStorageRulesTypes";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";


export function useWarehouseCapacityStorageRulesListPage(
  module: WarehouseCapacityStorageRulesModule,
) {
  const config = WarehouseCapacityStorageRulesConfigs[module];
  const [query, setQueryState] = useState("");
  const [warehouseFilter, setWarehouseFilterState] = useState(
    config.warehouseMode === "one" ? "wh-main" : "All",
  );
  const [statusFilter, setStatusFilterState] = useState("All");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [demoRecords, setDemoRecords] = useState(() =>
    createWarehouseCapacityStorageRulesRecords(module),
  );
  const records = demoRecords;
  const permissions = {
    canCreate: !config.readOnly,
    canExport: true,
    canUpdate: !config.readOnly,
    canView: true,
  };
  const [lastSyncedAt, setLastSyncedAt] = useState(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const warehouses = MockWarehousesData;
  const statuses = useMemo(
    () =>
      Array.from(new Set(records.map((record) => record.status))).sort((first, second) =>
        first.localeCompare(second),
      ),
    [records],
  );
  const filteredRecords = useMemo(() => {
    const normalizedQuery = normalizeLowercaseText(query);
    return records.filter(
      (record) =>
        (warehouseFilter === "All" || record.warehouseId === warehouseFilter) &&
        (statusFilter === "All" || record.status === statusFilter) &&
        (!normalizedQuery ||
          [record.warehouseName, record.status, ...Object.values(record.cells)]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)),
    );
  }, [query, records, statusFilter, warehouseFilter]);
  const columns = useMemo<ColumnDef<WarehouseCapacityStorageRulesRecord>[]>(
    () =>
      config.columns.map((column) => ({
        id: column.id,
        accessorFn:
          column.id === "status"
            ? (record) => record.status
            : column.id === "actions"
              ? () => ""
              : (record) => record.cells[column.id] ?? "",
        enableSorting: column.id !== "actions",
        header: column.label,
        meta: { className: column.className },
        sortingFn: "alphanumeric",
      })),
    [config.columns],
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
  const selectedRecord = records.find((record) => record.id === selectedRecordId) ?? null;
  function setQuery(value: string) {
    setQueryState(value);
    table.setPageIndex(0);
  }

  function setWarehouseFilter(value: string) {
    setWarehouseFilterState(value);
    setSelectedRecordId(null);
    table.setPageIndex(0);
  }

  function setStatusFilter(value: string) {
    setStatusFilterState(value);
    table.setPageIndex(0);
  }

  function resetFilters() {
    setQueryState("");
    setStatusFilterState("All");
    setWarehouseFilterState(config.warehouseMode === "one" ? "wh-main" : "All");
    table.setPageIndex(0);
  }

  function refreshRecords() {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setIsRefreshing(false);
      setLastSyncedAt(new Date());
    }, 400);
  }

  async function saveRecord(record: WarehouseCapacityStorageRulesRecord) {
    const nextRecord = {
      ...record,
      id: record.id || `${module}-${Date.now()}`,
    };
    setDemoRecords((current) => {
      const existingIndex = current.findIndex((item) => item.id === nextRecord.id);
      if (existingIndex < 0) {
        return [nextRecord, ...current];
      }
      return current.map((item) => (item.id === nextRecord.id ? nextRecord : item));
    });
    setSelectedRecordId(nextRecord.id);
    setLastSyncedAt(new Date());
    return nextRecord;
  }

  return {
    config,
    error: null as Error | null,
    filteredRecords,
    isLoading: false,
    isRefreshing,
    lastSyncedAt,
    isMutating: false,
    permissions,
    query,
    records,
    refreshRecords,
    resetFilters,
    saveRecord,
    selectedRecord,
    setQuery,
    setSelectedRecordId,
    setStatusFilter,
    setWarehouseFilter,
    statusFilter,
    statuses,
    table,
    warehouseFilter,
    warehouses,
  };
}
