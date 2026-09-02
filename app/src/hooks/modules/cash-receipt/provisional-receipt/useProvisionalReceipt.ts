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
  applyCopyFromRecordsToProvisionalReceiptForm,
  createBlankProvisionalReceiptLineEntry,
  createProvisionalReceiptFormValuesFromRecord,
  createProvisionalReceiptFormValues,
  ProvisionalReceiptCopyFromRecords,
  syncProvisionalReceiptCheckDetails,
} from "@/app/src/data/modules/cash-receipt/provisional-receipt/ProvisionalReceiptData";
import { ProvisionalReceiptStatusFilters } from "@/app/src/constants/modules/cash-receipt/provisional-receipt/ProvisionalReceiptConstants";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  ProvisionalReceiptActionMode,
  ProvisionalReceiptCopyFromRecord,
  ProvisionalReceiptEntryView,
  ProvisionalReceiptFormValues,
  ProvisionalReceiptLineEntry,
  ProvisionalReceiptRecord,
  ProvisionalReceiptStatus,
} from "@/app/src/types/modules/cash-receipt/provisional-receipt/ProvisionalReceiptTypes";
import { validateProvisionalReceiptForm } from "@/app/src/validations/modules/cash-receipt/provisional-receipt/ProvisionalReceiptValidation";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import {
  createProvisionalReceipt,
  fetchProvisionalReceipt,
  fetchProvisionalReceiptNumberSuggestion,
  fetchProvisionalReceipts,
  mapApiProvisionalReceipt,
  updateProvisionalReceipt,
  updateProvisionalReceiptStatus,
} from "@/app/src/services/modules/cash-receipt/provisional-receipt/ProvisionalReceiptApi";

type ProvisionalReceiptListResponse<TReceipt> = {
  receipts: TReceipt[];
};

type ProvisionalReceiptListQuery = Parameters<typeof fetchProvisionalReceipts>[0];

type ProvisionalReceiptApi<TReceipt = Parameters<typeof mapApiProvisionalReceipt>[0]> = {
  createReceipt: typeof createProvisionalReceipt;
  fetchReceipt: typeof fetchProvisionalReceipt;
  fetchReceipts: (query?: ProvisionalReceiptListQuery) => Promise<ProvisionalReceiptListResponse<TReceipt>>;
  mapApiReceipt: (receipt: TReceipt) => ProvisionalReceiptRecord;
  updateReceipt: typeof updateProvisionalReceipt;
  updateReceiptStatus: typeof updateProvisionalReceiptStatus;
};

const DefaultProvisionalReceiptApi: ProvisionalReceiptApi = {
  createReceipt: createProvisionalReceipt,
  fetchReceipt: fetchProvisionalReceipt,
  fetchReceipts: fetchProvisionalReceipts,
  mapApiReceipt: mapApiProvisionalReceipt,
  updateReceipt: updateProvisionalReceipt,
  updateReceiptStatus: updateProvisionalReceiptStatus,
};

type ProvisionalReceiptStoreState = {
  isLoading: boolean;
  lastSyncedAt: number;
  receipts: ProvisionalReceiptRecord[];
  updateReceiptStatus: (receipt: ProvisionalReceiptRecord, status: ProvisionalReceiptStatus) => void;
};

export type ProvisionalReceiptModuleConfig<TReceipt = Parameters<typeof mapApiProvisionalReceipt>[0]> = {
  api?: ProvisionalReceiptApi<TReceipt>;
  copyFromRecords?: ProvisionalReceiptCopyFromRecord[];
  receiptLabel?: string;
  storageKey?: string;
};

export function useProvisionalReceiptStore<
  TSelected = ProvisionalReceiptStoreState,
  TReceipt = Parameters<typeof mapApiProvisionalReceipt>[0],
>(selector?: (state: ProvisionalReceiptStoreState) => TSelected, config: ProvisionalReceiptModuleConfig<TReceipt> = {}) {
  const receiptLabel = config.receiptLabel ?? "Provisional receipt";
  const api = (config.api ?? DefaultProvisionalReceiptApi) as ProvisionalReceiptApi<TReceipt>;
  const [receipts, setReceipts] = useState<ProvisionalReceiptRecord[]>([]);
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
    (receipt: ProvisionalReceiptRecord, status: ProvisionalReceiptStatus) => {
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

  const state = useMemo<ProvisionalReceiptStoreState>(
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

export function useProvisionalReceiptActionForm<TReceipt = Parameters<typeof mapApiProvisionalReceipt>[0]>(
  mode: ProvisionalReceiptActionMode,
  recordId?: string,
  onSaved?: (record: ProvisionalReceiptRecord) => void,
  config: ProvisionalReceiptModuleConfig<TReceipt> = {},
) {
  const receiptLabel = config.receiptLabel ?? "Provisional receipt";
  const api = (config.api ?? DefaultProvisionalReceiptApi) as ProvisionalReceiptApi<TReceipt>;
  const [isNotFound, setIsNotFound] = useState(mode !== "add" && !recordId);
  const [entryView, setEntryView] = useState<ProvisionalReceiptEntryView>("collection");
  const [loadedRecord, setLoadedRecord] = useState<ProvisionalReceiptRecord | null>(null);
  const [values, setValues] = useState<ProvisionalReceiptFormValues>(() => createProvisionalReceiptFormValues());

  useEffect(() => {
    if (mode !== "add") return;
    let isMounted = true;
    fetchProvisionalReceiptNumberSuggestion()
      .then((suggestion) => {
        if (isMounted) {
          setValues((current) => (current.receiptNo ? current : { ...current, receiptNo: suggestion.transactionNo }));
        }
      })
      .catch(() => {
        if (isMounted) toast.error("Could not load the provisional receipt number.");
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
        setValues(createProvisionalReceiptFormValuesFromRecord(record));
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

  function updateField<Key extends keyof ProvisionalReceiptFormValues>(key: Key, value: ProvisionalReceiptFormValues[Key]) {
    setValues((current) => {
      const nextValues = { ...current, [key]: value };

      if (key === "partyCode" || key === "customerName") {
        return syncProvisionalReceiptPartyDetails(nextValues);
      }

      return isCheckDetailField(key) ? syncProvisionalReceiptCheckDetails(nextValues) : nextValues;
    });
  }

  function updateLineEntries(lineEntries: ProvisionalReceiptLineEntry[]) {
    setValues((current) => syncProvisionalReceiptCheckDetails({ ...current, lineEntries }));
  }

  function updateFirstLineEntry(updates: Partial<ProvisionalReceiptLineEntry>) {
    setValues((current) => {
      const firstLineEntry = current.lineEntries[0] ?? createBlankProvisionalReceiptLineEntry();
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

    const availableCopyRecords = config.copyFromRecords ?? ProvisionalReceiptCopyFromRecords;
    const selectedRecords = availableCopyRecords.filter((record) => recordIds.includes(record.id));

    if (selectedRecords.length > 0) {
      setValues((current) => applyCopyFromRecordsToProvisionalReceiptForm(current, selectedRecords));
    } else {
      setValues((current) => ({
        ...current,
        referenceNo: recordIds.join(", "),
        lineEntries: current.lineEntries.length ? current.lineEntries : [createBlankProvisionalReceiptLineEntry()],
      }));
    }
    toast.success("Copied receipt source details.");
  }

  function submitReceipt() {
    const syncedValues = syncProvisionalReceiptCheckDetails(values);
    const validation = validateProvisionalReceiptForm(syncedValues);

    if (!validation.isValid) {
      toast.error(validation.message ?? "Review the provisional receipt details.");
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

function isCheckDetailField(key: keyof ProvisionalReceiptFormValues) {
  return key === "bankName" || key === "checkDate" || key === "checkNo";
}

function syncProvisionalReceiptPartyDetails(values: ProvisionalReceiptFormValues): ProvisionalReceiptFormValues {
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

export function useProvisionalReceiptTable(receipts: ProvisionalReceiptRecord[]) {
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
  const [statusFilter, setStatusFilterState] = useState<(typeof ProvisionalReceiptStatusFilters)[number]>("all");
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
  const columns = useMemo<ColumnDef<ProvisionalReceiptRecord>[]>(
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

  function setStatusFilter(value: (typeof ProvisionalReceiptStatusFilters)[number]) {
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
