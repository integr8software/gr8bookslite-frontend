import type {
  JournalVoucherFormValues,
  JournalVoucherLine,
  JournalVoucherRecord,
} from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";

export const MockJournalVouchers: JournalVoucherRecord[] = [
  {
    id: "jv-2026-0001",
    transactionNo: "JV-2026-0001",
    documentDate: "2026-05-31",
    remarks: "Month-end accrual for professional services.",
    currencyType: "PHP",
    currencyRate: 1,
    status: "Open",
    lines: [
      createJournalVoucherLine(1, {
        id: "jv-2026-0001-line-1",
        accountCode: "6080-011",
        accountTitle: "Professional Fees",
        particulars: "Accrual for legal retainer services",
        responsibilityCenter: "CC-LGL-201",
        refNo: "ACCR-2026-05",
        debit: 25000,
      }),
      createJournalVoucherLine(2, {
        id: "jv-2026-0001-line-2",
        accountCode: "2100-010",
        accountTitle: "Accrued Expenses",
        particulars: "Offsetting accrual liability",
        responsibilityCenter: "CC-LGL-201",
        refNo: "ACCR-2026-05",
        credit: 25000,
      }),
    ],
    createdAt: "2026-05-31T08:00:00.000Z",
    updatedAt: "2026-05-31T08:00:00.000Z",
  },
  {
    id: "jv-2026-0002",
    transactionNo: "JV-2026-0002",
    documentDate: "2026-06-15",
    remarks: "Reclassification of prepaid insurance to expense.",
    currencyType: "PHP",
    currencyRate: 1,
    status: "Draft",
    lines: [
      createJournalVoucherLine(1, {
        id: "jv-2026-0002-line-1",
        accountCode: "6200-018",
        accountTitle: "Insurance Expense",
        particulars: "Monthly amortization of prepaid policy",
        responsibilityCenter: "CC-ADM-001",
        refNo: "PREPAID-INS-2026",
        debit: 8200,
      }),
      createJournalVoucherLine(2, {
        id: "jv-2026-0002-line-2",
        accountCode: "1300-040",
        accountTitle: "Prepaid Insurance",
        particulars: "Reduce prepaid insurance asset",
        responsibilityCenter: "CC-ADM-001",
        refNo: "PREPAID-INS-2026",
        credit: 8200,
      }),
    ],
    createdAt: "2026-06-15T08:00:00.000Z",
    updatedAt: "2026-06-15T08:00:00.000Z",
  },
];

export function createJournalVoucherInitialFormValues(): JournalVoucherFormValues {
  return {
    transactionNo: createNextJournalVoucherNumber(),
    documentDate: new Date().toISOString().slice(0, 10),
    remarks: "",
    currencyType: "PHP",
    currencyRate: 1,
    status: "Draft",
    lines: [createJournalVoucherLine(1), createJournalVoucherLine(2)],
  };
}

export function createJournalVoucherLine(
  lineNumber: number,
  overrides: Partial<JournalVoucherLine> = {},
): JournalVoucherLine {
  return {
    id: `jv-line-${Date.now()}-${lineNumber}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,
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

export function createJournalVoucherFormValues(
  record?: JournalVoucherRecord,
): JournalVoucherFormValues {
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

export function createJournalVoucherFromForm(
  values: JournalVoucherFormValues,
): JournalVoucherRecord {
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

export function updateJournalVoucherFromForm(
  record: JournalVoucherRecord,
  values: JournalVoucherFormValues,
): JournalVoucherRecord {
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

export function getJournalVoucherTotals(lines: JournalVoucherLine[]) {
  const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
  const totalCredit = lines.reduce(
    (sum, line) => sum + Number(line.credit || 0),
    0,
  );
  const variance = totalDebit - totalCredit;

  return {
    totalCredit,
    totalDebit,
    variance,
    isBalanced:
      lines.length > 0 &&
      totalDebit > 0 &&
      totalCredit > 0 &&
      Math.abs(variance) < 0.001,
  };
}

export function formatJournalVoucherAmount(value: number) {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function createNextJournalVoucherNumber() {
  const currentYear = new Date().getFullYear();
  const matchingSerials = MockJournalVouchers.map((record) => {
    const matchedParts = record.transactionNo.match(/^JV-(\d{4})-(\d{4})$/);

    if (!matchedParts) {
      return null;
    }

    const [, year, serial] = matchedParts;

    return Number(year) === currentYear ? Number(serial) : null;
  }).filter((value): value is number => value !== null);
  const nextSerial = Math.max(0, ...matchingSerials) + 1;

  return `JV-${currentYear}-${String(nextSerial).padStart(4, "0")}`;
}
