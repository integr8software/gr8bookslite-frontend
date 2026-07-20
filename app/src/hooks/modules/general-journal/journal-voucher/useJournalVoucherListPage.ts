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
import { JournalVoucherStatusFilters } from "@/app/src/constants/modules/general-journal/journal-voucher/JournalVoucherConstants";
import { getJournalVoucherTotals } from "@/app/src/data/modules/general-journal/journal-voucher/JournalVoucherData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { useJournalVoucherStore } from "@/app/src/hooks/modules/general-journal/journal-voucher/useJournalVoucher";
import type { JournalVoucherRecord } from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

export function useJournalVoucherListPage() {
  const { deleteRecord, isLoading, isMutating, lastSyncedAt, records } =
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
  const [sorting, setSorting] = useState<SortingState>([
    { id: "documentDate", desc: true },
  ]);
  const [statusFilter, setStatusFilterState] = useState<
    (typeof JournalVoucherStatusFilters)[number]
  >("all");
  const [pendingDeleteRecord, setPendingDeleteRecord] =
    useState<JournalVoucherRecord | null>(null);
  const deferredQuery = useDeferredValue(query);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return records.filter((record) =>
      [record.transactionNo, record.remarks]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery) &&
      (statusFilter === "all" || record.status === statusFilter) &&
      isDateInRange(record.documentDate, dateRange) &&
      isAmountInRange(getJournalVoucherTotals(record.lines).totalDebit, amountRange),
    );
  }, [amountRange, dateRange, deferredQuery, records, statusFilter]);

  const columns = useMemo<ColumnDef<JournalVoucherRecord>[]>(
    () => [
      createColumn("transactionNo", "Voucher No.", "w-[12rem]"),
      createColumn("documentDate", "Document Date", "w-[11rem]"),
      createColumn("remarks", "Remarks", "w-[22rem]"),
      createColumn("currencyType", "Currency", "w-[8rem]"),
      {
        id: "totalDebit",
        header: "Debit",
        accessorFn: (record) => getJournalVoucherTotals(record.lines).totalDebit,
        sortingFn: "basic",
        meta: { className: "w-[11rem] text-right" },
      },
      {
        id: "totalCredit",
        header: "Credit",
        accessorFn: (record) => getJournalVoucherTotals(record.lines).totalCredit,
        sortingFn: "basic",
        meta: { className: "w-[11rem] text-right" },
      },
      createColumn("status", "Status", "w-[9rem]"),
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        meta: { className: "w-[9rem]" },
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

  function handleConfirmDelete() {
    if (!pendingDeleteRecord) {
      return;
    }

    deleteRecord(pendingDeleteRecord.id);
    setPendingDeleteRecord(null);
  }

  return {
    amountRange,
    dateRange,
    handleConfirmDelete,
    handleQueryChange,
    isLoading,
    isMutating,
    lastSyncedAt,
    pendingDeleteRecord,
    query,
    records,
    resetFilters,
    setAmountRange,
    setDateRange,
    setPendingDeleteRecord,
    setStatusFilter,
    statusFilter,
    table,
  };
}

function createColumn(
  key: keyof JournalVoucherRecord,
  header: string,
  className: string,
): ColumnDef<JournalVoucherRecord> {
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
