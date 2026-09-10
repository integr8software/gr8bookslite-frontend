"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CollectionTypeImportBatchSize,
  CollectionTypeImportDefaultColumnWidths,
  CollectionTypeImportFieldOrder,
  CollectionTypeImportPreviewPageSize,
} from "@/app/src/constants/modules/financial-maintenance/collection-type/CollectionTypeConstants";
import { ModuleImportFixedColumnsWidth } from "@/app/src/constants/shared/module/ModuleImportConstants";
import {
  createBlankCollectionTypeImportRow,
  CollectionTypeImportRowHasErrors,
  getNextCollectionTypeImportRowNumber,
  normalizeCollectionTypeName,
  normalizeImportedCollectionTypeCellValue,
  parseCollectionTypeImportText,
  parseImportTabularRows,
  readCollectionTypeImportFileText,
  renumberCollectionTypeImportRows,
  validateCollectionTypeImportFileSize,
  validateCollectionTypeImportRows,
  waitForNextCollectionTypeImportBatch,
} from "@/app/src/data/modules/financial-maintenance/collection-type/CollectionTypeData";
import type {
  CollectionTypeImportColumnId,
  CollectionTypeImportColumnWidths,
  CollectionTypeImportDialogProps,
  CollectionTypeImportMode,
  CollectionTypeImportPreviewRow,
  CollectionTypeImportProgress,
} from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";
import { reorderModuleImportRows } from "@/app/src/utils/module-import.util";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";

export function useCollectionTypeImportDialog({
  existingCollectionTypes,
  onClose,
  onImportCollectionTypes,
}: Pick<CollectionTypeImportDialogProps, "existingCollectionTypes" | "onClose" | "onImportCollectionTypes">) {
  const [importError, setImportError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [previewRows, setPreviewRows] = useState<CollectionTypeImportPreviewRow[]>([]);
  const [previewPage, setPreviewPage] = useState(1);
  const [progress, setProgress] = useState<CollectionTypeImportProgress | null>(null);
  const [pristineManualRowIds, setPristineManualRowIds] = useState<Set<string>>(() => new Set());
  const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [importMode, setImportMode] = useState<CollectionTypeImportMode>("all-rows");
  const [columnWidths, setColumnWidths] = useState<CollectionTypeImportColumnWidths>(CollectionTypeImportDefaultColumnWidths);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(() => new Set());
  const validatedRows = useMemo(
    () => validateCollectionTypeImportRows(previewRows, existingCollectionTypes),
    [existingCollectionTypes, previewRows],
  );
  const displayedRows = useMemo(
    () => validatedRows.map((row) => (pristineManualRowIds.has(row.id) ? { ...row, cellErrors: {}, rowErrors: [] } : row)),
    [pristineManualRowIds, validatedRows],
  );
  const invalidRows = displayedRows.filter(CollectionTypeImportRowHasErrors);
  const actualInvalidRows = validatedRows.filter(CollectionTypeImportRowHasErrors);
  const validRows = validatedRows.filter((row) => !CollectionTypeImportRowHasErrors(row));
  const validSelectedRows = validRows.filter((row) => selectedRowIds.has(row.id));
  const totalPages = Math.max(1, Math.ceil(displayedRows.length / CollectionTypeImportPreviewPageSize));
  const safePreviewPage = Math.min(previewPage, totalPages);
  const visibleRows = displayedRows.slice(
    (safePreviewPage - 1) * CollectionTypeImportPreviewPageSize,
    safePreviewPage * CollectionTypeImportPreviewPageSize,
  );
  const isBusy = Boolean(progress) || isParsing;
  const canImportAllRows = validatedRows.length > 0 && !isBusy;
  const canImportAllValid = validRows.length > 0 && !isBusy;
  const canImportSelectedValid = validSelectedRows.length > 0 && !isBusy;
  const importTableWidth =
    ModuleImportFixedColumnsWidth + CollectionTypeImportFieldOrder.reduce((total, field) => total + columnWidths[field], 0);

  function updateColumnWidth(field: CollectionTypeImportColumnId, width: number) {
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

  function appendRows(rows: CollectionTypeImportPreviewRow[]) {
    const seenNames = new Set(previewRows.map((row) => normalizeCollectionTypeName(row.collectionType.collectionTypeName)).filter(Boolean));
    const uniqueRows = rows.filter((row) => {
      const normalizedName = normalizeCollectionTypeName(row.collectionType.collectionTypeName);
      if (normalizedName && seenNames.has(normalizedName)) return false;
      if (normalizedName) seenNames.add(normalizedName);
      return true;
    });
    const nextRows = renumberCollectionTypeImportRows([...previewRows, ...uniqueRows]);

    setPreviewRows(nextRows);
    setPristineManualRowIds((current) => {
      const next = new Set(current);
      uniqueRows.forEach((row) => next.delete(row.id));
      return next;
    });
    setSelectedRowIds(new Set());
    setPreviewPage(Math.max(1, Math.ceil(nextRows.length / CollectionTypeImportPreviewPageSize)));
    setImportError(
      rows.length > uniqueRows.length
        ? `${rows.length - uniqueRows.length} duplicate ${rows.length - uniqueRows.length === 1 ? "row was" : "rows were"} skipped.`
        : null,
    );
  }

  async function handleFileUpload(file: File | undefined) {
    if (!file || progress) return;
    const sizeError = validateCollectionTypeImportFileSize(file);

    if (sizeError) {
      setImportError(sizeError);
      return;
    }

    setIsParsing(true);
    try {
      const text = await readCollectionTypeImportFileText(file);
      const rows = parseCollectionTypeImportText(text, getNextCollectionTypeImportRowNumber(previewRows));
      if (rows.length === 0) throw new Error("No collection type rows were found.");
      appendRows(rows);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Could not read the imported collection types.");
    } finally {
      setIsParsing(false);
    }
  }

  function addBlankRow() {
    if (progress) return;
    const blankRow = createBlankCollectionTypeImportRow(getNextCollectionTypeImportRowNumber(previewRows));
    const nextRows = [...previewRows, blankRow];
    setPreviewRows(nextRows);
    setPristineManualRowIds((current) => new Set(current).add(blankRow.id));
    setPreviewPage(Math.max(1, Math.ceil(nextRows.length / CollectionTypeImportPreviewPageSize)));
    setImportError(null);
  }

  function updatePreviewCell(rowId: string, field: CollectionTypeImportColumnId, value: string) {
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
              collectionType: {
                ...row.collectionType,
                [field]: normalizeImportedCollectionTypeCellValue(field, value) as never,
              },
            }
          : row,
      ),
    );
    setImportError(null);
  }

  function pasteIntoPreviewCell(rowId: string, field: CollectionTypeImportColumnId, text: string) {
    const pastedRows = parseImportTabularRows(text).filter((row) => row.some((cell) => cell.trim() !== ""));

    if (pastedRows.length === 0) return;
    const startColumnIndex = CollectionTypeImportFieldOrder.indexOf(field);

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
        const targetRow = nextRows[targetIndex] ?? createBlankCollectionTypeImportRow(getNextCollectionTypeImportRowNumber(nextRows));
        const nextCollectionType = { ...targetRow.collectionType };

        pastedRow.forEach((cellValue, cellIndex) => {
          const targetField = CollectionTypeImportFieldOrder[startColumnIndex + cellIndex];
          if (!targetField) return;
          nextCollectionType[targetField] = normalizeImportedCollectionTypeCellValue(targetField, cellValue) as never;
        });

        touchedRowIds.add(targetRow.id);
        nextRows[targetIndex] = { ...targetRow, collectionType: nextCollectionType };
      });

      setPristineManualRowIds((current) => {
        const next = new Set(current);
        touchedRowIds.forEach((touchedRowId) => next.delete(touchedRowId));
        return next;
      });
      return renumberCollectionTypeImportRows(nextRows);
    });
  }

  function pasteIntoPreviewGrid(text: string) {
    if (!text.trim() || progress) return;
    appendRows(parseCollectionTypeImportText(text, getNextCollectionTypeImportRowNumber(previewRows)));
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
    const nextRows = renumberCollectionTypeImportRows(previewRows.filter((row) => !selectedRowIds.has(row.id)));
    setPreviewRows(nextRows);
    setSelectedRowIds(new Set());
    setPreviewPage((page) => Math.max(1, Math.min(page, Math.ceil(nextRows.length / CollectionTypeImportPreviewPageSize))));
  }

  function movePreviewRow(sourceRowId: string, targetRowId: string, position: "before" | "after") {
    setPreviewRows((rows) => renumberCollectionTypeImportRows(reorderModuleImportRows(rows, sourceRowId, targetRowId, position)));
  }

  function setImportSelection(mode: CollectionTypeImportMode) {
    setImportMode(mode);
    setIsImportMenuOpen(false);
  }

  async function handleImport(mode = importMode) {
    const releaseLock = acquireModuleActionLock(`financial-maintenance:collection-type:import:${mode}`);
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
      for (let index = 0; index < rowsToImport.length; index += CollectionTypeImportBatchSize) {
        const batch = rowsToImport.slice(index, index + CollectionTypeImportBatchSize);
        await onImportCollectionTypes(batch.map((row) => row.collectionType));
        setProgress({
          imported: Math.min(index + batch.length, rowsToImport.length),
          total: rowsToImport.length,
        });
        await waitForNextCollectionTypeImportBatch();
      }

      toast.success(`${rowsToImport.length} default ${rowsToImport.length === 1 ? "account" : "accounts"} imported.`);
      const nextRows = renumberCollectionTypeImportRows(previewRows.filter((row) => !importedRowIds.has(row.id)));
      setPreviewRows(nextRows);
      setSelectedRowIds(new Set());
      setPreviewPage(1);
      setImportMode("all-rows");
      if (nextRows.length === 0) onClose();
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Collection types could not be imported.");
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
