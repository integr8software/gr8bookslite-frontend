import {
  DisbursementTypeImportDefaultColumnIndexes,
  DisbursementTypeImportMaxFileSizeBytes,
  DisbursementTypeImportMinFileSizeBytes,
  DisbursementTypeImportTemplateHeaders,
  DisbursementTypeTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/disbursement-type/DisbursementTypeConstants";
import type {
  DisbursementType,
  DisbursementTypeImportCellErrors,
  DisbursementTypeImportColumnId,
  DisbursementTypeImportPreviewRow,
  DisbursementTypeType,
} from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { formatFileSize } from "@/app/src/utils/file.util";

export function getDisbursementTypeTableMinWidthClassName(visibleColumnCount: number) {
  if (visibleColumnCount >= 7) return "min-w-[104rem]";
  if (visibleColumnCount === 6) return "min-w-[90rem]";
  if (visibleColumnCount === 5) return "min-w-[76rem]";
  return "min-w-[64rem]";
}

export function createBlankDisbursementTypeImportRow(rowNumber: number): DisbursementTypeImportPreviewRow {
  return {
    cellErrors: {},
    id: `disbursement-type-import-preview-${rowNumber}-${Date.now()}`,
    rowErrors: [],
    rowNumber,
      disbursementType: {
        disbursementTypeName: "",
        description: "",
        accountSetupMode: "Auto",
        expenseCoaId: "",
        expenseParentCoaId: "",
        status: "Active",
        type: "EXPENSE",
    },
  };
}

export function getNextDisbursementTypeImportRowNumber(rows: DisbursementTypeImportPreviewRow[]) {
  return Math.max(0, ...rows.map((row) => row.rowNumber)) + 1;
}

export function renumberDisbursementTypeImportRows(rows: DisbursementTypeImportPreviewRow[]) {
  return rows.map((row, index) => ({ ...row, rowNumber: index + 1 }));
}

export function normalizeDisbursementTypeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeImportedDisbursementTypeCellValue(field: DisbursementTypeImportColumnId, value: string) {
  return value;
}

export async function downloadDisbursementTypeImportTemplate() {
  try {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.default.Workbook();
    const worksheet = workbook.addWorksheet("Disbursement Types");

    worksheet.addRow(DisbursementTypeImportTemplateHeaders);
    worksheet.columns = [{ width: 30 }, { width: 42 }];

    const buffer = await workbook.xlsx.writeBuffer();

    downloadBlob(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "disbursement-type-import-template.xlsx",
    );
  } catch {
    downloadBlob(
      new Blob([createImportTemplateCsv(DisbursementTypeImportTemplateHeaders)], {
        type: "text/csv;charset=utf-8",
      }),
      "disbursement-type-import-template.csv",
    );
  }
}

export async function readDisbursementTypeImportFileText(file: File) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".xlsx")) {
    return formatImportRowsAsText(await readImportXlsxRows(await file.arrayBuffer()));
  }

  if (fileName.endsWith(".csv") || fileName.endsWith(".tsv") || fileName.endsWith(".txt")) {
    return (await file.text()).trim();
  }

  throw new Error("Please upload an .xlsx, .csv, .tsv, or .txt file.");
}

export function parseDisbursementTypeImportText(text: string, startRowNumber = 1): DisbursementTypeImportPreviewRow[] {
  const rows = parseImportTabularRows(text).filter((row) => row.some((cell) => cell.trim() !== ""));

  if (rows.length === 0) return [];

  const headerIndexes = getDisbursementTypeImportHeaderIndexes(rows[0]);
  const indexes = headerIndexes ?? DisbursementTypeImportDefaultColumnIndexes;
  const dataRows = headerIndexes ? rows.slice(1) : rows;
  const importBatchId = Date.now();

  return dataRows
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row, index) => {
      const rowNumber = startRowNumber + index;

      return {
        cellErrors: {},
        id: `disbursement-type-import-preview-${rowNumber}-${importBatchId}-${index}`,
        rowErrors: [],
        rowNumber,
        disbursementType: {
          disbursementTypeName: getImportedValue(row, indexes.disbursementTypeName),
          description: getImportedValue(row, indexes.description),
          accountSetupMode: "Auto",
          expenseCoaId: "",
          expenseParentCoaId: "",
          status: "Active",
          type: "EXPENSE",
        },
      };
    });
}

export function validateDisbursementTypeImportRows(rows: DisbursementTypeImportPreviewRow[], existingDisbursementTypes: DisbursementType[]) {
  const existingNames = new Map(
    existingDisbursementTypes.map((account) => [normalizeDisbursementTypeName(account.disbursementTypeName), account.disbursementTypeName]),
  );
  const importedNameCounts = new Map<string, number>();

  rows.forEach((row) => {
    const normalizedName = normalizeDisbursementTypeName(row.disbursementType.disbursementTypeName);

    if (normalizedName) {
      importedNameCounts.set(normalizedName, (importedNameCounts.get(normalizedName) ?? 0) + 1);
    }
  });

  return rows.map((row) => {
    const cellErrors: DisbursementTypeImportCellErrors = {};
    const normalizedName = normalizeDisbursementTypeName(row.disbursementType.disbursementTypeName);

    if (!row.disbursementType.disbursementTypeName.trim()) {
      cellErrors.disbursementTypeName = ["Disbursement type name is required."];
    }

    const existingName = existingNames.get(normalizedName);

    if (existingName) {
      cellErrors.disbursementTypeName = [...(cellErrors.disbursementTypeName ?? []), `Disbursement type already exists: ${existingName}.`];
    }

    if (normalizedName && (importedNameCounts.get(normalizedName) ?? 0) > 1) {
      cellErrors.disbursementTypeName = [...(cellErrors.disbursementTypeName ?? []), "Duplicate name in import."];
    }

    return { ...row, cellErrors };
  });
}

export function DisbursementTypeImportRowHasErrors(row: DisbursementTypeImportPreviewRow) {
  return row.rowErrors.length > 0 || Object.values(row.cellErrors).some((errors) => Boolean(errors?.length));
}

export function validateDisbursementTypeImportFileSize(file: File) {
  if (file.size < DisbursementTypeImportMinFileSizeBytes) {
    return `Upload a file larger than ${formatFileSize(DisbursementTypeImportMinFileSizeBytes)}.`;
  }

  if (file.size > DisbursementTypeImportMaxFileSizeBytes) {
    return `Upload a file up to ${formatFileSize(DisbursementTypeImportMaxFileSizeBytes)}.`;
  }

  return null;
}

export function isDisbursementTypeImportGridPasteTarget(target: EventTarget | null) {
  return !(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement);
}

export function parseImportTabularRows(text: string) {
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  return normalizedText.includes("\t")
    ? normalizedText.split("\n").map((line) => line.split("\t").map((cell) => cell.trim()))
    : parseImportCsvRows(normalizedText);
}

export function waitForNextDisbursementTypeImportBatch() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 75);
  });
}

function getDisbursementTypeImportHeaderIndexes(row: string[]) {
  const indexes: Partial<Record<DisbursementTypeImportColumnId, number>> = {};

  row.forEach((cell, index) => {
    const key = normalizeDisbursementTypeImportHeader(cell);

    if (key) indexes[key] = index;
  });

  return Object.keys(indexes).length >= 2 ? indexes : null;
}

function normalizeDisbursementTypeImportHeader(value: string): DisbursementTypeImportColumnId | null {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (["disbursementTypeName", "defaultname", "name"].includes(normalized)) {
    return "disbursementTypeName";
  }
  if (["description", "remarks", "details"].includes(normalized)) {
    return "description";
  }
  return null;
}

function parseImportCsvRows(text: string) {
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

async function readImportXlsxRows(buffer: ArrayBuffer) {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.default.Workbook();

  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) throw new Error("No worksheet was found in the Excel file.");

  const rows: string[][] = [];

  worksheet.eachRow({ includeEmpty: false }, (row) => {
    const cells: string[] = [];

    row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
      cells[columnNumber - 1] = formatImportExcelCellValue(cell.value, cell.text);
    });
    rows.push(cells);
  });

  return rows;
}

function formatImportRowsAsText(rows: string[][]) {
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

function formatImportExcelCellValue(value: unknown, displayText?: string) {
  const normalizedDisplayText = String(displayText ?? "")
    .replace(/\r?\n/g, " ")
    .trim();

  if (normalizedDisplayText) return normalizedDisplayText;
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).replace(/\r?\n/g, " ").trim();
}

function createImportTemplateCsv(headers: string[]) {
  return [headers].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
}

function getImportedValue(row: string[], index?: number) {
  return typeof index === "number" ? String(row[index] ?? "").trim() : "";
}

export function getDisbursementTypeTypeLabel(type: DisbursementTypeType) {
  return DisbursementTypeTypeOptions.find((option) => option.value === type)?.label ?? type;
}
