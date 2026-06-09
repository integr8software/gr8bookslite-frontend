"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
  calculatePettyCashFundReplenishmentTotals,
  createPettyCashFundReplenishmentFormValues,
  createEmptyPettyCashFundReplenishmentEntry,
  PettyCashFundReplenishmentInitialEntries,
  PettyCashFundReplenishmentInitialFormValues,
  PettyCashFundReplenishmentRecords,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentData";
import type {
  PettyCashFundReplenishmentCopyFromRecord,
  PettyCashFundReplenishmentCopySource,
  PettyCashFundReplenishmentFormMode,
  PettyCashFundReplenishmentEntry,
  PettyCashFundReplenishmentFormErrors,
  PettyCashFundReplenishmentFormValues,
  PettyCashFundReplenishmentRecord,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import { validatePettyCashFundReplenishmentForm } from "@/app/src/validations/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentValidation";

type PettyCashFundReplenishmentFormPageOptions = {
  existingReplenishment?: PettyCashFundReplenishmentRecord;
  mode?: PettyCashFundReplenishmentFormMode;
  onSaved?: () => void;
};

export function usePettyCashFundReplenishmentFormPage(
  options: PettyCashFundReplenishmentFormPageOptions = {},
) {
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const mode = options.mode ?? getPettyCashFundReplenishmentFormMode(pathname);
  const existingReplenishment = options.existingReplenishment ?? PettyCashFundReplenishmentRecords.find(
    (record) => record.id === params.recordId,
  );
  const isReadonly = mode === "view";
  const [values, setValues] = useState<PettyCashFundReplenishmentFormValues>(() =>
    existingReplenishment
      ? createPettyCashFundReplenishmentFormValues(existingReplenishment)
      : PettyCashFundReplenishmentInitialFormValues,
  );
  const [entries, setEntries] = useState<PettyCashFundReplenishmentEntry[]>(
    PettyCashFundReplenishmentInitialEntries,
  );
  const [errors, setErrors] = useState<PettyCashFundReplenishmentFormErrors>({});
  const [copyFromOpen, setCopyFromOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [selectedSource, setSelectedSource] =
    useState<PettyCashFundReplenishmentCopySource>("Petty Cash Voucher");

  const totals = useMemo(
    () => calculatePettyCashFundReplenishmentTotals(entries),
    [entries],
  );

  function updateField<TKey extends keyof PettyCashFundReplenishmentFormValues>(
    field: TKey,
    value: PettyCashFundReplenishmentFormValues[TKey],
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateEntry(
    entryId: string,
    field: keyof PettyCashFundReplenishmentEntry,
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
      createEmptyPettyCashFundReplenishmentEntry(),
    ]);
    setErrors((current) => ({ ...current, entries: undefined }));
  }

  function openCopyFrom(source: PettyCashFundReplenishmentCopySource) {
    if (isReadonly) {
      return;
    }

    setSelectedSource(source);
    setCopyDialogOpen(true);
    setCopyFromOpen(false);
  }

  function selectCopyFromRecord(record: PettyCashFundReplenishmentCopyFromRecord) {
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

    const nextErrors = validatePettyCashFundReplenishmentForm(values, entries);

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
    options.onSaved?.();
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

function getPettyCashFundReplenishmentFormMode(
  pathname: string,
): PettyCashFundReplenishmentFormMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}
