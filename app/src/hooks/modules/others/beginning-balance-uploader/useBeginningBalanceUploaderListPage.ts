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
import { getBeginningBalanceUploaderTotals } from "@/app/src/data/modules/others/beginning-balance-uploader/BeginningBalanceUploaderData";
import { useBeginningBalanceUploaderStore } from "@/app/src/hooks/modules/others/beginning-balance-uploader/useBeginningBalanceUploader";
import type { BeginningBalanceUploaderRecord } from "@/app/src/types/modules/beginning-balance-uploader/BeginningBalanceUploaderTypes";

export function useBeginningBalanceUploaderListPage() {
  const { deleteRecord, isLoading, isMutating, lastSyncedAt, records } =
    useBeginningBalanceUploaderStore();
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "documentDate", desc: true }]);
  const [pendingDeleteRecord, setPendingDeleteRecord] =
    useState<BeginningBalanceUploaderRecord | null>(null);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return records;

    return records.filter((record) =>
      [record.transactionNumber, record.documentDate, record.currencyType, record.remarks, record.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, records]);

  const columns = useMemo<ColumnDef<BeginningBalanceUploaderRecord>[]>(
    () => [
      createColumn("transactionNumber", "Transaction No.", "w-[13rem]"),
      createColumn("documentDate", "Document Date", "w-[11rem]"),
      createColumn("remarks", "Remarks", "w-[22rem]"),
      createColumn("currencyType", "Currency", "w-[8rem]"),
      {
        id: "amount",
        header: "Amount",
        accessorFn: (record) => getBeginningBalanceUploaderTotals(record.rows).debit,
        sortingFn: "basic",
        meta: { className: "w-[12rem] text-right" },
      },
      createColumn("status", "Status", "w-[9rem]"),
      { id: "actions", header: "Actions", enableSorting: false, meta: { className: "w-[9rem]" } },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  const table = useReactTable({
    data: filteredRecords,
    columns,
    state: { pagination, sorting },
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
    if (!pendingDeleteRecord) return;
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
    records,
    setPendingDeleteRecord,
    table,
  };
}

function createColumn(
  key: keyof BeginningBalanceUploaderRecord,
  header: string,
  className: string,
): ColumnDef<BeginningBalanceUploaderRecord> {
  return {
    accessorKey: key,
    header,
    sortingFn: key === "documentDate" ? "datetime" : "alphanumeric",
    meta: { className },
  };
}
