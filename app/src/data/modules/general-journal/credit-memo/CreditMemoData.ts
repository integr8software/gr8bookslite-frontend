import type {
  CreditMemoAccountingEntry,
  CreditMemoFormValues,
  CreditMemoRecord,
  CreditMemoStatistics,
  CreditMemoStatus,
} from "@/app/src/types/modules/general-journal/credit-memo/CreditMemoTypes";

export function createCreditMemoInitialFormValues(): CreditMemoFormValues {
  return {
    transactionNo: "",
    documentDate: new Date().toISOString().slice(0, 10),
    partyCode: "",
    partyName: "",
    address: "",
    contactPerson: "",
    contactNo: "",
    projectCode: "",
    projectName: "",
    currency: "PHP",
    exchangeRate: 1,
    amount: 0,
    referenceNo: "",
    remarks: "",
    status: "Draft",
    accountingEntries: [
      createCreditMemoAccountingEntry(1),
      createCreditMemoAccountingEntry(2),
    ],
  };
}

export function createCreditMemoAccountingEntry(
  lineNumber: number,
  overrides: Partial<CreditMemoAccountingEntry> = {},
): CreditMemoAccountingEntry {
  return {
    id: `cm-entry-${Date.now()}-${lineNumber}-${Math.random().toString(36).slice(2, 7)}`,
    lineNumber,
    accountCode: "",
    accountTitle: "",
    particulars: "",
    debit: 0,
    credit: 0,
    vatType: "",
    atcCode: "",
    partyCode: "",
    partyName: "",
    responsibilityCenter: "",
    refNo: "",
    ...overrides,
  };
}

export function createCreditMemoFormValues(record?: CreditMemoRecord): CreditMemoFormValues {
  if (!record) {
    return createCreditMemoInitialFormValues();
  }

  return {
    transactionNo: record.transactionNo,
    documentDate: record.documentDate,
    partyCode: record.partyCode,
    partyName: record.partyName,
    address: record.address,
    contactPerson: record.contactPerson,
    contactNo: record.contactNo,
    projectCode: record.projectCode,
    projectName: record.projectName,
    currency: record.currency,
    exchangeRate: record.exchangeRate,
    amount: record.amount,
    referenceNo: record.referenceNo,
    remarks: record.remarks,
    status: record.status,
    accountingEntries: record.accountingEntries.map((entry) => ({ ...entry })),
  };
}

export function createCreditMemoFromForm(values: CreditMemoFormValues): CreditMemoRecord {
  const now = new Date().toISOString();

  return {
    id: `cm-${Date.now()}`,
    ...normalizeCreditMemoFormValues(values),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateCreditMemoFromForm(
  record: CreditMemoRecord,
  values: CreditMemoFormValues,
): CreditMemoRecord {
  return {
    ...record,
    ...normalizeCreditMemoFormValues(values),
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeCreditMemoFormValues(
  values: CreditMemoFormValues,
): CreditMemoFormValues {
  const accountingEntries = renumberCreditMemoAccountingEntries(
    values.accountingEntries.map((entry) => ({
      ...entry,
      accountCode: entry.accountCode.trim(),
      accountTitle: entry.accountTitle.trim(),
      particulars: entry.particulars.trim(),
      vatType: entry.vatType.trim(),
      atcCode: entry.atcCode.trim(),
      partyCode: entry.partyCode.trim(),
      partyName: entry.partyName.trim(),
      responsibilityCenter: entry.responsibilityCenter.trim(),
      refNo: entry.refNo.trim(),
      debit: roundCurrency(Number(entry.debit || 0)),
      credit: roundCurrency(Number(entry.credit || 0)),
    })),
  );
  const totals = getCreditMemoAccountingTotals(accountingEntries);

  return {
    ...values,
    transactionNo: values.transactionNo.trim(),
    partyCode: values.partyCode.trim(),
    partyName: values.partyName.trim(),
    address: values.address.trim(),
    contactPerson: values.contactPerson.trim(),
    contactNo: values.contactNo.trim(),
    projectCode: values.projectCode.trim(),
    projectName: values.projectName.trim(),
    currency: values.currency.trim(),
    referenceNo: values.referenceNo.trim(),
    remarks: values.remarks.trim(),
    amount: totals.totalDebit,
    accountingEntries,
  };
}

export function renumberCreditMemoAccountingEntries(
  entries: CreditMemoAccountingEntry[],
) {
  return entries.map((entry, index) => ({
    ...entry,
    lineNumber: index + 1,
  }));
}

export function getCreditMemoAccountingTotals(entries: CreditMemoAccountingEntry[]) {
  const totalDebit = roundCurrency(
    entries.reduce((sum, entry) => sum + Number(entry.debit || 0), 0),
  );
  const totalCredit = roundCurrency(
    entries.reduce((sum, entry) => sum + Number(entry.credit || 0), 0),
  );
  const variance = roundCurrency(totalDebit - totalCredit);

  return {
    totalCredit,
    totalDebit,
    variance,
    isBalanced:
      entries.length > 1 && totalDebit > 0 && totalCredit > 0 && Math.abs(variance) < 0.001,
  };
}

export function formatCreditMemoAmount(value: number) {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getCreditMemoStatistics(records: CreditMemoRecord[]): CreditMemoStatistics {
  return {
    cancelledVouchers: countByStatus(records, "Cancelled"),
    disapprovedVouchers: countByStatus(records, "Disapproved"),
    draftVouchers: countByStatus(records, "Draft"),
    forApprovalVouchers: countByStatus(records, "For Approval"),
    postedVouchers: countByStatus(records, "Posted"),
    totalVouchers: records.length,
  };
}

function countByStatus(records: CreditMemoRecord[], status: CreditMemoStatus) {
  return records.filter((record) => record.status === status).length;
}

function roundCurrency(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}
