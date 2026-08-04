"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { ModuleImportMode } from "@/app/src/ui/shared/module/ModuleImportControls";
import type {
  DeliveryVehicleModuleConfig,
  DeliveryVehicleModuleRecord,
} from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import {
  applyDeliveryVehicleImportDefaultValues,
  createBlankDeliveryVehicleImportRow,
  createDeliveryVehicleImportExistingNameMap,
  DeliveryVehicleImportBatchSize,
  DeliveryVehicleImportPreviewPageSize,
  deliveryVehicleImportRowHasErrors,
  getDeliveryVehicleImportColumnWidth,
  getDeliveryVehicleImportFields,
  getNextDeliveryVehicleImportRowNumber,
  normalizeDeliveryVehicleImportedValue,
  parseDeliveryVehicleImportTabularRows,
  parseDeliveryVehicleImportText,
  readDeliveryVehicleImportFileText,
  renumberDeliveryVehicleImportRows,
  validateDeliveryVehicleImportFileSize,
  validateDeliveryVehicleImportRows,
  waitForNextDeliveryVehicleImportBatch,
  type DeliveryVehicleImportPreviewRow,
  type DeliveryVehicleImportProgress,
} from "@/app/src/ui/modules/delivery-vehicle-management/import/DeliveryVehicleModuleImportUtils";

type Params = {
  config: DeliveryVehicleModuleConfig;
  existingRecords: DeliveryVehicleModuleRecord[];
  onClose: () => void;
  onImportRecords: (rows: Array<Record<string, string>>) => void;
};

export function useDeliveryVehicleModuleImportDialog({
  config,
  existingRecords,
  onClose,
  onImportRecords,
}: Params) {
  const fields = useMemo(() => getDeliveryVehicleImportFields(config), [config]);
  const existingNames = useMemo(
    () => createDeliveryVehicleImportExistingNameMap(existingRecords),
    [existingRecords],
  );
  const [importError, setImportError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [previewRows, setPreviewRows] = useState<DeliveryVehicleImportPreviewRow[]>([]);
  const [previewPage, setPreviewPage] = useState(1);
  const [progress, setProgress] = useState<DeliveryVehicleImportProgress | null>(null);
  const [pristineManualRowIds, setPristineManualRowIds] = useState<Set<string>>(() => new Set());
  const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [importMode, setImportMode] = useState<ModuleImportMode>("all-rows");
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(() => new Set());
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      fields.map((field) => [field.key, getDeliveryVehicleImportColumnWidth(field)]),
    ),
  );
  const validatedRows = useMemo(
    () => validateDeliveryVehicleImportRows(previewRows, fields, existingNames),
    [existingNames, fields, previewRows],
  );
  const displayedRows = useMemo(
    () =>
      validatedRows.map((row) =>
        pristineManualRowIds.has(row.id)
          ? { ...row, cellErrors: {}, cellWarnings: {}, rowErrors: [] }
          : row,
      ),
    [pristineManualRowIds, validatedRows],
  );
  const invalidRows = displayedRows.filter((row) => deliveryVehicleImportRowHasErrors(row));
  const actualInvalidRows = validatedRows.filter((row) => deliveryVehicleImportRowHasErrors(row));
  const validRows = validatedRows.filter((row) => !deliveryVehicleImportRowHasErrors(row));
  const validSelectedRows = validRows.filter((row) => selectedRowIds.has(row.id));
  const importableRows =
    importMode === "selected-valid"
      ? validSelectedRows
      : importMode === "all-valid"
        ? validRows
        : validatedRows;
  const canImport = importableRows.length > 0 && !progress;
  const canImportAllRows = validatedRows.length > 0 && !progress;
  const canImportAllValid = validRows.length > 0 && !progress;
  const canImportSelectedValid = validSelectedRows.length > 0 && !progress;
  const totalPages = Math.max(
    1,
    Math.ceil(displayedRows.length / DeliveryVehicleImportPreviewPageSize),
  );
  const safePreviewPage = Math.min(previewPage, totalPages);
  const visibleRows = displayedRows.slice(
    (safePreviewPage - 1) * DeliveryVehicleImportPreviewPageSize,
    safePreviewPage * DeliveryVehicleImportPreviewPageSize,
  );

  function updateColumnWidth(fieldKey: string, width: number) {
    setColumnWidths((current) => ({ ...current, [fieldKey]: width }));
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
      const parsedRows = parseDeliveryVehicleImportText(
        text,
        fields,
        getNextDeliveryVehicleImportRowNumber(append ? previewRows : []),
      );
      const nextRows = renumberDeliveryVehicleImportRows(
        append ? [...previewRows, ...parsedRows] : parsedRows,
      );

      setPreviewRows(nextRows);
      setPristineManualRowIds(new Set());
      setSelectedRowIds(new Set());
      setPreviewPage(
        append ? Math.max(1, Math.ceil(nextRows.length / DeliveryVehicleImportPreviewPageSize)) : 1,
      );
      setImportError(null);
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : `Could not read the imported ${config.noun} records.`,
      );
    }
  }

  function addBlankRow() {
    const blankRow = createBlankDeliveryVehicleImportRow(
      getNextDeliveryVehicleImportRowNumber(previewRows),
      fields,
    );
    setPreviewRows([...previewRows, blankRow]);
    setPristineManualRowIds((current) => new Set(current).add(blankRow.id));
    setSelectedRowIds(new Set());
    setImportError(null);
  }

  function removeSelectedRows() {
    if (selectedRowIds.size === 0 || progress) return;
    const nextRows = renumberDeliveryVehicleImportRows(
      previewRows.filter((row) => !selectedRowIds.has(row.id)),
    );
    setImportError(null);
    setPreviewRows(nextRows);
    setPristineManualRowIds((current) => {
      const next = new Set(current);
      selectedRowIds.forEach((rowId) => next.delete(rowId));
      return next;
    });
    setSelectedRowIds(new Set());
    setPreviewPage((page) =>
      Math.max(
        1,
        Math.min(page, Math.ceil(nextRows.length / DeliveryVehicleImportPreviewPageSize)),
      ),
    );
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

  function updatePreviewCell(rowId: string, fieldKey: string, value: string) {
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
              values: {
                ...row.values,
                [fieldKey]: normalizeDeliveryVehicleImportedValue(
                  fields.find((field) => field.key === fieldKey),
                  value,
                ),
              },
            }
          : row,
      ),
    );
    setImportError(null);
  }

  async function handleFileUpload(file: File | undefined) {
    if (!file || progress) return;
    const sizeError = validateDeliveryVehicleImportFileSize(file);
    if (sizeError) {
      setImportError(sizeError);
      return;
    }
    setIsParsing(true);
    try {
      previewImportText(await readDeliveryVehicleImportFileText(file), true);
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : `Could not read the imported ${config.noun} records.`,
      );
    } finally {
      setIsParsing(false);
    }
  }

  function pasteIntoPreviewCell(rowId: string, fieldKey: string, text: string) {
    const pastedRows = parseDeliveryVehicleImportTabularRows(text).filter((row) =>
      row.some((cell) => cell.trim() !== ""),
    );
    if (pastedRows.length === 0) return;

    const startColumnIndex = fields.findIndex((field) => field.key === fieldKey);
    const isSingleCellPaste = pastedRows.length === 1 && pastedRows[0]?.length === 1;
    if (isSingleCellPaste) {
      updatePreviewCell(rowId, fieldKey, pastedRows[0]?.[0] ?? "");
      return;
    }

    setPristineManualRowIds((current) => {
      if (!current.has(rowId)) return current;
      const next = new Set(current);
      next.delete(rowId);
      return next;
    });
    setImportError(null);
    setPreviewRows((rows) => {
      const startRowIndex = rows.findIndex((row) => row.id === rowId);
      if (startRowIndex < 0) return rows;
      const nextRows = [...rows];
      pastedRows.forEach((pastedRow, pastedRowIndex) => {
        const targetIndex = startRowIndex + pastedRowIndex;
        const targetRow =
          nextRows[targetIndex] ??
          createBlankDeliveryVehicleImportRow(
            getNextDeliveryVehicleImportRowNumber(nextRows),
            fields,
          );
        const values = { ...targetRow.values };
        pastedRow.forEach((cellValue, cellIndex) => {
          const field = fields[startColumnIndex + cellIndex];
          if (field) values[field.key] = normalizeDeliveryVehicleImportedValue(field, cellValue);
        });
        nextRows[targetIndex] = { ...targetRow, values };
      });
      return renumberDeliveryVehicleImportRows(nextRows);
    });
  }

  function pasteIntoPreviewGrid(text: string) {
    if (!text.trim() || progress) return;
    previewImportText(text, true);
  }

  function setImportSelection(mode: ModuleImportMode) {
    setImportMode(mode);
    setIsImportMenuOpen(false);
  }

  async function handleImport(mode = importMode) {
    const rowsToImport =
      mode === "selected-valid"
        ? validSelectedRows
        : mode === "all-valid"
          ? validRows
          : validatedRows;

    if (mode === "selected-valid" && selectedRowIds.size === 0) {
      setImportError("Select at least one valid row to import.");
      return;
    }
    if (mode === "all-rows" && actualInvalidRows.length > 0) {
      setPristineManualRowIds(new Set());
      setImportError(
        `Fix or remove ${actualInvalidRows.length} incorrect ${
          actualInvalidRows.length === 1 ? "row" : "rows"
        } before importing. No rows were imported.`,
      );
      return;
    }
    if (mode === "selected-valid" && rowsToImport.length === 0) {
      setImportError("Selected rows have errors. Fix them or choose valid rows.");
      return;
    }
    if (!canImport) return;

    const importedRowIds = new Set(rowsToImport.map((row) => row.id));
    const recordsToImport = rowsToImport.map((row) =>
      applyDeliveryVehicleImportDefaultValues(row.values, config),
    );

    setProgress({ imported: 0, total: recordsToImport.length });
    for (let index = 0; index < recordsToImport.length; index += DeliveryVehicleImportBatchSize) {
      const batch = recordsToImport.slice(index, index + DeliveryVehicleImportBatchSize);
      onImportRecords(batch);
      setProgress({
        imported: Math.min(index + batch.length, recordsToImport.length),
        total: recordsToImport.length,
      });
      await waitForNextDeliveryVehicleImportBatch();
    }

    setProgress(null);
    toast.success(
      `${recordsToImport.length} ${config.noun} ${
        recordsToImport.length === 1 ? "record" : "records"
      } imported.`,
    );
    const nextRows = renumberDeliveryVehicleImportRows(
      previewRows.filter((row) => !importedRowIds.has(row.id)),
    );
    setPreviewRows(nextRows);
    setPristineManualRowIds((current) => {
      const next = new Set(current);
      importedRowIds.forEach((rowId) => next.delete(rowId));
      return next;
    });
    setSelectedRowIds((current) => {
      const next = new Set(current);
      importedRowIds.forEach((rowId) => next.delete(rowId));
      return next;
    });
    setImportMode("all-rows");
    setPreviewPage((page) =>
      Math.max(
        1,
        Math.min(page, Math.ceil(nextRows.length / DeliveryVehicleImportPreviewPageSize)),
      ),
    );
    setImportError(null);
    if (nextRows.length === 0) {
      resetImportState();
      onClose();
    }
  }

  return {
    addBlankRow,
    canImportAllRows,
    canImportAllValid,
    canImportSelectedValid,
    clearRowSelection,
    columnWidths,
    fields,
    handleFileUpload,
    handleImport,
    importError,
    importMode,
    invalidRows,
    isImportMenuOpen,
    isParsing,
    isSelectionMenuOpen,
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
