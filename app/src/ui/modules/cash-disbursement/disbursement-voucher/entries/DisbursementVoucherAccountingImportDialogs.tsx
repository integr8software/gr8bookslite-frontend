"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, ClipboardPaste, Download, FileText, LayoutGrid, Upload, X } from "lucide-react";
import {
  DisbursementAccountingImportClearActions,
  DisbursementAccountingImportTemplateHeaders,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryConstants";
import type { DisbursementAttachment as VoucherAttachment } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { type ModuleDataEntryClearAction } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { downloadAccountingImportTemplate } from "@/app/src/services/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingExportService";
import {
  formatRowsAsTabularText,
  parseImportPreviewRows,
} from "@/app/src/services/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingImportService";

export function AccountingImportPanel({
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
  importAttachment: VoucherAttachment | null;
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

  function handlePreviewCellChange(rowIndex: number, columnIndex: number, value: string) {
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
              <p className="text-sm font-semibold text-darknavy">Import accounting entries</p>
              <p className="mt-1 text-xs leading-5 text-darknavy/55">Upload Excel/CSV or paste rows when you are ready to import.</p>
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
              htmlFor="disbursement-voucher-accounting-import-file"
              className={joinClasses(
                "app-theme-field-readonly flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition",
                isDragActive ? "border-skyblue bg-skyblue/12" : "hover:border-skyblue/45 hover:bg-skyblue/8",
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
              <span className="mt-3 text-sm font-semibold text-darknavy">Drop Excel or CSV here</span>
              <span className="mt-1 max-w-md text-xs leading-5 text-darknavy/55">
                Supports .xlsx, .csv, .tsv, and text copied from spreadsheets.
              </span>
              <input
                id="disbursement-voucher-accounting-import-file"
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
                    <span className="shrink-0 text-darknavy/40">{importAttachment.sizeLabel}</span>
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
                      onClick={() => setIsClearMenuOpen((current) => !current)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-l-none rounded-r-lg border border-darknavy/12 bg-white text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-45"
                      aria-expanded={isClearMenuOpen}
                      aria-haspopup="menu"
                      aria-label="Choose upload clear option"
                    >
                      <ChevronDown className={joinClasses("h-4 w-4 transition", isClearMenuOpen && "rotate-180")} aria-hidden="true" />
                    </button>
                    {isClearMenuOpen ? (
                      <div
                        role="menu"
                        className="absolute right-0 top-[calc(100%+0.35rem)] z-[80] w-48 overflow-hidden rounded-lg border border-darknavy/10 bg-white p-1 shadow-[0_18px_45px_rgba(33,39,56,0.16)]"
                      >
                        {DisbursementAccountingImportClearActions.map((action) => (
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
                <AccountingImportPreviewTable maxHeightClassName="max-h-40" rows={previewRows} onCellChange={handlePreviewCellChange} />
              ) : (
                <>
                  <label htmlFor="disbursement-voucher-accounting-import-paste" className="sr-only">Paste accounting rows from Excel</label>
                  <textarea
                    id="disbursement-voucher-accounting-import-paste"
                    value={pasteText}
                    onChange={(event) => onPasteTextChange(event.target.value)}
                    className="app-theme-field min-h-24 resize-y rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-skyblue/45"
                    placeholder={"Account Code\tAccount Name\tRemarks\tTax Rate\tDebit\tCredit"}
                  />
                </>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs leading-5 text-darknavy/55">
                  First row may be headers. Columns can be named Account Code, Account Name, Remarks, Tax Rate, Debit, and Credit.
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
  const tableId = useId();

  return (
    <div className={joinClasses("app-theme-field overflow-auto rounded-lg border", maxHeightClassName)}>
      <table className="min-w-[680px] table-fixed border-collapse text-left text-xs text-darknavy">
        <colgroup>
          <col className="w-[7.5rem]" />
          <col className="w-[10rem]" />
          <col className="w-[14rem]" />
          <col className="w-[6rem]" />
          <col className="w-[7.5rem]" />
          <col className="w-[7.5rem]" />
        </colgroup>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={`preview-row-${rowIndex}`}
              className={joinClasses("border-b border-darknavy/10 last:border-b-0", rowIndex === 0 ? "bg-skyblue/8 font-semibold" : "")}
            >
              {DisbursementAccountingImportTemplateHeaders.map((header, columnIndex) => (
                <td key={`${header}-${columnIndex}`} className="border-r border-darknavy/10 last:border-r-0">
                  <label htmlFor={`${tableId}-${rowIndex}-${columnIndex}`} className="sr-only">{`${header} row ${rowIndex + 1}`}</label>
                  <input
                    id={`${tableId}-${rowIndex}-${columnIndex}`}
                    value={row[columnIndex] ?? ""}
                    onChange={(event) => onCellChange(rowIndex, columnIndex, event.target.value)}
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-skyblue">Import Preview</p>
            <h2 id="accounting-import-preview-title" className="mt-1 text-xl font-semibold text-darknavy">
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
          <AccountingImportPreviewTable maxHeightClassName="h-full" rows={rows} onCellChange={onCellChange} />
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

export function AccountingImportDialog({
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
  importAttachment: VoucherAttachment | null;
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-skyblue">Accounting Entries</p>
            <h2 id="accounting-import-title" className="mt-1 text-xl font-semibold text-darknavy">
              Import Data Entry Rows
            </h2>
            <p className="mt-1 text-sm text-darknavy/58">Upload a spreadsheet or paste copied rows into the data entry grid.</p>
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
