"use client";

import { RevolvingFundActionModes } from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  calculateRevolvingFundItemTaxFields,
  calculateRevolvingFundTotals,
  createBlankRevolvingFundItem,
  createRevolvingFundFormValues,
  formatRevolvingFundAmount,
} from "@/app/src/data/modules/cash-disbursement/revolving-fund/RevolvingFundData";
import type {
  RevolvingFundActionMode,
  RevolvingFundActionTab,
  RevolvingFundFormErrors,
  RevolvingFundFormValues,
  RevolvingFundItem,
  RevolvingFundStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { validateRevolvingFundForm } from "@/app/src/validations/modules/cash-disbursement/revolving-fund/RevolvingFundValidation";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { hasModuleDraftChanges } from "@/app/src/hooks/shared/module/useModuleDraftChanges";
import {
  createRevolvingFundApi,
  fetchNextRevolvingFundNo,
  fetchRevolvingFundById,
  updateRevolvingFundApi,
  updateRevolvingFundStatusApi,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund/RevolvingFundApi";
import { RevolvingFundQueryKeys } from "@/app/src/services/modules/cash-disbursement/revolving-fund/RevolvingFundQueryKeys";

export function useRevolvingFundActionPage(options: { mode: RevolvingFundActionMode; onSaved?: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const isReadonly = mode === RevolvingFundActionModes.View;

  const recordQuery = useQuery({
    queryKey: RevolvingFundQueryKeys.record(params.recordId),
    queryFn: () => fetchRevolvingFundById(params.recordId!),
    enabled: Boolean(params.recordId) && mode !== RevolvingFundActionModes.Add,
  });

  const record = recordQuery.data;

  const [values, setValues] = useState<RevolvingFundFormValues>(() =>
    createRevolvingFundFormValues(record, "", transactionCurrency.baseCurrencyCode),
  );
  const [errors, setErrors] = useState<RevolvingFundFormErrors>({});
  const [activeTab, setActiveTab] = useState<RevolvingFundActionTab>("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const [initialValues, setInitialValues] = useState(values);
  const rawIsDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isDirty = mode === RevolvingFundActionModes.Add ? hasModuleDraftChanges(values, initialValues, ["transactionNo"]) : rawIsDirty;

  async function refreshNextTransactionNo() {
    try {
      const nextNo = await fetchNextRevolvingFundNo();

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
      const formVals = createRevolvingFundFormValues(record, record.transactionNo, record.currency || "PHP");
      queueMicrotask(() => {
        setValues(formVals);
        setInitialValues(formVals);
      });
    }
  }, [record]);

  useEffect(() => {
    if (mode === RevolvingFundActionModes.Add) {
      queueMicrotask(() => void refreshNextTransactionNo());
    }
  }, [mode]);

  const draft = useModuleDraft({
    enabled: !isReadonly,
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:revolving-fund", recordId: params.recordId }),
    setValues,
    values,
  });

  const totals = useMemo(() => calculateRevolvingFundTotals(values.items), [values.items]);

  useEffect(() => {
    if (mode !== RevolvingFundActionModes.Add || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) {
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

  function updateField<TKey extends keyof RevolvingFundFormValues>(field: TKey, value: RevolvingFundFormValues[TKey]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function calculateItem(item: RevolvingFundItem): RevolvingFundItem {
    const taxFields = calculateRevolvingFundItemTaxFields(item.amount, item.vatType, item.ewtCode);
    return { ...item, ...taxFields };
  }

  function updateItem(rowId: string, updates: Partial<RevolvingFundItem>) {
    if (isReadonly) return;
    updateField(
      "items",
      values.items.map((item) => (item.id === rowId ? calculateItem({ ...item, ...updates }) : item)),
    );
  }

  function updateItems(items: RevolvingFundItem[]) {
    updateField("items", items);
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

  function addItem() {
    if (isReadonly) return;
    updateField("items", [...values.items, createBlankRevolvingFundItem()]);
  }

  function addItems(count: number) {
    updateItems([...values.items, ...Array.from({ length: count }, createBlankRevolvingFundItem)]);
  }

  function duplicateItem(rowId: string) {
    const target = values.items.find((i) => i.id === rowId);
    if (target) {
      updateItems([...values.items, { ...target, id: `item-${Date.now()}` }]);
    }
  }

  function insertItem(rowId: string, position: "above" | "below" = "below") {
    const index = values.items.findIndex((i) => i.id === rowId);
    if (index === -1) return;
    const next = [...values.items];
    next.splice(position === "above" ? index : index + 1, 0, createBlankRevolvingFundItem());
    updateItems(next);
  }

  function moveItem(fromRowId: string, toRowId: string) {
    const fromIndex = values.items.findIndex((item) => item.id === fromRowId);
    const toIndex = values.items.findIndex((item) => item.id === toRowId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    const next = [...values.items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    updateItems(next);
  }

  function removeItem(rowId: string) {
    if (isReadonly) return;
    if (values.items.length <= 1) {
      updateField("items", [createBlankRevolvingFundItem()]);
      return;
    }
    updateField(
      "items",
      values.items.filter((item) => item.id !== rowId),
    );
  }

  const saveMutation = useMutation({
    mutationFn: async (submitValues: RevolvingFundFormValues) => {
      if (mode === RevolvingFundActionModes.Add) {
        return await createRevolvingFundApi(submitValues);
      }
      return await updateRevolvingFundApi(params.recordId!, submitValues);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RevolvingFundQueryKeys.all() });
      draft.clearDraft();
      toast.success(`Revolving Fund ${mode === RevolvingFundActionModes.Add ? "created" : "updated"} successfully.`);
      if (options.onSaved) {
        options.onSaved();
      } else {
        router.push("/cash-disbursement/revolving-fund");
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save Revolving Fund.";
      toast.error(msg);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: RevolvingFundStatus) => {
      return await updateRevolvingFundStatusApi(params.recordId!, status);
    },
    onSuccess: (updatedRecord, status) => {
      queryClient.invalidateQueries({ queryKey: RevolvingFundQueryKeys.all() });
      queryClient.setQueryData(RevolvingFundQueryKeys.record(params.recordId), updatedRecord);
      setValues((cur) => ({ ...cur, status }));
      toast.success(`Revolving Fund marked as ${status}.`);
    },
    onError: () => {
      toast.error("Could not update status.");
    },
  });

  async function submit(status?: RevolvingFundStatus) {
    const nextValues = status ? { ...values, status } : values;
    const nextErrors = validateRevolvingFundForm(nextValues);
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

  async function handleUpdateStatus(status: RevolvingFundStatus) {
    try {
      await updateStatusMutation.mutateAsync(status);
      return true;
    } catch {
      return false;
    }
  }

  async function resetAddValuesWithNextTransactionNo() {
    const nextValues = createRevolvingFundFormValues(undefined, "", transactionCurrency.baseCurrencyCode);

    try {
      const nextNo = await fetchNextRevolvingFundNo();

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

    if (mode === RevolvingFundActionModes.Add) {
      void resetAddValuesWithNextTransactionNo();
      return;
    }

    draft.discardDraft();
  }

  return {
    activeTab,
    addItem,
    addItems,
    closePreview: () => setIsPreviewOpen(false),
    currencyOptions: transactionCurrency.currencyOptions,
    discardDraft,
    draft,
    duplicateItem,
    errors,
    handleUpdateStatus,
    hasDiscardableChanges: isDirty,
    insertItem,
    isDirty,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isLoading: recordQuery.isLoading,
    isPreviewOpen,
    isReadonly,
    isRecordMissing: mode !== RevolvingFundActionModes.Add && !recordQuery.isLoading && !record,
    isSubmitting: saveMutation.isPending || updateStatusMutation.isPending,
    mode,
    moveItem,
    openPreview: () => setIsPreviewOpen(true),
    record,
    removeItem,
    save: submit,
    saveDraft: draft.saveDraft,
    setActiveTab,
    setIsPreviewOpen,
    submit,
    totals: {
      ...totals,
      formattedAmount: formatRevolvingFundAmount(totals.amount),
      formattedDisburseAmount: formatRevolvingFundAmount(totals.disburseAmount),
      formattedEwtAmount: formatRevolvingFundAmount(totals.ewtAmount),
      formattedGrossAmount: formatRevolvingFundAmount(totals.grossAmount),
      formattedNetAmount: formatRevolvingFundAmount(totals.netAmount),
      formattedVatAmount: formatRevolvingFundAmount(totals.vatAmount),
    },
    updateCurrency,
    updateField,
    updateItem,
    updateItems,
    updateStatus: handleUpdateStatus,
    validate: (status?: RevolvingFundStatus) => {
      const nextValues = status ? { ...values, status } : values;
      const errs = validateRevolvingFundForm(nextValues);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    values,
  };
}
