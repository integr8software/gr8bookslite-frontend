"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReceiptText } from "lucide-react";
import {
  createCashAdvanceFormValues,
  createCashAdvanceFormValuesFromRecord,
} from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import { formatMoneyNumberDisplayValue, parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { syncTaxDetailsAmount } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import {
  CashAdvanceDefaultColumnVisibility,
  CashAdvanceDefaultColumnOrder,
  CashAdvanceDefaultSorting,
  CashAdvanceAllStatusFilter,
  CashAdvanceStatusFilters,
  CashAdvanceStatuses,
  CashAdvanceTablePreferencesModuleKey,
  CashAdvanceTablePreferencesStorageKey,
  CashAdvanceOverviewColumnWidths,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import {
  CashDisbursementAllTimeSummary,
  CashDisbursementQuerySegment,
  CashDisbursementTotalEntriesLabel,
  createCashDisbursementModuleQueryKey,
} from "@/app/src/constants/modules/cash-disbursement/CashDisbursementConstants";
import type {
  CashAdvanceActionMode,
  CashAdvanceFormErrors,
  CashAdvanceFormValues,
  CashAdvanceRecord,
  CashAdvanceReferenceField,
  CashAdvanceStatus,
  CashAdvanceStoreState,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import {
  getCashAdvanceAvailabilityWarning,
  validateCashAdvanceForm,
} from "@/app/src/validations/modules/cash-disbursement/cash-advance/CashAdvanceValidation";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import type { AppTaxRateDialogValue } from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { hasModuleDraftChanges } from "@/app/src/hooks/shared/module/useModuleDraftChanges";
import { normalizeLowercaseWhitespace } from "@/app/src/utils/string.util";
import {
  createCashAdvanceApi,
  fetchCashAdvanceById,
  fetchCashAdvanceList,
  fetchNextCashAdvanceTransactionNo,
  submitCashAdvanceApprovalApi,
  updateCashAdvanceApi,
  updateCashAdvanceStatusApi,
} from "@/app/src/services/modules/cash-disbursement/cash-advance/CashAdvanceApi";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";

const EmptyCashAdvances: CashAdvanceRecord[] = [];
const CashAdvanceQueryKey = "cash-advance";

export function useCashAdvanceStore<TSelected = CashAdvanceStoreState>(selector?: (state: CashAdvanceStoreState) => TSelected) {
  const queryClient = useQueryClient();
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const queryKey = [CashDisbursementQuerySegment, CashAdvanceQueryKey, "records", activeCompanyId] as const;
  const advancesQuery = useQuery({
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
  const advances = advancesQuery.data ?? EmptyCashAdvances;

  const refreshRecords = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: createCashDisbursementModuleQueryKey(CashAdvanceQueryKey) });
  }, [queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ record, status }: { record: CashAdvanceRecord; status: CashAdvanceStatus }) =>
      status === CashAdvanceStatuses.forApproval ? submitCashAdvanceApprovalApi(record.id) : updateCashAdvanceStatusApi(record.id, status),
    onSuccess: (updatedRecord, { status }) => {
      queryClient.setQueryData<CashAdvanceRecord[]>(queryKey, (current = []) =>
        current.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)),
      );
      refreshRecords();
      toast.success(`Cash Advance Marked as ${status}.`);
    },
    onError: () => toast.error("Could not update the Cash Advance status."),
  });

  const updateAdvanceStatus = useCallback(
    (record: CashAdvanceRecord, status: CashAdvanceStatus) => updateStatusMutation.mutate({ record, status }),
    [updateStatusMutation],
  );

  const state = useMemo<CashAdvanceStoreState>(
    () => ({
      advances,
      isLoading: advancesQuery.isLoading,
      lastSyncedAt: advancesQuery.dataUpdatedAt,
      refreshRecords,
      updateAdvanceStatus,
    }),
    [advances, advancesQuery.dataUpdatedAt, advancesQuery.isLoading, refreshRecords, updateAdvanceStatus],
  );

  return selector ? selector(state) : (state as TSelected);
}

export function useCashAdvanceActionForm(mode: CashAdvanceActionMode, recordId?: string, onSaved?: (record: CashAdvanceRecord) => void) {
  const transactionCurrency = useTransactionCurrency();
  const [loadedRecord, setLoadedRecord] = useState<CashAdvanceRecord | null>(null);
  const [values, setValues] = useState<CashAdvanceFormValues>(() => createCashAdvanceFormValues(transactionCurrency.baseCurrencyCode));
  const hasEditedCurrencyRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(mode !== "add" && Boolean(recordId));
  const [errors, setErrors] = useState<CashAdvanceFormErrors>({});
  const [initialValues, setInitialValues] = useState(values);
  const rawIsDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isDirty = mode === "add" ? hasModuleDraftChanges(values, initialValues, ["transNo"]) : rawIsDirty;
  const availabilityWarning = useMemo(() => getCashAdvanceAvailabilityWarning(values), [values]);
  const draft = useModuleDraft({
    enabled: mode !== "view",
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:cash-advance", recordId }),
    restoreValues: restoreCashAdvanceDraftValues,
    setValues,
    values,
  });

  async function refreshNextTransactionNo() {
    try {
      const nextTransNo = await fetchNextCashAdvanceTransactionNo();

      if (nextTransNo) {
        setValues((current) => ({ ...current, transNo: nextTransNo }));
        setInitialValues((current) => ({ ...current, transNo: nextTransNo }));
      }
    } catch {
      // Keep the current add form if the number endpoint is temporarily unavailable.
    }
  }

  useEffect(() => {
    if (mode === "add") {
      queueMicrotask(() => void refreshNextTransactionNo());
    }
  }, [mode]);

  useEffect(() => {
    if (mode === "add" || !recordId) {
      return;
    }

    let isMounted = true;
    queueMicrotask(() => {
      if (!isMounted) return;

      setIsLoading(true);
      fetchCashAdvanceById(recordId)
        .then((record) => {
          if (!isMounted) return;

          const nextValues = createCashAdvanceFormValuesFromRecord(record);
          setLoadedRecord(record);
          setValues(nextValues);
          setInitialValues(nextValues);
        })
        .catch(() => {
          if (isMounted) setLoadedRecord(null);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    });

    return () => {
      isMounted = false;
    };
  }, [mode, recordId]);

  useEffect(() => {
    if (mode !== "add" || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) {
      return;
    }

    setValues((current) => ({
      ...current,
      currency: transactionCurrency.baseCurrencyCode,
      fxRate: "1.00",
    }));
    setInitialValues((current) => ({
      ...current,
      currency: transactionCurrency.baseCurrencyCode,
      fxRate: "1.00",
    }));
  }, [mode, transactionCurrency.baseCurrencyCode, transactionCurrency.isBaseCurrencyResolved]);

  function updateField<Key extends keyof CashAdvanceFormValues>(key: Key, value: CashAdvanceFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    if (key in errors) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  function updateAmount(amount: string) {
    setErrors((current) => ({ ...current, amount: undefined }));
    setValues((current) => {
      return {
        ...current,
        amount,
        taxValue: {
          ...current.taxValue,
          taxDetails: syncTaxDetailsAmount(current.taxValue.taxDetails, parseMoneyNumberInput(amount), current.taxValue.taxRate),
        },
      };
    });
  }

  async function updateCurrency(currencyCode: string) {
    hasEditedCurrencyRef.current = true;
    updateField("currency", currencyCode);

    try {
      const exchangeRate = await transactionCurrency.loadExchangeRate(currencyCode);

      if (exchangeRate != null) {
        updateField("fxRate", formatLoadedExchangeRate(exchangeRate));
      }
    } catch {
      toast.error("Could not load the exchange rate for the selected currency.");
    }
  }

  function updateReferenceField(field: CashAdvanceReferenceField, value: string) {
    setValues((current) => ({
      ...current,
      referenceFields: {
        ...current.referenceFields,
        [field]: value,
      },
    }));
  }

  function updateTaxValue(taxValue: AppTaxRateDialogValue) {
    setErrors((current) => ({ ...current, amount: undefined }));
    setValues((current) => ({
      ...current,
      amount: formatMoneyNumberDisplayValue(taxValue.taxDetails.grossAmount || ""),
      taxValue,
    }));
  }

  async function submitAdvance(status: CashAdvanceStatus = CashAdvanceStatuses.forApproval) {
    if (mode === "view" || isSubmittingRef.current) return false;
    if (mode === "edit" && !isDirty && status === loadedRecord?.status) {
      toast.error("No changes to save.");
      return false;
    }
    const releaseSubmitLock = acquireModuleActionLock(`cash-disbursement:cash-advance:submit:${mode}:${recordId ?? values.transNo}`);
    if (!releaseSubmitLock) return false;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const nextValues = { ...values, status };
    const shouldValidate = status !== CashAdvanceStatuses.draft;
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
      const payload = {
        partyId: nextValues.partyId,
        partyCode: nextValues.partyCode,
        partyName: nextValues.partyName,
        creditAccountId: nextValues.accountId,
        accountCode: nextValues.accountCode,
        accountTitle: nextValues.accountTitle || nextValues.accountCode,
        costCenterId: nextValues.costCenterId,
        costCenter: nextValues.costCenter,
        costCenterCode: nextValues.referenceFields.costCenterCode,
        projectId: nextValues.projectId,
        projectName: nextValues.referenceFields.projectName,
        projectCode: nextValues.referenceFields.projectCode,
        currency: nextValues.currency,
        fxRate: nextValues.fxRate,
        amount: nextValues.amount,
        documentDate: nextValues.documentDate,
        transNo: nextValues.transNo,
        remarks: nextValues.remarks,
      };

      const savedRecord = mode === "edit" && recordId ? await updateCashAdvanceApi(recordId, payload) : await createCashAdvanceApi(payload);
      const nextRecord =
        status === CashAdvanceStatuses.forApproval && savedRecord?.id ? await submitCashAdvanceApprovalApi(savedRecord.id) : savedRecord;
      const refreshedValues = createCashAdvanceFormValuesFromRecord(nextRecord);
      setLoadedRecord(nextRecord);
      setValues(refreshedValues);
      setInitialValues(refreshedValues);
      draft.clearDraft();
      toast.success(mode === "edit" ? "Cash Advance Updated." : "Cash Advance Saved.");
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

  async function updateAdvanceStatus(status: CashAdvanceStatus) {
    if (!loadedRecord) {
      return;
    }
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:cash-advance:status:${loadedRecord.id}:${status}`);
    if (!releaseActionLock) return;

    try {
      const nextRecord =
        status === CashAdvanceStatuses.forApproval
          ? await submitCashAdvanceApprovalApi(loadedRecord.id)
          : await updateCashAdvanceStatusApi(loadedRecord.id, status);
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

  function validateAdvance(status: CashAdvanceStatus = CashAdvanceStatuses.forApproval): boolean {
    if (mode === "view" || isSubmittingRef.current) return false;
    if (mode === "edit" && !isDirty && status === loadedRecord?.status) {
      toast.error("No changes to save.");
      return false;
    }
    const nextValues = { ...values, status };
    const shouldValidate = status !== CashAdvanceStatuses.draft;
    const nextErrors = shouldValidate ? validateCashAdvanceForm(nextValues) : {};

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please Fill Up the Required Fields!");
      return false;
    }

    setErrors({});
    return true;
  }

  async function resetAddValuesWithNextTransactionNo() {
    const nextValues = createCashAdvanceFormValues(transactionCurrency.baseCurrencyCode);

    try {
      const nextTransNo = await fetchNextCashAdvanceTransactionNo();

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

    if (mode === "add") {
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
    isRecordMissing: mode !== "add" && !isLoading && !loadedRecord,
    record: loadedRecord,
    submitAdvance,
    updateAdvanceStatus,
    updateAmount,
    updateCurrency,
    updateField,
    updateReferenceField,
    updateTaxValue,
    validateAdvance,
    values,
  };
}

function restoreCashAdvanceDraftValues(draftValues: CashAdvanceFormValues, currentValues: CashAdvanceFormValues): CashAdvanceFormValues {
  const legacyDraftValues = draftValues as CashAdvanceFormValues & { cashAdvanceBalance?: string };

  return {
    ...currentValues,
    ...draftValues,
    attachments: draftValues.attachments ?? currentValues.attachments,
    availableCashAdvance: draftValues.availableCashAdvance ?? legacyDraftValues.cashAdvanceBalance ?? "",
    cashAdvanceLimit: draftValues.cashAdvanceLimit ?? "",
    referenceFields: {
      ...currentValues.referenceFields,
      ...(draftValues.referenceFields ?? {}),
    },
    taxValue: draftValues.taxValue ?? currentValues.taxValue,
  };
}

export function useCashAdvanceTable(advances: CashAdvanceRecord[]) {
  const [amountRange, setAmountRangeState] = useState<AmountRangeValue>({ from: "", to: "" });
  const [dateRange, setDateRangeState] = useState<DateRangeValue>({ from: "", to: "" });
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [query, setQueryState] = useState("");
  const [statusFilter, setStatusFilterState] = useState<(typeof CashAdvanceStatusFilters)[number]>(CashAdvanceAllStatusFilter);

  const tablePreferences = useTablePreferences({
    defaultColumnOrder: CashAdvanceDefaultColumnOrder,
    defaultColumnVisibility: CashAdvanceDefaultColumnVisibility,
    defaultSorting: CashAdvanceDefaultSorting,
    moduleKey: CashAdvanceTablePreferencesModuleKey,
    storageKey: CashAdvanceTablePreferencesStorageKey,
  });

  const filteredRows = useMemo(() => {
    const normalizedQuery = normalizeLowercaseWhitespace(query);

    return advances.filter((record) => {
      const matchesStatus = statusFilter === CashAdvanceAllStatusFilter || record.status === statusFilter;
      const matchesDateRange =
        (!dateRange.from || record.documentDate >= dateRange.from) && (!dateRange.to || record.documentDate <= dateRange.to);
      const matchesAmountRange =
        (!amountRange.from || record.amount >= Number(amountRange.from)) && (!amountRange.to || record.amount <= Number(amountRange.to));
      const matchesQuery =
        normalizedQuery.length === 0 ||
        normalizeLowercaseWhitespace(
          [
            record.transNo,
            record.partyCode,
            record.partyName,
            record.accountCode,
            record.costCenter,
            record.currency,
            record.fxRate,
            record.formValues?.currency,
            record.formValues?.fxRate,
            record.remarks,
            record.createdBy,
            record.updatedBy,
          ].join(" "),
        ).includes(normalizedQuery);

      return matchesStatus && matchesDateRange && matchesAmountRange && matchesQuery;
    });
  }, [advances, amountRange, dateRange, query, statusFilter]);

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
        header: "Party Code",
        size: CashAdvanceOverviewColumnWidths.partyCode,
        meta: { label: "Party Code" },
      },
      {
        accessorKey: "partyName",
        id: "partyName",
        header: "Party Name",
        size: CashAdvanceOverviewColumnWidths.partyName,
        meta: { label: "Party Name" },
      },
      {
        accessorKey: "accountCode",
        id: "accountCode",
        header: "Account Code",
        size: CashAdvanceOverviewColumnWidths.accountCode,
        meta: { label: "Account Code" },
      },
      {
        accessorFn: (record) => record.accountCode,
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
        accessorFn: (record) => record.fxRate ?? record.formValues?.fxRate ?? "1.00",
        id: "fxRate",
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
        sortingFn: "datetime",
        size: CashAdvanceOverviewColumnWidths.auditDate,
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
        sortingFn: "datetime",
        size: CashAdvanceOverviewColumnWidths.auditDate,
        meta: { label: "Date Modified" },
      },
      {
        accessorKey: "status",
        id: "status",
        header: "Status",
        size: CashAdvanceOverviewColumnWidths.status,
        meta: {
          className: "text-center",
          label: "Status",
        },
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: "Actions",
        size: CashAdvanceOverviewColumnWidths.actions,
        meta: {
          className: "px-3 text-center last:pr-3",
          label: "Actions",
        },
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
      sorting: CashAdvanceDefaultSorting,
    },
    onColumnOrderChange: tablePreferences.setColumnOrder,
    onColumnVisibilityChange: tablePreferences.setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: tablePreferences.setSorting,
    state: {
      columnOrder: tablePreferences.columnOrder,
      columnVisibility: tablePreferences.columnVisibility,
      pagination,
      sorting: tablePreferences.sorting,
    },
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
    const postedCount = advances.filter((record) => record.status === CashAdvanceStatuses.posted).length;
    const forApprovalCount = advances.filter((record) => record.status === CashAdvanceStatuses.forApproval).length;
    const draftCount = advances.filter((record) => record.status === CashAdvanceStatuses.draft).length;
    const disapprovedCount = advances.filter((record) => record.status === CashAdvanceStatuses.disapproved).length;
    const cancelledCount = advances.filter((record) => record.status === CashAdvanceStatuses.cancelled).length;

    return [
      {
        icon: ReceiptText,
        tone: "violet",
        label: CashDisbursementTotalEntriesLabel,
        summary: CashDisbursementAllTimeSummary,
        value: advances.length,
        isActive: statusFilter === CashAdvanceAllStatusFilter,
        onClick: () => setStatusFilter(CashAdvanceAllStatusFilter),
      },
      {
        icon: getModuleStatusMetricIcon(CashAdvanceStatuses.posted),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.posted),
        tone: "emerald",
        label: CashAdvanceStatuses.posted,
        summary: formatPartOfTotalPercentage(postedCount, advances.length),
        value: postedCount,
        isActive: statusFilter === CashAdvanceStatuses.posted,
        onClick: () => setStatusFilter(CashAdvanceStatuses.posted),
      },
      {
        icon: getModuleStatusMetricIcon(CashAdvanceStatuses.forApproval),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.forApproval),
        tone: "amber",
        label: CashAdvanceStatuses.forApproval,
        summary: formatPartOfTotalPercentage(forApprovalCount, advances.length),
        value: forApprovalCount,
        isActive: statusFilter === CashAdvanceStatuses.forApproval,
        onClick: () => setStatusFilter(CashAdvanceStatuses.forApproval),
      },
      {
        icon: getModuleStatusMetricIcon(CashAdvanceStatuses.draft),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.draft),
        tone: "blue",
        label: CashAdvanceStatuses.draft,
        summary: formatPartOfTotalPercentage(draftCount, advances.length),
        value: draftCount,
        isActive: statusFilter === CashAdvanceStatuses.draft,
        onClick: () => setStatusFilter(CashAdvanceStatuses.draft),
      },
      {
        icon: getModuleStatusMetricIcon(CashAdvanceStatuses.disapproved),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.disapproved),
        tone: "red",
        label: CashAdvanceStatuses.disapproved,
        summary: formatPartOfTotalPercentage(disapprovedCount, advances.length),
        value: disapprovedCount,
        isActive: statusFilter === CashAdvanceStatuses.disapproved,
        onClick: () => setStatusFilter(CashAdvanceStatuses.disapproved),
      },
      {
        icon: getModuleStatusMetricIcon(CashAdvanceStatuses.cancelled),
        iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.cancelled),
        tone: "slate",
        label: CashAdvanceStatuses.cancelled,
        summary: formatPartOfTotalPercentage(cancelledCount, advances.length),
        value: cancelledCount,
        isActive: statusFilter === CashAdvanceStatuses.cancelled,
        onClick: () => setStatusFilter(CashAdvanceStatuses.cancelled),
      },
    ];
  }, [advances, setStatusFilter, statusFilter]);

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
