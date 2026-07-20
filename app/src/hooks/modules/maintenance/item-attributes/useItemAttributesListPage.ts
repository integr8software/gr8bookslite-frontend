"use client";

import { useMemo, useState } from "react";
import { type ColumnDef, type PaginationState, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import {
  ItemAttributesDefaultSorting,
  ItemAttributesDefaultColumnOrder,
  ItemAttributesDefaultColumnVisibility,
  ItemAttributesTableColumns,
  ItemAttributesTablePreferencesModuleKey,
  ItemAttributesTablePreferencesStorageKey,
} from "@/app/src/constants/modules/maintenance/item-attributes/ItemAttributesConstants";
import { createItemAttributeRecord } from "@/app/src/data/modules/maintenance/item-attributes/ItemAttributesData";
import { useItemAttributesStore } from "@/app/src/hooks/modules/maintenance/item-attributes/useItemAttributes";
import type {
  ItemAttributeFormValues,
  ItemAttributeRecord,
  ItemAttributesListPageState,
} from "@/app/src/types/modules/maintenance/item-attributes/ItemAttributesTypes";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";

export function useItemAttributesListPage(): ItemAttributesListPageState {
  const {
    addAttribute,
    attributes,
    isLoadError,
    isLoading,
    isMutating,
    isRefreshing,
    lastSyncedAt,
    loadErrorMessage,
    permissions,
    refreshAttributes,
    statistics,
    updateAttribute,
  } = useItemAttributesStore();
  const [drawer, setDrawer] = useState<ItemAttributesListPageState["drawer"]>(null);
  const [pendingStatusRecord, setPendingStatusRecord] = useState<ItemAttributeRecord | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { columnOrder, columnVisibility, sorting, setColumnOrder, setColumnVisibility, setSorting } = useTablePreferences({
    defaultColumnOrder: ItemAttributesDefaultColumnOrder,
    defaultColumnVisibility: ItemAttributesDefaultColumnVisibility,
    defaultSorting: ItemAttributesDefaultSorting,
    moduleKey: ItemAttributesTablePreferencesModuleKey,
    storageKey: ItemAttributesTablePreferencesStorageKey,
  });
  const filteredRecords = useMemo(() => {
    const normalizedQuery = normalizeLowercaseText(query);

    return attributes.filter(
      (record) =>
        (statusFilter === "All" || record.status === statusFilter) &&
        (!normalizedQuery ||
          [record.code, record.name, record.usage, record.values.map((value) => value.label).join(" "), record.status]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)),
    );
  }, [attributes, query, statusFilter]);
  const tableColumns = useMemo<ColumnDef<ItemAttributeRecord>[]>(
    () =>
      ItemAttributesTableColumns.map((column) => {
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
      columnOrder: ItemAttributesDefaultColumnOrder,
      columnVisibility: ItemAttributesDefaultColumnVisibility,
      sorting: ItemAttributesDefaultSorting,
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

  async function saveRecord(values: ItemAttributeFormValues) {
    if (drawer?.mode === "edit" && drawer.record) {
      await updateAttribute(createItemAttributeRecord(values, drawer.record));
    } else {
      await addAttribute(values);
    }

    setDrawer(null);
  }

  function toggleStatus(record: ItemAttributeRecord) {
    return updateAttribute({
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
    activeCount: statistics.activeAttributes,
    drawer,
    filteredRecords,
    inactiveCount: statistics.inactiveAttributes,
    isLoading,
    isLoadError,
    isMutating,
    isRefreshing,
    lastSyncedAt,
    loadErrorMessage,
    pendingStatusRecord,
    permissions,
    query,
    records: attributes,
    statistics,
    statusFilter,
    table,
    tableColumns,
    closeDrawer: () => setDrawer(null),
    openAddDrawer: () => setDrawer({ mode: "add" }),
    openEditDrawer: (record) => setDrawer({ mode: "edit", record }),
    openViewDrawer: (record) => setDrawer({ mode: "view", record }),
    confirmStatusChange,
    refreshRecords: refreshAttributes,
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
