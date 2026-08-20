"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
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
  AcknowledgementReceiptCopyFromRecords,
  applyCopyFromRecordsToAcknowledgementReceiptForm,
  createBlankAcknowledgementReceiptLineEntry,
  createAcknowledgementReceiptFormValuesFromRecord,
  createAcknowledgementReceiptFormValues,
  createAcknowledgementReceiptRecordFromForm,
  getInitialAcknowledgementReceipts,
  writeStoredAcknowledgementReceipts,
} from "@/app/src/data/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptData";
import { AcknowledgementReceiptStatusFilters } from "@/app/src/constants/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptConstants";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  AcknowledgementReceiptActionMode,
  AcknowledgementReceiptCopyFromRecord,
  AcknowledgementReceiptEntryView,
  AcknowledgementReceiptFormValues,
  AcknowledgementReceiptLineEntry,
  AcknowledgementReceiptRecord,
  AcknowledgementReceiptStatus,
} from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";
import { validateAcknowledgementReceiptForm } from "@/app/src/validations/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptValidation";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

type AcknowledgementReceiptStoreState = {
  isLoading: boolean;
  lastSyncedAt: number;
  receipts: AcknowledgementReceiptRecord[];
  updateReceiptStatus: (receipt: AcknowledgementReceiptRecord, status: AcknowledgementReceiptStatus) => void;
};

export function useAcknowledgementReceiptStore<TSelected = AcknowledgementReceiptStoreState>(
  selector?: (state: AcknowledgementReceiptStoreState) => TSelected,
) {
  const [receipts, setReceipts] = useState(getInitialAcknowledgementReceipts);
  const [lastSyncedAt] = useState(() => Date.now());
  const updateReceiptStatus = useCallback((receipt: AcknowledgementReceiptRecord, status: AcknowledgementReceiptStatus) => {
    setReceipts((currentReceipts) =>
      persistAcknowledgementReceipts(
        currentReceipts.map((currentReceipt) =>
          currentReceipt.id === receipt.id
            ? {
                ...currentReceipt,
                formValues: currentReceipt.formValues
                  ? {
                      ...currentReceipt.formValues,
                      status,
                    }
                  : currentReceipt.formValues,
                status,
              }
            : currentReceipt,
        ),
      ),
    );
    toast.success(`Acknowledgement Receipt marked as ${status}.`);
  }, []);

  const state = useMemo<AcknowledgementReceiptStoreState>(
    () => ({
      isLoading: false,
      lastSyncedAt,
      receipts,
      updateReceiptStatus,
    }),
    [lastSyncedAt, receipts, updateReceiptStatus],
  );

  return selector ? selector(state) : (state as TSelected);
}

export function useAcknowledgementReceiptActionForm(
  mode: AcknowledgementReceiptActionMode,
  recordId?: string,
  onSaved?: (record: AcknowledgementReceiptRecord) => void,
) {
  const initialRecord = mode === "add" ? null : (getInitialAcknowledgementReceipts().find((receipt) => receipt.id === recordId) ?? null);
  const isNotFound = mode !== "add" && !initialRecord;
  const [entryView, setEntryView] = useState<AcknowledgementReceiptEntryView>("collection");
  const [loadedRecord, setLoadedRecord] = useState<AcknowledgementReceiptRecord | null>(initialRecord);
  const [values, setValues] = useState<AcknowledgementReceiptFormValues>(() =>
    initialRecord ? createAcknowledgementReceiptFormValuesFromRecord(initialRecord) : createAcknowledgementReceiptFormValues(),
  );

  function updateField<Key extends keyof AcknowledgementReceiptFormValues>(key: Key, value: AcknowledgementReceiptFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateLineEntries(lineEntries: AcknowledgementReceiptLineEntry[]) {
    setValues((current) => ({ ...current, lineEntries }));
  }

  function updateFirstLineEntry(updates: Partial<AcknowledgementReceiptLineEntry>) {
    setValues((current) => {
      const firstLineEntry = current.lineEntries[0] ?? createBlankAcknowledgementReceiptLineEntry();
      const remainingLineEntries = current.lineEntries.slice(1);

      return {
        ...current,
        lineEntries: [
          {
            ...firstLineEntry,
            ...updates,
          },
          ...remainingLineEntries,
        ],
      };
    });
  }

  function applyCopyFrom(recordIds: string[]) {
    if (recordIds.length === 0) {
      return;
    }

    const selectedRecords = AcknowledgementReceiptCopyFromRecords.filter((record) => recordIds.includes(record.id));

    if (selectedRecords.length > 0) {
      setValues((current) => applyCopyFromRecordsToAcknowledgementReceiptForm(current, selectedRecords));
    } else {
      setValues((current) => ({
        ...current,
        referenceNo: recordIds.join(", "),
        lineEntries: current.lineEntries.length ? current.lineEntries : [createBlankAcknowledgementReceiptLineEntry()],
      }));
    }
    toast.success("Copied receipt source details.");
  }

  function submitReceipt() {
    const validation = validateAcknowledgementReceiptForm(values);

    if (!validation.isValid) {
      toast.error(validation.message ?? "Review the Acknowledgement Receipt details.");
      return;
    }

    const nextRecord = createAcknowledgementReceiptRecordFromForm(values, mode === "edit" ? (loadedRecord ?? undefined) : undefined);
    const nextReceipts = upsertAcknowledgementReceiptRecord(nextRecord);

    writeStoredAcknowledgementReceipts(nextReceipts);
    setLoadedRecord(nextRecord);
    toast.success(mode === "edit" ? "Acknowledgement Receipt updated." : "Acknowledgement Receipt saved.");
    onSaved?.(nextRecord);
  }

  return {
    applyCopyFrom,
    entryView,
    isNotFound,
    setEntryView,
    submitReceipt,
    updateFirstLineEntry,
    updateField,
    updateLineEntries,
    values,
  };
}

function persistAcknowledgementReceipts(receipts: AcknowledgementReceiptRecord[]) {
  writeStoredAcknowledgementReceipts(receipts);

  return receipts;
}

function upsertAcknowledgementReceiptRecord(record: AcknowledgementReceiptRecord) {
  const currentReceipts = getInitialAcknowledgementReceipts();
  const existingIndex = currentReceipts.findIndex((receipt) => receipt.id === record.id);

  if (existingIndex === -1) {
    return persistAcknowledgementReceipts([record, ...currentReceipts]);
  }

  return persistAcknowledgementReceipts(
    currentReceipts.map((currentReceipt) => (currentReceipt.id === record.id ? record : currentReceipt)),
  );
}

export function useAcknowledgementReceiptTable(receipts: AcknowledgementReceiptRecord[]) {
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
  const [sorting, setSorting] = useState<SortingState>([{ id: "receiptDate", desc: true }]);
  const [statusFilter, setStatusFilterState] = useState<(typeof AcknowledgementReceiptStatusFilters)[number]>("all");
  const deferredQuery = useDeferredValue(query);
  const filteredRows = useMemo(
    () =>
      receipts.filter((receipt) => {
        const searchable = [receipt.receiptNo, receipt.referenceNo, receipt.partyCode, receipt.customerName, receipt.collectionType]
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
  const columns = useMemo<ColumnDef<AcknowledgementReceiptRecord>[]>(
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
        id: "partyCode",
        accessorKey: "partyCode",
        header: "Party Code",
        sortingFn: "alphanumeric",
        meta: { className: "w-[12rem]" },
      },
      {
        id: "customerName",
        accessorKey: "customerName",
        header: "Party Name",
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

  function setStatusFilter(value: (typeof AcknowledgementReceiptStatusFilters)[number]) {
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
  const toAmount = range.to.trim() ? parseMoneyNumberInput(range.to) : Number.MAX_SAFE_INTEGER;

  return value >= fromAmount && value <= toAmount;
}

function isDateInRange(value: string, range: DateRangeValue) {
  if (!range.from && !range.to) {
    return true;
  }

  const dateTime = new Date(value).setHours(0, 0, 0, 0);
  const fromTime = range.from ? new Date(range.from).setHours(0, 0, 0, 0) : null;
  const toTime = range.to ? new Date(range.to).setHours(0, 0, 0, 0) : null;

  return !((fromTime !== null && dateTime < fromTime) || (toTime !== null && dateTime > toTime));
}
