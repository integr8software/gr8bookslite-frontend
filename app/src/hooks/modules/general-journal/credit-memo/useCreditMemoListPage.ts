"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  type ColumnOrderState,
  type PaginationState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CreditMemoDefaultColumnOrder,
  CreditMemoDefaultColumnVisibility,
  CreditMemoDefaultSorting,
  CreditMemoStatusFilters,
  CreditMemoTableColumns,
  CreditMemoTablePreferencesModuleKey,
  CreditMemoTablePreferencesStorageKey,
} from "@/app/src/constants/modules/general-journal/credit-memo/CreditMemoConstants";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { useCreditMemoStore } from "@/app/src/hooks/modules/general-journal/credit-memo/useCreditMemo";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type { CreditMemoRecord } from "@/app/src/types/modules/general-journal/credit-memo/CreditMemoTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

type CreditMemoStatusFilter = (typeof CreditMemoStatusFilters)[number];

export function useCreditMemoListPage() {
  const store = useCreditMemoStore();
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
  const [statusFilter, setStatusFilterState] = useState<CreditMemoStatusFilter>("all");
  const {
    columnOrder,
    columnVisibility,
    sorting,
    setColumnOrder,
    setColumnVisibility,
    setSorting,
  } = useTablePreferences({
    defaultColumnOrder: CreditMemoDefaultColumnOrder,
    defaultColumnVisibility: CreditMemoDefaultColumnVisibility,
    defaultSorting: CreditMemoDefaultSorting,
    moduleKey: CreditMemoTablePreferencesModuleKey,
    storageKey: CreditMemoTablePreferencesStorageKey,
  });
  const listColumnOrder = useMemo(
    () => normalizeCreditMemoListColumnOrder(columnOrder),
    [columnOrder],
  );
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (listColumnOrder === columnOrder) {
      return;
    }

    setColumnOrder(listColumnOrder);
  }, [columnOrder, listColumnOrder, setColumnOrder]);

  const filteredRecords = useMemo(() => {
    const cleanQuery = deferredQuery.trim().toLowerCase();

    return store.records.filter((record) => {
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      const matchesQuery =
        cleanQuery === "" ||
        [
          record.transactionNo,
          record.partyCode,
          record.partyName,
          record.referenceNo,
          record.remarks,
        ]
          .join(" ")
          .toLowerCase()
          .includes(cleanQuery);

      return (
        matchesStatus &&
        matchesQuery &&
        isDateInRange(record.documentDate, dateRange) &&
        isAmountInRange(record.amount, amountRange)
      );
    });
  }, [amountRange, dateRange, deferredQuery, statusFilter, store.records]);

  const columns = useMemo<ColumnDef<CreditMemoRecord>[]>(
    () =>
      CreditMemoTableColumns.map((column) => {
        if (!("key" in column)) {
          return {
            id: "actions",
            header: column.label,
            enableSorting: false,
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
      columnOrder: CreditMemoDefaultColumnOrder,
      columnVisibility: CreditMemoDefaultColumnVisibility,
      sorting: CreditMemoDefaultSorting,
    },
    state: {
      columnOrder: listColumnOrder,
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

  function setStatusFilter(value: CreditMemoStatusFilter) {
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

  function refreshRecords() {
    table.setPageIndex(0);
  }

  function handleUpdateStatus(record: CreditMemoRecord, status: CreditMemoRecord["status"]) {
    void store.updateStatus(record.id, status);
  }

  return {
    amountRange,
    dateRange,
    handleQueryChange,
    handleUpdateStatus,
    isLoading: false,
    isRefreshing: false,
    lastSyncedAt: null,
    query,
    records: filteredRecords,
    refreshRecords,
    setAmountRange,
    setDateRange,
    setStatusFilter,
    statistics: store.statistics,
    statusFilter,
    table,
    updateStatus: store.updateStatus,
  };
}

function normalizeCreditMemoListColumnOrder(columnOrder: ColumnOrderState) {
  if (!columnOrder.includes("partyName") || !columnOrder.includes("remarks")) {
    return columnOrder;
  }

  const columnOrderWithoutRemarks = columnOrder.filter((columnId) => columnId !== "remarks");
  const partyNameIndex = columnOrderWithoutRemarks.indexOf("partyName");
  const nextColumnOrder = [...columnOrderWithoutRemarks];

  nextColumnOrder.splice(partyNameIndex + 1, 0, "remarks");

  return areColumnOrdersEqual(columnOrder, nextColumnOrder) ? columnOrder : nextColumnOrder;
}

function areColumnOrdersEqual(leftColumnOrder: ColumnOrderState, rightColumnOrder: ColumnOrderState) {
  return (
    leftColumnOrder.length === rightColumnOrder.length &&
    leftColumnOrder.every((columnId, index) => columnId === rightColumnOrder[index])
  );
}

function createColumn(
  key: keyof CreditMemoRecord,
  header: string,
  className: string,
): ColumnDef<CreditMemoRecord> {
  return {
    accessorKey: key,
    header,
    sortingFn: key === "documentDate" ? "datetime" : key === "amount" ? "basic" : "alphanumeric",
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
