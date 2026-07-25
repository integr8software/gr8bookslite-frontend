"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { AccountsPayableVoucherStatusFilters } from "@/app/src/constants/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherConstants";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { useAccountsPayableVoucherStore } from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucher";
import type { AccountsPayableVoucherRecord } from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

export function useAccountsPayableVoucherListPage() {
  const { isLoading, isMutating, lastSyncedAt, records, updateRecord } =
    useAccountsPayableVoucherStore();
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
  const [sorting, setSorting] = useState<SortingState>([
    { id: "documentDate", desc: true },
  ]);
  const [statusFilter, setStatusFilterState] = useState<
    (typeof AccountsPayableVoucherStatusFilters)[number]
  >("all");
  const deferredQuery = useDeferredValue(query);

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
    () => [
      createColumn("transactionNo", "Voucher No.", "w-[12rem]"),
      createColumn("documentDate", "Document Date", "w-[11rem]"),
      createColumn("partyName", "Party Name", "w-[18rem]"),
      createColumn("payableType", "Payable Type", "w-[12rem]"),
      {
        accessorKey: "amount",
        header: "Amount",
        sortingFn: "basic",
        meta: { className: "w-[11rem] text-right" },
      },
      createColumn("currency", "Currency", "w-[8rem]"),
      createColumn("status", "Status", "w-[10rem]"),
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        meta: { className: "w-[9rem] text-center" },
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  const table = useReactTable({
    data: filteredRecords,
    columns,
    state: {
      pagination,
      sorting,
    },
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
    updateRecord({
      ...record,
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  return {
    amountRange,
    dateRange,
    handleQueryChange,
    handleUpdateStatus,
    isLoading,
    isMutating,
    lastSyncedAt,
    query,
    records,
    resetFilters,
    setAmountRange,
    setDateRange,
    setStatusFilter,
    statusFilter,
    table,
  };
}

function createColumn(
  key: keyof AccountsPayableVoucherRecord,
  header: string,
  className: string,
): ColumnDef<AccountsPayableVoucherRecord> {
  return {
    accessorKey: key,
    header,
    sortingFn: key === "documentDate" ? "datetime" : "alphanumeric",
    meta: { className },
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
