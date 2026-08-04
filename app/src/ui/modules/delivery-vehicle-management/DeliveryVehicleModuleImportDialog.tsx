"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AlertCircle } from "lucide-react";
import {
  AppMaxFileUploadSizeBytes,
  AppMaxFileUploadSizeLabel,
} from "@/app/src/constants/shared/app/AppConstants";
import {
  getModuleImportDataColumnWidth,
  ModuleImportFixedColumnsWidth,
  ModuleImportRowNumberColumnWidth,
  ModuleImportSelectionColumnWidth,
} from "@/app/src/constants/shared/module/ModuleImportConstants";
import type {
  DeliveryVehicleField,
  DeliveryVehicleModuleConfig,
  DeliveryVehicleModuleRecord,
} from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import { ModuleImportDialog } from "@/app/src/ui/shared/module/ModuleImportDialog";
import {
  ModuleImportEditableCell,
  ModuleImportEditableSelect,
  ModuleImportEmptyDropzone,
  ModuleImportFooter,
  ModuleImportHeaderActions,
  ModuleImportPaginationBar,
  ModuleImportProgressPanel,
  ModuleImportRowNumberCell,
  ModuleImportRowNumberHeader,
  ModuleImportSelectionHeader,
} from "@/app/src/ui/shared/module/ModuleImportControls";
import { ModuleImportResizableColumnHeader } from "@/app/src/ui/shared/module/ModuleImportResizableColumnHeader";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { formatFileSize } from "@/app/src/utils/file.util";
import {
  isModuleImportOptionValue,
  reorderModuleImportRows,
} from "@/app/src/utils/module-import.util";

type DeliveryVehicleModuleImportDialogProps = {
  config: DeliveryVehicleModuleConfig;
  existingRecords: DeliveryVehicleModuleRecord[];
  isOpen: boolean;
  onClose: () => void;
  onImportRecords: (rows: Array<Record<string, string>>) => void;
};

type ImportMode = "all-rows" | "all-valid" | "selected-valid";
type ImportProgress = { imported: number; total: number };
type ImportPreviewRow = {
  cellErrors: Record<string, string[] | undefined>;
  cellWarnings: Record<string, string[] | undefined>;
  id: string;
  rowErrors: string[];
  rowNumber: number;
  values: Record<string, string>;
};

const PreviewPageSize = 20;
const ImportBatchSize = 25;
const AcceptedFileExtensions = ".xlsx,.csv,.tsv,.txt";
const AcceptedFileLabel = ".xlsx, .csv, .tsv, .txt";

export function DeliveryVehicleModuleImportDialog({
  config,
  existingRecords,
  isOpen,
  onClose,
  onImportRecords,
}: DeliveryVehicleModuleImportDialogProps) {
  const fields = useMemo(() => getImportFields(config), [config]);
  const existingNames = useMemo(() => createExistingNameMap(existingRecords), [existingRecords]);
  const [importError, setImportError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [previewPage, setPreviewPage] = useState(1);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [pristineManualRowIds, setPristineManualRowIds] = useState<Set<string>>(() => new Set());
  const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [importMode, setImportMode] = useState<ImportMode>("all-rows");
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(() => new Set());
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(fields.map((field) => [field.key, getDefaultColumnWidth(field)])),
  );
  const validatedRows = useMemo(
    () => validateImportRows(previewRows, fields, existingNames),
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
  const invalidRows = displayedRows.filter((row) => rowHasErrors(row));
  const actualInvalidRows = validatedRows.filter((row) => rowHasErrors(row));
  const validRows = validatedRows.filter((row) => !rowHasErrors(row));
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
  const totalPages = Math.max(1, Math.ceil(displayedRows.length / PreviewPageSize));
  const safePreviewPage = Math.min(previewPage, totalPages);
  const visibleRows = displayedRows.slice(
    (safePreviewPage - 1) * PreviewPageSize,
    safePreviewPage * PreviewPageSize,
  );
  const importTableWidth =
    ModuleImportFixedColumnsWidth +
    fields.reduce(
      (total, field) => total + (columnWidths[field.key] ?? getDefaultColumnWidth(field)),
      0,
    );

  function updateColumnWidth(fieldKey: string, width: number) {
    setColumnWidths((current) => ({ ...current, [fieldKey]: width }));
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
      const parsedRows = parseImportText(text, fields, getNextRowNumber(append ? previewRows : []));
      const nextRows = renumberImportRows(append ? [...previewRows, ...parsedRows] : parsedRows);

      setPreviewRows(nextRows);
      setPristineManualRowIds(new Set());
      setSelectedRowIds(new Set());
      setPreviewPage(append ? Math.max(1, Math.ceil(nextRows.length / PreviewPageSize)) : 1);
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
    const blankRow = createBlankImportRow(getNextRowNumber(previewRows), fields);

    setPreviewRows([...previewRows, blankRow]);
    setPristineManualRowIds((current) => new Set(current).add(blankRow.id));
    setSelectedRowIds(new Set());
    setImportError(null);
  }

  function removeSelectedRows() {
    if (selectedRowIds.size === 0 || progress) {
      return;
    }

    const nextRows = renumberImportRows(previewRows.filter((row) => !selectedRowIds.has(row.id)));

    setImportError(null);
    setPreviewRows(nextRows);
    setPristineManualRowIds((current) => {
      const next = new Set(current);
      selectedRowIds.forEach((rowId) => next.delete(rowId));
      return next;
    });
    setSelectedRowIds(new Set());
    setPreviewPage((page) =>
      Math.max(1, Math.min(page, Math.ceil(nextRows.length / PreviewPageSize))),
    );
  }

  function movePreviewRow(sourceRowId: string, targetRowId: string, position: "before" | "after") {
    setPreviewRows((rows) =>
      renumberImportRows(reorderModuleImportRows(rows, sourceRowId, targetRowId, position)),
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
      if (!current.has(rowId)) {
        return current;
      }

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
                [fieldKey]: normalizeImportedValue(
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
    if (!file || progress) {
      return;
    }

    const sizeError = validateImportFileSize(file);

    if (sizeError) {
      setImportError(sizeError);
      return;
    }

    setIsParsing(true);

    try {
      previewImportText(await readImportFileText(file), true);
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
    const pastedRows = parseTabularRows(text).filter((row) =>
      row.some((cell) => cell.trim() !== ""),
    );

    if (pastedRows.length === 0) {
      return;
    }

    const startColumnIndex = fields.findIndex((field) => field.key === fieldKey);
    const isSingleCellPaste = pastedRows.length === 1 && pastedRows[0]?.length === 1;

    if (isSingleCellPaste) {
      updatePreviewCell(rowId, fieldKey, pastedRows[0]?.[0] ?? "");
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
    setImportError(null);
    setPreviewRows((rows) => {
      const startRowIndex = rows.findIndex((row) => row.id === rowId);

      if (startRowIndex < 0) {
        return rows;
      }

      const nextRows = [...rows];

      pastedRows.forEach((pastedRow, pastedRowIndex) => {
        const targetIndex = startRowIndex + pastedRowIndex;
        const targetRow =
          nextRows[targetIndex] ?? createBlankImportRow(getNextRowNumber(nextRows), fields);
        const values = { ...targetRow.values };

        pastedRow.forEach((cellValue, cellIndex) => {
          const field = fields[startColumnIndex + cellIndex];

          if (field) {
            values[field.key] = normalizeImportedValue(field, cellValue);
          }
        });
        nextRows[targetIndex] = { ...targetRow, values };
      });

      return renumberImportRows(nextRows);
    });
  }

  function pasteIntoPreviewGrid(text: string) {
    if (!text.trim() || progress) {
      return;
    }

    previewImportText(text, true);
  }

  function setImportSelection(mode: ImportMode) {
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

    if (!canImport) {
      return;
    }

    const importedRowIds = new Set(rowsToImport.map((row) => row.id));
    const recordsToImport = rowsToImport.map((row) => applyDefaultValues(row.values, config));

    setProgress({ imported: 0, total: recordsToImport.length });

    for (let index = 0; index < recordsToImport.length; index += ImportBatchSize) {
      const batch = recordsToImport.slice(index, index + ImportBatchSize);

      onImportRecords(batch);
      setProgress({
        imported: Math.min(index + batch.length, recordsToImport.length),
        total: recordsToImport.length,
      });
      await waitForNextImportBatch();
    }

    setProgress(null);
    toast.success(
      `${recordsToImport.length} ${config.noun} ${
        recordsToImport.length === 1 ? "record" : "records"
      } imported.`,
    );
    const nextRows = renumberImportRows(previewRows.filter((row) => !importedRowIds.has(row.id)));

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
      Math.max(1, Math.min(page, Math.ceil(nextRows.length / PreviewPageSize))),
    );
    setImportError(null);

    if (nextRows.length === 0) {
      resetImportState();
      onClose();
    }
  }

  return (
    <ModuleImportDialog
      isOpen={isOpen}
      isBusy={Boolean(progress)}
      title={`Import ${config.title}`}
      titleId={`delivery-vehicle-${config.key}-import-title`}
      description="Upload, validate, edit, and import data in queued batches."
      onClose={onClose}
      actions={
        <ModuleImportHeaderActions
          accept={AcceptedFileExtensions}
          disabled={Boolean(progress)}
          isParsing={isParsing}
          onDownloadTemplate={() => void downloadImportTemplate(config, fields)}
          onFileSelect={(file) => void handleFileUpload(file)}
        />
      }
      progress={progress ? <ModuleImportProgressPanel progress={progress} /> : null}
      footer={
        <ModuleImportFooter
          canImportAllRows={canImportAllRows}
          canImportAllValid={canImportAllValid}
          canImportSelectedValid={canImportSelectedValid}
          importLabel={`Import ${config.title}`}
          importMode={importMode}
          isBusy={Boolean(progress)}
          isImportMenuOpen={isImportMenuOpen}
          selectedValidRowsCount={validSelectedRows.length}
          totalRowsCount={validatedRows.length}
          validRowsCount={validRows.length}
          onCancel={onClose}
          onImport={(mode) => void handleImport(mode)}
          onReset={resetImportState}
          onSetImportMode={setImportSelection}
          onToggleImportMenu={() => setIsImportMenuOpen((current) => !current)}
        />
      }
    >
      <div className="flex h-full min-h-0 flex-col gap-3">
        {importError ? (
          <div className="flex gap-2 rounded-md border border-coralpink/25 bg-coralpink/8 px-3 py-2 text-sm font-medium text-coralpink">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{importError}</span>
          </div>
        ) : null}

        <div
          tabIndex={0}
          onDragOver={(event) => {
            if (!progress) event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();
            if (!progress) void handleFileUpload(event.dataTransfer.files[0]);
          }}
          onPaste={(event) => {
            if (!isGridPasteTarget(event.target)) {
              return;
            }

            const text = event.clipboardData.getData("text");

            if (text.trim()) {
              event.preventDefault();
              pasteIntoPreviewGrid(text);
            }
          }}
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-purple-200 shadow-[0_0_0_2px_rgba(168,85,247,0.08)] outline-none focus:ring-2 focus:ring-purple-500/15"
          aria-label={`${config.title} import preview grid. Paste copied Excel rows here.`}
        >
          <div className="min-h-36 flex-1 overflow-auto">
            <table
              className="module-import-preview-table table-fixed text-left text-sm text-darknavy"
              style={{ width: `max(100%, ${importTableWidth}px)` }}
            >
              <colgroup>
                <col style={{ width: ModuleImportSelectionColumnWidth }} />
                <col style={{ width: ModuleImportRowNumberColumnWidth }} />
                {fields.map((field) => (
                  <col
                    key={field.key}
                    style={{
                      width: getModuleImportDataColumnWidth(
                        columnWidths[field.key] ?? getDefaultColumnWidth(field),
                        Object.values(columnWidths).reduce((total, width) => total + width, 0),
                      ),
                    }}
                  />
                ))}
              </colgroup>
              <thead className="text-xs uppercase text-darknavy/55">
                <tr>
                  <ModuleImportSelectionHeader
                    checked={selectedRowIds.size > 0}
                    disabled={visibleRows.length === 0 || Boolean(progress)}
                    isOpen={isSelectionMenuOpen}
                    onClearSelection={clearRowSelection}
                    onSelectAll={() => selectRows("all")}
                    onSelectPage={() => selectRows("page")}
                    onToggleOpen={() => setIsSelectionMenuOpen((current) => !current)}
                  />
                  <ModuleImportRowNumberHeader />
                  {fields.map((field, index) => (
                    <ModuleImportResizableColumnHeader
                      key={field.key}
                      className={index === 0 ? "z-40 px-3" : "px-3"}
                      left={index === 0 ? ModuleImportFixedColumnsWidth : undefined}
                      width={columnWidths[field.key] ?? getDefaultColumnWidth(field)}
                      onResize={(width) => updateColumnWidth(field.key, width)}
                    >
                      {field.label}
                    </ModuleImportResizableColumnHeader>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-darknavy/8 bg-white">
                {visibleRows.length > 0 ? (
                  visibleRows.map((row) => (
                    <DeliveryVehicleImportPreviewTableRow
                      key={row.id}
                      fields={fields}
                      isSelected={selectedRowIds.has(row.id)}
                      row={row}
                      onMoveRow={movePreviewRow}
                      onPasteCell={pasteIntoPreviewCell}
                      onToggleSelected={toggleRowSelection}
                      onUpdateCell={updatePreviewCell}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={fields.length + 2}
                      className="module-import-empty-cell px-3 py-10 text-center text-sm font-medium text-darknavy/45"
                    >
                      <ModuleImportEmptyDropzone
                        accept={AcceptedFileExtensions}
                        acceptedFileLabel={AcceptedFileLabel}
                        disabled={Boolean(progress)}
                        isParsing={isParsing}
                        maxFileSizeLabel={AppMaxFileUploadSizeLabel}
                        onFileSelect={(file) => void handleFileUpload(file)}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <ModuleImportPaginationBar
            currentPage={safePreviewPage}
            invalidCount={invalidRows.length}
            isBusy={Boolean(progress)}
            selectedCount={progress ? 0 : selectedRowIds.size}
            totalRowsCount={validatedRows.length}
            totalPages={totalPages}
            onAddRow={addBlankRow}
            onGoToPage={setPreviewPage}
            onNextPage={() => setPreviewPage((page) => Math.min(totalPages, page + 1))}
            onPreviousPage={() => setPreviewPage((page) => Math.max(1, page - 1))}
            onRemoveSelected={removeSelectedRows}
          />
        </div>
      </div>
    </ModuleImportDialog>
  );
}

function DeliveryVehicleImportPreviewTableRow({
  fields,
  isSelected,
  row,
  onMoveRow,
  onPasteCell,
  onToggleSelected,
  onUpdateCell,
}: {
  fields: readonly DeliveryVehicleField[];
  isSelected: boolean;
  row: ImportPreviewRow;
  onMoveRow: (sourceRowId: string, targetRowId: string, position: "before" | "after") => void;
  onPasteCell: (rowId: string, fieldKey: string, text: string) => void;
  onToggleSelected: (rowId: string, isSelected: boolean) => void;
  onUpdateCell: (rowId: string, fieldKey: string, value: string) => void;
}) {
  const stickyCellBackground = isSelected
    ? "bg-skyblue/10"
    : rowHasErrors(row)
      ? "bg-coralpink/[0.025]"
      : "bg-white";

  return (
    <>
      <tr
        className={
          isSelected ? "bg-skyblue/10" : rowHasErrors(row) ? "bg-coralpink/[0.025]" : undefined
        }
      >
        <td
          className={joinClasses(
            "module-import-selection-column sticky left-0 z-20 text-center",
            stickyCellBackground,
          )}
        >
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={isSelected}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => onToggleSelected(row.id, event.target.checked)}
              aria-label={`Select row ${row.rowNumber}`}
              className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
            />
          </div>
        </td>
        <ModuleImportRowNumberCell rowId={row.id} rowNumber={row.rowNumber} onMoveRow={onMoveRow} />
        {fields.map((field, index) => (
          <td
            key={field.key}
            className={joinClasses(
              "px-3 py-2 align-middle",
              index === 0 ? "module-import-first-data-column sticky z-10" : "",
              index === 0 ? stickyCellBackground : "",
            )}
          >
            {field.type === "select" && field.options ? (
              <ModuleImportEditableSelect
                value={row.values[field.key] ?? ""}
                errors={row.cellErrors[field.key]}
                warnings={row.cellWarnings[field.key]}
                options={field.options}
                onChange={(value) => onUpdateCell(row.id, field.key, value)}
                onPaste={(text) => onPasteCell(row.id, field.key, text)}
              />
            ) : (
              <ModuleImportEditableCell
                type={field.type === "number" ? "number" : "text"}
                value={row.values[field.key] ?? ""}
                errors={row.cellErrors[field.key]}
                warnings={row.cellWarnings[field.key]}
                onChange={(value) => onUpdateCell(row.id, field.key, value)}
                onPaste={(text) => onPasteCell(row.id, field.key, text)}
              />
            )}
          </td>
        ))}
      </tr>
      {row.rowErrors.length > 0 ? (
        <tr className={isSelected ? "bg-skyblue/10" : "bg-coralpink/[0.025]"}>
          <td />
          <td />
          <td colSpan={fields.length} className="px-3 pb-3 text-xs font-semibold text-coralpink">
            {row.rowErrors.join(" ")}
          </td>
        </tr>
      ) : null}
    </>
  );
}

function getImportFields(config: DeliveryVehicleModuleConfig) {
  return config.fields.filter(
    (field) => config.key !== "vehicle-types" || field.key !== "capacityUnit",
  );
}

function getDefaultColumnWidth(field: DeliveryVehicleField) {
  if (field.type === "textarea") return 260;
  if (field.type === "select") return 190;
  if (field.type === "number") return 150;
  return field.key === "typeName" ? 224 : 180;
}

function createBlankImportRow(
  rowNumber: number,
  fields: readonly DeliveryVehicleField[],
): ImportPreviewRow {
  return {
    cellErrors: {},
    cellWarnings: {},
    id: `delivery-vehicle-import-preview-${rowNumber}-${Date.now()}`,
    rowErrors: [],
    rowNumber,
    values: Object.fromEntries(fields.map((field) => [field.key, field.defaultValue ?? ""])),
  };
}

function renumberImportRows(rows: ImportPreviewRow[]) {
  return rows.map((row, index) => ({ ...row, rowNumber: index + 1 }));
}

function getNextRowNumber(rows: ImportPreviewRow[]) {
  return Math.max(0, ...rows.map((row) => row.rowNumber)) + 1;
}

function parseImportText(
  text: string,
  fields: readonly DeliveryVehicleField[],
  startRowNumber = 1,
): ImportPreviewRow[] {
  const rows = parseTabularRows(text).filter((row) => row.some((cell) => cell.trim() !== ""));

  if (rows.length === 0) {
    return [];
  }

  const headerIndexes = getHeaderIndexes(rows[0], fields);
  const indexes =
    headerIndexes ?? Object.fromEntries(fields.map((field, index) => [field.key, index]));
  const dataRows = headerIndexes ? rows.slice(1) : rows;
  const importBatchId = Date.now();

  return dataRows
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row, index) => {
      const rowNumber = startRowNumber + index;

      return {
        cellErrors: {},
        cellWarnings: {},
        id: `delivery-vehicle-import-preview-${rowNumber}-${importBatchId}-${index}`,
        rowErrors: [],
        rowNumber,
        values: Object.fromEntries(
          fields.map((field) => [
            field.key,
            normalizeImportedValue(field, getImportedValue(row, indexes[field.key])),
          ]),
        ),
      };
    });
}

function validateImportRows(
  rows: ImportPreviewRow[],
  fields: readonly DeliveryVehicleField[],
  existingNames: Map<string, string>,
) {
  const typeNameCounts = new Map<string, number>();

  rows.forEach((row) => {
    const normalizedName = normalizeImportText(row.values.typeName ?? "");

    if (normalizedName) {
      typeNameCounts.set(normalizedName, (typeNameCounts.get(normalizedName) ?? 0) + 1);
    }
  });

  return rows.map((row) => {
    const cellErrors: Record<string, string[] | undefined> = {};
    const cellWarnings: Record<string, string[] | undefined> = {};
    const rowErrors: string[] = [];

    fields.forEach((field) => {
      const value = row.values[field.key] ?? "";

      if (field.required && !value.trim()) {
        cellErrors[field.key] = [`${field.label} is required.`];
      }

      if (
        field.type === "select" &&
        value.trim() &&
        field.options &&
        !isModuleImportOptionValue(value, field.options)
      ) {
        cellErrors[field.key] = [
          ...(cellErrors[field.key] ?? []),
          `Choose a valid ${field.label.toLowerCase()} from the list.`,
        ];
      }

      if (field.type === "number" && value.trim()) {
        const numericValue = Number(value.replace(/,/g, ""));

        if (!Number.isFinite(numericValue) || numericValue < 0) {
          cellErrors[field.key] = [
            ...(cellErrors[field.key] ?? []),
            `${field.label} must be 0 or greater.`,
          ];
        }

        if (
          field.key === "palletCapacity" &&
          Number.isFinite(numericValue) &&
          !Number.isInteger(numericValue)
        ) {
          cellWarnings[field.key] = ["Pallet capacity is usually a whole number."];
        }
      }
    });

    const normalizedTypeName = normalizeImportText(row.values.typeName ?? "");
    const existingName = existingNames.get(normalizedTypeName);

    if (existingName) {
      cellErrors.typeName = [
        ...(cellErrors.typeName ?? []),
        `Vehicle type already exists: ${existingName}.`,
      ];
    }

    if (normalizedTypeName && (typeNameCounts.get(normalizedTypeName) ?? 0) > 1) {
      cellErrors.typeName = [...(cellErrors.typeName ?? []), "Duplicate vehicle type in import."];
    }

    return { ...row, cellErrors, cellWarnings, rowErrors };
  });
}

function createExistingNameMap(records: DeliveryVehicleModuleRecord[]) {
  return new Map(
    records
      .map((record) => record.fields.typeName ?? record.name)
      .filter(Boolean)
      .map((name) => [normalizeImportText(name), name]),
  );
}

function rowHasErrors(row: ImportPreviewRow) {
  return (
    row.rowErrors.length > 0 ||
    Object.values(row.cellErrors).some((errors) => Boolean(errors?.length))
  );
}

function parseTabularRows(text: string) {
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  return normalizedText.includes("\t")
    ? normalizedText.split("\n").map((line) => line.split("\t").map((cell) => cell.trim()))
    : parseCsvRows(normalizedText);
}

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let isQuoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && isQuoted && nextChar === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      isQuoted = !isQuoted;
      continue;
    }

    if (char === "," && !isQuoted) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if (char === "\n" && !isQuoted) {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  rows.push(row);

  return rows;
}

function getHeaderIndexes(row: string[], fields: readonly DeliveryVehicleField[]) {
  const indexes: Record<string, number> = {};

  row.forEach((cell, index) => {
    const normalized = normalizeImportHeader(cell);
    const field = fields.find(
      (item) =>
        normalizeImportHeader(item.label) === normalized ||
        normalizeImportHeader(item.key) === normalized,
    );

    if (field) {
      indexes[field.key] = index;
    }
  });

  return Object.keys(indexes).length >= 2 ? indexes : null;
}

function normalizeImportHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeImportText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function getImportedValue(row: string[], index?: number) {
  return typeof index === "number" ? String(row[index] ?? "").trim() : "";
}

function normalizeImportedValue(field: DeliveryVehicleField | undefined, value: string) {
  const trimmedValue = value.trim();

  if (field?.type === "select" && field.options) {
    return (
      field.options.find((option) => option.toLowerCase() === trimmedValue.toLowerCase()) ??
      trimmedValue
    );
  }

  return trimmedValue;
}

function applyDefaultValues(values: Record<string, string>, config: DeliveryVehicleModuleConfig) {
  return Object.fromEntries(
    config.fields.map((field) => [field.key, values[field.key] ?? field.defaultValue ?? ""]),
  );
}

async function downloadImportTemplate(
  config: DeliveryVehicleModuleConfig,
  fields: readonly DeliveryVehicleField[],
) {
  const headers = fields.map((field) => field.label);

  try {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.default.Workbook();
    const worksheet = workbook.addWorksheet(config.title.slice(0, 31));

    worksheet.addRow(headers);
    fields.forEach((field, index) => {
      worksheet.getColumn(index + 1).width = Math.max(14, Math.min(32, field.label.length + 8));

      if (field.type === "select" && field.options?.length) {
        for (let rowNumber = 2; rowNumber <= 101; rowNumber += 1) {
          worksheet.getCell(rowNumber, index + 1).dataValidation = {
            allowBlank: !field.required,
            formulae: [`"${field.options.join(",")}"`],
            showErrorMessage: true,
            type: "list",
          };
        }
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();

    downloadBlob(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${config.key}-import-template.xlsx`,
    );
  } catch {
    downloadBlob(
      new Blob([createTemplateCsv(headers)], { type: "text/csv;charset=utf-8" }),
      `${config.key}-import-template.csv`,
    );
  }
}

function createTemplateCsv(headers: string[]) {
  return [headers]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

async function readImportFileText(file: File) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".xlsx")) {
    return formatRowsAsText(await readXlsxRows(await file.arrayBuffer()));
  }

  if (fileName.endsWith(".csv") || fileName.endsWith(".tsv") || fileName.endsWith(".txt")) {
    return (await file.text()).trim();
  }

  throw new Error("Please upload an .xlsx, .csv, .tsv, or .txt file.");
}

async function readXlsxRows(buffer: ArrayBuffer) {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.default.Workbook();

  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("No worksheet was found in the Excel file.");
  }

  const rows: string[][] = [];

  worksheet.eachRow({ includeEmpty: false }, (row) => {
    const cells: string[] = [];

    row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
      cells[columnNumber - 1] = formatExcelCellValue(cell.value, cell.text);
    });
    rows.push(cells);
  });

  return rows;
}

function formatRowsAsText(rows: string[][]) {
  return rows
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
    .map((row) =>
      row
        .map((cell) =>
          String(cell ?? "")
            .replace(/\r?\n/g, " ")
            .trim(),
        )
        .join("\t"),
    )
    .join("\n");
}

function formatExcelCellValue(value: unknown, displayText?: string) {
  const normalizedDisplayText = String(displayText ?? "")
    .replace(/\r?\n/g, " ")
    .trim();

  if (normalizedDisplayText) {
    return normalizedDisplayText;
  }

  if (value == null) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;

    if (Array.isArray(record.richText)) {
      return record.richText
        .map((part) =>
          typeof part === "object" && part !== null
            ? String((part as Record<string, unknown>).text ?? "")
            : "",
        )
        .join("")
        .replace(/\r?\n/g, " ")
        .trim();
    }

    if ("text" in record) {
      return String(record.text ?? "")
        .replace(/\r?\n/g, " ")
        .trim();
    }

    if ("result" in record) {
      return formatExcelCellValue(record.result);
    }
  }

  return String(value).replace(/\r?\n/g, " ").trim();
}

function validateImportFileSize(file: File) {
  if (file.size < 1) {
    return `Upload a file larger than ${formatFileSize(1)}.`;
  }

  if (file.size > AppMaxFileUploadSizeBytes) {
    return `Upload a file up to ${formatFileSize(AppMaxFileUploadSizeBytes)}.`;
  }

  return null;
}

function isGridPasteTarget(target: EventTarget | null) {
  return !(
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

function waitForNextImportBatch() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 75);
  });
}
