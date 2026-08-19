"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { RevolvingFundReplenishmentStatuses } from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import {
  calculateRevolvingFundReplenishmentTotals,
  createBlankRevolvingFundReplenishmentEntry,
  createRevolvingFundReplenishmentFormValues,
  createRevolvingFundReplenishmentRecord,
} from "@/app/src/data/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentData";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import {
  createNextRevolvingFundReplenishmentNumber,
  getRevolvingFundReplenishmentRecords,
  saveRevolvingFundReplenishmentRecords,
  upsertRevolvingFundReplenishmentRecord,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentService";
import type {
  RevolvingFundReplenishmentActionMode,
  RevolvingFundReplenishmentActionTab,
  RevolvingFundReplenishmentEntry,
  RevolvingFundReplenishmentFormErrors,
  RevolvingFundReplenishmentFormValues,
  RevolvingFundReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { validateRevolvingFundReplenishmentForm } from "@/app/src/validations/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentValidation";

export function useRevolvingFundReplenishmentActionPage(options: { mode: RevolvingFundReplenishmentActionMode; onSaved?: () => void }) {
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const initialRecord = mode === "add" ? undefined : getRevolvingFundReplenishmentRecords().find((item) => item.id === params.recordId);
  const [record, setRecord] = useState(initialRecord);
  const [values, setValues] = useState<RevolvingFundReplenishmentFormValues>(() =>
    createRevolvingFundReplenishmentFormValues(
      initialRecord,
      createNextRevolvingFundReplenishmentNumber(),
      transactionCurrency.baseCurrencyCode,
    ),
  );
  const [errors, setErrors] = useState<RevolvingFundReplenishmentFormErrors>({});
  const [activeTab, setActiveTab] = useState<RevolvingFundReplenishmentActionTab>("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const isReadonly = mode === "view";
  const totals = useMemo(() => calculateRevolvingFundReplenishmentTotals(values.entries), [values.entries]);

  useEffect(() => {
    if (mode !== "add" || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) return;
    setValues((current) => ({
      ...current,
      currency: transactionCurrency.baseCurrencyCode,
      exchangeRate: "1.00",
    }));
  }, [mode, transactionCurrency.baseCurrencyCode, transactionCurrency.isBaseCurrencyResolved]);

  function updateField<TKey extends keyof RevolvingFundReplenishmentFormValues>(
    field: TKey,
    value: RevolvingFundReplenishmentFormValues[TKey],
  ) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateEntry(rowId: string, updates: Partial<RevolvingFundReplenishmentEntry>) {
    if (isReadonly) return;
    updateField(
      "entries",
      values.entries.map((entry) => (entry.id === rowId ? { ...entry, ...updates } : entry)),
    );
  }

  function updateEntries(entries: RevolvingFundReplenishmentEntry[]) {
    updateField("entries", entries);
  }

  function addEntries(count: number) {
    updateEntries([...values.entries, ...Array.from({ length: count }, createBlankRevolvingFundReplenishmentEntry)]);
  }

  function removeEntry(rowId: string) {
    if (values.entries.length > 1) {
      updateEntries(values.entries.filter((entry) => entry.id !== rowId));
    }
  }

  function duplicateEntry(rowId: string) {
    const entry = values.entries.find((item) => item.id === rowId);
    if (entry) {
      updateEntries([...values.entries, { ...entry, id: createBlankRevolvingFundReplenishmentEntry().id }]);
    }
  }

  function insertEntry(rowId: string, position: "above" | "below") {
    const index = values.entries.findIndex((entry) => entry.id === rowId);
    if (index < 0) return;
    const next = [...values.entries];
    next.splice(position === "above" ? index : index + 1, 0, createBlankRevolvingFundReplenishmentEntry());
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

  function save(status: RevolvingFundReplenishmentStatus) {
    const nextErrors = status === RevolvingFundReplenishmentStatuses.draft ? {} : validateRevolvingFundReplenishmentForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted revolving fund replenishment fields.");
      return false;
    }
    const nextRecord = createRevolvingFundReplenishmentRecord(values, status, mode === "edit" ? record : undefined);
    saveRevolvingFundReplenishmentRecords(upsertRevolvingFundReplenishmentRecord(nextRecord));
    setRecord(nextRecord);
    setValues(createRevolvingFundReplenishmentFormValues(nextRecord));
    toast.success(
      status === RevolvingFundReplenishmentStatuses.draft
        ? "Revolving fund replenishment saved as draft."
        : "Revolving fund replenishment submitted for approval.",
    );
    options.onSaved?.();
    return true;
  }

  function updateStatus(status: RevolvingFundReplenishmentStatus) {
    if (!record) return false;
    const nextRecord = createRevolvingFundReplenishmentRecord(values, status, record);
    saveRevolvingFundReplenishmentRecords(upsertRevolvingFundReplenishmentRecord(nextRecord));
    setRecord(nextRecord);
    setValues(createRevolvingFundReplenishmentFormValues(nextRecord));
    toast.success(`Revolving fund replenishment marked as ${status}.`);
    return true;
  }

  return {
    activeTab,
    addEntries,
    currencyOptions: transactionCurrency.currencyOptions,
    duplicateEntry,
    errors,
    insertEntry,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isPreviewOpen,
    isReadonly,
    isRecordMissing: mode !== "add" && !initialRecord,
    mode,
    moveEntry,
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

export type { RevolvingFundReplenishmentActionPageState } from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
