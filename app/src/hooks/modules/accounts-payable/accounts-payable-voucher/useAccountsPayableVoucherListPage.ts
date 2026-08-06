"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  type ColumnOrderState,
  type ColumnDef,
  type PaginationState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  AccountsPayableVoucherDefaultColumnOrder,
  AccountsPayableVoucherDefaultColumnVisibility,
  AccountsPayableVoucherDefaultSorting,
  AccountsPayableVoucherStatusFilters,
  AccountsPayableVoucherTableColumns,
  AccountsPayableVoucherTablePreferencesModuleKey,
  AccountsPayableVoucherTablePreferencesStorageKey,
} from "@/app/src/constants/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherConstants";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { useAccountsPayableVoucherStore } from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucher";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type { AccountsPayableVoucherRecord } from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

export function useAccountsPayableVoucherListPage() {
  const {
    isLoading,
    isMutating,
    isRefreshing,
    lastSyncedAt,
    records,
    refreshRecords,
    statistics,
    updateStatus,
  } = useAccountsPayableVoucherStore();
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
  const [statusFilter, setStatusFilterState] = useState<
    (typeof AccountsPayableVoucherStatusFilters)[number]
  >("all");
  const {
    columnOrder,
    columnVisibility,
    sorting,
    setColumnOrder,
    setColumnVisibility,
    setSorting,
  } = useTablePreferences({
    defaultColumnOrder: AccountsPayableVoucherDefaultColumnOrder,
    defaultColumnVisibility: AccountsPayableVoucherDefaultColumnVisibility,
    defaultSorting: AccountsPayableVoucherDefaultSorting,
    moduleKey: AccountsPayableVoucherTablePreferencesModuleKey,
    storageKey: AccountsPayableVoucherTablePreferencesStorageKey,
  });
  const listColumnOrder = useMemo(
    () => normalizeAccountsPayableVoucherListColumnOrder(columnOrder),
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
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return records.filter((record) => {
      const searchable = [
        record.transactionNo,
        record.partyCode,
        record.partyName,
        record.payableType,
        record.remarks,
      ]
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(normalizedQuery) &&
        (statusFilter === "all" || record.status === statusFilter) &&
        isDateInRange(record.documentDate, dateRange) &&
        isAmountInRange(record.amount, amountRange)
      );
    });
  }, [amountRange, dateRange, deferredQuery, records, statusFilter]);

  const columns = useMemo<ColumnDef<AccountsPayableVoucherRecord>[]>(
    () =>
      AccountsPayableVoucherTableColumns.map((column) => {
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
      columnOrder: AccountsPayableVoucherDefaultColumnOrder,
      columnVisibility: AccountsPayableVoucherDefaultColumnVisibility,
      sorting: AccountsPayableVoucherDefaultSorting,
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

  function setStatusFilter(
    value: (typeof AccountsPayableVoucherStatusFilters)[number],
  ) {
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

  function handleUpdateStatus(
    record: AccountsPayableVoucherRecord,
    status: AccountsPayableVoucherRecord["status"],
  ) {
    void updateStatus(record.id, status);
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

function normalizeAccountsPayableVoucherListColumnOrder(
  columnOrder: ColumnOrderState,
) {
  if (!columnOrder.includes("partyName") || !columnOrder.includes("remarks")) {
    return columnOrder;
  }

  const columnOrderWithoutRemarks = columnOrder.filter(
    (columnId) => columnId !== "remarks",
  );
  const partyNameIndex = columnOrderWithoutRemarks.indexOf("partyName");
  const nextColumnOrder = [...columnOrderWithoutRemarks];

  nextColumnOrder.splice(partyNameIndex + 1, 0, "remarks");

  return areColumnOrdersEqual(columnOrder, nextColumnOrder)
    ? columnOrder
    : nextColumnOrder;
}

function areColumnOrdersEqual(
  leftColumnOrder: ColumnOrderState,
  rightColumnOrder: ColumnOrderState,
) {
  return (
    leftColumnOrder.length === rightColumnOrder.length &&
    leftColumnOrder.every(
      (columnId, index) => columnId === rightColumnOrder[index],
    )
  );
}

function createColumn(
  key: keyof AccountsPayableVoucherRecord,
  header: string,
  className: string,
): ColumnDef<AccountsPayableVoucherRecord> {
  return {
    accessorKey: key,
    header,
    sortingFn:
      key === "documentDate"
        ? "datetime"
        : key === "amount"
          ? "basic"
          : "alphanumeric",
    meta: { className, label: header },
  };
}

function isAmountInRange(value: number, range: AmountRangeValue) {
  const fromAmount = range.from.trim() ? parseMoneyNumberInput(range.from) : 0;
  const toAmount = range.to.trim()
    ? parseMoneyNumberInput(range.to)
    : Number.MAX_SAFE_INTEGER;

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
