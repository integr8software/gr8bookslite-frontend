import type {
  ServicesMaintenance,
  ServicesMaintenanceAccountSetupMode,
  ServicesMaintenanceFormValues,
  ServicesMaintenanceImportCellErrors,
  ServicesMaintenanceImportColumnId,
  ServicesMaintenanceImportPreviewRow,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import {
  ServicesMaintenanceAccountSetupModeOptions,
  ServicesMaintenanceImportDefaultColumnIndexes,
  ServicesMaintenanceImportMaxFileSizeBytes,
  ServicesMaintenanceImportMinFileSizeBytes,
  ServicesMaintenanceImportTemplateHeaders,
} from "@/app/src/constants/modules/financial-maintenance/services-maintenance/ServicesMaintenanceConstants";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { formatFileSize } from "@/app/src/utils/file.util";
import {
  getModuleImportOptionValue,
  isModuleImportOptionValue,
} from "@/app/src/utils/module-import-validation.util";

export const ServicesMaintenanceInitialFormValues: ServicesMaintenanceFormValues = {
  serviceName: "",
  description: "",
  status: "Active",
  accountSetupMode: "Auto",
  revenueCoaId: "",
};

export function createServicesMaintenanceFormValues(
  service: ServicesMaintenance,
): ServicesMaintenanceFormValues {
  return {
    serviceName: service.serviceName,
    description: service.description,
    status: service.status,
    accountSetupMode: service.accountSetupMode,
    revenueCoaId: service.accountSetupMode === "Existing" ? service.revenueCoaId : "",
  };
}

export function updateServicesMaintenanceFromForm(
  service: ServicesMaintenance,
  values: ServicesMaintenanceFormValues,
): ServicesMaintenance {
  return {
    ...service,
    ...values,
    serviceName: values.serviceName.trim(),
    description: values.description.trim(),
    revenueAccountTitle:
      values.accountSetupMode === "Auto"
        ? buildGeneratedServiceRevenueAccountTitle(values.serviceName)
        : service.revenueAccountTitle,
  };
}

export function buildGeneratedServiceRevenueAccountTitle(serviceName: string) {
  return `${serviceName.trim()}`;
}

export function getServicesMaintenanceTableMinWidthClassName(visibleColumnCount: number) {
  if (visibleColumnCount >= 9) return "min-w-[126rem]";
  if (visibleColumnCount >= 8) return "min-w-[112rem]";
  if (visibleColumnCount >= 7) return "min-w-[98rem]";
  if (visibleColumnCount >= 6) return "min-w-[84rem]";
  return "min-w-[68rem]";
}

export function createBlankServicesMaintenanceImportRow(
  rowNumber: number,
): ServicesMaintenanceImportPreviewRow {
  return {
    cellErrors: {},
    id: `services-maintenance-import-preview-${rowNumber}-${Date.now()}`,
    rowErrors: [],
    rowNumber,
    service: {
      accountSetupMode: "Auto",
      description: "",
      revenueCoaId: "",
      serviceName: "",
      status: "Active",
    },
  };
}

export function getNextServicesMaintenanceImportRowNumber(
  rows: ServicesMaintenanceImportPreviewRow[],
) {
  return Math.max(0, ...rows.map((row) => row.rowNumber)) + 1;
}

export function renumberServicesMaintenanceImportRows(rows: ServicesMaintenanceImportPreviewRow[]) {
  return rows.map((row, index) => ({ ...row, rowNumber: index + 1 }));
}

export function normalizeServicesMaintenanceName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeImportedServicesMaintenanceCellValue(
  field: ServicesMaintenanceImportColumnId,
  value: string,
) {
  if (field === "accountSetupMode") {
    return normalizeImportedServicesMaintenanceSetupMode(value);
  }
  return value;
}

export async function downloadServicesMaintenanceImportTemplate() {
  try {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.default.Workbook();
    const worksheet = workbook.addWorksheet("Services");

    worksheet.addRow(ServicesMaintenanceImportTemplateHeaders);
    for (let rowNumber = 2; rowNumber <= 101; rowNumber += 1) {
      worksheet.getCell(`C${rowNumber}`).dataValidation = {
        allowBlank: false,
        formulae: [`"${ServicesMaintenanceAccountSetupModeOptions.join(",")}"`],
        showErrorMessage: true,
        type: "list",
      };
    }
    worksheet.columns = [{ width: 30 }, { width: 42 }, { width: 18 }, { width: 28 }];

    const buffer = await workbook.xlsx.writeBuffer();

    downloadBlob(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "services-maintenance-import-template.xlsx",
    );
  } catch {
    downloadBlob(
      new Blob([createImportTemplateCsv(ServicesMaintenanceImportTemplateHeaders)], {
        type: "text/csv;charset=utf-8",
      }),
      "services-maintenance-import-template.csv",
    );
  }
}

export async function readServicesMaintenanceImportFileText(file: File) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".xlsx")) {
    return formatImportRowsAsText(await readImportXlsxRows(await file.arrayBuffer()));
  }

  if (fileName.endsWith(".csv") || fileName.endsWith(".tsv") || fileName.endsWith(".txt")) {
    return (await file.text()).trim();
  }

  throw new Error("Please upload an .xlsx, .csv, .tsv, or .txt file.");
}

export function parseServicesMaintenanceImportText(
  text: string,
  startRowNumber = 1,
): ServicesMaintenanceImportPreviewRow[] {
  const rows = parseImportTabularRows(text).filter((row) => row.some((cell) => cell.trim() !== ""));

  if (rows.length === 0) return [];

  const headerIndexes = getServicesMaintenanceImportHeaderIndexes(rows[0]);
  const indexes = headerIndexes ?? ServicesMaintenanceImportDefaultColumnIndexes;
  const dataRows = headerIndexes ? rows.slice(1) : rows;
  const importBatchId = Date.now();

  return dataRows
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row, index) => {
      const rowNumber = startRowNumber + index;

      return {
        cellErrors: {},
        id: `services-maintenance-import-preview-${rowNumber}-${importBatchId}-${index}`,
        rowErrors: [],
        rowNumber,
        service: {
          accountSetupMode: normalizeImportedServicesMaintenanceSetupMode(
            getImportedValue(row, indexes.accountSetupMode),
          ),
          description: getImportedValue(row, indexes.description),
          revenueCoaId: getImportedValue(row, indexes.revenueCoaId),
          serviceName: getImportedValue(row, indexes.serviceName),
          status: "Active",
        },
      };
    });
}

export function validateServicesMaintenanceImportRows(
  rows: ServicesMaintenanceImportPreviewRow[],
  existingServices: ServicesMaintenance[],
) {
  const existingNames = new Map(
    existingServices.map((service) => [
      normalizeServicesMaintenanceName(service.serviceName),
      service.serviceName,
    ]),
  );
  const importedNameCounts = new Map<string, number>();

  rows.forEach((row) => {
    const normalizedName = normalizeServicesMaintenanceName(row.service.serviceName);

    if (normalizedName) {
      importedNameCounts.set(normalizedName, (importedNameCounts.get(normalizedName) ?? 0) + 1);
    }
  });

  return rows.map((row) => {
    const cellErrors: ServicesMaintenanceImportCellErrors = {};
    const normalizedName = normalizeServicesMaintenanceName(row.service.serviceName);

    if (!row.service.serviceName.trim()) {
      cellErrors.serviceName = ["Service name is required."];
    }

    const existingName = existingNames.get(normalizedName);

    if (existingName) {
      cellErrors.serviceName = [
        ...(cellErrors.serviceName ?? []),
        `Service already exists: ${existingName}.`,
      ];
    }

    if (normalizedName && (importedNameCounts.get(normalizedName) ?? 0) > 1) {
      cellErrors.serviceName = [...(cellErrors.serviceName ?? []), "Duplicate name in import."];
    }

    if (row.service.description.trim().length > 500) {
      cellErrors.description = ["Description must be 500 characters or fewer."];
    }

    if (
      !isModuleImportOptionValue(
        row.service.accountSetupMode,
        ServicesMaintenanceAccountSetupModeOptions,
      )
    ) {
      cellErrors.accountSetupMode = ["Choose Auto or Existing."];
    }

    if (row.service.accountSetupMode === "Existing" && !row.service.revenueCoaId.trim()) {
      cellErrors.revenueCoaId = ["Revenue account ID is required for Existing setup."];
    }

    return { ...row, cellErrors };
  });
}

export function serviceImportRowHasErrors(row: ServicesMaintenanceImportPreviewRow) {
  return (
    row.rowErrors.length > 0 ||
    Object.values(row.cellErrors).some((errors) => Boolean(errors?.length))
  );
}

export function validateServicesMaintenanceImportFileSize(file: File) {
  if (file.size < ServicesMaintenanceImportMinFileSizeBytes) {
    return `Upload a file larger than ${formatFileSize(ServicesMaintenanceImportMinFileSizeBytes)}.`;
  }

  if (file.size > ServicesMaintenanceImportMaxFileSizeBytes) {
    return `Upload a file up to ${formatFileSize(ServicesMaintenanceImportMaxFileSizeBytes)}.`;
  }

  return null;
}

export function isServicesMaintenanceImportGridPasteTarget(target: EventTarget | null) {
  return !(
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

export function parseImportTabularRows(text: string) {
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  return normalizedText.includes("\t")
    ? normalizedText.split("\n").map((line) => line.split("\t").map((cell) => cell.trim()))
    : parseImportCsvRows(normalizedText);
}

export function waitForNextServicesMaintenanceImportBatch() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 75);
  });
}

function normalizeImportedServicesMaintenanceSetupMode(
  value: string,
): ServicesMaintenanceAccountSetupMode {
  const normalized = value.trim().toLowerCase();

  if (!normalized || normalized === "auto" || normalized === "automatic") {
    return "Auto";
  }
  if (normalized === "existing" || normalized === "manual") return "Existing";

  return (getModuleImportOptionValue(value, ServicesMaintenanceAccountSetupModeOptions) ??
    value) as ServicesMaintenanceAccountSetupMode;
}

function getServicesMaintenanceImportHeaderIndexes(row: string[]) {
  const indexes: Partial<Record<ServicesMaintenanceImportColumnId, number>> = {};

  row.forEach((cell, index) => {
    const key = normalizeServicesMaintenanceImportHeader(cell);

    if (key) indexes[key] = index;
  });

  return Object.keys(indexes).length >= 2 ? indexes : null;
}

function normalizeServicesMaintenanceImportHeader(
  value: string,
): ServicesMaintenanceImportColumnId | null {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (["servicename", "service", "name"].includes(normalized)) return "serviceName";
  if (["description", "remarks", "details"].includes(normalized)) return "description";
  if (["accountsetup", "accountsetupmode", "setup"].includes(normalized)) return "accountSetupMode";
  if (["revenueaccountid", "revenuecoaid", "accountid"].includes(normalized)) return "revenueCoaId";
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
  return [headers]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

function getImportedValue(row: string[], index?: number) {
  return typeof index === "number" ? String(row[index] ?? "").trim() : "";
}
