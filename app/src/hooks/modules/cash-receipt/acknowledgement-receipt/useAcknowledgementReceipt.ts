"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
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
  applyCopyFromRecordsToAcknowledgementReceiptForm,
  createBlankAcknowledgementReceiptLineEntry,
  createAcknowledgementReceiptFormValuesFromRecord,
  createAcknowledgementReceiptFormValues,
  AcknowledgementReceiptCopyFromRecords,
  syncAcknowledgementReceiptCheckDetails,
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
import {
  createAcknowledgementReceipt,
  fetchAcknowledgementReceipt,
  fetchAcknowledgementReceiptNumberSuggestion,
  fetchAcknowledgementReceipts,
  mapApiAcknowledgementReceipt,
  updateAcknowledgementReceipt,
  updateAcknowledgementReceiptStatus,
} from "@/app/src/services/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptApi";

type AcknowledgementReceiptListResponse<TReceipt> = {
  receipts: TReceipt[];
};

type AcknowledgementReceiptListQuery = Parameters<typeof fetchAcknowledgementReceipts>[0];

type AcknowledgementReceiptApi<TReceipt = Parameters<typeof mapApiAcknowledgementReceipt>[0]> = {
  createReceipt: typeof createAcknowledgementReceipt;
  fetchReceipt: typeof fetchAcknowledgementReceipt;
  fetchReceipts: (query?: AcknowledgementReceiptListQuery) => Promise<AcknowledgementReceiptListResponse<TReceipt>>;
  mapApiReceipt: (receipt: TReceipt) => AcknowledgementReceiptRecord;
  updateReceipt: typeof updateAcknowledgementReceipt;
  updateReceiptStatus: typeof updateAcknowledgementReceiptStatus;
};

const DefaultAcknowledgementReceiptApi: AcknowledgementReceiptApi = {
  createReceipt: createAcknowledgementReceipt,
  fetchReceipt: fetchAcknowledgementReceipt,
  fetchReceipts: fetchAcknowledgementReceipts,
  mapApiReceipt: mapApiAcknowledgementReceipt,
  updateReceipt: updateAcknowledgementReceipt,
  updateReceiptStatus: updateAcknowledgementReceiptStatus,
};

type AcknowledgementReceiptStoreState = {
  isLoading: boolean;
  lastSyncedAt: number;
  receipts: AcknowledgementReceiptRecord[];
  updateReceiptStatus: (receipt: AcknowledgementReceiptRecord, status: AcknowledgementReceiptStatus) => void;
};

export type AcknowledgementReceiptModuleConfig<TReceipt = Parameters<typeof mapApiAcknowledgementReceipt>[0]> = {
  api?: AcknowledgementReceiptApi<TReceipt>;
  copyFromRecords?: AcknowledgementReceiptCopyFromRecord[];
  receiptLabel?: string;
  storageKey?: string;
};

export function useAcknowledgementReceiptStore<
  TSelected = AcknowledgementReceiptStoreState,
  TReceipt = Parameters<typeof mapApiAcknowledgementReceipt>[0],
>(selector?: (state: AcknowledgementReceiptStoreState) => TSelected, config: AcknowledgementReceiptModuleConfig<TReceipt> = {}) {
  const receiptLabel = config.receiptLabel ?? "Acknowledgement receipt";
  const api = (config.api ?? DefaultAcknowledgementReceiptApi) as AcknowledgementReceiptApi<TReceipt>;
  const [receipts, setReceipts] = useState<AcknowledgementReceiptRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());

  useEffect(() => {
    let isMounted = true;

    api
      .fetchReceipts()
      .then((data) => {
        if (!isMounted) return;
        setReceipts(data.receipts.map(api.mapApiReceipt));
        setLastSyncedAt(Date.now());
      })
      .catch(() => {
        if (isMounted) {
          toast.error(`Could not load ${receiptLabel.toLowerCase()} records from the backend.`);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [api, receiptLabel]);

  const updateReceiptStatus = useCallback(
    (receipt: AcknowledgementReceiptRecord, status: AcknowledgementReceiptStatus) => {
      api
        .updateReceiptStatus({ recordId: receipt.id, status })
        .then((updatedReceipt) => {
          setReceipts((currentReceipts) =>
            currentReceipts.map((currentReceipt) => (currentReceipt.id === receipt.id ? updatedReceipt : currentReceipt)),
          );
          setLastSyncedAt(Date.now());
          toast.success(`${receiptLabel} marked as ${status}.`);
        })
        .catch(() => {
          toast.error(`Could not update ${receiptLabel.toLowerCase()} status.`);
        });
    },
    [api, receiptLabel],
  );

  const state = useMemo<AcknowledgementReceiptStoreState>(
    () => ({
      isLoading,
      lastSyncedAt,
      receipts,
      updateReceiptStatus,
    }),
    [isLoading, lastSyncedAt, receipts, updateReceiptStatus],
  );

  return selector ? selector(state) : (state as TSelected);
}

export function useAcknowledgementReceiptActionForm<TReceipt = Parameters<typeof mapApiAcknowledgementReceipt>[0]>(
  mode: AcknowledgementReceiptActionMode,
  recordId?: string,
  onSaved?: (record: AcknowledgementReceiptRecord) => void,
  config: AcknowledgementReceiptModuleConfig<TReceipt> = {},
) {
  const receiptLabel = config.receiptLabel ?? "Acknowledgement receipt";
  const api = (config.api ?? DefaultAcknowledgementReceiptApi) as AcknowledgementReceiptApi<TReceipt>;
  const [isNotFound, setIsNotFound] = useState(mode !== "add" && !recordId);
  const [entryView, setEntryView] = useState<AcknowledgementReceiptEntryView>("collection");
  const [loadedRecord, setLoadedRecord] = useState<AcknowledgementReceiptRecord | null>(null);
  const [values, setValues] = useState<AcknowledgementReceiptFormValues>(() => createAcknowledgementReceiptFormValues());

  useEffect(() => {
    if (mode !== "add") return;
    let isMounted = true;
    fetchAcknowledgementReceiptNumberSuggestion()
      .then((suggestion) => {
        if (isMounted) {
          setValues((current) => (current.receiptNo ? current : { ...current, receiptNo: suggestion.transactionNo }));
        }
      })
      .catch(() => {
        if (isMounted) toast.error("Could not load the acknowledgement receipt number.");
      });
    return () => {
      isMounted = false;
    };
  }, [mode]);

  useEffect(() => {
    if (mode === "add" || !recordId) {
      return;
    }

    let isMounted = true;

    api
      .fetchReceipt(recordId)
      .then((record) => {
        if (!isMounted) return;
        setIsNotFound(false);
        setLoadedRecord(record);
        setValues(createAcknowledgementReceiptFormValuesFromRecord(record));
      })
      .catch(() => {
        if (isMounted) {
          setIsNotFound(true);
          toast.error(`Could not load ${receiptLabel}.`);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [api, mode, receiptLabel, recordId]);

  function updateField<Key extends keyof AcknowledgementReceiptFormValues>(key: Key, value: AcknowledgementReceiptFormValues[Key]) {
    setValues((current) => {
      const nextValues = { ...current, [key]: value };

      if (key === "partyCode" || key === "customerName") {
        return syncAcknowledgementReceiptPartyDetails(nextValues);
      }

      return isCheckDetailField(key) ? syncAcknowledgementReceiptCheckDetails(nextValues) : nextValues;
    });
  }

  function updateLineEntries(lineEntries: AcknowledgementReceiptLineEntry[]) {
    setValues((current) => syncAcknowledgementReceiptCheckDetails({ ...current, lineEntries }));
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

    const availableCopyRecords = config.copyFromRecords ?? AcknowledgementReceiptCopyFromRecords;
    const selectedRecords = availableCopyRecords.filter((record) => recordIds.includes(record.id));

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
    const syncedValues = syncAcknowledgementReceiptCheckDetails(values);
    const validation = validateAcknowledgementReceiptForm(syncedValues);

    if (!validation.isValid) {
      toast.error(validation.message ?? "Review the acknowledgement receipt details.");
      return;
    }

    const saveRequest =
      mode === "edit" && loadedRecord
        ? api.updateReceipt({
            ...loadedRecord,
            formValues: syncedValues,
          })
        : api.createReceipt(syncedValues);

    saveRequest
      .then((nextRecord) => {
        setLoadedRecord(nextRecord);
        toast.success(mode === "edit" ? `${receiptLabel} updated.` : `${receiptLabel} saved.`);
        onSaved?.(nextRecord);
      })
      .catch(() => {
        toast.error(`Could not save ${receiptLabel}.`);
      });
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

function isCheckDetailField(key: keyof AcknowledgementReceiptFormValues) {
  return key === "bankName" || key === "checkDate" || key === "checkNo";
}

function syncAcknowledgementReceiptPartyDetails(values: AcknowledgementReceiptFormValues): AcknowledgementReceiptFormValues {
  return {
    ...values,
    lineEntries: values.lineEntries.map((entry) => ({
      ...entry,
      customerName: values.customerName,
      partyCode: values.partyCode,
      partyName: values.customerName,
    })),
  };
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
