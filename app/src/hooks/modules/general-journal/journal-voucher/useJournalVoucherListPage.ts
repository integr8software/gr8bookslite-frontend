"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import {
  JournalVoucherDefaultColumnOrder,
  JournalVoucherDefaultColumnVisibility,
  JournalVoucherDefaultSorting,
  JournalVoucherStatusFilters,
  JournalVoucherTableColumns,
  JournalVoucherTablePreferencesModuleKey,
  JournalVoucherTablePreferencesStorageKey,
} from "@/app/src/constants/modules/general-journal/journal-voucher/JournalVoucherConstants";
import { getJournalVoucherTotals } from "@/app/src/data/modules/general-journal/journal-voucher/JournalVoucherData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { useJournalVoucherStore } from "@/app/src/hooks/modules/general-journal/journal-voucher/useJournalVoucher";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
  JournalVoucherRecord,
  JournalVoucherStatus,
} from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

export function useJournalVoucherListPage() {
  const { isLoading, isMutating, isRefreshing, lastSyncedAt, permissions, records, refreshRecords, statistics, updateStatus } =
    useJournalVoucherStore();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [query, setQuery] = useState("");
  const [dateRange, setDateRangeState] = useState<DateRangeValue>({
    from: "",
    to: "",
  });
  const [amountRange, setAmountRangeState] = useState<AmountRangeValue>({
    from: "",
    to: "",
  });
  const [statusFilter, setStatusFilterState] = useState<(typeof JournalVoucherStatusFilters)[number]>("all");
  const { columnOrder, columnVisibility, sorting, setColumnOrder, setColumnVisibility, setSorting } = useTablePreferences({
    defaultColumnOrder: JournalVoucherDefaultColumnOrder,
    defaultColumnVisibility: JournalVoucherDefaultColumnVisibility,
    defaultSorting: JournalVoucherDefaultSorting,
    moduleKey: JournalVoucherTablePreferencesModuleKey,
    storageKey: JournalVoucherTablePreferencesStorageKey,
  });
  const deferredQuery = useDeferredValue(query);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return records.filter(
      (record) =>
        [record.transactionNo, record.remarks].join(" ").toLowerCase().includes(normalizedQuery) &&
        (statusFilter === "all" || record.status === statusFilter) &&
        isDateInRange(record.documentDate, dateRange) &&
        isAmountInRange(getJournalVoucherTotals(record.lines, record).totalDebit, amountRange),
    );
  }, [amountRange, dateRange, deferredQuery, records, statusFilter]);

  const columns = useMemo<ColumnDef<JournalVoucherRecord>[]>(
    () =>
      JournalVoucherTableColumns.map((column) => {
        if (!("key" in column)) {
          return {
            id: "actions",
            header: column.label,
            enableSorting: false,
            meta: { className: column.className, label: column.label },
          };
        }

        if (column.key === "totalDebit" || column.key === "totalCredit") {
          return {
            id: column.key,
            header: column.label,
            accessorFn: (record) => getJournalVoucherTotals(record.lines, record)[column.key],
            sortingFn: "basic",
            meta: { className: column.className, label: column.label },
          };
        }

        return createColumn(column.key, column.label, column.className);
      }),
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  const table = useReactTable({
    data: filteredRecords,
    columns,
    initialState: {
      columnOrder: JournalVoucherDefaultColumnOrder,
      columnVisibility: JournalVoucherDefaultColumnVisibility,
      sorting: JournalVoucherDefaultSorting,
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

  function handleQueryChange(value: string) {
    setQuery(value);
    table.setPageIndex(0);
  }

  function setStatusFilter(value: (typeof JournalVoucherStatusFilters)[number]) {
    setStatusFilterState(value);
    table.setPageIndex(0);
  }

  function setDateRange(value: DateRangeValue) {
    setDateRangeState(value);
    table.setPageIndex(0);
  }

  function setAmountRange(value: AmountRangeValue) {
    setAmountRangeState(value);
    table.setPageIndex(0);
  }

  function resetFilters() {
    setQuery("");
    setDateRangeState({ from: "", to: "" });
    setAmountRangeState({ from: "", to: "" });
    setStatusFilterState("all");
    table.setPageIndex(0);
  }

  function handleUpdateStatus(record: JournalVoucherRecord, status: JournalVoucherStatus) {
    updateStatus(record.id, status);
  }

  return {
    amountRange,
    dateRange,
    handleQueryChange,
    handleUpdateStatus,
    isLoading,
    isMutating,
    isRefreshing,
    lastSyncedAt,
    permissions,
    query,
    records,
    refreshRecords,
    resetFilters,
    setAmountRange,
    setDateRange,
    setStatusFilter,
    statusFilter,
    statistics,
    table,
  };
}

function createColumn(key: keyof JournalVoucherRecord, header: string, className: string): ColumnDef<JournalVoucherRecord> {
  return {
    accessorKey: key,
    header,
    sortingFn: key === "documentDate" ? "datetime" : "alphanumeric",
    meta: { className, label: header },
  };
}

function isAmountInRange(value: number, range: AmountRangeValue) {
  const fromAmount = range.from.trim() ? parseMoneyNumberInput(range.from) : 0;
  const toAmount = range.to.trim() ? parseMoneyNumberInput(range.to) : Number.MAX_SAFE_INTEGER;

  return value >= fromAmount && value <= toAmount;
}

function isDateInRange(value: string, range: DateRangeValue) {
  if (!range.from && !range.to) {
    return true;
  }

  if (!value) {
    return false;
  }

  const dateTime = new Date(value).setHours(0, 0, 0, 0);
  const fromTime = range.from ? new Date(range.from).setHours(0, 0, 0, 0) : null;
  const toTime = range.to ? new Date(range.to).setHours(0, 0, 0, 0) : null;

  if (fromTime !== null && dateTime < fromTime) {
    return false;
  }

  if (toTime !== null && dateTime > toTime) {
    return false;
  }

  return true;
}
