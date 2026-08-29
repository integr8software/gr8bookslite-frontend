"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  applyPettyCashFundToReplenishmentForm,
  calculatePettyCashReplenishmentTotals,
  createBlankPettyCashReplenishmentEntry,
  createPettyCashReplenishmentFormValues,
  formatPettyCashReplenishmentAmount,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentData";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
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

export function usePettyCashReplenishmentActionPage(options: { mode: PettyCashReplenishmentActionMode; onSaved?: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const isReadonly = mode === "view";

  const recordQuery = useQuery({
    queryKey: ["cash-disbursement", "petty-cash-replenishment", params.recordId],
    queryFn: () => fetchPettyCashReplenishmentById(params.recordId!),
    enabled: Boolean(params.recordId) && mode !== "add",
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
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  useEffect(() => {
    if (record) {
      const formVals = createPettyCashReplenishmentFormValues(record, record.transactionNo, record.currency || "PHP");
      setValues(formVals);
      setInitialValues(formVals);
    }
  }, [record]);

  useEffect(() => {
    if (mode === "add") {
      fetchNextPettyCashReplenishmentNo()
        .then((nextNo) => {
          if (nextNo) {
            setValues((cur) => ({ ...cur, transactionNo: nextNo }));
          }
        })
        .catch(() => undefined);
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
    if (mode !== "add" || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) return;
    setValues((current) => ({
      ...current,
      currency: transactionCurrency.baseCurrencyCode,
      exchangeRate: "1.00",
    }));
  }, [mode, transactionCurrency.baseCurrencyCode, transactionCurrency.isBaseCurrencyResolved]);

  function updateField<TKey extends keyof PettyCashReplenishmentFormValues>(
    field: TKey,
    value: PettyCashReplenishmentFormValues[TKey],
  ) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateEntry(rowId: string, updates: Partial<PettyCashReplenishmentEntry>) {
    if (isReadonly) return;
    updateField(
      "entries",
      values.entries.map((entry) => (entry.id === rowId ? { ...entry, ...updates } : entry)),
    );
  }

  function updateEntries(entries: PettyCashReplenishmentEntry[]) {
    updateField("entries", entries);
  }

  function addEntries(count: number) {
    updateEntries([...values.entries, ...Array.from({ length: count }, createBlankPettyCashReplenishmentEntry)]);
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

  function duplicateEntry(rowId: string) {
    const target = values.entries.find((i) => i.id === rowId);
    if (target) {
      updateEntries([...values.entries, { ...target, id: `entry-${Date.now()}` }]);
    }
  }
  function insertEntry(rowId: string, position: "above" | "below" = "below") {
    const index = values.entries.findIndex((i) => i.id === rowId);
    const targetIndex = index === -1 ? values.entries.length : position === "above" ? index : index + 1;
    const next = [...values.entries];
    next.splice(targetIndex, 0, createBlankPettyCashReplenishmentEntry());
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
    if (isReadonly) return;
    updateField("entries", [...values.entries, createBlankPettyCashReplenishmentEntry()]);
  }

  function removeEntry(rowId: string) {
    if (isReadonly) return;
    if (values.entries.length === 1) {
      toast.error("At least one voucher entry is required.");
      return;
    }
    updateField(
      "entries",
      values.entries.filter((entry) => entry.id !== rowId),
    );
  }

  const saveMutation = useMutation({
    mutationFn: async (submitValues: PettyCashReplenishmentFormValues) => {
      if (mode === "add") {
        return await createPettyCashReplenishmentApi(submitValues);
      }
      return await updatePettyCashReplenishmentApi(params.recordId!, submitValues);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-disbursement", "petty-cash-replenishment"] });
      draft.clearDraft();
      toast.success(`Petty Cash Replenishment ${mode === "add" ? "created" : "updated"} successfully.`);
      if (options.onSaved) {
        options.onSaved();
      } else {
        router.push("/cash-disbursement/petty-cash-replenishment");
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to save Petty Cash Replenishment.";
      toast.error(msg);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: PettyCashReplenishmentStatus) => {
      return await updatePettyCashReplenishmentStatusApi(params.recordId!, status);
    },
    onSuccess: (updatedRecord, status) => {
      queryClient.invalidateQueries({ queryKey: ["cash-disbursement", "petty-cash-replenishment"] });
      queryClient.setQueryData(["cash-disbursement", "petty-cash-replenishment", params.recordId], updatedRecord);
      setValues((cur) => ({ ...cur, status: status as any }));
      toast.success(`Petty Cash Replenishment marked as ${status}.`);
    },
    onError: () => {
      toast.error("Could not update status.");
    },
  });

  function submit(status?: PettyCashReplenishmentStatus) {
    const nextValues = status ? { ...values, status: status as any } : values;
    const nextErrors = validatePettyCashReplenishmentForm(nextValues);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please complete required fields before saving.");
      return;
    }

    saveMutation.mutate(nextValues);
  }

  function handleUpdateStatus(status: PettyCashReplenishmentStatus) {
    updateStatusMutation.mutate(status);
  }

  return {
    activeTab,
    duplicateEntry,
    insertEntry,
    moveEntry,
    addEntries,
    addEntry,
    applyFundRecord: (fund: any) => {
      const nextValues = applyPettyCashFundToReplenishmentForm(values, fund);
      setValues(nextValues);
    },
    closePreview: () => setIsPreviewOpen(false),
    copyFromRecords: [],
    pettyCashFundCopyFromRecords: [],
    copyFromPettyCashFund: (fund: any) => { const nextValues = applyPettyCashFundToReplenishmentForm(values, fund); setValues(nextValues); },
    currencyOptions: transactionCurrency.currencyOptions,
    discardDraft: draft.discardDraft,
    draft,
    errors,
    handleUpdateStatus,
    hasDiscardableChanges: isDirty,
    isDirty,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isLoading: recordQuery.isLoading,
    isPreviewOpen,
    isReadonly,
    isRecordMissing: mode !== "add" && !recordQuery.isLoading && !record,
    isSubmitting: saveMutation.isPending || updateStatusMutation.isPending,
    mode,
    openPreview: () => setIsPreviewOpen(true),
    record,
    removeEntry,
    save: async (status?: any) => { submit(status); return true; },
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
    updateStatus: async (status: any) => { handleUpdateStatus(status); return true; },
    validate: (status?: any) => {
      const errs = validatePettyCashReplenishmentForm(values);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    values,
  };
}
