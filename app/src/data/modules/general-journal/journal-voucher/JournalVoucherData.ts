import type {
  JournalVoucherFormValues,
  JournalVoucherLine,
  JournalVoucherRecord,
} from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";

export function createJournalVoucherInitialFormValues(): JournalVoucherFormValues {
  return {
    transactionNo: "",
    documentDate: new Date().toISOString().slice(0, 10),
    remarks: "",
    currencyType: "PHP",
    currencyRate: 1,
    status: "Draft",
    lines: [createJournalVoucherLine(1), createJournalVoucherLine(2)],
  };
}

export function createJournalVoucherLine(lineNumber: number, overrides: Partial<JournalVoucherLine> = {}): JournalVoucherLine {
  return {
    id: `jv-line-${Date.now()}-${lineNumber}-${Math.random().toString(36).slice(2, 7)}`,
    lineNumber,
    accountCode: "",
    accountTitle: "",
    particulars: "",
    partyCode: "",
    partyName: "",
    responsibilityCenter: "",
    refNo: "",
    vatType: "VATable",
    atcCode: "",
    debit: 0,
    credit: 0,
    ...overrides,
  };
}

export function createJournalVoucherFormValues(record?: JournalVoucherRecord): JournalVoucherFormValues {
  if (!record) {
    return createJournalVoucherInitialFormValues();
  }

  return {
    transactionNo: record.transactionNo,
    documentDate: record.documentDate,
    remarks: record.remarks,
    currencyType: record.currencyType,
    currencyRate: record.currencyRate,
    status: record.status,
    lines: record.lines.map((line) => ({ ...line })),
  };
}

export function createJournalVoucherFromForm(values: JournalVoucherFormValues): JournalVoucherRecord {
  const now = new Date().toISOString();

  return {
    id: `jv-${Date.now()}`,
    ...values,
    transactionNo: values.transactionNo.trim(),
    remarks: values.remarks.trim(),
    lines: renumberJournalVoucherLines(values.lines),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateJournalVoucherFromForm(record: JournalVoucherRecord, values: JournalVoucherFormValues): JournalVoucherRecord {
  return {
    ...record,
    ...values,
    transactionNo: values.transactionNo.trim(),
    remarks: values.remarks.trim(),
    lines: renumberJournalVoucherLines(values.lines),
    updatedAt: new Date().toISOString(),
  };
}

export function renumberJournalVoucherLines(lines: JournalVoucherLine[]) {
  return lines.map((line, index) => ({
    ...line,
    lineNumber: index + 1,
  }));
}

export function getJournalVoucherTotals(
  lines: JournalVoucherLine[],
  persistedTotals?: Pick<JournalVoucherRecord, "totalDebit" | "totalCredit">,
) {
  const totalDebit =
    lines.length > 0 ? lines.reduce((sum, line) => sum + Number(line.debit || 0), 0) : Number(persistedTotals?.totalDebit ?? 0);
  const totalCredit =
    lines.length > 0 ? lines.reduce((sum, line) => sum + Number(line.credit || 0), 0) : Number(persistedTotals?.totalCredit ?? 0);
  const variance = totalDebit - totalCredit;

  return {
    totalCredit,
    totalDebit,
    variance,
    isBalanced: lines.length > 0 && totalDebit > 0 && totalCredit > 0 && Math.abs(variance) < 0.001,
  };
}

export function formatJournalVoucherAmount(value: number) {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
