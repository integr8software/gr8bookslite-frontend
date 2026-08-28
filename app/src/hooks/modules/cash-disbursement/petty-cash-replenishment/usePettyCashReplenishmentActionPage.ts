"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { PettyCashReplenishmentStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import {
  applyPettyCashFundToReplenishmentForm,
  calculatePettyCashReplenishmentTotals,
  createBlankPettyCashReplenishmentEntry,
  createPettyCashReplenishmentCopyFromRecords,
  createPettyCashReplenishmentFormValues,
  createPettyCashReplenishmentRecord,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentData";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { getPettyCashFundRecords } from "@/app/src/services/modules/cash-disbursement/petty-cash-fund/PettyCashFundService";
import {
  createNextPettyCashReplenishmentNumber,
  getPettyCashReplenishmentRecords,
  savePettyCashReplenishmentRecords,
  upsertPettyCashReplenishmentRecord,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentService";
import type {
  PettyCashReplenishmentActionMode,
  PettyCashReplenishmentActionTab,
  PettyCashReplenishmentEntry,
  PettyCashReplenishmentFormErrors,
  PettyCashReplenishmentFormValues,
  PettyCashReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import { validatePettyCashReplenishmentForm } from "@/app/src/validations/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentValidation";

export function usePettyCashReplenishmentActionPage(options: { mode: PettyCashReplenishmentActionMode; onSaved?: () => void }) {
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const initialRecord = mode === "add" ? undefined : getPettyCashReplenishmentRecords().find((item) => item.id === params.recordId);
  const [record, setRecord] = useState(initialRecord);
  const [values, setValues] = useState<PettyCashReplenishmentFormValues>(() =>
    createPettyCashReplenishmentFormValues(
      initialRecord,
      createNextPettyCashReplenishmentNumber(),
      transactionCurrency.baseCurrencyCode,
    ),
  );
  const [errors, setErrors] = useState<PettyCashReplenishmentFormErrors>({});
  const [activeTab, setActiveTab] = useState<PettyCashReplenishmentActionTab>("details");
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
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:petty-cash-replenishment", recordId: params.recordId }),
    setValues,
    values,
  });
  const totals = useMemo(() => calculatePettyCashReplenishmentTotals(values.entries), [values.entries]);
  const pettyCashFundRecords = useMemo(() => getPettyCashFundRecords(), []);
  const pettyCashFundCopyFromRecords = useMemo(
    () => createPettyCashReplenishmentCopyFromRecords(pettyCashFundRecords),
    [pettyCashFundRecords],
  );

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

  function removeEntry(rowId: string) {
    if (values.entries.length > 1) {
      updateEntries(values.entries.filter((entry) => entry.id !== rowId));
    } else {
      updateEntries([createBlankPettyCashReplenishmentEntry()]);
    }
  }

  function duplicateEntry(rowId: string) {
    const entry = values.entries.find((item) => item.id === rowId);
    if (entry) {
      updateEntries([...values.entries, { ...entry, id: createBlankPettyCashReplenishmentEntry().id }]);
    }
  }

  function insertEntry(rowId: string, position: "above" | "below") {
    const index = values.entries.findIndex((entry) => entry.id === rowId);
    if (index < 0) return;
    const next = [...values.entries];
    next.splice(position === "above" ? index : index + 1, 0, createBlankPettyCashReplenishmentEntry());
    updateEntries(next);
  }

  function moveEntry(fromRowId: string, toRowId: string) {
    if (fromRowId === toRowId) return;
    const fromIndex = values.entries.findIndex((entry) => entry.id === fromRowId);
    const toIndex = values.entries.findIndex((entry) => entry.id === toRowId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...values.entries];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    updateEntries(next);
  }

  function copyFromPettyCashFund(recordIds: string[]) {
    if (isReadonly) return;

    const source = pettyCashFundRecords.find((item) => recordIds.includes(item.id));

    if (!source) {
      toast.error("Select a Petty Cash Fund to copy.");
      return;
    }

    setValues((current) => applyPettyCashFundToReplenishmentForm(current, source));
    setErrors({});
    toast.success(`Copied details from ${source.transactionNo}.`);
  }

  async function updateCurrency(currencyCode: string) {
    hasEditedCurrencyRef.current = true;
    updateField("currency", currencyCode);
    try {
      const exchangeRate = await transactionCurrency.loadExchangeRate(currencyCode);
      if (exchangeRate != null) updateField("exchangeRate", formatLoadedExchangeRate(exchangeRate));
    } catch {
      setErrors((current) => ({ ...current, exchangeRate: "Could not load the exchange rate." }));
      toast.error("Could not load the exchange rate for the selected currency.");
    }
  }

  function save(status: PettyCashReplenishmentStatus) {
    if (isReadonly || isSubmittingRef.current) return false;
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return false;
    }
    const releaseSubmitLock = acquireModuleActionLock(
      `cash-disbursement:petty-cash-replenishment:save:${mode}:${params.recordId ?? values.transactionNo}`,
    );
    if (!releaseSubmitLock) return false;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const nextErrors = status === PettyCashReplenishmentStatuses.draft ? {} : validatePettyCashReplenishmentForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted Petty Cash Replenishment fields.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }
    try {
      const nextRecord = createPettyCashReplenishmentRecord(values, status, mode === "edit" ? record : undefined);
      savePettyCashReplenishmentRecords(upsertPettyCashReplenishmentRecord(nextRecord));
      setRecord(nextRecord);
      setValues(createPettyCashReplenishmentFormValues(nextRecord));
      draft.clearDraft();
      toast.success(
        status === PettyCashReplenishmentStatuses.draft
          ? "Petty Cash Replenishment Saved as Draft."
          : "Petty Cash Replenishment Submitted for Approval.",
      );
      options.onSaved?.();
      return true;
    } catch {
      toast.error("Could not save the Petty Cash Replenishment. Please try again.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }
  }

  function updateStatus(status: PettyCashReplenishmentStatus) {
    if (!record) return false;
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:petty-cash-replenishment:status:${record.id}:${status}`);
    if (!releaseActionLock) return false;
    try {
      const nextRecord = createPettyCashReplenishmentRecord(values, status, record);
      savePettyCashReplenishmentRecords(upsertPettyCashReplenishmentRecord(nextRecord));
      setRecord(nextRecord);
      setValues(createPettyCashReplenishmentFormValues(nextRecord));
      toast.success(`Petty Cash Replenishment Marked as ${status}.`);
      return true;
    } catch {
      toast.error("Could not update the Petty Cash Replenishment. Please try again.");
      releaseActionLock();
      return false;
    }
  }

  function validate(status: PettyCashReplenishmentStatus = PettyCashReplenishmentStatuses.forApproval): boolean {
    if (isReadonly || isSubmittingRef.current) return false;
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return false;
    }
    const nextErrors = status === PettyCashReplenishmentStatuses.draft ? {} : validatePettyCashReplenishmentForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted Petty Cash Replenishment fields.");
      return false;
    }
    return true;
  }

  return {
    discardDraft: draft.discardDraft,
    hasDiscardableChanges: isDirty,
    saveDraft: draft.saveDraft,
    activeTab,
    addEntries,
    currencyOptions: transactionCurrency.currencyOptions,
    copyFromPettyCashFund,
    duplicateEntry,
    errors,
    insertEntry,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isPreviewOpen,
    isSubmitting,
    isReadonly,
    isRecordMissing: mode !== "add" && !initialRecord,
    mode,
    moveEntry,
    pettyCashFundCopyFromRecords,
    record,
    removeEntry,
    save,
    setActiveTab,
    setIsPreviewOpen,
    totals,
    updateCurrency,
    updateEntries,
    updateEntry,
    updateField,
    updateStatus,
    validate,
    values,
  };
}
