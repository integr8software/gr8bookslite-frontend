"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  PartyImportBatchSize,
  PartyImportDefaultColumnWidths,
  PartyImportFieldOrder,
  PartyImportPreviewPageSize,
  PartyImportSelectionColumnWidth,
} from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import {
  applyPartyDefaultAccountingAccounts,
  createBlankPartyImportRow,
  createExistingPartyIdentityMap,
  createPartyImportRecord,
  getNextPartyImportRowNumber,
  normalizeImportedPartyCellValue,
  normalizePartyIdentity,
  parsePartyImportTabularRows,
  parsePartyImportText,
  partyImportRowHasErrors,
  readPartyImportFileText,
  removeDuplicatePartyImportRows,
  renumberPartyImportRows,
  validatePartyImportFileSize,
  validatePartyImportRows,
  waitForNextPartyImportBatch,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import type {
  PartyImportColumnId,
  PartyImportColumnWidths,
  PartyImportMode,
  PartyImportPreviewRow,
  PartyImportProgress,
  PartyInformationRecord,
  PartyManagementImportDialogProps,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import {
  type PartyDefaultAccountingAccountIds,
  usePartyManagementAccountOptions,
} from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagementAccountOptions";

export function usePartyManagementImportDialog({
  existingParties,
  onClose,
  onImportParties,
}: Pick<
  PartyManagementImportDialogProps,
  "existingParties" | "onClose" | "onImportParties"
>) {
  const partyAccountOptions = usePartyManagementAccountOptions();
  const [importError, setImportError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [previewRows, setPreviewRows] = useState<PartyImportPreviewRow[]>([]);
  const [previewPage, setPreviewPage] = useState(1);
  const [progress, setProgress] = useState<PartyImportProgress | null>(null);
  const [pristineManualRowIds, setPristineManualRowIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [importMode, setImportMode] = useState<PartyImportMode>("all-rows");
  const [columnWidths, setColumnWidths] =
    useState<PartyImportColumnWidths>(PartyImportDefaultColumnWidths);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(
    () => new Set(),
  );
  const existingPartyIdentities = useMemo(
    () => createExistingPartyIdentityMap(existingParties),
    [existingParties],
  );
  const validatedRows = useMemo(
    () => validatePartyImportRows(previewRows, existingPartyIdentities),
    [existingPartyIdentities, previewRows],
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
  const invalidRows = displayedRows.filter((row) =>
    partyImportRowHasErrors(row),
  );
  const actualInvalidRows = validatedRows.filter((row) =>
    partyImportRowHasErrors(row),
  );
  const validRows = validatedRows.filter((row) => !partyImportRowHasErrors(row));
  const validSelectedRows = validRows.filter((row) =>
    selectedRowIds.has(row.id),
  );
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
    Math.ceil(displayedRows.length / PartyImportPreviewPageSize),
  );
  const safePreviewPage = Math.min(previewPage, totalPages);
  const visibleRows = displayedRows.slice(
    (safePreviewPage - 1) * PartyImportPreviewPageSize,
    safePreviewPage * PartyImportPreviewPageSize,
  );
  const importTableWidth =
    PartyImportSelectionColumnWidth +
    PartyImportFieldOrder.reduce(
      (total, field) => total + columnWidths[field],
      0,
    );

  function updateColumnWidth(field: PartyImportColumnId, width: number) {
    setColumnWidths((current) => ({ ...current, [field]: width }));
  }

  function resetImportState() {
    if (progress) {
      return;
    }

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
        const parsedRows = parsePartyImportText(
          text,
          getNextPartyImportRowNumber(previewRows),
        );
        const filteredRows = removeDuplicatePartyImportRows(
          parsedRows,
          previewRows,
        );
        const uniqueRows = filteredRows.rows;
        const nextRows = renumberPartyImportRows([...previewRows, ...uniqueRows]);

        skippedCount = filteredRows.skippedCount;
        nextRowCount = nextRows.length;
        setPreviewRows(nextRows);
        setPristineManualRowIds((current) => {
          const next = new Set(current);

          uniqueRows.forEach((row) => next.delete(row.id));

          return next;
        });
        setSelectedRowIds(new Set());
        setPreviewPage(
          Math.max(1, Math.ceil(nextRows.length / PartyImportPreviewPageSize)),
        );
      } else {
        const parsedRows = parsePartyImportText(text);
        const filteredRows = removeDuplicatePartyImportRows(parsedRows, []);
        const uniqueRows = filteredRows.rows;
        const nextRows = renumberPartyImportRows(uniqueRows);

        skippedCount = filteredRows.skippedCount;
        nextRowCount = nextRows.length;
        setPreviewRows(nextRows);
        setPristineManualRowIds(new Set());
        setPreviewPage(1);
        setSelectedRowIds(new Set());
      }

      setImportError(
        skippedCount > 0 && nextRowCount > 0
          ? `${skippedCount} duplicate ${skippedCount === 1 ? "row was" : "rows were"} skipped.`
          : null,
      );
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : "Could not read the imported parties.",
      );
    }
  }

  function addBlankRow() {
    const blankRow = createBlankPartyImportRow(
      getNextPartyImportRowNumber(previewRows),
    );

    setPreviewRows([...previewRows, blankRow]);
    setPristineManualRowIds((current) => new Set(current).add(blankRow.id));
    setSelectedRowIds(new Set());
    setImportError(null);
  }

  function removeSelectedRows() {
    if (selectedRowIds.size === 0 || progress) {
      return;
    }

    const nextRows = renumberPartyImportRows(
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
        Math.min(page, Math.ceil(nextRows.length / PartyImportPreviewPageSize)),
      ),
    );
  }

  function toggleRowSelection(rowId: string, isSelected: boolean) {
    setSelectedRowIds((current) => {
      const nextSelected = new Set(current);

      if (isSelected) {
        nextSelected.add(rowId);
      } else {
        nextSelected.delete(rowId);
      }

      return nextSelected;
    });
  }

  function selectRows(scope: "page" | "all") {
    const rowIds = (scope === "all" ? validatedRows : visibleRows).map(
      (row) => row.id,
    );

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

  function updatePreviewCell(
    rowId: string,
    field: PartyImportColumnId,
    value: string,
  ) {
    setPristineManualRowIds((current) => {
      if (!current.has(rowId)) {
        return current;
      }

      const next = new Set(current);

      next.delete(rowId);
      return next;
    });

    if (field === "partyCodeNo") {
      const normalizedCode = normalizePartyIdentity(value);
      const hasDuplicateCode =
        Boolean(normalizedCode) &&
        previewRows.some(
          (row) =>
            row.id !== rowId &&
            normalizePartyIdentity(row.party.partyCodeNo) === normalizedCode,
        );

      if (hasDuplicateCode) {
        setImportError("Duplicate party codes are not accepted.");
        return;
      }
    }

    setPreviewRows((rows) =>
      rows.map((row) =>
        row.id === rowId
          ? updatePartyImportRowCell(
              row,
              field,
              value,
              partyAccountOptions.defaultAccounts,
            )
          : row,
      ),
    );
    setImportError(null);
  }

  async function handleFileUpload(file: File | undefined) {
    if (!file || progress) {
      return;
    }

    const sizeError = validatePartyImportFileSize(file);

    if (sizeError) {
      setImportError(sizeError);
      return;
    }

    setIsParsing(true);

    try {
      const text = await readPartyImportFileText(file);

      previewImportText(text, true);
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : "Could not read the imported parties.",
      );
    } finally {
      setIsParsing(false);
    }
  }

  function pasteIntoPreviewCell(
    rowId: string,
    field: PartyImportColumnId,
    text: string,
  ) {
    const pastedRows = parsePartyImportTabularRows(text).filter((row) =>
      row.some((cell) => cell.trim() !== ""),
    );

    if (pastedRows.length === 0) {
      return;
    }

    setPristineManualRowIds((current) => {
      if (!current.has(rowId)) {
        return current;
      }

      const next = new Set(current);

      next.delete(rowId);
      return next;
    });

    const startColumnIndex = PartyImportFieldOrder.indexOf(field);
    const isSingleCellPaste =
      pastedRows.length === 1 && pastedRows[0]?.length === 1;

    if (isSingleCellPaste) {
      updatePreviewCell(rowId, field, pastedRows[0]?.[0] ?? "");
      return;
    }

    setImportError(null);
    setPreviewRows((rows) => {
      const startRowIndex = rows.findIndex((row) => row.id === rowId);

      if (startRowIndex < 0) {
        return rows;
      }

      const nextRows = [...rows];
      const seenCodes = new Set(
        rows
          .map((row) => normalizePartyIdentity(row.party.partyCodeNo))
          .filter(Boolean),
      );
      let skippedCount = 0;

      pastedRows.forEach((pastedRow, pastedRowIndex) => {
        const targetIndex = startRowIndex + pastedRowIndex;
        const targetRow =
          nextRows[targetIndex] ??
          createBlankPartyImportRow(getNextPartyImportRowNumber(nextRows));
        let nextRow = targetRow;

        pastedRow.forEach((cellValue, cellIndex) => {
          const targetField =
            PartyImportFieldOrder[startColumnIndex + cellIndex];

          if (!targetField) {
            return;
          }

          nextRow = updatePartyImportRowCell(
            nextRow,
            targetField,
            cellValue,
            partyAccountOptions.defaultAccounts,
          );
        });

        const normalizedCode = normalizePartyIdentity(nextRow.party.partyCodeNo);
        const originalCode = normalizePartyIdentity(targetRow.party.partyCodeNo);
        const isExistingTargetRow = targetIndex < rows.length;

        if (
          normalizedCode &&
          seenCodes.has(normalizedCode) &&
          (!isExistingTargetRow || normalizedCode !== originalCode)
        ) {
          skippedCount += 1;
          return;
        }

        if (originalCode) {
          seenCodes.delete(originalCode);
        }
        if (normalizedCode) {
          seenCodes.add(normalizedCode);
        }

        nextRows[targetIndex] = nextRow;
      });

      if (skippedCount > 0) {
        setImportError(
          `${skippedCount} duplicate ${skippedCount === 1 ? "row was" : "rows were"} skipped.`,
        );
      }

      return nextRows;
    });
  }

  function pasteIntoPreviewGrid(text: string) {
    if (!text.trim() || progress) {
      return;
    }

    previewImportText(text, true);
  }

  function setImportSelection(mode: PartyImportMode) {
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
        `Fix or remove ${actualInvalidRows.length} incorrect ${actualInvalidRows.length === 1 ? "row" : "rows"} before importing. No rows were imported.`,
      );
      return;
    }

    if (mode === "selected-valid" && rowsToImport.length === 0) {
      setImportError("Selected rows have errors. Fix them or choose valid rows.");
      return;
    }

    if (!canImport) {
      return;
    }

    const importedRowIds = new Set(rowsToImport.map((row) => row.id));
    const partiesToImport = rowsToImport.map((row, index) =>
      createPartyImportRecord(row.party, index),
    );

    setProgress({ imported: 0, total: partiesToImport.length });

    for (
      let index = 0;
      index < partiesToImport.length;
      index += PartyImportBatchSize
    ) {
      const batch = partiesToImport.slice(index, index + PartyImportBatchSize);

      try {
        await onImportParties(batch);
      } catch {
        setProgress(null);
        return;
      }
      setProgress({
        imported: Math.min(index + batch.length, partiesToImport.length),
        total: partiesToImport.length,
      });
      await waitForNextPartyImportBatch();
    }

    setProgress(null);
    toast.success(
      `${partiesToImport.length} party ${partiesToImport.length === 1 ? "record" : "records"} imported.`,
    );
    const nextRows = renumberPartyImportRows(
      previewRows.filter((row) => !importedRowIds.has(row.id)),
    );

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
    setPreviewPage((page) =>
      Math.max(
        1,
        Math.min(page, Math.ceil(nextRows.length / PartyImportPreviewPageSize)),
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

function updatePartyImportRowCell(
  row: PartyImportPreviewRow,
  field: PartyImportColumnId,
  value: string,
  defaultAccounts: PartyDefaultAccountingAccountIds,
): PartyImportPreviewRow {
  const normalizedValue = normalizeImportedPartyCellValue(field, value);
  const party = { ...row.party };

  if (field === "partyTypes") {
    party.partyTypes = normalizedValue as PartyInformationRecord["partyTypes"];
    return {
      ...row,
      party: syncPartyImportRow(party, defaultAccounts),
    };
  }

  if (
    field === "addressLine1" ||
    field === "addressLine2" ||
    field === "barangay" ||
    field === "cityMunicipality" ||
    field === "province"
  ) {
    const address = {
      ...party.address,
      [field]: normalizedValue as string,
    };

    return {
      ...row,
      party: {
        ...party,
        address,
        addresses: [address],
      },
    };
  }

  return {
    ...row,
    party: syncPartyImportRow(
      {
        ...party,
        [field]: normalizedValue,
      },
      defaultAccounts,
    ),
  };
}

function syncPartyImportRow(
  party: Omit<PartyInformationRecord, "id" | "createdAt" | "updatedAt">,
  defaultAccounts: PartyDefaultAccountingAccountIds,
) {
  const partyTypes =
    party.classification === "Non-Individual"
      ? party.partyTypes.filter((partyType) => partyType !== "Employee")
      : party.partyTypes;
  const accountingAccounts = applyPartyDefaultAccountingAccounts(
    party,
    partyTypes,
    defaultAccounts,
  );
  const address = {
    ...party.address,
    isBilling: partyTypes.includes("Customer") || partyTypes.includes("Vendor"),
    isDelivery: partyTypes.includes("Customer"),
    isHome: partyTypes.includes("Employee"),
  };

  return {
    ...accountingAccounts,
    partyTypes,
    status: "Active" as const,
    address,
    addresses: [address],
  };
}
