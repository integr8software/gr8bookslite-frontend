"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  DefaultColumnWidths,
  ImportBatchSize,
  ImportFieldOrder,
  PreviewPageSize,
  SelectionColumnWidth,
} from "@/app/src/constants/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceConstants";
import {
  createBlankDiscountImportRow,
  createExistingDiscountNameMap,
  getNextDiscountImportRowNumber,
  normalizeDiscountName,
  normalizeImportedDiscountCellValue,
  parseDiscountImportTabularRows,
  parseDiscountImportText,
  readDiscountImportFileText,
  removeDuplicateDiscountImportRows,
  renumberDiscountImportRows,
  rowHasErrors,
  validateDiscountImportRows,
  validateImportFileSize,
  waitForNextImportBatch,
} from "@/app/src/data/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceData";
import type {
  Discount,
  DiscountImportColumnId,
  DiscountImportColumnWidths,
  DiscountImportMode,
  DiscountImportPreviewRow,
  DiscountMaintenanceImportDialogProps,
  ImportProgress,
} from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";
import { reorderModuleImportRows } from "@/app/src/utils/module-import.util";

export function useDiscountMaintenanceImportDialog({
  existingDiscounts,
  onClose,
  onImportDiscounts,
}: Pick<DiscountMaintenanceImportDialogProps, "existingDiscounts" | "onClose" | "onImportDiscounts">) {
  const [importError, setImportError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [previewRows, setPreviewRows] = useState<DiscountImportPreviewRow[]>([]);
  const [previewPage, setPreviewPage] = useState(1);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [pristineManualRowIds, setPristineManualRowIds] = useState<Set<string>>(() => new Set());
  const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [importMode, setImportMode] = useState<DiscountImportMode>("all-rows");
  const [columnWidths, setColumnWidths] = useState<DiscountImportColumnWidths>(DefaultColumnWidths);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(() => new Set());
  const existingDiscountNames = useMemo(() => createExistingDiscountNameMap(existingDiscounts), [existingDiscounts]);
  const validatedRows = useMemo(() => validateDiscountImportRows(previewRows, existingDiscountNames), [existingDiscountNames, previewRows]);
  const displayedRows = useMemo(
    () =>
      validatedRows.map((row) => (pristineManualRowIds.has(row.id) ? { ...row, cellErrors: {}, cellWarnings: {}, rowErrors: [] } : row)),
    [pristineManualRowIds, validatedRows],
  );
  const invalidRows = displayedRows.filter((row) => rowHasErrors(row));
  const actualInvalidRows = validatedRows.filter((row) => rowHasErrors(row));
  const validRows = validatedRows.filter((row) => !rowHasErrors(row));
  const validSelectedRows = validRows.filter((row) => selectedRowIds.has(row.id));
  const importableRows = importMode === "selected-valid" ? validSelectedRows : importMode === "all-valid" ? validRows : validatedRows;
  const canImport = importableRows.length > 0 && !progress;
  const canImportAllRows = validatedRows.length > 0 && !progress;
  const canImportAllValid = validRows.length > 0 && !progress;
  const canImportSelectedValid = validSelectedRows.length > 0 && !progress;
  const totalPages = Math.max(1, Math.ceil(displayedRows.length / PreviewPageSize));
  const safePreviewPage = Math.min(previewPage, totalPages);
  const visibleRows = displayedRows.slice((safePreviewPage - 1) * PreviewPageSize, safePreviewPage * PreviewPageSize);
  const importTableWidth = SelectionColumnWidth + ImportFieldOrder.reduce((total, field) => total + columnWidths[field], 0);

  function updateColumnWidth(field: DiscountImportColumnId, width: number) {
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

  function previewImportText(text: string, append = false) {
    try {
      let skippedCount = 0;
      let nextRowCount = 0;

      if (append) {
        const parsedRows = parseDiscountImportText(text, getNextDiscountImportRowNumber(previewRows));
        const filteredRows = removeDuplicateDiscountImportRows(parsedRows, previewRows);
        const uniqueRows = filteredRows.rows;
        const nextRows = renumberDiscountImportRows([...previewRows, ...uniqueRows]);

        skippedCount = filteredRows.skippedCount;
        nextRowCount = nextRows.length;
        setPreviewRows(nextRows);
        setPristineManualRowIds((current) => {
          const next = new Set(current);

          uniqueRows.forEach((row) => next.delete(row.id));
          return next;
        });
        setSelectedRowIds(new Set());
        setPreviewPage(Math.max(1, Math.ceil(nextRows.length / PreviewPageSize)));
      } else {
        const parsedRows = parseDiscountImportText(text);
        const filteredRows = removeDuplicateDiscountImportRows(parsedRows, []);
        const nextRows = renumberDiscountImportRows(filteredRows.rows);

        skippedCount = filteredRows.skippedCount;
        nextRowCount = nextRows.length;
        setPreviewRows(nextRows);
        setPristineManualRowIds(new Set());
        setPreviewPage(1);
        setSelectedRowIds(new Set());
      }

      setImportError(
        skippedCount > 0 && nextRowCount > 0 ? `${skippedCount} duplicate ${skippedCount === 1 ? "row was" : "rows were"} skipped.` : null,
      );
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Could not read the imported discounts.");
    }
  }

  function addBlankRow() {
    const blankRow = createBlankDiscountImportRow(getNextDiscountImportRowNumber(previewRows));

    setPreviewRows([...previewRows, blankRow]);
    setPristineManualRowIds((current) => new Set(current).add(blankRow.id));
    setSelectedRowIds(new Set());
    setImportError(null);
  }

  function removeSelectedRows() {
    if (selectedRowIds.size === 0 || progress) return;

    const nextRows = renumberDiscountImportRows(previewRows.filter((row) => !selectedRowIds.has(row.id)));

    setImportError(null);
    setPreviewRows(nextRows);
    setPristineManualRowIds((current) => {
      const next = new Set(current);

      selectedRowIds.forEach((rowId) => next.delete(rowId));
      return next;
    });
    setSelectedRowIds(new Set());
    setPreviewPage((page) => Math.max(1, Math.min(page, Math.ceil(nextRows.length / PreviewPageSize))));
  }

  function movePreviewRow(sourceRowId: string, targetRowId: string, position: "before" | "after") {
    setPreviewRows((rows) => renumberDiscountImportRows(reorderModuleImportRows(rows, sourceRowId, targetRowId, position)));
  }

  function toggleRowSelection(rowId: string, isSelected: boolean) {
    setSelectedRowIds((current) => {
      const nextSelected = new Set(current);

      if (isSelected) nextSelected.add(rowId);
      else nextSelected.delete(rowId);
      return nextSelected;
    });
  }

  function selectRows(scope: "page" | "all") {
    const rowIds = (scope === "all" ? validatedRows : visibleRows).map((row) => row.id);

    setSelectedRowIds((current) => {
      const nextSelected = new Set(current);

      rowIds.forEach((rowId) => nextSelected.add(rowId));
      return nextSelected;
    });
    setIsSelectionMenuOpen(false);
  }

  function clearRowSelection() {
    setSelectedRowIds(new Set());
    setIsSelectionMenuOpen(false);
  }

  function updatePreviewCell(rowId: string, field: DiscountImportColumnId, value: string) {
    setPristineManualRowIds((current) => {
      if (!current.has(rowId)) return current;

      const next = new Set(current);

      next.delete(rowId);
      return next;
    });

    if (field === "amount" && value.trim() && Number(value) < 0) return;

    if (field === "name") {
      const normalizedName = normalizeDiscountName(value);
      const hasDuplicateName =
        Boolean(normalizedName) &&
        previewRows.some((row) => row.id !== rowId && normalizeDiscountName(row.discount.name) === normalizedName);

      if (hasDuplicateName) {
        setImportError("Duplicate names are not accepted.");
        return;
      }
    }

    setPreviewRows((rows) =>
      rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              discount: updateDiscountImportField(row.discount, field, value),
            }
          : row,
      ),
    );
    setImportError(null);
  }

  async function handleFileUpload(file: File | undefined) {
    if (!file || progress) return;

    const sizeError = validateImportFileSize(file);

    if (sizeError) {
      setImportError(sizeError);
      return;
    }

    setIsParsing(true);

    try {
      const text = await readDiscountImportFileText(file);

      previewImportText(text, true);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Could not read the imported discounts.");
    } finally {
      setIsParsing(false);
    }
  }

  function pasteIntoPreviewCell(rowId: string, field: DiscountImportColumnId, text: string) {
    const pastedRows = parseDiscountImportTabularRows(text).filter((row) => row.some((cell) => cell.trim() !== ""));

    if (pastedRows.length === 0) return;

    const startColumnIndex = ImportFieldOrder.indexOf(field);
    const isSingleCellPaste = pastedRows.length === 1 && pastedRows[0]?.length === 1;

    if (isSingleCellPaste) {
      updatePreviewCell(rowId, field, pastedRows[0]?.[0] ?? "");
      return;
    }

    setImportError(null);
    setPreviewRows((rows) => {
      const startRowIndex = rows.findIndex((row) => row.id === rowId);

      if (startRowIndex < 0) return rows;

      const nextRows = [...rows];
      const seenNames = new Set(rows.map((row) => normalizeDiscountName(row.discount.name)).filter(Boolean));
      let skippedCount = 0;

      pastedRows.forEach((pastedRow, pastedRowIndex) => {
        const targetIndex = startRowIndex + pastedRowIndex;
        const targetRow = nextRows[targetIndex] ?? createBlankDiscountImportRow(getNextDiscountImportRowNumber(nextRows));
        let nextDiscount = { ...targetRow.discount };

        pastedRow.forEach((cellValue, cellIndex) => {
          const targetField = ImportFieldOrder[startColumnIndex + cellIndex];

          if (!targetField) return;

          nextDiscount = updateDiscountImportField(nextDiscount, targetField, cellValue);
        });

        const normalizedName = normalizeDiscountName(nextDiscount.name);
        const originalName = normalizeDiscountName(targetRow.discount.name);
        const isExistingTargetRow = targetIndex < rows.length;

        if (normalizedName && seenNames.has(normalizedName) && (!isExistingTargetRow || normalizedName !== originalName)) {
          skippedCount += 1;
          return;
        }

        if (originalName) seenNames.delete(originalName);
        if (normalizedName) seenNames.add(normalizedName);

        nextRows[targetIndex] = {
          ...targetRow,
          discount: nextDiscount,
        };
      });

      if (skippedCount > 0) {
        setImportError(`${skippedCount} duplicate ${skippedCount === 1 ? "row was" : "rows were"} skipped.`);
      }

      return nextRows;
    });
  }

  function pasteIntoPreviewGrid(text: string) {
    if (!text.trim() || progress) return;

    previewImportText(text, true);
  }

  function setImportSelection(mode: DiscountImportMode) {
    setImportMode(mode);
    setIsImportMenuOpen(false);
  }

  async function handleImport(mode = importMode) {
    const rowsToImport = mode === "selected-valid" ? validSelectedRows : mode === "all-valid" ? validRows : validatedRows;

    if (mode === "selected-valid" && selectedRowIds.size === 0) {
      setImportError("Select at least one valid row to import.");
      return;
    }

    if (mode === "all-rows" && actualInvalidRows.length > 0) {
      setPristineManualRowIds(new Set());
      setImportError(
        `Fix or remove ${actualInvalidRows.length} incorrect ${actualInvalidRows.length === 1 ? "row" : "rows"} before importing. No rows were imported.`,
      );
      return;
    }

    if (mode === "selected-valid" && rowsToImport.length === 0) {
      setImportError("Selected rows have errors. Fix them or choose valid rows.");
      return;
    }

    if (!canImport) return;

    const importedRowIds = new Set(rowsToImport.map((row) => row.id));
    const discountsToImport = rowsToImport.map((row, index) => ({
      ...row.discount,
      id: `discount-import-${Date.now()}-${index}`,
    }));

    setProgress({ imported: 0, total: discountsToImport.length });

    for (let index = 0; index < discountsToImport.length; index += ImportBatchSize) {
      const batch = discountsToImport.slice(index, index + ImportBatchSize);

      try {
        await onImportDiscounts(batch);
      } catch {
        setProgress(null);
        return;
      }
      setProgress({
        imported: Math.min(index + batch.length, discountsToImport.length),
        total: discountsToImport.length,
      });
      await waitForNextImportBatch();
    }

    setProgress(null);
    toast.success(`${discountsToImport.length} discount ${discountsToImport.length === 1 ? "definition" : "definitions"} imported.`);
    const nextRows = renumberDiscountImportRows(previewRows.filter((row) => !importedRowIds.has(row.id)));

    setPreviewRows(nextRows);
    setPristineManualRowIds((current) => {
      const nextSelected = new Set(current);

      importedRowIds.forEach((rowId) => nextSelected.delete(rowId));
      return nextSelected;
    });
    setSelectedRowIds((current) => {
      const nextSelected = new Set(current);

      importedRowIds.forEach((rowId) => nextSelected.delete(rowId));
      return nextSelected;
    });
    setImportMode("all-rows");
    setPreviewPage((page) => Math.max(1, Math.min(page, Math.ceil(nextRows.length / PreviewPageSize))));
    setImportError(null);

    if (nextRows.length === 0) {
      resetImportState();
      onClose();
    }
  }

  return {
    addBlankRow,
    canImport,
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

function updateDiscountImportField(discount: Discount, field: DiscountImportColumnId, value: string): Discount {
  const normalizedValue = normalizeImportedDiscountCellValue(field, value);

  switch (field) {
    case "amount":
      return { ...discount, amount: Number(value || 0) };
    case "description":
      return { ...discount, description: normalizedValue };
    case "discountType":
      return { ...discount, discountType: normalizedValue as Discount["discountType"] };
    case "name":
      return { ...discount, name: normalizedValue };
    case "type":
      return { ...discount, type: normalizedValue as Discount["type"] };
    default:
      return discount;
  }
}
