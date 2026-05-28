import { BeginningBalanceUploaderColumns } from "@/app/src/constants/modules/beginning-balance-uploader/BeginningBalanceUploaderConstants";
import type {
  BeginningBalanceUploaderField,
  BeginningBalanceUploaderRow,
  BeginningBalanceUploaderTotals,
} from "@/app/src/types/modules/beginning-balance-uploader/BeginningBalanceUploaderTypes";

export const BeginningBalanceUploaderInitialRows: BeginningBalanceUploaderRow[] = [
  createBeginningBalanceUploaderRow(1),
];

export function createBeginningBalanceUploaderRow(
  id: number,
): BeginningBalanceUploaderRow {
  return {
    id,
    date: "",
    refType: "",
    refTransId: "",
    accntCode: "",
    accntTitle: "",
    partyCode: "",
    partyName: "",
    debit: "",
    credit: "",
    refNo: "",
  };
}

export function getNextBeginningBalanceUploaderRowId(
  rows: BeginningBalanceUploaderRow[],
) {
  return Math.max(0, ...rows.map((row) => row.id)) + 1;
}

export function getBeginningBalanceUploaderTotals(
  rows: BeginningBalanceUploaderRow[],
): BeginningBalanceUploaderTotals {
  const debit = rows.reduce((sum, row) => sum + toAmount(row.debit), 0);
  const credit = rows.reduce((sum, row) => sum + toAmount(row.credit), 0);

  return {
    debit,
    credit,
    variance: debit - credit,
  };
}

export function parseBeginningBalanceSpreadsheetText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((row, index, allRows) => row.length > 0 || index < allRows.length - 1)
    .map((row) => row.split("\t"));
}

export function isBeginningBalanceHeaderRow(
  row: string[] | undefined,
  startColumnIndex: number,
) {
  if (!row?.length) {
    return false;
  }

  return row.every((cell, index) => {
    const column = BeginningBalanceUploaderColumns[startColumnIndex + index];
    return column && normalizeHeader(cell) === normalizeHeader(column.label);
  });
}

export function normalizeBeginningBalancePastedCell(
  field: BeginningBalanceUploaderField,
  value: string,
) {
  const trimmedValue = value.trim();

  if (field !== "date") {
    return trimmedValue;
  }

  return normalizeDateValue(trimmedValue);
}

export function formatBeginningBalanceAmount(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function toAmount(value: string) {
  const amount = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeDateValue(value: string) {
  if (!value || /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const dateParts = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);

  if (!dateParts) {
    return value;
  }

  const firstPart = Number(dateParts[1]);
  const secondPart = Number(dateParts[2]);
  const year = normalizeYear(dateParts[3]);
  const month = firstPart > 12 ? secondPart : firstPart;
  const day = firstPart > 12 ? firstPart : secondPart;

  if (!isValidDateParts(year, month, day)) {
    return value;
  }

  return `${year}-${padDatePart(month)}-${padDatePart(day)}`;
}

function normalizeYear(value: string) {
  const year = Number(value);
  return value.length === 2 ? 2000 + year : year;
}

function isValidDateParts(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function padDatePart(value: number) {
  return value.toString().padStart(2, "0");
}
