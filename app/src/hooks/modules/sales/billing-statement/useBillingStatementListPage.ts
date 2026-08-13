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
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import {
  BillingStatementStatusFilters,
} from "@/app/src/constants/modules/sales/billing-statement/BillingStatementConstants";
import { useBillingStatementStore } from "@/app/src/hooks/modules/sales/billing-statement/useBillingStatement";
import type { BillingStatementRecord } from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

export function useBillingStatementListPage() {
  const { deleteStatement, isMutating, lastSyncedAt, statements, updateStatementStatus } =
    useBillingStatementStore();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [query, setQueryState] = useState("");
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
    (typeof BillingStatementStatusFilters)[number]
  >("all");
  const [pendingDeleteStatement, setPendingDeleteStatement] =
    useState<BillingStatementRecord | null>(null);
  const deferredQuery = useDeferredValue(query);

  const filteredStatements = useMemo(() => {
    return statements.filter((statement) =>
      [
        statement.transNo,
        statement.code,
        statement.name,
        statement.invoiceNo,
        statement.refNo,
        statement.status,
        statement.projectName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(deferredQuery.trim().toLowerCase()) &&
      (statusFilter === "all" || statement.status === statusFilter) &&
      isDateInRange(statement.documentDate, dateRange) &&
      isAmountInRange(statement.grossAmount, amountRange),
    );
  }, [amountRange, dateRange, deferredQuery, statements, statusFilter]);

  const columns = useMemo<ColumnDef<BillingStatementRecord>[]>(
    () => [
      createColumn("transNo", "Trans No.", "w-[12rem]"),
      createColumn("documentDate", "Document Date", "w-[10rem]"),
      createColumn("name", "Customer Name", "w-[18rem]"),
      createColumn("invoiceNo", "Invoice No.", "w-[12rem]"),
      createColumn("refNo", "Reference No.", "w-[12rem]"),
      {
        accessorKey: "grossAmount",
        header: "Gross Amount",
        sortingFn: "basic",
        meta: { className: "w-[11rem]" },
      },
      {
        accessorKey: "status",
        header: "Status",
        sortingFn: "alphanumeric",
        meta: { className: "w-[10rem]" },
      },
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
    data: filteredStatements,
    columns,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function setQuery(value: string) {
    setQueryState(value);
    table.setPageIndex(0);
  }

  function setStatusFilter(value: (typeof BillingStatementStatusFilters)[number]) {
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
    setQueryState("");
    setDateRangeState({ from: "", to: "" });
    setAmountRangeState({ from: "", to: "" });
    setStatusFilterState("all");
    table.setPageIndex(0);
  }

  function handleConfirmDelete() {
    if (!pendingDeleteStatement) return;
    deleteStatement(pendingDeleteStatement.id);
    setPendingDeleteStatement(null);
  }

  return {
    amountRange,
    dateRange,
    handleConfirmDelete,
    isMutating,
    lastSyncedAt,
    pendingDeleteStatement,
    query,
    resetFilters,
    setAmountRange,
    setDateRange,
    setPendingDeleteStatement,
    setQuery,
    setStatusFilter,
    statements,
    statusFilter,
    table,
    updateStatementStatus,
  };
}

function createColumn(
  key: keyof BillingStatementRecord,
  header: string,
  className: string,
): ColumnDef<BillingStatementRecord> {
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

  const dateTime = new Date(value).setHours(0, 0, 0, 0);
  const fromTime = range.from ? new Date(range.from).setHours(0, 0, 0, 0) : null;
  const toTime = range.to ? new Date(range.to).setHours(0, 0, 0, 0) : null;

  return !(
    (fromTime !== null && dateTime < fromTime) ||
    (toTime !== null && dateTime > toTime)
  );
}
