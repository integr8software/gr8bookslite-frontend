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
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import {
  createBlankGoodsReceiptLineEntry,
  createGoodsReceiptFormValues,
  createGoodsReceiptFormValuesFromRecord,
  createGoodsReceiptRecordFromForm,
  GoodsReceiptCopyRecords,
  getInitialGoodsReceipts,
  writeStoredGoodsReceipts,
} from "@/app/src/data/modules/inventory/goods-receipt/GoodsReceiptData";
import { GoodsReceiptStatusFilters } from "@/app/src/constants/modules/inventory/goods-receipt/GoodsReceiptConstants";
import type {
  GoodsReceiptActionMode,
  GoodsReceiptFormValues,
  GoodsReceiptLineEntry,
  GoodsReceiptRecord,
  GoodsReceiptStatus,
} from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import { validateGoodsReceiptForm } from "@/app/src/validations/modules/inventory/goods-receipt/GoodsReceiptValidation";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

type GoodsReceiptStoreState = {
  isLoading: boolean;
  receipts: GoodsReceiptRecord[];
  lastSyncedAt: number;
  updateReceiptStatus: (receipt: GoodsReceiptRecord, status: GoodsReceiptStatus) => void;
};

export function useGoodsReceiptStore<TSelected = GoodsReceiptStoreState>(
  selector?: (state: GoodsReceiptStoreState) => TSelected,
) {
  const [receipts, setReceipts] = useState(getInitialGoodsReceipts);
  const [lastSyncedAt] = useState(() => Date.now());
  const updateReceiptStatus = useCallback(
    (receipt: GoodsReceiptRecord, status: GoodsReceiptStatus) => {
      setReceipts((currentReceipts) =>
        persistGoodsReceipts(
          currentReceipts.map((currentReceipt) =>
            currentReceipt.id === receipt.id
              ? {
                  ...currentReceipt,
                  formValues: currentReceipt.formValues
                    ? { ...currentReceipt.formValues, status }
                    : currentReceipt.formValues,
                  status,
                }
              : currentReceipt,
          ),
        ),
      );
      toast.success(`Goods receipt marked as ${status}.`);
    },
    [],
  );
  const state = useMemo<GoodsReceiptStoreState>(
    () => ({ isLoading: false, receipts, lastSyncedAt, updateReceiptStatus }),
    [receipts, lastSyncedAt, updateReceiptStatus],
  );

  return selector ? selector(state) : (state as TSelected);
}

export function useGoodsReceiptActionForm(
  mode: GoodsReceiptActionMode,
  recordId?: string,
  onSaved?: (record: GoodsReceiptRecord) => void,
) {
  const initialRecord =
    mode === "add"
      ? null
      : (getInitialGoodsReceipts().find((receipt) => receipt.id === recordId) ?? null);
  const [loadedRecord, setLoadedRecord] = useState<GoodsReceiptRecord | null>(initialRecord);
  const [values, setValues] = useState<GoodsReceiptFormValues>(() =>
    initialRecord
      ? createGoodsReceiptFormValuesFromRecord(initialRecord)
      : createGoodsReceiptFormValues(),
  );

  function updateField<Key extends keyof GoodsReceiptFormValues>(
    key: Key,
    value: GoodsReceiptFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateLineEntries(lineEntries: GoodsReceiptLineEntry[]) {
    setValues((current) => ({ ...current, lineEntries }));
  }

  function copyFromSourceRecords(recordIds: string[]) {
    const selectedRecords = GoodsReceiptCopyRecords.filter((record) =>
      recordIds.includes(record.id),
    );

    if (selectedRecords.length === 0) {
      toast.error("Select at least one source transaction to copy.");
      return;
    }

    const firstRecord = selectedRecords[0];

    if (!firstRecord) {
      toast.error("Select at least one source transaction to copy.");
      return;
    }

    setValues((current) => ({
      ...current,
      documentDate: firstRecord.documentDate || current.documentDate,
      giNo: firstRecord.source === "Goods Issue" ? firstRecord.sourceNo : current.giNo,
      icNo: firstRecord.source === "Inventory Count" ? firstRecord.sourceNo : current.icNo,
      receivingWarehouse: firstRecord.warehouse || current.receivingWarehouse,
      siRef: firstRecord.source === "Sales Invoice" ? firstRecord.sourceNo : current.siRef,
      transactionType:
        firstRecord.source === "Goods Issue"
          ? "Goods Issue Return"
          : firstRecord.source === "Sales Invoice"
            ? "Sales Return"
            : firstRecord.source === "Inventory Count"
              ? "Variance"
              : current.transactionType,
      vceCode: firstRecord.partyCode,
      vceName: firstRecord.partyName,
      lineEntries: selectedRecords.map((record) =>
        createBlankGoodsReceiptLineEntry({
          amount: record.amount,
          itemCategory: record.itemCategory,
          itemCode: record.itemCode,
          itemName: record.itemName,
          receivedQuantity: record.receivedQuantity,
          referenceNo: record.sourceNo,
          uom: record.uom,
          unitCost: record.amount,
        }),
      ),
    }));
    toast.success("Source transaction copied to goods receipt.");
  }

  function submitReceipt() {
    const validation = validateGoodsReceiptForm(values);

    if (!validation.isValid) {
      toast.error(validation.message ?? "Review the goods receipt details.");
      return;
    }

    const nextRecord = createGoodsReceiptRecordFromForm(
      values,
      mode === "edit" ? (loadedRecord ?? undefined) : undefined,
    );
    const nextReceipts = upsertGoodsReceiptRecord(nextRecord);

    writeStoredGoodsReceipts(nextReceipts);
    setLoadedRecord(nextRecord);
    toast.success(mode === "edit" ? "Goods receipt updated." : "Goods receipt saved.");
    onSaved?.(nextRecord);
  }

  return {
    copyFromSourceRecords,
    isRecordMissing: mode !== "add" && !initialRecord,
    submitReceipt,
    updateField,
    updateLineEntries,
    values,
  };
}

export function useGoodsReceiptTable(receipts: GoodsReceiptRecord[]) {
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
  const [sorting, setSorting] = useState<SortingState>([{ id: "documentDate", desc: true }]);
  const [statusFilter, setStatusFilterState] =
    useState<(typeof GoodsReceiptStatusFilters)[number]>("all");
  const deferredQuery = useDeferredValue(query);
  const filteredRows = useMemo(
    () =>
      receipts.filter((receipt) => {
        const searchable = [
          receipt.transactionNo,
          receipt.transactionType,
          receipt.referenceNo,
          receipt.vceName,
        ]
          .join(" ")
          .toLowerCase();

        return (
          searchable.includes(deferredQuery.toLowerCase()) &&
          (statusFilter === "all" || receipt.status === statusFilter) &&
          isDateInRange(receipt.documentDate, dateRange) &&
          isAmountInRange(receipt.totalAmount, amountRange)
        );
      }),
    [amountRange, dateRange, deferredQuery, receipts, statusFilter],
  );
  const columns = useMemo<ColumnDef<GoodsReceiptRecord>[]>(
    () => [
      {
        id: "transactionNo",
        accessorKey: "transactionNo",
        header: "GR No.",
        sortingFn: "alphanumeric",
        meta: { className: "w-[12rem]" },
      },
      {
        id: "documentDate",
        accessorKey: "documentDate",
        header: "Document Date",
        sortingFn: "datetime",
        meta: { className: "w-[10rem]" },
      },
      {
        id: "transactionType",
        accessorKey: "transactionType",
        header: "Transaction Type",
        sortingFn: "alphanumeric",
        meta: { className: "w-[16rem]" },
      },
      {
        id: "vceName",
        accessorKey: "vceName",
        header: "Party Name",
        sortingFn: "alphanumeric",
        meta: { className: "w-[16rem]" },
      },
      {
        id: "referenceNo",
        accessorKey: "referenceNo",
        header: "Reference No.",
        sortingFn: "alphanumeric",
        meta: { className: "w-[12rem]" },
      },
      {
        id: "totalAmount",
        accessorKey: "totalAmount",
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
        meta: { className: "w-[9rem] text-center" },
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { pagination, sorting },
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

  function setDateRange(value: DateRangeValue) {
    setDateRangeState(value);
    table.setPageIndex(0);
  }

  function setAmountRange(value: AmountRangeValue) {
    setAmountRangeState(value);
    table.setPageIndex(0);
  }

  function setStatusFilter(value: (typeof GoodsReceiptStatusFilters)[number]) {
    setStatusFilterState(value);
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

function persistGoodsReceipts(receipts: GoodsReceiptRecord[]) {
  writeStoredGoodsReceipts(receipts);

  return receipts;
}

function upsertGoodsReceiptRecord(record: GoodsReceiptRecord) {
  const currentReceipts = getInitialGoodsReceipts();
  const existingIndex = currentReceipts.findIndex((receipt) => receipt.id === record.id);

  if (existingIndex === -1) return persistGoodsReceipts([record, ...currentReceipts]);

  return persistGoodsReceipts(
    currentReceipts.map((receipt) => (receipt.id === record.id ? record : receipt)),
  );
}

function isAmountInRange(value: number, range: AmountRangeValue) {
  const fromAmount = range.from.trim() ? parseMoneyNumberInput(range.from) : 0;
  const toAmount = range.to.trim() ? parseMoneyNumberInput(range.to) : Number.MAX_SAFE_INTEGER;

  return value >= fromAmount && value <= toAmount;
}

function isDateInRange(value: string, range: DateRangeValue) {
  if (!range.from && !range.to) return true;

  const dateTime = new Date(value).setHours(0, 0, 0, 0);
  const fromTime = range.from ? new Date(range.from).setHours(0, 0, 0, 0) : null;
  const toTime = range.to ? new Date(range.to).setHours(0, 0, 0, 0) : null;

  return !((fromTime !== null && dateTime < fromTime) || (toTime !== null && dateTime > toTime));
}
