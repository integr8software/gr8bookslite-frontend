import {
  DefaultCashVoucherAccountingGridColumnOrder,
  CashVoucherAccountingCreditColumnId,
  CashVoucherAccountingDebitColumnId,
  CashVoucherAccountingImportTemplateHeaders,
  } from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import { CashVoucherLink,
  CashVoucherAddLink,
  getCashVoucherEditLink,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import {
  createBlankCashVoucherLineEntry,
  createTaxDetails,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import type {
  CashVoucherAccountingGridColumnId as GridColumnId,
  EditableCashVoucherAccountingGridRow as EditableGridRow,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import type {
  CashVoucherAttachment as VoucherAttachment,
  CashVoucherLineEntry,
  CashVoucherAccountingGridSession,
  CashVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import { formatAmount } from "@/app/src/utils/currency.util";

export function createInitialRows(entries: CashVoucherLineEntry[]) {
  const mappedRows = entries.map(mapEntryToEditableRow);

  if (mappedRows.length >= 6) {
    return mappedRows;
  }

  return [...mappedRows, ...Array.from({ length: 6 - mappedRows.length }, createBlankEditableRow)];
}

function mapEntryToEditableRow(entry: CashVoucherLineEntry): EditableGridRow {
  return {
    accountCode: entry.accountCode,
    accountName: entry.accountName,
    credit: entry.credit > 0 ? formatAmount(entry.credit) : "",
    debit: entry.debit > 0 ? formatAmount(entry.debit) : "",
    id: entry.id,
    remarks: entry.remarks,
    taxDetails: entry.taxDetails,
    taxRate: entry.taxRate || "0%",
  };
}

export function createBlankEditableRow(): EditableGridRow {
  return {
    accountCode: "",
    accountName: "",
    credit: "",
    debit: "",
    id: createGridRowId(),
    remarks: "",
    taxDetails: createTaxDetails(0, "0%"),
    taxRate: "0%",
  };
}

export function createGridRowId() {
  return `grid-${Math.random().toString(36).slice(2, 10)}`;
}

export function isGridColumnId(columnId: string): columnId is GridColumnId {
  return DefaultCashVoucherAccountingGridColumnOrder.includes(columnId as GridColumnId);
}

export function createImportSourceAttachment(name: string, size: number) {
  return {
    id: `accounting-import-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    size,
    sizeLabel: formatImportSourceSize(size),
    type: "Imported accounting entries",
  };
}

export function withAccountingImportAttachment(values: CashVoucherFormValues, attachment: VoucherAttachment | null) {
  if (!attachment) {
    return values;
  }

  const existingAttachments = values.attachments.filter(
    (currentAttachment) => currentAttachment.id !== attachment.id && currentAttachment.name !== attachment.name,
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

export function parseImportPreviewRows(text: string) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return [];
  }

  const delimiter = trimmedText.includes("\t") ? "\t" : ",";
  const rows =
    delimiter === "\t" ? trimmedText.split(/\r?\n/).map((line) => line.split("\t").map((cell) => cell.trim())) : parseCsvRows(trimmedText);

  return rows
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
    .map((row) => CashVoucherAccountingImportTemplateHeaders.map((_, index) => String(row[index] ?? "").trim()));
}

export function clearImportPreviewText(text: string, action: ModuleDataEntryClearAction) {
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

  return Boolean(String(row[0] ?? "").trim() && String(row[1] ?? "").trim() && String(row[2] ?? "").trim() && (debit || credit));
}

export function parseTabularText(text: string) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error("No pasted accounting rows were found.");
  }

  const delimiter = trimmedText.includes("\t") ? "\t" : ",";
  const rawRows =
    delimiter === "\t" ? trimmedText.split(/\r?\n/).map((line) => line.split("\t").map((cell) => cell.trim())) : parseCsvRows(trimmedText);

  return mapImportedRows(rawRows);
}

export async function readXlsxAccountingRawRows(buffer: ArrayBuffer) {
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
      const value = cellType === "s" ? (sharedStrings[Number(rawValue)] ?? "") : rawValue;

      if (columnIndex >= 0) {
        cells[columnIndex] = value.trim();
      }
    });

    return cells;
  });

  return rows;
}

export function formatRowsAsTabularText(rows: string[][]) {
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
  const rows = rawRows.filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""));

  if (rows.length === 0) {
    throw new Error("No accounting rows were found to import.");
  }

  const headerIndexes = getImportHeaderIndexes(rows[0]);
  const dataRows = headerIndexes ? rows.slice(1) : rows;
  const indexes = headerIndexes ?? {
    accountCode: 0,
    accountName: 1,
    remarks: 2,
    taxRate: 3,
    debit: 4,
    credit: 5,
  };
  const importedRows = dataRows.map((row) => createImportedGridRow(row, indexes)).filter(hasRowData);

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

  return Object.keys(indexes).length >= 2 ? (indexes as Partial<Record<GridColumnId, number>>) : null;
}

function normalizeImportHeader(value: string): GridColumnId | null {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (["accountcode", "acctcode", "code", "glcode"].includes(normalized)) {
    return "accountCode";
  }

  if (["accountname", "acctname", "name", "glname"].includes(normalized)) {
    return "accountName";
  }

  if (["remarks", "particulars", "particular", "description", "memo"].includes(normalized)) {
    return "remarks";
  }

  if (["taxrate", "tax", "vat", "vatrate"].includes(normalized)) {
    return "taxRate";
  }

  if ([CashVoucherAccountingDebitColumnId, "dr"].includes(normalized)) {
    return CashVoucherAccountingDebitColumnId;
  }

  if ([CashVoucherAccountingCreditColumnId, "cr"].includes(normalized)) {
    return CashVoucherAccountingCreditColumnId;
  }

  return null;
}

function createImportedGridRow(row: string[], indexes: Partial<Record<GridColumnId, number>>): EditableGridRow {
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
    remarks: getImportedValue(row, indexes.remarks),
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

  return Number.isFinite(amount) && amount > 0 ? formatAmount(amount) : "";
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
    const fileNameBytes = new Uint8Array(buffer, centralDirectoryOffset + 46, fileNameLength);
    const fileName = decoder.decode(fileNameBytes);
    const localFileNameLength = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
    const dataOffset = localHeaderOffset + 30 + localFileNameLength + localExtraLength;
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

  const stream = new Blob([compressedBytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));

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

  const worksheetPath = Array.from(entries.keys()).find((path) => path.startsWith("xl/worksheets/") && path.endsWith(".xml"));

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

export function hasRowValue(row: EditableGridRow) {
  return Boolean(
    row.accountCode.trim() ||
    row.accountName.trim() ||
    row.remarks.trim() ||
    normalizeAmount(row.debit) > 0 ||
    normalizeAmount(row.credit) > 0,
  );
}

export function shouldClearRow(row: EditableGridRow, action: Exclude<ModuleDataEntryClearAction, "all">) {
  if (action === "with-data") {
    return hasRowData(row);
  }

  if (action === "incomplete") {
    return hasRowData(row) && !isCompleteRow(row);
  }

  return !hasRowData(row);
}

export function hasRowData(row: EditableGridRow) {
  return (
    row.accountCode.trim() !== "" ||
    row.accountName.trim() !== "" ||
    row.remarks.trim() !== "" ||
    normalizeAmount(row.debit) > 0 ||
    normalizeAmount(row.credit) > 0 ||
    row.taxRate !== "0%"
  );
}

export function isCompleteRow(row: EditableGridRow) {
  return (
    row.accountCode.trim() !== "" &&
    row.accountName.trim() !== "" &&
    row.remarks.trim() !== "" &&
    (normalizeAmount(row.debit) > 0 || normalizeAmount(row.credit) > 0)
  );
}

export function normalizeAmount(value: string) {
  return parseMoneyNumberInput(value);
}

export function getExportCellValue(row: EditableGridRow, columnId: GridColumnId) {
  return row[columnId];
}

let accountingGridTextMeasureContext: CanvasRenderingContext2D | null | undefined;

export function calculateGridColumnFitWidth({
  columnId,
  columnLabels,
  rows,
}: {
  columnId: GridColumnId;
  columnLabels: Record<GridColumnId, string>;
  rows: EditableGridRow[];
}) {
  const headerWidth = estimateGridTextWidth(columnLabels[columnId], 76);
  const contentWidth = rows.reduce((currentWidth, row) => Math.max(currentWidth, estimateGridTextWidth(row[columnId] ?? "", 24)), 50);

  return Math.max(headerWidth, contentWidth);
}

function estimateGridTextWidth(value: string, horizontalPadding: number) {
  const textWidth = measureGridTextWidth(value);

  return Math.min(800, Math.max(50, Math.ceil(textWidth + horizontalPadding)));
}

function measureGridTextWidth(value: string) {
  const fallbackWidth = estimateFallbackTextWidth(value);

  if (typeof document === "undefined") {
    return fallbackWidth;
  }

  if (accountingGridTextMeasureContext === undefined) {
    accountingGridTextMeasureContext = document.createElement("canvas").getContext("2d");
  }

  if (!accountingGridTextMeasureContext) {
    return fallbackWidth;
  }

  accountingGridTextMeasureContext.font = "500 14px Inter, Arial, Helvetica, sans-serif";

  return accountingGridTextMeasureContext.measureText(value).width;
}

function estimateFallbackTextWidth(value: string) {
  return Array.from(value).reduce((width, character) => width + getEstimatedCharacterWidth(character), 0);
}

function getEstimatedCharacterWidth(character: string) {
  if (character === " ") {
    return 4;
  }

  if ("ilI.,:;!'`|".includes(character)) {
    return 4.2;
  }

  if ("mwMW@#%&".includes(character)) {
    return 9.2;
  }

  if (/[0-9]/.test(character)) {
    return 7.4;
  }

  return 7;
}

export function downloadBytesFile(fileName: string, content: Uint8Array, type: string) {
  const buffer = new ArrayBuffer(content.byteLength);

  new Uint8Array(buffer).set(content);

  const blob = new Blob([buffer], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function buildLineEntries(rows: EditableGridRow[]): CashVoucherLineEntry[] {
  const entries: CashVoucherLineEntry[] = rows.filter(hasRowValue).map((row) => {
    const debit = normalizeAmount(row.debit);
    const credit = normalizeAmount(row.credit);
    const amount = debit || credit;

    return {
      accountCode: row.accountCode.trim(),
      accountName: row.accountName.trim(),
      credit,
      debit,
      id: row.id,
      remarks: row.remarks.trim(),
      status: "Pending",
      taxDetails: syncTaxDetailsAmount(row.taxDetails, amount, row.taxRate),
      taxRate: row.taxRate || "0%",
    };
  });

  return entries.length > 0 ? entries : [createBlankCashVoucherLineEntry()];
}

export function createVoucherActionReturnLink(session: CashVoucherAccountingGridSession | null) {
  if (!session) {
    return CashVoucherLink;
  }

  if (session.mode === "edit") {
    return getCashVoucherEditLink(session.values.transactionId);
  }

  const transactionQuery = session.values.transactionId ? `?transactionId=${encodeURIComponent(session.values.transactionId)}` : "";

  return `${CashVoucherAddLink}${transactionQuery}`;
}


