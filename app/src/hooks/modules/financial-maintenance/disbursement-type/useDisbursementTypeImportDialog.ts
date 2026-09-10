"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  DisbursementTypeImportBatchSize,
  DisbursementTypeImportDefaultColumnWidths,
  DisbursementTypeImportFieldOrder,
  DisbursementTypeImportPreviewPageSize,
} from "@/app/src/constants/modules/financial-maintenance/disbursement-type/DisbursementTypeConstants";
import { ModuleImportFixedColumnsWidth } from "@/app/src/constants/shared/module/ModuleImportConstants";
import {
  createBlankDisbursementTypeImportRow,
  DisbursementTypeImportRowHasErrors,
  getNextDisbursementTypeImportRowNumber,
  normalizeDisbursementTypeName,
  normalizeImportedDisbursementTypeCellValue,
  parseDisbursementTypeImportText,
  parseImportTabularRows,
  readDisbursementTypeImportFileText,
  renumberDisbursementTypeImportRows,
  validateDisbursementTypeImportFileSize,
  validateDisbursementTypeImportRows,
  waitForNextDisbursementTypeImportBatch,
} from "@/app/src/data/modules/financial-maintenance/disbursement-type/DisbursementTypeMaintenanceData";
import type {
  DisbursementTypeImportColumnId,
  DisbursementTypeImportColumnWidths,
  DisbursementTypeImportDialogProps,
  DisbursementTypeImportMode,
  DisbursementTypeImportPreviewRow,
  DisbursementTypeImportProgress,
} from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";
import { reorderModuleImportRows } from "@/app/src/utils/module-import.util";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";

export function useDisbursementTypeImportDialog({
  existingDisbursementTypes,
  onClose,
  onImportDisbursementTypes,
}: Pick<DisbursementTypeImportDialogProps, "existingDisbursementTypes" | "onClose" | "onImportDisbursementTypes">) {
  const [importError, setImportError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [previewRows, setPreviewRows] = useState<DisbursementTypeImportPreviewRow[]>([]);
  const [previewPage, setPreviewPage] = useState(1);
  const [progress, setProgress] = useState<DisbursementTypeImportProgress | null>(null);
  const [pristineManualRowIds, setPristineManualRowIds] = useState<Set<string>>(() => new Set());
  const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [importMode, setImportMode] = useState<DisbursementTypeImportMode>("all-rows");
  const [columnWidths, setColumnWidths] = useState<DisbursementTypeImportColumnWidths>(DisbursementTypeImportDefaultColumnWidths);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(() => new Set());
  const validatedRows = useMemo(
    () => validateDisbursementTypeImportRows(previewRows, existingDisbursementTypes),
    [existingDisbursementTypes, previewRows],
  );
  const displayedRows = useMemo(
    () => validatedRows.map((row) => (pristineManualRowIds.has(row.id) ? { ...row, cellErrors: {}, rowErrors: [] } : row)),
    [pristineManualRowIds, validatedRows],
  );
  const invalidRows = displayedRows.filter(DisbursementTypeImportRowHasErrors);
  const actualInvalidRows = validatedRows.filter(DisbursementTypeImportRowHasErrors);
  const validRows = validatedRows.filter((row) => !DisbursementTypeImportRowHasErrors(row));
  const validSelectedRows = validRows.filter((row) => selectedRowIds.has(row.id));
  const totalPages = Math.max(1, Math.ceil(displayedRows.length / DisbursementTypeImportPreviewPageSize));
  const safePreviewPage = Math.min(previewPage, totalPages);
  const visibleRows = displayedRows.slice(
    (safePreviewPage - 1) * DisbursementTypeImportPreviewPageSize,
    safePreviewPage * DisbursementTypeImportPreviewPageSize,
  );
  const isBusy = Boolean(progress) || isParsing;
  const canImportAllRows = validatedRows.length > 0 && !isBusy;
  const canImportAllValid = validRows.length > 0 && !isBusy;
  const canImportSelectedValid = validSelectedRows.length > 0 && !isBusy;
  const importTableWidth =
    ModuleImportFixedColumnsWidth + DisbursementTypeImportFieldOrder.reduce((total, field) => total + columnWidths[field], 0);

  function updateColumnWidth(field: DisbursementTypeImportColumnId, width: number) {
    setColumnWidths((current) => ({ ...current, [field]: width }));
  }

  function resetImportState() {
    if (progress) return;
    setImportError(null);
    setPreviewRows([]);
    setPreviewPage(1);
    setPristineManualRowIds(new Set());
    setSelectedRowIds(new Set());
    setImportMode("all-rows");
    setIsSelectionMenuOpen(false);
    setIsImportMenuOpen(false);
  }

  function appendRows(rows: DisbursementTypeImportPreviewRow[]) {
    const seenNames = new Set(previewRows.map((row) => normalizeDisbursementTypeName(row.disbursementType.disbursementTypeName)).filter(Boolean));
    const uniqueRows = rows.filter((row) => {
      const normalizedName = normalizeDisbursementTypeName(row.disbursementType.disbursementTypeName);
      if (normalizedName && seenNames.has(normalizedName)) return false;
      if (normalizedName) seenNames.add(normalizedName);
      return true;
    });
    const nextRows = renumberDisbursementTypeImportRows([...previewRows, ...uniqueRows]);

    setPreviewRows(nextRows);
    setPristineManualRowIds((current) => {
      const next = new Set(current);
      uniqueRows.forEach((row) => next.delete(row.id));
      return next;
    });
    setSelectedRowIds(new Set());
    setPreviewPage(Math.max(1, Math.ceil(nextRows.length / DisbursementTypeImportPreviewPageSize)));
    setImportError(
      rows.length > uniqueRows.length
        ? `${rows.length - uniqueRows.length} duplicate ${rows.length - uniqueRows.length === 1 ? "row was" : "rows were"} skipped.`
        : null,
    );
  }

  async function handleFileUpload(file: File | undefined) {
    if (!file || progress) return;
    const sizeError = validateDisbursementTypeImportFileSize(file);

    if (sizeError) {
      setImportError(sizeError);
      return;
    }

    setIsParsing(true);
    try {
      const text = await readDisbursementTypeImportFileText(file);
      const rows = parseDisbursementTypeImportText(text, getNextDisbursementTypeImportRowNumber(previewRows));
      if (rows.length === 0) throw new Error("No disbursement type rows were found.");
      appendRows(rows);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Could not read the imported disbursement types.");
    } finally {
      setIsParsing(false);
    }
  }

  function addBlankRow() {
    if (progress) return;
    const blankRow = createBlankDisbursementTypeImportRow(getNextDisbursementTypeImportRowNumber(previewRows));
    const nextRows = [...previewRows, blankRow];
    setPreviewRows(nextRows);
    setPristineManualRowIds((current) => new Set(current).add(blankRow.id));
    setPreviewPage(Math.max(1, Math.ceil(nextRows.length / DisbursementTypeImportPreviewPageSize)));
    setImportError(null);
  }

  function updatePreviewCell(rowId: string, field: DisbursementTypeImportColumnId, value: string) {
    setPristineManualRowIds((current) => {
      if (!current.has(rowId)) return current;
      const next = new Set(current);
      next.delete(rowId);
      return next;
    });
    setPreviewRows((rows) =>
      rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              disbursementType: {
                ...row.disbursementType,
                [field]: normalizeImportedDisbursementTypeCellValue(field, value) as never,
              },
            }
          : row,
      ),
    );
    setImportError(null);
  }

  function pasteIntoPreviewCell(rowId: string, field: DisbursementTypeImportColumnId, text: string) {
    const pastedRows = parseImportTabularRows(text).filter((row) => row.some((cell) => cell.trim() !== ""));

    if (pastedRows.length === 0) return;
    const startColumnIndex = DisbursementTypeImportFieldOrder.indexOf(field);

    if (pastedRows.length === 1 && pastedRows[0]?.length === 1) {
      updatePreviewCell(rowId, field, pastedRows[0]?.[0] ?? "");
      return;
    }

    setPreviewRows((rows) => {
      const startRowIndex = rows.findIndex((row) => row.id === rowId);
      if (startRowIndex < 0) return rows;
      const nextRows = [...rows];
      const touchedRowIds = new Set<string>();

      pastedRows.forEach((pastedRow, pastedRowIndex) => {
        const targetIndex = startRowIndex + pastedRowIndex;
        const targetRow = nextRows[targetIndex] ?? createBlankDisbursementTypeImportRow(getNextDisbursementTypeImportRowNumber(nextRows));
        const nextDisbursementType = { ...targetRow.disbursementType };

        pastedRow.forEach((cellValue, cellIndex) => {
          const targetField = DisbursementTypeImportFieldOrder[startColumnIndex + cellIndex];
          if (!targetField) return;
          nextDisbursementType[targetField] = normalizeImportedDisbursementTypeCellValue(targetField, cellValue) as never;
        });

        touchedRowIds.add(targetRow.id);
        nextRows[targetIndex] = { ...targetRow, disbursementType: nextDisbursementType };
      });

      setPristineManualRowIds((current) => {
        const next = new Set(current);
        touchedRowIds.forEach((touchedRowId) => next.delete(touchedRowId));
        return next;
      });
      return renumberDisbursementTypeImportRows(nextRows);
    });
  }

  function pasteIntoPreviewGrid(text: string) {
    if (!text.trim() || progress) return;
    appendRows(parseDisbursementTypeImportText(text, getNextDisbursementTypeImportRowNumber(previewRows)));
  }

  function toggleRowSelection(rowId: string, isSelected: boolean) {
    setSelectedRowIds((current) => {
      const next = new Set(current);
      if (isSelected) next.add(rowId);
      else next.delete(rowId);
      return next;
    });
  }

  function selectRows(scope: "page" | "all") {
    const rowIds = (scope === "all" ? validatedRows : visibleRows).map((row) => row.id);
    setSelectedRowIds((current) => {
      const next = new Set(current);
      rowIds.forEach((rowId) => next.add(rowId));
      return next;
    });
    setIsSelectionMenuOpen(false);
  }

  function clearRowSelection() {
    setSelectedRowIds(new Set());
    setIsSelectionMenuOpen(false);
  }

  function removeSelectedRows() {
    const nextRows = renumberDisbursementTypeImportRows(previewRows.filter((row) => !selectedRowIds.has(row.id)));
    setPreviewRows(nextRows);
    setSelectedRowIds(new Set());
    setPreviewPage((page) => Math.max(1, Math.min(page, Math.ceil(nextRows.length / DisbursementTypeImportPreviewPageSize))));
  }

  function movePreviewRow(sourceRowId: string, targetRowId: string, position: "before" | "after") {
    setPreviewRows((rows) => renumberDisbursementTypeImportRows(reorderModuleImportRows(rows, sourceRowId, targetRowId, position)));
  }

  function setImportSelection(mode: DisbursementTypeImportMode) {
    setImportMode(mode);
    setIsImportMenuOpen(false);
  }

  async function handleImport(mode = importMode) {
    const releaseLock = acquireModuleActionLock(`financial-maintenance:disbursement-type:import:${mode}`);
    if (!releaseLock) return;

    const rowsToImport = mode === "selected-valid" ? validSelectedRows : mode === "all-valid" ? validRows : validatedRows;

    if (mode === "selected-valid" && selectedRowIds.size === 0) {
      setImportError("Select at least one valid row to import.");
      releaseLock();
      return;
    }
    if (mode === "all-rows" && actualInvalidRows.length > 0) {
      setPristineManualRowIds(new Set());
      setImportError(
        `Fix or remove ${actualInvalidRows.length} incorrect ${actualInvalidRows.length === 1 ? "row" : "rows"} before importing. No rows were imported.`,
      );
      releaseLock();
      return;
    }
    if (mode === "selected-valid" && rowsToImport.length === 0) {
      setImportError("Selected rows have errors. Fix them or choose valid rows.");
      releaseLock();
      return;
    }
    if (rowsToImport.length === 0 || isBusy) {
      releaseLock();
      return;
    }

    const importedRowIds = new Set(rowsToImport.map((row) => row.id));
    setProgress({ imported: 0, total: rowsToImport.length });
    setImportError(null);

    try {
      for (let index = 0; index < rowsToImport.length; index += DisbursementTypeImportBatchSize) {
        const batch = rowsToImport.slice(index, index + DisbursementTypeImportBatchSize);
        await onImportDisbursementTypes(batch.map((row) => row.disbursementType));
        setProgress({
          imported: Math.min(index + batch.length, rowsToImport.length),
          total: rowsToImport.length,
        });
        await waitForNextDisbursementTypeImportBatch();
      }

      toast.success(`${rowsToImport.length} default ${rowsToImport.length === 1 ? "account" : "accounts"} imported.`);
      const nextRows = renumberDisbursementTypeImportRows(previewRows.filter((row) => !importedRowIds.has(row.id)));
      setPreviewRows(nextRows);
      setSelectedRowIds(new Set());
      setPreviewPage(1);
      setImportMode("all-rows");
      if (nextRows.length === 0) onClose();
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Disbursement types could not be imported.");
      releaseLock();
    } finally {
      setProgress(null);
    }
  }

  return {
    addBlankRow,
    canImportAllRows,
    canImportAllValid,
    canImportSelectedValid,
    clearRowSelection,
    columnWidths,
    handleFileUpload,
    handleImport,
    importError,
    importMode,
    importTableWidth,
    invalidRows,
    isImportMenuOpen,
    isParsing,
    isSelectionMenuOpen,
    movePreviewRow,
    pasteIntoPreviewCell,
    pasteIntoPreviewGrid,
    progress,
    removeSelectedRows,
    resetImportState,
    safePreviewPage,
    selectRows,
    selectedRowIds,
    setImportSelection,
    setIsImportMenuOpen,
    setIsSelectionMenuOpen,
    setPreviewPage,
    toggleRowSelection,
    totalPages,
    updateColumnWidth,
    updatePreviewCell,
    validRows,
    validSelectedRows,
    validatedRows,
    visibleRows,
  };
}
