"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Download,
  LoaderCircle,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { AppMaxFileUploadSizeLabel } from "@/app/src/constants/shared/app/AppConstants";
import {
  AccountStatuses,
  AccountTypeLabels,
  AccountTypes,
  NormalBalanceLabels,
  NormalBalances,
} from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import type {
  AccountStatus,
  AccountType,
  ChartAccount,
  ChartAccountFormValues,
  NormalBalance,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import { ClickOrDragDropFile } from "@/app/src/ui/shared/module/ClickOrDragDropFile";
import { ModuleImportDialog } from "@/app/src/ui/shared/module/ModuleImportDialog";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ImportColumnId =
  | "parentAccountNumber"
  | "accountName"
  | "accountType"
  | "normalBalance"
  | "statementSection"
  | "reportAlias"
  | "description"
  | "showInReports"
  | "isPostingAccount"
  | "status";

type ImportPreviewRow = {
  id: string;
  rowNumber: number;
  values: Record<ImportColumnId, string>;
  errors: Partial<Record<ImportColumnId, string[]>>;
};

const ImportHeaders: Array<{ id: ImportColumnId; label: string }> = [
  { id: "parentAccountNumber", label: "Parent Account Number" },
  { id: "accountName", label: "Account Name" },
  { id: "accountType", label: "Account Type" },
  { id: "normalBalance", label: "Account Nature" },
  { id: "statementSection", label: "Statement Section" },
  { id: "reportAlias", label: "Report Alias" },
  { id: "description", label: "Description" },
  { id: "showInReports", label: "Show In Reports" },
  { id: "isPostingAccount", label: "Posting Account" },
  { id: "status", label: "Status" },
];

const PreviewPageSize = 10;
const ImportBatchSize = 25;
const MaxFileSizeBytes = 10 * 1024 * 1024;

export function ChartsOfAccountsImportDialog({
  accounts,
  isOpen,
  onClose,
  onImportAccounts,
}: {
  accounts: ChartAccount[];
  isOpen: boolean;
  onClose: () => void;
  onImportAccounts: (accounts: ChartAccountFormValues[]) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [page, setPage] = useState(1);
  const parentByNumber = useMemo(
    () => new Map(accounts.map((account) => [account.accountNumber, account])),
    [accounts],
  );
  const validatedRows = useMemo(
    () => validateRows(previewRows, parentByNumber),
    [parentByNumber, previewRows],
  );
  const validRows = validatedRows.filter((row) => !rowHasErrors(row));
  const totalPages = Math.max(1, Math.ceil(validatedRows.length / PreviewPageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRows = validatedRows.slice(
    (safePage - 1) * PreviewPageSize,
    safePage * PreviewPageSize,
  );

  function reset() {
    if (isImporting) return;
    setError(null);
    setPreviewRows([]);
    setSelectedIds(new Set());
    setPage(1);
  }

  function addBlankRow() {
    setPreviewRows((rows) => [...rows, createBlankRow(rows.length + 1)]);
    setPage(Math.max(1, Math.ceil((previewRows.length + 1) / PreviewPageSize)));
  }

  function updateCell(rowId: string, field: ImportColumnId, value: string) {
    setPreviewRows((rows) =>
      rows.map((row) =>
        row.id === rowId
          ? { ...row, values: { ...row.values, [field]: value } }
          : row,
      ),
    );
  }

  async function handleFile(file: File | undefined) {
    if (!file || isImporting) return;
    if (file.size <= 0) {
      setError("The selected file is empty.");
      return;
    }
    if (file.size > MaxFileSizeBytes) {
      setError(`Upload a file up to ${AppMaxFileUploadSizeLabel}.`);
      return;
    }

    setIsParsing(true);
    try {
      appendText(await readImportFileText(file));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not read the imported chart accounts.",
      );
    } finally {
      setIsParsing(false);
    }
  }

  function appendText(text: string) {
    const nextRows = parseImportText(text, previewRows.length + 1);
    setPreviewRows((rows) => renumberRows([...rows, ...nextRows]));
    setSelectedIds(new Set());
    setError(null);
    setPage(Math.max(1, Math.ceil((previewRows.length + nextRows.length) / PreviewPageSize)));
  }

  async function handleImport() {
    const selectedRows = validRows.filter((row) => selectedIds.has(row.id));
    const rowsToImport = selectedRows.length > 0 ? selectedRows : validRows;

    if (rowsToImport.length === 0) {
      setError("Fix at least one row before importing.");
      return;
    }

    setIsImporting(true);
    setError(null);
    try {
      for (let index = 0; index < rowsToImport.length; index += ImportBatchSize) {
        const batch = rowsToImport
          .slice(index, index + ImportBatchSize)
          .map((row) => createImportValues(row, parentByNumber));
        await onImportAccounts(batch);
      }
      toast.success(`${rowsToImport.length} chart account${rowsToImport.length === 1 ? "" : "s"} imported.`);
      const importedIds = new Set(rowsToImport.map((row) => row.id));
      setPreviewRows((rows) => renumberRows(rows.filter((row) => !importedIds.has(row.id))));
      setSelectedIds(new Set());
      if (rowsToImport.length === previewRows.length) {
        reset();
        onClose();
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not import chart accounts.",
      );
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <ModuleImportDialog
      isOpen={isOpen}
      isBusy={isImporting}
      title="Import Data"
      titleId="charts-of-accounts-import-title"
      description="Upload, validate, edit, and import chart accounts in queued batches."
      onClose={onClose}
      actions={
        <div className="grid gap-3 lg:grid-cols-[minmax(18rem,1fr)_auto]">
          <ClickOrDragDropFile
            accept=".xlsx,.csv,.tsv,.txt"
            acceptedFileLabel=".xlsx, .csv, .tsv, .txt"
            disabled={isImporting}
            isBusy={isParsing}
            label="Upload or Drag and Drop Files"
            size="medium"
            stackable
            onFileSelect={(file) => void handleFile(file)}
          />
          <div className="grid grid-cols-2 gap-2 lg:flex lg:items-start lg:justify-end">
            <button type="button" className={secondaryButtonClassName} onClick={() => void downloadTemplate()}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Template
            </button>
            <button type="button" className={secondaryButtonClassName} onClick={addBlankRow}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Row
            </button>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-darknavy/55 lg:col-span-2">
            <span>Rows: {validatedRows.length}</span>
            <span>Valid: {validRows.length}</span>
            <span>Incorrect: {validatedRows.length - validRows.length}</span>
          </div>
        </div>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-[auto_minmax(0,1fr)_auto_auto] lg:items-center">
          <button type="button" onClick={reset} disabled={isImporting} className={footerButtonClassName}>
            Reset
          </button>
          <div className="hidden lg:block" />
          <button type="button" onClick={onClose} disabled={isImporting} className={footerButtonClassName}>
            Cancel
          </button>
          <button type="button" onClick={() => void handleImport()} disabled={isImporting || validRows.length === 0} className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold text-white transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:opacity-55 lg:col-span-1 lg:h-10">
            {isImporting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
            {selectedIds.size > 0 ? "Import Selected" : "Import Valid"}
          </button>
        </div>
      }
    >
      <div className="flex h-full min-h-0 flex-col gap-3">
        {error ? (
          <div className="flex gap-2 rounded-md border border-coralpink/25 bg-coralpink/8 px-3 py-2 text-sm font-medium text-coralpink">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}
        <div
          tabIndex={0}
          onPaste={(event) => {
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
            const text = event.clipboardData.getData("text");
            if (text.trim()) {
              event.preventDefault();
              appendText(text);
            }
          }}
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-darknavy/10 outline-none focus:ring-2 focus:ring-skyblue/15"
        >
          <div className="min-h-36 flex-1 overflow-auto">
            <table className="min-w-[92rem] table-fixed text-left text-sm text-darknavy">
              <thead className="text-xs uppercase text-darknavy/55">
                <tr>
                  <th className="sticky left-0 top-0 z-30 w-16 bg-slate-50 px-2 py-2">Row</th>
                  {ImportHeaders.map((header) => (
                    <th key={header.id} className="sticky top-0 bg-slate-50 px-3 py-2">
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-darknavy/8 bg-white">
                {visibleRows.length > 0 ? (
                  visibleRows.map((row) => (
                    <tr key={row.id} className={rowHasErrors(row) ? "bg-coralpink/[0.025]" : undefined}>
                      <td className="sticky left-0 z-10 bg-inherit px-2 py-2 font-semibold">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(row.id)}
                            onChange={(event) => {
                              setSelectedIds((current) => {
                                const next = new Set(current);
                                if (event.target.checked) next.add(row.id);
                                else next.delete(row.id);
                                return next;
                              });
                            }}
                            className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
                          />
                          {row.rowNumber}
                        </label>
                      </td>
                      {ImportHeaders.map((header) => (
                        <td key={header.id} className="px-3 py-2 align-top">
                          <ImportCell
                            field={header.id}
                            row={row}
                            onChange={(value) => updateCell(row.id, header.id, value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={ImportHeaders.length + 1} className="px-3 py-10 text-center text-sm font-medium text-darknavy/45">
                      Upload a file, or focus here and paste copied Excel rows.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-darknavy/10 px-3 py-2 text-xs font-semibold text-darknavy/55">
            <span>Page {safePage} of {totalPages}</span>
            <div className="flex gap-2">
              <button type="button" className={smallButtonClassName} disabled={selectedIds.size === 0} onClick={() => {
                setPreviewRows((rows) => renumberRows(rows.filter((row) => !selectedIds.has(row.id))));
                setSelectedIds(new Set());
              }}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Remove
              </button>
              <button type="button" className={smallButtonClassName} disabled={safePage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                Prev
              </button>
              <button type="button" className={smallButtonClassName} disabled={safePage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModuleImportDialog>
  );
}

function ImportCell({
  field,
  row,
  onChange,
}: {
  field: ImportColumnId;
  row: ImportPreviewRow;
  onChange: (value: string) => void;
}) {
  const errors = row.errors[field] ?? [];
  const className = joinClasses(
    "h-10 w-full rounded-md border bg-white px-2 text-sm font-medium text-darknavy outline-none transition focus:ring-2",
    errors.length
      ? "border-coralpink/45 focus:border-coralpink focus:ring-coralpink/15"
      : "border-darknavy/12 focus:border-skyblue focus:ring-skyblue/15",
  );
  const selectOptions = getSelectOptions(field);

  return (
    <label className="block">
      {selectOptions ? (
        <select value={row.values[field]} onChange={(event) => onChange(event.target.value)} title={errors.join(" ")} className={className}>
          <option value="">--Select {getFieldLabel(field)}--</option>
          {selectOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input value={row.values[field]} onChange={(event) => onChange(event.target.value)} title={errors.join(" ")} className={className} />
      )}
      {errors.length > 0 ? <span className="mt-1 block text-xs font-semibold text-coralpink">{errors[0]}</span> : null}
    </label>
  );
}

function getSelectOptions(field: ImportColumnId) {
  if (field === "accountType") {
    return AccountTypes.map((type) => ({ label: AccountTypeLabels[type], value: type }));
  }
  if (field === "normalBalance") {
    return NormalBalances.map((balance) => ({
      label: NormalBalanceLabels[balance],
      value: balance,
    }));
  }
  if (field === "status") {
    return AccountStatuses.map((status) => ({ label: status, value: status }));
  }
  if (field === "showInReports" || field === "isPostingAccount") {
    return ["Yes", "No"].map((option) => ({ label: option, value: option }));
  }
  return null;
}

function createBlankRow(rowNumber: number): ImportPreviewRow {
  return {
    id: `chart-account-import-${Date.now()}-${rowNumber}`,
    rowNumber,
    values: {
      parentAccountNumber: "",
      accountName: "",
      accountType: "",
      normalBalance: "",
      statementSection: "",
      reportAlias: "",
      description: "",
      showInReports: "Yes",
      isPostingAccount: "Yes",
      status: "Active",
    },
    errors: {},
  };
}

function parseImportText(text: string, startRowNumber: number) {
  const rows = parseTabularRows(text).filter((row) => row.some((cell) => cell.trim()));
  if (rows.length === 0) return [];
  const headerIndexes = getHeaderIndexes(rows[0]);
  const dataRows = headerIndexes ? rows.slice(1) : rows;
  const batchId = Date.now();

  return dataRows.map((row, index) => {
    const rowNumber = startRowNumber + index;
    const parsedRow = createBlankRow(rowNumber);
    ImportHeaders.forEach((header, fallbackIndex) => {
      const index = headerIndexes?.[header.id] ?? fallbackIndex;
      parsedRow.values[header.id] = normalizeImportedValue(header.id, row[index] ?? parsedRow.values[header.id]);
    });
    return { ...parsedRow, id: `chart-account-import-${batchId}-${rowNumber}-${index}` };
  });
}

function validateRows(
  rows: ImportPreviewRow[],
  parentByNumber: Map<string, ChartAccount>,
) {
  return rows.map((row) => {
    const errors: ImportPreviewRow["errors"] = {};
    const parent = parentByNumber.get(row.values.parentAccountNumber);
    const accountType = normalizeAccountType(row.values.accountType);
    const normalBalance = row.values.normalBalance as NormalBalance;
    const status = row.values.status as AccountStatus;

    if (!parent) errors.parentAccountNumber = ["Parent account was not found."];
    if (!row.values.accountName.trim()) errors.accountName = ["Account name is required."];
    if (!accountType) errors.accountType = ["Select a valid account type."];
    if (!NormalBalances.includes(normalBalance)) errors.normalBalance = ["Select Debit or Credit."];
    if (!row.values.statementSection.trim()) errors.statementSection = ["Statement section is required."];
    if (!AccountStatuses.includes(status)) errors.status = ["Select a valid status."];

    return { ...row, errors };
  });
}

function createImportValues(
  row: ImportPreviewRow,
  parentByNumber: Map<string, ChartAccount>,
): ChartAccountFormValues {
  const parent = parentByNumber.get(row.values.parentAccountNumber);
  if (!parent) throw new Error(`Parent account was not found for row ${row.rowNumber}.`);

  return {
    accountLevel: "SPECIFIC",
    accountName: row.values.accountName.trim(),
    accountNumber: "",
    accountType: normalizeAccountType(row.values.accountType) as AccountType,
    bankDetails: undefined,
    description: row.values.description.trim(),
    isPostingAccount: parseBoolean(row.values.isPostingAccount, true),
    normalBalance: row.values.normalBalance as NormalBalance,
    parentId: parent.id,
    showInReports: parseBoolean(row.values.showInReports, true),
    statementGroup: parent.statementGroup,
    statementSection: row.values.statementSection.trim() || parent.statementSection,
    reportAlias: parseBoolean(row.values.showInReports, true)
      ? row.values.reportAlias.trim()
      : "",
    status: row.values.status as AccountStatus,
  };
}

async function readImportFileText(file: File) {
  if (file.name.toLowerCase().endsWith(".xlsx")) {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.default.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new Error("No worksheet was found in the Excel file.");
    const rows: string[][] = [];
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      const cells: string[] = [];
      row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
        cells[columnNumber - 1] = String(cell.text ?? cell.value ?? "").trim();
      });
      rows.push(cells);
    });
    return rows.map((row) => row.join("\t")).join("\n");
  }
  if (/\.(csv|tsv|txt)$/i.test(file.name)) return file.text();
  throw new Error("Please upload an .xlsx, .csv, .tsv, or .txt file.");
}

async function downloadTemplate() {
  const sample = [
    ImportHeaders.map((header) => header.label),
    ["1010102000", "Cash in Bank - New Bank", "Asset", "Debit", "Balance Sheet", "Posting bank account.", "Yes", "Yes", "Active"],
  ];
  downloadBlob(
    new Blob([sample.map((row) => row.map(escapeCsvCell).join(",")).join("\n")], {
      type: "text/csv;charset=utf-8",
    }),
    "chart-of-accounts-import-template.csv",
  );
}

function parseTabularRows(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return normalized.includes("\t")
    ? normalized.split("\n").map((line) => line.split("\t").map((cell) => cell.trim()))
    : parseCsvRows(normalized);
}

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];
    if (char === '"' && quoted && nextChar === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if (char === "\n" && !quoted) {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell.trim());
  rows.push(row);
  return rows;
}

function getHeaderIndexes(row: string[]) {
  const indexes: Partial<Record<ImportColumnId, number>> = {};
  row.forEach((cell, index) => {
    const normalized = cell.toLowerCase().replace(/[^a-z0-9]/g, "");
    const header = ImportHeaders.find(
      (item) => item.id.toLowerCase() === normalized || item.label.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized,
    );
    if (header) indexes[header.id] = index;
  });
  return Object.keys(indexes).length >= 2 ? indexes : null;
}

function normalizeImportedValue(field: ImportColumnId, value: string) {
  if (field === "accountType") return normalizeAccountType(value) ?? value;
  if (field === "normalBalance") return normalizeNormalBalance(value) || value.trim();
  if (field === "status") return value.trim().toLowerCase() === "inactive" ? "Inactive" : "Active";
  return value.trim();
}

function normalizeAccountType(value: string): AccountType | "" {
  const normalized = value.trim().toLowerCase();
  const found = AccountTypes.find(
    (type) =>
      type.toLowerCase() === normalized ||
      AccountTypeLabels[type].toLowerCase() === normalized,
  );
  return found ?? "";
}

function normalizeNormalBalance(value: string): NormalBalance | "" {
  const normalized = value.trim().toLowerCase();
  const found = NormalBalances.find(
    (balance) =>
      balance.toLowerCase() === normalized ||
      NormalBalanceLabels[balance].toLowerCase() === normalized,
  );

  return found ?? "";
}

function renumberRows(rows: ImportPreviewRow[]) {
  return rows.map((row, index) => ({ ...row, rowNumber: index + 1 }));
}

function rowHasErrors(row: ImportPreviewRow) {
  return Object.values(row.errors).some((errors) => Boolean(errors?.length));
}

function parseBoolean(value: string, fallback = false) {
  if (!value.trim()) return fallback;
  return ["1", "true", "yes", "y"].includes(value.trim().toLowerCase());
}

function getFieldLabel(field: ImportColumnId) {
  return ImportHeaders.find((header) => header.id === field)?.label ?? field;
}

function escapeCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

const secondaryButtonClassName =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-darknavy/12 bg-white px-3 text-sm font-semibold text-darknavy transition hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-55 lg:w-auto lg:px-4";
const footerButtonClassName =
  "inline-flex h-10 w-full items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-55 lg:w-auto";
const smallButtonClassName =
  "inline-flex h-8 items-center gap-1 rounded-md border border-darknavy/10 px-2 text-xs font-semibold text-darknavy disabled:cursor-not-allowed disabled:opacity-45";
