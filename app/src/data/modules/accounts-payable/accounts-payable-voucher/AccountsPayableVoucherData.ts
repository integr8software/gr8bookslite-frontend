import type {
  AccountsPayableVoucherAccountingEntry,
  AccountsPayableVoucherExpenseLine,
  AccountsPayableVoucherFormValues,
  AccountsPayableVoucherRecord,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import type { TermsMaintenance } from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";

export function createAccountsPayableVoucherInitialFormValues(
  baseCurrencyCode = "PHP",
): AccountsPayableVoucherFormValues {
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
    currency: baseCurrencyCode,
    exchangeRate: 1,
    amount: 0,
    termId: "",
    terms: "",
    dueDate: new Date().toISOString().slice(0, 10),
    referenceNo: "",
    creditAccountCode: "",
    creditAccountTitle: "",
    payableType: "Trade Payable",
    remarks: "",
    status: "Draft",
    expenseLines: [createAccountsPayableVoucherExpenseLine(1)],
    accountingEntries: [
      createAccountsPayableVoucherAccountingEntry(1),
      createAccountsPayableVoucherAccountingEntry(2),
    ],
  };
}

export function createAccountsPayableVoucherExpenseLine(
  lineNumber: number,
  overrides: Partial<AccountsPayableVoucherExpenseLine> = {},
): AccountsPayableVoucherExpenseLine {
  return {
    id: `apv-expense-${Date.now()}-${lineNumber}-${Math.random().toString(36).slice(2, 7)}`,
    lineNumber,
    expenseAccountCode: "",
    expenseType: "",
    amount: 0,
    netAmount: 0,
    vat: "",
    vatPercent: 0,
    vatAmount: 0,
    ewt: "",
    ewtPercent: 0,
    ewtAmount: 0,
    totalAmountDue: 0,
    partyCode: "",
    partyName: "",
    particulars: "",
    responsibilityCenter: "",
    referenceNo: "",
    ...overrides,
  };
}

export function createAccountsPayableVoucherAccountingEntry(
  lineNumber: number,
  overrides: Partial<AccountsPayableVoucherAccountingEntry> = {},
): AccountsPayableVoucherAccountingEntry {
  return {
    id: `apv-entry-${Date.now()}-${lineNumber}-${Math.random().toString(36).slice(2, 7)}`,
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

export function createAccountsPayableVoucherFormValues(
  record?: AccountsPayableVoucherRecord,
  baseCurrencyCode = "PHP",
): AccountsPayableVoucherFormValues {
  if (!record) {
    return createAccountsPayableVoucherInitialFormValues(baseCurrencyCode);
  }

  return syncAccountsPayableVoucherExpenseLinesAndAmount({
    transactionNo: record.transactionNo,
    documentDate: record.documentDate,
    partyCode: record.partyCode,
    partyName: record.partyName,
    address: record.address ?? "",
    contactPerson: record.contactPerson ?? "",
    contactNo: record.contactNo ?? "",
    projectCode: record.projectCode ?? "",
    projectName: record.projectName ?? "",
    currency: record.currency,
    exchangeRate: record.exchangeRate,
    amount: record.amount,
    termId: record.termId ?? "",
    terms: record.terms ?? "",
    dueDate: record.dueDate ?? record.documentDate,
    referenceNo: record.referenceNo ?? "",
    creditAccountCode: record.creditAccountCode,
    creditAccountTitle: record.creditAccountTitle,
    payableType: record.payableType,
    remarks: record.remarks,
    status: record.status,
    expenseLines: record.expenseLines.map((line) =>
      createAccountsPayableVoucherExpenseLine(line.lineNumber, line),
    ),
    accountingEntries: record.accountingEntries.map((entry) => ({ ...entry })),
  });
}

export function createAccountsPayableVoucherFromForm(
  values: AccountsPayableVoucherFormValues,
): AccountsPayableVoucherRecord {
  const now = new Date().toISOString();

  return {
    id: `apv-${Date.now()}`,
    ...normalizeAccountsPayableVoucherFormValues(values),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateAccountsPayableVoucherFromForm(
  record: AccountsPayableVoucherRecord,
  values: AccountsPayableVoucherFormValues,
): AccountsPayableVoucherRecord {
  return {
    ...record,
    ...normalizeAccountsPayableVoucherFormValues(values),
    updatedAt: new Date().toISOString(),
  };
}

export function renumberAccountsPayableVoucherExpenseLines(
  lines: AccountsPayableVoucherExpenseLine[],
) {
  return lines.map((line, index) => ({
    ...line,
    lineNumber: index + 1,
  }));
}

export function renumberAccountsPayableVoucherAccountingEntries(
  entries: AccountsPayableVoucherAccountingEntry[],
) {
  return entries.map((entry, index) => ({
    ...entry,
    lineNumber: index + 1,
  }));
}

export function getAccountsPayableVoucherExpenseTotal(lines: AccountsPayableVoucherExpenseLine[]) {
  return lines.reduce((sum, line) => sum + Number(line.amount || 0), 0);
}

export function getAccountsPayableVoucherExpenseTotals(lines: AccountsPayableVoucherExpenseLine[]) {
  return lines.reduce(
    (totals, line) => ({
      ewtAmount: roundCurrency(totals.ewtAmount + Number(line.ewtAmount || 0)),
      grossAmount: roundCurrency(totals.grossAmount + Number(line.amount || 0)),
      netAmount: roundCurrency(totals.netAmount + Number(line.netAmount || 0)),
      totalAmountDue: roundCurrency(totals.totalAmountDue + Number(line.totalAmountDue || 0)),
      vatAmount: roundCurrency(totals.vatAmount + Number(line.vatAmount || 0)),
    }),
    {
      ewtAmount: 0,
      grossAmount: 0,
      netAmount: 0,
      totalAmountDue: 0,
      vatAmount: 0,
    },
  );
}

export function syncAccountsPayableVoucherExpenseTaxAmounts(
  line: AccountsPayableVoucherExpenseLine,
): AccountsPayableVoucherExpenseLine {
  const amount = roundCurrency(Number(line.amount || 0));
  const sign = amount < 0 ? -1 : 1;
  const absoluteAmount = Math.abs(amount);
  const vatPercent = Number(line.vatPercent || 0);
  const ewtPercent = Number(line.ewtPercent || 0);
  const vatAmount = roundCurrency(sign * ((absoluteAmount * vatPercent) / 100));
  const ewtAmount = roundCurrency(sign * ((absoluteAmount * ewtPercent) / 100));
  const netAmount = roundCurrency(sign * Math.max(absoluteAmount - Math.abs(vatAmount), 0));
  const totalAmountDue = roundCurrency(sign * Math.max(absoluteAmount - Math.abs(ewtAmount), 0));

  return {
    ...line,
    amount,
    ewtAmount,
    ewtPercent,
    netAmount,
    totalAmountDue,
    vatAmount,
    vatPercent,
  };
}

export function syncAccountsPayableVoucherExpenseLinesAndAmount(
  values: AccountsPayableVoucherFormValues,
): AccountsPayableVoucherFormValues {
  const expenseLines = values.expenseLines.map(syncAccountsPayableVoucherExpenseTaxAmounts);
  const expenseTotals = getAccountsPayableVoucherExpenseTotals(expenseLines);
  const amount = accountsPayableVoucherExpenseLinesHaveItems(expenseLines)
    ? expenseTotals.totalAmountDue
    : getAccountsPayableVoucherAccountingTotals(values.accountingEntries).totalCredit;

  return {
    ...values,
    amount,
    expenseLines,
  };
}

export function getAccountsPayableVoucherAccountingTotals(
  entries: AccountsPayableVoucherAccountingEntry[],
) {
  const totalDebit = entries.reduce((sum, entry) => sum + Number(entry.debit || 0), 0);
  const totalCredit = entries.reduce((sum, entry) => sum + Number(entry.credit || 0), 0);
  const variance = totalDebit - totalCredit;

  return {
    totalCredit,
    totalDebit,
    variance,
    isBalanced:
      entries.length > 1 && totalDebit > 0 && totalCredit > 0 && Math.abs(variance) < 0.001,
  };
}

export function formatAccountsPayableVoucherAmount(value: number) {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function accountsPayableVoucherExpenseLinesHaveItems(
  lines: AccountsPayableVoucherExpenseLine[],
) {
  return lines.some(accountsPayableVoucherExpenseLineHasItem);
}

export function accountsPayableVoucherExpenseLineHasItem(line: AccountsPayableVoucherExpenseLine) {
  return (
    line.expenseAccountCode.trim() !== "" ||
    line.expenseType.trim() !== "" ||
    line.referenceNo.trim() !== "" ||
    line.responsibilityCenter.trim() !== "" ||
    line.vat.trim() !== "" ||
    line.ewt.trim() !== "" ||
    Number(line.vatPercent || 0) > 0 ||
    Number(line.ewtPercent || 0) > 0 ||
    hasNonZeroAmount(line.amount) ||
    hasNonZeroAmount(line.netAmount) ||
    hasNonZeroAmount(line.totalAmountDue) ||
    hasNonZeroAmount(line.vatAmount) ||
    hasNonZeroAmount(line.ewtAmount)
  );
}

function normalizeAccountsPayableVoucherFormValues(
  values: AccountsPayableVoucherFormValues,
): AccountsPayableVoucherFormValues {
  const syncedValues = syncAccountsPayableVoucherExpenseLinesAndAmount(values);

  return {
    ...syncedValues,
    transactionNo: syncedValues.transactionNo.trim(),
    partyCode: syncedValues.partyCode.trim(),
    partyName: syncedValues.partyName.trim(),
    address: syncedValues.address.trim(),
    contactPerson: syncedValues.contactPerson.trim(),
    contactNo: syncedValues.contactNo.trim(),
    projectCode: syncedValues.projectCode.trim(),
    projectName: syncedValues.projectName.trim(),
    currency: syncedValues.currency.trim(),
    termId: syncedValues.termId.trim(),
    terms: syncedValues.terms.trim(),
    dueDate: syncedValues.dueDate,
    referenceNo: syncedValues.referenceNo.trim(),
    creditAccountCode: syncedValues.creditAccountCode.trim(),
    creditAccountTitle: syncedValues.creditAccountTitle.trim(),
    remarks: syncedValues.remarks.trim(),
    expenseLines: renumberAccountsPayableVoucherExpenseLines(
      syncedValues.expenseLines.map((line) => ({
        ...line,
        expenseAccountCode: line.expenseAccountCode.trim(),
        expenseType: line.expenseType.trim(),
        partyCode: line.partyCode.trim(),
        partyName: line.partyName.trim(),
        particulars: line.particulars.trim(),
        responsibilityCenter: line.responsibilityCenter.trim(),
        referenceNo: line.referenceNo.trim(),
      })),
    ),
    accountingEntries: renumberAccountsPayableVoucherAccountingEntries(
      syncedValues.accountingEntries,
    ),
  };
}

export function calculateAccountsPayableVoucherDueDate(
  documentDate: string,
  term?: Pick<TermsMaintenance, "datemode" | "period"> | null,
) {
  if (!documentDate) {
    return "";
  }

  const period = Number(term?.period ?? 0);

  if (!term || !Number.isFinite(period)) {
    return documentDate;
  }

  const date = createLocalDate(documentDate);

  if (!date) {
    return documentDate;
  }

  if (term.datemode === "Month") {
    return formatDateValue(addMonthsClamped(date, period));
  }

  if (term.datemode === "Year") {
    return formatDateValue(addMonthsClamped(date, period * 12));
  }

  date.setDate(date.getDate() + period);
  return formatDateValue(date);
}

function createLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addMonthsClamped(date: Date, monthCount: number) {
  const day = date.getDate();
  const targetDate = new Date(date.getFullYear(), date.getMonth() + monthCount, 1);
  const lastTargetDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();

  targetDate.setDate(Math.min(day, lastTargetDay));
  return targetDate;
}

function roundCurrency(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}

function hasNonZeroAmount(value: number) {
  return Math.abs(Number(value || 0)) > 0;
}
