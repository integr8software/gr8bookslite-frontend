import {
  formatJournalVoucherAmount,
  getJournalVoucherTotals,
} from "@/app/src/data/modules/general-journal/journal-voucher/JournalVoucherData";
import type {
  JournalVoucherFormValues,
  JournalVoucherLine,
} from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";

export function getJournalVoucherReportTotals(values: JournalVoucherFormValues) {
  return getJournalVoucherTotals(values.lines);
}

export function formatJournalVoucherReportAmount(value: number) {
  return formatJournalVoucherAmount(Number(value || 0));
}

export function formatJournalVoucherReportAccount(accountCode: string, accountTitle: string) {
  if (accountCode && accountTitle) {
    return `${accountCode} - ${accountTitle}`;
  }

  return accountCode || accountTitle || "-";
}

export function formatJournalVoucherReportDate(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatJournalVoucherReportExchangeRate(value: number) {
  const numericValue = Number(value || 0);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "-";
  }

  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(numericValue);
}

export function getJournalVoucherEntryPartyLabel(line: JournalVoucherLine) {
  return line.partyName || line.partyCode || "-";
}

export function getJournalVoucherEntryParticulars(line: JournalVoucherLine, values: JournalVoucherFormValues) {
  return line.particulars || values.remarks || "-";
}
