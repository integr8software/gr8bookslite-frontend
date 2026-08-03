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
  createDeliveryReceiptFormValuesFromRecord,
  getInitialDeliveryReceipts,
} from "@/app/src/data/modules/inventory/delivery-receipt/DeliveryReceiptData";
import {
  createBlankSalesInvoiceLineItem,
  createSalesInvoiceFormValues,
  createSalesInvoiceFormValuesFromRecord,
  createSalesInvoiceRecordFromForm,
} from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceFactories";
import {
  getInitialSalesInvoices,
  writeStoredSalesInvoices,
} from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceStorage";
import { SalesInvoiceStatusFilters } from "@/app/src/constants/modules/sales/sales-invoice/SalesInvoiceConstants";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  SalesInvoiceActionMode,
  SalesInvoiceFormValues,
  SalesInvoiceRecord,
  SalesInvoiceStatus,
} from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import { validateSalesInvoiceForm } from "@/app/src/validations/modules/sales/sales-invoice/SalesInvoiceValidation";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

type SalesInvoiceStoreState = {
  invoices: SalesInvoiceRecord[];
  isLoading: boolean;
  lastSyncedAt: number;
  updateInvoiceStatus: (invoice: SalesInvoiceRecord, status: SalesInvoiceStatus) => void;
};

export function useSalesInvoiceStore<TSelected = SalesInvoiceStoreState>(
  selector?: (state: SalesInvoiceStoreState) => TSelected,
) {
  const [invoices, setInvoices] = useState(getInitialSalesInvoices);
  const [lastSyncedAt] = useState(() => Date.now());
  const updateInvoiceStatus = useCallback(
    (invoice: SalesInvoiceRecord, status: SalesInvoiceStatus) => {
      setInvoices((currentInvoices) =>
        persistSalesInvoices(
          currentInvoices.map((currentInvoice) =>
            currentInvoice.id === invoice.id
              ? {
                  ...currentInvoice,
                  formValues: currentInvoice.formValues
                    ? {
                        ...currentInvoice.formValues,
                        status,
                      }
                    : currentInvoice.formValues,
                  status,
                }
              : currentInvoice,
          ),
        ),
      );
      toast.success(`Sales invoice marked as ${status}.`);
    },
    [],
  );

  const state = useMemo<SalesInvoiceStoreState>(
    () => ({
      invoices,
      isLoading: false,
      lastSyncedAt,
      updateInvoiceStatus,
    }),
    [invoices, lastSyncedAt, updateInvoiceStatus],
  );

  return selector ? selector(state) : (state as TSelected);
}

export function useSalesInvoiceActionForm(
  mode: SalesInvoiceActionMode,
  recordId?: string,
  onSaved?: (record: SalesInvoiceRecord) => void,
) {
  const initialRecord =
    mode === "add"
      ? null
      : (getInitialSalesInvoices().find((invoice) => invoice.id === recordId) ?? null);
  const [loadedRecord, setLoadedRecord] = useState<SalesInvoiceRecord | null>(initialRecord);
  const [values, setValues] = useState<SalesInvoiceFormValues>(() =>
    initialRecord
      ? createSalesInvoiceFormValuesFromRecord(initialRecord)
      : createSalesInvoiceFormValues(),
  );

  function updateField<Key extends keyof SalesInvoiceFormValues>(
    key: Key,
    value: SalesInvoiceFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function copyFromDeliveryReceipts(recordIds: string[]) {
    const selectedReceipts = getInitialDeliveryReceipts().filter((receipt) =>
      recordIds.includes(receipt.id),
    );

    if (selectedReceipts.length === 0) {
      toast.error("Select at least one delivery receipt to copy.");
      return;
    }

    const receiptValues = selectedReceipts.map(createDeliveryReceiptFormValuesFromRecord);
    const receiptLines = receiptValues.flatMap((receipt) =>
      receipt.lineEntries
        .filter(
          (lineEntry) =>
            lineEntry.itemCode.trim() ||
            lineEntry.name.trim() ||
            lineEntry.description.trim() ||
            lineEntry.particulars.trim(),
        )
        .map((lineEntry) => ({
          lineEntry,
          receiptNo: receipt.transactionNo,
        })),
    );
    const firstReceipt = receiptValues[0];
    const deliveryReceiptNos = receiptValues
      .map((receipt) => receipt.transactionNo)
      .filter(Boolean);
    const salesOrderNos = receiptValues.map((receipt) => receipt.soNo).filter(Boolean);
    const purchaseOrderNos = receiptValues.map((receipt) => receipt.poNo).filter(Boolean);

    setValues((current) => ({
      ...current,
      address: firstReceipt.address || current.address,
      billToCode: firstReceipt.billToCode || firstReceipt.vceCode || current.billToCode,
      billToName: firstReceipt.billToName || firstReceipt.vceName || current.billToName,
      branch: firstReceipt.branch || current.branch,
      contactNo: firstReceipt.contactNo || current.contactNo,
      currency: firstReceipt.currency || current.currency,
      drNo: joinUniqueValues(deliveryReceiptNos) || current.drNo,
      dueDate: firstReceipt.dueDate || current.dueDate,
      exchangeRate: firstReceipt.exchangeRate || current.exchangeRate,
      poNo: joinUniqueValues(purchaseOrderNos) || current.poNo,
      projectRef: firstReceipt.projectRef || current.projectRef,
      referenceNo:
        joinUniqueValues(deliveryReceiptNos) ||
        firstReceipt.soNo ||
        firstReceipt.poNo ||
        current.referenceNo,
      remarks: firstReceipt.remarks || current.remarks,
      soDate: firstReceipt.soDate || current.soDate,
      soNo: joinUniqueValues(salesOrderNos) || current.soNo,
      terms: firstReceipt.terms || current.terms,
      vceCode: firstReceipt.vceCode || current.vceCode,
      vceName: firstReceipt.vceName || current.vceName,
      lineItems:
        receiptLines.length > 0
          ? receiptLines.map(({ lineEntry, receiptNo }) =>
              createBlankSalesInvoiceLineItem({
                barcode: lineEntry.barcode,
                itemCode: lineEntry.itemCode,
                name: lineEntry.name || lineEntry.description,
                quantity: lineEntry.quantity,
                refNo: receiptNo,
                resCenter: lineEntry.responsibilityCenter,
                uom: lineEntry.uom,
              }),
            )
          : current.lineItems,
    }));
    toast.success("Delivery receipt copied to sales invoice. Add unit prices before saving.");
  }

  function submitInvoice() {
    const validation = validateSalesInvoiceForm(values);

    if (!validation.isValid) {
      toast.error(validation.message ?? "Review the sales invoice details.");
      return;
    }

    const nextRecord = createSalesInvoiceRecordFromForm(
      values,
      mode === "edit" ? (loadedRecord ?? undefined) : undefined,
    );
    const nextInvoices = upsertSalesInvoiceRecord(nextRecord);

    writeStoredSalesInvoices(nextInvoices);
    setLoadedRecord(nextRecord);
    toast.success(mode === "edit" ? "Sales invoice updated." : "Sales invoice saved.");
    onSaved?.(nextRecord);
  }

  return {
    copyFromDeliveryReceipts,
    submitInvoice,
    updateField,
    values,
  };
}

export function useSalesInvoiceTable(invoices: SalesInvoiceRecord[]) {
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
  const [sorting, setSorting] = useState<SortingState>([{ id: "invoiceDate", desc: true }]);
  const [statusFilter, setStatusFilterState] =
    useState<(typeof SalesInvoiceStatusFilters)[number]>("all");
  const deferredQuery = useDeferredValue(query);
  const filteredRows = useMemo(
    () =>
      invoices.filter((invoice) => {
        const searchable = [
          invoice.invoiceNo,
          invoice.referenceNo,
          invoice.customerName,
          invoice.status,
        ]
          .join(" ")
          .toLowerCase();

        return (
          searchable.includes(deferredQuery.toLowerCase()) &&
          (statusFilter === "all" || invoice.status === statusFilter) &&
          isDateInRange(invoice.invoiceDate, dateRange) &&
          isAmountInRange(invoice.amount, amountRange)
        );
      }),
    [amountRange, dateRange, deferredQuery, invoices, statusFilter],
  );
  const columns = useMemo<ColumnDef<SalesInvoiceRecord>[]>(
    () => [
      createColumn("invoiceNo", "Invoice No.", "w-[12rem]"),
      createColumn("invoiceDate", "Invoice Date", "w-[10rem]", "datetime"),
      createColumn("customerName", "Customer", "w-[18rem]"),
      createColumn("referenceNo", "Reference No.", "w-[12rem]"),
      createColumn("dueDate", "Due Date", "w-[10rem]", "datetime"),
      {
        id: "amount",
        accessorKey: "amount",
        header: "Amount",
        sortingFn: "basic",
        meta: { className: "w-[11rem]" },
      },
      createColumn("status", "Status", "w-[10rem]"),
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

  function setStatusFilter(value: (typeof SalesInvoiceStatusFilters)[number]) {
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

function createColumn(
  key: keyof SalesInvoiceRecord,
  header: string,
  className: string,
  sortingFn: "alphanumeric" | "datetime" = "alphanumeric",
): ColumnDef<SalesInvoiceRecord> {
  return {
    id: key,
    accessorKey: key,
    header,
    sortingFn,
    meta: { className },
  };
}

function persistSalesInvoices(invoices: SalesInvoiceRecord[]) {
  writeStoredSalesInvoices(invoices);

  return invoices;
}

function upsertSalesInvoiceRecord(record: SalesInvoiceRecord) {
  const currentInvoices = getInitialSalesInvoices();
  const existingIndex = currentInvoices.findIndex((invoice) => invoice.id === record.id);

  if (existingIndex === -1) {
    return persistSalesInvoices([record, ...currentInvoices]);
  }

  return persistSalesInvoices(
    currentInvoices.map((currentInvoice) =>
      currentInvoice.id === record.id ? record : currentInvoice,
    ),
  );
}

function joinUniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).join(", ");
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
