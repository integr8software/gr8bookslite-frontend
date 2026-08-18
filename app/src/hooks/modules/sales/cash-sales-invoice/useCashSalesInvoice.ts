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
  CashSalesInvoiceStatusFilters,
} from "@/app/src/constants/modules/sales/cash-sales-invoice/CashSalesInvoiceConstants";
import {
  calculateCashSalesInvoiceTotals,
  createCashSalesInvoiceAccountingEntries,
  createCashSalesInvoiceFormValues,
  createCashSalesInvoiceFormValuesFromRecord,
  createCashSalesInvoiceRecordFromForm,
  getInitialCashSalesInvoices,
  writeStoredCashSalesInvoices,
} from "@/app/src/data/modules/sales/cash-sales-invoice/CashSalesInvoiceData";
import type {
  CashSalesInvoiceAccountingEntry,
  CashSalesInvoiceActionMode,
  CashSalesInvoiceFormValues,
  CashSalesInvoiceLineEntry,
  CashSalesInvoiceRecord,
  CashSalesInvoiceStatus,
} from "@/app/src/types/modules/sales/cash-sales-invoice/CashSalesInvoiceTypes";
import { validateCashSalesInvoiceForm } from "@/app/src/validations/modules/sales/cash-sales-invoice/CashSalesInvoiceValidation";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

type CashSalesInvoiceStoreState = {
  invoices: CashSalesInvoiceRecord[];
  lastSyncedAt: number;
  updateInvoiceStatus: (
    invoice: CashSalesInvoiceRecord,
    status: CashSalesInvoiceStatus,
  ) => void;
};

export function useCashSalesInvoiceStore<TSelected = CashSalesInvoiceStoreState>(
  selector?: (state: CashSalesInvoiceStoreState) => TSelected,
) {
  const [invoices, setInvoices] = useState(getInitialCashSalesInvoices);
  const [lastSyncedAt] = useState(() => Date.now());

  function updateInvoiceStatus(
    invoice: CashSalesInvoiceRecord,
    status: CashSalesInvoiceStatus,
  ) {
    setInvoices((currentInvoices) =>
      persistCashSalesInvoices(
        currentInvoices.map((currentInvoice) =>
          currentInvoice.id === invoice.id
            ? {
                ...currentInvoice,
                formValues: currentInvoice.formValues
                  ? { ...currentInvoice.formValues, status }
                  : currentInvoice.formValues,
                status,
              }
            : currentInvoice,
        ),
      ),
    );
    toast.success(`Cash sales invoice marked as ${status}.`);
  }

  const state = useMemo<CashSalesInvoiceStoreState>(
    () => ({ invoices, lastSyncedAt, updateInvoiceStatus }),
    [invoices, lastSyncedAt],
  );

  return selector ? selector(state) : (state as TSelected);
}

export function useCashSalesInvoiceActionForm(
  mode: CashSalesInvoiceActionMode,
  recordId?: string,
  onSaved?: (record: CashSalesInvoiceRecord) => void,
) {
  const initialRecord =
    mode === "add"
      ? null
      : getInitialCashSalesInvoices().find((invoice) => invoice.id === recordId) ?? null;
  const [loadedRecord, setLoadedRecord] = useState<CashSalesInvoiceRecord | null>(
    initialRecord,
  );
  const [values, setValues] = useState<CashSalesInvoiceFormValues>(() =>
    initialRecord
      ? createCashSalesInvoiceFormValuesFromRecord(initialRecord)
      : createCashSalesInvoiceFormValues(),
  );

  function updateField<Key extends keyof CashSalesInvoiceFormValues>(
    key: Key,
    value: CashSalesInvoiceFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateLineEntries(lineEntries: CashSalesInvoiceLineEntry[]) {
    setValues((current) => ({
      ...current,
      ...calculateHeaderAmounts(lineEntries),
      accountingEntries: createCashSalesInvoiceAccountingEntries({
        defaultAccount: current.defaultAccount,
        lineEntries,
      }),
      lineEntries,
    }));
  }

  function updateAccountingEntries(accountingEntries: CashSalesInvoiceAccountingEntry[]) {
    setValues((current) => ({ ...current, accountingEntries }));
  }

  function submitInvoice() {
    const validation = validateCashSalesInvoiceForm(values);

    if (!validation.isValid) {
      toast.error(validation.message ?? "Review the cash sales invoice details.");
      return;
    }

    const nextRecord = createCashSalesInvoiceRecordFromForm(
      values,
      mode === "edit" ? loadedRecord ?? undefined : undefined,
    );
    const nextInvoices = upsertCashSalesInvoiceRecord(nextRecord);

    writeStoredCashSalesInvoices(nextInvoices);
    setLoadedRecord(nextRecord);
    toast.success(
      mode === "edit"
        ? "Cash sales invoice updated."
        : "Cash sales invoice saved.",
    );
    onSaved?.(nextRecord);
  }

  return {
    isRecordMissing: mode !== "add" && !initialRecord,
    submitInvoice,
    updateAccountingEntries,
    updateField,
    updateLineEntries,
    values,
  };
}

export function useCashSalesInvoiceTable(invoices: CashSalesInvoiceRecord[]) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [query, setQueryState] = useState("");
  const [dateRange, setDateRangeState] = useState<DateRangeValue>({ from: "", to: "" });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "documentDate", desc: true },
  ]);
  const [statusFilter, setStatusFilterState] = useState<
    (typeof CashSalesInvoiceStatusFilters)[number]
  >("all");
  const deferredQuery = useDeferredValue(query);
  const filteredRows = useMemo(
    () =>
      invoices.filter((invoice) => {
        const searchable = [
          invoice.transactionNo,
          invoice.customerCode,
          invoice.customerName,
          invoice.sjNo,
        ]
          .join(" ")
          .toLowerCase();

        return (
          searchable.includes(deferredQuery.toLowerCase()) &&
          (statusFilter === "all" || invoice.status === statusFilter) &&
          isDateInRange(invoice.documentDate, dateRange)
        );
      }),
    [dateRange, deferredQuery, invoices, statusFilter],
  );
  const columns = useMemo<ColumnDef<CashSalesInvoiceRecord>[]>(
    () => [
      createColumn("transactionNo", "CSI No.", "w-[12rem]"),
      createColumn("documentDate", "CSI Date", "w-[10rem]"),
      createColumn("customerName", "Party Name", "w-[18rem]"),
      createColumn("sjNo", "SJ No.", "w-[12rem]"),
      createColumn("status", "Status", "w-[10rem]"),
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

  function setStatusFilter(value: (typeof CashSalesInvoiceStatusFilters)[number]) {
    setStatusFilterState(value);
    table.setPageIndex(0);
  }

  function setDateRange(value: DateRangeValue) {
    setDateRangeState(value);
    table.setPageIndex(0);
  }

  function resetFilters() {
    setQueryState("");
    setDateRangeState({ from: "", to: "" });
    setStatusFilterState("all");
    table.setPageIndex(0);
  }

  return {
    dateRange,
    query,
    resetFilters,
    setDateRange,
    setQuery,
    setStatusFilter,
    statusFilter,
    table,
  };
}

function calculateHeaderAmounts(lineEntries: CashSalesInvoiceLineEntry[]) {
  const totals = calculateCashSalesInvoiceTotals(lineEntries);

  return {
    discountAmount: totals.discountAmount.toFixed(2),
    ewtAmount: totals.ewtAmount.toFixed(2),
    grossAmount: totals.grossAmount.toFixed(2),
    netAmount: totals.netAmount.toFixed(2),
    vatAmount: totals.vatAmount.toFixed(2),
  };
}

function persistCashSalesInvoices(invoices: CashSalesInvoiceRecord[]) {
  writeStoredCashSalesInvoices(invoices);
  return invoices;
}

function upsertCashSalesInvoiceRecord(record: CashSalesInvoiceRecord) {
  const currentInvoices = getInitialCashSalesInvoices();
  const existingIndex = currentInvoices.findIndex((invoice) => invoice.id === record.id);

  if (existingIndex === -1) {
    return persistCashSalesInvoices([record, ...currentInvoices]);
  }

  return persistCashSalesInvoices(
    currentInvoices.map((invoice) => (invoice.id === record.id ? record : invoice)),
  );
}

function isDateInRange(value: string, range: DateRangeValue) {
  if (!range.from && !range.to) return true;

  const dateTime = new Date(value).setHours(0, 0, 0, 0);
  const fromTime = range.from ? new Date(range.from).setHours(0, 0, 0, 0) : null;
  const toTime = range.to ? new Date(range.to).setHours(0, 0, 0, 0) : null;

  return !(
    (fromTime !== null && dateTime < fromTime) ||
    (toTime !== null && dateTime > toTime)
  );
}

function createColumn(
  key: keyof CashSalesInvoiceRecord,
  header: string,
  className: string,
): ColumnDef<CashSalesInvoiceRecord> {
  return {
    accessorKey: key,
    header,
    sortingFn: key === "documentDate" ? "datetime" : "alphanumeric",
    meta: { className },
  };
}
