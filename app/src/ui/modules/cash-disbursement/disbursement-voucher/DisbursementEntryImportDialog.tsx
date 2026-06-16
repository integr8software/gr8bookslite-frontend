"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardPaste,
  FileText,
  Upload,
  X,
} from "lucide-react";
import {
  createBlankDisbursementLineEntry,
  createTaxDetails,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { getModuleChartAccounts } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type { DisbursementLineEntry } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";

type DisbursementEntryColumnId =
  | "accountCode"
  | "accountName"
  | "debit"
  | "credit"
  | "taxRate"
  | "particulars"
  | "partyCode"
  | "partyName"
  | "responsibilityCenter"
  | "refId"
  | "vatType"
  | "atcCode";

type DisbursementEntryImportPreviewRow = {
  entry: DisbursementLineEntry;
  errors: string[];
  id: string;
};

const DefaultDisbursementEntryImportIndexes: Partial<
  Record<DisbursementEntryColumnId, number>
> = {
  accountCode: 0,
  accountName: 1,
  debit: 2,
  credit: 3,
  taxRate: 4,
  particulars: 5,
  partyCode: 6,
  partyName: 7,
  responsibilityCenter: 8,
  refId: 9,
  vatType: 10,
  atcCode: 11,
};

const DisbursementEntryImportTemplateHeaders = [
  "Account Code",
  "Account Title",
  "Debit",
  "Credit",
  "Tax",
  "Particulars",
  "Party Code",
  "Party Name",
  "Responsibility Center",
  "Reference No",
  "VAT Type",
  "ATC Code",
];

const DisbursementEntryImportTemplateRows = [
  [
    "5020101001",
    "Office Supplies Expense",
    "12500",
    "",
    "12%",
    "Imported office supplies disbursement",
    "VND-0001",
    "ABC Supplies Corporation",
    "ADMIN",
    "DV-REF-001",
    "VATable",
    "WI158",
  ],
  [
    "1010102001",
    "Cash in Bank - BDO Operating",
    "",
    "12500",
    "0%",
    "Bank settlement",
    "",
    "",
    "ADMIN",
    "DV-REF-001",
    "",
    "",
  ],
];

export function DisbursementEntryImportDialog({
  isOpen,
  onClose,
  onImportEntries,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImportEntries: (entries: DisbursementLineEntry[]) => void;
}) {
  const [pasteText, setPasteText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<
    DisbursementEntryImportPreviewRow[]
  >([]);
  const validatedRows = useMemo(
    () =>
      previewRows.map((row) => ({
        ...row,
        errors: validateDisbursementImportEntry(row.entry),
      })),
    [previewRows],
  );
  const invalidRowCount = validatedRows.filter(
    (row) => row.errors.length > 0,
  ).length;
  const canImport = validatedRows.length > 0 && invalidRowCount === 0;

  if (!isOpen) {
    return null;
  }

  function previewImportText(text: string) {
    try {
      const rows = parseDisbursementEntryImportText(text);

      setPreviewRows(rows);
      setImportError(null);
    } catch (error) {
      setPreviewRows([]);
      setImportError(
        error instanceof Error
          ? error.message
          : "Could not read the imported accounting entries.",
      );
    }
  }

  function handleFileUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    readDisbursementEntryImportFileText(file)
      .then((text) => {
        setPasteText(text);
        previewImportText(text);
      })
      .catch((error) => {
        setPreviewRows([]);
        setImportError(
          error instanceof Error
            ? error.message
            : "Could not read the imported accounting entries.",
        );
      });
  }

  function resetImportState() {
    setPasteText("");
    setImportError(null);
    setPreviewRows([]);
  }

  function downloadImportTemplate() {
    downloadBlob(
      new Blob([createDisbursementEntryImportTemplateCsv()], {
        type: "text/csv;charset=utf-8",
      }),
      "disbursement-voucher-entry-import-template.csv",
    );
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-140 flex items-end justify-center bg-slate-950/45 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="disbursement-entry-import-title"
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-white/20 bg-white shadow-[0_28px_90px_rgba(33,39,56,0.28)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-darknavy/10 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="disbursement-entry-import-title"
              className="text-lg font-semibold text-darknavy"
            >
              Import Accounting Entries
            </h2>
            <p className="mt-1 text-sm text-darknavy/55">
              Upload or paste rows, preview them, then import when validation
              passes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy/60 transition hover:bg-skyblue/10 hover:text-darknavy"
            aria-label="Close accounting entry import"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid min-h-0 gap-4 overflow-y-auto px-5 py-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="grid content-start gap-3">
            <label className="grid cursor-pointer gap-2 rounded-lg border border-dashed border-skyblue/35 bg-skyblue/8 px-4 py-5 text-center text-sm font-semibold text-skyblue transition hover:bg-skyblue/12">
              <Upload className="mx-auto h-6 w-6" aria-hidden="true" />
              Upload .xlsx, .csv, .tsv, or .txt
              <input
                type="file"
                accept=".xlsx,.csv,.tsv,.txt"
                className="sr-only"
                onChange={(event) => handleFileUpload(event.target.files?.[0])}
              />
            </label>
            <button
              type="button"
              onClick={downloadImportTemplate}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-skyblue/8"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Download Template
            </button>
            <button
              type="button"
              onClick={resetImportState}
              className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5"
            >
              Reset
            </button>
            {importError ? (
              <div className="flex gap-2 rounded-md border border-coralpink/25 bg-coralpink/8 px-3 py-2 text-sm font-medium text-coralpink">
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{importError}</span>
              </div>
            ) : null}
          </div>

          <div className="grid min-w-0 gap-3">
            <label
              htmlFor="disbursement-entry-import-paste"
              className="text-sm font-semibold text-darknavy"
            >
              Paste Rows
            </label>
            <textarea
              id="disbursement-entry-import-paste"
              value={pasteText}
              onChange={(event) => setPasteText(event.target.value)}
              placeholder="Account Code, Account Title, Debit, Credit, Tax, Particulars..."
              className="min-h-28 w-full resize-y rounded-lg border border-darknavy/12 bg-white px-3 py-2 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/20"
            />
            <button
              type="button"
              onClick={() => previewImportText(pasteText)}
              className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-skyblue/25 bg-skyblue/8 px-4 text-sm font-semibold text-skyblue transition hover:bg-skyblue/12"
            >
              <ClipboardPaste className="h-4 w-4" aria-hidden="true" />
              Preview Rows
            </button>

            <div className="overflow-auto rounded-lg border border-darknavy/10">
              <table className="w-full min-w-[56rem] border-separate border-spacing-0 text-left text-xs text-darknavy">
                <thead className="bg-offwhite text-darknavy/65">
                  <tr>
                    <th className="border-b border-darknavy/10 px-3 py-2">
                      Row
                    </th>
                    <th className="border-b border-darknavy/10 px-3 py-2">
                      Account Code
                    </th>
                    <th className="border-b border-darknavy/10 px-3 py-2">
                      Account Title
                    </th>
                    <th className="border-b border-darknavy/10 px-3 py-2 text-right">
                      Debit
                    </th>
                    <th className="border-b border-darknavy/10 px-3 py-2 text-right">
                      Credit
                    </th>
                    <th className="border-b border-darknavy/10 px-3 py-2">
                      Tax
                    </th>
                    <th className="border-b border-darknavy/10 px-3 py-2">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {validatedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-8 text-center text-sm text-darknavy/45"
                      >
                        No rows previewed.
                      </td>
                    </tr>
                  ) : (
                    validatedRows.map((row, index) => (
                      <tr key={row.id} className="bg-white">
                        <td className="border-b border-darknavy/8 px-3 py-2 font-semibold">
                          {index + 1}
                        </td>
                        <td className="border-b border-darknavy/8 px-3 py-2">
                          {row.entry.accountCode}
                        </td>
                        <td className="border-b border-darknavy/8 px-3 py-2">
                          {row.entry.accountName}
                        </td>
                        <td className="border-b border-darknavy/8 px-3 py-2 text-right">
                          {formatAccountingAmount(row.entry.debit)}
                        </td>
                        <td className="border-b border-darknavy/8 px-3 py-2 text-right">
                          {formatAccountingAmount(row.entry.credit)}
                        </td>
                        <td className="border-b border-darknavy/8 px-3 py-2">
                          {row.entry.taxRate}
                        </td>
                        <td className="border-b border-darknavy/8 px-3 py-2">
                          {row.errors.length === 0 ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700">
                              <CheckCircle2
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              Ready
                            </span>
                          ) : (
                            <span className="text-coralpink">
                              {row.errors.join(" ")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-darknavy/10 px-5 py-4">
          <p className="text-sm font-medium text-darknavy/60">
            {validatedRows.length} rows previewed
            {invalidRowCount > 0 ? `, ${invalidRowCount} invalid` : ""}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canImport}
              onClick={() =>
                onImportEntries(validatedRows.map((row) => row.entry))
              }
              className="theme-accent-contrast-text inline-flex h-10 items-center justify-center rounded-md bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Import Valid Entries
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function parseDisbursementEntryImportText(text: string) {
  const rows = parseDisbursementEntryTabularRows(text).filter((row) =>
    row.some((cell) => String(cell ?? "").trim() !== ""),
  );

  if (rows.length === 0) {
    throw new Error("No accounting entry rows were found to import.");
  }

  const headerIndexes = getDisbursementEntryImportHeaderIndexes(rows[0]);
  const indexes = headerIndexes ?? DefaultDisbursementEntryImportIndexes;
  const dataRows = headerIndexes ? rows.slice(1) : rows;
  const previewRows = dataRows
    .map((row) => createDisbursementEntryImportPreviewRow(row, indexes))
    .filter((row) => disbursementEntryHasData(row.entry));

  if (previewRows.length === 0) {
    throw new Error("The import did not contain usable accounting entry rows.");
  }

  return previewRows;
}

function createDisbursementEntryImportPreviewRow(
  row: string[],
  indexes: Partial<Record<DisbursementEntryColumnId, number>>,
): DisbursementEntryImportPreviewRow {
  const accountName = getImportedDisbursementEntryValue(row, indexes.accountName);
  const accountCode =
    getImportedDisbursementEntryValue(row, indexes.accountCode) ||
    getImportedAccountCodeFromName(accountName);
  const debit = normalizeImportedAccountingAmount(
    getImportedDisbursementEntryValue(row, indexes.debit),
  );
  const credit = normalizeImportedAccountingAmount(
    getImportedDisbursementEntryValue(row, indexes.credit),
  );
  const taxRate = normalizeImportedTaxRate(
    getImportedDisbursementEntryValue(row, indexes.taxRate),
  );
  const taxAmount = debit || credit;
  const taxDetails = {
    ...createTaxDetails(taxAmount, taxRate),
    atcCode: getImportedDisbursementEntryValue(row, indexes.atcCode),
    refId: getImportedDisbursementEntryValue(row, indexes.refId),
    responsibilityCenter: getImportedDisbursementEntryValue(
      row,
      indexes.responsibilityCenter,
    ),
    vatType: getImportedDisbursementEntryValue(row, indexes.vatType),
  };
  const entry = syncDisbursementLineEntryTaxDetails(
    normalizeDisbursementLineEntryFields(
      createBlankDisbursementLineEntry({
        accountCode,
        accountName,
        atcCode: taxDetails.atcCode,
        credit,
        debit,
        particulars: getImportedDisbursementEntryValue(row, indexes.particulars),
        partyCode: getImportedDisbursementEntryValue(row, indexes.partyCode),
        partyName: getImportedDisbursementEntryValue(row, indexes.partyName),
        refId: taxDetails.refId,
        responsibilityCenter: taxDetails.responsibilityCenter,
        taxDetails,
        taxRate,
        vatType: taxDetails.vatType,
      }),
    ),
  );

  return {
    entry,
    errors: validateDisbursementImportEntry(entry),
    id: `import-entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
}

function normalizeDisbursementLineEntryFields(
  entry: DisbursementLineEntry,
): DisbursementLineEntry {
  const taxDetails = entry.taxDetails ?? createTaxDetails(0, "0%");

  return {
    ...entry,
    atcCode: entry.atcCode ?? taxDetails.atcCode ?? "",
    partyCode: entry.partyCode ?? "",
    partyName: entry.partyName ?? "",
    refId: entry.refId ?? taxDetails.refId ?? "",
    responsibilityCenter:
      entry.responsibilityCenter ?? taxDetails.responsibilityCenter ?? "",
    taxDetails,
    vatType: entry.vatType ?? taxDetails.vatType ?? "",
  };
}

function syncDisbursementLineEntryTaxDetails(
  entry: DisbursementLineEntry,
): DisbursementLineEntry {
  const amount =
    parseMoneyNumberInput(entry.debit) || parseMoneyNumberInput(entry.credit);
  const taxDetails = syncTaxDetailsAmount(
    {
      ...entry.taxDetails,
      atcCode: entry.atcCode ?? entry.taxDetails.atcCode,
      refId: entry.refId ?? entry.taxDetails.refId,
      responsibilityCenter:
        entry.responsibilityCenter ?? entry.taxDetails.responsibilityCenter,
      vatType: entry.vatType ?? entry.taxDetails.vatType,
    },
    amount,
    String(entry.taxRate || "0%"),
  );

  return {
    ...entry,
    atcCode: taxDetails.atcCode,
    refId: taxDetails.refId,
    responsibilityCenter: taxDetails.responsibilityCenter,
    taxDetails,
    vatType: taxDetails.vatType,
  };
}

function validateDisbursementImportEntry(entry: DisbursementLineEntry) {
  const errors: string[] = [];
  const debit = parseMoneyNumberInput(entry.debit);
  const credit = parseMoneyNumberInput(entry.credit);

  if (!entry.accountCode.trim()) {
    errors.push("Account code is required.");
  }

  if (!entry.accountName.trim()) {
    errors.push("Account title is required.");
  }

  if (debit <= 0 && credit <= 0) {
    errors.push("Enter debit or credit.");
  }

  if (debit > 0 && credit > 0) {
    errors.push("Use debit or credit only.");
  }

  return errors;
}

async function readDisbursementEntryImportFileText(file: File) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".xlsx")) {
    const rows = await readDisbursementEntryXlsxRows(await file.arrayBuffer());

    return formatDisbursementEntryRowsAsTabularText(rows);
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

async function readDisbursementEntryXlsxRows(buffer: ArrayBuffer) {
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
      cells[columnNumber - 1] = formatDisbursementEntryExcelCellValue(
        cell.value,
        cell.text,
      );
    });
    rows.push(cells);
  });

  return rows;
}

function parseDisbursementEntryTabularRows(text: string) {
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  return normalizedText.includes("\t")
    ? normalizedText
      .split("\n")
      .map((line) => line.split("\t").map((cell) => cell.trim()))
    : parseDisbursementEntryCsvRows(normalizedText);
}

function parseDisbursementEntryCsvRows(text: string) {
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

function getDisbursementEntryImportHeaderIndexes(row: string[]) {
  const indexes: Partial<Record<DisbursementEntryColumnId, number>> = {};

  row.forEach((cell, index) => {
    const key = normalizeDisbursementEntryImportHeader(cell);

    if (key) {
      indexes[key] = index;
    }
  });

  return Object.keys(indexes).length >= 2 ? indexes : null;
}

function normalizeDisbursementEntryImportHeader(
  value: string,
): DisbursementEntryColumnId | null {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (["accountcode", "accountno", "accountnumber", "code"].includes(normalized)) {
    return "accountCode";
  }

  if (["accounttitle", "accountname", "account", "title"].includes(normalized)) {
    return "accountName";
  }

  if (["debit", "dr"].includes(normalized)) {
    return "debit";
  }

  if (["credit", "cr"].includes(normalized)) {
    return "credit";
  }

  if (["tax", "taxrate", "vat", "vatrate"].includes(normalized)) {
    return "taxRate";
  }

  if (["particulars", "description", "memo", "remarks"].includes(normalized)) {
    return "particulars";
  }

  if (["partycode", "vcecode"].includes(normalized)) {
    return "partyCode";
  }

  if (["partyname", "vcename", "party"].includes(normalized)) {
    return "partyName";
  }

  if (["responsibilitycenter", "costcenter", "department"].includes(normalized)) {
    return "responsibilityCenter";
  }

  if (["referenceno", "refno", "refid", "reference"].includes(normalized)) {
    return "refId";
  }

  if (["vattype"].includes(normalized)) {
    return "vatType";
  }

  if (["atccode", "atc"].includes(normalized)) {
    return "atcCode";
  }

  return null;
}

function getImportedDisbursementEntryValue(row: string[], index?: number) {
  return typeof index === "number" ? String(row[index] ?? "").trim() : "";
}

function getImportedAccountCodeFromName(accountName: string) {
  const normalizedAccountName = accountName.trim().toLowerCase();

  if (!normalizedAccountName) {
    return "";
  }

  return (
    getModuleChartAccounts().find(
      (account) => account.accountName.toLowerCase() === normalizedAccountName,
    )?.accountNumber ?? ""
  );
}

function normalizeImportedAccountingAmount(value: string) {
  const amount = parseMoneyNumberInput(value);

  return Number.isFinite(amount) ? amount : 0;
}

function normalizeImportedTaxRate(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "0%";
  }

  if (/^\d+(?:\.\d+)?%$/.test(normalizedValue)) {
    return normalizedValue;
  }

  const numericValue = Number(normalizedValue);

  return Number.isFinite(numericValue) ? `${numericValue}%` : normalizedValue;
}

function formatDisbursementEntryRowsAsTabularText(rows: string[][]) {
  return rows
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
    .map((row) =>
      row
        .map((cell) => String(cell ?? "").replace(/\r?\n/g, " ").trim())
        .join("\t"),
    )
    .join("\n");
}

function formatDisbursementEntryExcelCellValue(
  value: unknown,
  displayText?: string,
) {
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
      return String(record.text ?? "").replace(/\r?\n/g, " ").trim();
    }

    if ("result" in record) {
      return formatDisbursementEntryExcelCellValue(record.result);
    }
  }

  return String(value).replace(/\r?\n/g, " ").trim();
}

function createDisbursementEntryImportTemplateCsv() {
  const rows = [
    DisbursementEntryImportTemplateHeaders,
    ...DisbursementEntryImportTemplateRows,
  ];

  return rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
}

function formatAccountingAmount(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function disbursementEntryHasData(entry: DisbursementLineEntry) {
  return (
    entry.accountCode.trim() !== "" ||
    entry.accountName.trim() !== "" ||
    (entry.partyCode ?? "").trim() !== "" ||
    (entry.partyName ?? "").trim() !== "" ||
    (entry.responsibilityCenter ?? "").trim() !== "" ||
    (entry.refId ?? "").trim() !== "" ||
    (entry.vatType ?? "").trim() !== "" ||
    (entry.atcCode ?? "").trim() !== "" ||
    entry.particulars.trim() !== "" ||
    parseMoneyNumberInput(entry.debit) > 0 ||
    parseMoneyNumberInput(entry.credit) > 0 ||
    entry.taxRate !== "0%"
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
