import {
  CashVoucherAccountingCreditColumnId,
  CashVoucherAccountingDebitColumnId,
  CashVoucherAccountingImportTemplateHeaders,
  DefaultCashVoucherAccountingGridColumnOrder,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import {
  CashVoucherAddLink,
  CashVoucherLink,
  getCashVoucherEditLink,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import {
  createBlankCashVoucherLineEntry,
  createTaxDetails,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import {
  createGridRowId,
  downloadBytesFile,
  estimateGridTextWidth,
  formatImportSourceSize,
  formatRowsAsTabularText,
  normalizeImportedAmount,
  normalizeTaxRate,
  parseCsvRows,
  readXlsxAccountingRawRows,
} from "@/app/src/services/shared/accounting/AccountingGridSpreadsheetService";
import type {
  CashVoucherAccountingGridColumnId as GridColumnId,
  EditableCashVoucherAccountingGridRow as EditableGridRow,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import type {
  CashVoucherAccountingGridSession,
  CashVoucherAttachment as VoucherAttachment,
  CashVoucherFormValues,
  CashVoucherLineEntry,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import { formatAmount } from "@/app/src/utils/currency.util";

export {
  createGridRowId,
  downloadBytesFile,
  formatRowsAsTabularText,
  readXlsxAccountingRawRows,
};

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

export function parseImportPreviewRows(text: string) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return [];
  }

  const delimiter = trimmedText.includes("\t") ? "\t" : ",";
  const rows =
    delimiter === "\t"
      ? trimmedText.split(/\r?\n/).map((line) => line.split("\t").map((cell) => cell.trim()))
      : parseCsvRows(trimmedText);

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

  return Boolean(
    String(row[0] ?? "").trim() &&
      String(row[1] ?? "").trim() &&
      String(row[2] ?? "").trim() &&
      (debit || credit),
  );
}

export function parseTabularText(text: string) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error("No pasted accounting rows were found.");
  }

  const delimiter = trimmedText.includes("\t") ? "\t" : ",";
  const rawRows =
    delimiter === "\t"
      ? trimmedText.split(/\r?\n/).map((line) => line.split("\t").map((cell) => cell.trim()))
      : parseCsvRows(trimmedText);

  return mapImportedRows(rawRows);
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
  const contentWidth = rows.reduce(
    (currentWidth, row) => Math.max(currentWidth, estimateGridTextWidth(row[columnId] ?? "", 24)),
    50,
  );

  return Math.max(headerWidth, contentWidth);
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

  const transactionQuery = session.values.transactionId
    ? `?transactionId=${encodeURIComponent(session.values.transactionId)}`
    : "";

  return `${CashVoucherAddLink}${transactionQuery}`;
}
