import type {
  CashVoucherAccountingGridColumnId,
  CashVoucherEntryColumnId,
  CashVoucherEntryView,
  ExpenseEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
export const CashVoucherLineEntriesField = "lineEntries";
export const CashVoucherExpenseEntryView: CashVoucherEntryView = "expense";

export const CashVoucherAccountingDebitColumnId: CashVoucherAccountingGridColumnId = "debit";
export const CashVoucherAccountingCreditColumnId: CashVoucherAccountingGridColumnId = "credit";
export const CashVoucherAccountingAmountColumnIds = new Set<CashVoucherAccountingGridColumnId>([
  CashVoucherAccountingDebitColumnId,
  CashVoucherAccountingCreditColumnId,
]);

export const DefaultExpenseEntryColumnOrder: ExpenseEntryColumnId[] = [
  "partyCode",
  "partyName",
  "disbursementCode",
  "expenseType",
  "amount",
  "vatCode",
  "vatPercent",
  "vatAmount",
  "netAmount",
  "ewtCode",
  "ewtPercent",
  "ewtAmount",
  "disburseAmount",
  "responsibilityCenterCode",
  "responsibilityCenter",
  "particulars",
  "refId",
];

export const DefaultVisibleExpenseEntryColumnOrder: ExpenseEntryColumnId[] = ["partyName", "expenseType", "amount", "disburseAmount"];

export const ProtectedExpenseEntryColumnIds = new Set<ExpenseEntryColumnId>(["expenseType", "amount"]);

export const CashVoucherAccountingGridTaxRateOptions = ["0%", "1%", "2%", "5%", "12%"];

export const DefaultCashVoucherAccountingGridColumnOrder: CashVoucherAccountingGridColumnId[] = [
  "accountCode",
  "accountName",
  "particulars",
  "taxRate",
  "debit",
  "credit",
];

export const ProtectedCashVoucherAccountingGridColumnIds = new Set<CashVoucherAccountingGridColumnId>([
  "accountCode",
  "accountName",
  "debit",
  "credit",
]);

export const DefaultCashVoucherAccountingGridColumnLabels: Record<CashVoucherAccountingGridColumnId, string> = {
  accountCode: "Account Code",
  accountName: "Account Name",
  credit: "Credit",
  debit: "Debit",
  particulars: "Particulars",
  taxRate: "Tax Rate",
};

export const DefaultCashVoucherAccountingGridColumnWidths: Record<CashVoucherAccountingGridColumnId, number> = {
  accountCode: 160,
  accountName: 210,
  credit: 140,
  debit: 140,
  particulars: 260,
  taxRate: 125,
};

export const ExpenseEntryColumnLabels: Record<ExpenseEntryColumnId, string> = {
  disbursementCode: "Disbursement Code",
  expenseType: "Disbursement Type",
  amount: "Gross Amount",
  checkDate: "Check Date",
  checkNo: "Check No.",
  checkStatus: "Check Status",
  netAmount: "Net Amount",
  vatCode: "VAT Type",
  vatPercent: "VAT %",
  vatAmount: "VAT Amount",
  ewtCode: "EWT Code",
  ewtPercent: "EWT %",
  ewtAmount: "EWT Amount",
  disburseAmount: "Total Disbursed",
  partyCode: "Party Code",
  partyName: "Party Name",
  particulars: "Particulars",
  refId: "Reference No",
  responsibilityCenter: "Responsibility Center",
  responsibilityCenterCode: "Responsibility Center Code",
};

export const DefaultExpenseEntryColumnWidths: Record<ExpenseEntryColumnId, number> = {
  partyCode: 155,
  partyName: 220,
  disbursementCode: 205,
  expenseType: 205,
  amount: 170,
  checkDate: 155,
  checkNo: 150,
  checkStatus: 170,
  netAmount: 155,
  vatCode: 220,
  vatPercent: 115,
  vatAmount: 155,
  ewtCode: 175,
  ewtPercent: 115,
  ewtAmount: 155,
  disburseAmount: 165,
  responsibilityCenterCode: 240,
  responsibilityCenter: 235,
  particulars: 260,
  refId: 170,
};

export const DefaultCashVoucherEntryColumnOrder: CashVoucherEntryColumnId[] = [
  "partyCode",
  "partyName",
  "accountCode",
  "accountName",
  "debit",
  "credit",
  "vatType",
  "ewtCode",
  "responsibilityCenterCode",
  "responsibilityCenter",
  "particulars",
  "refId",
];

export const DefaultVisibleCashVoucherEntryColumnOrder: CashVoucherEntryColumnId[] = [
  "partyName",
  "accountName",
  "debit",
  "credit",
  "vatType",
  "ewtCode",
];

export const ProtectedCashVoucherEntryColumnIds = new Set<CashVoucherEntryColumnId>(["accountName", "debit", "credit"]);

export const CashVoucherEntryColumnLabels: Record<CashVoucherEntryColumnId, string> = {
  accountCode: "Account Code",
  accountName: "Account Title",
  ewtCode: "EWT Code",
  checkDate: "Check Date",
  checkNo: "Check No.",
  checkStatus: "Check Status",
  particulars: "Particulars",
  partyCode: "Party Code",
  partyName: "Party Name",
  refId: "Reference No",
  responsibilityCenter: "Responsibility Center",
  responsibilityCenterCode: "Responsibility Center Code",
  vatType: "VAT Type",
  debit: "Debit",
  credit: "Credit",
};

export const DefaultCashVoucherEntryColumnWidths: Record<CashVoucherEntryColumnId, number> = {
  partyCode: 155,
  partyName: 220,
  accountCode: 205,
  accountName: 220,
  debit: 135,
  credit: 135,
  vatType: 220,
  ewtCode: 175,
  responsibilityCenterCode: 240,
  responsibilityCenter: 235,
  particulars: 260,
  refId: 170,
  checkDate: 155,
  checkNo: 150,
  checkStatus: 170,
};

export const AccountingPartyFallbackValuePrefix = "entry-party:";
export const MultiCheckColumnIds = new Set<string>(["checkNo", "checkStatus", "checkDate"]);

export const CashVoucherDetailTablePreferencesStorageKey = "gr8books:cash-voucher:detail-table-preferences";
export const CashVoucherAccountingTablePreferencesStorageKey = "gr8books:cash-voucher:accounting-table-preferences";
