"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ClipboardPaste,
  Download,
  Eye,
  FileText,
  LayoutGrid,
  Save,
  Upload,
  X,
} from "lucide-react";
import {
  DisbursementVoucherInitialEntryDraft,
  createTaxDetails,
  formatCurrency,
  formatDateLabel,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { useDisbursementVoucherStore } from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher";
import { validateDisbursementVoucherEntries } from "@/app/src/validations/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherValidation";
import type {
  DisbursementLineEntry,
  DisbursementTaxDetails,
  DisbursementTransactionRecord,
  DisbursementVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import {
  readAccountingGridSession,
  writeAccountingGridSession,
  type DisbursementVoucherAccountingGridSession,
} from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/ui/AccountingGridSession";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type EditableGridRow = {
  accountCode: string;
  accountName: string;
  credit: string;
  debit: string;
  id: string;
  particulars: string;
  taxDetails: DisbursementTaxDetails;
  taxRate: string;
};

type GridColumnId =
  | "accountCode"
  | "accountName"
  | "particulars"
  | "taxRate"
  | "debit"
  | "credit";

const TaxRateOptions = ["0%", "1%", "2%", "5%", "12%"];

const DefaultGridColumnOrder: GridColumnId[] = [
  "accountCode",
  "accountName",
  "particulars",
  "taxRate",
  "debit",
  "credit",
];

const ProtectedGridColumnIds = new Set<GridColumnId>([
  "accountCode",
  "accountName",
  "debit",
  "credit",
]);

const DefaultGridColumnLabels: Record<GridColumnId, string> = {
  accountCode: "Account Code",
  accountName: "Account Name",
  credit: "Credit",
  debit: "Debit",
  particulars: "Particulars",
  taxRate: "Tax Rate",
};

const GridColumnWidthClassNames: Record<GridColumnId, string> = {
  accountCode: "w-[12rem]",
  accountName: "w-[16rem]",
  credit: "w-[11rem]",
  debit: "w-[11rem]",
  particulars: "w-[22rem]",
  taxRate: "w-[10rem]",
};

const AccountingImportTemplateHeaders = [
  "Account Code",
  "Account Name",
  "Particulars",
  "Tax Rate",
  "Debit",
  "Credit",
];

const AccountingImportTemplateRows = [
  [
    "2010-003",
    "Accounts Payable",
    "Settlement of approved office depot payable",
    "0%",
    "",
    "18450.00",
  ],
  [
    "5010-001",
    "Office Supplies Expense",
    "Replenishment of paper, toner, and pantry labels",
    "0%",
    "18450.00",
    "",
  ],
];

const ImportClearActions: {
  label: string;
  value: ModuleDataEntryClearAction;
}[] = [
  { label: "Clear All", value: "all" },
  { label: "Clear With Data", value: "with-data" },
  { label: "Clear Incomplete", value: "incomplete" },
  { label: "Clear No Data", value: "no-data" },
];

export function DisbursementVoucherAccountingGridPage() {
  const router = useRouter();
  const transactions = useDisbursementVoucherStore((state) => state.transactions);
  const [session, setSession] =
    useState<DisbursementVoucherAccountingGridSession | null>(null);
  const [rows, setRows] = useState<EditableGridRow[]>([]);
  const [columnOrder, setColumnOrder] =
    useState<GridColumnId[]>(DefaultGridColumnOrder);
  const [visibleColumnIds, setVisibleColumnIds] =
    useState<GridColumnId[]>(DefaultGridColumnOrder);
  const [columnLabels, setColumnLabels] = useState(DefaultGridColumnLabels);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pendingImportAttachment, setPendingImportAttachment] = useState<
    DisbursementVoucherFormValues["attachments"][number] | null
  >(null);
  const [importedImportAttachment, setImportedImportAttachment] = useState<
    DisbursementVoucherFormValues["attachments"][number] | null
  >(null);
  const [viewedParticulars, setViewedParticulars] = useState<{
    rowNo: number;
    value: string;
  } | null>(null);

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
    const totalDebit = rows.reduce(
      (sum, row) => sum + normalizeAmount(row.debit),
      0,
    );
    const totalCredit = rows.reduce(
      (sum, row) => sum + normalizeAmount(row.credit),
      0,
    );

    return {
      isBalanced: totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.001,
      totalCredit,
      totalDebit,
      variance: Math.abs(totalDebit - totalCredit),
    };
  }, [rows]);
  const previewEntries = useMemo(() => buildLineEntries(rows), [rows]);
  const selectedTransaction = useMemo(
    () =>
      session
        ? transactions.find(
            (transaction) => transaction.id === session.values.transactionId,
          )
        : undefined,
    [session, transactions],
  );
  const visibleColumnOrder = columnOrder.filter((columnId) =>
    visibleColumnIds.includes(columnId),
  );
  const columns: ModuleDataEntryColumn<EditableGridRow>[] =
    visibleColumnOrder.map((columnId) => ({
      header: columnLabels[columnId],
      id: columnId,
      isRemovable: !ProtectedGridColumnIds.has(columnId),
      renderCell: (row) => renderGridCell(row, columnId),
      widthClassName: GridColumnWidthClassNames[columnId],
    }));
  const columnOptions: ModuleDataEntryColumnOption[] = columnOrder.map(
    (columnId) => ({
      id: columnId,
      isHideable: !ProtectedGridColumnIds.has(columnId),
      isVisible: visibleColumnIds.includes(columnId),
      label: columnLabels[columnId] || DefaultGridColumnLabels[columnId],
    }),
  );
  const previewValues = session
    ? withAccountingImportAttachment(
        {
          ...session.values,
          lineEntries: previewEntries,
        },
        importedImportAttachment,
      )
    : null;

  function updateRow(
    rowId: string,
    field: keyof Omit<EditableGridRow, "id" | "taxDetails">,
    value: string,
  ) {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        const nextRow = { ...row, [field]: value };

        if (field === "debit" || field === "credit" || field === "taxRate") {
          const amount = normalizeAmount(nextRow.debit || nextRow.credit);

          nextRow.taxDetails = syncTaxDetailsAmount(
            nextRow.taxDetails,
            amount,
            nextRow.taxRate,
          );
        }

        return nextRow;
      }),
    );
    setErrorMessage(null);
  }

  function addBlankRows(count = 1) {
    setRows((currentRows) => [
      ...currentRows,
      ...Array.from({ length: count }, createBlankEditableRow),
    ]);
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
      const insertIndex =
        rowIndex === -1
          ? currentRows.length
          : rowIndex + (position === "below" ? 1 : 0);
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
      const nextRows =
        action === "all"
          ? []
          : currentRows.filter((row) => !shouldClearRow(row, action));

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
    if (!isGridColumnId(columnId) || ProtectedGridColumnIds.has(columnId)) {
      return;
    }

    setVisibleColumnIds((currentVisibleIds) =>
      currentVisibleIds.length <= 1
        ? currentVisibleIds
        : currentVisibleIds.filter(
            (currentColumnId) => currentColumnId !== columnId,
          ),
    );
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isGridColumnId(columnId)) {
      return;
    }

    if (!isVisible && ProtectedGridColumnIds.has(columnId)) {
      return;
    }

    setVisibleColumnIds((currentVisibleIds) => {
      if (isVisible) {
        const nextVisibleIds = new Set([...currentVisibleIds, columnId]);

        return columnOrder.filter((currentColumnId) =>
          nextVisibleIds.has(currentColumnId),
        );
      }

      if (currentVisibleIds.length <= 1) {
        return currentVisibleIds;
      }

      return currentVisibleIds.filter(
        (currentColumnId) => currentColumnId !== columnId,
      );
    });
  }

  function renderGridCell(row: EditableGridRow, columnId: GridColumnId) {
    if (columnId === "taxRate") {
      return (
        <select
          value={row.taxRate}
          onChange={(event) => updateRow(row.id, "taxRate", event.target.value)}
          className={gridCellControlClassName()}
        >
          {TaxRateOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (columnId === "debit" || columnId === "credit") {
      return (
        <GridEntryInput
          value={row[columnId]}
          onChange={(value) => updateRow(row.id, columnId, value)}
          type="number"
          extraClassName="text-right"
        />
      );
    }

    if (columnId === "particulars") {
      const rowNo = rows.findIndex((currentRow) => currentRow.id === row.id) + 1;

      return (
        <div className="flex items-center gap-2">
          <GridEntryInput
            value={row.particulars}
            onChange={(value) => updateRow(row.id, "particulars", value)}
          />
          <button
            type="button"
            onClick={() =>
              setViewedParticulars({
                rowNo: rowNo > 0 ? rowNo : 1,
                value: row.particulars,
              })
            }
            className="mr-2 inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-skyblue/25 bg-skyblue/8 px-3 text-xs font-semibold text-skyblue transition hover:bg-skyblue/14"
          >
            View
          </button>
        </div>
      );
    }

    return (
      <GridEntryInput
        value={row[columnId]}
        onChange={(value) => updateRow(row.id, columnId, value)}
      />
    );
  }

  async function handleImportFile(file: File) {
    try {
      const previewText = await readAccountingImportFilePreviewText(file);

      setPasteText(previewText);
      setPendingImportAttachment(
        createImportSourceAttachment(file.name, file.size),
      );
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not preview the selected accounting entries file.",
      );
    }
  }

  function handleImportPastedRows() {
    try {
      const importedRows = parseTabularText(pasteText);
      const sourceAttachment =
        pendingImportAttachment ??
        createImportSourceAttachment(
          "pasted-accounting-entries.tsv",
          new Blob([pasteText]).size,
        );

      applyImportedRows(importedRows);
      setImportedImportAttachment(sourceAttachment);
      setPendingImportAttachment(null);
      setPasteText("");
      setIsImportDialogOpen(false);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not import the pasted accounting entries.",
      );
    }
  }

  function applyImportedRows(importedRows: EditableGridRow[]) {
    if (importedRows.length === 0) {
      throw new Error("No accounting rows were found to import.");
    }

    setRows((currentRows) => {
      const populatedRows = currentRows.filter(hasRowData);

      return populatedRows.length > 0
        ? [...populatedRows, ...importedRows]
        : importedRows;
    });
  }

  function handleExportRows() {
    const exportColumnIds = visibleColumnOrder;
    const exportRows = rows.filter(hasRowData);
    const csvRows = [
      exportColumnIds.map(
        (columnId) => columnLabels[columnId] || DefaultGridColumnLabels[columnId],
      ),
      ...exportRows.map((row) =>
        exportColumnIds.map((columnId) => getExportCellValue(row, columnId)),
      ),
    ];
    const csvContent = csvRows
      .map((row) => row.map(escapeCsvCell).join(","))
      .join("\r\n");

    downloadTextFile(
      "disbursement-voucher-accounting-entries.csv",
      csvContent,
      "text/csv;charset=utf-8",
    );
  }

  function handleBackToVoucherForm() {
    if (!session) {
      router.push("/cash-disbursement/disbursement-voucher");
      return;
    }

    writeAccountingGridSession({
      ...session,
      returnStep: "details",
      values: withAccountingImportAttachment(
        {
          ...session.values,
          lineEntries: buildLineEntries(rows),
        },
        importedImportAttachment,
      ),
    });
    router.push("/cash-disbursement/disbursement-voucher?grid=resume");
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
      returnStep: "review",
      values: withAccountingImportAttachment(
        {
          ...session.values,
          lineEntries: previewEntries,
        },
        importedImportAttachment,
      ),
    });
    router.push("/cash-disbursement/disbursement-voucher?grid=resume");
  }

  if (!isLoaded) {
    return null;
  }

  if (!session) {
    return (
      <section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] bg-white text-darknavy sm:-mx-5 lg:-mx-6">
        <main className="grid min-h-[calc(100dvh-5rem)] content-start gap-5 p-4 sm:p-6">
          <div className="rounded-xl border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">
              Cash Disbursement Setup
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-darknavy sm:text-3xl">
              Accounting Grid View
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-darknavy/58">
              No voucher draft is available yet. Open a disbursement voucher
              first, then click Data Grid View from Accounting Entries.
            </p>
            <button
              type="button"
              onClick={() =>
                router.push("/cash-disbursement/disbursement-voucher")
              }
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
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">
                  Cash Disbursement Setup
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-darknavy sm:text-3xl">
                  Accounting Grid View
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-darknavy/58">
                  Encode accounting entries in a dedicated grid page, then save
                  and return to the voucher preview for final checking before
                  saving.
                </p>
              </div>
              <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-skyblue/20 bg-skyblue/8 px-4 py-2 text-sm font-semibold text-skyblue sm:w-auto sm:justify-start">
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                Data Grid Encoding
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Records"
                value={String(buildLineEntries(rows).length)}
              />
              <SummaryCard
                label="Debit Total"
                value={formatCurrency(totals.totalDebit)}
              />
              <SummaryCard
                label="Credit Total"
                value={formatCurrency(totals.totalCredit)}
              />
              <SummaryCard
                label="Status"
                tone={totals.isBalanced ? "balanced" : "warning"}
                value={totals.isBalanced ? "Balanced" : "Needs adjustment"}
              />
            </div>

            <div className="mt-6">
              <ModuleDataEntry
                columns={columns}
                columnOptions={columnOptions}
                description="Add accounting entry lines, adjust debit and credit amounts, reorder rows, and manage duplicate journal entries."
                emptyRowLabel="entry"
                error={errorMessage ?? undefined}
                isDraggable
                isReadonly={false}
                rows={rows}
                title="Data Entry"
                onAddRows={addBlankRows}
                onClearRows={clearRows}
                onDuplicateRow={duplicateRow}
                onExport={handleExportRows}
                onImport={() => setIsImportDialogOpen(true)}
                onInsertRow={insertRow}
                onMoveColumn={moveColumn}
                onMoveRow={moveRow}
                onRemoveColumn={removeColumn}
                onRemoveRow={removeRow}
                onToggleColumnVisibility={toggleColumnVisibility}
                onUpdateColumnHeader={updateColumnHeader}
              />
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
              <div className="rounded-xl border border-darknavy/10 bg-offwhite/45 p-4 sm:p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-darknavy/45">
                  Quick Encoding Tips
                </p>
                <div className="mt-4 grid gap-3 text-sm text-darknavy/62">
                  <p>Encode one journal line per row for easier balancing.</p>
                  <p>Enter the amount in debit or credit only for each line.</p>
                  <p>
                    Leave extra blank rows if you are still preparing the next
                    line. Blank rows will not be saved.
                  </p>
                  <p>
                    After Save & Preview, the flow returns to the voucher
                    preview so you can still review everything before final save.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-darknavy/10 bg-white p-4 sm:p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-darknavy/45">
                  Balance Summary
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <SummaryCard
                    label="Total Debit"
                    value={formatCurrency(totals.totalDebit)}
                  />
                  <SummaryCard
                    label="Total Credit"
                    value={formatCurrency(totals.totalCredit)}
                  />
                  <SummaryCard
                    label="Variance"
                    tone={totals.isBalanced ? "balanced" : "warning"}
                    value={formatCurrency(totals.variance)}
                  />
                </div>
              </div>
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
            setPendingImportAttachment(
              createImportSourceAttachment(
                "pasted-accounting-entries.tsv",
                new Blob([value]).size,
              ),
            );
          }
        }}
      />
      <ParticularsViewDialog
        viewedParticulars={viewedParticulars}
        onClose={() => setViewedParticulars(null)}
      />
    </section>
  );
}

function AccountingImportPanel({
  canClearTable,
  importAttachment,
  isDragActive,
  pasteText,
  onDragActiveChange,
  onDropFile,
  onClearTable,
  onImportPastedRows,
  onPasteTextChange,
}: {
  canClearTable: boolean;
  importAttachment: DisbursementVoucherFormValues["attachments"][number] | null;
  isDragActive: boolean;
  pasteText: string;
  onDragActiveChange: (isActive: boolean) => void;
  onDropFile: (file: File) => void;
  onClearTable: (action: ModuleDataEntryClearAction) => void;
  onImportPastedRows: () => void;
  onPasteTextChange: (value: string) => void;
}) {
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isUploadFormOpen, setIsUploadFormOpen] = useState(false);
  const [isClearMenuOpen, setIsClearMenuOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const clearMenuRef = useRef<HTMLDivElement>(null);
  const previewRows = useMemo(() => parseImportPreviewRows(pasteText), [pasteText]);
  const hasPreviewRows = previewRows.length > 0;

  function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0];

    if (!file) {
      return;
    }

    onDropFile(file);
    setFileInputKey((current) => current + 1);
  }

  function handlePreviewCellChange(
    rowIndex: number,
    columnIndex: number,
    value: string,
  ) {
    const nextRows = previewRows.map((row) => [...row]);

    nextRows[rowIndex] = nextRows[rowIndex] ?? [];
    nextRows[rowIndex][columnIndex] = value;
    onPasteTextChange(formatRowsAsTabularText(nextRows));
  }

  function handleClearTable(action: ModuleDataEntryClearAction) {
    onClearTable(action);
    setFileInputKey((current) => current + 1);
    setIsClearMenuOpen(false);
  }

  useEffect(() => {
    if (!isClearMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (clearMenuRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsClearMenuOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsClearMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isClearMenuOpen]);

  return (
    <>
      <section className="rounded-lg border border-dashed border-skyblue/35 bg-skyblue/6 p-4">
        {!isUploadFormOpen ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-darknavy">
                Import accounting entries
              </p>
              <p className="mt-1 text-xs leading-5 text-darknavy/55">
                Upload Excel/CSV or paste rows when you are ready to import.
              </p>
              {importAttachment ? (
                <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-skyblue/20 bg-skyblue/8 px-3 py-1 text-xs font-semibold text-skyblue">
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  {importAttachment.name}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsUploadFormOpen(true)}
                className="theme-accent-contrast-text inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Upload
              </button>
              <button
                type="button"
                onClick={downloadAccountingImportTemplate}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-skyblue/25 bg-skyblue/8 px-4 text-sm font-semibold text-skyblue transition hover:bg-skyblue/14"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download Template
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <label
              className={joinClasses(
                "app-theme-field-readonly flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition",
                isDragActive
                  ? "border-skyblue bg-skyblue/12"
                  : "hover:border-skyblue/45 hover:bg-skyblue/8",
              )}
              onDragEnter={(event) => {
                event.preventDefault();
                onDragActiveChange(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                onDragActiveChange(true);
              }}
              onDragLeave={(event) => {
                if (event.currentTarget === event.target) {
                  onDragActiveChange(false);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                onDragActiveChange(false);
                handleFiles(event.dataTransfer.files);
              }}
            >
              <Upload className="h-6 w-6 text-skyblue" aria-hidden="true" />
              <span className="mt-3 text-sm font-semibold text-darknavy">
                Drop Excel or CSV here
              </span>
              <span className="mt-1 max-w-md text-xs leading-5 text-darknavy/55">
                Supports .xlsx, .csv, .tsv, and text copied from spreadsheets.
              </span>
              <input
                key={fileInputKey}
                type="file"
                accept=".xlsx,.csv,.tsv,.txt"
                onChange={(event) => handleFiles(event.target.files)}
                className="sr-only"
              />
            </label>

            <div className="grid min-w-0 gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-darknavy">
                  <ClipboardPaste className="h-4 w-4 text-skyblue" aria-hidden="true" />
                  Paste from Excel
                </div>
                {importAttachment ? (
                  <div className="flex min-w-0 items-center gap-2 rounded-full border border-darknavy/10 bg-offwhite/45 px-3 py-1 text-xs font-semibold text-darknavy/60">
                    <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{importAttachment.name}</span>
                    <span className="shrink-0 text-darknavy/40">
                      {importAttachment.sizeLabel}
                    </span>
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={!hasPreviewRows}
                    onClick={() => setIsPreviewDialogOpen(true)}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-skyblue/25 bg-skyblue/8 px-3 text-xs font-semibold text-skyblue transition hover:bg-skyblue/14 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                    View Table
                  </button>
                  <div ref={clearMenuRef} className="relative inline-flex">
                    <button
                      type="button"
                      disabled={!canClearTable}
                      onClick={() => handleClearTable("all")}
                      className="inline-flex h-9 items-center justify-center rounded-l-lg rounded-r-none border border-r-0 border-darknavy/12 bg-white px-3 text-xs font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Clear Table
                    </button>
                    <button
                      type="button"
                      disabled={!canClearTable}
                      onClick={() =>
                        setIsClearMenuOpen((current) => !current)
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-l-none rounded-r-lg border border-darknavy/12 bg-white text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-45"
                      aria-expanded={isClearMenuOpen}
                      aria-haspopup="menu"
                      aria-label="Choose upload clear option"
                    >
                      <ChevronDown
                        className={joinClasses(
                          "h-4 w-4 transition",
                          isClearMenuOpen && "rotate-180",
                        )}
                        aria-hidden="true"
                      />
                    </button>
                    {isClearMenuOpen ? (
                      <div
                        role="menu"
                        className="absolute right-0 top-[calc(100%+0.35rem)] z-[80] w-48 overflow-hidden rounded-lg border border-darknavy/10 bg-white p-1 shadow-[0_18px_45px_rgba(33,39,56,0.16)]"
                      >
                        {ImportClearActions.map((action) => (
                          <button
                            key={action.value}
                            type="button"
                            role="menuitem"
                            onClick={() => handleClearTable(action.value)}
                            className="flex w-full items-center rounded-md px-3 py-2 text-left text-xs font-semibold text-darknavy transition hover:bg-skyblue/10"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={downloadAccountingImportTemplate}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-skyblue/25 bg-skyblue/8 px-3 text-xs font-semibold text-skyblue transition hover:bg-skyblue/14"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUploadFormOpen(false)}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-darknavy/12 bg-white px-3 text-xs font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8"
                  >
                    Hide
                  </button>
                </div>
              </div>
              {hasPreviewRows ? (
                <AccountingImportPreviewTable
                  maxHeightClassName="max-h-40"
                  rows={previewRows}
                  onCellChange={handlePreviewCellChange}
                />
              ) : (
                <textarea
                  value={pasteText}
                  onChange={(event) => onPasteTextChange(event.target.value)}
                  className="app-theme-field min-h-24 resize-y rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-skyblue/45"
                  placeholder={"Account Code\tAccount Name\tParticulars\tTax Rate\tDebit\tCredit"}
                />
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs leading-5 text-darknavy/55">
                  First row may be headers. Columns can be named Account Code, Account
                  Name, Particulars, Tax Rate, Debit, and Credit.
                </p>
                <button
                  type="button"
                  disabled={!pasteText.trim()}
                  onClick={onImportPastedRows}
                  className="theme-accent-contrast-text inline-flex h-10 items-center justify-center rounded-xl bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Import Pasted Rows
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <AccountingImportPreviewDialog
        isOpen={isPreviewDialogOpen}
        rows={previewRows}
        onCellChange={handlePreviewCellChange}
        onClose={() => setIsPreviewDialogOpen(false)}
      />
    </>
  );
}

function AccountingImportPreviewTable({
  maxHeightClassName,
  rows,
  onCellChange,
}: {
  maxHeightClassName: string;
  rows: string[][];
  onCellChange: (rowIndex: number, columnIndex: number, value: string) => void;
}) {
  return (
    <div
      className={joinClasses(
        "app-theme-field overflow-auto rounded-lg border",
        maxHeightClassName,
      )}
    >
      <table className="min-w-[780px] table-fixed border-collapse text-left text-xs text-darknavy">
        <colgroup>
          <col className="w-[9rem]" />
          <col className="w-[13rem]" />
          <col className="w-[20rem]" />
          <col className="w-[7rem]" />
          <col className="w-[9rem]" />
          <col className="w-[9rem]" />
        </colgroup>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={`preview-row-${rowIndex}`}
              className={joinClasses(
                "border-b border-darknavy/10 last:border-b-0",
                rowIndex === 0 ? "bg-skyblue/8 font-semibold" : "",
              )}
            >
              {AccountingImportTemplateHeaders.map((header, columnIndex) => (
                <td
                  key={`${header}-${columnIndex}`}
                  className="border-r border-darknavy/10 last:border-r-0"
                >
                  <input
                    value={row[columnIndex] ?? ""}
                    onChange={(event) =>
                      onCellChange(rowIndex, columnIndex, event.target.value)
                    }
                    className={joinClasses(
                      "h-9 w-full min-w-0 bg-transparent px-2 text-xs outline-none transition focus:bg-skyblue/10",
                      columnIndex >= 4 ? "text-right" : "text-left",
                    )}
                    aria-label={`${header} row ${rowIndex + 1}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccountingImportPreviewDialog({
  isOpen,
  rows,
  onCellChange,
  onClose,
}: {
  isOpen: boolean;
  rows: string[][];
  onCellChange: (rowIndex: number, columnIndex: number, value: string) => void;
  onClose: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[130] flex items-end justify-center bg-slate-950/45 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="accounting-import-preview-title"
        className="flex h-[min(86vh,760px)] w-full max-w-6xl flex-col overflow-hidden rounded-[20px] border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.18)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-darknavy/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-skyblue">
              Import Preview
            </p>
            <h2
              id="accounting-import-preview-title"
              className="mt-1 text-xl font-semibold text-darknavy"
            >
              Accounting Entries Table
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-darknavy/60 transition hover:bg-darknavy/6 hover:text-darknavy"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 px-5 py-5">
          <AccountingImportPreviewTable
            maxHeightClassName="h-full"
            rows={rows}
            onCellChange={onCellChange}
          />
        </div>
        <div className="flex justify-end border-t border-darknavy/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

function AccountingImportDialog({
  canClearTable,
  importAttachment,
  isDragActive,
  isOpen,
  pasteText,
  onClose,
  onDragActiveChange,
  onDropFile,
  onClearTable,
  onImportPastedRows,
  onPasteTextChange,
}: {
  canClearTable: boolean;
  importAttachment: DisbursementVoucherFormValues["attachments"][number] | null;
  isDragActive: boolean;
  isOpen: boolean;
  pasteText: string;
  onClose: () => void;
  onDragActiveChange: (isActive: boolean) => void;
  onDropFile: (file: File) => void;
  onClearTable: (action: ModuleDataEntryClearAction) => void;
  onImportPastedRows: () => void;
  onPasteTextChange: (value: string) => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[130] flex items-end justify-center bg-slate-950/45 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="accounting-import-title"
        className="flex max-h-[min(88vh,680px)] w-full max-w-5xl flex-col overflow-hidden rounded-[20px] border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.18)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-darknavy/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-skyblue">
              Accounting Entries
            </p>
            <h2
              id="accounting-import-title"
              className="mt-1 text-xl font-semibold text-darknavy"
            >
              Import Data Entry Rows
            </h2>
            <p className="mt-1 text-sm text-darknavy/58">
              Upload a spreadsheet or paste copied rows into the data entry grid.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-darknavy/60 transition hover:bg-darknavy/6 hover:text-darknavy"
            aria-label="Close import dialog"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-5 py-5">
          <AccountingImportPanel
            canClearTable={canClearTable}
            importAttachment={importAttachment}
            isDragActive={isDragActive}
            pasteText={pasteText}
            onDragActiveChange={onDragActiveChange}
            onDropFile={onDropFile}
            onClearTable={onClearTable}
            onImportPastedRows={onImportPastedRows}
            onPasteTextChange={onPasteTextChange}
          />
        </div>
        <div className="flex justify-end border-t border-darknavy/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

function ParticularsViewDialog({
  viewedParticulars,
  onClose,
}: {
  viewedParticulars: { rowNo: number; value: string } | null;
  onClose: () => void;
}) {
  if (!viewedParticulars) {
    return null;
  }

  const text = viewedParticulars.value.trim();

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[130] flex items-end justify-center bg-slate-950/45 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="particulars-view-title"
        className="flex max-h-[min(80vh,620px)] w-full max-w-3xl flex-col overflow-hidden rounded-[20px] border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.18)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-darknavy/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-skyblue">
              Particulars
            </p>
            <h2
              id="particulars-view-title"
              className="mt-1 text-xl font-semibold text-darknavy"
            >
              Row {viewedParticulars.rowNo}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-darknavy/60 transition hover:bg-darknavy/6 hover:text-darknavy"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-5 py-5">
          <p className="app-theme-field-readonly whitespace-pre-wrap break-words rounded-lg border p-4 text-sm leading-7">
            {text || "No particulars entered yet."}
          </p>
        </div>
        <div className="flex justify-end border-t border-darknavy/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

function GridPreviewDialog({
  entries,
  isBalanced,
  isOpen,
  selectedTransaction,
  totalCredit,
  totalDebit,
  values,
  variance,
  onClose,
  onContinue,
}: {
  entries: DisbursementLineEntry[];
  isBalanced: boolean;
  isOpen: boolean;
  selectedTransaction?: DisbursementTransactionRecord;
  totalCredit: number;
  totalDebit: number;
  values: DisbursementVoucherFormValues;
  variance: number;
  onClose: () => void;
  onContinue: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/45 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="grid-preview-title"
        className="flex h-[min(100dvh-0.75rem,980px)] w-full max-w-7xl flex-col overflow-hidden rounded-[20px] border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.18)] sm:h-[min(86vh,980px)] sm:rounded-[28px]"
      >
        <div className="border-b border-darknavy/10 px-4 py-4 sm:px-6 sm:py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">
            Edit Disbursement Voucher
          </p>
          <h2
            id="grid-preview-title"
            className="mt-2 text-xl font-semibold text-darknavy sm:text-2xl"
          >
            {values.voucherNo}
          </h2>
          <p className="mt-2 text-sm text-darknavy/58">
            Review the voucher details and accounting entries from grid view
            before continuing to the final save step.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid gap-5">
            <div className="grid items-stretch gap-5 xl:grid-cols-2">
              <PreviewShell
                description="This panel shows the source transaction that the voucher workflow will use."
                eyebrow="Transaction Preview"
                title={
                  selectedTransaction?.payee ??
                  (values.vceName || "Voucher Preview")
                }
              >
                <div className="grid gap-5">
                  <PreviewInfoLine
                    label="Transaction No."
                    value={selectedTransaction?.transactionNo ?? "-"}
                  />
                  <PreviewInfoLine
                    label="Department"
                    value={selectedTransaction?.department ?? "-"}
                  />
                  <PreviewInfoLine
                    label="Requested By"
                    value={selectedTransaction?.requestedBy ?? "-"}
                  />
                  <PreviewInfoLine
                    label="Amount"
                    value={formatCurrency(Number(values.amount || 0))}
                  />
                  <PreviewInfoLine
                    label="Purpose"
                    value={
                      selectedTransaction?.purpose ?? (values.remarks || "-")
                    }
                  />
                </div>
              </PreviewShell>

              <PreviewShell
                description="A linked voucher exists for this transaction and can be reviewed or edited."
                eyebrow="Voucher Status"
                title={values.voucherNo}
              >
                <div className="grid gap-5">
                  <PreviewInfoLine
                    label="Voucher Date"
                    value={formatDateLabel(values.voucherDate)}
                  />
                  <PreviewInfoLine
                    label="Payment Method"
                    value={values.paymentMethod || "-"}
                  />
                  <PreviewInfoLine
                    label="Prepared By"
                    value={values.preparedBy || "-"}
                  />
                  <PreviewInfoLine label="Status" value={values.status || "-"} />
                  <PreviewInfoLine label="Remarks" value={values.remarks || "-"} />

                  <div className="rounded-[18px] border border-darknavy/10 bg-offwhite/45 px-4 py-4 sm:px-5 sm:py-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-darknavy/45">
                      Linked Voucher Amount
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-darknavy">
                      {formatCurrency(Number(values.amount || 0))}
                    </p>
                  </div>
                </div>
              </PreviewShell>
            </div>

            <PreviewShell
              description="Confirm the journal lines, totals, and attachments before the final save."
              eyebrow="Accounting Preview"
              title="Accounting entries review"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm text-darknavy/58">
                  {entries.length} accounting entries prepared.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8"
                >
                  Edit Entries
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-[18px] border border-darknavy/8 bg-offwhite/65 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-darknavy">
                          {entry.accountCode} - {entry.accountName}
                        </p>
                        <p className="mt-1 text-sm text-darknavy/58">
                          {entry.particulars}
                        </p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/40">
                          {entry.taxRate || "0%"}
                        </p>
                      </div>
                      <div className="text-right text-sm font-semibold text-darknavy">
                        <p>
                          {entry.debit > 0
                            ? `DR ${formatCurrency(entry.debit)}`
                            : "-"}
                        </p>
                        <p className="mt-1">
                          {entry.credit > 0
                            ? `CR ${formatCurrency(entry.credit)}`
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <SummaryCard
                  label="Total Debit"
                  value={formatCurrency(totalDebit)}
                />
                <SummaryCard
                  label="Total Credit"
                  value={formatCurrency(totalCredit)}
                />
                <SummaryCard
                  label="Variance"
                  tone={isBalanced ? "balanced" : "warning"}
                  value={formatCurrency(variance)}
                />
              </div>

              <AttachmentPreviewList attachments={values.attachments} />
            </PreviewShell>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-darknavy/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8 sm:w-auto"
          >
            Back to Grid
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="theme-accent-contrast-text inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-skyblue px-5 text-sm font-semibold transition hover:bg-skyblue/85 sm:w-auto"
          >
            Continue to Voucher Preview
          </button>
        </div>
      </section>
    </div>
  );
}

function PreviewShell({
  children,
  description,
  eyebrow,
  title,
}: {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="flex h-full flex-col rounded-xl border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5 lg:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-darknavy/40">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-darknavy sm:text-2xl">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-darknavy/58">{description}</p>
      <div className="mt-5 flex-1">{children}</div>
    </section>
  );
}

function PreviewInfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-darknavy/38">
        {label}
      </dt>
      <dd className="text-sm font-medium text-darknavy">{value}</dd>
    </div>
  );
}

function AttachmentPreviewList({
  attachments,
}: {
  attachments: DisbursementVoucherFormValues["attachments"];
}) {
  const [selectedAttachment, setSelectedAttachment] = useState<
    DisbursementVoucherFormValues["attachments"][number] | null
  >(null);

  return (
    <>
      <div className="mt-5 rounded-[18px] border border-darknavy/10 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/42">
              Attachments
            </p>
            <p className="mt-1 text-xs text-darknavy/50">
              Review supporting files before continuing to voucher preview.
            </p>
          </div>
          <span className="rounded-full border border-darknavy/10 bg-offwhite/45 px-3 py-1 text-xs font-semibold text-darknavy/55">
            {attachments.length} file{attachments.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-3 grid gap-3">
          {attachments.length > 0 ? (
            attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex flex-col gap-3 rounded-xl border border-darknavy/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-darknavy/8 text-darknavy">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-darknavy">
                      {attachment.name}
                    </p>
                    <p className="mt-1 text-xs text-darknavy/50">
                      {attachment.sizeLabel}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAttachment(attachment)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-skyblue/25 bg-skyblue/8 px-3 text-xs font-semibold text-skyblue transition hover:bg-skyblue/14"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  View
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-darknavy/16 bg-offwhite/45 px-4 py-8 text-center text-sm text-darknavy/55">
              No attachments are linked to this voucher yet.
            </div>
          )}
        </div>
      </div>

      <AttachmentDetailsDialog
        attachment={selectedAttachment}
        onClose={() => setSelectedAttachment(null)}
      />
    </>
  );
}

function AttachmentDetailsDialog({
  attachment,
  onClose,
}: {
  attachment: DisbursementVoucherFormValues["attachments"][number] | null;
  onClose: () => void;
}) {
  if (!attachment) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[150] flex items-end justify-center bg-slate-950/45 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="attachment-details-title"
        className="flex w-full max-w-xl flex-col overflow-hidden rounded-[20px] border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.18)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-darknavy/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-skyblue">
              Attachment
            </p>
            <h2
              id="attachment-details-title"
              className="mt-1 text-xl font-semibold text-darknavy"
            >
              File Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-darknavy/60 transition hover:bg-darknavy/6 hover:text-darknavy"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="grid gap-4 px-5 py-5">
          <div className="flex items-center gap-3 rounded-xl border border-darknavy/10 bg-offwhite/45 px-4 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-darknavy/8 text-darknavy">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-darknavy">
                {attachment.name}
              </p>
              <p className="mt-1 text-xs text-darknavy/55">
                {attachment.sizeLabel}
              </p>
            </div>
          </div>
          <p className="rounded-xl border border-darknavy/10 bg-white px-4 py-3 text-sm leading-6 text-darknavy/60">
            This preview shows the attachment record linked to the voucher. File
            opening/downloading can be connected once real attachment storage is
            available.
          </p>
        </div>
        <div className="flex justify-end border-t border-darknavy/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  tone = "default",
  value,
}: {
  label: string;
  tone?: "balanced" | "default" | "warning";
  value: string;
}) {
  return (
    <div
      className={`rounded-[18px] border px-4 py-4 ${
        tone === "balanced"
          ? "border-citron/35 bg-citron/15"
          : tone === "warning"
            ? "border-coralpink/18 bg-coralpink/8"
            : "border-darknavy/10 bg-offwhite/35"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-darknavy/45">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-darknavy">{value}</p>
    </div>
  );
}

function GridEntryInput({
  extraClassName,
  onChange,
  type = "text",
  value,
}: {
  extraClassName?: string;
  onChange: (value: string) => void;
  type?: "number" | "text";
  value: string;
}) {
  return (
    <input
      type={type}
      min={type === "number" ? "0" : undefined}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={gridCellControlClassName(extraClassName)}
    />
  );
}

function gridCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35",
    extraClassName,
  );
}

function createInitialRows(entries: DisbursementLineEntry[]) {
  const mappedRows = entries.map(mapEntryToEditableRow);

  if (mappedRows.length >= 6) {
    return mappedRows;
  }

  return [
    ...mappedRows,
    ...Array.from({ length: 6 - mappedRows.length }, createBlankEditableRow),
  ];
}

function mapEntryToEditableRow(entry: DisbursementLineEntry): EditableGridRow {
  return {
    accountCode: entry.accountCode,
    accountName: entry.accountName,
    credit: entry.credit > 0 ? entry.credit.toFixed(2) : "",
    debit: entry.debit > 0 ? entry.debit.toFixed(2) : "",
    id: entry.id,
    particulars: entry.particulars,
    taxDetails: entry.taxDetails,
    taxRate: entry.taxRate || "0%",
  };
}

function createBlankEditableRow(): EditableGridRow {
  return {
    accountCode: "",
    accountName: "",
    credit: "",
    debit: "",
    id: createGridRowId(),
    particulars: "",
    taxDetails: createTaxDetails(0, "0%"),
    taxRate: "0%",
  };
}

function createGridRowId() {
  return `grid-${Math.random().toString(36).slice(2, 10)}`;
}

function isGridColumnId(columnId: string): columnId is GridColumnId {
  return DefaultGridColumnOrder.includes(columnId as GridColumnId);
}

function createImportSourceAttachment(name: string, size: number) {
  return {
    id: `accounting-import-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    sizeLabel: formatImportSourceSize(size),
  };
}

function withAccountingImportAttachment(
  values: DisbursementVoucherFormValues,
  attachment: DisbursementVoucherFormValues["attachments"][number] | null,
) {
  if (!attachment) {
    return values;
  }

  const existingAttachments = values.attachments.filter(
    (currentAttachment) =>
      currentAttachment.id !== attachment.id &&
      currentAttachment.name !== attachment.name,
  );

  return {
    ...values,
    attachments: [...existingAttachments, attachment],
  };
}

function formatImportSourceSize(size: number) {
  if (size < 1024) {
    return `${Math.max(size, 1)} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function downloadAccountingImportTemplate() {
  const workbookBytes = createAccountingImportTemplateWorkbook();
  const templateBlob = new Blob([workbookBytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const downloadUrl = URL.createObjectURL(templateBlob);
  const anchor = document.createElement("a");

  anchor.href = downloadUrl;
  anchor.download = "disbursement-voucher-accounting-template.xlsx";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
}

function createAccountingImportTemplateWorkbook() {
  const rows = [AccountingImportTemplateHeaders, ...AccountingImportTemplateRows];
  const worksheetXml = createAccountingTemplateWorksheetXml(rows);

  return createStoredZipArchive([
    {
      name: "[Content_Types].xml",
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        "</Types>",
    },
    {
      name: "_rels/.rels",
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        "</Relationships>",
    },
    {
      name: "xl/workbook.xml",
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        "<sheets><sheet name=\"Accounting Entries\" sheetId=\"1\" r:id=\"rId1\"/></sheets>" +
        "</workbook>",
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        "</Relationships>",
    },
    {
      name: "xl/worksheets/sheet1.xml",
      text: worksheetXml,
    },
  ]);
}

function createAccountingTemplateWorksheetXml(rows: string[][]) {
  const rowXml = rows
    .map((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      const cellXml = row
        .map((cell, columnIndex) => {
          const reference = `${getExcelColumnLetters(columnIndex)}${rowNumber}`;

          return (
            `<c r="${reference}" t="inlineStr">` +
            `<is><t>${escapeXmlText(cell)}</t></is>` +
            "</c>"
          );
        })
        .join("");

      return `<row r="${rowNumber}">${cellXml}</row>`;
    })
    .join("");

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    "<sheetData>" +
    rowXml +
    "</sheetData>" +
    "</worksheet>"
  );
}

function getExcelColumnLetters(columnIndex: number) {
  let columnNumber = columnIndex + 1;
  let letters = "";

  while (columnNumber > 0) {
    const remainder = (columnNumber - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    columnNumber = Math.floor((columnNumber - 1) / 26);
  }

  return letters;
}

function escapeXmlText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function createStoredZipArchive(files: { name: string; text: string }[]) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.text);
    const crc = calculateCrc32(dataBytes);
    const localHeader = createZipLocalHeader(nameBytes, dataBytes, crc);
    const centralHeader = createZipCentralHeader(
      nameBytes,
      dataBytes,
      crc,
      offset,
    );

    localParts.push(localHeader, dataBytes);
    centralParts.push(centralHeader);
    offset += localHeader.byteLength + dataBytes.byteLength;
  });

  const centralDirectoryOffset = offset;
  const centralDirectorySize = centralParts.reduce(
    (sum, part) => sum + part.byteLength,
    0,
  );
  const endRecord = createZipEndRecord(
    files.length,
    centralDirectorySize,
    centralDirectoryOffset,
  );

  return concatBytes([...localParts, ...centralParts, endRecord]);
}

function createZipLocalHeader(
  nameBytes: Uint8Array,
  dataBytes: Uint8Array,
  crc: number,
) {
  const header = new Uint8Array(30 + nameBytes.byteLength);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, dataBytes.byteLength, true);
  view.setUint32(22, dataBytes.byteLength, true);
  view.setUint16(26, nameBytes.byteLength, true);
  view.setUint16(28, 0, true);
  header.set(nameBytes, 30);

  return header;
}

function createZipCentralHeader(
  nameBytes: Uint8Array,
  dataBytes: Uint8Array,
  crc: number,
  localHeaderOffset: number,
) {
  const header = new Uint8Array(46 + nameBytes.byteLength);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, dataBytes.byteLength, true);
  view.setUint32(24, dataBytes.byteLength, true);
  view.setUint16(28, nameBytes.byteLength, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, localHeaderOffset, true);
  header.set(nameBytes, 46);

  return header;
}

function createZipEndRecord(
  fileCount: number,
  centralDirectorySize: number,
  centralDirectoryOffset: number,
) {
  const header = new Uint8Array(22);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, fileCount, true);
  view.setUint16(10, fileCount, true);
  view.setUint32(12, centralDirectorySize, true);
  view.setUint32(16, centralDirectoryOffset, true);
  view.setUint16(20, 0, true);

  return header;
}

function concatBytes(parts: Uint8Array[]) {
  const totalLength = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;

  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.byteLength;
  });

  return output;
}

function calculateCrc32(bytes: Uint8Array) {
  let crc = 0xffffffff;

  bytes.forEach((byte) => {
    crc ^= byte;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  });

  return (crc ^ 0xffffffff) >>> 0;
}

async function readAccountingImportFilePreviewText(file: File) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".xlsx")) {
    const rows = await readXlsxAccountingRawRows(await file.arrayBuffer());

    return formatRowsAsTabularText(rows);
  }

  if (
    fileName.endsWith(".csv") ||
    fileName.endsWith(".tsv") ||
    fileName.endsWith(".txt")
  ) {
    return (await file.text()).trim();
  }

  throw new Error("Please upload an .xlsx, .csv, .tsv, or .txt file.");
}

function parseImportPreviewRows(text: string) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return [];
  }

  const delimiter = trimmedText.includes("\t") ? "\t" : ",";
  const rows =
    delimiter === "\t"
      ? trimmedText
          .split(/\r?\n/)
          .map((line) => line.split("\t").map((cell) => cell.trim()))
      : parseCsvRows(trimmedText);

  return rows
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
    .map((row) =>
      AccountingImportTemplateHeaders.map((_, index) =>
        String(row[index] ?? "").trim(),
      ),
    );
}

function clearImportPreviewText(
  text: string,
  action: ModuleDataEntryClearAction,
) {
  if (action === "all") {
    return "";
  }

  const rows = parseImportPreviewRows(text);
  const hasHeader = rows[0] ? Boolean(getImportHeaderIndexes(rows[0])) : false;
  const headerRows = hasHeader ? rows.slice(0, 1) : [];
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const remainingRows = dataRows.filter((row) => {
    const hasData = hasImportPreviewRowData(row);
    const isIncomplete = hasData && !isCompleteImportPreviewRow(row);

    if (action === "with-data") {
      return !hasData;
    }

    if (action === "incomplete") {
      return !isIncomplete;
    }

    return hasData;
  });
  const nextRows = [...headerRows, ...remainingRows];

  if (nextRows.length === 0 || (hasHeader && nextRows.length === 1)) {
    return "";
  }

  return formatRowsAsTabularText(nextRows);
}

function hasImportPreviewRowData(row: string[]) {
  return row.some((cell) => String(cell ?? "").trim() !== "");
}

function isCompleteImportPreviewRow(row: string[]) {
  const debit = normalizeImportedAmount(row[4] ?? "");
  const credit = normalizeImportedAmount(row[5] ?? "");

  return Boolean(
    String(row[0] ?? "").trim() &&
      String(row[1] ?? "").trim() &&
      String(row[2] ?? "").trim() &&
      (debit || credit),
  );
}

function parseTabularText(text: string) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error("No pasted accounting rows were found.");
  }

  const delimiter = trimmedText.includes("\t") ? "\t" : ",";
  const rawRows =
    delimiter === "\t"
      ? trimmedText
          .split(/\r?\n/)
          .map((line) => line.split("\t").map((cell) => cell.trim()))
      : parseCsvRows(trimmedText);

  return mapImportedRows(rawRows);
}

async function readXlsxAccountingRawRows(buffer: ArrayBuffer) {
  const entries = await readZipEntries(buffer);
  const sharedStrings = parseSharedStrings(entries.get("xl/sharedStrings.xml"));
  const sheetPath = findFirstWorksheetPath(entries);
  const sheetXml = entries.get(sheetPath);

  if (!sheetXml) {
    throw new Error("No worksheet was found in the Excel file.");
  }

  const documentNode = new DOMParser().parseFromString(sheetXml, "text/xml");
  const rows = Array.from(documentNode.getElementsByTagName("row")).map((row) => {
    const cells: string[] = [];

    Array.from(row.getElementsByTagName("c")).forEach((cell) => {
      const reference = cell.getAttribute("r") ?? "";
      const columnIndex = getExcelColumnIndex(reference);
      const cellType = cell.getAttribute("t");
      const rawValue =
        cellType === "inlineStr"
          ? Array.from(cell.getElementsByTagName("t"))
              .map((node) => node.textContent ?? "")
              .join("")
          : (cell.getElementsByTagName("v")[0]?.textContent ?? "");
      const value =
        cellType === "s" ? (sharedStrings[Number(rawValue)] ?? "") : rawValue;

      if (columnIndex >= 0) {
        cells[columnIndex] = value.trim();
      }
    });

    return cells;
  });

  return rows;
}

function formatRowsAsTabularText(rows: string[][]) {
  return rows
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
    .map((row) => row.map(formatTabularCell).join("\t"))
    .join("\n");
}

function formatTabularCell(value: string) {
  return String(value ?? "")
    .replace(/\r?\n/g, " ")
    .trim();
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

    if ((char === "\n" || char === "\r") && !isQuoted) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

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

function mapImportedRows(rawRows: string[][]) {
  const rows = rawRows.filter((row) =>
    row.some((cell) => String(cell ?? "").trim() !== ""),
  );

  if (rows.length === 0) {
    throw new Error("No accounting rows were found to import.");
  }

  const headerIndexes = getImportHeaderIndexes(rows[0]);
  const dataRows = headerIndexes ? rows.slice(1) : rows;
  const indexes = headerIndexes ?? {
    accountCode: 0,
    accountName: 1,
    particulars: 2,
    taxRate: 3,
    debit: 4,
    credit: 5,
  };
  const importedRows = dataRows
    .map((row) => createImportedGridRow(row, indexes))
    .filter(hasRowData);

  if (importedRows.length === 0) {
    throw new Error("The imported file did not contain usable accounting rows.");
  }

  return importedRows;
}

function getImportHeaderIndexes(row: string[]) {
  const indexes: Partial<Record<GridColumnId, number>> = {};

  row.forEach((cell, index) => {
    const key = normalizeImportHeader(cell);

    if (key) {
      indexes[key] = index;
    }
  });

  return Object.keys(indexes).length >= 2
    ? (indexes as Partial<Record<GridColumnId, number>>)
    : null;
}

function normalizeImportHeader(value: string): GridColumnId | null {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (["accountcode", "acctcode", "code", "glcode"].includes(normalized)) {
    return "accountCode";
  }

  if (["accountname", "acctname", "name", "glname"].includes(normalized)) {
    return "accountName";
  }

  if (
    ["particulars", "particular", "description", "remarks", "memo"].includes(
      normalized,
    )
  ) {
    return "particulars";
  }

  if (["taxrate", "tax", "vat", "vatrate"].includes(normalized)) {
    return "taxRate";
  }

  if (["debit", "dr"].includes(normalized)) {
    return "debit";
  }

  if (["credit", "cr"].includes(normalized)) {
    return "credit";
  }

  return null;
}

function createImportedGridRow(
  row: string[],
  indexes: Partial<Record<GridColumnId, number>>,
): EditableGridRow {
  const taxRate = normalizeTaxRate(getImportedValue(row, indexes.taxRate));
  const debit = normalizeImportedAmount(getImportedValue(row, indexes.debit));
  const credit = normalizeImportedAmount(getImportedValue(row, indexes.credit));
  const amount = normalizeAmount(debit) || normalizeAmount(credit);

  return {
    accountCode: getImportedValue(row, indexes.accountCode),
    accountName: getImportedValue(row, indexes.accountName),
    credit,
    debit,
    id: createGridRowId(),
    particulars: getImportedValue(row, indexes.particulars),
    taxDetails: createTaxDetails(amount, taxRate),
    taxRate,
  };
}

function getImportedValue(row: string[], index?: number) {
  return typeof index === "number" ? String(row[index] ?? "").trim() : "";
}

function normalizeImportedAmount(value: string) {
  const normalized = value.replace(/[₱,$\s]/g, "").replace(/,/g, "");
  const amount = Number(normalized || 0);

  return Number.isFinite(amount) && amount > 0 ? amount.toFixed(2) : "";
}

function normalizeTaxRate(value: string) {
  if (!value.trim()) {
    return "0%";
  }

  const percent = Number.parseFloat(value.replace(/[^0-9.]/g, ""));

  return Number.isFinite(percent) ? `${percent}%` : value.trim();
}

async function readZipEntries(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  const entries = new Map<string, string>();
  const eocdOffset = findEndOfCentralDirectory(view);
  const entryCount = view.getUint16(eocdOffset + 10, true);
  let centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);
  const decoder = new TextDecoder();

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(centralDirectoryOffset, true) !== 0x02014b50) {
      break;
    }

    const compressionMethod = view.getUint16(centralDirectoryOffset + 10, true);
    const compressedSize = view.getUint32(centralDirectoryOffset + 20, true);
    const fileNameLength = view.getUint16(centralDirectoryOffset + 28, true);
    const extraLength = view.getUint16(centralDirectoryOffset + 30, true);
    const commentLength = view.getUint16(centralDirectoryOffset + 32, true);
    const localHeaderOffset = view.getUint32(centralDirectoryOffset + 42, true);
    const fileNameBytes = new Uint8Array(
      buffer,
      centralDirectoryOffset + 46,
      fileNameLength,
    );
    const fileName = decoder.decode(fileNameBytes);
    const localFileNameLength = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
    const dataOffset =
      localHeaderOffset + 30 + localFileNameLength + localExtraLength;
    const compressedBytes = buffer.slice(dataOffset, dataOffset + compressedSize);
    const fileText =
      compressionMethod === 0
        ? decoder.decode(compressedBytes)
        : compressionMethod === 8
          ? decoder.decode(await inflateRaw(compressedBytes))
          : "";

    if (fileText) {
      entries.set(fileName, fileText);
    }

    centralDirectoryOffset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function findEndOfCentralDirectory(view: DataView) {
  const minimumOffset = Math.max(0, view.byteLength - 66000);

  for (let offset = view.byteLength - 22; offset >= minimumOffset; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      return offset;
    }
  }

  throw new Error("The Excel file could not be read.");
}

async function inflateRaw(compressedBytes: ArrayBuffer) {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("This browser cannot read compressed Excel files.");
  }

  const stream = new Blob([compressedBytes])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));

  return new Response(stream).arrayBuffer();
}

function parseSharedStrings(xml?: string) {
  if (!xml) {
    return [];
  }

  const documentNode = new DOMParser().parseFromString(xml, "text/xml");

  return Array.from(documentNode.getElementsByTagName("si")).map((item) =>
    Array.from(item.getElementsByTagName("t"))
      .map((node) => node.textContent ?? "")
      .join(""),
  );
}

function findFirstWorksheetPath(entries: Map<string, string>) {
  if (entries.has("xl/worksheets/sheet1.xml")) {
    return "xl/worksheets/sheet1.xml";
  }

  const worksheetPath = Array.from(entries.keys()).find(
    (path) => path.startsWith("xl/worksheets/") && path.endsWith(".xml"),
  );

  if (!worksheetPath) {
    throw new Error("No worksheet was found in the Excel file.");
  }

  return worksheetPath;
}

function getExcelColumnIndex(reference: string) {
  const columnLetters = reference.match(/[A-Z]+/i)?.[0]?.toUpperCase() ?? "";

  if (!columnLetters) {
    return -1;
  }

  return (
    columnLetters.split("").reduce((sum, letter) => {
      return sum * 26 + letter.charCodeAt(0) - 64;
    }, 0) - 1
  );
}

function hasRowValue(row: EditableGridRow) {
  return Boolean(
    row.accountCode.trim() ||
      row.accountName.trim() ||
      row.particulars.trim() ||
      normalizeAmount(row.debit) > 0 ||
      normalizeAmount(row.credit) > 0,
  );
}

function shouldClearRow(
  row: EditableGridRow,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  if (action === "with-data") {
    return hasRowData(row);
  }

  if (action === "incomplete") {
    return hasRowData(row) && !isCompleteRow(row);
  }

  return !hasRowData(row);
}

function hasRowData(row: EditableGridRow) {
  return (
    row.accountCode.trim() !== "" ||
    row.accountName.trim() !== "" ||
    row.particulars.trim() !== "" ||
    normalizeAmount(row.debit) > 0 ||
    normalizeAmount(row.credit) > 0 ||
    row.taxRate !== "0%"
  );
}

function isCompleteRow(row: EditableGridRow) {
  return (
    row.accountCode.trim() !== "" &&
    row.accountName.trim() !== "" &&
    row.particulars.trim() !== "" &&
    (normalizeAmount(row.debit) > 0 || normalizeAmount(row.credit) > 0)
  );
}

function normalizeAmount(value: string) {
  return Number(value || 0) || 0;
}

function getExportCellValue(row: EditableGridRow, columnId: GridColumnId) {
  return row[columnId];
}

function escapeCsvCell(value: string) {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function downloadTextFile(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function buildLineEntries(rows: EditableGridRow[]): DisbursementLineEntry[] {
  return rows.filter(hasRowValue).map((row) => {
    const debit = normalizeAmount(row.debit);
    const credit = normalizeAmount(row.credit);
    const amount = debit || credit;

    return {
      accountCode: row.accountCode.trim(),
      accountName: row.accountName.trim(),
      credit,
      debit,
      id: row.id,
      particulars: row.particulars.trim(),
      status: "Pending",
      taxDetails: syncTaxDetailsAmount(row.taxDetails, amount, row.taxRate),
      taxRate: row.taxRate || "0%",
    };
  });
}
