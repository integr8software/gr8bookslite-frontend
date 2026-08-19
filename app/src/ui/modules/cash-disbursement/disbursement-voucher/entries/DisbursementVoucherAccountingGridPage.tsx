"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { LayoutGrid, Save } from "lucide-react";
import { AppMaxFileUploadSizeBytes, AppMaxFileUploadSizeLabel } from "@/app/src/constants/shared/app/AppConstants";
import {
  DefaultDisbursementAccountingGridColumnLabels,
  DefaultDisbursementAccountingGridColumnOrder,
  DefaultDisbursementAccountingGridColumnWidths,
  DisbursementAccountingAmountColumnIds,
  DisbursementAccountingCreditColumnId,
  DisbursementAccountingDebitColumnId,
  DisbursementAccountingExportColumnWidths,
  DisbursementAccountingGridTaxRateOptions,
  ProtectedDisbursementAccountingGridColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryConstants";
import {
  DisbursementVoucherInitialEntryDraft,
  formatCurrency,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { useDisbursementVoucherStore } from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher";
import { validateDisbursementVoucherEntries } from "@/app/src/validations/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherValidation";
import type {
  DisbursementAccountingGridColumnId as GridColumnId,
  EditableDisbursementAccountingGridRow as EditableGridRow,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryTypes";
import type {
  DisbursementAttachment as VoucherAttachment,
  DisbursementVoucherAccountingGridSession,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import {
  readAccountingGridSession,
  writeAccountingGridSession,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingGridSessionData";
import { AccountingImportDialog } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/entries/DisbursementVoucherAccountingImportDialogs";
import {
  GridEntryInput,
  GridPreviewDialog,
  SummaryCard,
  VoucherAccountingGridHeader,
  gridCellControlClassName,
} from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/entries/DisbursementVoucherAccountingGridPreview";
import {
  createAccountingPdfDefinition,
  createAccountingWorkbook,
  getAccountingExportTheme,
  readAccountingImportFilePreviewText,
} from "@/app/src/services/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingExportService";
import {
  buildLineEntries,
  calculateGridColumnFitWidth,
  clearImportPreviewText,
  createBlankEditableRow,
  createGridRowId,
  createImportSourceAttachment,
  createInitialRows,
  createVoucherActionReturnLink,
  downloadBytesFile,
  getExportCellValue,
  hasRowData,
  isGridColumnId,
  normalizeAmount,
  parseTabularText,
  shouldClearRow,
  withAccountingImportAttachment,
} from "@/app/src/services/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingImportService";
import {
  ModuleDataEntry,
  type ModuleDataEntryCellContext,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ModuleDataEntryRemarksCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryRemarksCell";
import { MoneyNumberField, formatMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

pdfMake.addVirtualFileSystem(pdfFonts);

export function DisbursementVoucherAccountingGridPage() {
  const router = useRouter();
  const transactions = useDisbursementVoucherStore((state) => state.transactions);
  const [session, setSession] = useState<DisbursementVoucherAccountingGridSession | null>(null);
  const [rows, setRows] = useState<EditableGridRow[]>([]);
  const [columnOrder, setColumnOrder] = useState<GridColumnId[]>(DefaultDisbursementAccountingGridColumnOrder);
  const [visibleColumnIds, setVisibleColumnIds] = useState<GridColumnId[]>(DefaultDisbursementAccountingGridColumnOrder);
  const [columnLabels, setColumnLabels] = useState(DefaultDisbursementAccountingGridColumnLabels);
  const [columnWidths, setColumnWidths] = useState(DefaultDisbursementAccountingGridColumnWidths);
  const [autoWidthColumnIds, setAutoWidthColumnIds] = useState<GridColumnId[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pendingImportAttachment, setPendingImportAttachment] = useState<VoucherAttachment | null>(null);
  const [importedImportAttachment, setImportedImportAttachment] = useState<VoucherAttachment | null>(null);

  useEffect(() => {
    const nextSession = readAccountingGridSession();
    const restoreTimer = window.setTimeout(() => {
      if (!nextSession) {
        setIsLoaded(true);
        return;
      }

      setSession(nextSession);
      setRows(createInitialRows(nextSession.values.lineEntries));
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, []);

  const totals = useMemo(() => {
    const totalDebit = rows.reduce((sum, row) => sum + normalizeAmount(row.debit), 0);
    const totalCredit = rows.reduce((sum, row) => sum + normalizeAmount(row.credit), 0);

    return {
      isBalanced: totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.001,
      totalCredit,
      totalDebit,
      variance: Math.abs(totalDebit - totalCredit),
    };
  }, [rows]);
  const previewEntries = useMemo(() => buildLineEntries(rows), [rows]);
  const selectedTransaction = useMemo(
    () => (session ? transactions.find((transaction) => transaction.id === session.values.transactionId) : undefined),
    [session, transactions],
  );
  const visibleColumnOrder = columnOrder.filter((columnId) => visibleColumnIds.includes(columnId));
  const resolvedColumnWidths = useMemo<Record<GridColumnId, number>>(() => {
    const nextWidths = { ...columnWidths };

    autoWidthColumnIds.forEach((columnId) => {
      nextWidths[columnId] = calculateGridColumnFitWidth({
        columnId,
        columnLabels,
        rows,
      });
    });

    return nextWidths;
  }, [autoWidthColumnIds, columnLabels, columnWidths, rows]);
  const columns: ModuleDataEntryColumn<EditableGridRow>[] = visibleColumnOrder.map((columnId) => ({
    header: columnLabels[columnId],
    id: columnId,
    isRemovable: !ProtectedDisbursementAccountingGridColumnIds.has(columnId),
    renderCell: (row, _index, context) => renderGridCell(row, columnId, context),
    width: resolvedColumnWidths[columnId],
    widthClassName: "",
    widthMode: autoWidthColumnIds.includes(columnId) ? "auto" : "fixed",
  }));
  const columnOptions: ModuleDataEntryColumnOption[] = columnOrder.map((columnId) => ({
    id: columnId,
    isHideable: !ProtectedDisbursementAccountingGridColumnIds.has(columnId),
    isVisible: visibleColumnIds.includes(columnId),
    label: columnLabels[columnId] || DefaultDisbursementAccountingGridColumnLabels[columnId],
    width: resolvedColumnWidths[columnId],
    widthMode: autoWidthColumnIds.includes(columnId) ? "auto" : "fixed",
  }));
  const previewValues = session
    ? withAccountingImportAttachment(
        {
          ...session.values,
          lineEntries: previewEntries,
        },
        importedImportAttachment,
      )
    : null;

  function updateRow(rowId: string, field: keyof Omit<EditableGridRow, "id" | "taxDetails">, value: string) {
    const nextValue = DisbursementAccountingAmountColumnIds.has(field as GridColumnId) ? formatMoneyNumberInput(value) : value;

    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        const nextRow = { ...row, [field]: nextValue };

        if (DisbursementAccountingAmountColumnIds.has(field as GridColumnId) || field === "taxRate") {
          const amount = normalizeAmount(nextRow.debit || nextRow.credit);

          nextRow.taxDetails = syncTaxDetailsAmount(nextRow.taxDetails, amount, nextRow.taxRate);
        }

        return nextRow;
      }),
    );
    setErrorMessage(null);
  }

  function addBlankRows(count = 1) {
    setRows((currentRows) => [...currentRows, ...Array.from({ length: count }, createBlankEditableRow)]);
    setErrorMessage(null);
  }

  function removeRow(rowId: string) {
    setRows((currentRows) => {
      const nextRows = currentRows.filter((row) => row.id !== rowId);
      return nextRows.length > 0 ? nextRows : [createBlankEditableRow()];
    });
    setErrorMessage(null);
  }

  function insertRow(rowId: string, position: "above" | "below") {
    setRows((currentRows) => {
      const rowIndex = currentRows.findIndex((row) => row.id === rowId);
      const insertIndex = rowIndex === -1 ? currentRows.length : rowIndex + (position === "below" ? 1 : 0);
      const nextRows = [...currentRows];

      nextRows.splice(insertIndex, 0, createBlankEditableRow());
      return nextRows;
    });
    setErrorMessage(null);
  }

  function duplicateRow(rowId: string) {
    setRows((currentRows) => {
      const rowIndex = currentRows.findIndex((row) => row.id === rowId);
      const sourceRow = currentRows[rowIndex];

      if (!sourceRow) {
        return currentRows;
      }

      const nextRows = [...currentRows];
      nextRows.splice(rowIndex + 1, 0, {
        ...sourceRow,
        id: createGridRowId(),
      });
      return nextRows;
    });
    setErrorMessage(null);
  }

  function moveRow(fromRowId: string, toRowId: string) {
    if (fromRowId === toRowId) {
      return;
    }

    setRows((currentRows) => {
      const fromIndex = currentRows.findIndex((row) => row.id === fromRowId);
      const toIndex = currentRows.findIndex((row) => row.id === toRowId);

      if (fromIndex === -1 || toIndex === -1) {
        return currentRows;
      }

      const nextRows = [...currentRows];
      const [movedRow] = nextRows.splice(fromIndex, 1);

      nextRows.splice(toIndex, 0, movedRow);
      return nextRows;
    });
    setErrorMessage(null);
  }

  function clearRows(action: ModuleDataEntryClearAction) {
    setRows((currentRows) => {
      const nextRows = action === "all" ? [] : currentRows.filter((row) => !shouldClearRow(row, action));

      return nextRows.length > 0 ? nextRows : [createBlankEditableRow()];
    });
    setErrorMessage(null);
  }

  function updateColumnHeader(columnId: string, header: string) {
    setColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateColumnWidth(columnId: string, width: number) {
    if (!isGridColumnId(columnId)) {
      return;
    }

    setAutoWidthColumnIds((currentColumnIds) => currentColumnIds.filter((currentColumnId) => currentColumnId !== columnId));
    setColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: Math.min(800, Math.max(50, Math.round(width))),
    }));
  }

  function autoSizeColumn(columnId: string) {
    if (!isGridColumnId(columnId)) {
      return;
    }

    setAutoWidthColumnIds((currentColumnIds) => (currentColumnIds.includes(columnId) ? currentColumnIds : [...currentColumnIds, columnId]));
  }

  function fitColumnWidth(columnId: string) {
    if (!isGridColumnId(columnId)) {
      return;
    }

    updateColumnWidth(
      columnId,
      calculateGridColumnFitWidth({
        columnId,
        columnLabels,
        rows,
      }),
    );
  }

  function moveColumn(fromColumnId: string, toColumnId: string) {
    setColumnOrder((currentOrder) => {
      const currentIndex = currentOrder.indexOf(fromColumnId as GridColumnId);
      const nextIndex = currentOrder.indexOf(toColumnId as GridColumnId);

      if (currentIndex === -1 || nextIndex === -1 || currentIndex === nextIndex) {
        return currentOrder;
      }

      const nextOrder = [...currentOrder];
      const [movedColumn] = nextOrder.splice(currentIndex, 1);

      nextOrder.splice(nextIndex, 0, movedColumn);
      return nextOrder;
    });
  }

  function removeColumn(columnId: string) {
    if (!isGridColumnId(columnId) || ProtectedDisbursementAccountingGridColumnIds.has(columnId)) {
      return;
    }

    setVisibleColumnIds((currentVisibleIds) =>
      currentVisibleIds.length <= 1 ? currentVisibleIds : currentVisibleIds.filter((currentColumnId) => currentColumnId !== columnId),
    );
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isGridColumnId(columnId)) {
      return;
    }

    if (!isVisible && ProtectedDisbursementAccountingGridColumnIds.has(columnId)) {
      return;
    }

    setVisibleColumnIds((currentVisibleIds) => {
      if (isVisible) {
        const nextVisibleIds = new Set([...currentVisibleIds, columnId]);

        return columnOrder.filter((currentColumnId) => nextVisibleIds.has(currentColumnId));
      }

      if (currentVisibleIds.length <= 1) {
        return currentVisibleIds;
      }

      return currentVisibleIds.filter((currentColumnId) => currentColumnId !== columnId);
    });
  }

  function renderGridCell(row: EditableGridRow, columnId: GridColumnId, context: ModuleDataEntryCellContext) {
    if (columnId === "taxRate") {
      return (
        <select
          value={row.taxRate}
          onChange={(event) => updateRow(row.id, "taxRate", event.target.value)}
          className={gridCellControlClassName("app-select-control")}
        >
          {DisbursementAccountingGridTaxRateOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (DisbursementAccountingAmountColumnIds.has(columnId)) {
      const oppositeColumnId =
        columnId === DisbursementAccountingDebitColumnId ? DisbursementAccountingCreditColumnId : DisbursementAccountingDebitColumnId;

      return (
        <MoneyNumberField
          value={row[columnId]}
          onValueChange={(value) => updateRow(row.id, columnId, value)}
          disabled={normalizeAmount(row[oppositeColumnId]) > 0}
          className={gridCellControlClassName("text-right")}
        />
      );
    }

    if (columnId === "particulars") {
      return (
        <ModuleDataEntryRemarksCell
          inputId={context.fieldId}
          inputName={context.fieldName}
          isReadonly={false}
          value={row.particulars}
          textareaId={`${context.fieldId}-dialog`}
          onChange={(value) => updateRow(row.id, "particulars", value)}
        />
      );
    }

    return <GridEntryInput value={row[columnId]} onChange={(value) => updateRow(row.id, columnId, value)} />;
  }

  async function handleImportFile(file: File) {
    if (file.size > AppMaxFileUploadSizeBytes) {
      setErrorMessage(`Upload a file up to ${AppMaxFileUploadSizeLabel}.`);
      return;
    }

    try {
      const previewText = await readAccountingImportFilePreviewText(file);

      setPasteText(previewText);
      setPendingImportAttachment(createImportSourceAttachment(file.name, file.size));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not preview the selected accounting entries file.");
    }
  }

  function handleImportPastedRows() {
    try {
      const importedRows = parseTabularText(pasteText);
      const sourceAttachment =
        pendingImportAttachment ?? createImportSourceAttachment("pasted-accounting-entries.tsv", new Blob([pasteText]).size);

      applyImportedRows(importedRows);
      setImportedImportAttachment(sourceAttachment);
      setPendingImportAttachment(null);
      setPasteText("");
      setIsImportDialogOpen(false);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not import the pasted accounting entries.");
    }
  }

  function applyImportedRows(importedRows: EditableGridRow[]) {
    if (importedRows.length === 0) {
      throw new Error("No accounting rows were found to import.");
    }

    setRows((currentRows) => {
      const populatedRows = currentRows.filter(hasRowData);

      return populatedRows.length > 0 ? [...populatedRows, ...importedRows] : importedRows;
    });
  }

  function handleExportRows() {
    const { amountColumnIndexes, rows: workbookRows, visibleColumnIds } = createAccountingExportRows();
    const exportTheme = getAccountingExportTheme();
    const workbookBytes = createAccountingWorkbook({
      amountColumnIndexes,
      columnWidths: visibleColumnIds.map((columnId) => DisbursementAccountingExportColumnWidths[columnId]),
      rows: workbookRows,
      sheetName: "Accounting Entries",
      theme: exportTheme,
    });

    downloadBytesFile(
      "disbursement-voucher-accounting-entries.xlsx",
      workbookBytes,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  }

  function handleExportPdfRows() {
    const exportData = createAccountingExportRows();
    const exportTheme = getAccountingExportTheme();

    pdfMake
      .createPdf(createAccountingPdfDefinition(exportData, session, exportTheme))
      .download("disbursement-voucher-accounting-entries.pdf");
  }

  function createAccountingExportRows() {
    const exportColumnIds = visibleColumnOrder;
    const exportRows = rows.filter(hasRowData);
    const workbookRows = [
      exportColumnIds.map((columnId) => columnLabels[columnId] || DefaultDisbursementAccountingGridColumnLabels[columnId]),
      ...exportRows.map((row) => exportColumnIds.map((columnId) => getExportCellValue(row, columnId))),
    ];
    const amountColumnIndexes = new Set(
      exportColumnIds
        .map((columnId, columnIndex) => (DisbursementAccountingAmountColumnIds.has(columnId) ? columnIndex : null))
        .filter((columnIndex): columnIndex is number => columnIndex !== null),
    );

    return {
      amountColumnIndexes,
      rows: workbookRows,
      visibleColumnIds: exportColumnIds,
    };
  }

  function handleBackToVoucherForm() {
    if (!session) {
      router.push("/cash-disbursement/disbursement-voucher");
      return;
    }

    writeAccountingGridSession({
      ...session,
      values: withAccountingImportAttachment(
        {
          ...session.values,
          lineEntries: buildLineEntries(rows),
        },
        importedImportAttachment,
      ),
    });
    router.push(createVoucherActionReturnLink(session));
  }

  function handleSaveAndContinue() {
    if (!session) {
      return;
    }

    const nextValues = {
      ...session.values,
      lineEntries: previewEntries,
    };
    const nextErrors = validateDisbursementVoucherEntries(nextValues);

    if (nextErrors.lineEntries) {
      setErrorMessage(nextErrors.lineEntries);
      return;
    }

    setIsPreviewDialogOpen(true);
  }

  function handleContinueToVoucherPreview() {
    if (!session) {
      return;
    }

    writeAccountingGridSession({
      ...session,
      entryDraft: DisbursementVoucherInitialEntryDraft,
      values: withAccountingImportAttachment(
        {
          ...session.values,
          lineEntries: previewEntries,
        },
        importedImportAttachment,
      ),
    });
    router.push(createVoucherActionReturnLink(session));
  }

  if (!isLoaded) {
    return null;
  }

  if (!session) {
    return (
      <section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] bg-white text-darknavy sm:-mx-5 lg:-mx-6">
        <main className="grid min-h-[calc(100dvh-5rem)] content-start gap-5 p-4 sm:p-6">
          <div className="rounded-xl border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">Cash Disbursement Setup</p>
            <h1 className="mt-2 text-2xl font-semibold text-darknavy sm:text-3xl">Accounting Grid View</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-darknavy/58">
              No voucher is available yet. Select a disbursement voucher first, then click Data Grid View from Accounting Entries.
            </p>
            <button
              type="button"
              onClick={() => router.push("/cash-disbursement/disbursement-voucher")}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 sm:w-auto"
            >
              Back to Disbursement Voucher
            </button>
          </div>
        </main>
      </section>
    );
  }

  return (
    <section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] bg-white text-darknavy sm:-mx-5 lg:-mx-6">
      <main className="grid min-h-[calc(100dvh-5rem)] min-w-0 content-start gap-5 p-4 sm:p-6">
        <div className="min-w-0 overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
          <div className="min-w-0 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">Cash Disbursement Setup</p>
                <h1 className="mt-2 text-2xl font-semibold text-darknavy sm:text-3xl">Accounting Grid View</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-darknavy/58">
                  Encode accounting entries in a dedicated grid page, then save and return to the voucher preview for final checking before
                  saving.
                </p>
              </div>
              <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-skyblue/20 bg-skyblue/8 px-4 py-2 text-sm font-semibold text-skyblue sm:w-auto sm:justify-start">
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                Data Grid Encoding
              </div>
            </div>

            <VoucherAccountingGridHeader selectedTransaction={selectedTransaction} values={session.values} />

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <SummaryCard label="Records" value={String(buildLineEntries(rows).length)} />
              <SummaryCard label="Debit Total" value={formatCurrency(totals.totalDebit)} />
              <SummaryCard label="Credit Total" value={formatCurrency(totals.totalCredit)} />
            </div>

            <div className="mt-6">
              <ModuleDataEntry
                columns={columns}
                columnOptions={columnOptions}
                description=""
                emptyRowLabel="entry"
                error={errorMessage ?? undefined}
                isDraggable
                isReadonly={false}
                rows={rows}
                summaryCells={{
                  credit: formatCurrency(totals.totalCredit),
                  debit: formatCurrency(totals.totalDebit),
                }}
                footerDetails={
                  <span className={joinClasses("text-sm font-semibold", totals.variance < 0.001 ? "text-emerald-700" : "text-coralpink")}>
                    Variance: {formatCurrency(totals.variance)}
                  </span>
                }
                title="Accounting Entries"
                exportOptions={[
                  {
                    id: "excel",
                    label: "Excel (.xlsx)",
                    onSelect: handleExportRows,
                  },
                  {
                    id: "pdf",
                    label: "PDF (.pdf)",
                    onSelect: handleExportPdfRows,
                  },
                ]}
                onAddRows={addBlankRows}
                onAutoColumnWidth={autoSizeColumn}
                onClearRows={clearRows}
                onDuplicateRow={duplicateRow}
                onFitColumnWidth={fitColumnWidth}
                onImport={() => setIsImportDialogOpen(true)}
                onInsertRow={insertRow}
                onMoveColumn={moveColumn}
                onMoveRow={moveRow}
                onRemoveColumn={removeColumn}
                onRemoveRow={removeRow}
                onToggleColumnVisibility={toggleColumnVisibility}
                onUpdateColumnHeader={updateColumnHeader}
                onUpdateColumnWidth={updateColumnWidth}
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={handleBackToVoucherForm}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8 sm:w-auto"
              >
                Back to Voucher Form
              </button>
              <button
                type="button"
                onClick={handleSaveAndContinue}
                className="theme-accent-contrast-text inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-skyblue px-5 text-sm font-semibold transition hover:bg-skyblue/85 sm:w-auto"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save & Preview
              </button>
            </div>
          </div>
        </div>
      </main>

      {previewValues ? (
        <GridPreviewDialog
          entries={previewEntries}
          isBalanced={totals.isBalanced}
          isOpen={isPreviewDialogOpen}
          selectedTransaction={selectedTransaction}
          totalCredit={totals.totalCredit}
          totalDebit={totals.totalDebit}
          values={previewValues}
          variance={totals.variance}
          onClose={() => setIsPreviewDialogOpen(false)}
          onContinue={handleContinueToVoucherPreview}
        />
      ) : null}
      <AccountingImportDialog
        canClearTable={Boolean(pasteText.trim() || pendingImportAttachment)}
        importAttachment={pendingImportAttachment ?? importedImportAttachment}
        isDragActive={isDragActive}
        isOpen={isImportDialogOpen}
        pasteText={pasteText}
        onClose={() => setIsImportDialogOpen(false)}
        onDragActiveChange={setIsDragActive}
        onDropFile={handleImportFile}
        onClearTable={(action) => {
          const nextPasteText = clearImportPreviewText(pasteText, action);

          setPasteText(nextPasteText);
          if (!nextPasteText.trim()) {
            setPendingImportAttachment(null);
          }
          setErrorMessage(null);
        }}
        onImportPastedRows={handleImportPastedRows}
        onPasteTextChange={(value) => {
          setPasteText(value);
          if (value.trim() && !pendingImportAttachment) {
            setPendingImportAttachment(createImportSourceAttachment("pasted-accounting-entries.tsv", new Blob([value]).size));
          }
        }}
      />
    </section>
  );
}
