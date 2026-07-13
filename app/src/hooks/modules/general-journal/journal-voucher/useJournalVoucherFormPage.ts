"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { JournalVoucherHref } from "@/app/src/constants/modules/general-journal/journal-voucher/JournalVoucherConstants";
import {
  createJournalVoucherFormValues,
  createJournalVoucherFromForm,
  createJournalVoucherLine,
  getJournalVoucherTotals,
  renumberJournalVoucherLines,
  updateJournalVoucherFromForm,
} from "@/app/src/data/modules/general-journal/journal-voucher/JournalVoucherData";
import { useJournalVoucherStore } from "@/app/src/hooks/modules/general-journal/journal-voucher/useJournalVoucher";
import type {
  JournalVoucherActionMode,
  JournalVoucherFormErrors,
  JournalVoucherFormValues,
  JournalVoucherLine,
  JournalVoucherLineField,
} from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import { validateJournalVoucherForm } from "@/app/src/validations/modules/general-journal/journal-voucher/JournalVoucherValidation";

export function useJournalVoucherFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const records = useJournalVoucherStore((state) => state.records);
  const addRecord = useJournalVoucherStore((state) => state.addRecord);
  const updateRecord = useJournalVoucherStore((state) => state.updateRecord);
  const deleteRecord = useJournalVoucherStore((state) => state.deleteRecord);
  const isMutating = useJournalVoucherStore((state) => state.isMutating);
  const mode = getActionMode(pathname);
  const existingRecord = records.find((record) => record.id === params.recordId);
  const isReadonly = mode === "view" || existingRecord?.status === "Posted";
  const [values, setValues] = useState<JournalVoucherFormValues>(() =>
    createJournalVoucherFormValues(existingRecord),
  );
  const [errors, setErrors] = useState<JournalVoucherFormErrors>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const totals = useMemo(() => getJournalVoucherTotals(values.lines), [values.lines]);

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    if (isReadonly) {
      return;
    }

    const field = event.target.name as keyof JournalVoucherFormValues;
    const value =
      field === "currencyRate"
        ? Number(event.target.value || 0)
        : event.target.value;

    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateLine(
    lineId: string,
    field: JournalVoucherLineField,
    value: string | number,
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.id === lineId
          ? normalizeJournalVoucherLineUpdate(line, field, value)
          : line,
      ),
    }));
    clearLineError(lineId, field);
  }

  function addLines(count = 1) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      lines: [
        ...current.lines,
        ...Array.from({ length: count }, (_, index) =>
          createJournalVoucherLine(current.lines.length + index + 1),
        ),
      ],
    }));
    setErrors((current) => ({ ...current, lines: undefined }));
  }

  function removeLine(lineId: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const nextLines = current.lines.filter((line) => line.id !== lineId);

      return {
        ...current,
        lines: renumberJournalVoucherLines(
          nextLines.length > 0 ? nextLines : [createJournalVoucherLine(1)],
        ),
      };
    });
    setErrors((current) => ({ ...current, balance: undefined, lines: undefined }));
  }

  function insertLine(lineId: string, position: "above" | "below") {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const rowIndex = current.lines.findIndex((line) => line.id === lineId);
      const insertIndex =
        rowIndex === -1
          ? current.lines.length
          : rowIndex + (position === "below" ? 1 : 0);
      const nextLines = [...current.lines];

      nextLines.splice(insertIndex, 0, createJournalVoucherLine(insertIndex + 1));

      return {
        ...current,
        lines: renumberJournalVoucherLines(nextLines),
      };
    });
    setErrors((current) => ({ ...current, lines: undefined }));
  }

  function duplicateLine(lineId: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const rowIndex = current.lines.findIndex((line) => line.id === lineId);
      const sourceLine = current.lines[rowIndex];

      if (!sourceLine) {
        return current;
      }

      const nextLines = [...current.lines];

      nextLines.splice(rowIndex + 1, 0, {
        ...sourceLine,
        id: `jv-line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      });

      return {
        ...current,
        lines: renumberJournalVoucherLines(nextLines),
      };
    });
    setErrors((current) => ({ ...current, lines: undefined }));
  }

  function moveLine(fromLineId: string, toLineId: string) {
    if (isReadonly || fromLineId === toLineId) {
      return;
    }

    setValues((current) => {
      const fromIndex = current.lines.findIndex((line) => line.id === fromLineId);
      const toIndex = current.lines.findIndex((line) => line.id === toLineId);

      if (fromIndex === -1 || toIndex === -1) {
        return current;
      }

      const nextLines = [...current.lines];
      const [movedLine] = nextLines.splice(fromIndex, 1);

      nextLines.splice(toIndex, 0, movedLine);

      return {
        ...current,
        lines: renumberJournalVoucherLines(nextLines),
      };
    });
  }

  function clearLines(action: ModuleDataEntryClearAction) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const nextLines =
        action === "all"
          ? []
          : current.lines.filter((line) => !shouldClearLine(line, action));

      return {
        ...current,
        lines: renumberJournalVoucherLines(
          nextLines.length > 0 ? nextLines : [createJournalVoucherLine(1)],
        ),
      };
    });
    setErrors((current) => ({ ...current, balance: undefined, lines: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isReadonly) {
      return;
    }

    const nextErrors = validateJournalVoucherForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please balance the journal voucher before saving.");
      return;
    }

    if (mode === "edit" && existingRecord) {
      updateRecord(updateJournalVoucherFromForm(existingRecord, values));
    } else if (mode === "edit") {
      toast.error("Could not find the journal voucher to update.");
      return;
    } else {
      addRecord(createJournalVoucherFromForm(values));
    }

    router.push(JournalVoucherHref);
  }

  function handleConfirmDelete() {
    if (!existingRecord) {
      toast.error("Could not find the journal voucher to delete.");
      return;
    }

    deleteRecord(existingRecord.id);
    setIsDeleteDialogOpen(false);
    router.push(JournalVoucherHref);
  }

  function clearLineError(lineId: string, field: JournalVoucherLineField) {
    setErrors((current) => ({
      ...current,
      balance: undefined,
      lineErrors: {
        ...current.lineErrors,
        [lineId]: {
          ...current.lineErrors?.[lineId],
          [field]: undefined,
        },
      },
    }));
  }

  return {
    addLines,
    clearLines,
    duplicateLine,
    errors,
    existingRecord,
    handleConfirmDelete,
    handleInputChange,
    handleSubmit,
    insertLine,
    isDeleteDialogOpen,
    isMutating,
    isReadonly,
    mode,
    moveLine,
    needsRecord: mode === "edit" || mode === "view",
    removeLine,
    setIsDeleteDialogOpen,
    totals,
    updateLine,
    values,
  };
}

function getActionMode(pathname: string): JournalVoucherActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}

function normalizeJournalVoucherLineUpdate(
  line: JournalVoucherLine,
  field: JournalVoucherLineField,
  value: string | number,
) {
  const nextLine = {
    ...line,
    [field]:
      field === "debit" || field === "credit" ? Number(value || 0) : value,
  };

  if (field === "debit" && Number(nextLine.debit || 0) > 0) {
    nextLine.credit = 0;
  }

  if (field === "credit" && Number(nextLine.credit || 0) > 0) {
    nextLine.debit = 0;
  }

  return nextLine;
}

function shouldClearLine(
  line: JournalVoucherLine,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  if (action === "with-data") {
    return journalVoucherLineHasData(line);
  }

  if (action === "incomplete") {
    return journalVoucherLineHasData(line) && !journalVoucherLineIsComplete(line);
  }

  return !journalVoucherLineHasData(line);
}

function journalVoucherLineHasData(line: JournalVoucherLine) {
  return (
    line.accountCode.trim() !== "" ||
    line.accountTitle.trim() !== "" ||
    line.particulars.trim() !== "" ||
    line.partyCode.trim() !== "" ||
    line.partyName.trim() !== "" ||
    line.responsibilityCenter.trim() !== "" ||
    line.refNo.trim() !== "" ||
    line.vatType.trim() !== "" ||
    line.atcCode.trim() !== "" ||
    Number(line.debit || 0) > 0 ||
    Number(line.credit || 0) > 0
  );
}

function journalVoucherLineIsComplete(line: JournalVoucherLine) {
  const hasDebit = Number(line.debit || 0) > 0;
  const hasCredit = Number(line.credit || 0) > 0;

  return (
    line.accountCode.trim() !== "" &&
    line.accountTitle.trim() !== "" &&
    (hasDebit || hasCredit) &&
    !(hasDebit && hasCredit)
  );
}
