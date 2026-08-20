"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { PettyCashFundReplenishmentStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import {
  applyPettyCashFundToReplenishmentForm,
  calculatePettyCashFundReplenishmentTotals,
  createBlankPettyCashFundReplenishmentEntry,
  createPettyCashFundReplenishmentCopyFromRecords,
  createPettyCashFundReplenishmentFormValues,
  createPettyCashFundReplenishmentRecord,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentData";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { getPettyCashFundRecords } from "@/app/src/services/modules/cash-disbursement/petty-cash-fund/PettyCashFundService";
import {
  createNextPettyCashFundReplenishmentNumber,
  getPettyCashFundReplenishmentRecords,
  savePettyCashFundReplenishmentRecords,
  upsertPettyCashFundReplenishmentRecord,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentService";
import type {
  PettyCashFundReplenishmentActionMode,
  PettyCashFundReplenishmentActionTab,
  PettyCashFundReplenishmentEntry,
  PettyCashFundReplenishmentFormErrors,
  PettyCashFundReplenishmentFormValues,
  PettyCashFundReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import { validatePettyCashFundReplenishmentForm } from "@/app/src/validations/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentValidation";

export function usePettyCashFundReplenishmentActionPage(options: { mode: PettyCashFundReplenishmentActionMode; onSaved?: () => void }) {
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const initialRecord = mode === "add" ? undefined : getPettyCashFundReplenishmentRecords().find((item) => item.id === params.recordId);
  const [record, setRecord] = useState(initialRecord);
  const [values, setValues] = useState<PettyCashFundReplenishmentFormValues>(() =>
    createPettyCashFundReplenishmentFormValues(
      initialRecord,
      createNextPettyCashFundReplenishmentNumber(),
      transactionCurrency.baseCurrencyCode,
    ),
  );
  const [errors, setErrors] = useState<PettyCashFundReplenishmentFormErrors>({});
  const [activeTab, setActiveTab] = useState<PettyCashFundReplenishmentActionTab>("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isReadonly = mode === "view";
  const [initialValues] = useState(values);
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const draft = useModuleDraft({
    enabled: !isReadonly,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:petty-cash-fund-replenishment", recordId: params.recordId }),
    setValues,
    values,
  });
  const totals = useMemo(() => calculatePettyCashFundReplenishmentTotals(values.entries), [values.entries]);
  const pettyCashFundRecords = useMemo(() => getPettyCashFundRecords(), []);
  const pettyCashFundCopyFromRecords = useMemo(
    () => createPettyCashFundReplenishmentCopyFromRecords(pettyCashFundRecords),
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

  function updateField<TKey extends keyof PettyCashFundReplenishmentFormValues>(
    field: TKey,
    value: PettyCashFundReplenishmentFormValues[TKey],
  ) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateEntry(rowId: string, updates: Partial<PettyCashFundReplenishmentEntry>) {
    if (isReadonly) return;
    updateField(
      "entries",
      values.entries.map((entry) => (entry.id === rowId ? { ...entry, ...updates } : entry)),
    );
  }

  function updateEntries(entries: PettyCashFundReplenishmentEntry[]) {
    updateField("entries", entries);
  }

  function addEntries(count: number) {
    updateEntries([...values.entries, ...Array.from({ length: count }, createBlankPettyCashFundReplenishmentEntry)]);
  }

  function removeEntry(rowId: string) {
    if (values.entries.length > 1) {
      updateEntries(values.entries.filter((entry) => entry.id !== rowId));
    }
  }

  function duplicateEntry(rowId: string) {
    const entry = values.entries.find((item) => item.id === rowId);
    if (entry) {
      updateEntries([...values.entries, { ...entry, id: createBlankPettyCashFundReplenishmentEntry().id }]);
    }
  }

  function insertEntry(rowId: string, position: "above" | "below") {
    const index = values.entries.findIndex((entry) => entry.id === rowId);
    if (index < 0) return;
    const next = [...values.entries];
    next.splice(position === "above" ? index : index + 1, 0, createBlankPettyCashFundReplenishmentEntry());
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

  function save(status: PettyCashFundReplenishmentStatus) {
    if (isReadonly || isSubmittingRef.current) return false;
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return false;
    }
    const releaseSubmitLock = acquireModuleActionLock(
      `cash-disbursement:petty-cash-fund-replenishment:save:${mode}:${params.recordId ?? values.transactionNo}`,
    );
    if (!releaseSubmitLock) return false;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const nextErrors = status === PettyCashFundReplenishmentStatuses.draft ? {} : validatePettyCashFundReplenishmentForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted petty cash fund replenishment fields.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }
    try {
      const nextRecord = createPettyCashFundReplenishmentRecord(values, status, mode === "edit" ? record : undefined);
      savePettyCashFundReplenishmentRecords(upsertPettyCashFundReplenishmentRecord(nextRecord));
      setRecord(nextRecord);
      setValues(createPettyCashFundReplenishmentFormValues(nextRecord));
      draft.clearDraft();
      toast.success(
        status === PettyCashFundReplenishmentStatuses.draft
          ? "Petty Cash Fund Replenishment Saved as Draft."
          : "Petty Cash Fund Replenishment Submitted for Approval.",
      );
      options.onSaved?.();
      return true;
    } catch {
      toast.error("Could not save the petty cash fund replenishment. Please try again.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }
  }

  function updateStatus(status: PettyCashFundReplenishmentStatus) {
    if (!record) return false;
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:petty-cash-fund-replenishment:status:${record.id}:${status}`);
    if (!releaseActionLock) return false;
    try {
      const nextRecord = createPettyCashFundReplenishmentRecord(values, status, record);
      savePettyCashFundReplenishmentRecords(upsertPettyCashFundReplenishmentRecord(nextRecord));
      setRecord(nextRecord);
      setValues(createPettyCashFundReplenishmentFormValues(nextRecord));
      toast.success(`Petty Cash Fund Replenishment Marked as ${status}.`);
      return true;
    } catch {
      toast.error("Could not update the petty cash fund replenishment. Please try again.");
      releaseActionLock();
      return false;
    }
  }

  return {
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
    values,
  };
}

