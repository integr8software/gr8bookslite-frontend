import {
  DefaultAccountImportDefaultColumnIndexes,
  DefaultAccountImportMaxFileSizeBytes,
  DefaultAccountImportMinFileSizeBytes,
  DefaultAccountImportTemplateHeaders,
  DefaultAccountTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/default-account/DefaultAccountConstants";
import type {
  DefaultAccount,
  DefaultAccountImportCellErrors,
  DefaultAccountImportColumnId,
  DefaultAccountImportPreviewRow,
  DefaultAccountType,
} from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { formatFileSize } from "@/app/src/utils/file.util";
import { getModuleImportOptionValue, isModuleImportOptionValue } from "@/app/src/utils/module-import.util";

export function getDefaultAccountTableMinWidthClassName(visibleColumnCount: number) {
  if (visibleColumnCount >= 7) return "min-w-[104rem]";
  if (visibleColumnCount === 6) return "min-w-[90rem]";
  if (visibleColumnCount === 5) return "min-w-[76rem]";
  return "min-w-[64rem]";
}

export function createBlankDefaultAccountImportRow(rowNumber: number): DefaultAccountImportPreviewRow {
  return {
    cellErrors: {},
    id: `default-account-import-preview-${rowNumber}-${Date.now()}`,
    rowErrors: [],
    rowNumber,
    defaultAccount: {
      defaultAccountName: "",
      description: "",
      expenseParentCoaId: "",
      status: "Active",
      type: "EXPENSE",
    },
  };
}

export function getNextDefaultAccountImportRowNumber(rows: DefaultAccountImportPreviewRow[]) {
  return Math.max(0, ...rows.map((row) => row.rowNumber)) + 1;
}

export function renumberDefaultAccountImportRows(rows: DefaultAccountImportPreviewRow[]) {
  return rows.map((row, index) => ({ ...row, rowNumber: index + 1 }));
}

export function normalizeDefaultAccountName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeImportedDefaultAccountCellValue(field: DefaultAccountImportColumnId, value: string) {
  if (field === "type") return normalizeImportedDefaultAccountType(value);
  return value;
}

export async function downloadDefaultAccountImportTemplate() {
  try {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.default.Workbook();
    const worksheet = workbook.addWorksheet("Default Accounts");

    worksheet.addRow(DefaultAccountImportTemplateHeaders);
    for (let rowNumber = 2; rowNumber <= 101; rowNumber += 1) {
      worksheet.getCell(`C${rowNumber}`).dataValidation = {
        allowBlank: false,
        formulae: [`"${DefaultAccountTypeOptions.map((option) => option.value).join(",")}"`],
        showErrorMessage: true,
        type: "list",
      };
    }
    worksheet.columns = [{ width: 30 }, { width: 42 }, { width: 18 }];

    const buffer = await workbook.xlsx.writeBuffer();

    downloadBlob(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "default-account-import-template.xlsx",
    );
  } catch {
    downloadBlob(
      new Blob([createImportTemplateCsv(DefaultAccountImportTemplateHeaders)], {
        type: "text/csv;charset=utf-8",
      }),
      "default-account-import-template.csv",
    );
  }
}

export async function readDefaultAccountImportFileText(file: File) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".xlsx")) {
    return formatImportRowsAsText(await readImportXlsxRows(await file.arrayBuffer()));
  }

  if (fileName.endsWith(".csv") || fileName.endsWith(".tsv") || fileName.endsWith(".txt")) {
    return (await file.text()).trim();
  }

  throw new Error("Please upload an .xlsx, .csv, .tsv, or .txt file.");
}

export function parseDefaultAccountImportText(text: string, startRowNumber = 1): DefaultAccountImportPreviewRow[] {
  const rows = parseImportTabularRows(text).filter((row) => row.some((cell) => cell.trim() !== ""));

  if (rows.length === 0) return [];

  const headerIndexes = getDefaultAccountImportHeaderIndexes(rows[0]);
  const indexes = headerIndexes ?? DefaultAccountImportDefaultColumnIndexes;
  const dataRows = headerIndexes ? rows.slice(1) : rows;
  const importBatchId = Date.now();

  return dataRows
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row, index) => {
      const rowNumber = startRowNumber + index;

      return {
        cellErrors: {},
        id: `default-account-import-preview-${rowNumber}-${importBatchId}-${index}`,
        rowErrors: [],
        rowNumber,
        defaultAccount: {
          defaultAccountName: getImportedValue(row, indexes.defaultAccountName),
          description: getImportedValue(row, indexes.description),
          expenseParentCoaId: "",
          status: "Active",
          type: normalizeImportedDefaultAccountType(getImportedValue(row, indexes.type)),
        },
      };
    });
}

export function validateDefaultAccountImportRows(rows: DefaultAccountImportPreviewRow[], existingDefaultAccounts: DefaultAccount[]) {
  const existingNames = new Map(
    existingDefaultAccounts.map((account) => [normalizeDefaultAccountName(account.defaultAccountName), account.defaultAccountName]),
  );
  const importedNameCounts = new Map<string, number>();

  rows.forEach((row) => {
    const normalizedName = normalizeDefaultAccountName(row.defaultAccount.defaultAccountName);

    if (normalizedName) {
      importedNameCounts.set(normalizedName, (importedNameCounts.get(normalizedName) ?? 0) + 1);
    }
  });

  return rows.map((row) => {
    const cellErrors: DefaultAccountImportCellErrors = {};
    const normalizedName = normalizeDefaultAccountName(row.defaultAccount.defaultAccountName);
    const typeOptions = DefaultAccountTypeOptions.map((option) => option.value);

    if (!row.defaultAccount.defaultAccountName.trim()) {
      cellErrors.defaultAccountName = ["Default account name is required."];
    }

    const existingName = existingNames.get(normalizedName);

    if (existingName) {
      cellErrors.defaultAccountName = [...(cellErrors.defaultAccountName ?? []), `Default account already exists: ${existingName}.`];
    }

    if (normalizedName && (importedNameCounts.get(normalizedName) ?? 0) > 1) {
      cellErrors.defaultAccountName = [...(cellErrors.defaultAccountName ?? []), "Duplicate name in import."];
    }

    if (!isModuleImportOptionValue(row.defaultAccount.type, typeOptions)) {
      cellErrors.type = ["Choose a valid type."];
    }

    return { ...row, cellErrors };
  });
}

export function defaultAccountImportRowHasErrors(row: DefaultAccountImportPreviewRow) {
  return row.rowErrors.length > 0 || Object.values(row.cellErrors).some((errors) => Boolean(errors?.length));
}

export function validateDefaultAccountImportFileSize(file: File) {
  if (file.size < DefaultAccountImportMinFileSizeBytes) {
    return `Upload a file larger than ${formatFileSize(DefaultAccountImportMinFileSizeBytes)}.`;
  }

  if (file.size > DefaultAccountImportMaxFileSizeBytes) {
    return `Upload a file up to ${formatFileSize(DefaultAccountImportMaxFileSizeBytes)}.`;
  }

  return null;
}

export function isDefaultAccountImportGridPasteTarget(target: EventTarget | null) {
  return !(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement);
}

export function parseImportTabularRows(text: string) {
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  return normalizedText.includes("\t")
    ? normalizedText.split("\n").map((line) => line.split("\t").map((cell) => cell.trim()))
    : parseImportCsvRows(normalizedText);
}

export function waitForNextDefaultAccountImportBatch() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 75);
  });
}

function normalizeImportedDefaultAccountType(value: string): DefaultAccountType {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const typeOptions = DefaultAccountTypeOptions.map((option) => option.value);

  if (["collection", "collections", "collectiontype"].includes(normalized)) return "COLLECTION";
  if (["service", "services", "servicetype", "expense", "expensetype"].includes(normalized)) {
    return "EXPENSE";
  }

  return (getModuleImportOptionValue(value, typeOptions) ?? value) as DefaultAccountType;
}

function getDefaultAccountImportHeaderIndexes(row: string[]) {
  const indexes: Partial<Record<DefaultAccountImportColumnId, number>> = {};

  row.forEach((cell, index) => {
    const key = normalizeDefaultAccountImportHeader(cell);

    if (key) indexes[key] = index;
  });

  return Object.keys(indexes).length >= 2 ? indexes : null;
}

function normalizeDefaultAccountImportHeader(value: string): DefaultAccountImportColumnId | null {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (["defaultaccountname", "defaultname", "name"].includes(normalized)) {
    return "defaultAccountName";
  }
  if (["description", "remarks", "details"].includes(normalized)) {
    return "description";
  }
  if (["type", "defaultaccounttype"].includes(normalized)) return "type";
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

export function getDefaultAccountTypeLabel(type: DefaultAccountType) {
  return DefaultAccountTypeOptions.find((option) => option.value === type)?.label ?? type;
}
