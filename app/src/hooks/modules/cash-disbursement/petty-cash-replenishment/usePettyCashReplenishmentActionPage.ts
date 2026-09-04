"use client";

import { PettyCashReplenishmentActionModes } from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  applyPettyCashFundToReplenishmentForm,
  calculatePettyCashReplenishmentItemTaxFields,
  calculatePettyCashReplenishmentTotals,
  createBlankPettyCashReplenishmentEntry,
  createPettyCashReplenishmentFormValues,
  formatPettyCashReplenishmentAmount,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentData";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { hasModuleDraftChanges } from "@/app/src/hooks/shared/module/useModuleDraftChanges";
import type {
  PettyCashReplenishmentActionMode,
  PettyCashReplenishmentActionTab,
  PettyCashReplenishmentEntry,
  PettyCashReplenishmentFormErrors,
  PettyCashReplenishmentFormValues,
  PettyCashReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import { validatePettyCashReplenishmentForm } from "@/app/src/validations/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentValidation";
import {
  createPettyCashReplenishmentApi,
  fetchNextPettyCashReplenishmentNo,
  fetchPettyCashReplenishmentById,
  updatePettyCashReplenishmentApi,
  updatePettyCashReplenishmentStatusApi,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentApi";
import { PettyCashReplenishmentQueryKeys } from "@/app/src/services/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentQueryKeys";

export function usePettyCashReplenishmentActionPage(options: { mode: PettyCashReplenishmentActionMode; onSaved?: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const isReadonly = mode === PettyCashReplenishmentActionModes.View;

  const recordQuery = useQuery({
    queryKey: PettyCashReplenishmentQueryKeys.record(params.recordId),
    queryFn: () => fetchPettyCashReplenishmentById(params.recordId!),
    enabled: Boolean(params.recordId) && mode !== PettyCashReplenishmentActionModes.Add,
  });

  const record = recordQuery.data;

  const [values, setValues] = useState<PettyCashReplenishmentFormValues>(() =>
    createPettyCashReplenishmentFormValues(record, "", transactionCurrency.baseCurrencyCode),
  );
  const [errors, setErrors] = useState<PettyCashReplenishmentFormErrors>({});
  const [activeTab, setActiveTab] = useState<PettyCashReplenishmentActionTab>("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const [initialValues, setInitialValues] = useState(values);
  const rawIsDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isDirty =
    mode === PettyCashReplenishmentActionModes.Add ? hasModuleDraftChanges(values, initialValues, ["transactionNo"]) : rawIsDirty;

  async function refreshNextTransactionNo() {
    try {
      const nextNo = await fetchNextPettyCashReplenishmentNo();

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
      const formVals = createPettyCashReplenishmentFormValues(record, record.transactionNo, record.currency || "PHP");
      queueMicrotask(() => {
        setValues(formVals);
        setInitialValues(formVals);
      });
    }
  }, [record]);

  useEffect(() => {
    if (mode === PettyCashReplenishmentActionModes.Add) {
      queueMicrotask(() => void refreshNextTransactionNo());
    }
  }, [mode]);

  const draft = useModuleDraft({
    enabled: !isReadonly,
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:petty-cash-replenishment", recordId: params.recordId }),
    setValues,
    values,
  });

  const totals = useMemo(() => calculatePettyCashReplenishmentTotals(values.entries), [values.entries]);

  useEffect(() => {
    if (mode !== PettyCashReplenishmentActionModes.Add || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) return;
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

  function updateField<TKey extends keyof PettyCashReplenishmentFormValues>(field: TKey, value: PettyCashReplenishmentFormValues[TKey]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function calculateEntry(entry: PettyCashReplenishmentEntry): PettyCashReplenishmentEntry {
    const taxFields = calculatePettyCashReplenishmentItemTaxFields(entry.amount, entry.vatType, entry.ewtCode);
    return { ...entry, ...taxFields };
  }

  function updateEntry(rowId: string, updates: Partial<PettyCashReplenishmentEntry>) {
    if (isReadonly) return;
    updateField(
      "entries",
      values.entries.map((entry) => (entry.id === rowId ? calculateEntry({ ...entry, ...updates }) : entry)),
    );
  }

  function updateEntries(entries: PettyCashReplenishmentEntry[]) {
    updateField("entries", entries);
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

  function addEntry() {
    if (isReadonly) return;
    updateField("entries", [...values.entries, createBlankPettyCashReplenishmentEntry()]);
  }

  function addEntries(count: number) {
    updateEntries([...values.entries, ...Array.from({ length: count }, createBlankPettyCashReplenishmentEntry)]);
  }

  function duplicateEntry(rowId: string) {
    const target = values.entries.find((e) => e.id === rowId);
    if (target) {
      updateEntries([...values.entries, { ...target, id: `entry-${Date.now()}` }]);
    }
  }

  function insertEntry(rowId: string, position: "above" | "below" = "below") {
    const index = values.entries.findIndex((e) => e.id === rowId);
    if (index === -1) return;
    const next = [...values.entries];
    next.splice(position === "above" ? index : index + 1, 0, createBlankPettyCashReplenishmentEntry());
    updateEntries(next);
  }

  function moveEntry(fromRowId: string, toRowId: string) {
    const fromIndex = values.entries.findIndex((e) => e.id === fromRowId);
    const toIndex = values.entries.findIndex((e) => e.id === toRowId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    const next = [...values.entries];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    updateEntries(next);
  }

  function removeEntry(rowId: string) {
    if (isReadonly) return;
    if (values.entries.length <= 1) {
      updateField("entries", [createBlankPettyCashReplenishmentEntry()]);
      return;
    }
    updateField(
      "entries",
      values.entries.filter((entry) => entry.id !== rowId),
    );
  }

  const saveMutation = useMutation({
    mutationFn: async (submitValues: PettyCashReplenishmentFormValues) => {
      if (mode === PettyCashReplenishmentActionModes.Add) {
        return await createPettyCashReplenishmentApi(submitValues);
      }
      return await updatePettyCashReplenishmentApi(params.recordId!, submitValues);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PettyCashReplenishmentQueryKeys.all });
      draft.clearDraft();
      toast.success(`Petty Cash Replenishment ${mode === PettyCashReplenishmentActionModes.Add ? "created" : "updated"} successfully.`);
      if (options.onSaved) {
        options.onSaved();
      } else {
        router.push("/cash-disbursement/petty-cash-replenishment");
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save Petty Cash Replenishment.";
      toast.error(msg);
    },
  });

  async function submit(status?: PettyCashReplenishmentStatus) {
    const nextValues = status ? { ...values, status } : values;
    const nextErrors = validatePettyCashReplenishmentForm(nextValues);
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

  const updateStatusMutation = useMutation({
    mutationFn: async (status: PettyCashReplenishmentStatus) => {
      return await updatePettyCashReplenishmentStatusApi(params.recordId!, status);
    },
    onSuccess: (updatedRecord, status) => {
      queryClient.invalidateQueries({ queryKey: PettyCashReplenishmentQueryKeys.all });
      queryClient.setQueryData(PettyCashReplenishmentQueryKeys.record(params.recordId), updatedRecord);
      setValues((current) => ({ ...current, status }));
      setInitialValues((current) => ({ ...current, status }));
      toast.success(`Petty Cash Replenishment status updated to ${status}.`);
    },
    onError: () => {
      toast.error("Failed to update Petty Cash Replenishment status.");
    },
  });

  async function handleUpdateStatus(status: PettyCashReplenishmentStatus): Promise<boolean> {
    if (!params.recordId) return false;
    try {
      await updateStatusMutation.mutateAsync(status);
      return true;
    } catch {
      return false;
    }
  }

  async function resetAddValuesWithNextTransactionNo() {
    const nextValues = createPettyCashReplenishmentFormValues(undefined, "", transactionCurrency.baseCurrencyCode);

    try {
      const nextNo = await fetchNextPettyCashReplenishmentNo();

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

    if (mode === PettyCashReplenishmentActionModes.Add) {
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
    applyFundRecord: (fund: Parameters<typeof applyPettyCashFundToReplenishmentForm>[1]) => {
      const nextValues = applyPettyCashFundToReplenishmentForm(values, fund);
      setValues(nextValues);
    },
    closePreview: () => setIsPreviewOpen(false),
    copyFromRecords: [],
    pettyCashFundCopyFromRecords: [],
    copyFromPettyCashFund: () => undefined,
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
    isRecordMissing: mode !== PettyCashReplenishmentActionModes.Add && !recordQuery.isLoading && !record,
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
      formattedAmount: formatPettyCashReplenishmentAmount(totals.totalAmount),
      formattedNetAmount: formatPettyCashReplenishmentAmount(totals.netAmount),
      formattedVatAmount: formatPettyCashReplenishmentAmount(totals.vatAmount),
      formattedEwtAmount: formatPettyCashReplenishmentAmount(totals.ewtAmount),
      formattedDisburseAmount: formatPettyCashReplenishmentAmount(totals.disburseAmount),
    },
    updateCurrency,
    updateEntries,
    updateEntry,
    updateField,
    updateStatus: handleUpdateStatus,
    validate: (status?: PettyCashReplenishmentStatus) => {
      const nextValues = status ? { ...values, status } : values;
      const errs = validatePettyCashReplenishmentForm(nextValues);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    values,
  };
}
