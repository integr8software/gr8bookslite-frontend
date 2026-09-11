"use client";

import { PettyCashVoucherActionModes } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  calculatePettyCashVoucherItemTaxFields,
  calculatePettyCashVoucherTotals,
  createBlankPettyCashVoucherItem,
  createPettyCashVoucherFormValues,
  formatPettyCashVoucherAmount,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherData";
import type {
  PettyCashVoucherActionMode,
  PettyCashVoucherActionTab,
  PettyCashVoucherFormErrors,
  PettyCashVoucherFormValues,
  PettyCashVoucherItem,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { validatePettyCashVoucherForm } from "@/app/src/validations/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherValidation";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { hasModuleDraftChanges } from "@/app/src/hooks/shared/module/useModuleDraftChanges";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import {
  createPettyCashVoucherApi,
  fetchNextPettyCashVoucherNo,
  fetchPettyCashVoucherById,
  updatePettyCashVoucherApi,
  updatePettyCashVoucherStatusApi,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherApi";
import { PettyCashVoucherQueryKeys } from "@/app/src/services/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherQueryKeys";

export function usePettyCashVoucherActionPage(options: { mode: PettyCashVoucherActionMode; onSaved?: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const isReadonly = mode === PettyCashVoucherActionModes.View;

  const recordQuery = useQuery({
    queryKey: PettyCashVoucherQueryKeys.record(params.recordId),
    queryFn: () => fetchPettyCashVoucherById(params.recordId!),
    enabled: Boolean(params.recordId) && mode !== PettyCashVoucherActionModes.Add,
  });

  const record = recordQuery.data;
  const taxCodesQuery = useAlphanumericTaxCodes();
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);

  const [values, setValues] = useState<PettyCashVoucherFormValues>(() =>
    createPettyCashVoucherFormValues(record, "", transactionCurrency.baseCurrencyCode, taxCodes),
  );
  const [errors, setErrors] = useState<PettyCashVoucherFormErrors>({});
  const [activeTab, setActiveTab] = useState<PettyCashVoucherActionTab>("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const [initialValues, setInitialValues] = useState(values);
  const rawIsDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isDirty = mode === PettyCashVoucherActionModes.Add ? hasModuleDraftChanges(values, initialValues, ["transactionNo"]) : rawIsDirty;

  async function refreshNextTransactionNo() {
    try {
      const nextNo = await fetchNextPettyCashVoucherNo();

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
      const formVals = createPettyCashVoucherFormValues(record, record.transactionNo, record.currency || "PHP", taxCodes);
      queueMicrotask(() => {
        setValues(formVals);
        setInitialValues(formVals);
      });
    }
  }, [record, taxCodes]);

  useEffect(() => {
    if (mode === PettyCashVoucherActionModes.Add) {
      queueMicrotask(() => void refreshNextTransactionNo());
    }
  }, [mode]);

  const draft = useModuleDraft({
    enabled: !isReadonly,
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:petty-cash-voucher", recordId: params.recordId }),
    setValues,
    values,
  });

  const totals = useMemo(() => calculatePettyCashVoucherTotals(values.items), [values.items]);

  useEffect(() => {
    if (mode !== PettyCashVoucherActionModes.Add || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) {
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

  function updateField<TKey extends keyof PettyCashVoucherFormValues>(field: TKey, value: PettyCashVoucherFormValues[TKey]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function calculateItem(item: PettyCashVoucherItem): PettyCashVoucherItem {
    const taxFields = calculatePettyCashVoucherItemTaxFields(item.amount, item.vatType, item.ewtCode, taxCodes);
    return { ...item, ...taxFields };
  }

  function updateItem(rowId: string, updates: Partial<PettyCashVoucherItem>) {
    if (isReadonly) return;
    updateField(
      "items",
      values.items.map((item) => (item.id === rowId ? calculateItem({ ...item, ...updates }) : item)),
    );
  }

  function updateItems(items: PettyCashVoucherItem[]) {
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
    updateField("items", [...values.items, createBlankPettyCashVoucherItem()]);
  }

  function addItems(count: number) {
    updateItems([...values.items, ...Array.from({ length: count }, createBlankPettyCashVoucherItem)]);
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
    next.splice(position === "above" ? index : index + 1, 0, createBlankPettyCashVoucherItem());
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
      updateField("items", [createBlankPettyCashVoucherItem()]);
      return;
    }
    updateField(
      "items",
      values.items.filter((item) => item.id !== rowId),
    );
  }

  const saveMutation = useMutation({
    mutationFn: async (submitValues: PettyCashVoucherFormValues) => {
      if (mode === PettyCashVoucherActionModes.Add) {
        return await createPettyCashVoucherApi(submitValues);
      }
      return await updatePettyCashVoucherApi(params.recordId!, submitValues);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PettyCashVoucherQueryKeys.all });
      draft.clearDraft();
      toast.success(`Petty Cash Voucher ${mode === PettyCashVoucherActionModes.Add ? "created" : "updated"} successfully.`);
      if (options.onSaved) {
        options.onSaved();
      } else {
        router.push("/cash-disbursement/petty-cash-voucher");
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save Petty Cash Voucher.";
      toast.error(msg);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: PettyCashVoucherStatus) => {
      return await updatePettyCashVoucherStatusApi(params.recordId!, status);
    },
    onSuccess: (updatedRecord, status) => {
      queryClient.invalidateQueries({ queryKey: PettyCashVoucherQueryKeys.all });
      queryClient.setQueryData(PettyCashVoucherQueryKeys.record(params.recordId), updatedRecord);
      setValues((cur) => ({ ...cur, status }));
      toast.success(`Petty Cash Voucher marked as ${status}.`);
    },
    onError: () => {
      toast.error("Could not update status.");
    },
  });

  async function submit(status?: PettyCashVoucherStatus) {
    if (isReadonly) return false;
    const valuesToValidate = status ? { ...values, status } : values;
    const validationErrors = valuesToValidate.status === "Draft" ? {} : validatePettyCashVoucherForm(valuesToValidate);
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

  async function handleUpdateStatus(status: PettyCashVoucherStatus) {
    try {
      await updateStatusMutation.mutateAsync(status);
      return true;
    } catch {
      return false;
    }
  }

  async function resetAddValuesWithNextTransactionNo() {
    const nextValues = createPettyCashVoucherFormValues(undefined, "", transactionCurrency.baseCurrencyCode, taxCodes);

    try {
      const nextNo = await fetchNextPettyCashVoucherNo();

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

    if (mode === PettyCashVoucherActionModes.Add) {
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
    isRecordMissing: mode !== PettyCashVoucherActionModes.Add && !recordQuery.isLoading && !record,
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
      formattedAmount: formatPettyCashVoucherAmount(totals.amount),
      formattedDisburseAmount: formatPettyCashVoucherAmount(totals.disburseAmount),
      formattedEwtAmount: formatPettyCashVoucherAmount(totals.ewtAmount),
      formattedGrossAmount: formatPettyCashVoucherAmount(totals.grossAmount),
      formattedNetAmount: formatPettyCashVoucherAmount(totals.netAmount),
      formattedVatAmount: formatPettyCashVoucherAmount(totals.vatAmount),
    },
    updateCurrency,
    updateField,
    updateItem,
    updateItems,
    updateStatus: handleUpdateStatus,
    validate: (status?: PettyCashVoucherStatus) => {
      const nextValues = status ? { ...values, status } : values;
      const errs = nextValues.status === "Draft" ? {} : validatePettyCashVoucherForm(nextValues);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    values,
  };
}
