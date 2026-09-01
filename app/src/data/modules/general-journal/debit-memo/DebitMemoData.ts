import type {
  DebitMemoAccountingEntry,
  DebitMemoFormValues,
  DebitMemoRecord,
  DebitMemoStatistics,
  DebitMemoStatus,
} from "@/app/src/types/modules/general-journal/debit-memo/DebitMemoTypes";

export function createDebitMemoInitialFormValues(): DebitMemoFormValues {
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
      createDebitMemoAccountingEntry(1),
      createDebitMemoAccountingEntry(2),
    ],
  };
}

export function createDebitMemoAccountingEntry(
  lineNumber: number,
  overrides: Partial<DebitMemoAccountingEntry> = {},
): DebitMemoAccountingEntry {
  return {
    id: `dm-entry-${Date.now()}-${lineNumber}-${Math.random().toString(36).slice(2, 7)}`,
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

export function createDebitMemoFormValues(record?: DebitMemoRecord): DebitMemoFormValues {
  if (!record) {
    return createDebitMemoInitialFormValues();
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

export function createDebitMemoFromForm(values: DebitMemoFormValues): DebitMemoRecord {
  const now = new Date().toISOString();

  return {
    id: `dm-${Date.now()}`,
    ...normalizeDebitMemoFormValues(values),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateDebitMemoFromForm(
  record: DebitMemoRecord,
  values: DebitMemoFormValues,
): DebitMemoRecord {
  return {
    ...record,
    ...normalizeDebitMemoFormValues(values),
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeDebitMemoFormValues(
  values: DebitMemoFormValues,
): DebitMemoFormValues {
  const accountingEntries = renumberDebitMemoAccountingEntries(
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
  const totals = getDebitMemoAccountingTotals(accountingEntries);

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

export function renumberDebitMemoAccountingEntries(
  entries: DebitMemoAccountingEntry[],
) {
  return entries.map((entry, index) => ({
    ...entry,
    lineNumber: index + 1,
  }));
}

export function getDebitMemoAccountingTotals(entries: DebitMemoAccountingEntry[]) {
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

export function formatDebitMemoAmount(value: number) {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getDebitMemoStatistics(records: DebitMemoRecord[]): DebitMemoStatistics {
  return {
    cancelledVouchers: countByStatus(records, "Cancelled"),
    disapprovedVouchers: countByStatus(records, "Disapproved"),
    draftVouchers: countByStatus(records, "Draft"),
    forApprovalVouchers: countByStatus(records, "For Approval"),
    postedVouchers: countByStatus(records, "Posted"),
    totalVouchers: records.length,
  };
}

function countByStatus(records: DebitMemoRecord[], status: DebitMemoStatus) {
  return records.filter((record) => record.status === status).length;
}

function roundCurrency(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}
