"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  PettyCashFundPartyOptions,
  PettyCashFundStatuses,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import {
  calculatePettyCashFundTotals,
  createBlankPettyCashFundItem,
  createPettyCashFundFormValues,
  createPettyCashFundRecord,
  formatPettyCashFundAmount,
  PettyCashFundCopyFromRecords,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-fund/PettyCashFundData";
import {
  createNextPettyCashFundNumber,
  getPettyCashFundRecords,
  savePettyCashFundRecords,
  upsertPettyCashFundRecord,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-fund/PettyCashFundService";
import type {
  PettyCashFundActionMode,
  PettyCashFundActionTab,
  PettyCashFundBoolean,
  PettyCashFundFormErrors,
  PettyCashFundFormValues,
  PettyCashFundItem,
  PettyCashFundStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { validatePettyCashFundForm } from "@/app/src/validations/modules/cash-disbursement/petty-cash-fund/PettyCashFundValidation";
import { parseAmount } from "@/app/src/utils/number.util";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";

export function usePettyCashFundActionPage(options: { mode: PettyCashFundActionMode; onSaved?: () => void }) {
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const initialRecord = mode === "add" ? undefined : getPettyCashFundRecords().find((record) => record.id === params.recordId);
  const [record, setRecord] = useState(initialRecord);
  const [values, setValues] = useState<PettyCashFundFormValues>(() =>
    createPettyCashFundFormValues(initialRecord, createNextPettyCashFundNumber(), transactionCurrency.baseCurrencyCode),
  );
  const [errors, setErrors] = useState<PettyCashFundFormErrors>({});
  const [activeTab, setActiveTab] = useState<PettyCashFundActionTab>("details");
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
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:petty-cash-fund", recordId: params.recordId }),
    setValues,
    values,
  });
  const totals = useMemo(() => calculatePettyCashFundTotals(values.items), [values.items]);

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

  function updateField<TKey extends keyof PettyCashFundFormValues>(field: TKey, value: PettyCashFundFormValues[TKey]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateItem(rowId: string, updates: Partial<PettyCashFundItem>) {
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

  function updateItems(items: PettyCashFundItem[]) {
    updateField("items", items);
  }

  function addItems(count: number) {
    updateItems([...values.items, ...Array.from({ length: count }, createBlankPettyCashFundItem)]);
  }

  function removeItem(rowId: string) {
    if (values.items.length > 1) updateItems(values.items.filter((item) => item.id !== rowId));
  }

  function duplicateItem(rowId: string) {
    const item = values.items.find((row) => row.id === rowId);
    if (item) updateItems([...values.items, { ...item, id: createBlankPettyCashFundItem().id }]);
  }

  function insertItem(rowId: string, position: "above" | "below") {
    const index = values.items.findIndex((item) => item.id === rowId);
    if (index < 0) return;
    const next = [...values.items];
    next.splice(position === "above" ? index : index + 1, 0, createBlankPettyCashFundItem());
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
    const source = PettyCashFundCopyFromRecords.find((item) => recordIds.includes(item.id));
    if (!source) {
      toast.error("Select a Petty Cash Voucher to copy.");
      return;
    }
    const party = PettyCashFundPartyOptions.find((option) => option.name === source.partyName);
    const amount = formatPettyCashFundAmount(Number(source.amount?.replace(/,/g, "")) || 0);
    setValues((current) => ({
      ...current,
      partyCode: String(party?.value ?? ""),
      partyName: source.partyName ?? "",
      remarks: source.remarks ?? "",
      items: [
        {
          ...createBlankPettyCashFundItem(),
          amount,
          date: source.documentDate ?? current.documentDate,
          grossAmount: amount,
          netAmount: amount,
          remarks: source.remarks ?? "",
          payeeCode: String(party?.value ?? ""),
          payeeName: source.partyName ?? "",
        },
      ],
    }));
    setErrors({});
    toast.success(`Copied Details from ${source.sourceNo}.`);
  }

  function save(status: PettyCashFundStatus) {
    if (isReadonly || isSubmittingRef.current) return false;
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return false;
    }
    const releaseSubmitLock = acquireModuleActionLock(
      `cash-disbursement:petty-cash-fund:save:${mode}:${params.recordId ?? values.transactionNo}`,
    );
    if (!releaseSubmitLock) return false;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const nextErrors = status === PettyCashFundStatuses.draft ? {} : validatePettyCashFundForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted Petty Cash Fund fields.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }
    try {
      const nextRecord = createPettyCashFundRecord(values, status, mode === "edit" ? record : undefined);
      savePettyCashFundRecords(upsertPettyCashFundRecord(nextRecord));
      setRecord(nextRecord);
      setValues(createPettyCashFundFormValues(nextRecord));
      draft.clearDraft();
      toast.success(status === PettyCashFundStatuses.draft ? "Petty Cash Fund Saved as Draft." : "Petty Cash Fund Submitted for Approval.");
      options.onSaved?.();
      return true;
    } catch {
      toast.error("Could not save the Petty Cash Fund. Please try again.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }
  }

  function updateStatus(status: PettyCashFundStatus) {
    if (!record) return false;
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:petty-cash-fund:status:${record.id}:${status}`);
    if (!releaseActionLock) return false;
    try {
      const nextRecord = createPettyCashFundRecord(values, status, record);
      savePettyCashFundRecords(upsertPettyCashFundRecord(nextRecord));
      setRecord(nextRecord);
      setValues(createPettyCashFundFormValues(nextRecord));
      toast.success(`Petty Cash Fund Marked as ${status}.`);
      return true;
    } catch {
      toast.error("Could not update the Petty Cash Fund. Please try again.");
      releaseActionLock();
      return false;
    }
  }

  function validate(status: PettyCashFundStatus = PettyCashFundStatuses.forApproval): boolean {
    if (isReadonly || isSubmittingRef.current) return false;
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return false;
    }
    const nextErrors = status === PettyCashFundStatuses.draft ? {} : validatePettyCashFundForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted Petty Cash Fund fields.");
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

function calculateItem(item: PettyCashFundItem): PettyCashFundItem {
  const amount = parseAmount(item.amount) ?? 0;
  const rate = item.vatable === "True" ? 0.12 : 0;
  const vat = rate ? (item.vatInclusive === "True" ? amount - amount / (1 + rate) : amount * rate) : 0;
  const net = item.vatInclusive === "True" ? amount - vat : amount;
  const gross = item.vatInclusive === "True" ? amount : amount + vat;
  return {
    ...item,
    netAmount: formatPettyCashFundAmount(net),
    vatAmount: formatPettyCashFundAmount(vat),
    grossAmount: formatPettyCashFundAmount(gross),
    vatable: item.vatable as PettyCashFundBoolean,
  };
}

