"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import {
  createBlankBillingInvoiceAccountEntry,
  createBlankBillingInvoiceLineEntry,
  BillingInvoicePartyOptions,
  BillingInvoiceResponsibilityCenterOptions,
  BillingInvoiceTermOptions,
  createBillingInvoiceAccountingEntries,
  createBillingInvoiceFormValues,
  createBillingInvoiceFormValuesFromRecord,
} from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import { useBillingMaintenanceOptions } from "@/app/src/hooks/modules/sales/shared/useBillingMaintenanceOptions";
import {
  BillingInvoiceStatusFilters,
  BillingInvoiceTableColumns,
} from "@/app/src/constants/modules/sales/billing-invoice/BillingInvoiceConstants";
import type {
  BillingInvoiceActionMode,
  BillingInvoiceFormValues,
  BillingInvoiceLineEntry,
  BillingInvoiceRecord,
  BillingInvoiceStatus,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import type { ItemSupplierRecord } from "@/app/src/types/modules/item-management/items/ItemManagementTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { validateBillingInvoiceForm } from "@/app/src/validations/modules/sales/billing-invoice/BillingInvoiceValidation";
import {
  createBillingInvoice,
  fetchBillingInvoice,
  fetchBillingInvoices,
  updateBillingInvoice,
} from "@/app/src/services/modules/sales/billing-invoice/BillingInvoiceApi";
import { fetchPartyOptions } from "@/app/src/services/modules/party-management/PartyManagementApi";
import { PartyManagementQueryKeys } from "@/app/src/services/modules/party-management/PartyManagementQueryKeys";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

type BillingInvoiceStoreState = {
  isLoading: boolean;
  invoices: BillingInvoiceRecord[];
  lastSyncedAt: number;
  updateInvoiceStatus: (invoice: BillingInvoiceRecord, status: BillingInvoiceStatus) => void;
};

export function useBillingInvoiceStore<TSelected = BillingInvoiceStoreState>(selector?: (state: BillingInvoiceStoreState) => TSelected) {
  const queryClient = useQueryClient();
  const invoicesQuery = useQuery({
    queryKey: ["billing-invoices"],
    queryFn: fetchBillingInvoices,
  });
  const [invoices, setInvoices] = useState<BillingInvoiceRecord[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());

  useEffect(() => {
    if (invoicesQuery.data) {
      setInvoices(invoicesQuery.data);
      setLastSyncedAt(Date.now());
    }
  }, [invoicesQuery.data]);

  const updateInvoiceStatus = useCallback((invoice: BillingInvoiceRecord, status: BillingInvoiceStatus) => {
    setInvoices((currentInvoices) =>
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
    );
    toast.success(`Billing invoice marked as ${status}.`);
  }, []);
  const state = useMemo<BillingInvoiceStoreState>(
    () => ({
      isLoading: invoicesQuery.isLoading,
      invoices: invoicesQuery.data ?? invoices,
      lastSyncedAt,
      updateInvoiceStatus,
    }),
    [invoicesQuery.isLoading, invoicesQuery.data, invoices, lastSyncedAt, updateInvoiceStatus],
  );

  return selector ? selector(state) : (state as TSelected);
}

export function useBillingInvoiceActionForm(
  mode: BillingInvoiceActionMode,
  recordId?: string,
  onSaved?: (record: BillingInvoiceRecord) => void,
) {
  const queryClient = useQueryClient();
  const isEditOrView = mode === "edit" || mode === "view";

  const recordQuery = useQuery({
    queryKey: ["billing-invoice", recordId],
    queryFn: () => fetchBillingInvoice(recordId!),
    enabled: isEditOrView && !!recordId,
    retry: false,
  });
  const customerPartyOptionsQuery = useQuery({
    queryFn: () => fetchPartyOptions("Customer"),
    queryKey: PartyManagementQueryKeys.customerOptions("sales-billing-invoice"),
    retry: false,
  });
  const customerPartyOptions = useMemo(
    () => (customerPartyOptionsQuery.data ? mapCustomerPartyOptions(customerPartyOptionsQuery.data) : BillingInvoicePartyOptions),
    [customerPartyOptionsQuery.data],
  );
  const { responsibilityCenterOptions, termOptions } = useBillingMaintenanceOptions({
    responsibilityCenterFallbackOptions: BillingInvoiceResponsibilityCenterOptions,
    termFallbackOptions: BillingInvoiceTermOptions,
  });

  const [loadedRecord, setLoadedRecord] = useState<BillingInvoiceRecord | null>(null);
  const [values, setValues] = useState<BillingInvoiceFormValues>(() => createBillingInvoiceFormValues());

  useEffect(() => {
    if (recordQuery.data) {
      setLoadedRecord(recordQuery.data);
      setValues(createBillingInvoiceFormValuesFromRecord(recordQuery.data));
    }
  }, [recordQuery.data]);

  function updateField<Key extends keyof BillingInvoiceFormValues>(key: Key, value: BillingInvoiceFormValues[Key]) {
    setValues((current) => {
      const nextValues = { ...current, [key]: value };

      if (key === "code" || key === "name" || key === "transactionNo" || key === "defaultAccount") {
        return {
          ...nextValues,
          accountEntries: createBillingInvoiceAccountingEntries(nextValues),
        };
      }

      return nextValues;
    });
  }

  function updateLineEntries(lineEntries: BillingInvoiceLineEntry[]) {
    setValues((current) => ({
      ...current,
      ...calculateHeaderAmounts(lineEntries),
      accountEntries: createBillingInvoiceAccountingEntries({
        code: current.code,
        defaultAccount: current.defaultAccount,
        lineEntries,
        name: current.name,
        transactionNo: current.transactionNo,
      }),
      lineEntries,
    }));
  }

  async function submitInvoice() {
    const firstDebitAccount = values.accountEntries.find((entry) => parseMoneyNumberInput(entry.debit) > 0);
    const valuesWithDefaultAccount = values.defaultAccount.trim()
      ? values
      : {
          ...values,
          defaultAccount: firstDebitAccount?.accountTitle || firstDebitAccount?.accountCode || "Accounts Receivable - Trade",
        };
    const validation = validateBillingInvoiceForm(valuesWithDefaultAccount);

    if (!validation.isValid) {
      toast.error(validation.message ?? "Review the billing invoice details.");
      return;
    }

    try {
      const nextRecord =
        mode === "edit" && recordId
          ? await updateBillingInvoice(recordId, valuesWithDefaultAccount)
          : await createBillingInvoice(valuesWithDefaultAccount);
      setLoadedRecord(nextRecord);
      void queryClient.invalidateQueries({ queryKey: ["billing-invoices"] });
      toast.success(mode === "edit" ? "Billing invoice updated successfully." : "Billing invoice saved to the database.");
      onSaved?.(nextRecord);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save billing invoice.");
    }
  }

  const isLoading = isEditOrView && recordQuery.isLoading;
  const isRecordMissing = isEditOrView && !recordQuery.isLoading && !recordQuery.data;

  return {
    isLoading,
    isRecordMissing,
    customerPartyOptions,
    responsibilityCenterOptions,
    termOptions,
    submitInvoice,
    updateField,
    updateLineEntries,
    values,
  };
}

function mapCustomerPartyOptions(parties: ItemSupplierRecord[]): AppAdvancedDropdownOption[] {
  return parties.map((party) => ({
    label: party.code,
    name: party.name,
    selectedDetails: party.code,
    value: party.name,
  }));
}

export function useBillingInvoiceTable(invoices: BillingInvoiceRecord[]) {
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
  const [statusFilter, setStatusFilterState] = useState<(typeof BillingInvoiceStatusFilters)[number]>("all");
  const deferredQuery = useDeferredValue(query);
  const filteredRows = useMemo(
    () =>
      invoices.filter((invoice) => {
        const searchable = [invoice.transactionNo, invoice.invoiceNo, invoice.customerCode, invoice.customerName, invoice.referenceNo]
          .join(" ")
          .toLowerCase();

        return (
          searchable.includes(deferredQuery.toLowerCase()) &&
          (statusFilter === "all" || invoice.status === statusFilter) &&
          isDateInRange(invoice.documentDate, dateRange) &&
          isAmountInRange(invoice.amount, amountRange)
        );
      }),
    [amountRange, dateRange, deferredQuery, invoices, statusFilter],
  );
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
  const table = useReactTable({
    data: filteredRows,
    columns: BillingInvoiceTableColumns,
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

  function setStatusFilter(value: (typeof BillingInvoiceStatusFilters)[number]) {
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

function calculateHeaderAmounts(lineEntries: BillingInvoiceLineEntry[]) {
  const totals = lineEntries.reduce(
    (summary, entry) => ({
      discountAmount: summary.discountAmount + parseMoneyNumberInput(entry.discountAmount),
      ewtAmount: summary.ewtAmount + parseMoneyNumberInput(entry.ewtAmount),
      grossAmount: summary.grossAmount + parseMoneyNumberInput(entry.grossAmount),
      netAmount: summary.netAmount + parseMoneyNumberInput(entry.netAmount),
      vatAmount: summary.vatAmount + parseMoneyNumberInput(entry.vatAmount),
      wvatAmount: summary.wvatAmount + parseMoneyNumberInput(entry.wvatAmount),
    }),
    {
      discountAmount: 0,
      ewtAmount: 0,
      grossAmount: 0,
      netAmount: 0,
      vatAmount: 0,
      wvatAmount: 0,
    },
  );

  return {
    discountAmount: totals.discountAmount.toFixed(2),
    ewtAmount: totals.ewtAmount.toFixed(2),
    grossAmount: totals.grossAmount.toFixed(2),
    netAmount: totals.netAmount.toFixed(2),
    vatAmount: totals.vatAmount.toFixed(2),
    wvatAmount: totals.wvatAmount.toFixed(2),
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

export { createBlankBillingInvoiceAccountEntry, createBlankBillingInvoiceLineEntry };
