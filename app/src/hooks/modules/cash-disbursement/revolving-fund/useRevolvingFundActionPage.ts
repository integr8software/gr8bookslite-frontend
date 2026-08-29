"use client";

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
import {
  createRevolvingFundApi,
  fetchNextRevolvingFundNo,
  fetchRevolvingFundById,
  updateRevolvingFundApi,
  updateRevolvingFundStatusApi,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund/RevolvingFundApi";

export function useRevolvingFundActionPage(options: { mode: RevolvingFundActionMode; onSaved?: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const isReadonly = mode === "view";

  const recordQuery = useQuery({
    queryKey: ["cash-disbursement", "revolving-fund", params.recordId],
    queryFn: () => fetchRevolvingFundById(params.recordId!),
    enabled: Boolean(params.recordId) && mode !== "add",
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
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  useEffect(() => {
    if (record) {
      const formVals = createRevolvingFundFormValues(record, record.transactionNo, record.currency || "PHP");
      setValues(formVals);
      setInitialValues(formVals);
    }
  }, [record]);

  useEffect(() => {
    if (mode === "add") {
      fetchNextRevolvingFundNo()
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
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:revolving-fund", recordId: params.recordId }),
    setValues,
    values,
  });

  const totals = useMemo(() => calculateRevolvingFundTotals(values.items), [values.items]);

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
    const targetIndex = index === -1 ? values.items.length : position === "above" ? index : index + 1;
    const next = [...values.items];
    next.splice(targetIndex, 0, createBlankRevolvingFundItem());
    updateItems(next);
  }
  function insertItemByIndex(index: number) {
    const next = [...values.items];
    next.splice(index, 0, createBlankRevolvingFundItem());
    updateItems(next);
  }

  function moveItem(fromRowId: string, toRowId: string) {
    const fromIndex = values.items.findIndex((i) => i.id === fromRowId);
    const toIndex = values.items.findIndex((i) => i.id === toRowId);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = [...values.items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    updateItems(next);
  }
  function moveItemByIndex(fromIndex: number, toIndex: number) {
    const next = [...values.items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    updateItems(next);
  }

  function removeItem(rowId: string) {
    if (isReadonly) return;
    if (values.items.length === 1) {
      toast.error("At least one line item is required.");
      return;
    }
    updateField(
      "items",
      values.items.filter((item) => item.id !== rowId),
    );
  }

  const saveMutation = useMutation({
    mutationFn: async (submitValues: RevolvingFundFormValues) => {
      if (mode === "add") {
        return await createRevolvingFundApi(submitValues);
      }
      return await updateRevolvingFundApi(params.recordId!, submitValues);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-disbursement", "revolving-fund"] });
      draft.clearDraft();
      toast.success(`Revolving Fund ${mode === "add" ? "created" : "updated"} successfully.`);
      if (options.onSaved) {
        options.onSaved();
      } else {
        router.push("/cash-disbursement/revolving-fund");
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to save Revolving Fund.";
      toast.error(msg);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: RevolvingFundStatus) => {
      return await updateRevolvingFundStatusApi(params.recordId!, status);
    },
    onSuccess: (updatedRecord, status) => {
      queryClient.invalidateQueries({ queryKey: ["cash-disbursement", "revolving-fund"] });
      queryClient.setQueryData(["cash-disbursement", "revolving-fund", params.recordId], updatedRecord);
      setValues((cur) => ({ ...cur, status: status as any }));
      toast.success(`Revolving Fund marked as ${status}.`);
    },
    onError: () => {
      toast.error("Could not update status.");
    },
  });

  function submit(status?: RevolvingFundStatus) {
    const nextValues = status ? { ...values, status: status as any } : values;
    const nextErrors = validateRevolvingFundForm(nextValues);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please complete required fields before saving.");
      return;
    }

    saveMutation.mutate(nextValues);
  }

  function handleUpdateStatus(status: RevolvingFundStatus) {
    updateStatusMutation.mutate(status);
  }

  return {
    activeTab,
    addItem,
    addItems,
    closePreview: () => setIsPreviewOpen(false),
    currencyOptions: transactionCurrency.currencyOptions,
    discardDraft: draft.discardDraft,
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
    isRecordMissing: mode !== "add" && !recordQuery.isLoading && !record,
    isSubmitting: saveMutation.isPending || updateStatusMutation.isPending,
    mode,
    moveItem,
    openPreview: () => setIsPreviewOpen(true),
    record,
    removeItem,
    save: async (status?: any) => { submit(status); return true; },
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
    updateStatus: async (status: any) => { handleUpdateStatus(status); return true; },
    validate: (status?: any) => {
      const errs = validateRevolvingFundForm(values);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    values,
  };
}
