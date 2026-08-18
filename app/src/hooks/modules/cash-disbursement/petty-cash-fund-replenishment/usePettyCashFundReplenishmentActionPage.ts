"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { PettyCashFundReplenishmentStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import {
  calculatePettyCashFundReplenishmentTotals,
  createBlankPettyCashFundReplenishmentEntry,
  createPettyCashFundReplenishmentFormValues,
  createPettyCashFundReplenishmentRecord,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentData";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
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

export function usePettyCashFundReplenishmentActionPage(options: { onSaved?: () => void } = {}) {
  const transactionCurrency = useTransactionCurrency();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const mode: PettyCashFundReplenishmentActionMode = pathname.includes("/view/") ? "view" : pathname.includes("/edit/") ? "edit" : "add";
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
  const isReadonly = mode === "view";
  const totals = useMemo(() => calculatePettyCashFundReplenishmentTotals(values.entries), [values.entries]);

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
    const nextErrors = status === PettyCashFundReplenishmentStatuses.draft ? {} : validatePettyCashFundReplenishmentForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted petty cash fund replenishment fields.");
      return false;
    }
    const nextRecord = createPettyCashFundReplenishmentRecord(values, status, mode === "edit" ? record : undefined);
    savePettyCashFundReplenishmentRecords(upsertPettyCashFundReplenishmentRecord(nextRecord));
    setRecord(nextRecord);
    setValues(createPettyCashFundReplenishmentFormValues(nextRecord));
    toast.success(
      status === PettyCashFundReplenishmentStatuses.draft
        ? "Petty cash fund replenishment saved as draft."
        : "Petty cash fund replenishment submitted for approval.",
    );
    options.onSaved?.();
    return true;
  }

  function updateStatus(status: PettyCashFundReplenishmentStatus) {
    if (!record) return false;
    const nextRecord = createPettyCashFundReplenishmentRecord(values, status, record);
    savePettyCashFundReplenishmentRecords(upsertPettyCashFundReplenishmentRecord(nextRecord));
    setRecord(nextRecord);
    setValues(createPettyCashFundReplenishmentFormValues(nextRecord));
    toast.success(`Petty cash fund replenishment marked as ${status}.`);
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

export type { PettyCashFundReplenishmentActionPageState } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
