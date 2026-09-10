import {
  CollectionTypeImportDefaultColumnIndexes,
  CollectionTypeImportMaxFileSizeBytes,
  CollectionTypeImportMinFileSizeBytes,
  CollectionTypeImportTemplateHeaders,
  CollectionTypeTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/collection-type/CollectionTypeConstants";
import type {
  CollectionType,
  CollectionTypeImportCellErrors,
  CollectionTypeImportColumnId,
  CollectionTypeImportPreviewRow,
  CollectionTypeType,
} from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { formatFileSize } from "@/app/src/utils/file.util";
import { getModuleImportOptionValue, isModuleImportOptionValue } from "@/app/src/utils/module-import.util";

export function getCollectionTypeTableMinWidthClassName(visibleColumnCount: number) {
  if (visibleColumnCount >= 7) return "min-w-[104rem]";
  if (visibleColumnCount === 6) return "min-w-[90rem]";
  if (visibleColumnCount === 5) return "min-w-[76rem]";
  return "min-w-[64rem]";
}

export function createBlankCollectionTypeImportRow(rowNumber: number): CollectionTypeImportPreviewRow {
  return {
    cellErrors: {},
    id: `collection-type-import-preview-${rowNumber}-${Date.now()}`,
    rowErrors: [],
    rowNumber,
    collectionType: {
      collectionTypeName: "",
      description: "",
      expenseParentCoaId: "",
      status: "Active",
      type: "EXPENSE",
    },
  };
}

export function getNextCollectionTypeImportRowNumber(rows: CollectionTypeImportPreviewRow[]) {
  return Math.max(0, ...rows.map((row) => row.rowNumber)) + 1;
}

export function renumberCollectionTypeImportRows(rows: CollectionTypeImportPreviewRow[]) {
  return rows.map((row, index) => ({ ...row, rowNumber: index + 1 }));
}

export function normalizeCollectionTypeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeImportedCollectionTypeCellValue(field: CollectionTypeImportColumnId, value: string) {
  if (field === "type") return normalizeImportedCollectionTypeType(value);
  return value;
}

export async function downloadCollectionTypeImportTemplate() {
  try {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.default.Workbook();
    const worksheet = workbook.addWorksheet("Collection Types");

    worksheet.addRow(CollectionTypeImportTemplateHeaders);
    for (let rowNumber = 2; rowNumber <= 101; rowNumber += 1) {
      worksheet.getCell(`C${rowNumber}`).dataValidation = {
        allowBlank: false,
        formulae: [`"${CollectionTypeTypeOptions.map((option) => option.value).join(",")}"`],
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
      "collection-type-import-template.xlsx",
    );
  } catch {
    downloadBlob(
      new Blob([createImportTemplateCsv(CollectionTypeImportTemplateHeaders)], {
        type: "text/csv;charset=utf-8",
      }),
      "collection-type-import-template.csv",
    );
  }
}

export async function readCollectionTypeImportFileText(file: File) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".xlsx")) {
    return formatImportRowsAsText(await readImportXlsxRows(await file.arrayBuffer()));
  }

  if (fileName.endsWith(".csv") || fileName.endsWith(".tsv") || fileName.endsWith(".txt")) {
    return (await file.text()).trim();
  }

  throw new Error("Please upload an .xlsx, .csv, .tsv, or .txt file.");
}

export function parseCollectionTypeImportText(text: string, startRowNumber = 1): CollectionTypeImportPreviewRow[] {
  const rows = parseImportTabularRows(text).filter((row) => row.some((cell) => cell.trim() !== ""));

  if (rows.length === 0) return [];

  const headerIndexes = getCollectionTypeImportHeaderIndexes(rows[0]);
  const indexes = headerIndexes ?? CollectionTypeImportDefaultColumnIndexes;
  const dataRows = headerIndexes ? rows.slice(1) : rows;
  const importBatchId = Date.now();

  return dataRows
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row, index) => {
      const rowNumber = startRowNumber + index;

      return {
        cellErrors: {},
        id: `collection-type-import-preview-${rowNumber}-${importBatchId}-${index}`,
        rowErrors: [],
        rowNumber,
        collectionType: {
          collectionTypeName: getImportedValue(row, indexes.collectionTypeName),
          description: getImportedValue(row, indexes.description),
          expenseParentCoaId: "",
          status: "Active",
          type: normalizeImportedCollectionTypeType(getImportedValue(row, indexes.type)),
        },
      };
    });
}

export function validateCollectionTypeImportRows(rows: CollectionTypeImportPreviewRow[], existingCollectionTypes: CollectionType[]) {
  const existingNames = new Map(
    existingCollectionTypes.map((account) => [normalizeCollectionTypeName(account.collectionTypeName), account.collectionTypeName]),
  );
  const importedNameCounts = new Map<string, number>();

  rows.forEach((row) => {
    const normalizedName = normalizeCollectionTypeName(row.collectionType.collectionTypeName);

    if (normalizedName) {
      importedNameCounts.set(normalizedName, (importedNameCounts.get(normalizedName) ?? 0) + 1);
    }
  });

  return rows.map((row) => {
    const cellErrors: CollectionTypeImportCellErrors = {};
    const normalizedName = normalizeCollectionTypeName(row.collectionType.collectionTypeName);
    const typeOptions = CollectionTypeTypeOptions.map((option) => option.value);

    if (!row.collectionType.collectionTypeName.trim()) {
      cellErrors.collectionTypeName = ["Collection type name is required."];
    }

    const existingName = existingNames.get(normalizedName);

    if (existingName) {
      cellErrors.collectionTypeName = [...(cellErrors.collectionTypeName ?? []), `Collection type already exists: ${existingName}.`];
    }

    if (normalizedName && (importedNameCounts.get(normalizedName) ?? 0) > 1) {
      cellErrors.collectionTypeName = [...(cellErrors.collectionTypeName ?? []), "Duplicate name in import."];
    }

    if (!isModuleImportOptionValue(row.collectionType.type, typeOptions)) {
      cellErrors.type = ["Choose a valid type."];
    }

    return { ...row, cellErrors };
  });
}

export function CollectionTypeImportRowHasErrors(row: CollectionTypeImportPreviewRow) {
  return row.rowErrors.length > 0 || Object.values(row.cellErrors).some((errors) => Boolean(errors?.length));
}

export function validateCollectionTypeImportFileSize(file: File) {
  if (file.size < CollectionTypeImportMinFileSizeBytes) {
    return `Upload a file larger than ${formatFileSize(CollectionTypeImportMinFileSizeBytes)}.`;
  }

  if (file.size > CollectionTypeImportMaxFileSizeBytes) {
    return `Upload a file up to ${formatFileSize(CollectionTypeImportMaxFileSizeBytes)}.`;
  }

  return null;
}

export function isCollectionTypeImportGridPasteTarget(target: EventTarget | null) {
  return !(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement);
}

export function parseImportTabularRows(text: string) {
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  return normalizedText.includes("\t")
    ? normalizedText.split("\n").map((line) => line.split("\t").map((cell) => cell.trim()))
    : parseImportCsvRows(normalizedText);
}

export function waitForNextCollectionTypeImportBatch() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 75);
  });
}

function normalizeImportedCollectionTypeType(value: string): CollectionTypeType {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const typeOptions = CollectionTypeTypeOptions.map((option) => option.value);

  if (["collection", "collections", "collectiontype"].includes(normalized)) return "COLLECTION";
  if (["service", "services", "servicetype", "expense", "expensetype"].includes(normalized)) {
    return "EXPENSE";
  }

  return (getModuleImportOptionValue(value, typeOptions) ?? value) as CollectionTypeType;
}

function getCollectionTypeImportHeaderIndexes(row: string[]) {
  const indexes: Partial<Record<CollectionTypeImportColumnId, number>> = {};

  row.forEach((cell, index) => {
    const key = normalizeCollectionTypeImportHeader(cell);

    if (key) indexes[key] = index;
  });

  return Object.keys(indexes).length >= 2 ? indexes : null;
}

function normalizeCollectionTypeImportHeader(value: string): CollectionTypeImportColumnId | null {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (["collectionTypeName", "defaultname", "name"].includes(normalized)) {
    return "collectionTypeName";
  }
  if (["description", "remarks", "details"].includes(normalized)) {
    return "description";
  }
  if (["type", "CollectionTypetype"].includes(normalized)) return "type";
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

export function getCollectionTypeTypeLabel(type: CollectionTypeType) {
  return CollectionTypeTypeOptions.find((option) => option.value === type)?.label ?? type;
}
