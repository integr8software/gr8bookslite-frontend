"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
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
import { ReceiptText } from "lucide-react";
import {
  DisbursementVoucherDefaultColumnOrder,
  DisbursementVoucherDefaultColumnVisibility,
  DisbursementVoucherDefaultSorting,
  DisbursementVoucherAllStatusFilter,
  DisbursementVoucherStatusFilters,
  DisbursementVoucherStatuses,
  DisbursementVoucherTableColumns,
  DisbursementVoucherTablePreferencesModuleKey,
  DisbursementVoucherTablePreferencesStorageKey,
  DisbursementVoucherQueryKeys,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import {
  getSeedDisbursementTransactions,
  getSeedDisbursementVouchers,
  readStoredDisbursementTransactions,
  readStoredDisbursementVouchers,
  getDisbursementVoucherDisplayStatus,
  buildDisbursementVoucherPreviewRows,
  sanitizeDisbursementVoucherRecord,
  writeStoredDisbursementTransactions,
  writeStoredDisbursementVouchers,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { normalizeLowercaseWhitespace } from "@/app/src/utils/string.util";
import type {
  DisbursementVoucherPreviewRow,
  DisbursementVoucherRecord,
  DisbursementVoucherStatus,
  DisbursementTransactionRecord,
  DisbursementVoucherTableColumnKey,
  DisbursementVoucherStoreState,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";

function getInitialTransactions() {
  return readStoredDisbursementTransactions() ?? getSeedDisbursementTransactions();
}

function getInitialVouchers() {
  return readStoredDisbursementVouchers() ?? getSeedDisbursementVouchers();
}

export function useDisbursementVoucherStore<TSelected = DisbursementVoucherStoreState>(
  selector?: (state: DisbursementVoucherStoreState) => TSelected,
) {
  const queryClient = useQueryClient();
  const transactionsQuery = useQuery({
    queryKey: DisbursementVoucherQueryKeys.transactions(),
    queryFn: async () => getInitialTransactions(),
    initialData: getInitialTransactions,
  });
  const vouchersQuery = useQuery({
    queryKey: DisbursementVoucherQueryKeys.vouchers(),
    queryFn: async () => getInitialVouchers(),
    initialData: getInitialVouchers,
  });

  function updateCachedVouchers(updater: (vouchers: DisbursementVoucherRecord[]) => DisbursementVoucherRecord[]) {
    queryClient.setQueryData<DisbursementVoucherRecord[]>(
      DisbursementVoucherQueryKeys.vouchers(),
      (currentVouchers = getInitialVouchers()) => {
        const nextVouchers = updater(currentVouchers.map(sanitizeDisbursementVoucherRecord)).map(sanitizeDisbursementVoucherRecord);

        writeStoredDisbursementVouchers(nextVouchers);

        return nextVouchers;
      },
    );
  }

  function updateCachedTransactions(updater: (transactions: DisbursementTransactionRecord[]) => DisbursementTransactionRecord[]) {
    queryClient.setQueryData<DisbursementTransactionRecord[]>(
      DisbursementVoucherQueryKeys.transactions(),
      (currentTransactions = getInitialTransactions()) => {
        const nextTransactions = updater(currentTransactions);

        writeStoredDisbursementTransactions(nextTransactions);

        return nextTransactions;
      },
    );
  }

  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: DisbursementTransactionRecord) => transaction,
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
    mutationFn: async (transaction: DisbursementTransactionRecord) => transaction,
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
    mutationFn: async (voucher: DisbursementVoucherRecord) => voucher,
    onSuccess: (voucher) => {
      updateCachedVouchers((vouchers) => [...vouchers, voucher]);
      toast.success("Disbursement Voucher Created.");
    },
    onError: () => {
      toast.error("Could not create disbursement voucher. Please try again.");
    },
  });

  const updateVoucherMutation = useMutation({
    mutationFn: async (voucher: DisbursementVoucherRecord) => voucher,
    onSuccess: (voucher) => {
      updateCachedVouchers((vouchers) => vouchers.map((currentVoucher) => (currentVoucher.id === voucher.id ? voucher : currentVoucher)));
      toast.success("Disbursement voucher updated.");
    },
    onError: () => {
      toast.error("Could not update disbursement voucher. Please try again.");
    },
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: async (voucherId: string) => voucherId,
    onSuccess: (voucherId) => {
      updateCachedVouchers((vouchers) => vouchers.filter((voucher) => voucher.id !== voucherId));
      toast.success("Disbursement voucher deleted.");
    },
    onError: () => {
      toast.error("Could not delete disbursement voucher. Please try again.");
    },
  });

  const previewRows = useMemo(
    () => buildDisbursementVoucherPreviewRows(transactionsQuery.data, vouchersQuery.data.map(sanitizeDisbursementVoucherRecord)),
    [transactionsQuery.data, vouchersQuery.data],
  );

  const state = useMemo<DisbursementVoucherStoreState>(
    () => ({
      previewRows,
      transactions: transactionsQuery.data,
      vouchers: vouchersQuery.data.map(sanitizeDisbursementVoucherRecord),
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

export function useDisbursementVoucherPreviewTable(previewRows: DisbursementVoucherPreviewRow[]) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
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
    defaultColumnOrder: DisbursementVoucherDefaultColumnOrder,
    defaultColumnVisibility: DisbursementVoucherDefaultColumnVisibility,
    defaultSorting: DisbursementVoucherDefaultSorting,
    moduleKey: DisbursementVoucherTablePreferencesModuleKey,
    storageKey: DisbursementVoucherTablePreferencesStorageKey,
  });
  const [statusFilter, setStatusFilterState] =
    useState<(typeof DisbursementVoucherStatusFilters)[number]>(DisbursementVoucherAllStatusFilter);
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
        const rowStatus = getDisbursementVoucherDisplayStatus(row.voucher?.status ?? row.transaction.status);
        const rowDate = row.voucher?.voucherDate ?? row.transaction.transactionDate;
        const rowAmount = row.voucher?.amount ?? row.transaction.amount;

        return (
          normalizeLowercaseWhitespace(searchable).includes(normalizedQuery) &&
          (statusFilter === DisbursementVoucherAllStatusFilter || rowStatus === statusFilter) &&
          isDateInRange(rowDate, dateRange) &&
          isAmountInRange(rowAmount, amountRange)
        );
      }),
    [amountRange, dateRange, normalizedQuery, previewRows, statusFilter],
  );
  const columns = useMemo<ColumnDef<DisbursementVoucherPreviewRow>[]>(
    () =>
      DisbursementVoucherTableColumns.map((column) => {
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

        return createDisbursementVoucherColumn(column.key, column.label, column.className, column.size);
      }),
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
  const table = useReactTable({
    data: filteredRows,
    columns,
    initialState: {
      columnOrder: DisbursementVoucherDefaultColumnOrder,
      columnVisibility: DisbursementVoucherDefaultColumnVisibility,
      sorting: DisbursementVoucherDefaultSorting,
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

  const setStatusFilter = useCallback((value: (typeof DisbursementVoucherStatusFilters)[number]) => {
    setStatusFilterState(value);
    table.setPageIndex(0);
  }, [table]);

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
    setStatusFilterState(DisbursementVoucherAllStatusFilter);
    table.setPageIndex(0);
  }

  const statisticCards = useMemo<ModuleStatisticCardItem[]>(() => {
    const statusCounts = Object.fromEntries(
      Object.values(DisbursementVoucherStatuses).map((status) => [
        status,
        previewRows.filter(
          (row) => getDisbursementVoucherDisplayStatus(row.voucher?.status ?? row.transaction.status) === status,
        ).length,
      ]),
    ) as Record<DisbursementVoucherStatus, number>;

    return [
      {
        label: "Total Entries",
        value: previewRows.length,
        summary: "All time",
        icon: ReceiptText,
        tone: "violet",
        isActive: statusFilter === DisbursementVoucherAllStatusFilter,
        onClick: () => setStatusFilter(DisbursementVoucherAllStatusFilter),
      },
      ...[
        DisbursementVoucherStatuses.posted,
        DisbursementVoucherStatuses.forApproval,
        DisbursementVoucherStatuses.draft,
        DisbursementVoucherStatuses.disapproved,
        DisbursementVoucherStatuses.cancelled,
      ].map((status, index) => ({
        label: status,
        value: statusCounts[status] ?? 0,
        summary: formatPartOfTotalPercentage(statusCounts[status] ?? 0, previewRows.length),
        icon: getModuleStatusMetricIcon(status),
        iconClassName: getModuleStatusMetricIconClassName(status),
        tone: (["emerald", "amber", "blue", "red", "slate"] as const)[index],
        isActive: statusFilter === status,
        onClick: () => setStatusFilter(status),
      })),
    ];
  }, [previewRows, setStatusFilter, statusFilter]);

  return {
    amountRange,
    dateRange,
    query,
    resetFilters,
    setAmountRange,
    setDateRange,
    setQuery,
    setStatusFilter,
    statisticCards,
    statusFilter,
    statusOptions: DisbursementVoucherStatusFilters,
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

function createDisbursementVoucherColumn(
  key: DisbursementVoucherTableColumnKey,
  header: string,
  className: string,
  size: number,
): ColumnDef<DisbursementVoucherPreviewRow> {
  return {
    id: key,
    accessorFn: (row) => getDisbursementVoucherColumnValue(row, key),
    header,
    size,
    sortingFn:
      key === "documentDate" || key === "createdAt" || key === "updatedAt" ? "datetime" : key === "amount" ? "basic" : "alphanumeric",
    meta: { className, label: header },
  };
}

function getDisbursementVoucherColumnValue(row: DisbursementVoucherPreviewRow, key: DisbursementVoucherTableColumnKey) {
  switch (key) {
    case "voucherNo":
      return row.voucher?.voucherNo ?? row.transaction.transactionNo;
    case "documentDate":
      return row.voucher?.voucherDate ?? row.transaction.transactionDate;
    case "partyName":
      return row.voucher?.partyName || row.transaction.payee;
    case "partyCode":
      return row.voucher?.partyCode || "";
    case "paymentType":
      return getDisbursementVoucherPaymentType(row);
    case "remarks":
      return row.voucher?.remarks ?? row.transaction.purpose;
    case "currency":
      return row.voucher?.currency ?? row.transaction.currency;
    case "amount":
      return row.voucher?.amount ?? row.transaction.amount;
    case "status":
      return getDisbursementVoucherDisplayStatus(row.voucher?.status ?? row.transaction.status);
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

function getDisbursementVoucherPaymentType(row: DisbursementVoucherPreviewRow) {
  return row.voucher?.disbursementType || row.transaction.disbursementType || row.voucher?.paymentMethod || row.transaction.paymentMethod;
}
