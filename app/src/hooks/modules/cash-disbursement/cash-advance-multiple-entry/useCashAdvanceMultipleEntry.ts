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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReceiptText } from "lucide-react";
import {
  calculateCashAdvanceMultipleEntryTotal,
  createBlankCashAdvanceMultipleEntryAccountingEntry,
  createBlankCashAdvanceMultipleEntryItem,
  createCashAdvanceMultipleEntryFormValues,
  createCashAdvanceMultipleEntryFormValuesFromRecord,
  formatCashAdvanceMultipleEntryAmount,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import {
  CashAdvanceMultipleEntryActionModes,
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
  CashAdvanceMultipleEntryFormErrors,
  CashAdvanceMultipleEntryFormValues,
  CashAdvanceMultipleEntryItem,
  CashAdvanceMultipleEntryRecord,
  CashAdvanceMultipleEntryStoreState,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import {
  getCashAdvanceMultipleEntryAvailabilityWarning,
  validateCashAdvanceMultipleEntryForm,
} from "@/app/src/validations/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryValidation";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { hasModuleDraftChanges } from "@/app/src/hooks/shared/module/useModuleDraftChanges";
import {
  createCashAdvanceMultipleEntryApi,
  fetchCashAdvanceMultipleEntryById,
  fetchCashAdvanceMultipleEntryList,
  fetchNextCashAdvanceMultipleEntryTransactionNo,
  updateCashAdvanceMultipleEntryApi,
  updateCashAdvanceMultipleEntryStatusApi,
} from "@/app/src/services/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryApi";
import { CashAdvanceMultipleEntryQueryKeys } from "@/app/src/services/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryQueryKeys";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";

const EmptyCashAdvanceMultipleEntries: CashAdvanceMultipleEntryRecord[] = [];

export function useCashAdvanceMultipleEntryStore<TSelected = CashAdvanceMultipleEntryStoreState>(
  selector?: (state: CashAdvanceMultipleEntryStoreState) => TSelected,
) {
  const queryClient = useQueryClient();
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const queryKey = CashAdvanceMultipleEntryQueryKeys.records(activeCompanyId);
  const entriesQuery = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const response = await fetchCashAdvanceMultipleEntryList();
        return response.data ?? [];
      } catch {
        toast.error("Could not load Cash Advance Multiple Entry records.");
        return [];
      }
    },
    enabled: activeCompanyId !== null,
  });
  const entries = entriesQuery.data ?? EmptyCashAdvanceMultipleEntries;

  const refreshRecords = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: CashAdvanceMultipleEntryQueryKeys.all });
  }, [queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ record, status }: { record: CashAdvanceMultipleEntryRecord; status: CashAdvanceStatus }) =>
      updateCashAdvanceMultipleEntryStatusApi(record.id, status),
    onSuccess: (updatedRecord, { status }) => {
      queryClient.setQueryData<CashAdvanceMultipleEntryRecord[]>(queryKey, (current = []) =>
        current.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)),
      );
      refreshRecords();
      toast.success(`Cash Advance Multiple Entry Marked as ${status}.`);
    },
    onError: () => toast.error("Could not update the Cash Advance Multiple Entry status."),
  });

  const updateEntryStatus = useCallback(
    (record: CashAdvanceMultipleEntryRecord, status: CashAdvanceStatus) => updateStatusMutation.mutate({ record, status }),
    [updateStatusMutation],
  );
  const state = useMemo<CashAdvanceMultipleEntryStoreState>(
    () => ({
      entries,
      isLoading: entriesQuery.isLoading,
      lastSyncedAt: entriesQuery.dataUpdatedAt,
      refreshRecords,
      updateEntryStatus,
    }),
    [entries, entriesQuery.dataUpdatedAt, entriesQuery.isLoading, refreshRecords, updateEntryStatus],
  );

  return selector ? selector(state) : (state as TSelected);
}

export function useCashAdvanceMultipleEntryActionForm(
  mode: CashAdvanceMultipleEntryActionMode,
  recordId?: string,
  onSaved?: (record: CashAdvanceMultipleEntryRecord) => void,
) {
  const transactionCurrency = useTransactionCurrency();
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const [loadedRecord, setLoadedRecord] = useState<CashAdvanceMultipleEntryRecord | null>(null);
  const [values, setValues] = useState<CashAdvanceMultipleEntryFormValues>(() =>
    createCashAdvanceMultipleEntryFormValues(transactionCurrency.baseCurrencyCode),
  );
  const hasEditedCurrencyRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(mode !== CashAdvanceMultipleEntryActionModes.Add && Boolean(recordId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<CashAdvanceMultipleEntryFormErrors>({});
  const [initialValues, setInitialValues] = useState(values);
  const rawIsDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isDirty = mode === CashAdvanceMultipleEntryActionModes.Add ? hasModuleDraftChanges(values, initialValues, ["transNo"]) : rawIsDirty;
  const availabilityWarning = useMemo(() => getCashAdvanceMultipleEntryAvailabilityWarning(values), [values]);
  const draft = useModuleDraft({
    enabled: mode !== CashAdvanceMultipleEntryActionModes.View,
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:cash-advance-multiple-entry", recordId }),
    setValues,
    values,
  });

  const refreshNextTransactionNo = useCallback(async () => {
    try {
      const nextTransNo = await fetchNextCashAdvanceMultipleEntryTransactionNo(activeBranchId ?? undefined);

      if (nextTransNo) {
        setValues((current) => ({ ...current, transNo: nextTransNo }));
        setInitialValues((current) => ({ ...current, transNo: nextTransNo }));
      }
    } catch {
      // Keep the current add form if the number endpoint is temporarily unavailable.
    }
  }, [activeBranchId]);

  useEffect(() => {
    if (mode !== CashAdvanceMultipleEntryActionModes.Add) {
      return;
    }

    queueMicrotask(() => void refreshNextTransactionNo());
  }, [mode, refreshNextTransactionNo]);

  useEffect(() => {
    if (mode === CashAdvanceMultipleEntryActionModes.Add) {
      return;
    }

    if (!recordId) {
      return;
    }

    let isMounted = true;
    queueMicrotask(() => {
      if (!isMounted) {
        return;
      }

      setIsLoading(true);
      fetchCashAdvanceMultipleEntryById(recordId)
        .then((record) => {
          if (!isMounted) {
            return;
          }

          const nextValues = createCashAdvanceMultipleEntryFormValuesFromRecord(record);
          setLoadedRecord(record);
          setValues(nextValues);
          setInitialValues(nextValues);
        })
        .catch(() => {
          if (isMounted) {
            setLoadedRecord(null);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    });

    return () => {
      isMounted = false;
    };
  }, [mode, recordId]);

  useEffect(() => {
    if (mode !== CashAdvanceMultipleEntryActionModes.Add || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) {
      return;
    }

    setValues((current) => ({
      ...current,
      currency: transactionCurrency.baseCurrencyCode,
      exchangeRate: "1.00",
    }));
    setInitialValues((current) => ({
      ...current,
      currency: transactionCurrency.baseCurrencyCode,
      exchangeRate: "1.00",
    }));
  }, [mode, transactionCurrency.baseCurrencyCode, transactionCurrency.isBaseCurrencyResolved]);

  function updateField<Key extends keyof CashAdvanceMultipleEntryFormValues>(key: Key, value: CashAdvanceMultipleEntryFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    if (key in errors) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  function updateItems(items: CashAdvanceMultipleEntryItem[]) {
    const totalAmount = formatCashAdvanceMultipleEntryAmount(calculateCashAdvanceMultipleEntryTotal(items));

    setValues((current) => ({
      ...current,
      amount: totalAmount,
      items,
    }));
  }

  function updateAccountingEntries(accountingEntries: CashAdvanceMultipleEntryAccountingEntry[]) {
    setValues((current) => ({
      ...current,
      accountingEntries,
    }));
  }

  function addItems(count = 1) {
    updateItems([...values.items, ...Array.from({ length: count }, () => createBlankCashAdvanceMultipleEntryItem())]);
  }

  function addAccountingEntries(count = 1) {
    updateAccountingEntries([
      ...values.accountingEntries,
      ...Array.from({ length: count }, () => createBlankCashAdvanceMultipleEntryAccountingEntry()),
    ]);
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

  async function submitEntry(status: CashAdvanceStatus = CashAdvanceMultipleEntryStatuses.ForApproval) {
    if (mode === CashAdvanceMultipleEntryActionModes.View || isSubmittingRef.current) return false;
    if (mode === CashAdvanceMultipleEntryActionModes.Edit && !isDirty && status === loadedRecord?.status) {
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
    const shouldValidate = status !== CashAdvanceMultipleEntryStatuses.Draft;
    const nextErrors = shouldValidate ? validateCashAdvanceMultipleEntryForm(nextValues) : {};

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please Fill Up the Required Fields!");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }

    setErrors({});

    try {
      const nextRecord =
        mode === CashAdvanceMultipleEntryActionModes.Edit && loadedRecord
          ? await updateCashAdvanceMultipleEntryApi(loadedRecord.id, nextValues, { branchUnitId: activeBranchId ?? undefined })
          : await createCashAdvanceMultipleEntryApi(nextValues, { branchUnitId: activeBranchId ?? undefined });
      const refreshedValues = createCashAdvanceMultipleEntryFormValuesFromRecord(nextRecord);
      setLoadedRecord(nextRecord);
      setValues(refreshedValues);
      setInitialValues(refreshedValues);
      draft.clearDraft();
      toast.success(
        mode === CashAdvanceMultipleEntryActionModes.Edit ? "Cash Advance Multiple Entry Updated." : "Cash Advance Multiple Entry Saved.",
      );
      onSaved?.(nextRecord);
      return true;
    } catch {
      toast.error("Could not save the Cash Advance Multiple Entry. Please try again.");
      return false;
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
    }
  }

  async function updateEntryStatus(status: CashAdvanceStatus) {
    if (!loadedRecord) {
      return;
    }
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:cash-advance-multiple-entry:status:${loadedRecord.id}:${status}`);
    if (!releaseActionLock) return;

    try {
      const nextRecord = await updateCashAdvanceMultipleEntryStatusApi(loadedRecord.id, status);
      const nextValues = createCashAdvanceMultipleEntryFormValuesFromRecord(nextRecord);
      setLoadedRecord(nextRecord);
      setValues(nextValues);
      setInitialValues(nextValues);
      toast.success(`Cash Advance Multiple Entry Marked as ${status}.`);
    } catch {
      toast.error("Could not update the Cash Advance Multiple Entry. Please try again.");
    } finally {
      releaseActionLock();
    }
  }

  function validateEntry(status: CashAdvanceStatus = CashAdvanceMultipleEntryStatuses.ForApproval): boolean {
    if (mode === CashAdvanceMultipleEntryActionModes.View || isSubmittingRef.current) return false;
    if (mode === CashAdvanceMultipleEntryActionModes.Edit && !isDirty && status === loadedRecord?.status) {
      toast.error("No changes to save.");
      return false;
    }
    const nextValues = { ...values, status };
    const shouldValidate = status !== CashAdvanceMultipleEntryStatuses.Draft;
    const nextErrors = shouldValidate ? validateCashAdvanceMultipleEntryForm(nextValues) : {};

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please Fill Up the Required Fields!");
      return false;
    }
    return true;
  }

  async function resetAddValuesWithNextTransactionNo() {
    const nextValues = createCashAdvanceMultipleEntryFormValues(transactionCurrency.baseCurrencyCode);

    try {
      const nextTransNo = await fetchNextCashAdvanceMultipleEntryTransactionNo(activeBranchId ?? undefined);

      if (nextTransNo) {
        nextValues.transNo = nextTransNo;
      }
    } catch {
      // Keep the blank add form if the number endpoint is temporarily unavailable.
    }

    setValues(nextValues);
    setInitialValues(nextValues);
  }

  function discardDraft() {
    draft.clearDraft();

    if (mode === CashAdvanceMultipleEntryActionModes.Add) {
      void resetAddValuesWithNextTransactionNo();
      return;
    }

    draft.discardDraft();
  }

  return {
    availabilityWarning,
    discardDraft,
    errors,
    hasDiscardableChanges: isDirty,
    saveDraft: draft.saveDraft,
    currencyOptions: transactionCurrency.currencyOptions,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isLoading,
    isSubmitting,
    isRecordMissing: mode !== CashAdvanceMultipleEntryActionModes.Add && !isLoading && !loadedRecord,
    record: loadedRecord,
    submitEntry,
    addAccountingEntries,
    addItems,
    updateAccountingEntries,
    updateEntryStatus,
    updateField,
    updateCurrency,
    updateItems,
    validateEntry,
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
          record.currency,
          record.exchangeRate,
          record.formValues?.currency,
          record.formValues?.exchangeRate,
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
        header: "Document Date",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.documentDate,
        meta: { label: "Document Date" },
      },
      {
        accessorKey: "partyCode",
        id: "partyCode",
        header: "Employee Code",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.partyCode,
        meta: { label: "Employee Code" },
      },
      {
        accessorKey: "partyName",
        id: "partyName",
        header: "Employee Name",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.partyName,
        meta: { label: "Employee Name" },
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
        accessorFn: (record) => record.currency ?? record.formValues?.currency ?? "PHP",
        id: "currency",
        header: "Currency",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.currency,
        meta: { label: "Currency" },
      },
      {
        accessorFn: (record) => record.exchangeRate ?? record.formValues?.exchangeRate ?? "1.00",
        id: "exchangeRate",
        header: "Exchange Rate",
        size: CashAdvanceMultipleEntryOverviewColumnWidths.exchangeRate,
        meta: { label: "Exchange Rate" },
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

  const setStatusFilter = useCallback(
    (value: (typeof CashAdvanceMultipleEntryStatusFilters)[number]) => {
      setStatusFilterState(value);
      table.setPageIndex(0);
    },
    [table],
  );

  function resetFilters() {
    setAmountRangeState({ from: "", to: "" });
    setDateRangeState({ from: "", to: "" });
    setQueryState("");
    setStatusFilterState(CashAdvanceMultipleEntryAllStatusFilter);
    table.setPageIndex(0);
  }

  const statisticCards = useMemo<ModuleStatisticCardItem[]>(() => {
    const postedCount = records.filter((record) => record.status === CashAdvanceMultipleEntryStatuses.Posted).length;
    const forApprovalCount = records.filter((record) => record.status === CashAdvanceMultipleEntryStatuses.ForApproval).length;
    const draftCount = records.filter((record) => record.status === CashAdvanceMultipleEntryStatuses.Draft).length;
    const disapprovedCount = records.filter((record) => record.status === CashAdvanceMultipleEntryStatuses.Disapproved).length;
    const cancelledCount = records.filter((record) => record.status === CashAdvanceMultipleEntryStatuses.Cancelled).length;

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
        label: CashAdvanceMultipleEntryStatuses.Posted,
        value: postedCount,
        summary: formatPartOfTotalPercentage(postedCount, records.length),
        icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.Posted),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.Posted),
        tone: "emerald",
        isActive: statusFilter === CashAdvanceMultipleEntryStatuses.Posted,
        onClick: () => setStatusFilter(CashAdvanceMultipleEntryStatuses.Posted),
      },
      {
        label: CashAdvanceMultipleEntryStatuses.ForApproval,
        value: forApprovalCount,
        summary: formatPartOfTotalPercentage(forApprovalCount, records.length),
        icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.ForApproval),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.ForApproval),
        tone: "amber",
        isActive: statusFilter === CashAdvanceMultipleEntryStatuses.ForApproval,
        onClick: () => setStatusFilter(CashAdvanceMultipleEntryStatuses.ForApproval),
      },
      {
        label: CashAdvanceMultipleEntryStatuses.Draft,
        value: draftCount,
        summary: formatPartOfTotalPercentage(draftCount, records.length),
        icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.Draft),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.Draft),
        tone: "blue",
        isActive: statusFilter === CashAdvanceMultipleEntryStatuses.Draft,
        onClick: () => setStatusFilter(CashAdvanceMultipleEntryStatuses.Draft),
      },
      {
        label: CashAdvanceMultipleEntryStatuses.Disapproved,
        value: disapprovedCount,
        summary: formatPartOfTotalPercentage(disapprovedCount, records.length),
        icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.Disapproved),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.Disapproved),
        tone: "red",
        isActive: statusFilter === CashAdvanceMultipleEntryStatuses.Disapproved,
        onClick: () => setStatusFilter(CashAdvanceMultipleEntryStatuses.Disapproved),
      },
      {
        label: CashAdvanceMultipleEntryStatuses.Cancelled,
        value: cancelledCount,
        summary: formatPartOfTotalPercentage(cancelledCount, records.length),
        icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.Cancelled),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.Cancelled),
        tone: "slate",
        isActive: statusFilter === CashAdvanceMultipleEntryStatuses.Cancelled,
        onClick: () => setStatusFilter(CashAdvanceMultipleEntryStatuses.Cancelled),
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
