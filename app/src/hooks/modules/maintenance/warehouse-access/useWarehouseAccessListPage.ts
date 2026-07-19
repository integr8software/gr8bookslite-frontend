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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { WarehouseAccessTableColumns } from "@/app/src/constants/modules/maintenance/warehouse-access/WarehouseAccessConstants";
import { fetchWarehouseAccess, revokeWarehouseAccess } from "@/app/src/services/modules/maintenance/warehouse-access/WarehouseAccessApi";
import { WarehouseAccessQueryKeys } from "@/app/src/services/modules/maintenance/warehouse-access/WarehouseAccessQueryKeys";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";

export function useWarehouseAccessListPage() {
  const queryClient = useQueryClient();
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const warehouseAccessQuery = useQuery({
    queryKey: WarehouseAccessQueryKeys.list(activeCompanyId),
    queryFn: () => fetchWarehouseAccess(),
    enabled: activeCompanyId !== null,
    retry: false,
  });
  const [query, setQueryState] = useState("");
  const [statusFilter, setStatusFilterState] = useState("Active");
  const [pendingDelete, setPendingDelete] = useState<WarehouseModuleRecord | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: "warehouse", desc: false }]);
  const records = useMemo(
    () =>
      (warehouseAccessQuery.data?.warehouseAccess ?? []).map((access): WarehouseModuleRecord => ({
        id: `access-${access.warehouseId}-${access.id}`,
        kind: "access",
        recordId: access.id,
        status: access.status,
        values: [access.warehouseName ?? "", access.userName, access.permissions.join(", "), access.status],
        warehouseId: access.warehouseId ?? "",
      })),
    [warehouseAccessQuery.data?.warehouseAccess],
  );
  const filteredRecords = useMemo(() => filterWarehouseModuleRows(records, query, statusFilter), [query, records, statusFilter]);
  const columns = useMemo(() => createWarehouseModuleColumns(WarehouseAccessTableColumns), []);
  const deleteMutation = useMutation({
    mutationFn: revokeWarehouseAccess,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: WarehouseAccessQueryKeys.all(activeCompanyId),
      });
      setPendingDelete(null);
      toast.success("Warehouse access revoked.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not revoke warehouse access. Please try again.");
    },
  });
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

    deleteMutation.mutate(pendingDelete.recordId);
  }

  function refreshRecords() {
    void queryClient.invalidateQueries({
      queryKey: WarehouseAccessQueryKeys.all(activeCompanyId),
    });
  }

  return {
    confirmDelete,
    filteredRecords,
    isLoading: warehouseAccessQuery.isLoading,
    isMutating: deleteMutation.isPending,
    isRefreshing: warehouseAccessQuery.isFetching && !warehouseAccessQuery.isLoading,
    lastSyncedAt: warehouseAccessQuery.dataUpdatedAt,
    pendingDelete,
    query,
    records,
    refreshRecords,
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

function createWarehouseModuleColumns(columns: typeof WarehouseAccessTableColumns): ColumnDef<WarehouseModuleRecord>[] {
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

function filterWarehouseModuleRows(rows: WarehouseModuleRecord[], query: string, statusFilter: string) {
  const normalizedQuery = normalizeLowercaseText(query);

  return rows.filter(
    (row) =>
      (statusFilter === "All" || row.status === statusFilter) &&
      (!normalizedQuery || [row.status, ...row.values].join(" ").toLowerCase().includes(normalizedQuery)),
  );
}

function getWarehouseModuleStatuses(rows: WarehouseModuleRecord[]) {
  return Array.from(new Set(rows.map((row) => row.status).filter(Boolean))).sort((first, second) => first.localeCompare(second));
}

function getWarehouseModuleStatistics(rows: WarehouseModuleRecord[]) {
  const activeRecords = rows.filter((row) => row.status === "Active").length;

  return {
    activeRecords,
    otherRecords: rows.length - activeRecords,
    totalRecords: rows.length,
  };
}
