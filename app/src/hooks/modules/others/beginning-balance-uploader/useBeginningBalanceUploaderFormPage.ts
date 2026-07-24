"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  BeginningBalanceUploaderColumns,
  BeginningBalanceUploaderHref,
  getBeginningBalanceUploaderColumnIndex,
} from "@/app/src/constants/modules/others/beginning-balance-uploader/BeginningBalanceUploaderConstants";
import {
  BeginningBalanceUploaderInitialFormValues,
  createBeginningBalanceUploaderFormValues,
  createBeginningBalanceUploaderRecord,
  createBeginningBalanceUploaderRow,
  getBeginningBalanceUploaderTotals,
  getNextBeginningBalanceUploaderRowId,
  isBeginningBalanceHeaderRow,
  normalizeBeginningBalancePastedCell,
  updateBeginningBalanceUploaderRecord,
} from "@/app/src/data/modules/others/beginning-balance-uploader/BeginningBalanceUploaderData";
import { useBeginningBalanceUploaderStore } from "@/app/src/hooks/modules/others/beginning-balance-uploader/useBeginningBalanceUploader";
import type {
  BeginningBalanceUploaderActionMode,
  BeginningBalanceUploaderField,
  BeginningBalanceUploaderFormValues,
  BeginningBalanceUploaderRow,
} from "@/app/src/types/modules/beginning-balance-uploader/BeginningBalanceUploaderTypes";
import type { ModuleDataEntryCellTarget } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { validateBeginningBalanceUploader } from "@/app/src/validations/modules/others/beginning-balance-uploader/BeginningBalanceUploaderValidation";

export function useBeginningBalanceUploaderFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const { addRecord, isMutating, records, updateRecord } = useBeginningBalanceUploaderStore();
  const mode = getActionMode(pathname);
  const existingRecord = records.find((record) => record.id === params.recordId);
  const isReadonly = mode === "view";
  const [values, setValues] = useState<BeginningBalanceUploaderFormValues>(() =>
    existingRecord
      ? createBeginningBalanceUploaderFormValues(existingRecord)
      : { ...BeginningBalanceUploaderInitialFormValues, rows: [createBeginningBalanceUploaderRow("1")] },
  );
  const [validationError, setValidationError] = useState<string>();
  const totals = useMemo(() => getBeginningBalanceUploaderTotals(values.rows), [values.rows]);

  function updateHeaderField<Key extends keyof Omit<BeginningBalanceUploaderFormValues, "rows">>(
    field: Key,
    value: BeginningBalanceUploaderFormValues[Key],
  ) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setValidationError(undefined);
  }

  function addRows(count = 1) {
    if (isReadonly) return;
    setValues((current) => {
      let nextId = Number(getNextBeginningBalanceUploaderRowId(current.rows));
      const rowsToAdd = Array.from({ length: count }, () =>
        createBeginningBalanceUploaderRow(String(nextId++)),
      );
      return { ...current, rows: [...current.rows, ...rowsToAdd] };
    });
  }

  function deleteRow(rowId: string) {
    if (isReadonly) return;
    setValues((current) => {
      const rows = current.rows.filter((row) => row.id !== rowId);
      return {
        ...current,
        rows: rows.length
          ? rows
          : [createBeginningBalanceUploaderRow(getNextBeginningBalanceUploaderRowId(current.rows))],
      };
    });
  }

  function updateRow(rowId: string, field: BeginningBalanceUploaderField, value: string) {
    updateRowFields(rowId, { [field]: value });
  }

  function updateRowFields(rowId: string, nextValues: Partial<BeginningBalanceUploaderRow>) {
    if (isReadonly) return;
    setValues((current) => ({
      ...current,
      rows: current.rows.map((row) => (row.id === rowId ? { ...row, ...nextValues } : row)),
    }));
    setValidationError(undefined);
  }

  function duplicateRow(rowId: string) {
    if (isReadonly) return;
    setValues((current) => {
      const sourceIndex = current.rows.findIndex((row) => row.id === rowId);
      if (sourceIndex < 0) return current;
      const duplicate = {
        ...current.rows[sourceIndex],
        id: getNextBeginningBalanceUploaderRowId(current.rows),
      };
      const rows = [...current.rows];
      rows.splice(sourceIndex + 1, 0, duplicate);
      return { ...current, rows };
    });
  }

  function insertRow(rowId: string, position: "above" | "below") {
    if (isReadonly) return;
    setValues((current) => {
      const sourceIndex = current.rows.findIndex((row) => row.id === rowId);
      if (sourceIndex < 0) return current;
      const rows = [...current.rows];
      rows.splice(
        sourceIndex + (position === "below" ? 1 : 0),
        0,
        createBeginningBalanceUploaderRow(getNextBeginningBalanceUploaderRowId(current.rows)),
      );
      return { ...current, rows };
    });
  }

  function moveRow(fromRowId: string, toRowId: string) {
    if (isReadonly || fromRowId === toRowId) return;
    setValues((current) => {
      const fromIndex = current.rows.findIndex((row) => row.id === fromRowId);
      const toIndex = current.rows.findIndex((row) => row.id === toRowId);
      if (fromIndex < 0 || toIndex < 0) return current;
      const rows = [...current.rows];
      const [movedRow] = rows.splice(fromIndex, 1);
      rows.splice(toIndex, 0, movedRow);
      return { ...current, rows };
    });
  }

  function pasteRows(target: ModuleDataEntryCellTarget, pastedRows: string[][]) {
    if (isReadonly) return;
    const startColumnIndex = getBeginningBalanceUploaderColumnIndex(
      target.columnId as BeginningBalanceUploaderField,
    );
    const rowsToPaste = isBeginningBalanceHeaderRow(pastedRows[0], startColumnIndex)
      ? pastedRows.slice(1)
      : pastedRows;
    if (!rowsToPaste.length) return;

    setValues((current) => ({
      ...current,
      rows: applyPastedRows(current.rows, rowsToPaste, target.rowIndex, startColumnIndex),
    }));
    setValidationError(undefined);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isReadonly) return;

    const error = validateBeginningBalanceUploader(
      values.documentDate,
      values.currencyType,
      values.currencyRate,
      values.rows,
    );
    setValidationError(error);
    if (error) {
      toast.error(error);
      return;
    }

    if (mode === "edit" && existingRecord) {
      updateRecord(updateBeginningBalanceUploaderRecord(existingRecord, values));
    } else if (mode === "edit") {
      toast.error("Could not find the beginning balance to update.");
      return;
    } else {
      addRecord(createBeginningBalanceUploaderRecord(values));
    }

    router.push(BeginningBalanceUploaderHref);
  }

  return {
    addRows,
    duplicateRow,
    existingRecord,
    handleSubmit,
    insertRow,
    isMutating,
    isReadonly,
    mode,
    moveRow,
    needsRecord: mode === "edit" || mode === "view",
    pasteRows,
    totals,
    updateHeaderField,
    updateRow,
    updateRowFields,
    validationError,
    values,
    deleteRow,
  };
}

function applyPastedRows(
  currentRows: BeginningBalanceUploaderRow[],
  pastedRows: string[][],
  startRowIndex: number,
  startColumnIndex: number,
) {
  const nextRows = [...currentRows];
  let nextId = Number(getNextBeginningBalanceUploaderRowId(nextRows));
  while (nextRows.length < startRowIndex + pastedRows.length) {
    nextRows.push(createBeginningBalanceUploaderRow(String(nextId++)));
  }

  pastedRows.forEach((pastedRow, pastedRowIndex) => {
    const targetRowIndex = startRowIndex + pastedRowIndex;
    const targetRow = { ...nextRows[targetRowIndex] };
    pastedRow.forEach((cellValue, pastedColumnIndex) => {
      const targetColumn = BeginningBalanceUploaderColumns[startColumnIndex + pastedColumnIndex];
      if (targetColumn) {
        targetRow[targetColumn.field] = normalizeBeginningBalancePastedCell(
          targetColumn.field,
          cellValue,
        );
      }
    });
    nextRows[targetRowIndex] = targetRow;
  });

  return nextRows;
}

function getActionMode(pathname: string): BeginningBalanceUploaderActionMode {
  if (pathname.includes("/view/")) return "view";
  if (pathname.includes("/edit/")) return "edit";
  return "add";
}
