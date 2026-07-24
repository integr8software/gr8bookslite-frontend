"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { WarehouseCapacityStorageRulesConfigs } from "@/app/src/constants/modules/warehouse-management/warehouse-storage/capacity-storage-rules/WarehouseCapacityStorageRulesConstants";
import { createWarehouseCapacityStorageRulesRecords } from "@/app/src/data/modules/warehouse-management/warehouse-storage/capacity-storage-rules/WarehouseCapacityStorageRulesData";
import { MockWarehousesData } from "@/app/src/data/modules/warehouse-management/warehouse-storage/capacity-storage-rules/MockWarehousesData";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
  WarehouseCapacityStorageRulesQueryKeys,
  createWarehouseCapacityStorageRulesRecord,
  fetchWarehouseCapacityStorageRules,
  updateWarehouseCapacityStorageRulesRecord,
} from "@/app/src/services/modules/warehouse-management/warehouse-storage/capacity-storage-rules/WarehouseCapacityStorageRulesApi";
import type {
  WarehouseCapacityStorageRulesModule,
  WarehouseCapacityStorageRulesRecord,
} from "@/app/src/types/modules/warehouse-management/warehouse-storage/capacity-storage-rules/WarehouseCapacityStorageRulesTypes";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";

const apiEnabled = process.env.NEXT_PUBLIC_WAREHOUSE_WORKSPACE_API_ENABLED === "true";

export function useWarehouseCapacityStorageRulesListPage(
  module: WarehouseCapacityStorageRulesModule,
) {
  const config = WarehouseCapacityStorageRulesConfigs[module];
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const queryClient = useQueryClient();
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
  const workspaceQuery = useQuery({
    queryKey: WarehouseCapacityStorageRulesQueryKeys.list(module, activeCompanyId, warehouseFilter),
    queryFn: () =>
      fetchWarehouseCapacityStorageRules(module, {
        companyId: activeCompanyId as number,
        warehouseId: warehouseFilter === "All" ? undefined : warehouseFilter,
      }),
    enabled: apiEnabled && activeCompanyId !== null,
    retry: false,
  });
  const records = useMemo(
    () => (apiEnabled ? (workspaceQuery.data?.records ?? []) : demoRecords),
    [demoRecords, workspaceQuery.data?.records],
  );
  const permissions = workspaceQuery.data?.permissions ?? {
    canCreate: !config.readOnly,
    canExport: true,
    canUpdate: !config.readOnly,
    canView: true,
  };
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
  const saveMutation = useMutation({
    mutationFn: (record: WarehouseCapacityStorageRulesRecord) =>
      record.id
        ? updateWarehouseCapacityStorageRulesRecord(module, record)
        : createWarehouseCapacityStorageRulesRecord(module, {
            cells: record.cells,
            status: record.status,
            warehouseId: record.warehouseId,
            warehouseName: record.warehouseName,
          }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: WarehouseCapacityStorageRulesQueryKeys.all(activeCompanyId),
      }),
  });

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
    if (!apiEnabled) {
      return;
    }
    void queryClient.invalidateQueries({
      queryKey: WarehouseCapacityStorageRulesQueryKeys.all(activeCompanyId),
    });
  }

  async function saveRecord(record: WarehouseCapacityStorageRulesRecord) {
    if (!apiEnabled) {
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
      return nextRecord;
    }

    const savedRecord = await saveMutation.mutateAsync(record);
    setSelectedRecordId(savedRecord.id);
    return savedRecord;
  }

  return {
    config,
    error: workspaceQuery.error,
    filteredRecords,
    isLoading: apiEnabled && workspaceQuery.isLoading,
    isRefreshing: apiEnabled && workspaceQuery.isFetching && !workspaceQuery.isLoading,
    lastSyncedAt: apiEnabled ? workspaceQuery.dataUpdatedAt : null,
    isMutating: saveMutation.isPending,
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
