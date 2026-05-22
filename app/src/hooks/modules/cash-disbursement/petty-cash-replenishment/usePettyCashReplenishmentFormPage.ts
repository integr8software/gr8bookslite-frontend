"use client";

import { useMemo, useState } from "react";
import {
  calculatePettyCashReplenishmentTotals,
  createEmptyPettyCashReplenishmentEntry,
  PettyCashReplenishmentInitialEntries,
  PettyCashReplenishmentInitialFormValues,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentData";
import type {
  PettyCashReplenishmentCopyFromRecord,
  PettyCashReplenishmentCopySource,
  PettyCashReplenishmentEntry,
  PettyCashReplenishmentFormErrors,
  PettyCashReplenishmentFormValues,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import { validatePettyCashReplenishmentForm } from "@/app/src/validations/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentValidation";

export function usePettyCashReplenishmentFormPage() {
  const [values, setValues] = useState<PettyCashReplenishmentFormValues>(
    PettyCashReplenishmentInitialFormValues,
  );
  const [entries, setEntries] = useState<PettyCashReplenishmentEntry[]>(
    PettyCashReplenishmentInitialEntries,
  );
  const [errors, setErrors] = useState<PettyCashReplenishmentFormErrors>({});
  const [copyFromOpen, setCopyFromOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [selectedSource, setSelectedSource] =
    useState<PettyCashReplenishmentCopySource>("Petty Cash Voucher");

  const totals = useMemo(
    () => calculatePettyCashReplenishmentTotals(entries),
    [entries],
  );

  function updateField<TKey extends keyof PettyCashReplenishmentFormValues>(
    field: TKey,
    value: PettyCashReplenishmentFormValues[TKey],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateEntry(
    entryId: string,
    field: keyof PettyCashReplenishmentEntry,
    value: string,
  ) {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === entryId ? { ...entry, [field]: value } : entry,
      ),
    );
    setErrors((current) => ({ ...current, entries: undefined }));
  }

  function addEntry() {
    setEntries((current) => [
      ...current,
      createEmptyPettyCashReplenishmentEntry(),
    ]);
    setErrors((current) => ({ ...current, entries: undefined }));
  }

  function openCopyFrom(source: PettyCashReplenishmentCopySource) {
    setSelectedSource(source);
    setCopyDialogOpen(true);
    setCopyFromOpen(false);
  }

  function selectCopyFromRecord(record: PettyCashReplenishmentCopyFromRecord) {
    setValues((current) => ({
      ...current,
      documentDate: record.documentDate,
      vceCode: record.vceCode,
      vceName: record.vceName,
    }));
    setErrors((current) => ({
      ...current,
      documentDate: undefined,
      vceCode: undefined,
      vceName: undefined,
    }));
    setCopyDialogOpen(false);
  }

  function handleSubmit() {
    const nextErrors = validatePettyCashReplenishmentForm(values, entries);

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  return {
    addEntry,
    copyDialogOpen,
    copyFromOpen,
    errors,
    entries,
    handleSubmit,
    openCopyFrom,
    selectCopyFromRecord,
    selectedSource,
    setCopyDialogOpen,
    setCopyFromOpen,
    totals,
    updateEntry,
    updateField,
    values,
  };
}
