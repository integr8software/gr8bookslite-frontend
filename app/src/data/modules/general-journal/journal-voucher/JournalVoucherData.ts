import type {
  JournalVoucherFormValues,
  JournalVoucherLine,
  JournalVoucherRecord,
} from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";

export const JournalVoucherGeneratedInputVatLineIdPrefix = "jv-line-generated-input-vat-";
export const JournalVoucherGeneratedOutputVatLineIdPrefix = "jv-line-generated-output-vat-";
export const JournalVoucherGeneratedEwtLineIdPrefix = "jv-line-generated-ewt-";
export const JournalVoucherGeneratedCwtLineIdPrefix = "jv-line-generated-cwt-";
export const JournalVoucherGeneratedTaxLineIdPrefixes = [
  JournalVoucherGeneratedInputVatLineIdPrefix,
  JournalVoucherGeneratedOutputVatLineIdPrefix,
  JournalVoucherGeneratedEwtLineIdPrefix,
  JournalVoucherGeneratedCwtLineIdPrefix,
] as const;

export function createJournalVoucherInitialFormValues(): JournalVoucherFormValues {
  return {
    transactionNo: "",
    documentDate: new Date().toISOString().slice(0, 10),
    remarks: "",
    currencyType: "PHP",
    currencyRate: 1,
    status: "For Approval",
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
    vatType: "",
    atcCode: "",
    debit: 0,
    credit: 0,
    ...overrides,
  };
}

export function isJournalVoucherGeneratedTaxLine(lineOrId: Pick<JournalVoucherLine, "id"> | string) {
  const id = typeof lineOrId === "string" ? lineOrId : lineOrId.id;

  return JournalVoucherGeneratedTaxLineIdPrefixes.some((prefix) => id.startsWith(prefix));
}

export function createJournalVoucherFormValues(record?: JournalVoucherRecord): JournalVoucherFormValues {
  if (!record) {
    return createJournalVoucherInitialFormValues();
  }

  const remarks = record.remarks.trim();

  return {
    transactionNo: record.transactionNo,
    documentDate: record.documentDate,
    remarks,
    currencyType: record.currencyType,
    currencyRate: record.currencyRate,
    status: record.status,
    lines: record.lines.map((line) => ({
      ...line,
      particulars: getParticularsWithRemarksFallback(line.particulars, remarks),
    })),
  };
}

export function createJournalVoucherFromForm(values: JournalVoucherFormValues): JournalVoucherRecord {
  const now = new Date().toISOString();
  const normalizedValues = normalizeJournalVoucherFormValues(values);

  return {
    id: `jv-${Date.now()}`,
    ...normalizedValues,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateJournalVoucherFromForm(record: JournalVoucherRecord, values: JournalVoucherFormValues): JournalVoucherRecord {
  const normalizedValues = normalizeJournalVoucherFormValues(values);

  return {
    ...record,
    ...normalizedValues,
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

function normalizeJournalVoucherFormValues(values: JournalVoucherFormValues): JournalVoucherFormValues {
  const remarks = values.remarks.trim();

  return {
    ...values,
    transactionNo: values.transactionNo.trim(),
    remarks,
    currencyType: values.currencyType.trim(),
    lines: renumberJournalVoucherLines(
      values.lines.map((line) => ({
        ...line,
        accountCode: line.accountCode.trim(),
        accountTitle: line.accountTitle.trim(),
        atcCode: line.atcCode.trim(),
        particulars: getParticularsWithRemarksFallback(line.particulars, remarks),
        partyCode: line.partyCode.trim(),
        partyName: line.partyName.trim(),
        refNo: line.refNo.trim(),
        responsibilityCenter: line.responsibilityCenter.trim(),
        vatType: line.vatType.trim(),
      })),
    ),
  };
}

function getParticularsWithRemarksFallback(particulars: string | null | undefined, remarks: string) {
  const normalizedParticulars = particulars?.trim() ?? "";

  return normalizedParticulars || remarks;
}
