"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
  calculatePettyCashReplenishmentTotals,
  createPettyCashReplenishmentFormValues,
  createEmptyPettyCashReplenishmentEntry,
  PettyCashReplenishmentInitialEntries,
  PettyCashReplenishmentInitialFormValues,
  PettyCashReplenishmentRecords,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentData";
import type {
  PettyCashReplenishmentCopyFromRecord,
  PettyCashReplenishmentCopySource,
  PettyCashReplenishmentFormMode,
  PettyCashReplenishmentEntry,
  PettyCashReplenishmentFormErrors,
  PettyCashReplenishmentFormValues,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import { validatePettyCashReplenishmentForm } from "@/app/src/validations/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentValidation";

export function usePettyCashReplenishmentFormPage() {
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const mode = getPettyCashReplenishmentFormMode(pathname);
  const existingReplenishment = PettyCashReplenishmentRecords.find(
    (record) => record.id === params.recordId,
  );
  const isReadonly = mode === "view";
  const [values, setValues] = useState<PettyCashReplenishmentFormValues>(() =>
    existingReplenishment
      ? createPettyCashReplenishmentFormValues(existingReplenishment)
      : PettyCashReplenishmentInitialFormValues,
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
    if (isReadonly) {
      return;
    }

    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateEntry(
    entryId: string,
    field: keyof PettyCashReplenishmentEntry,
    value: string,
  ) {
    if (isReadonly) {
      return;
    }

    setEntries((current) =>
      current.map((entry) =>
        entry.id === entryId ? { ...entry, [field]: value } : entry,
      ),
    );
    setErrors((current) => ({ ...current, entries: undefined }));
  }

  function addEntry() {
    if (isReadonly) {
      return;
    }

    setEntries((current) => [
      ...current,
      createEmptyPettyCashReplenishmentEntry(),
    ]);
    setErrors((current) => ({ ...current, entries: undefined }));
  }

  function openCopyFrom(source: PettyCashReplenishmentCopySource) {
    if (isReadonly) {
      return;
    }

    setSelectedSource(source);
    setCopyDialogOpen(true);
    setCopyFromOpen(false);
  }

  function selectCopyFromRecord(record: PettyCashReplenishmentCopyFromRecord) {
    if (isReadonly) {
      return;
    }

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
    if (isReadonly) {
      return true;
    }

    const nextErrors = validatePettyCashReplenishmentForm(values, entries);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted replenishment fields.");
      return false;
    }

    toast.success(
      mode === "edit"
        ? "Petty cash replenishment updated."
        : "Petty cash replenishment created.",
    );
    return true;
  }

  return {
    addEntry,
    copyDialogOpen,
    copyFromOpen,
    errors,
    entries,
    existingReplenishment,
    handleSubmit,
    isReadonly,
    mode,
    needsRecord: mode === "edit" || mode === "view",
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

function getPettyCashReplenishmentFormMode(
  pathname: string,
): PettyCashReplenishmentFormMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}
