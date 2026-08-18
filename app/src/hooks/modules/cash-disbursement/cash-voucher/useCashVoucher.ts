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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  CashVoucherDefaultColumnOrder,
  CashVoucherDefaultColumnVisibility,
  CashVoucherDefaultSorting,
  CashVoucherAllStatusFilter,
  CashVoucherStatusFilters,
  CashVoucherTableColumns,
  CashVoucherTablePreferencesModuleKey,
  CashVoucherTablePreferencesStorageKey,
  CashVoucherQueryKeys,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import {
  getSeedCashVoucherTransactions,
  getSeedCashVouchers,
  readStoredCashVoucherTransactions,
  readStoredCashVouchers,
  getCashVoucherDisplayStatus,
  buildCashVoucherPreviewRows,
  sanitizeCashVoucherRecord,
  writeStoredCashVoucherTransactions,
  writeStoredCashVouchers,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import { normalizeLowercaseWhitespace } from "@/app/src/utils/string.util";
import type {
  CashVoucherPreviewRow,
  CashVoucherRecord,
  CashVoucherTransactionRecord,
  CashVoucherTableColumnKey,
  CashVoucherStoreState,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";

function getInitialTransactions() {
  return readStoredCashVoucherTransactions() ?? getSeedCashVoucherTransactions();
}

function getInitialVouchers() {
  return readStoredCashVouchers() ?? getSeedCashVouchers();
}

export function useCashVoucherStore<TSelected = CashVoucherStoreState>(
  selector?: (state: CashVoucherStoreState) => TSelected,
) {
  const queryClient = useQueryClient();
  const transactionsQuery = useQuery({
    queryKey: CashVoucherQueryKeys.transactions(),
    queryFn: async () => getInitialTransactions(),
    initialData: getInitialTransactions,
  });
  const vouchersQuery = useQuery({
    queryKey: CashVoucherQueryKeys.vouchers(),
    queryFn: async () => getInitialVouchers(),
    initialData: getInitialVouchers,
  });

  function updateCachedVouchers(updater: (vouchers: CashVoucherRecord[]) => CashVoucherRecord[]) {
    queryClient.setQueryData<CashVoucherRecord[]>(
      CashVoucherQueryKeys.vouchers(),
      (currentVouchers = getInitialVouchers()) => {
        const nextVouchers = updater(currentVouchers.map(sanitizeCashVoucherRecord)).map(sanitizeCashVoucherRecord);

        writeStoredCashVouchers(nextVouchers);

        return nextVouchers;
      },
    );
  }

  function updateCachedTransactions(updater: (transactions: CashVoucherTransactionRecord[]) => CashVoucherTransactionRecord[]) {
    queryClient.setQueryData<CashVoucherTransactionRecord[]>(
      CashVoucherQueryKeys.transactions(),
      (currentTransactions = getInitialTransactions()) => {
        const nextTransactions = updater(currentTransactions);

        writeStoredCashVoucherTransactions(nextTransactions);

        return nextTransactions;
      },
    );
  }

  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: CashVoucherTransactionRecord) => transaction,
    onSuccess: (transaction) => {
      updateCachedTransactions((transactions) => {
        if (transactions.some((currentTransaction) => currentTransaction.id === transaction.id)) {
          return transactions.map((currentTransaction) => (currentTransaction.id === transaction.id ? transaction : currentTransaction));
        }

        return [transaction, ...transactions];
      });
    },
    onError: () => {
      toast.error("Could not save disbursement transaction. Please try again.");
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async (transaction: CashVoucherTransactionRecord) => transaction,
    onSuccess: (transaction) => {
      updateCachedTransactions((transactions) =>
        transactions.map((currentTransaction) => (currentTransaction.id === transaction.id ? transaction : currentTransaction)),
      );
    },
    onError: () => {
      toast.error("Could not update disbursement transaction. Please try again.");
    },
  });

  const addVoucherMutation = useMutation({
    mutationFn: async (voucher: CashVoucherRecord) => voucher,
    onSuccess: (voucher) => {
      updateCachedVouchers((vouchers) => [...vouchers, voucher]);
      toast.success("Cash Voucher Created.");
    },
    onError: () => {
      toast.error("Could not create cash voucher. Please try again.");
    },
  });

  const updateVoucherMutation = useMutation({
    mutationFn: async (voucher: CashVoucherRecord) => voucher,
    onSuccess: (voucher) => {
      updateCachedVouchers((vouchers) => vouchers.map((currentVoucher) => (currentVoucher.id === voucher.id ? voucher : currentVoucher)));
      toast.success("CashVoucher voucher updated.");
    },
    onError: () => {
      toast.error("Could not update cash voucher. Please try again.");
    },
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: async (voucherId: string) => voucherId,
    onSuccess: (voucherId) => {
      updateCachedVouchers((vouchers) => vouchers.filter((voucher) => voucher.id !== voucherId));
      toast.success("CashVoucher voucher deleted.");
    },
    onError: () => {
      toast.error("Could not delete cash voucher. Please try again.");
    },
  });

  const previewRows = useMemo(
    () => buildCashVoucherPreviewRows(transactionsQuery.data, vouchersQuery.data.map(sanitizeCashVoucherRecord)),
    [transactionsQuery.data, vouchersQuery.data],
  );

  const state = useMemo<CashVoucherStoreState>(
    () => ({
      previewRows,
      transactions: transactionsQuery.data,
      vouchers: vouchersQuery.data.map(sanitizeCashVoucherRecord),
      addTransaction: (transaction) => addTransactionMutation.mutate(transaction),
      updateTransaction: (transaction) => updateTransactionMutation.mutate(transaction),
      addVoucher: (voucher) => addVoucherMutation.mutate(voucher),
      updateVoucher: (voucher) => updateVoucherMutation.mutate(voucher),
      deleteVoucher: (voucherId) => deleteVoucherMutation.mutate(voucherId),
      isLoading: transactionsQuery.isLoading || vouchersQuery.isLoading,
      lastSyncedAt: Math.max(transactionsQuery.dataUpdatedAt, vouchersQuery.dataUpdatedAt),
      isMutating:
        addTransactionMutation.isPending ||
        addVoucherMutation.isPending ||
        updateTransactionMutation.isPending ||
        updateVoucherMutation.isPending ||
        deleteVoucherMutation.isPending,
    }),
    [
      addVoucherMutation,
      addTransactionMutation,
      deleteVoucherMutation,
      previewRows,
      transactionsQuery.data,
      transactionsQuery.dataUpdatedAt,
      transactionsQuery.isLoading,
      updateTransactionMutation,
      updateVoucherMutation,
      vouchersQuery.data,
      vouchersQuery.dataUpdatedAt,
      vouchersQuery.isLoading,
    ],
  );

  return selector ? selector(state) : (state as TSelected);
}

export function useCashVoucherPreviewTable(previewRows: CashVoucherPreviewRow[]) {
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
  const { columnOrder, columnVisibility, sorting, setColumnOrder, setColumnVisibility, setSorting } = useTablePreferences({
    defaultColumnOrder: CashVoucherDefaultColumnOrder,
    defaultColumnVisibility: CashVoucherDefaultColumnVisibility,
    defaultSorting: CashVoucherDefaultSorting,
    moduleKey: CashVoucherTablePreferencesModuleKey,
    storageKey: CashVoucherTablePreferencesStorageKey,
  });
  const [statusFilter, setStatusFilterState] =
    useState<(typeof CashVoucherStatusFilters)[number]>(CashVoucherAllStatusFilter);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = normalizeLowercaseWhitespace(deferredQuery);
  const filteredRows = useMemo(
    () =>
      previewRows.filter((row) => {
        const searchable = [
          row.transaction.transactionNo,
          row.voucher?.voucherNo,
          row.voucher?.partyCode,
          row.voucher?.partyName,
          row.transaction.payee,
          row.transaction.department,
          row.transaction.purpose,
          row.voucher?.remarks,
          row.voucher?.currency ?? row.transaction.currency,
        ]
          .filter(Boolean)
          .join(" ");
        const rowStatus = getCashVoucherDisplayStatus(row.voucher?.status ?? row.transaction.status);
        const rowDate = row.voucher?.voucherDate ?? row.transaction.transactionDate;
        const rowAmount = row.voucher?.amount ?? row.transaction.amount;

        return (
          normalizeLowercaseWhitespace(searchable).includes(normalizedQuery) &&
          (statusFilter === CashVoucherAllStatusFilter || rowStatus === statusFilter) &&
          isDateInRange(rowDate, dateRange) &&
          isAmountInRange(rowAmount, amountRange)
        );
      }),
    [amountRange, dateRange, normalizedQuery, previewRows, statusFilter],
  );
  const columns = useMemo<ColumnDef<CashVoucherPreviewRow>[]>(
    () =>
      CashVoucherTableColumns.map((column) => {
        if (!("key" in column)) {
          return {
            id: "actions",
            header: column.label,
            enableHiding: false,
            enableSorting: false,
            size: column.size,
            meta: { className: column.className, label: column.label },
          };
        }

        return createCashVoucherColumn(column.key, column.label, column.className, column.size);
      }),
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
  const table = useReactTable({
    data: filteredRows,
    columns,
    initialState: {
      columnOrder: CashVoucherDefaultColumnOrder,
      columnVisibility: CashVoucherDefaultColumnVisibility,
      sorting: CashVoucherDefaultSorting,
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

  function setQuery(value: string) {
    setQueryState(value);
    table.setPageIndex(0);
  }

  function setStatusFilter(value: (typeof CashVoucherStatusFilters)[number]) {
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
    setStatusFilterState(CashVoucherAllStatusFilter);
    table.setPageIndex(0);
  }

  return {
    amountRange,
    dateRange,
    query,
    resetFilters,
    setAmountRange,
    setDateRange,
    setQuery,
    setStatusFilter,
    statusFilter,
    statusOptions: CashVoucherStatusFilters,
    table,
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

function createCashVoucherColumn(
  key: CashVoucherTableColumnKey,
  header: string,
  className: string,
  size: number,
): ColumnDef<CashVoucherPreviewRow> {
  return {
    id: key,
    accessorFn: (row) => getCashVoucherColumnValue(row, key),
    header,
    size,
    sortingFn:
      key === "documentDate" || key === "createdAt" || key === "updatedAt" ? "datetime" : key === "amount" ? "basic" : "alphanumeric",
    meta: { className, label: header },
  };
}

function getCashVoucherColumnValue(row: CashVoucherPreviewRow, key: CashVoucherTableColumnKey) {
  switch (key) {
    case "voucherNo":
      return row.voucher?.voucherNo ?? row.transaction.transactionNo;
    case "documentDate":
      return row.voucher?.voucherDate ?? row.transaction.transactionDate;
    case "partyName":
      return row.voucher?.partyName || row.transaction.payee;
    case "partyCode":
      return row.voucher?.partyCode || "";
    case "remarks":
      return row.voucher?.remarks ?? row.transaction.purpose;
    case "currency":
      return row.voucher?.currency ?? row.transaction.currency;
    case "amount":
      return row.voucher?.amount ?? row.transaction.amount;
    case "status":
      return getCashVoucherDisplayStatus(row.voucher?.status ?? row.transaction.status);
    case "createdBy":
      return row.voucher?.createdBy ?? row.transaction.createdBy ?? "";
    case "createdAt":
      return row.voucher?.createdAt ?? row.transaction.createdAt ?? "";
    case "updatedBy":
      return row.voucher?.updatedBy ?? row.transaction.updatedBy ?? "";
    case "updatedAt":
      return row.voucher?.updatedAt ?? row.transaction.updatedAt ?? "";
    default:
      return "";
  }
}


