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
  DisbursementVoucherDefaultColumnOrder,
  DisbursementVoucherDefaultColumnVisibility,
  DisbursementVoucherDefaultSorting,
  DisbursementVoucherStatusFilters,
  DisbursementVoucherTableColumns,
  DisbursementVoucherTablePreferencesModuleKey,
  DisbursementVoucherTablePreferencesStorageKey,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
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
import { DisbursementVoucherQueryKeys } from "@/app/src/services/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherQueryKeys";
import type {
  DisbursementVoucherPreviewRow,
  DisbursementVoucherRecord,
  DisbursementTransactionRecord,
  DisbursementVoucherTableColumnKey,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";

type DisbursementVoucherStoreState = {
  previewRows: DisbursementVoucherPreviewRow[];
  transactions: DisbursementTransactionRecord[];
  vouchers: DisbursementVoucherRecord[];
  addTransaction: (transaction: DisbursementTransactionRecord) => void;
  updateTransaction: (transaction: DisbursementTransactionRecord) => void;
  addVoucher: (voucher: DisbursementVoucherRecord) => void;
  updateVoucher: (voucher: DisbursementVoucherRecord) => void;
  deleteVoucher: (voucherId: string) => void;
  isLoading: boolean;
  lastSyncedAt: number;
  isMutating: boolean;
};

function getInitialTransactions() {
  return readStoredDisbursementTransactions() ?? getSeedDisbursementTransactions();
}

function getInitialVouchers() {
  return readStoredDisbursementVouchers() ?? getSeedDisbursementVouchers();
}

export function useDisbursementVoucherStore<
  TSelected = DisbursementVoucherStoreState,
>(selector?: (state: DisbursementVoucherStoreState) => TSelected) {
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

  function updateCachedVouchers(
    updater: (vouchers: DisbursementVoucherRecord[]) => DisbursementVoucherRecord[],
  ) {
    queryClient.setQueryData<DisbursementVoucherRecord[]>(
      DisbursementVoucherQueryKeys.vouchers(),
      (currentVouchers = getInitialVouchers()) => {
        const nextVouchers = updater(
          currentVouchers.map(sanitizeDisbursementVoucherRecord),
        ).map(sanitizeDisbursementVoucherRecord);

        writeStoredDisbursementVouchers(nextVouchers);

        return nextVouchers;
      },
    );
  }

  function updateCachedTransactions(
    updater: (
      transactions: DisbursementTransactionRecord[],
    ) => DisbursementTransactionRecord[],
  ) {
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
    mutationFn: async (transaction: DisbursementTransactionRecord) =>
      transaction,
    onSuccess: (transaction) => {
      updateCachedTransactions((transactions) => {
        if (
          transactions.some(
            (currentTransaction) => currentTransaction.id === transaction.id,
          )
        ) {
          return transactions.map((currentTransaction) =>
            currentTransaction.id === transaction.id
              ? transaction
              : currentTransaction,
          );
        }

        return [transaction, ...transactions];
      });
    },
    onError: () => {
      toast.error("Could not save disbursement transaction. Please try again.");
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async (transaction: DisbursementTransactionRecord) =>
      transaction,
    onSuccess: (transaction) => {
      updateCachedTransactions((transactions) =>
        transactions.map((currentTransaction) =>
          currentTransaction.id === transaction.id
            ? transaction
            : currentTransaction,
        ),
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
      toast.success("Disbursement voucher created.");
    },
    onError: () => {
      toast.error("Could not create disbursement voucher. Please try again.");
    },
  });

  const updateVoucherMutation = useMutation({
    mutationFn: async (voucher: DisbursementVoucherRecord) => voucher,
    onSuccess: (voucher) => {
      updateCachedVouchers((vouchers) =>
        vouchers.map((currentVoucher) =>
          currentVoucher.id === voucher.id ? voucher : currentVoucher,
        ),
      );
      toast.success("Disbursement voucher updated.");
    },
    onError: () => {
      toast.error("Could not update disbursement voucher. Please try again.");
    },
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: async (voucherId: string) => voucherId,
    onSuccess: (voucherId) => {
      updateCachedVouchers((vouchers) =>
        vouchers.filter((voucher) => voucher.id !== voucherId),
      );
      toast.success("Disbursement voucher deleted.");
    },
    onError: () => {
      toast.error("Could not delete disbursement voucher. Please try again.");
    },
  });

  const previewRows = useMemo(
    () =>
      buildDisbursementVoucherPreviewRows(
        transactionsQuery.data,
        vouchersQuery.data.map(sanitizeDisbursementVoucherRecord),
      ),
    [transactionsQuery.data, vouchersQuery.data],
  );

  const state = useMemo<DisbursementVoucherStoreState>(
    () => ({
      previewRows,
      transactions: transactionsQuery.data,
      vouchers: vouchersQuery.data.map(sanitizeDisbursementVoucherRecord),
      addTransaction: (transaction) => addTransactionMutation.mutate(transaction),
      updateTransaction: (transaction) =>
        updateTransactionMutation.mutate(transaction),
      addVoucher: (voucher) => addVoucherMutation.mutate(voucher),
      updateVoucher: (voucher) => updateVoucherMutation.mutate(voucher),
      deleteVoucher: (voucherId) => deleteVoucherMutation.mutate(voucherId),
      isLoading: transactionsQuery.isLoading || vouchersQuery.isLoading,
      lastSyncedAt: Math.max(
        transactionsQuery.dataUpdatedAt,
        vouchersQuery.dataUpdatedAt,
      ),
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

export function useDisbursementVoucherPreviewTable(
  previewRows: DisbursementVoucherPreviewRow[],
) {
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
  const {
    columnOrder,
    columnVisibility,
    sorting,
    setColumnOrder,
    setColumnVisibility,
    setSorting,
  } = useTablePreferences({
    defaultColumnOrder: DisbursementVoucherDefaultColumnOrder,
    defaultColumnVisibility: DisbursementVoucherDefaultColumnVisibility,
    defaultSorting: DisbursementVoucherDefaultSorting,
    moduleKey: DisbursementVoucherTablePreferencesModuleKey,
    storageKey: DisbursementVoucherTablePreferencesStorageKey,
  });
  const [statusFilter, setStatusFilterState] = useState<
    (typeof DisbursementVoucherStatusFilters)[number]
  >("all");
  const deferredQuery = useDeferredValue(query);
  const filteredRows = useMemo(
    () =>
      previewRows.filter((row) => {
        const searchable = [
          row.transaction.transactionNo,
          row.voucher?.voucherNo,
          row.transaction.payee,
          row.transaction.department,
          row.transaction.purpose,
          row.voucher?.remarks,
          row.voucher?.currency ?? row.transaction.currency,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const rowStatus = getDisbursementVoucherDisplayStatus(
          row.voucher?.status ?? row.transaction.status,
        );
        const rowDate = row.voucher?.voucherDate ?? row.transaction.transactionDate;
        const rowAmount = row.voucher?.amount ?? row.transaction.amount;

        return (
          searchable.includes(deferredQuery.toLowerCase()) &&
          (statusFilter === "all" ||
            rowStatus === statusFilter) &&
          isDateInRange(rowDate, dateRange) &&
          isAmountInRange(rowAmount, amountRange)
        );
      }),
    [amountRange, dateRange, deferredQuery, previewRows, statusFilter],
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
            meta: { className: column.className, label: column.label },
          };
        }

        return createDisbursementVoucherColumn(
          column.key,
          column.label,
          column.className,
        );
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

  function setStatusFilter(
    value: (typeof DisbursementVoucherStatusFilters)[number],
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
    setQueryState("");
    setDateRangeState({ from: "", to: "" });
    setAmountRangeState({ from: "", to: "" });
    setStatusFilterState("all");
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
    statusOptions: DisbursementVoucherStatusFilters,
    table,
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

function createDisbursementVoucherColumn(
  key: DisbursementVoucherTableColumnKey,
  header: string,
  className: string,
): ColumnDef<DisbursementVoucherPreviewRow> {
  return {
    id: key,
    accessorFn: (row) => getDisbursementVoucherColumnValue(row, key),
    header,
    sortingFn:
      key === "documentDate" || key === "createdAt" || key === "updatedAt"
        ? "datetime"
        : key === "amount"
          ? "basic"
          : "alphanumeric",
    meta: { className, label: header },
  };
}

function getDisbursementVoucherColumnValue(
  row: DisbursementVoucherPreviewRow,
  key: DisbursementVoucherTableColumnKey,
) {
  switch (key) {
    case "voucherNo":
      return row.voucher?.voucherNo ?? row.transaction.transactionNo;
    case "documentDate":
      return row.voucher?.voucherDate ?? row.transaction.transactionDate;
    case "partyName":
      return row.transaction.payee;
    case "paymentType":
      return row.transaction.disbursementType;
    case "remarks":
      return row.voucher?.remarks ?? row.transaction.purpose;
    case "currency":
      return row.voucher?.currency ?? row.transaction.currency;
    case "amount":
      return row.voucher?.amount ?? row.transaction.amount;
    case "status":
      return getDisbursementVoucherDisplayStatus(
        row.voucher?.status ?? row.transaction.status,
      );
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

