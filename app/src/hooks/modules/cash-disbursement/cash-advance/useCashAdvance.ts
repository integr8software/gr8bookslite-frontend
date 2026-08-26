"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import { ReceiptText } from "lucide-react";
import {
  createCashAdvanceFormValues,
  createCashAdvanceFormValuesFromRecord,
  createCashAdvanceRecordFromForm,
  getInitialCashAdvances,
  writeStoredCashAdvances,
} from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import { formatMoneyNumberDisplayValue, parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { syncTaxDetailsAmount } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import {
  CashAdvanceDefaultColumnVisibility,
  CashAdvanceAllStatusFilter,
  CashAdvanceStatusFilters,
  CashAdvanceStatuses,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type {
  CashAdvanceActionMode,
  CashAdvanceFormValues,
  CashAdvanceRecord,
  CashAdvanceReferenceField,
  CashAdvanceStatus,
  CashAdvanceStoreState,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import {
  validateCashAdvanceAmountWithinBalance,
  validateCashAdvanceForm,
} from "@/app/src/validations/modules/cash-disbursement/cash-advance/CashAdvanceValidation";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import type { AppTaxRateDialogValue } from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { normalizeLowercaseWhitespace } from "@/app/src/utils/string.util";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";

export function useCashAdvanceStore<TSelected = CashAdvanceStoreState>(selector?: (state: CashAdvanceStoreState) => TSelected) {
  const [advances, setAdvances] = useState(getInitialCashAdvances);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());
  const refreshRecords = useCallback(() => {
    setAdvances(getInitialCashAdvances());
    setLastSyncedAt(Date.now());
  }, []);
  const updateAdvanceStatus = useCallback((record: CashAdvanceRecord, status: CashAdvanceStatus) => {
    const updatedAt = new Date().toISOString();
    setAdvances((currentAdvances) => {
      const nextAdvances = currentAdvances.map((currentRecord) =>
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

      writeStoredCashAdvances(nextAdvances);
      return nextAdvances;
    });
    setLastSyncedAt(Date.now());
    toast.success(`Cash Advance Marked as ${status}.`);
  }, []);

  const state = useMemo<CashAdvanceStoreState>(
    () => ({
      advances,
      isLoading: false,
      lastSyncedAt,
      refreshRecords,
      updateAdvanceStatus,
    }),
    [advances, lastSyncedAt, refreshRecords, updateAdvanceStatus],
  );

  return selector ? selector(state) : (state as TSelected);
}

export function useCashAdvanceActionForm(mode: CashAdvanceActionMode, recordId?: string, onSaved?: (record: CashAdvanceRecord) => void) {
  const transactionCurrency = useTransactionCurrency();
  const initialRecord = mode === "add" ? null : (getInitialCashAdvances().find((advance) => advance.id === recordId) ?? null);
  const [loadedRecord, setLoadedRecord] = useState<CashAdvanceRecord | null>(initialRecord);
  const [values, setValues] = useState<CashAdvanceFormValues>(() =>
    initialRecord
      ? createCashAdvanceFormValuesFromRecord(initialRecord)
      : createCashAdvanceFormValues(transactionCurrency.baseCurrencyCode),
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
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:cash-advance", recordId }),
    restoreValues: restoreCashAdvanceDraftValues,
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
      fxRate: "1.00",
    }));
  }, [mode, transactionCurrency.baseCurrencyCode, transactionCurrency.isBaseCurrencyResolved]);

  function updateField<Key extends keyof CashAdvanceFormValues>(key: Key, value: CashAdvanceFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateAmount(amount: string) {
    setValues((current) => {
      const cashAdvanceBalance = current.cashAdvanceBalance ?? "";
      const balance = parseMoneyNumberInput(cashAdvanceBalance);
      const nextAmount =
        cashAdvanceBalance.trim() && parseMoneyNumberInput(amount) > balance ? formatMoneyNumberDisplayValue(balance) : amount;

      return {
        ...current,
        amount: nextAmount,
        taxValue: {
          ...current.taxValue,
          taxDetails: syncTaxDetailsAmount(current.taxValue.taxDetails, parseMoneyNumberInput(nextAmount), current.taxValue.taxRate),
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
    setValues((current) => ({
      ...current,
      amount: formatMoneyNumberDisplayValue(taxValue.taxDetails.grossAmount || ""),
      taxValue,
    }));
  }

  function submitAdvance(status: CashAdvanceStatus = CashAdvanceStatuses.forApproval) {
    if (mode === "view" || isSubmittingRef.current) return false;
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return false;
    }
    const releaseSubmitLock = acquireModuleActionLock(`cash-disbursement:cash-advance:submit:${mode}:${recordId ?? values.transNo}`);
    if (!releaseSubmitLock) return false;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const nextValues = { ...values, status };
    const shouldValidate = status !== CashAdvanceStatuses.draft;
    const balanceValidation = validateCashAdvanceAmountWithinBalance(nextValues);
    const validation = !balanceValidation.isValid
      ? balanceValidation
      : shouldValidate
        ? validateCashAdvanceForm(nextValues)
        : { isValid: true, message: null };

    if (!validation.isValid) {
      toast.error(validation.message ?? "Review the Cash Advance details.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }

    try {
      const nextRecord = createCashAdvanceRecordFromForm(nextValues, mode === "edit" ? (loadedRecord ?? undefined) : undefined);
      const nextAdvances = upsertCashAdvanceRecord(nextRecord);
      writeStoredCashAdvances(nextAdvances);
      setLoadedRecord(nextRecord);
      setValues(nextValues);
      draft.clearDraft();
      toast.success(mode === "edit" ? "Cash Advance Updated." : "Cash Advance Saved.");
      onSaved?.(nextRecord);
      return true;
    } catch {
      toast.error("Could not save the Cash Advance. Please try again.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }
  }

  function updateAdvanceStatus(status: CashAdvanceStatus) {
    if (!loadedRecord) {
      return;
    }
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:cash-advance:status:${loadedRecord.id}:${status}`);
    if (!releaseActionLock) return;

    try {
      const updatedAt = new Date().toISOString();
      const nextValues = { ...values, status };
      const nextRecord: CashAdvanceRecord = {
        ...loadedRecord,
        formValues: {
          ...nextValues,
          attachments: nextValues.attachments.map((attachment) => ({ ...attachment })),
          taxValue: {
            ...nextValues.taxValue,
            taxDetails: { ...nextValues.taxValue.taxDetails },
          },
        },
        status,
        updatedAt,
        updatedBy: "Current User",
      };
      const nextAdvances = upsertCashAdvanceRecord(nextRecord);
      writeStoredCashAdvances(nextAdvances);
      setLoadedRecord(nextRecord);
      setValues(nextValues);
      toast.success(`Cash Advance Marked as ${status}.`);
    } catch {
      toast.error("Could not update the Cash Advance. Please try again.");
      releaseActionLock();
    }
  }

  function validateAdvance(status: CashAdvanceStatus = CashAdvanceStatuses.forApproval): boolean {
    if (mode === "view" || isSubmittingRef.current) return false;
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return false;
    }
    const nextValues = { ...values, status };
    const shouldValidate = status !== CashAdvanceStatuses.draft;
    const balanceValidation = validateCashAdvanceAmountWithinBalance(nextValues);
    const validation = !balanceValidation.isValid
      ? balanceValidation
      : shouldValidate
        ? validateCashAdvanceForm(nextValues)
        : { isValid: true, message: null };

    if (!validation.isValid) {
      toast.error(validation.message ?? "Review the Cash Advance details.");
      return false;
    }
    return true;
  }

  return {
    discardDraft: draft.discardDraft,
    hasDiscardableChanges: isDirty,
    saveDraft: draft.saveDraft,
    currencyOptions: transactionCurrency.currencyOptions,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isSubmitting,
    isRecordMissing: mode !== "add" && !initialRecord,
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
  return {
    ...currentValues,
    ...draftValues,
    attachments: draftValues.attachments ?? currentValues.attachments,
    cashAdvanceBalance: draftValues.cashAdvanceBalance ?? "",
    cashAdvanceLimit: draftValues.cashAdvanceLimit ?? "",
    referenceFields: {
      ...currentValues.referenceFields,
      ...draftValues.referenceFields,
    },
    taxValue: draftValues.taxValue ?? currentValues.taxValue,
  };
}

export function useCashAdvanceTable(advances: CashAdvanceRecord[]) {
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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(CashAdvanceDefaultColumnVisibility);
  const [statusFilter, setStatusFilterState] = useState<(typeof CashAdvanceStatusFilters)[number]>(CashAdvanceAllStatusFilter);
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
            record.formValues?.currency,
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
        size: TransactionOverviewColumnWidths.transactionNumber,
        meta: { label: "Cash Advance No." },
      },
      {
        accessorKey: "documentDate",
        id: "documentDate",
        header: "Document Date",
        size: TransactionOverviewColumnWidths.documentDate,
        meta: { label: "Document Date" },
      },
      {
        accessorKey: "partyCode",
        id: "partyCode",
        header: "Party Code",
        size: TransactionOverviewColumnWidths.partyCode,
        meta: { label: "Party Code" },
      },
      {
        accessorKey: "partyName",
        id: "partyName",
        header: "Party Name",
        size: TransactionOverviewColumnWidths.partyName,
        meta: { label: "Party Name" },
      },
      {
        accessorKey: "accountCode",
        id: "accountCode",
        header: "Account Code",
        size: TransactionOverviewColumnWidths.accountCode,
        meta: { label: "Account Code" },
      },
      {
        accessorFn: (record) => record.accountCode,
        id: "accountTitle",
        header: "Account Title",
        size: TransactionOverviewColumnWidths.accountTitle,
        meta: { label: "Account Title" },
      },
      {
        accessorFn: (record) => record.formValues?.currency ?? "PHP",
        id: "currency",
        header: "Currency",
        size: TransactionOverviewColumnWidths.currency,
        meta: { label: "Currency" },
      },
      {
        accessorKey: "amount",
        id: "amount",
        header: "Total Amount",
        size: TransactionOverviewColumnWidths.amount,
        meta: { label: "Total Amount" },
      },
      {
        accessorKey: "remarks",
        id: "remarks",
        header: "Remarks",
        size: TransactionOverviewColumnWidths.remarks,
        meta: { label: "Remarks" },
      },
      {
        accessorKey: "createdBy",
        id: "createdBy",
        header: "Created By",
        size: TransactionOverviewColumnWidths.auditUser,
        meta: { label: "Created By" },
      },
      {
        accessorKey: "createdAt",
        id: "createdAt",
        header: "Date Created",
        sortingFn: "datetime",
        size: TransactionOverviewColumnWidths.auditDate,
        meta: { label: "Date Created" },
      },
      {
        accessorKey: "updatedBy",
        id: "updatedBy",
        header: "Updated By",
        size: TransactionOverviewColumnWidths.auditUser,
        meta: { label: "Updated By" },
      },
      {
        accessorKey: "updatedAt",
        id: "updatedAt",
        header: "Date Modified",
        sortingFn: "datetime",
        size: TransactionOverviewColumnWidths.auditDate,
        meta: { label: "Date Modified" },
      },
      {
        accessorKey: "status",
        id: "status",
        header: "Status",
        size: TransactionOverviewColumnWidths.status,
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
        size: TransactionOverviewColumnWidths.actions,
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
      columnVisibility: CashAdvanceDefaultColumnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: { columnVisibility, pagination, sorting },
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
        label: "Total Entries",
        summary: "All time",
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

function upsertCashAdvanceRecord(record: CashAdvanceRecord) {
  const currentAdvances = getInitialCashAdvances();
  const existingIndex = currentAdvances.findIndex((advance) => advance.id === record.id);

  if (existingIndex === -1) {
    return [record, ...currentAdvances];
  }

  return currentAdvances.map((advance) => (advance.id === record.id ? record : advance));
}
