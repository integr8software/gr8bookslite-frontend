"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnOrderState } from "@tanstack/react-table";
import {
  BankReconciliationDefaultColumnOrder,
  BankReconciliationDefaultColumnVisibility,
  BankReconciliationDefaultSorting,
  BankReconciliationTableColumns,
} from "@/app/src/constants/modules/cash-receipt/bank-reconciliation/BankReconciliationConstants";
import { computeBankReconciliationStatistics } from "@/app/src/data/modules/cash-receipt/bank-reconciliation/BankReconciliationData";
import {
  useBankReconciliationListQuery,
  useUpdateBankReconciliationStatusMutation,
} from "@/app/src/hooks/modules/cash-receipt/bank-reconciliation/useBankReconciliation";
import type {
  BankReconciliationRecord,
  BankReconciliationStatus,
  BankReconciliationStatusFilter,
} from "@/app/src/types/modules/cash-receipt/bank-reconciliation/BankReconciliationTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

export function useBankReconciliationListPage() {
  const {
    data: records = [],
    isLoading,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useBankReconciliationListQuery();
  const updateStatusMutation = useUpdateBankReconciliationStatusMutation();

  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const [amountRange, setAmountRange] = useState<AmountRangeValue>({
    from: "",
    to: "",
  });
  const [statusFilter, setStatusFilter] =
    useState<BankReconciliationStatusFilter>("all");

  const [sorting, setSorting] = useState(BankReconciliationDefaultSorting);
  const [columnVisibility, setColumnVisibility] = useState(
    BankReconciliationDefaultColumnVisibility,
  );
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    BankReconciliationDefaultColumnOrder,
  );

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      // Query filter
      if (query.trim()) {
        const normalizedQuery = query.toLowerCase().trim();
        const matchesQuery =
          record.brNo.toLowerCase().includes(normalizedQuery) ||
          record.bankName.toLowerCase().includes(normalizedQuery) ||
          record.accountCode.toLowerCase().includes(normalizedQuery) ||
          record.accountTitle.toLowerCase().includes(normalizedQuery);

        if (!matchesQuery) return false;
      }

      // Status filter
      if (statusFilter !== "all" && record.status !== statusFilter) {
        return false;
      }

      // Date range
      if (dateRange.from && record.endingDate < dateRange.from) return false;
      if (dateRange.to && record.endingDate > dateRange.to) return false;

      // Amount range
      const fromAmount = amountRange.from ? Number(amountRange.from) : null;
      const toAmount = amountRange.to ? Number(amountRange.to) : null;
      if (fromAmount !== null && record.bankBalance < fromAmount) return false;
      if (toAmount !== null && record.bankBalance > toAmount) return false;

      return true;
    });
  }, [records, query, statusFilter, dateRange, amountRange]);

  const statistics = useMemo(
    () => computeBankReconciliationStatistics(records),
    [records],
  );

  const columns = useMemo(
    () =>
      BankReconciliationTableColumns.map((col) => ({
        accessorKey: "key" in col ? col.key : "actions",
        id: "key" in col ? col.key : "actions",
        header: col.label,
        meta: {
          className: col.className,
        },
      })),
    [],
  );

  const table = useReactTable({
    data: filteredRecords,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnOrder,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  function handleUpdateStatus(
    record: BankReconciliationRecord,
    status: BankReconciliationStatus,
  ) {
    updateStatusMutation.mutate({ id: record.id, status });
  }

  return {
    amountRange,
    dateRange,
    handleQueryChange: setQuery,
    handleUpdateStatus,
    isLoading,
    isRefreshing: isFetching,
    lastSyncedAt: dataUpdatedAt,
    query,
    refreshRecords: () => void refetch(),
    setAmountRange,
    setDateRange,
    setStatusFilter,
    statusFilter,
    statistics,
    table,
  };
}
