"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { LayoutGrid, Save } from "lucide-react";
import { AppMaxFileUploadSizeBytes, AppMaxFileUploadSizeLabel } from "@/app/src/constants/shared/app/AppConstants";
import {
  DefaultCashVoucherAccountingGridColumnLabels,
  DefaultCashVoucherAccountingGridColumnOrder,
  DefaultCashVoucherAccountingGridColumnWidths,
  CashVoucherAccountingAmountColumnIds,
  CashVoucherAccountingCreditColumnId,
  CashVoucherAccountingDebitColumnId,
  CashVoucherAccountingExportColumnWidths,
  CashVoucherAccountingGridTaxRateOptions,
  ProtectedCashVoucherAccountingGridColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import {
  CashVoucherInitialEntryDraft,
  formatCurrency,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import { useCashVoucherStore } from "@/app/src/hooks/modules/cash-disbursement/cash-voucher/useCashVoucher";
import { validateCashVoucherEntries } from "@/app/src/validations/modules/cash-disbursement/cash-voucher/CashVoucherValidation";
import type {
  CashVoucherAccountingGridColumnId as GridColumnId,
  EditableCashVoucherAccountingGridRow as EditableGridRow,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import type {
  CashVoucherAttachment as VoucherAttachment,
  CashVoucherAccountingGridSession,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import {
  readAccountingGridSession,
  writeAccountingGridSession,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingGridSessionData";
import { CashVoucherEntryImportUploadDialog } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/import/CashVoucherEntryImportUploadDialog";
import {
  GridEntryInput,
  CashVoucherEntryImportReviewDialog,
  SummaryCard,
  VoucherAccountingGridHeader,
  gridCellControlClassName,
} from "@/app/src/ui/modules/cash-disbursement/cash-voucher/import/CashVoucherEntryImportReviewDialog";
import {
  createAccountingPdfDefinition,
  createAccountingWorkbook,
  getAccountingExportTheme,
  readAccountingImportFilePreviewText,
} from "@/app/src/services/modules/cash-disbursement/cash-voucher/CashVoucherAccountingExportService";
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
} from "@/app/src/services/modules/cash-disbursement/cash-voucher/CashVoucherAccountingImportService";
import {
  ModuleDataEntry,
  type ModuleDataEntryCellContext,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ModuleDataEntryRemarksCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryRemarksCell";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

pdfMake.addVirtualFileSystem(pdfFonts);

export function CashVoucherEntryImportPage() {
  const router = useRouter();
  const transactions = useCashVoucherStore((state) => state.transactions);
  const [session, setSession] = useState<CashVoucherAccountingGridSession | null>(null);
  const [rows, setRows] = useState<EditableGridRow[]>([]);
  const [columnOrder, setColumnOrder] = useState<GridColumnId[]>(DefaultCashVoucherAccountingGridColumnOrder);
  const [visibleColumnIds, setVisibleColumnIds] = useState<GridColumnId[]>(DefaultCashVoucherAccountingGridColumnOrder);
  const [columnLabels, setColumnLabels] = useState(DefaultCashVoucherAccountingGridColumnLabels);
  const [columnWidths, setColumnWidths] = useState(DefaultCashVoucherAccountingGridColumnWidths);
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

  function updateRowField(id: string, field: keyof EditableGridRow, value: string) {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== id) {
          return row;
        }

        const nextRow = { ...row, [field]: value };
        if (field === "debit" && value.trim()) {
          nextRow.credit = "";
        }
        if (field === "credit" && value.trim()) {
          nextRow.debit = "";
        }

        return nextRow;
      }),
    );
    setErrorMessage(null);
  }

  function addBlankRows(count = 1) {
    setRows((currentRows) => [
      ...currentRows,
      ...Array.from({ length: count }, () => createBlankEditableRow()),
    ]);
    setErrorMessage(null);
  }

  function duplicateRow(id: string) {
    setRows((currentRows) => {
      const rowIndex = currentRows.findIndex((row) => row.id === id);
      if (rowIndex === -1) {
        return currentRows;
      }

      const sourceRow = currentRows[rowIndex];
      const duplicated: EditableGridRow = {
        ...sourceRow,
        id: createGridRowId(),
        taxDetails: { ...sourceRow.taxDetails },
      };

      const nextRows = [...currentRows];
      nextRows.splice(rowIndex + 1, 0, duplicated);
      return nextRows;
    });
    setErrorMessage(null);
  }

  function insertRow(targetId: string, position: "above" | "below") {
    setRows((currentRows) => {
      const rowIndex = currentRows.findIndex((row) => row.id === targetId);
      if (rowIndex === -1) {
        return currentRows;
      }

      const insertIndex = position === "above" ? rowIndex : rowIndex + 1;
      const nextRows = [...currentRows];
      nextRows.splice(insertIndex, 0, createBlankEditableRow());
      return nextRows;
    });
    setErrorMessage(null);
  }

  function removeRow(id: string) {
    setRows((currentRows) => {
      const remainingRows = currentRows.filter((row) => row.id !== id);
      return remainingRows.length > 0 ? remainingRows : [createBlankEditableRow()];
    });
    setErrorMessage(null);
  }

  function moveRow(sourceId: string, targetId: string) {
    setRows((currentRows) => {
      const sourceIndex = currentRows.findIndex((row) => row.id === sourceId);
      const targetIndex = currentRows.findIndex((row) => row.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
        return currentRows;
      }

      const nextRows = [...currentRows];
      const [moved] = nextRows.splice(sourceIndex, 1);
      nextRows.splice(targetIndex, 0, moved);
      return nextRows;
    });
    setErrorMessage(null);
  }

  function clearRows(action: ModuleDataEntryClearAction) {
    setRows((currentRows) => {
      const remainingRows =
        action === "all" ? [] : currentRows.filter((row) => !shouldClearRow(row, action));
      return remainingRows.length > 0 ? remainingRows : [createBlankEditableRow()];
    });
    setErrorMessage(null);
  }

  function moveColumn(fromId: string, toId: string) {
    if (!isGridColumnId(fromId) || !isGridColumnId(toId)) {
      return;
    }

    setColumnOrder((currentOrder) => {
      const fromIndex = currentOrder.indexOf(fromId);
      const toIndex = currentOrder.indexOf(toId);

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return currentOrder;
      }

      const nextOrder = [...currentOrder];
      const [moved] = nextOrder.splice(fromIndex, 1);
      nextOrder.splice(toIndex, 0, moved);
      return nextOrder;
    });
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isGridColumnId(columnId) || ProtectedCashVoucherAccountingGridColumnIds.has(columnId)) {
      return;
    }

    setVisibleColumnIds((currentIds) => {
      if (isVisible) {
        const nextIds = new Set([...currentIds, columnId]);
        return columnOrder.filter((id) => nextIds.has(id));
      }

      if (currentIds.length <= 1) {
        return currentIds;
      }

      return currentIds.filter((id) => id !== columnId);
    });
  }

  function updateColumnHeader(columnId: string, header: string) {
    if (!isGridColumnId(columnId)) {
      return;
    }

    setColumnLabels((currentLabels) => ({ ...currentLabels, [columnId]: header }));
  }

  function updateColumnWidth(columnId: string, width: number) {
    if (!isGridColumnId(columnId)) {
      return;
    }

    setAutoWidthColumnIds((current) => current.filter((id) => id !== columnId));
    setColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: Math.max(72, Math.round(width)),
    }));
  }

  function autoSizeColumn(columnId: string) {
    if (!isGridColumnId(columnId)) {
      return;
    }

    setAutoWidthColumnIds((current) => (current.includes(columnId) ? current : [...current, columnId]));
  }

  function fitColumnWidth(columnId: string) {
    if (!isGridColumnId(columnId)) {
      return;
    }

    setAutoWidthColumnIds((current) => current.filter((id) => id !== columnId));
    setColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: calculateGridColumnFitWidth({
        columnId,
        columnLabels,
        rows,
      }),
    }));
  }

  function removeColumn(columnId: string) {
    toggleColumnVisibility(columnId, false);
  }

  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columnOrder.map((columnId) => ({
        id: columnId,
        isProtected: ProtectedCashVoucherAccountingGridColumnIds.has(columnId),
        isVisible: visibleColumnIds.includes(columnId),
        label: columnLabels[columnId],
        width: resolvedColumnWidths[columnId],
      })),
    [columnLabels, columnOrder, resolvedColumnWidths, visibleColumnIds],
  );

  const previewValues = useMemo(() => {
    if (!session) {
      return null;
    }

    return withAccountingImportAttachment(
      {
        ...session.values,
        lineEntries: previewEntries,
      },
      pendingImportAttachment ?? importedImportAttachment,
    );
  }, [importedImportAttachment, pendingImportAttachment, previewEntries, session]);

  const columns = useMemo<ModuleDataEntryColumn<EditableGridRow>[]>(
    () =>
      visibleColumnOrder.map((columnId) => {
        const renderCell = (row: EditableGridRow, rowIndex: number, context: ModuleDataEntryCellContext) => {
          const fieldId = `${context.fieldId}-${columnId}`;

          switch (columnId) {
            case "accountCode":
              return (
                <GridEntryInput
                  id={fieldId}
                  label={`${columnLabels.accountCode} row ${rowIndex + 1}`}
                  value={row.accountCode}
                  onChange={(value) => updateRowField(row.id, "accountCode", value)}
                />
              );
            case "accountName":
              return (
                <GridEntryInput
                  id={fieldId}
                  label={`${columnLabels.accountName} row ${rowIndex + 1}`}
                  value={row.accountName}
                  onChange={(value) => updateRowField(row.id, "accountName", value)}
                />
              );
            case "taxRate":
              return (
                <>
                  <label htmlFor={fieldId} className="sr-only">
                    {columnLabels.taxRate} row {rowIndex + 1}
                  </label>
                  <select
                    id={fieldId}
                    value={row.taxRate}
                    onChange={(event) => {
                      const nextRate = event.target.value;
                      setRows((currentRows) =>
                        currentRows.map((currentRow) => {
                          if (currentRow.id !== row.id) {
                            return currentRow;
                          }

                          const grossAmount = normalizeAmount(currentRow.debit || currentRow.credit || "0");
                          return {
                            ...currentRow,
                            taxDetails: syncTaxDetailsAmount(currentRow.taxDetails, grossAmount, nextRate),
                            taxRate: nextRate,
                          };
                        }),
                      );
                      setErrorMessage(null);
                    }}
                    className={gridCellControlClassName("bg-white")}
                  >
                    {CashVoucherAccountingGridTaxRateOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </>
              );
            case "debit":
              return (
                <MoneyNumberField
                  id={fieldId}
                  name={fieldId}
                  value={row.debit}
                  onValueChange={(value) => updateRowField(row.id, "debit", value)}
                  className={gridCellControlClassName("text-right tabular-nums")}
                />
              );
            case "credit":
              return (
                <MoneyNumberField
                  id={fieldId}
                  name={fieldId}
                  value={row.credit}
                  onValueChange={(value) => updateRowField(row.id, "credit", value)}
                  className={gridCellControlClassName("text-right tabular-nums")}
                />
              );
            case "particulars":
              return (
                <ModuleDataEntryRemarksCell
                  inputId={fieldId}
                  inputName={fieldId}
                  isReadonly={false}
                  dialogTitle="Particulars"
                  value={row.particulars ?? row.remarks ?? ""}
                  textareaId={`${fieldId}-dialog`}
                  onChange={(value) => {
                    updateRowField(row.id, "particulars", value);
                    updateRowField(row.id, "remarks", value);
                  }}
                />
              );
          }
        };

        return {
          header: columnLabels[columnId],
          id: columnId,
          renderCell,
          width: resolvedColumnWidths[columnId],
          widthClassName: "w-auto",
        };
      }),
    [columnLabels, resolvedColumnWidths, visibleColumnOrder],
  );

  async function handleImportFile(file: File) {
    if (file.size > AppMaxFileUploadSizeBytes) {
      setErrorMessage(`Import file size must be within ${AppMaxFileUploadSizeLabel}.`);
      return;
    }

    try {
      const previewText = await readAccountingImportFilePreviewText(file);
      setPasteText(previewText);
      setPendingImportAttachment(createImportSourceAttachment(file.name, file.size));
      setErrorMessage(null);
    } catch {
      setErrorMessage("Failed to read the imported file. Check that the format is valid.");
    }
  }

  function handleImportPastedRows() {
    if (!pasteText.trim()) {
      return;
    }

    const parsedRows = parseTabularText(pasteText);
    if (parsedRows.length === 0) {
      setErrorMessage("No valid accounting rows found to import.");
      return;
    }

    setRows((currentRows) => {
      const existingRows = currentRows.filter(hasRowData);
      return existingRows.length > 0 ? [...existingRows, ...parsedRows] : parsedRows;
    });
    setImportedImportAttachment(pendingImportAttachment);
    setPendingImportAttachment(null);
    setPasteText("");
    setIsImportDialogOpen(false);
    setErrorMessage(null);
  }

  function handleExportRows() {
    const exportData = prepareExportData();
    const theme = getAccountingExportTheme();
    const buffer = createAccountingWorkbook({
      amountColumnIndexes: exportData.amountColumnIndexes,
      columnWidths: exportData.visibleColumnIds.map((id) => CashVoucherAccountingExportColumnWidths[id]),
      rows: exportData.rows,
      sheetName: "Accounting Entries",
      theme,
    });

    downloadBytesFile(
      `${session?.values.voucherNo || "cash-voucher"}-accounting-entries.xlsx`,
      buffer,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  }

  function handleExportPdfRows() {
    const exportData = prepareExportData();
    const theme = getAccountingExportTheme();
    const docDefinition = createAccountingPdfDefinition(exportData, session, theme);

    pdfMake.createPdf(docDefinition).download(`${session?.values.voucherNo || "cash-voucher"}-accounting-entries.pdf`);
  }

  function prepareExportData() {
    const exportColumnIds = visibleColumnOrder.filter(
      (columnId) => columnId !== CashVoucherAccountingDebitColumnId && columnId !== CashVoucherAccountingCreditColumnId,
    );
    exportColumnIds.push(CashVoucherAccountingDebitColumnId, CashVoucherAccountingCreditColumnId);

    const exportRows = rows.filter(hasRowData);
    const workbookRows = [
      exportColumnIds.map((columnId) => columnLabels[columnId]),
      ...exportRows.map((row) => exportColumnIds.map((columnId) => getExportCellValue(row, columnId))),
    ];
    const amountColumnIndexes = new Set(
      exportColumnIds
        .map((columnId, columnIndex) => (CashVoucherAccountingAmountColumnIds.has(columnId) ? columnIndex : null))
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
      router.push("/cash-disbursement/cash-voucher");
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
    const nextErrors = validateCashVoucherEntries(nextValues);

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
      entryDraft: CashVoucherInitialEntryDraft,
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">Cash Voucher Setup</p>
            <h1 className="mt-2 text-2xl font-semibold text-darknavy sm:text-3xl">Accounting Grid View</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-darknavy/58">
              No voucher is available yet. Select a cash voucher first, then click Data Grid View from Accounting Entries.
            </p>
            <button
              type="button"
              onClick={() => router.push("/cash-disbursement/cash-voucher")}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 sm:w-auto"
            >
              Back to Cash Voucher
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
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">Cash Voucher Setup</p>
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
        <CashVoucherEntryImportReviewDialog
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
      <CashVoucherEntryImportUploadDialog
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
