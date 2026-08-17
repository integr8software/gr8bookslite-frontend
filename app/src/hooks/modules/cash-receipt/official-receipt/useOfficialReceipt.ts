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
  createBlankOfficialReceiptLineEntry,
  createOfficialReceiptFormValuesFromRecord,
  createOfficialReceiptFormValues,
  createOfficialReceiptRecordFromForm,
  getInitialReceiptsByKey,
  getInitialOfficialReceipts,
  MockOfficialReceipts,
  OfficialReceiptStorageKey,
  writeStoredReceiptsByKey,
  writeStoredOfficialReceipts,
} from "@/app/src/data/modules/cash-receipt/official-receipt/OfficialReceiptData";
import { OfficialReceiptStatusFilters } from "@/app/src/constants/modules/cash-receipt/official-receipt/OfficialReceiptConstants";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  OfficialReceiptActionMode,
  OfficialReceiptEntryView,
  OfficialReceiptFormValues,
  OfficialReceiptLineEntry,
  OfficialReceiptRecord,
  OfficialReceiptStatus,
} from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";
import { validateOfficialReceiptForm } from "@/app/src/validations/modules/cash-receipt/official-receipt/OfficialReceiptValidation";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

type OfficialReceiptStoreState = {
  isLoading: boolean;
  lastSyncedAt: number;
  receipts: OfficialReceiptRecord[];
  updateReceiptStatus: (receipt: OfficialReceiptRecord, status: OfficialReceiptStatus) => void;
};

export type OfficialReceiptModuleConfig = {
  fallbackReceipts?: OfficialReceiptRecord[];
  receiptLabel?: string;
  storageKey?: string;
};

export function useOfficialReceiptStore<TSelected = OfficialReceiptStoreState>(
  selector?: (state: OfficialReceiptStoreState) => TSelected,
  config: OfficialReceiptModuleConfig = {},
) {
  const storageKey = config.storageKey ?? OfficialReceiptStorageKey;
  const fallbackReceipts = config.fallbackReceipts ?? MockOfficialReceipts;
  const receiptLabel = config.receiptLabel ?? "Official receipt";
  const [receipts, setReceipts] = useState(() => getInitialReceiptsByKey(storageKey, fallbackReceipts));
  const [lastSyncedAt] = useState(() => Date.now());
  const updateReceiptStatus = useCallback(
    (receipt: OfficialReceiptRecord, status: OfficialReceiptStatus) => {
      setReceipts((currentReceipts) =>
        persistOfficialReceipts(
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
          storageKey,
        ),
      );
      toast.success(`${receiptLabel} marked as ${status}.`);
    },
    [receiptLabel, storageKey],
  );

  const state = useMemo<OfficialReceiptStoreState>(
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

export function useOfficialReceiptActionForm(
  mode: OfficialReceiptActionMode,
  recordId?: string,
  onSaved?: (record: OfficialReceiptRecord) => void,
  config: OfficialReceiptModuleConfig = {},
) {
  const storageKey = config.storageKey ?? OfficialReceiptStorageKey;
  const fallbackReceipts = config.fallbackReceipts ?? MockOfficialReceipts;
  const receiptLabel = config.receiptLabel ?? "Official receipt";
  const initialReceipts = getInitialReceiptsByKey(storageKey, fallbackReceipts);
  const initialRecord = mode === "add" ? null : (initialReceipts.find((receipt) => receipt.id === recordId) ?? null);
  const isNotFound = mode !== "add" && !initialRecord;
  const [entryView, setEntryView] = useState<OfficialReceiptEntryView>("collection");
  const [loadedRecord, setLoadedRecord] = useState<OfficialReceiptRecord | null>(initialRecord);
  const [values, setValues] = useState<OfficialReceiptFormValues>(() =>
    initialRecord ? createOfficialReceiptFormValuesFromRecord(initialRecord) : createOfficialReceiptFormValues(),
  );

  function updateField<Key extends keyof OfficialReceiptFormValues>(key: Key, value: OfficialReceiptFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateLineEntries(lineEntries: OfficialReceiptLineEntry[]) {
    setValues((current) => ({ ...current, lineEntries }));
  }

  function updateFirstLineEntry(updates: Partial<OfficialReceiptLineEntry>) {
    setValues((current) => {
      const firstLineEntry = current.lineEntries[0] ?? createBlankOfficialReceiptLineEntry();
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

    setValues((current) => ({
      ...current,
      referenceNo: recordIds[0] ?? current.referenceNo,
      lineEntries: current.lineEntries.length ? current.lineEntries : [createBlankOfficialReceiptLineEntry()],
    }));
    toast.success("Copied receipt source details.");
  }

  function submitReceipt() {
    const validation = validateOfficialReceiptForm(values);

    if (!validation.isValid) {
      toast.error(validation.message ?? "Review the official receipt details.");
      return;
    }

    const nextRecord = createOfficialReceiptRecordFromForm(values, mode === "edit" ? (loadedRecord ?? undefined) : undefined);
    const nextReceipts = upsertOfficialReceiptRecord(nextRecord, storageKey, fallbackReceipts);

    writeStoredReceiptsByKey(storageKey, nextReceipts);
    setLoadedRecord(nextRecord);
    toast.success(mode === "edit" ? `${receiptLabel} updated.` : `${receiptLabel} saved.`);
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

function persistOfficialReceipts(receipts: OfficialReceiptRecord[], storageKey = OfficialReceiptStorageKey) {
  if (storageKey === OfficialReceiptStorageKey) {
    writeStoredOfficialReceipts(receipts);
  } else {
    writeStoredReceiptsByKey(storageKey, receipts);
  }

  return receipts;
}

function upsertOfficialReceiptRecord(
  record: OfficialReceiptRecord,
  storageKey = OfficialReceiptStorageKey,
  fallbackReceipts = MockOfficialReceipts,
) {
  const currentReceipts = getInitialReceiptsByKey(storageKey, fallbackReceipts);
  const existingIndex = currentReceipts.findIndex((receipt) => receipt.id === record.id);

  if (existingIndex === -1) {
    return persistOfficialReceipts([record, ...currentReceipts], storageKey);
  }

  return persistOfficialReceipts(
    currentReceipts.map((currentReceipt) => (currentReceipt.id === record.id ? record : currentReceipt)),
    storageKey,
  );
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
  const [sorting, setSorting] = useState<SortingState>([{ id: "receiptDate", desc: true }]);
  const [statusFilter, setStatusFilterState] = useState<(typeof OfficialReceiptStatusFilters)[number]>("all");
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

  function setStatusFilter(value: (typeof OfficialReceiptStatusFilters)[number]) {
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
