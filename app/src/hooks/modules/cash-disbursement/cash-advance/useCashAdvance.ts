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
  calculateCashAdvanceTotal,
  createBlankCashAdvanceAccountingEntry,
  createBlankCashAdvanceItem,
  createCashAdvanceFormValues,
  createCashAdvanceFormValuesFromRecord,
  formatCashAdvanceAmount,
} from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import {
  CashAdvanceActionModes,
  CashAdvanceAllStatusFilter,
  CashAdvanceDefaultColumnOrder,
  CashAdvanceDefaultColumnVisibility,
  CashAdvanceOverviewColumnWidths,
  CashAdvanceStatusFilters,
  CashAdvanceStatuses,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";

import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type {
  CashAdvanceAccountingEntry,
  CashAdvanceActionMode,
  CashAdvanceFormErrors,
  CashAdvanceFormValues,
  CashAdvanceItem,
  CashAdvanceRecord,
  CashAdvanceStoreState,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import {
  getCashAdvanceAvailabilityWarning,
  validateCashAdvanceForm,
} from "@/app/src/validations/modules/cash-disbursement/cash-advance/CashAdvanceValidation";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { hasModuleDraftChanges } from "@/app/src/hooks/shared/module/useModuleDraftChanges";
import {
  createCashAdvanceApi,
  fetchCashAdvanceById,
  fetchCashAdvanceList,
  fetchNextCashAdvanceTransactionNo,
  updateCashAdvanceApi,
  updateCashAdvanceStatusApi,
} from "@/app/src/services/modules/cash-disbursement/cash-advance/CashAdvanceApi";
import { CashAdvanceQueryKeys } from "@/app/src/services/modules/cash-disbursement/cash-advance/CashAdvanceQueryKeys";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";

const EmptyCashAdvances: CashAdvanceRecord[] = [];

export function useCashAdvanceStore<TSelected = CashAdvanceStoreState>(
  selector?: (state: CashAdvanceStoreState) => TSelected,
) {
  const queryClient = useQueryClient();
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const queryKey = CashAdvanceQueryKeys.records(activeCompanyId);
  const entriesQuery = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const response = await fetchCashAdvanceList();
        return response.data ?? [];
      } catch {
        toast.error("Could not load Cash Advance records.");
        return [];
      }
    },
    enabled: activeCompanyId !== null,
  });
  const entries = entriesQuery.data ?? EmptyCashAdvances;

  const refreshRecords = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: CashAdvanceQueryKeys.all });
  }, [queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ record, status }: { record: CashAdvanceRecord; status: CashAdvanceStatus }) =>
      updateCashAdvanceStatusApi(record.id, status),
    onSuccess: (updatedRecord, { status }) => {
      queryClient.setQueryData<CashAdvanceRecord[]>(queryKey, (current = []) =>
        current.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)),
      );
      refreshRecords();
      toast.success(`Cash Advance Marked as ${status}.`);
    },
    onError: () => toast.error("Could not update the Cash Advance status."),
  });

  const updateEntryStatus = useCallback(
    (record: CashAdvanceRecord, status: CashAdvanceStatus) => updateStatusMutation.mutate({ record, status }),
    [updateStatusMutation],
  );
  const state = useMemo<CashAdvanceStoreState>(
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

export function useCashAdvanceActionForm(
  mode: CashAdvanceActionMode,
  recordId?: string,
  onSaved?: (record: CashAdvanceRecord) => void,
) {
  const transactionCurrency = useTransactionCurrency();
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const [loadedRecord, setLoadedRecord] = useState<CashAdvanceRecord | null>(null);
  const [values, setValues] = useState<CashAdvanceFormValues>(() =>
    createCashAdvanceFormValues(transactionCurrency.baseCurrencyCode),
  );
  const hasEditedCurrencyRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(mode !== CashAdvanceActionModes.Add && Boolean(recordId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<CashAdvanceFormErrors>({});
  const [initialValues, setInitialValues] = useState(values);
  const rawIsDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isDirty = mode === CashAdvanceActionModes.Add ? hasModuleDraftChanges(values, initialValues, ["transNo"]) : rawIsDirty;
  const availabilityWarning = useMemo(() => getCashAdvanceAvailabilityWarning(values), [values]);
  const draft = useModuleDraft({
    enabled: mode !== CashAdvanceActionModes.View,
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:cash-advance", recordId }),
    setValues,
    values,
  });

  const refreshNextTransactionNo = useCallback(async () => {
    try {
      const nextTransNo = await fetchNextCashAdvanceTransactionNo(activeBranchId ?? undefined);

      if (nextTransNo) {
        setValues((current) => ({ ...current, transNo: nextTransNo }));
        setInitialValues((current) => ({ ...current, transNo: nextTransNo }));
      }
    } catch {
      // Keep the current add form if the number endpoint is temporarily unavailable.
    }
  }, [activeBranchId]);

  useEffect(() => {
    if (mode !== CashAdvanceActionModes.Add) {
      return;
    }

    queueMicrotask(() => void refreshNextTransactionNo());
  }, [mode, refreshNextTransactionNo]);

  useEffect(() => {
    if (mode === CashAdvanceActionModes.Add) {
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
      fetchCashAdvanceById(recordId)
        .then((record) => {
          if (!isMounted) {
            return;
          }

          const nextValues = createCashAdvanceFormValuesFromRecord(record);
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
    if (mode !== CashAdvanceActionModes.Add || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) {
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

  function updateField<Key extends keyof CashAdvanceFormValues>(key: Key, value: CashAdvanceFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    if (key in errors) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  function updateItems(items: CashAdvanceItem[]) {
    const totalAmount = formatCashAdvanceAmount(calculateCashAdvanceTotal(items));

    setValues((current) => ({
      ...current,
      amount: totalAmount,
      items,
    }));
  }

  function updateAccountingEntries(accountingEntries: CashAdvanceAccountingEntry[]) {
    setValues((current) => ({
      ...current,
      accountingEntries,
    }));
  }

  function addItems(count = 1) {
    updateItems([...values.items, ...Array.from({ length: count }, () => createBlankCashAdvanceItem())]);
  }

  function addAccountingEntries(count = 1) {
    updateAccountingEntries([
      ...values.accountingEntries,
      ...Array.from({ length: count }, () => createBlankCashAdvanceAccountingEntry()),
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

  async function submitEntry(status: CashAdvanceStatus = CashAdvanceStatuses.ForApproval) {
    if (mode === CashAdvanceActionModes.View || isSubmittingRef.current) return false;
    if (mode === CashAdvanceActionModes.Edit && !isDirty && status === loadedRecord?.status) {
      toast.error("No changes to save.");
      return false;
    }
    const releaseSubmitLock = acquireModuleActionLock(
      `cash-disbursement:cash-advance:submit:${mode}:${recordId ?? values.transNo}`,
    );
    if (!releaseSubmitLock) return false;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const nextValues = { ...values, status };
    const shouldValidate = status !== CashAdvanceStatuses.Draft;
    const nextErrors = shouldValidate ? validateCashAdvanceForm(nextValues) : {};

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
        mode === CashAdvanceActionModes.Edit && loadedRecord
          ? await updateCashAdvanceApi(loadedRecord.id, nextValues, { branchUnitId: activeBranchId ?? undefined })
          : await createCashAdvanceApi(nextValues, { branchUnitId: activeBranchId ?? undefined });
      const refreshedValues = createCashAdvanceFormValuesFromRecord(nextRecord);
      setLoadedRecord(nextRecord);
      setValues(refreshedValues);
      setInitialValues(refreshedValues);
      draft.clearDraft();
      toast.success(
        mode === CashAdvanceActionModes.Edit ? "Cash Advance Updated." : "Cash Advance Saved.",
      );
      onSaved?.(nextRecord);
      return true;
    } catch {
      toast.error("Could not save the Cash Advance. Please try again.");
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
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:cash-advance:status:${loadedRecord.id}:${status}`);
    if (!releaseActionLock) return;

    try {
      const nextRecord = await updateCashAdvanceStatusApi(loadedRecord.id, status);
      const nextValues = createCashAdvanceFormValuesFromRecord(nextRecord);
      setLoadedRecord(nextRecord);
      setValues(nextValues);
      setInitialValues(nextValues);
      toast.success(`Cash Advance Marked as ${status}.`);
    } catch {
      toast.error("Could not update the Cash Advance. Please try again.");
    } finally {
      releaseActionLock();
    }
  }

  function validateEntry(status: CashAdvanceStatus = CashAdvanceStatuses.ForApproval): boolean {
    if (mode === CashAdvanceActionModes.View || isSubmittingRef.current) return false;
    if (mode === CashAdvanceActionModes.Edit && !isDirty && status === loadedRecord?.status) {
      toast.error("No changes to save.");
      return false;
    }
    const nextValues = { ...values, status };
    const shouldValidate = status !== CashAdvanceStatuses.Draft;
    const nextErrors = shouldValidate ? validateCashAdvanceForm(nextValues) : {};

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please Fill Up the Required Fields!");
      return false;
    }
    return true;
  }

  async function resetAddValuesWithNextTransactionNo() {
    const nextValues = createCashAdvanceFormValues(transactionCurrency.baseCurrencyCode);

    try {
      const nextTransNo = await fetchNextCashAdvanceTransactionNo(activeBranchId ?? undefined);

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

    if (mode === CashAdvanceActionModes.Add) {
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
    isRecordMissing: mode !== CashAdvanceActionModes.Add && !isLoading && !loadedRecord,
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

export function useCashAdvanceTable(records: CashAdvanceRecord[]) {
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
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(CashAdvanceDefaultColumnOrder);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(CashAdvanceDefaultColumnVisibility);
  const [statusFilter, setStatusFilterState] = useState<(typeof CashAdvanceStatusFilters)[number]>(
    CashAdvanceAllStatusFilter,
  );
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      const matchesStatus = statusFilter === CashAdvanceAllStatusFilter || record.status === statusFilter;
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
  const columns = useMemo<ColumnDef<CashAdvanceRecord>[]>(
    () => [
      {
        accessorKey: "transNo",
        id: "transNo",
        header: "Cash Advance No.",
        size: CashAdvanceOverviewColumnWidths.transactionNumber,
        meta: { label: "Cash Advance No." },
      },
      {
        accessorKey: "documentDate",
        id: "documentDate",
        header: "Document Date",
        size: CashAdvanceOverviewColumnWidths.documentDate,
        meta: { label: "Document Date" },
      },
      {
        accessorKey: "partyCode",
        id: "partyCode",
        header: "Employee Code",
        size: CashAdvanceOverviewColumnWidths.partyCode,
        meta: { label: "Employee Code" },
      },
      {
        accessorKey: "partyName",
        id: "partyName",
        header: "Employee Name",
        size: CashAdvanceOverviewColumnWidths.partyName,
        meta: { label: "Employee Name" },
      },
      {
        accessorKey: "accountCode",
        id: "accountCode",
        header: "Default Account Code",
        size: CashAdvanceOverviewColumnWidths.accountCode,
        meta: { label: "Default Account Code" },
      },
      {
        accessorKey: "accountTitle",
        id: "accountTitle",
        header: "Default Account Title",
        size: CashAdvanceOverviewColumnWidths.accountTitle,
        meta: { label: "Default Account Title" },
      },
      {
        accessorFn: (record) => record.currency ?? record.formValues?.currency ?? "PHP",
        id: "currency",
        header: "Currency",
        size: CashAdvanceOverviewColumnWidths.currency,
        meta: { label: "Currency" },
      },
      {
        accessorFn: (record) => record.exchangeRate ?? record.formValues?.exchangeRate ?? "1.00",
        id: "exchangeRate",
        header: "Exchange Rate",
        size: CashAdvanceOverviewColumnWidths.exchangeRate,
        meta: { label: "Exchange Rate" },
      },
      {
        accessorKey: "amount",
        id: "amount",
        header: "Total Amount",
        size: CashAdvanceOverviewColumnWidths.amount,
        meta: { label: "Total Amount" },
      },
      {
        accessorKey: "remarks",
        id: "remarks",
        header: "Remarks",
        size: CashAdvanceOverviewColumnWidths.remarks,
        meta: { label: "Remarks" },
      },
      {
        accessorKey: "createdBy",
        id: "createdBy",
        header: "Created By",
        size: CashAdvanceOverviewColumnWidths.auditUser,
        meta: { label: "Created By" },
      },
      {
        accessorKey: "createdAt",
        id: "createdAt",
        header: "Date Created",
        size: CashAdvanceOverviewColumnWidths.auditDate,
        sortingFn: "datetime",
        meta: { label: "Date Created" },
      },
      {
        accessorKey: "updatedBy",
        id: "updatedBy",
        header: "Updated By",
        size: CashAdvanceOverviewColumnWidths.auditUser,
        meta: { label: "Updated By" },
      },
      {
        accessorKey: "updatedAt",
        id: "updatedAt",
        header: "Date Modified",
        size: CashAdvanceOverviewColumnWidths.auditDate,
        sortingFn: "datetime",
        meta: { label: "Date Modified" },
      },
      {
        accessorKey: "status",
        id: "status",
        header: "Status",
        size: CashAdvanceOverviewColumnWidths.status,
        meta: { className: "text-center", label: "Status" },
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: "Actions",
        size: CashAdvanceOverviewColumnWidths.actions,
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
      columnOrder: CashAdvanceDefaultColumnOrder,
      columnVisibility: CashAdvanceDefaultColumnVisibility,
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
    (value: (typeof CashAdvanceStatusFilters)[number]) => {
      setStatusFilterState(value);
      table.setPageIndex(0);
    },
    [table],
  );

  function resetFilters() {
    setAmountRangeState({ from: "", to: "" });
    setDateRangeState({ from: "", to: "" });
    setQueryState("");
    setStatusFilterState(CashAdvanceAllStatusFilter);
    table.setPageIndex(0);
  }

  const statisticCards = useMemo<ModuleStatisticCardItem[]>(() => {
    const postedCount = records.filter((record) => record.status === CashAdvanceStatuses.Posted).length;
    const forApprovalCount = records.filter((record) => record.status === CashAdvanceStatuses.ForApproval).length;
    const draftCount = records.filter((record) => record.status === CashAdvanceStatuses.Draft).length;
    const disapprovedCount = records.filter((record) => record.status === CashAdvanceStatuses.Disapproved).length;
    const cancelledCount = records.filter((record) => record.status === CashAdvanceStatuses.Cancelled).length;

    return [
      {
        label: "Total Entries",
        value: records.length,
        summary: "All time",
        icon: ReceiptText,
        tone: "violet",
        isActive: statusFilter === CashAdvanceAllStatusFilter,
        onClick: () => setStatusFilter(CashAdvanceAllStatusFilter),
      },
      {
        label: CashAdvanceStatuses.Posted,
        value: postedCount,
        summary: formatPartOfTotalPercentage(postedCount, records.length),
        icon: getModuleStatusMetricIcon(CashAdvanceStatuses.Posted),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.Posted),
        tone: "emerald",
        isActive: statusFilter === CashAdvanceStatuses.Posted,
        onClick: () => setStatusFilter(CashAdvanceStatuses.Posted),
      },
      {
        label: CashAdvanceStatuses.ForApproval,
        value: forApprovalCount,
        summary: formatPartOfTotalPercentage(forApprovalCount, records.length),
        icon: getModuleStatusMetricIcon(CashAdvanceStatuses.ForApproval),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.ForApproval),
        tone: "amber",
        isActive: statusFilter === CashAdvanceStatuses.ForApproval,
        onClick: () => setStatusFilter(CashAdvanceStatuses.ForApproval),
      },
      {
        label: CashAdvanceStatuses.Draft,
        value: draftCount,
        summary: formatPartOfTotalPercentage(draftCount, records.length),
        icon: getModuleStatusMetricIcon(CashAdvanceStatuses.Draft),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.Draft),
        tone: "blue",
        isActive: statusFilter === CashAdvanceStatuses.Draft,
        onClick: () => setStatusFilter(CashAdvanceStatuses.Draft),
      },
      {
        label: CashAdvanceStatuses.Disapproved,
        value: disapprovedCount,
        summary: formatPartOfTotalPercentage(disapprovedCount, records.length),
        icon: getModuleStatusMetricIcon(CashAdvanceStatuses.Disapproved),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.Disapproved),
        tone: "red",
        isActive: statusFilter === CashAdvanceStatuses.Disapproved,
        onClick: () => setStatusFilter(CashAdvanceStatuses.Disapproved),
      },
      {
        label: CashAdvanceStatuses.Cancelled,
        value: cancelledCount,
        summary: formatPartOfTotalPercentage(cancelledCount, records.length),
        icon: getModuleStatusMetricIcon(CashAdvanceStatuses.Cancelled),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.Cancelled),
        tone: "slate",
        isActive: statusFilter === CashAdvanceStatuses.Cancelled,
        onClick: () => setStatusFilter(CashAdvanceStatuses.Cancelled),
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

export function replaceCashAdvanceRow<TRow extends { id: string }>(rows: TRow[], rowId: string, updates: Partial<TRow>) {
  return rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row));
}

export function removeCashAdvanceRow<TRow extends { id: string }>(rows: TRow[], rowId: string) {
  return rows.length > 1 ? rows.filter((row) => row.id !== rowId) : rows;
}
