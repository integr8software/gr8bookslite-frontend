"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { getJournalVoucherTotals } from "@/app/src/data/modules/general-journal/journal-voucher/JournalVoucherData";
import { useJournalVoucherStore } from "@/app/src/hooks/modules/general-journal/journal-voucher/useJournalVoucher";
import type { JournalVoucherRecord } from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";

export function useJournalVoucherListPage() {
  const { deleteRecord, isLoading, isMutating, lastSyncedAt, records } =
    useJournalVoucherStore();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "documentDate", desc: true },
  ]);
  const [pendingDeleteRecord, setPendingDeleteRecord] =
    useState<JournalVoucherRecord | null>(null);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return records;
    }

    return records.filter((record) =>
      [
        record.transactionNo,
        record.documentDate,
        record.remarks,
        record.currencyType,
        record.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, records]);

  const columns = useMemo<ColumnDef<JournalVoucherRecord>[]>(
    () => [
      createColumn("transactionNo", "Transaction No", "w-[12rem]"),
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

  function handleConfirmDelete() {
    if (!pendingDeleteRecord) {
      return;
    }

    deleteRecord(pendingDeleteRecord.id);
    setPendingDeleteRecord(null);
  }

  return {
    handleConfirmDelete,
    handleQueryChange,
    isLoading,
    isMutating,
    lastSyncedAt,
    pendingDeleteRecord,
    query,
    setPendingDeleteRecord,
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
