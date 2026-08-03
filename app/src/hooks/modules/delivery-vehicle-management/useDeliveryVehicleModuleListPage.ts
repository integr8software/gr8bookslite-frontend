"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import type {
  DeliveryVehicleEditorState,
  DeliveryVehicleModuleConfig,
  DeliveryVehicleModuleRecord,
} from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export function useDeliveryVehicleModuleListPage({
  config,
  createRecord,
  initialRecords,
  validateRecord,
}: {
  config: DeliveryVehicleModuleConfig;
  createRecord: (
    values: Record<string, string>,
    status: string,
    category?: string,
  ) => DeliveryVehicleModuleRecord;
  initialRecords: DeliveryVehicleModuleRecord[];
  validateRecord: (values: Record<string, string>) => Record<string, string>;
}) {
  const [records, setRecords] = useState(() => initialRecords.map((item) => ({ ...item, fields: { ...item.fields } })));
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [editor, setEditor] = useState<DeliveryVehicleEditorState>(null);
  const [pendingAdvance, setPendingAdvance] = useState<DeliveryVehicleModuleRecord | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return records.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        [item.code, item.name, item.status, item.category, ...Object.values(item.fields)]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedQuery));
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [categoryFilter, query, records, statusFilter]);

  const columns = useMemo<ColumnDef<DeliveryVehicleModuleRecord>[]>(() => {
    const base: ColumnDef<DeliveryVehicleModuleRecord>[] = [
      {
        accessorKey: "code",
        header: "Reference",
        meta: { headerClassName: "min-w-36", cellClassName: "font-semibold" },
      },
      {
        accessorKey: "name",
        header: config.noun.replace(/\b\w/g, (letter) => letter.toUpperCase()),
        meta: { headerClassName: "min-w-52" },
      },
    ];
    if (config.categories) {
      base.push({
        accessorKey: "category",
        header: "Workspace",
        meta: { headerClassName: "min-w-28" },
      });
    }
    base.push(
      ...config.tableFieldKeys.map((fieldKey) => ({
        id: fieldKey,
        accessorFn: (item: DeliveryVehicleModuleRecord) => item.fields[fieldKey] ?? "",
        header: config.fields.find((field) => field.key === fieldKey)?.label ?? fieldKey,
        meta: { headerClassName: "min-w-40" },
      })),
      {
        accessorKey: "status",
        header: "Status",
        meta: { headerClassName: "min-w-36" },
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        enableSorting: false,
        meta: { headerClassName: "w-52 min-w-52 text-right", cellClassName: "text-right" },
      },
    );
    return base;
  }, [config]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  const table = useReactTable({
    data: filteredRecords,
    columns,
    state: { sorting, columnVisibility },
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const statistics = useMemo(() => {
    const visible = filteredRecords;
    const attention = visible.filter((item) => item.alert).length;
    const insight = visible.filter((item) => config.insightStatuses.includes(item.status)).length;
    const averageProgress = Math.round(
      visible.reduce((sum, item) => sum + (item.progress ?? 0), 0) /
        Math.max(1, visible.filter((item) => item.progress !== undefined).length),
    );
    return { total: visible.length, attention, insight, averageProgress };
  }, [config.insightStatuses, filteredRecords]);

  function saveRecord(
    values: Record<string, string>,
    status: string,
    category: string | undefined,
    existing?: DeliveryVehicleModuleRecord,
  ) {
    if (existing) {
      setRecords((current) =>
        current.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                name: Object.values(values).find(Boolean) ?? item.name,
                fields: values,
                status,
                category,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
    } else {
      setRecords((current) => [createRecord(values, status, category), ...current]);
    }
    setEditor(null);
    setLastSyncedAt(new Date());
  }

  function advanceRecord(record: DeliveryVehicleModuleRecord) {
    const currentIndex = config.statuses.indexOf(record.status);
    const terminalStatuses = ["Cancelled", "Closed", "Completed", "Released", "Retired", "Inactive", "Trip Completed"];
    if (terminalStatuses.includes(record.status) || currentIndex < 0 || currentIndex === config.statuses.length - 1) {
      setPendingAdvance(null);
      return;
    }
    const nextStatus = config.statuses[currentIndex + 1];
    setRecords((current) =>
      current.map((item) =>
        item.id === record.id && nextStatus
          ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() }
          : item,
      ),
    );
    setPendingAdvance(null);
    setLastSyncedAt(new Date());
  }

  function resetFilters() {
    setQuery("");
    setStatusFilter("All");
    setCategoryFilter("All");
    table.setPageIndex(0);
  }

  function refreshRecords() {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setIsRefreshing(false);
      setLastSyncedAt(new Date());
    }, 500);
  }

  return {
    categoryFilter,
    config,
    editor,
    filteredRecords,
    isRefreshing,
    lastSyncedAt,
    pendingAdvance,
    query,
    records,
    statistics,
    statusFilter,
    table,
    validateRecord,
    advanceRecord,
    refreshRecords,
    resetFilters,
    saveRecord,
    setCategoryFilter,
    setEditor,
    setPendingAdvance,
    setQuery,
    setStatusFilter,
  };
}
