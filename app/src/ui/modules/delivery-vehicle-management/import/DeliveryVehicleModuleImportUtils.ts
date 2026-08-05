import { AppMaxFileUploadSizeBytes } from "@/app/src/constants/shared/app/AppConstants";
import type {
  DeliveryVehicleField,
  DeliveryVehicleImportPreviewRow,
  DeliveryVehicleModuleConfig,
  DeliveryVehicleModuleRecord,
} from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { formatFileSize } from "@/app/src/utils/file.util";
import { isModuleImportOptionValue } from "@/app/src/utils/module-import.util";

export const DeliveryVehicleImportPreviewPageSize = 20;
export const DeliveryVehicleImportBatchSize = 25;
export const DeliveryVehicleImportAcceptedFileExtensions = ".xlsx,.csv,.tsv,.txt";
export const DeliveryVehicleImportAcceptedFileLabel = ".xlsx, .csv, .tsv, .txt";

export function getDeliveryVehicleImportFields(config: DeliveryVehicleModuleConfig) {
  return config.fields.filter(
    (field) => config.key !== "vehicle-types" || field.key !== "capacityUnit",
  );
}

export function getDeliveryVehicleImportColumnWidth(field: DeliveryVehicleField) {
  if (field.type === "textarea") return 260;
  if (field.type === "select") return 190;
  if (field.type === "number") return 150;
  return field.key === "typeName" ? 224 : 180;
}

export function createBlankDeliveryVehicleImportRow(
  rowNumber: number,
  fields: readonly DeliveryVehicleField[],
): DeliveryVehicleImportPreviewRow {
  return {
    cellErrors: {},
    cellWarnings: {},
    id: `delivery-vehicle-import-preview-${rowNumber}-${Date.now()}`,
    rowErrors: [],
    rowNumber,
    values: Object.fromEntries(fields.map((field) => [field.key, field.defaultValue ?? ""])),
  };
}

export function renumberDeliveryVehicleImportRows(rows: DeliveryVehicleImportPreviewRow[]) {
  return rows.map((row, index) => ({ ...row, rowNumber: index + 1 }));
}

export function getNextDeliveryVehicleImportRowNumber(rows: DeliveryVehicleImportPreviewRow[]) {
  return Math.max(0, ...rows.map((row) => row.rowNumber)) + 1;
}

export function parseDeliveryVehicleImportText(
  text: string,
  fields: readonly DeliveryVehicleField[],
  startRowNumber = 1,
): DeliveryVehicleImportPreviewRow[] {
  const rows = parseDeliveryVehicleImportTabularRows(text).filter((row) =>
    row.some((cell) => cell.trim() !== ""),
  );

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

export function validateDeliveryVehicleImportRows(
  rows: DeliveryVehicleImportPreviewRow[],
  fields: readonly DeliveryVehicleField[],
  existingNames: Map<string, string>,
) {
  const typeNameCounts = new Map<string, number>();

  rows.forEach((row) => {
    const normalizedName = normalizeDeliveryVehicleImportText(row.values.typeName ?? "");

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

    const normalizedTypeName = normalizeDeliveryVehicleImportText(row.values.typeName ?? "");
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

export function createDeliveryVehicleImportExistingNameMap(records: DeliveryVehicleModuleRecord[]) {
  return new Map(
    records
      .map((record) => record.fields.typeName ?? record.name)
      .filter(Boolean)
      .map((name) => [normalizeDeliveryVehicleImportText(name), name]),
  );
}

export function deliveryVehicleImportRowHasErrors(row: DeliveryVehicleImportPreviewRow) {
  return (
    row.rowErrors.length > 0 ||
    Object.values(row.cellErrors).some((errors) => Boolean(errors?.length))
  );
}

export function parseDeliveryVehicleImportTabularRows(text: string) {
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  return normalizedText.includes("\t")
    ? normalizedText.split("\n").map((line) => line.split("\t").map((cell) => cell.trim()))
    : parseCsvRows(normalizedText);
}

export function normalizeDeliveryVehicleImportedValue(
  field: DeliveryVehicleField | undefined,
  value: string,
) {
  return normalizeImportedValue(field, value);
}

export function applyDeliveryVehicleImportDefaultValues(
  values: Record<string, string>,
  config: DeliveryVehicleModuleConfig,
) {
  return Object.fromEntries(
    config.fields.map((field) => [field.key, values[field.key] ?? field.defaultValue ?? ""]),
  );
}

export async function downloadDeliveryVehicleImportTemplate(
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

export async function readDeliveryVehicleImportFileText(file: File) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".xlsx")) {
    return formatRowsAsText(await readXlsxRows(await file.arrayBuffer()));
  }

  if (fileName.endsWith(".csv") || fileName.endsWith(".tsv") || fileName.endsWith(".txt")) {
    return (await file.text()).trim();
  }

  throw new Error("Please upload an .xlsx, .csv, .tsv, or .txt file.");
}

export function validateDeliveryVehicleImportFileSize(file: File) {
  if (file.size < 1) {
    return `Upload a file larger than ${formatFileSize(1)}.`;
  }

  if (file.size > AppMaxFileUploadSizeBytes) {
    return `Upload a file up to ${formatFileSize(AppMaxFileUploadSizeBytes)}.`;
  }

  return null;
}

export function isDeliveryVehicleImportGridPasteTarget(target: EventTarget | null) {
  return !(
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

export function waitForNextDeliveryVehicleImportBatch() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 75);
  });
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

function normalizeDeliveryVehicleImportText(value: string) {
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

function createTemplateCsv(headers: string[]) {
  return [headers]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
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
