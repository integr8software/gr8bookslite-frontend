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
import toast from "react-hot-toast";
import {
  createBlankOfficialReceiptLineEntry,
  createOfficialReceiptFormValues,
  MockOfficialReceipts,
} from "@/app/src/data/modules/cash-receipt/official-receipt/OfficialReceiptData";
import { OfficialReceiptStatusFilters } from "@/app/src/constants/modules/cash-receipt/official-receipt/OfficialReceiptConstants";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  OfficialReceiptActionMode,
  OfficialReceiptEntryView,
  OfficialReceiptFormValues,
  OfficialReceiptLineEntry,
  OfficialReceiptRecord,
} from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";
import { validateOfficialReceiptForm } from "@/app/src/validations/modules/cash-receipt/official-receipt/OfficialReceiptValidation";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

type OfficialReceiptStoreState = {
  isLoading: boolean;
  lastSyncedAt: number;
  receipts: OfficialReceiptRecord[];
};

export function useOfficialReceiptStore<
  TSelected = OfficialReceiptStoreState,
>(selector?: (state: OfficialReceiptStoreState) => TSelected) {
  const [receipts] = useState(MockOfficialReceipts);
  const [lastSyncedAt] = useState(() => Date.now());
  const state = useMemo<OfficialReceiptStoreState>(
    () => ({
      isLoading: false,
      lastSyncedAt,
      receipts,
    }),
    [lastSyncedAt, receipts],
  );

  return selector ? selector(state) : (state as TSelected);
}

export function useOfficialReceiptActionForm(mode: OfficialReceiptActionMode) {
  const [entryView, setEntryView] =
    useState<OfficialReceiptEntryView>("collection");
  const [values, setValues] = useState<OfficialReceiptFormValues>(
    createOfficialReceiptFormValues,
  );

  function updateField<Key extends keyof OfficialReceiptFormValues>(
    key: Key,
    value: OfficialReceiptFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateLineEntries(lineEntries: OfficialReceiptLineEntry[]) {
    setValues((current) => ({ ...current, lineEntries }));
  }

  function applyCopyFrom(recordIds: string[]) {
    if (recordIds.length === 0) {
      return;
    }

    setValues((current) => ({
      ...current,
      referenceNo: recordIds[0] ?? current.referenceNo,
      lineEntries: current.lineEntries.length
        ? current.lineEntries
        : [createBlankOfficialReceiptLineEntry()],
    }));
    toast.success("Copied receipt source details.");
  }

  function submitReceipt() {
    const validation = validateOfficialReceiptForm(values);

    if (!validation.isValid) {
      toast.error(validation.message ?? "Review the official receipt details.");
      return;
    }

    toast.success(
      mode === "edit"
        ? "Official receipt updated."
        : "Official receipt saved.",
    );
  }

  return {
    applyCopyFrom,
    entryView,
    setEntryView,
    submitReceipt,
    updateField,
    updateLineEntries,
    values,
  };
}

export function useOfficialReceiptTable(receipts: OfficialReceiptRecord[]) {
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
    { id: "receiptDate", desc: true },
  ]);
  const [statusFilter, setStatusFilterState] = useState<
    (typeof OfficialReceiptStatusFilters)[number]
  >("all");
  const deferredQuery = useDeferredValue(query);
  const filteredRows = useMemo(
    () =>
      receipts.filter((receipt) => {
        const searchable = [
          receipt.receiptNo,
          receipt.referenceNo,
          receipt.customerName,
          receipt.collectionType,
        ]
          .join(" ")
          .toLowerCase();

        return (
          searchable.includes(deferredQuery.toLowerCase()) &&
          (statusFilter === "all" || receipt.status === statusFilter) &&
          isDateInRange(receipt.receiptDate, dateRange) &&
          isAmountInRange(receipt.amount, amountRange)
        );
      }),
    [amountRange, dateRange, deferredQuery, receipts, statusFilter],
  );
  const columns = useMemo<ColumnDef<OfficialReceiptRecord>[]>(
    () => [
      {
        id: "receiptNo",
        accessorKey: "receiptNo",
        header: "Receipt No.",
        sortingFn: "alphanumeric",
        meta: { className: "w-[12rem]" },
      },
      {
        id: "receiptDate",
        accessorKey: "receiptDate",
        header: "Receipt Date",
        sortingFn: "datetime",
        meta: { className: "w-[10rem]" },
      },
      {
        id: "customerName",
        accessorKey: "customerName",
        header: "Customer Name",
        sortingFn: "alphanumeric",
        meta: { className: "w-[18rem]" },
      },
      {
        id: "collectionType",
        accessorKey: "collectionType",
        header: "Collection Type",
        sortingFn: "alphanumeric",
        meta: { className: "w-[13rem]" },
      },
      {
        id: "referenceNo",
        accessorKey: "referenceNo",
        header: "Reference No.",
        sortingFn: "alphanumeric",
        meta: { className: "w-[12rem]" },
      },
      {
        id: "amount",
        accessorKey: "amount",
        header: "Amount",
        sortingFn: "basic",
        meta: { className: "w-[11rem]" },
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        sortingFn: "alphanumeric",
        meta: { className: "w-[10rem]" },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        meta: { className: "w-[12rem] text-center" },
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
    value: (typeof OfficialReceiptStatusFilters)[number],
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

  const dateTime = new Date(value).setHours(0, 0, 0, 0);
  const fromTime = range.from ? new Date(range.from).setHours(0, 0, 0, 0) : null;
  const toTime = range.to ? new Date(range.to).setHours(0, 0, 0, 0) : null;

  return !(
    (fromTime !== null && dateTime < fromTime) ||
    (toTime !== null && dateTime > toTime)
  );
}
