"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnOrderState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import { ReceiptText } from "lucide-react";
import {
  calculateCashAdvanceMultipleEntryTotal,
  createBlankCashAdvanceMultipleEntryAccountingEntry,
  createBlankCashAdvanceMultipleEntryItem,
  createCashAdvanceMultipleEntryFormValues,
  createCashAdvanceMultipleEntryFormValuesFromRecord,
  createCashAdvanceMultipleEntryRecordFromForm,
  formatCashAdvanceMultipleEntryAmount,
  getInitialCashAdvanceMultipleEntries,
  writeStoredCashAdvanceMultipleEntries,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import {
  CashAdvanceMultipleEntryAllStatusFilter,
  CashAdvanceMultipleEntryDefaultColumnOrder,
  CashAdvanceMultipleEntryDefaultColumnVisibility,
  CashAdvanceMultipleEntryOverviewColumnWidths,
  CashAdvanceMultipleEntryStatusFilters,
  CashAdvanceMultipleEntryStatuses,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type {
  CashAdvanceMultipleEntryAccountingEntry,
  CashAdvanceMultipleEntryActionMode,
  CashAdvanceMultipleEntryFormValues,
  CashAdvanceMultipleEntryItem,
  CashAdvanceMultipleEntryRecord,
  CashAdvanceMultipleEntryStoreState,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import {
  validateCashAdvanceMultipleEntryAmountsWithinBalances,
  validateCashAdvanceMultipleEntryForm,
} from "@/app/src/validations/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryValidation";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";

export function useCashAdvanceMultipleEntryStore<TSelected = CashAdvanceMultipleEntryStoreState>(
  selector?: (state: CashAdvanceMultipleEntryStoreState) => TSelected,
) {
  const [entries, setEntries] = useState(getInitialCashAdvanceMultipleEntries);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());
  const refreshRecords = useCallback(() => {
    setEntries(getInitialCashAdvanceMultipleEntries());
    setLastSyncedAt(Date.now());
  }, []);
  const updateEntryStatus = useCallback((record: CashAdvanceMultipleEntryRecord, status: CashAdvanceStatus) => {
    const updatedAt = new Date().toISOString();

    setEntries((currentEntries) => {
      const nextEntries = currentEntries.map((currentRecord) =>
        currentRecord.id === record.id
          ? {
              ...currentRecord,
              formValues: currentRecord.formValues ? { ...currentRecord.formValues, status } : currentRecord.formValues,
              status,
              updatedAt,
              updatedBy: "Current User",
            }
          : currentRecord,
      );

      writeStoredCashAdvanceMultipleEntries(nextEntries);
      return nextEntries;
    });
    setLastSyncedAt(Date.now());
    toast.success(`Cash Advance Multiple Entry Marked as ${status}.`);
  }, []);
  const state = useMemo<CashAdvanceMultipleEntryStoreState>(
    () => ({
      entries,
      isLoading: false,
      lastSyncedAt,
      refreshRecords,
      updateEntryStatus,
    }),
    [entries, lastSyncedAt, refreshRecords, updateEntryStatus],
  );

  return selector ? selector(state) : (state as TSelected);
}

export function useCashAdvanceMultipleEntryActionForm(
  mode: CashAdvanceMultipleEntryActionMode,
  recordId?: string,
  onSaved?: (record: CashAdvanceMultipleEntryRecord) => void,
) {
  const transactionCurrency = useTransactionCurrency();
  const initialRecord = mode === "add" ? null : (getInitialCashAdvanceMultipleEntries().find((entry) => entry.id === recordId) ?? null);
  const [loadedRecord, setLoadedRecord] = useState<CashAdvanceMultipleEntryRecord | null>(initialRecord);
  const [values, setValues] = useState<CashAdvanceMultipleEntryFormValues>(() =>
    initialRecord
      ? createCashAdvanceMultipleEntryFormValuesFromRecord(initialRecord)
      : createCashAdvanceMultipleEntryFormValues(transactionCurrency.baseCurrencyCode),
  );
  const hasEditedCurrencyRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues] = useState(values);
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const draft = useModuleDraft({
    enabled: mode !== "view",
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:cash-advance-multiple-entry", recordId }),
    setValues,
    values,
  });

  useEffect(() => {
    if (mode !== "add" || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) {
      return;
    }

    setValues((current) => ({
      ...current,
      currency: transactionCurrency.baseCurrencyCode,
      exchangeRate: "1.00",
    }));
  }, [mode, transactionCurrency.baseCurrencyCode, transactionCurrency.isBaseCurrencyResolved]);

  function updateField<Key extends keyof CashAdvanceMultipleEntryFormValues>(key: Key, value: CashAdvanceMultipleEntryFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateItems(items: CashAdvanceMultipleEntryItem[]) {
    const totalAmount = formatCashAdvanceMultipleEntryAmount(calculateCashAdvanceMultipleEntryTotal(items));

    setValues((current) => ({ ...current, items, totalAmount }));
  }

  async function updateCurrency(currencyCode: string) {
    hasEditedCurrencyRef.current = true;
    updateField("currency", currencyCode);

    try {
      const exchangeRate = await transactionCurrency.loadExchangeRate(currencyCode);

      if (exchangeRate != null) {
        updateField("exchangeRate", formatLoadedExchangeRate(exchangeRate));
      }
    } catch {
      toast.error("Could not load the exchange rate for the selected currency.");
    }
  }

  function updateAccountingEntries(accountingEntries: CashAdvanceMultipleEntryAccountingEntry[]) {
    setValues((current) => ({ ...current, accountingEntries }));
  }

  function addItems(count: number) {
    updateItems([...values.items, ...createRows(count, createBlankCashAdvanceMultipleEntryItem)]);
  }

  function addAccountingEntries(count: number) {
    updateAccountingEntries([...values.accountingEntries, ...createRows(count, createBlankCashAdvanceMultipleEntryAccountingEntry)]);
  }

  function submitEntry(status: CashAdvanceStatus = CashAdvanceMultipleEntryStatuses.forApproval) {
    if (mode === "view" || isSubmittingRef.current) return false;
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return false;
    }
    const releaseSubmitLock = acquireModuleActionLock(
      `cash-disbursement:cash-advance-multiple-entry:submit:${mode}:${recordId ?? values.transNo}`,
    );
    if (!releaseSubmitLock) return false;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const nextValues = { ...values, status };
    const balanceValidation = validateCashAdvanceMultipleEntryAmountsWithinBalances(nextValues);
    const validation = !balanceValidation.isValid
      ? balanceValidation
      : status === CashAdvanceMultipleEntryStatuses.draft
        ? { isValid: true, message: null }
        : validateCashAdvanceMultipleEntryForm(nextValues);

    if (!validation.isValid) {
      toast.error(validation.message ?? "Review the cash advance multiple entry details.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }

    try {
      const nextRecord = createCashAdvanceMultipleEntryRecordFromForm(nextValues, mode === "edit" ? (loadedRecord ?? undefined) : undefined);
      const nextEntries = upsertCashAdvanceMultipleEntryRecord(nextRecord);
      writeStoredCashAdvanceMultipleEntries(nextEntries);
      setLoadedRecord(nextRecord);
      setValues(createCashAdvanceMultipleEntryFormValuesFromRecord(nextRecord));
      draft.clearDraft();
      toast.success(mode === "edit" ? "Cash Advance Multiple Entry Updated." : "Cash Advance Multiple Entry Saved.");
      onSaved?.(nextRecord);
      return true;
    } catch {
      toast.error("Could not save the cash advance multiple entry. Please try again.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }
  }

  function updateEntryStatus(status: CashAdvanceStatus) {
    if (!loadedRecord) {
      return;
    }
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:cash-advance-multiple-entry:status:${loadedRecord.id}:${status}`);
    if (!releaseActionLock) return;

    try {
      const updatedAt = new Date().toISOString();
      const nextValues = { ...values, status };
      const nextRecord: CashAdvanceMultipleEntryRecord = {
        ...loadedRecord,
        formValues: {
          ...nextValues,
          attachments: nextValues.attachments.map((attachment) => ({ ...attachment })),
        },
        status,
        updatedAt,
        updatedBy: "Current User",
      };
      const nextEntries = upsertCashAdvanceMultipleEntryRecord(nextRecord);
      writeStoredCashAdvanceMultipleEntries(nextEntries);
      setLoadedRecord(nextRecord);
      setValues(nextValues);
      toast.success(`Cash Advance Multiple Entry Marked as ${status}.`);
    } catch {
      toast.error("Could not update the cash advance multiple entry. Please try again.");
      releaseActionLock();
    }
  }

  return {
    discardDraft: draft.discardDraft,
    hasDiscardableChanges: isDirty,
    saveDraft: draft.saveDraft,
    addAccountingEntries,
    addItems,
    currencyOptions: transactionCurrency.currencyOptions,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isSubmitting,
    isRecordMissing: mode !== "add" && !initialRecord,
    record: loadedRecord,
    submitEntry,
    updateAccountingEntries,
    updateEntryStatus,
    updateField,
    updateCurrency,
    updateItems,
    values,
  };
}

export function useCashAdvanceMultipleEntryTable(records: CashAdvanceMultipleEntryRecord[]) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [query, setQueryState] = useState("");
  const [amountRange, setAmountRangeState] = useState<AmountRangeValue>({
    from: "",
    to: "",
  });
  const [dateRange, setDateRangeState] = useState<DateRangeValue>({
    from: "",
    to: "",
  });
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(CashAdvanceMultipleEntryDefaultColumnOrder);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(CashAdvanceMultipleEntryDefaultColumnVisibility);
  const [statusFilter, setStatusFilterState] = useState<(typeof CashAdvanceMultipleEntryStatusFilters)[number]>(
    CashAdvanceMultipleEntryAllStatusFilter,
  );
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      const matchesStatus = statusFilter === CashAdvanceMultipleEntryAllStatusFilter || record.status === statusFilter;
      const matchesDateRange =
        (!dateRange.from || record.documentDate >= dateRange.from) && (!dateRange.to || record.documentDate <= dateRange.to);
      const matchesAmountRange =
        (!amountRange.from || record.amount >= Number(amountRange.from)) && (!amountRange.to || record.amount <= Number(amountRange.to));
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          record.transNo,
          record.partyCode,
          record.partyName,
          record.accountCode,
          record.accountTitle,
          record.costCenter,
          record.remarks,
          record.createdBy,
          record.updatedBy,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesDateRange && matchesAmountRange && matchesQuery;
    });
  }, [amountRange, dateRange, query, records, statusFilter]);
  const columns = useMemo<ColumnDef<CashAdvanceMultipleEntryRecord>[]>(
    () => [
      {
        accessorKey: "transNo",
        id: "transNo",
        header: "Multiple Cash Advance No.",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.transactionNumber,
        meta: { label: "Multiple Cash Advance No." },
      },
      {
        accessorKey: "documentDate",
        id: "documentDate",
        header: "CAME Date",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.documentDate,
        meta: { label: "CAME Date" },
      },
      {
        accessorKey: "partyCode",
        id: "partyCode",
        header: "Party Code",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.partyCode,
        meta: { label: "Party Code" },
      },
      {
        accessorKey: "partyName",
        id: "partyName",
        header: "Party Name",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.partyName,
        meta: { label: "Party Name" },
      },
      {
        accessorKey: "accountCode",
        id: "accountCode",
        header: "Default Account Code",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.accountCode,
        meta: { label: "Default Account Code" },
      },
      {
        accessorKey: "accountTitle",
        id: "accountTitle",
        header: "Default Account Title",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.accountTitle,
        meta: { label: "Default Account Title" },
      },
      {
        accessorKey: "amount",
        id: "amount",
        header: "Total Amount",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.amount,
        meta: { label: "Total Amount" },
      },
      {
        accessorKey: "remarks",
        id: "remarks",
        header: "Remarks",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.remarks,
        meta: { label: "Remarks" },
      },
      {
        accessorKey: "createdBy",
        id: "createdBy",
        header: "Created By",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.auditUser,
        meta: { label: "Created By" },
      },
      {
        accessorKey: "createdAt",
        id: "createdAt",
        header: "Date Created",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.auditDate,
        sortingFn: "datetime",
        meta: { label: "Date Created" },
      },
      {
        accessorKey: "updatedBy",
        id: "updatedBy",
        header: "Updated By",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.auditUser,
        meta: { label: "Updated By" },
      },
      {
        accessorKey: "updatedAt",
        id: "updatedAt",
        header: "Date Modified",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.auditDate,
        sortingFn: "datetime",
        meta: { label: "Date Modified" },
      },
      {
        accessorKey: "status",
        id: "status",
        header: "Status",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.status,
        meta: { className: "text-center", label: "Status" },
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: "Actions",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.actions,
        meta: { className: "text-center", label: "Actions" },
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
  const table = useReactTable({
    columns,
    data: filteredRows,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      columnOrder: CashAdvanceMultipleEntryDefaultColumnOrder,
      columnVisibility: CashAdvanceMultipleEntryDefaultColumnVisibility,
    },
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: { columnOrder, columnVisibility, pagination, sorting },
  });

  function setAmountRange(value: AmountRangeValue) {
    setAmountRangeState(value);
    table.setPageIndex(0);
  }

  function setDateRange(value: DateRangeValue) {
    setDateRangeState(value);
    table.setPageIndex(0);
  }

  function setQuery(value: string) {
    setQueryState(value);
    table.setPageIndex(0);
  }

  const setStatusFilter = useCallback((value: (typeof CashAdvanceMultipleEntryStatusFilters)[number]) => {
    setStatusFilterState(value);
    table.setPageIndex(0);
  }, [table]);

  function resetFilters() {
    setAmountRangeState({ from: "", to: "" });
    setDateRangeState({ from: "", to: "" });
    setQueryState("");
    setStatusFilterState(CashAdvanceMultipleEntryAllStatusFilter);
    table.setPageIndex(0);
  }

  const statisticCards = useMemo<ModuleStatisticCardItem[]>(() => {
    const postedCount = records.filter((record) => record.status === CashAdvanceMultipleEntryStatuses.posted).length;
    const forApprovalCount = records.filter(
      (record) => record.status === CashAdvanceMultipleEntryStatuses.forApproval,
    ).length;
    const draftCount = records.filter((record) => record.status === CashAdvanceMultipleEntryStatuses.draft).length;
    const disapprovedCount = records.filter(
      (record) => record.status === CashAdvanceMultipleEntryStatuses.disapproved,
    ).length;
    const cancelledCount = records.filter((record) => record.status === CashAdvanceMultipleEntryStatuses.cancelled).length;

    return [
      {
        label: "Total Entries",
        value: records.length,
        summary: "All time",
        icon: ReceiptText,
        tone: "violet",
        isActive: statusFilter === CashAdvanceMultipleEntryAllStatusFilter,
        onClick: () => setStatusFilter(CashAdvanceMultipleEntryAllStatusFilter),
      },
      {
        label: CashAdvanceMultipleEntryStatuses.posted,
        value: postedCount,
        summary: formatPartOfTotalPercentage(postedCount, records.length),
        icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.posted),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.posted),
        tone: "emerald",
        isActive: statusFilter === CashAdvanceMultipleEntryStatuses.posted,
        onClick: () => setStatusFilter(CashAdvanceMultipleEntryStatuses.posted),
      },
      {
        label: CashAdvanceMultipleEntryStatuses.forApproval,
        value: forApprovalCount,
        summary: formatPartOfTotalPercentage(forApprovalCount, records.length),
        icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.forApproval),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.forApproval),
        tone: "amber",
        isActive: statusFilter === CashAdvanceMultipleEntryStatuses.forApproval,
        onClick: () => setStatusFilter(CashAdvanceMultipleEntryStatuses.forApproval),
      },
      {
        label: CashAdvanceMultipleEntryStatuses.draft,
        value: draftCount,
        summary: formatPartOfTotalPercentage(draftCount, records.length),
        icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.draft),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.draft),
        tone: "blue",
        isActive: statusFilter === CashAdvanceMultipleEntryStatuses.draft,
        onClick: () => setStatusFilter(CashAdvanceMultipleEntryStatuses.draft),
      },
      {
        label: CashAdvanceMultipleEntryStatuses.disapproved,
        value: disapprovedCount,
        summary: formatPartOfTotalPercentage(disapprovedCount, records.length),
        icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.disapproved),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.disapproved),
        tone: "red",
        isActive: statusFilter === CashAdvanceMultipleEntryStatuses.disapproved,
        onClick: () => setStatusFilter(CashAdvanceMultipleEntryStatuses.disapproved),
      },
      {
        label: CashAdvanceMultipleEntryStatuses.cancelled,
        value: cancelledCount,
        summary: formatPartOfTotalPercentage(cancelledCount, records.length),
        icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.cancelled),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.cancelled),
        tone: "slate",
        isActive: statusFilter === CashAdvanceMultipleEntryStatuses.cancelled,
        onClick: () => setStatusFilter(CashAdvanceMultipleEntryStatuses.cancelled),
      },
    ];
  }, [records, setStatusFilter, statusFilter]);

  return {
    amountRange,
    dateRange,
    query,
    resetFilters,
    setAmountRange,
    setDateRange,
    setQuery,
    setStatusFilter,
    statisticCards,
    statusFilter,
    table,
  };
}

export function replaceCashAdvanceMultipleEntryRow<TRow extends { id: string }>(rows: TRow[], rowId: string, updates: Partial<TRow>) {
  return rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row));
}

export function removeCashAdvanceMultipleEntryRow<TRow extends { id: string }>(rows: TRow[], rowId: string) {
  return rows.length > 1 ? rows.filter((row) => row.id !== rowId) : rows;
}

function createRows<TRow>(count: number, createRow: () => TRow) {
  return Array.from({ length: count }, () => createRow());
}

function upsertCashAdvanceMultipleEntryRecord(record: CashAdvanceMultipleEntryRecord) {
  const currentEntries = getInitialCashAdvanceMultipleEntries();
  const existingIndex = currentEntries.findIndex((entry) => entry.id === record.id);

  if (existingIndex === -1) {
    return [record, ...currentEntries];
  }

  return currentEntries.map((entry) => (entry.id === record.id ? record : entry));
}
