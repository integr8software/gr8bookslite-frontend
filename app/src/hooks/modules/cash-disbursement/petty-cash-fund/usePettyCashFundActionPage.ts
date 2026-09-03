"use client";

import { PettyCashFundActionModes } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  calculatePettyCashFundItemTaxFields,
  calculatePettyCashFundTotals,
  createBlankPettyCashFundItem,
  createPettyCashFundFormValues,
  formatPettyCashFundAmount,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-fund/PettyCashFundData";
import type {
  PettyCashFundActionMode,
  PettyCashFundActionTab,
  PettyCashFundFormErrors,
  PettyCashFundFormValues,
  PettyCashFundItem,
  PettyCashFundStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { validatePettyCashFundForm } from "@/app/src/validations/modules/cash-disbursement/petty-cash-fund/PettyCashFundValidation";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { hasModuleDraftChanges } from "@/app/src/hooks/shared/module/useModuleDraftChanges";
import {
  createPettyCashFundApi,
  fetchNextPettyCashFundNo,
  fetchPettyCashFundById,
  updatePettyCashFundApi,
  updatePettyCashFundStatusApi,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-fund/PettyCashFundApi";
import { PettyCashFundQueryKeys } from "@/app/src/services/modules/cash-disbursement/petty-cash-fund/PettyCashFundQueryKeys";

export function usePettyCashFundActionPage(options: { mode: PettyCashFundActionMode; onSaved?: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const isReadonly = mode === PettyCashFundActionModes.View;

  const recordQuery = useQuery({
    queryKey: PettyCashFundQueryKeys.record(params.recordId),
    queryFn: () => fetchPettyCashFundById(params.recordId!),
    enabled: Boolean(params.recordId) && mode !== PettyCashFundActionModes.Add,
  });

  const record = recordQuery.data;

  const [values, setValues] = useState<PettyCashFundFormValues>(() =>
    createPettyCashFundFormValues(record, "", transactionCurrency.baseCurrencyCode),
  );
  const [errors, setErrors] = useState<PettyCashFundFormErrors>({});
  const [activeTab, setActiveTab] = useState<PettyCashFundActionTab>("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const [initialValues, setInitialValues] = useState(values);
  const rawIsDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isDirty = mode === PettyCashFundActionModes.Add ? hasModuleDraftChanges(values, initialValues, ["transactionNo"]) : rawIsDirty;

  async function refreshNextTransactionNo() {
    try {
      const nextNo = await fetchNextPettyCashFundNo();

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
      const formVals = createPettyCashFundFormValues(record, record.transactionNo, record.currency || "PHP");
      queueMicrotask(() => {
        setValues(formVals);
        setInitialValues(formVals);
      });
    }
  }, [record]);

  useEffect(() => {
    if (mode === PettyCashFundActionModes.Add) {
      queueMicrotask(() => void refreshNextTransactionNo());
    }
  }, [mode]);

  const draft = useModuleDraft({
    enabled: !isReadonly,
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:petty-cash-fund", recordId: params.recordId }),
    setValues,
    values,
  });

  const totals = useMemo(() => calculatePettyCashFundTotals(values.items), [values.items]);

  useEffect(() => {
    if (mode !== PettyCashFundActionModes.Add || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) {
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

  function updateField<TKey extends keyof PettyCashFundFormValues>(field: TKey, value: PettyCashFundFormValues[TKey]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function calculateItem(item: PettyCashFundItem): PettyCashFundItem {
    const taxFields = calculatePettyCashFundItemTaxFields(item.amount, item.vatType, item.ewtCode);
    return { ...item, ...taxFields };
  }

  function updateItem(rowId: string, updates: Partial<PettyCashFundItem>) {
    if (isReadonly) return;
    updateField(
      "items",
      values.items.map((item) => (item.id === rowId ? calculateItem({ ...item, ...updates }) : item)),
    );
  }

  function updateItems(items: PettyCashFundItem[]) {
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
    updateField("items", [...values.items, createBlankPettyCashFundItem()]);
  }

  function addItems(count: number) {
    updateItems([...values.items, ...Array.from({ length: count }, createBlankPettyCashFundItem)]);
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
    next.splice(position === "above" ? index : index + 1, 0, createBlankPettyCashFundItem());
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
      updateField("items", [createBlankPettyCashFundItem()]);
      return;
    }
    updateField(
      "items",
      values.items.filter((item) => item.id !== rowId),
    );
  }

  const saveMutation = useMutation({
    mutationFn: async (submitValues: PettyCashFundFormValues) => {
      if (mode === PettyCashFundActionModes.Add) {
        return await createPettyCashFundApi(submitValues);
      }
      return await updatePettyCashFundApi(params.recordId!, submitValues);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PettyCashFundQueryKeys.all() });
      draft.clearDraft();
      toast.success(`Petty Cash Fund ${mode === PettyCashFundActionModes.Add ? "created" : "updated"} successfully.`);
      if (options.onSaved) {
        options.onSaved();
      } else {
        router.push("/cash-disbursement/petty-cash-fund");
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save Petty Cash Fund.";
      toast.error(msg);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: PettyCashFundStatus) => {
      return await updatePettyCashFundStatusApi(params.recordId!, status);
    },
    onSuccess: (updatedRecord, status) => {
      queryClient.invalidateQueries({ queryKey: PettyCashFundQueryKeys.all() });
      queryClient.setQueryData(PettyCashFundQueryKeys.record(params.recordId), updatedRecord);
      setValues((cur) => ({ ...cur, status }));
      toast.success(`Petty Cash Fund marked as ${status}.`);
    },
    onError: () => {
      toast.error("Could not update status.");
    },
  });

  async function submit(status?: PettyCashFundStatus) {
    if (isReadonly) return false;
    const valuesToValidate = status ? { ...values, status } : values;
    const validationErrors = validatePettyCashFundForm(valuesToValidate);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fill in all required fields correctly.");
      return false;
    }

    try {
      await saveMutation.mutateAsync(valuesToValidate);
      return true;
    } catch {
      return false;
    }
  }

  async function handleUpdateStatus(status: PettyCashFundStatus) {
    try {
      await updateStatusMutation.mutateAsync(status);
      return true;
    } catch {
      return false;
    }
  }

  async function resetAddValuesWithNextTransactionNo() {
    const nextValues = createPettyCashFundFormValues(undefined, "", transactionCurrency.baseCurrencyCode);

    try {
      const nextNo = await fetchNextPettyCashFundNo();

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

    if (mode === PettyCashFundActionModes.Add) {
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
    isRecordMissing: mode !== PettyCashFundActionModes.Add && !recordQuery.isLoading && !record,
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
      formattedAmount: formatPettyCashFundAmount(totals.amount),
      formattedDisburseAmount: formatPettyCashFundAmount(totals.disburseAmount),
      formattedEwtAmount: formatPettyCashFundAmount(totals.ewtAmount),
      formattedGrossAmount: formatPettyCashFundAmount(totals.grossAmount),
      formattedNetAmount: formatPettyCashFundAmount(totals.netAmount),
      formattedVatAmount: formatPettyCashFundAmount(totals.vatAmount),
    },
    updateCurrency,
    updateField,
    updateItem,
    updateItems,
    updateStatus: handleUpdateStatus,
    validate: (status?: PettyCashFundStatus) => {
      const nextValues = status ? { ...values, status } : values;
      const errs = validatePettyCashFundForm(nextValues);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    values,
  };
}
