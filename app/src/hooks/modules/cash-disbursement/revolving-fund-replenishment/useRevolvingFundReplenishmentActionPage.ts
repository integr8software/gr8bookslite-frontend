"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  calculateRevolvingFundReplenishmentTotals,
  createBlankRevolvingFundReplenishmentEntry,
  createRevolvingFundReplenishmentFormValues,
  formatRevolvingFundReplenishmentAmount,
} from "@/app/src/data/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentData";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { hasModuleDraftChanges } from "@/app/src/hooks/shared/module/useModuleDraftChanges";
import type {
  RevolvingFundReplenishmentActionMode,
  RevolvingFundReplenishmentActionTab,
  RevolvingFundReplenishmentEntry,
  RevolvingFundReplenishmentFormErrors,
  RevolvingFundReplenishmentFormValues,
  RevolvingFundReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { validateRevolvingFundReplenishmentForm } from "@/app/src/validations/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentValidation";
import {
  createRevolvingFundReplenishmentApi,
  fetchNextRevolvingFundReplenishmentNo,
  fetchRevolvingFundReplenishmentById,
  updateRevolvingFundReplenishmentApi,
  updateRevolvingFundReplenishmentStatusApi,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentApi";
import {
  CashDisbursementActionModeAdd,
  createCashDisbursementModuleQueryKey,
  createCashDisbursementRecordQueryKey,
} from "@/app/src/constants/modules/cash-disbursement/CashDisbursementConstants";

const RevolvingFundReplenishmentQueryKey = "revolving-fund-replenishment";

export function useRevolvingFundReplenishmentActionPage(options: { mode: RevolvingFundReplenishmentActionMode; onSaved?: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const isReadonly = mode === "view";

  const recordQuery = useQuery({
    queryKey: createCashDisbursementRecordQueryKey(RevolvingFundReplenishmentQueryKey, params.recordId),
    queryFn: () => fetchRevolvingFundReplenishmentById(params.recordId!),
    enabled: Boolean(params.recordId) && mode !== CashDisbursementActionModeAdd,
  });

  const record = recordQuery.data;

  const [values, setValues] = useState<RevolvingFundReplenishmentFormValues>(() =>
    createRevolvingFundReplenishmentFormValues(record, "", transactionCurrency.baseCurrencyCode),
  );
  const [errors, setErrors] = useState<RevolvingFundReplenishmentFormErrors>({});
  const [activeTab, setActiveTab] = useState<RevolvingFundReplenishmentActionTab>("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const [initialValues, setInitialValues] = useState(values);
  const rawIsDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isDirty = mode === CashDisbursementActionModeAdd ? hasModuleDraftChanges(values, initialValues, ["transactionNo"]) : rawIsDirty;

  async function refreshNextTransactionNo() {
    try {
      const nextNo = await fetchNextRevolvingFundReplenishmentNo();

      if (nextNo) {
        setValues((current) => ({ ...current, transactionNo: nextNo }));
        setInitialValues((current) => ({ ...current, transactionNo: nextNo }));
      }
    } catch {
      // Keep the current add form if the number endpoint is temporarily unavailable.
    }
  }

  useEffect(() => {
    if (record) {
      const formVals = createRevolvingFundReplenishmentFormValues(record, record.transactionNo, record.currency || "PHP");
      queueMicrotask(() => {
        setValues(formVals);
        setInitialValues(formVals);
      });
    }
  }, [record]);

  useEffect(() => {
    if (mode === CashDisbursementActionModeAdd) {
      queueMicrotask(() => void refreshNextTransactionNo());
    }
  }, [mode]);

  const draft = useModuleDraft({
    enabled: !isReadonly,
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:revolving-fund-replenishment", recordId: params.recordId }),
    setValues,
    values,
  });

  const totals = useMemo(() => calculateRevolvingFundReplenishmentTotals(values.entries), [values.entries]);

  useEffect(() => {
    if (mode !== CashDisbursementActionModeAdd || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) return;
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

  function updateField<TKey extends keyof RevolvingFundReplenishmentFormValues>(
    field: TKey,
    value: RevolvingFundReplenishmentFormValues[TKey],
  ) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateEntry(rowId: string, updates: Partial<RevolvingFundReplenishmentEntry>) {
    if (isReadonly) return;
    updateField(
      "entries",
      values.entries.map((entry) => (entry.id === rowId ? { ...entry, ...updates } : entry)),
    );
  }

  function updateEntries(entries: RevolvingFundReplenishmentEntry[]) {
    updateField("entries", entries);
  }

  function addEntries(count: number) {
    updateEntries([...values.entries, ...Array.from({ length: count }, createBlankRevolvingFundReplenishmentEntry)]);
  }

  function duplicateEntry(rowId: string) {
    const target = values.entries.find((i) => i.id === rowId);
    if (target) {
      updateEntries([...values.entries, { ...target, id: `detail-${Date.now()}` }]);
    }
  }
  function insertEntry(rowId: string, position: "above" | "below" = "below") {
    const index = values.entries.findIndex((i) => i.id === rowId);
    const targetIndex = index === -1 ? values.entries.length : position === "above" ? index : index + 1;
    const next = [...values.entries];
    next.splice(targetIndex, 0, createBlankRevolvingFundReplenishmentEntry());
    updateEntries(next);
  }
  function moveEntry(fromRowId: string, toRowId: string) {
    const fromIndex = values.entries.findIndex((i) => i.id === fromRowId);
    const toIndex = values.entries.findIndex((i) => i.id === toRowId);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = [...values.entries];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    updateEntries(next);
  }
  function addEntry() {
    addEntries(1);
  }

  function removeEntry(rowId: string) {
    if (values.entries.length > 1) {
      updateEntries(values.entries.filter((entry) => entry.id !== rowId));
    } else {
      toast.error("At least one entry is required.");
    }
  }

  async function updateCurrency(currencyCode: string) {
    hasEditedCurrencyRef.current = true;
    updateField("currency", currencyCode);
    setErrors((current) => ({ ...current, currency: undefined, exchangeRate: undefined }));

    try {
      const exchangeRate = await transactionCurrency.loadExchangeRate(currencyCode);
      if (exchangeRate != null) {
        updateField("exchangeRate", formatLoadedExchangeRate(exchangeRate));
      }
    } catch {
      toast.error("Could not load exchange rate.");
    }
  }

  const saveMutation = useMutation({
    mutationFn: async (submitValues: RevolvingFundReplenishmentFormValues) => {
      if (mode === CashDisbursementActionModeAdd) {
        return await createRevolvingFundReplenishmentApi(submitValues);
      }
      return await updateRevolvingFundReplenishmentApi(params.recordId!, submitValues);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createCashDisbursementModuleQueryKey(RevolvingFundReplenishmentQueryKey) });
      draft.clearDraft();
      toast.success(`Revolving Fund Replenishment ${mode === CashDisbursementActionModeAdd ? "created" : "updated"} successfully.`);
      if (options.onSaved) {
        options.onSaved();
      } else {
        router.push("/cash-disbursement/revolving-fund-replenishment");
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save Revolving Fund Replenishment.";
      toast.error(msg);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: RevolvingFundReplenishmentStatus) => {
      return await updateRevolvingFundReplenishmentStatusApi(params.recordId!, status);
    },
    onSuccess: (updatedRecord, status) => {
      queryClient.invalidateQueries({ queryKey: createCashDisbursementModuleQueryKey(RevolvingFundReplenishmentQueryKey) });
      queryClient.setQueryData(createCashDisbursementRecordQueryKey(RevolvingFundReplenishmentQueryKey, params.recordId), updatedRecord);
      setValues((cur) => ({ ...cur, status }));
      toast.success(`Revolving Fund Replenishment marked as ${status}.`);
    },
    onError: () => {
      toast.error("Could not update status.");
    },
  });

  async function submit(status?: RevolvingFundReplenishmentStatus) {
    const nextValues = status ? { ...values, status } : values;
    const nextErrors = validateRevolvingFundReplenishmentForm(nextValues);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please Fill Up the Required Fields!");
      return false;
    }

    try {
      await saveMutation.mutateAsync(nextValues);
      return true;
    } catch {
      return false;
    }
  }

  async function handleUpdateStatus(status: RevolvingFundReplenishmentStatus) {
    try {
      await updateStatusMutation.mutateAsync(status);
      return true;
    } catch {
      return false;
    }
  }

  async function resetAddValuesWithNextTransactionNo() {
    const nextValues = createRevolvingFundReplenishmentFormValues(undefined, "", transactionCurrency.baseCurrencyCode);

    try {
      const nextNo = await fetchNextRevolvingFundReplenishmentNo();

      if (nextNo) {
        nextValues.transactionNo = nextNo;
      }
    } catch {
      // Keep the blank add form if the number endpoint is temporarily unavailable.
    }

    setValues(nextValues);
    setInitialValues(nextValues);
  }

  function discardDraft() {
    draft.clearDraft();

    if (mode === CashDisbursementActionModeAdd) {
      void resetAddValuesWithNextTransactionNo();
      return;
    }

    draft.discardDraft();
  }

  return {
    activeTab,
    duplicateEntry,
    insertEntry,
    moveEntry,
    addEntries,
    addEntry,
    applyFundRecord: () => {},
    closePreview: () => setIsPreviewOpen(false),
    currencyOptions: transactionCurrency.currencyOptions,
    discardDraft,
    draft,
    errors,
    handleUpdateStatus,
    hasDiscardableChanges: isDirty,
    isDirty,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isLoading: recordQuery.isLoading,
    isPreviewOpen,
    isReadonly,
    isRecordMissing: mode !== CashDisbursementActionModeAdd && !recordQuery.isLoading && !record,
    isSubmitting: saveMutation.isPending || updateStatusMutation.isPending,
    mode,
    openPreview: () => setIsPreviewOpen(true),
    record,
    removeEntry,
    save: submit,
    saveDraft: draft.saveDraft,
    setActiveTab,
    setIsPreviewOpen,
    submit,
    totals: {
      ...totals,
      formattedAmount: formatRevolvingFundReplenishmentAmount(totals.totalAmount),
      formattedNetAmount: formatRevolvingFundReplenishmentAmount(totals.netAmount),
      formattedVatAmount: formatRevolvingFundReplenishmentAmount(totals.vatAmount),
      formattedEwtAmount: formatRevolvingFundReplenishmentAmount(totals.ewtAmount),
      formattedDisburseAmount: formatRevolvingFundReplenishmentAmount(totals.disburseAmount),
    },
    updateCurrency,
    updateEntries,
    updateEntry,
    updateField,
    updateStatus: handleUpdateStatus,
    validate: (status?: RevolvingFundReplenishmentStatus) => {
      const nextValues = status ? { ...values, status } : values;
      const errs = validateRevolvingFundReplenishmentForm(nextValues);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    values,
  };
}
