"use client";

import { useMemo, useState } from "react";
import { type ColumnDef, type PaginationState, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import {
  ItemVariationsDefaultSorting,
  ItemVariationsDefaultColumnOrder,
  ItemVariationsDefaultColumnVisibility,
  ItemVariationsTableColumns,
  ItemVariationsTablePreferencesModuleKey,
  ItemVariationsTablePreferencesStorageKey,
} from "@/app/src/constants/modules/maintenance/item-variations/ItemVariationsConstants";
import { createItemVariationRecord } from "@/app/src/data/modules/maintenance/item-variations/ItemVariationsData";
import { useItemVariationsStore } from "@/app/src/hooks/modules/maintenance/item-variations/useItemVariations";
import type {
  ItemVariationFormValues,
  ItemVariationRecord,
  ItemVariationsListPageState,
} from "@/app/src/types/modules/maintenance/item-variations/ItemVariationsTypes";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";

export function useItemVariationsListPage(): ItemVariationsListPageState {
  const {
    addVariation,
    variations,
    isLoadError,
    isLoading,
    isMutating,
    isRefreshing,
    lastSyncedAt,
    loadErrorMessage,
    permissions,
    refreshVariations,
    statistics,
    updateVariation,
  } = useItemVariationsStore();
  const [drawer, setDrawer] = useState<ItemVariationsListPageState["drawer"]>(null);
  const [pendingStatusRecord, setPendingStatusRecord] = useState<ItemVariationRecord | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { columnOrder, columnVisibility, sorting, setColumnOrder, setColumnVisibility, setSorting } = useTablePreferences({
    defaultColumnOrder: ItemVariationsDefaultColumnOrder,
    defaultColumnVisibility: ItemVariationsDefaultColumnVisibility,
    defaultSorting: ItemVariationsDefaultSorting,
    moduleKey: ItemVariationsTablePreferencesModuleKey,
    storageKey: ItemVariationsTablePreferencesStorageKey,
  });
  const filteredRecords = useMemo(() => {
    const normalizedQuery = normalizeLowercaseText(query);

    return variations.filter(
      (record) =>
        (statusFilter === "All" || record.status === statusFilter) &&
        (!normalizedQuery ||
          [record.code, record.name, record.usage, record.values.map((value) => value.label).join(" "), record.status]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)),
    );
  }, [variations, query, statusFilter]);
  const tableColumns = useMemo<ColumnDef<ItemVariationRecord>[]>(
    () =>
      ItemVariationsTableColumns.map((column) => {
        if (!("key" in column)) {
          return {
            id: "actions",
            header: column.label,
            enableSorting: false,
            meta: { className: column.className, label: column.label },
          };
        }

        return {
          accessorKey: column.key,
          header: column.label,
          sortingFn: "alphanumeric",
          meta: { className: column.className, label: column.label },
        };
      }),
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  const table = useReactTable({
    data: filteredRecords,
    columns: tableColumns,
    initialState: {
      columnOrder: ItemVariationsDefaultColumnOrder,
      columnVisibility: ItemVariationsDefaultColumnVisibility,
      sorting: ItemVariationsDefaultSorting,
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

  async function saveRecord(values: ItemVariationFormValues) {
    if (drawer?.mode === "edit" && drawer.record) {
      await updateVariation(createItemVariationRecord(values, drawer.record));
    } else {
      await addVariation(values);
    }

    setDrawer(null);
  }

  function toggleStatus(record: ItemVariationRecord) {
    return updateVariation({
      ...record,
      status: record.status === "Active" ? "Inactive" : "Active",
    });
  }

  async function confirmStatusChange() {
    if (!pendingStatusRecord) {
      return;
    }

    await toggleStatus(pendingStatusRecord);
    setPendingStatusRecord(null);
  }

  return {
    activeCount: statistics.activeVariations,
    drawer,
    filteredRecords,
    inactiveCount: statistics.inactiveVariations,
    isLoading,
    isLoadError,
    isMutating,
    isRefreshing,
    lastSyncedAt,
    loadErrorMessage,
    pendingStatusRecord,
    permissions,
    query,
    records: variations,
    statistics,
    statusFilter,
    table,
    tableColumns,
    closeDrawer: () => setDrawer(null),
    openAddDrawer: () => setDrawer({ mode: "add" }),
    openEditDrawer: (record) => setDrawer({ mode: "edit", record }),
    openViewDrawer: (record) => setDrawer({ mode: "view", record }),
    confirmStatusChange,
    refreshRecords: refreshVariations,
    saveRecord,
    setQuery: (value) => {
      setQuery(value);
      table.setPageIndex(0);
    },
    setStatusFilter: (value) => {
      setStatusFilter(value);
      table.setPageIndex(0);
    },
    setPendingStatusRecord,
    toggleStatus,
  };
}
