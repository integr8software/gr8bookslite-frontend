"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  RequestForPaymentPartyOptions,
  RequestForPaymentStatuses,
} from "@/app/src/constants/modules/cash-disbursement/request-for-payment/RequestForPaymentConstants";
import {
  calculateRequestForPaymentTotals,
  createBlankRequestForPaymentItem,
  createRequestForPaymentFormValues,
  createRequestForPaymentRecord,
  formatRequestForPaymentAmount,
  RequestForPaymentCopyFromRecords,
} from "@/app/src/data/modules/cash-disbursement/request-for-payment/RequestForPaymentData";
import {
  createNextRequestForPaymentNumber,
  getRequestForPaymentRecords,
  saveRequestForPaymentRecords,
  upsertRequestForPaymentRecord,
} from "@/app/src/services/modules/cash-disbursement/request-for-payment/RequestForPaymentService";
import type {
  RequestForPaymentActionMode,
  RequestForPaymentActionTab,
  RequestForPaymentFormErrors,
  RequestForPaymentFormValues,
  RequestForPaymentItem,
  RequestForPaymentStatus,
} from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import { validateRequestForPaymentForm } from "@/app/src/validations/modules/cash-disbursement/request-for-payment/RequestForPaymentValidation";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { todayDateValue } from "@/app/src/utils/date.util";

export function useRequestForPaymentActionPage(options: { mode: RequestForPaymentActionMode; onSaved?: () => void }) {
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const initialRecord = mode === "add" ? undefined : getRequestForPaymentRecords().find((record) => record.id === params.recordId);
  const [record, setRecord] = useState(initialRecord);
  const [values, setValues] = useState<RequestForPaymentFormValues>(() =>
    createRequestForPaymentFormValues(initialRecord, createNextRequestForPaymentNumber(), transactionCurrency.baseCurrencyCode),
  );
  const [errors, setErrors] = useState<RequestForPaymentFormErrors>({});
  const [activeTab, setActiveTab] = useState<RequestForPaymentActionTab>("details");
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
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:request-for-payment", recordId: params.recordId }),
    setValues,
    values,
  });

  const totals = useMemo(() => calculateRequestForPaymentTotals(values.items), [values.items]);

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

  function updateField<TKey extends keyof RequestForPaymentFormValues>(field: TKey, value: RequestForPaymentFormValues[TKey]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateItem(rowId: string, updates: Partial<RequestForPaymentItem>) {
    if (isReadonly) return;
    updateField(
      "items",
      values.items.map((item) => (item.id === rowId ? { ...item, ...updates } : item)),
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
      toast.error("Unable to load exchange rate.");
    }
  }

  function addItem() {
    if (isReadonly) return;
    updateField("items", [...values.items, createBlankRequestForPaymentItem()]);
  }

  function removeItem(rowId: string) {
    if (isReadonly || values.items.length <= 1) return;
    updateField(
      "items",
      values.items.filter((item) => item.id !== rowId),
    );
  }

  function reorderItems(reordered: RequestForPaymentItem[]) {
    if (isReadonly) return;
    updateField("items", reordered);
  }

  function validate(targetStatus?: RequestForPaymentStatus) {
    const nextErrors = validateRequestForPaymentForm(values);
    if (targetStatus === RequestForPaymentStatuses.draft) {
      delete nextErrors.items;
      delete nextErrors.dateNeeded;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submitRecord(status: RequestForPaymentStatus) {
    if (isReadonly || isSubmittingRef.current) return;
    if (!validate(status)) {
      toast.error("Please resolve form errors before saving.");
      return;
    }

    const releaseLock = acquireModuleActionLock("cash-disbursement:request-for-payment");
    if (!releaseLock) {
      toast.error("Another action is currently in progress. Please wait.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const savedRecord = createRequestForPaymentRecord(values, status, record);
      const nextRecords = upsertRequestForPaymentRecord(savedRecord);
      saveRequestForPaymentRecords(nextRecords);
      setRecord(savedRecord);
      setValues(savedRecord.formValues ?? values);
      draft.discardDraft();

      toast.success(
        status === RequestForPaymentStatuses.draft
          ? "Request for Payment saved as draft."
          : `Request for Payment ${mode === "edit" ? "updated" : "submitted"} successfully.`,
      );

      options.onSaved?.();
    } finally {
      releaseLock();
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function applyCopyFrom(copyRecord: AppCopyFromRecord) {
    if (isReadonly) return;

    const matchedParty = RequestForPaymentPartyOptions.find((p) => p.name === copyRecord.partyName);
    const newItems: RequestForPaymentItem[] = [
      {
        ...createBlankRequestForPaymentItem(),
        date: copyRecord.documentDate ?? todayDateValue(),
        particulars: copyRecord.remarks || copyRecord.sourceNo || "",
        amount: copyRecord.amount ? formatRequestForPaymentAmount(Number(copyRecord.amount.replace(/,/g, "")) || 0) : "0.00",
        refNumber: copyRecord.sourceNo || "",
        refType: copyRecord.source === "Purchase Order" ? "PO" : copyRecord.source === "Billing Invoice" ? "Billing" : "Expense",
      },
    ];

    setValues((current) => ({
      ...current,
      partyCode: matchedParty?.value ?? current.partyCode,
      partyName: copyRecord.partyName || current.partyName,
      remarks: copyRecord.remarks || current.remarks,
      items: current.items.length === 1 && !current.items[0].particulars && !current.items[0].amount
        ? newItems
        : [...current.items, ...newItems],
    }));

    toast.success(`Copied details from ${copyRecord.sourceNo}.`);
  }

  return {
    activeTab,
    addItem,
    applyCopyFrom,
    copyFromRecords: RequestForPaymentCopyFromRecords,
    currencyOptions: transactionCurrency.currencyOptions,
    discardDraft: draft.discardDraft,
    errors,
    hasDiscardableChanges: isDirty,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isPreviewOpen,
    isReadonly,
    isRecordMissing: mode !== "add" && !record,
    isSubmitting,
    mode,
    record,
    removeItem,
    reorderItems,
    saveDraft: draft.saveDraft,
    setActiveTab,
    setIsPreviewOpen,
    submitRecord,
    totals,
    updateCurrency,
    updateField,
    updateItem,
    validate,
    values,
  };
}
