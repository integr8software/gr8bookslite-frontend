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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { DisbursementVoucherStatusFilters } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import {
  MockDisbursementTransactions,
  MockDisbursementVouchers,
  buildDisbursementVoucherPreviewRows,
  sanitizeDisbursementVoucherRecord,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { DisbursementVoucherQueryKeys } from "@/app/src/services/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherQueryKeys";
import type {
  DisbursementVoucherPreviewRow,
  DisbursementVoucherRecord,
  DisbursementTransactionRecord,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

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
  isMutating: boolean;
};

const DisbursementTransactionStorageKey =
  "gr8books.disbursement-voucher.transactions";
const DisbursementVoucherStorageKey = "gr8books.disbursement-voucher.vouchers";

function getSeedTransactions() {
  return MockDisbursementTransactions;
}

function getSeedVouchers() {
  return MockDisbursementVouchers.map(sanitizeDisbursementVoucherRecord);
}

function readStoredTransactions() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedTransactions = window.localStorage.getItem(
    DisbursementTransactionStorageKey,
  );

  if (!storedTransactions) {
    return null;
  }

  try {
    const parsedTransactions = JSON.parse(
      storedTransactions,
    ) as DisbursementTransactionRecord[];

    return Array.isArray(parsedTransactions) ? parsedTransactions : null;
  } catch {
    return null;
  }
}

function readStoredVouchers() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedVouchers = window.localStorage.getItem(
    DisbursementVoucherStorageKey,
  );

  if (!storedVouchers) {
    return null;
  }

  try {
    const parsedVouchers = JSON.parse(
      storedVouchers,
    ) as DisbursementVoucherRecord[];

    if (!Array.isArray(parsedVouchers)) {
      return null;
    }

    return parsedVouchers.map(sanitizeDisbursementVoucherRecord);
  } catch {
    return null;
  }
}

function getInitialTransactions() {
  return readStoredTransactions() ?? getSeedTransactions();
}

function getInitialVouchers() {
  return readStoredVouchers() ?? getSeedVouchers();
}

function writeStoredTransactions(transactions: DisbursementTransactionRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    DisbursementTransactionStorageKey,
    JSON.stringify(transactions),
  );
}

function writeStoredVouchers(vouchers: DisbursementVoucherRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    DisbursementVoucherStorageKey,
    JSON.stringify(vouchers.map(sanitizeDisbursementVoucherRecord)),
  );
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

        writeStoredVouchers(nextVouchers);

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

        writeStoredTransactions(nextTransactions);

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
      transactionsQuery.isLoading,
      updateTransactionMutation,
      updateVoucherMutation,
      vouchersQuery.data,
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
  const [sorting, setSorting] = useState<SortingState>([
    { id: "voucherDate", desc: true },
  ]);
  const [statusFilter, setStatusFilterState] = useState<
    (typeof DisbursementVoucherStatusFilters)[number]
  >("All");
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
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const rowStatus = row.voucher?.status ?? row.transaction.status;

        return (
          searchable.includes(deferredQuery.toLowerCase()) &&
          (statusFilter === "All" || rowStatus === statusFilter)
        );
      }),
    [deferredQuery, previewRows, statusFilter],
  );
  const columns = useMemo<ColumnDef<DisbursementVoucherPreviewRow>[]>(
    () => [
      {
        id: "voucherNo",
        accessorFn: (row) =>
          row.voucher?.voucherNo ?? `Preview ${row.transaction.transactionNo}`,
        header: "Voucher No.",
        sortingFn: "alphanumeric",
        meta: { className: "w-[12rem]" },
      },
      {
        id: "payee",
        accessorFn: (row) => row.transaction.payee,
        header: "Payee",
        sortingFn: "alphanumeric",
        meta: { className: "w-[18rem]" },
      },
      {
        id: "type",
        accessorFn: (row) => row.transaction.disbursementType,
        header: "Type",
        sortingFn: "alphanumeric",
        meta: { className: "w-[12rem]" },
      },
      {
        id: "voucherDate",
        accessorFn: (row) =>
          row.voucher?.voucherDate ?? row.transaction.transactionDate,
        header: "Date",
        sortingFn: "datetime",
        meta: { className: "w-[10rem]" },
      },
      {
        id: "amount",
        accessorFn: (row) => row.voucher?.amount ?? row.transaction.amount,
        header: "Amount",
        sortingFn: "basic",
        meta: { className: "w-[11rem]" },
      },
      {
        id: "status",
        accessorFn: (row) => row.voucher?.status ?? row.transaction.status,
        header: "Status",
        sortingFn: "alphanumeric",
        meta: { className: "w-[10rem]" },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        meta: { className: "w-[14rem] text-center" },
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
  const table = useReactTable({
    data: filteredRows,
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

  function resetFilters() {
    setQueryState("");
    setStatusFilterState("All");
    table.setPageIndex(0);
  }

  return {
    query,
    resetFilters,
    setQuery,
    setStatusFilter,
    statusFilter,
    statusOptions: DisbursementVoucherStatusFilters,
    table,
  };
}

