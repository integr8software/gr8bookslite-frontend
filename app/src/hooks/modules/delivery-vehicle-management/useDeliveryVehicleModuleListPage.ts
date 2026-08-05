"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
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
  const [records, setRecords] = useState(() =>
    initialRecords.map((item) => ({ ...item, fields: { ...item.fields } })),
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(() =>
    config.statuses.includes("Active") ? "Active" : "",
  );
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [editor, setEditor] = useState<DeliveryVehicleEditorState>(null);
  const [pendingAdvance, setPendingAdvance] = useState<DeliveryVehicleModuleRecord | null>(null);
  const [pendingStatusRecord, setPendingStatusRecord] =
    useState<DeliveryVehicleModuleRecord | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const defaultColumnOrder = useMemo(() => createDefaultColumnOrder(config), [config]);
  const tablePreferencesKey = useMemo(
    () =>
      config.key === "vehicle-repair-maintenance"
        ? `${config.key}:work-order-default-v2`
        : config.key,
    [config.key],
  );
  const defaultColumnVisibility = useMemo(
    () =>
      config.key === "vehicle-repair-maintenance"
        ? {
            priority: false,
            serviceProvider: false,
            description: false,
            schedule: false,
            createdBy: false,
            updatedBy: false,
            updatedAt: false,
          }
        : {
            ...Object.fromEntries(
              config.tableFieldKeys.slice(4).map((fieldKey) => [fieldKey, false]),
            ),
            createdBy: false,
            createdAt: false,
            updatedBy: false,
            updatedAt: false,
          },
    [config.key, config.tableFieldKeys],
  );
  const defaultSorting = useMemo<SortingState>(
    () => [
      {
        id:
          config.key === "vehicle-repair-maintenance"
            ? "workOrderNo"
            : config.hideReferenceColumn
              ? "name"
              : "code",
        desc: false,
      },
    ],
    [config.hideReferenceColumn, config.key],
  );
  const {
    columnOrder,
    columnVisibility,
    sorting,
    setColumnOrder,
    setColumnVisibility,
    setSorting,
  } = useTablePreferences({
    defaultColumnOrder,
    defaultColumnVisibility,
    defaultSorting,
    moduleKey: `delivery-vehicle-management:${tablePreferencesKey}`,
    storageKey: `gr8booksneo:delivery-vehicle-management:${tablePreferencesKey}:table-preferences`,
  });

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return records.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        [item.code, item.name, item.status, ...Object.values(item.fields)]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedQuery));
      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesVehicleType =
        config.key !== "delivery-vehicles" ||
        !vehicleTypeFilter ||
        item.fields.vehicleType === vehicleTypeFilter;
      const matchesWorkType =
        config.key !== "vehicle-repair-maintenance" ||
        !workTypeFilter ||
        item.fields.maintenanceType === workTypeFilter;
      return matchesQuery && matchesStatus && matchesVehicleType && matchesWorkType;
    });
  }, [config.key, query, records, statusFilter, vehicleTypeFilter, workTypeFilter]);

  const vehicleTypeFilterOptions = useMemo(() => {
    if (config.key !== "delivery-vehicles") {
      return [];
    }

    const configuredOptions =
      config.fields.find((field) => field.key === "vehicleType")?.options ?? [];
    const recordOptions = records
      .map((record) => record.fields.vehicleType)
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set([...configuredOptions, ...recordOptions])).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [config.fields, config.key, records]);

  const workTypeFilterOptions = useMemo(() => {
    if (config.key !== "vehicle-repair-maintenance") {
      return [];
    }

    const configuredOptions =
      config.fields.find((field) => field.key === "maintenanceType")?.options ?? [];
    const recordOptions = records
      .map((record) => record.fields.maintenanceType)
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set([...configuredOptions, ...recordOptions])).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [config.fields, config.key, records]);

  const columns = useMemo<ColumnDef<DeliveryVehicleModuleRecord>[]>(() => {
    const base: ColumnDef<DeliveryVehicleModuleRecord>[] = [];

    if (config.key !== "vehicle-repair-maintenance" && !config.hideReferenceColumn) {
      base.push({
        accessorKey: "code",
        header: "Reference",
        meta: { className: "min-w-36 font-semibold" },
      });
    }

    if (config.key !== "vehicle-repair-maintenance") {
      base.push({
        accessorKey: "name",
        header: config.noun.replace(/\b\w/g, (letter) => letter.toUpperCase()),
        meta: { className: "min-w-52" },
      });
    }

    base.push(
      ...config.tableFieldKeys.map((fieldKey) => ({
        id: fieldKey,
        accessorFn: (item: DeliveryVehicleModuleRecord) => item.fields[fieldKey] ?? "",
        header: config.fields.find((field) => field.key === fieldKey)?.label ?? fieldKey,
        meta: { className: "min-w-40" },
      })),
      {
        accessorKey: "status",
        header: "Status",
        meta: { className: "min-w-32 text-center" },
      },
      {
        accessorKey: "createdBy",
        header: "Created By",
        meta: { className: "min-w-40" },
      },
      ...(config.key === "vehicle-repair-maintenance"
        ? []
        : [
            {
              accessorKey: "createdAt",
              header: "Date Created",
              meta: { className: "min-w-44" },
            } satisfies ColumnDef<DeliveryVehicleModuleRecord>,
          ]),
      {
        accessorKey: "updatedBy",
        header: "Updated By",
        meta: { className: "min-w-40" },
      },
      {
        accessorKey: "updatedAt",
        header: "Date Modified",
        meta: { className: "min-w-44" },
      },
      {
        id: "actions",
        header: "Action",
        enableHiding: false,
        enableSorting: false,
        meta: { className: "w-44 min-w-44 text-center" },
      },
    );
    return base;
  }, [config]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  const table = useReactTable({
    data: filteredRecords,
    columns,
    state: { columnOrder, columnVisibility, pagination, sorting },
    initialState: {
      columnOrder: defaultColumnOrder,
      columnVisibility: defaultColumnVisibility,
      sorting: defaultSorting,
    },
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const statistics = useMemo(() => {
    const visible = filteredRecords;
    const attention = visible.filter((item) => item.alert).length;
    const insight = visible.filter((item) => config.insightStatuses.includes(item.status)).length;
    const active = visible.filter((item) => item.status === "Active").length;
    const hazardous = visible.filter((item) => item.fields.handling === "Hazardous Eligible").length;
    const inactive = visible.filter((item) => item.status === "Inactive").length;
    const dispatchQueue = visible.filter((item) =>
      ["Pending", "Schedule", "For Dispatch"].includes(item.fields.deliveryStatus),
    ).length;
    const inTransit = visible.filter((item) => item.fields.deliveryStatus === "In Transit").length;
    const scheduledWorkOrders = visible.filter((item) => item.status === "Scheduled").length;
    const activeWorkOrders = visible.filter((item) =>
      ["In Progress", "Waiting for Parts"].includes(item.status),
    ).length;
    const completedWorkOrders = visible.filter((item) =>
      ["Completed", "Released"].includes(item.status),
    ).length;
    const averageProgress = Math.round(
      visible.reduce((sum, item) => sum + (item.progress ?? 0), 0) /
        Math.max(1, visible.filter((item) => item.progress !== undefined).length),
    );
    return {
      total: visible.length,
      attention,
      insight,
      active,
      hazardous,
      inactive,
      dispatchQueue,
      inTransit,
      averageProgress,
      scheduledWorkOrders,
      activeWorkOrders,
      completedWorkOrders,
    };
  }, [config.insightStatuses, filteredRecords]);

  function saveRecord(
    values: Record<string, string>,
    status: string,
    category: string | undefined,
    existing?: DeliveryVehicleModuleRecord,
  ) {
    const normalizedValues = normalizeRecordValues(values, config, existing);

    if (existing) {
      setRecords((current) =>
        current.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                ...getRecordMetadata(normalizedValues, config),
                name: getRecordName(normalizedValues, item.name),
                fields: normalizedValues,
                status,
                category,
                updatedBy: "Fleet Operations",
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
    } else {
      setRecords((current) => [createRecord(normalizedValues, status, category), ...current]);
    }
    setEditor(null);
    setLastSyncedAt(new Date());
  }

  function importRecords(rows: Array<Record<string, string>>) {
    if (rows.length === 0) {
      return;
    }

    const nextRecords = rows.map((values) =>
      createRecord(
        normalizeRecordValues(normalizeImportedValues(values, config), config),
        config.statuses[0] ?? "Active",
        undefined,
      ),
    );

    setRecords((current) => [...nextRecords, ...current]);
    setLastSyncedAt(new Date());
  }

  function advanceRecord(record: DeliveryVehicleModuleRecord) {
    const currentIndex = config.statuses.indexOf(record.status);
    const terminalStatuses = [
      "Cancelled",
      "Closed",
      "Completed",
      "Released",
      "Retired",
      "Inactive",
      "Trip Completed",
    ];
    if (
      terminalStatuses.includes(record.status) ||
      currentIndex < 0 ||
      currentIndex === config.statuses.length - 1
    ) {
      setPendingAdvance(null);
      return;
    }
    const nextStatus = config.statuses[currentIndex + 1];
    setRecords((current) =>
      current.map((item) =>
        item.id === record.id && nextStatus
          ? {
              ...item,
              status: nextStatus,
              updatedBy: "Fleet Operations",
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    setPendingAdvance(null);
    setLastSyncedAt(new Date());
  }

  function confirmStatusChange() {
    if (!pendingStatusRecord) {
      return;
    }

    const nextStatus = pendingStatusRecord.status === "Active" ? "Inactive" : "Active";
    setRecords((current) =>
      current.map((item) =>
        item.id === pendingStatusRecord.id
          ? {
              ...item,
              status: nextStatus,
              updatedBy: "Fleet Operations",
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    setPendingStatusRecord(null);
    setLastSyncedAt(new Date());
  }

  function resetFilters() {
    setQuery("");
    setStatusFilter(config.statuses.includes("Active") ? "Active" : "");
    setVehicleTypeFilter("");
    setWorkTypeFilter("");
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
    config,
    editor,
    filteredRecords,
    isRefreshing,
    lastSyncedAt,
    pendingAdvance,
    pendingStatusRecord,
    query,
    records,
    statistics,
    statusFilter,
    table,
    validateRecord,
    vehicleTypeFilter,
    vehicleTypeFilterOptions,
    workTypeFilter,
    workTypeFilterOptions,
    advanceRecord,
    confirmStatusChange,
    importRecords,
    refreshRecords,
    resetFilters,
    saveRecord,
    setEditor,
    setPendingAdvance,
    setPendingStatusRecord,
    setQuery,
    setStatusFilter,
    setVehicleTypeFilter,
    setWorkTypeFilter,
  };
}

function createDefaultColumnOrder(config: DeliveryVehicleModuleConfig) {
  if (config.key === "vehicle-repair-maintenance") {
    return [
      "workOrderNo",
      "workOrderDate",
      "vehicle",
      "maintenanceType",
      "estimatedCost",
      "status",
      "actions",
      "priority",
      "serviceProvider",
      "description",
      "schedule",
      "createdBy",
      "updatedBy",
      "updatedAt",
    ];
  }

  return [
    ...(config.hideReferenceColumn ? [] : ["code"]),
    "name",
    ...config.tableFieldKeys,
    "status",
    "createdBy",
    "createdAt",
    "updatedBy",
    "updatedAt",
    "actions",
  ];
}

function normalizeImportedValues(
  values: Record<string, string>,
  config: DeliveryVehicleModuleConfig,
) {
  return Object.fromEntries(
    config.fields.map((field) => [
      field.key,
      values[field.key] ?? values[field.label] ?? field.defaultValue ?? "",
    ]),
  );
}

function normalizeRecordValues(
  values: Record<string, string>,
  config: DeliveryVehicleModuleConfig,
  existing?: DeliveryVehicleModuleRecord,
) {
  if (config.key !== "vehicle-repair-maintenance") {
    return values;
  }

  return {
    ...values,
    workOrderNo: values.workOrderNo?.trim() || existing?.code || createSuggestedWorkOrderNumber(),
    workOrderDate:
      values.workOrderDate ||
      (existing?.createdAt ? formatDateInput(new Date(existing.createdAt)) : formatDateInput(new Date())),
  };
}

function getRecordMetadata(values: Record<string, string>, config: DeliveryVehicleModuleConfig) {
  if (config.key !== "vehicle-repair-maintenance") {
    return {};
  }

  return {
    code: values.workOrderNo,
    createdAt: createTransactionDateTime(values.workOrderDate),
  };
}

function getRecordName(values: Record<string, string>, fallback: string) {
  return values.description || values.workOrderNo || Object.values(values).find(Boolean) || fallback;
}

function createSuggestedWorkOrderNumber() {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const sequence = String(Date.now()).slice(-4);

  return `WO-${year}${month}-${sequence}`;
}

function createTransactionDateTime(dateValue: string) {
  return `${dateValue}T09:00:00+08:00`;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
