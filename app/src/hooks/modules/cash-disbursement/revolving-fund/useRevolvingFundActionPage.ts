"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  RevolvingFundPartyOptions,
  RevolvingFundStatuses,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import {
  calculateRevolvingFundItemTaxFields,
  calculateRevolvingFundTotals,
  createBlankRevolvingFundItem,
  createRevolvingFundFormValues,
  createRevolvingFundRecord,
  formatRevolvingFundAmount,
  RevolvingFundCopyFromRecords,
} from "@/app/src/data/modules/cash-disbursement/revolving-fund/RevolvingFundData";
import {
  createNextRevolvingFundNumber,
  getRevolvingFundRecords,
  saveRevolvingFundRecords,
  upsertRevolvingFundRecord,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund/RevolvingFundService";
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
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";

export function useRevolvingFundActionPage(options: { mode: RevolvingFundActionMode; onSaved?: () => void }) {
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const initialRecord = mode === "add" ? undefined : getRevolvingFundRecords().find((record) => record.id === params.recordId);
  const [record, setRecord] = useState(initialRecord);
  const [values, setValues] = useState<RevolvingFundFormValues>(() =>
    createRevolvingFundFormValues(initialRecord, createNextRevolvingFundNumber(), transactionCurrency.baseCurrencyCode),
  );
  const [errors, setErrors] = useState<RevolvingFundFormErrors>({});
  const [activeTab, setActiveTab] = useState<RevolvingFundActionTab>("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isReadonly = mode === "view";
  const [initialValues] = useState(values);
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
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

  function updateItem(rowId: string, updates: Partial<RevolvingFundItem>) {
    if (isReadonly) return;
    updateField(
      "items",
      values.items.map((item) => (item.id === rowId ? calculateItem({ ...item, ...updates }) : item)),
    );
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
      setErrors((current) => ({ ...current, exchangeRate: "Could not load the exchange rate." }));
      toast.error("Could not load the exchange rate for the selected currency.");
    }
  }

  function updateItems(items: RevolvingFundItem[]) {
    updateField("items", items);
  }

  function addItems(count: number) {
    updateItems([...values.items, ...Array.from({ length: count }, createBlankRevolvingFundItem)]);
  }

  function removeItem(rowId: string) {
    if (values.items.length > 1) {
      updateItems(values.items.filter((item) => item.id !== rowId));
    } else {
      updateItems([createBlankRevolvingFundItem()]);
    }
  }

  function duplicateItem(rowId: string) {
    const item = values.items.find((row) => row.id === rowId);
    if (item) updateItems([...values.items, { ...item, id: createBlankRevolvingFundItem().id }]);
  }

  function insertItem(rowId: string, position: "above" | "below") {
    const index = values.items.findIndex((item) => item.id === rowId);
    if (index < 0) return;
    const next = [...values.items];
    next.splice(position === "above" ? index : index + 1, 0, createBlankRevolvingFundItem());
    updateItems(next);
  }

  function moveItem(fromRowId: string, toRowId: string) {
    if (fromRowId === toRowId) return;
    const fromIndex = values.items.findIndex((item) => item.id === fromRowId);
    const toIndex = values.items.findIndex((item) => item.id === toRowId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...values.items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    updateItems(next);
  }

  function copyFrom(recordIds: string[]) {
    if (isReadonly) return;
    const source = RevolvingFundCopyFromRecords.find((item) => recordIds.includes(item.id));
    if (!source) {
      toast.error("Select a Disbursement Voucher to copy.");
      return;
    }
    const party = RevolvingFundPartyOptions.find((option) => option.name === source.partyName);
    const amount = formatRevolvingFundAmount(Number(source.amount?.replace(/,/g, "")) || 0);
    setValues((current) => ({
      ...current,
      partyCode: String(party?.value ?? ""),
      partyName: source.partyName ?? "",
      remarks: source.remarks ?? "",
      items: [
        {
          ...createBlankRevolvingFundItem(),
          amount,
          date: source.documentDate ?? current.documentDate,
          grossAmount: amount,
          netAmount: amount,
          remarks: source.remarks ?? "",
          supplierCode: String(party?.value ?? ""),
          supplierName: source.partyName ?? "",
        },
      ],
    }));
    setErrors({});
    toast.success(`Copied Details from ${source.sourceNo}.`);
  }

  function save(status: RevolvingFundStatus) {
    if (isReadonly || isSubmittingRef.current) return false;
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return false;
    }
    const releaseSubmitLock = acquireModuleActionLock(
      `cash-disbursement:revolving-fund:save:${mode}:${params.recordId ?? values.transactionNo}`,
    );
    if (!releaseSubmitLock) return false;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const nextErrors = status === RevolvingFundStatuses.draft ? {} : validateRevolvingFundForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted Revolving Fund fields.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }
    try {
      const nextRecord = createRevolvingFundRecord(values, status, mode === "edit" ? record : undefined);
      saveRevolvingFundRecords(upsertRevolvingFundRecord(nextRecord));
      setRecord(nextRecord);
      setValues(createRevolvingFundFormValues(nextRecord));
      draft.clearDraft();
      toast.success(status === RevolvingFundStatuses.draft ? "Revolving Fund Saved as Draft." : "Revolving Fund Submitted for Approval.");
      options.onSaved?.();
      return true;
    } catch {
      toast.error("Could not save the Revolving Fund. Please try again.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }
  }

  function updateStatus(status: RevolvingFundStatus) {
    if (!record) return false;
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:revolving-fund:status:${record.id}:${status}`);
    if (!releaseActionLock) return false;
    try {
      const nextRecord = createRevolvingFundRecord(values, status, record);
      saveRevolvingFundRecords(upsertRevolvingFundRecord(nextRecord));
      setRecord(nextRecord);
      setValues(createRevolvingFundFormValues(nextRecord));
      toast.success(`Revolving Fund Marked as ${status}.`);
      return true;
    } catch {
      toast.error("Could not update the Revolving Fund. Please try again.");
      releaseActionLock();
      return false;
    }
  }

  function validate(status: RevolvingFundStatus = RevolvingFundStatuses.forApproval): boolean {
    if (isReadonly || isSubmittingRef.current) return false;
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return false;
    }
    const nextErrors = status === RevolvingFundStatuses.draft ? {} : validateRevolvingFundForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted Revolving Fund fields.");
      return false;
    }
    return true;
  }

  return {
    discardDraft: draft.discardDraft,
    hasDiscardableChanges: isDirty,
    saveDraft: draft.saveDraft,
    activeTab,
    addItems,
    copyFrom,
    currencyOptions: transactionCurrency.currencyOptions,
    duplicateItem,
    errors,
    isReadonly,
    isPreviewOpen,
    isSubmitting,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isRecordMissing: mode !== "add" && !initialRecord,
    insertItem,
    mode,
    moveItem,
    record,
    removeItem,
    save,
    setActiveTab,
    setIsPreviewOpen,
    totals,
    updateField,
    updateCurrency,
    updateItem,
    updateItems,
    updateStatus,
    validate,
    values,
  };
}

function calculateItem(item: RevolvingFundItem): RevolvingFundItem {
  return {
    ...item,
    ...calculateRevolvingFundItemTaxFields(item.amount, item.vatType, item.ewtCode),
  };
}

