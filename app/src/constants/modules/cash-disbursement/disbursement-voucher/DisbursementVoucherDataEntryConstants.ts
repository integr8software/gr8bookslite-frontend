import type {
  DisbursementAccountingGridColumnId,
  DisbursementEntryColumnId,
  ExpenseEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export const DisbursementVoucherLineEntriesField = "lineEntries";

export const DefaultExpenseEntryColumnOrder: ExpenseEntryColumnId[] = [
  "expenseType",
  "amount",
  "netAmount",
  "vatCode",
  "vatPercent",
  "vatAmount",
  "ewtCode",
  "ewtPercent",
  "ewtAmount",
  "totalAmountDue",
  "partyCode",
  "partyName",
  "particulars",
  "responsibilityCenter",
  "refId",
  "checkNo",
  "checkStatus",
  "checkDate",
];

export const DefaultVisibleExpenseEntryColumnOrder = DefaultExpenseEntryColumnOrder.filter(
  (columnId): columnId is ExpenseEntryColumnId => columnId !== "partyCode",
);

export const ProtectedExpenseEntryColumnIds = new Set<ExpenseEntryColumnId>(["expenseType", "amount"]);

export const DisbursementAccountingGridTaxRateOptions = ["0%", "1%", "2%", "5%", "12%"];

export const DefaultDisbursementAccountingGridColumnOrder: DisbursementAccountingGridColumnId[] = [
  "accountCode",
  "accountName",
  "particulars",
  "taxRate",
  "debit",
  "credit",
];

export const ProtectedDisbursementAccountingGridColumnIds = new Set<DisbursementAccountingGridColumnId>([
  "accountCode",
  "accountName",
  "debit",
  "credit",
]);

export const DefaultDisbursementAccountingGridColumnLabels: Record<DisbursementAccountingGridColumnId, string> = {
  accountCode: "Account Code",
  accountName: "Account Name",
  credit: "Credit",
  debit: "Debit",
  particulars: "Particulars",
  taxRate: "Tax Rate",
};

export const DefaultDisbursementAccountingGridColumnWidths: Record<DisbursementAccountingGridColumnId, number> = {
  accountCode: 190,
  accountName: 240,
  credit: 165,
  debit: 165,
  particulars: 330,
  taxRate: 150,
};

export const DisbursementAccountingImportTemplateHeaders = ["Account Code", "Account Name", "Particulars", "Tax Rate", "Debit", "Credit"];

export const DisbursementAccountingImportTemplateRows = [
  ["2010-003", "Accounts Payable", "Settlement of approved office depot payable", "0%", "", "18450.00"],
  ["5010-001", "Office Supplies Expense", "Replenishment of paper, toner, and pantry labels", "0%", "18450.00", ""],
];

export const DisbursementAccountingImportTemplateColumnWidths = [18, 30, 44, 14, 18, 18];

export const DisbursementAccountingExportColumnWidths: Record<DisbursementAccountingGridColumnId, number> = {
  accountCode: 18,
  accountName: 30,
  credit: 18,
  debit: 18,
  particulars: 44,
  taxRate: 14,
};

export const DisbursementAccountingImportClearActions: {
  label: string;
  value: ModuleDataEntryClearAction;
}[] = [
  { label: "Clear All", value: "all" },
  { label: "Clear With Data", value: "with-data" },
  { label: "Clear Incomplete", value: "incomplete" },
  { label: "Clear No Data", value: "no-data" },
];

export const ExpenseEntryColumnLabels: Record<ExpenseEntryColumnId, string> = {
  expenseType: "Expense Type",
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
  totalAmountDue: "Total Disbursement",
  partyCode: "Party Code",
  partyName: "Party Name",
  particulars: "Remarks",
  refId: "Reference No",
  responsibilityCenter: "Responsibility Center",
};

export const DefaultExpenseEntryColumnWidths: Record<ExpenseEntryColumnId, number> = {
  expenseType: 235,
  amount: 155,
  checkDate: 150,
  checkNo: 180,
  checkStatus: 160,
  netAmount: 145,
  vatCode: 190,
  vatPercent: 105,
  vatAmount: 135,
  ewtCode: 210,
  ewtPercent: 105,
  ewtAmount: 135,
  totalAmountDue: 165,
  partyCode: 150,
  partyName: 260,
  particulars: 320,
  responsibilityCenter: 220,
  refId: 180,
};

export const DefaultDisbursementEntryColumnOrder: DisbursementEntryColumnId[] = [
  "accountCode",
  "accountName",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "particulars",
  "vatType",
  "atcCode",
  "responsibilityCenter",
  "refId",
  "checkNo",
  "checkStatus",
  "checkDate",
];

export const DefaultVisibleDisbursementEntryColumnOrder: DisbursementEntryColumnId[] = ["accountName", "debit", "credit", "particulars"];

export const ProtectedDisbursementEntryColumnIds = new Set<DisbursementEntryColumnId>(["accountName", "debit", "credit"]);

export const DisbursementEntryColumnLabels: Record<DisbursementEntryColumnId, string> = {
  accountCode: "Account Code",
  accountName: "Account Title",
  atcCode: "EWT Code",
  checkDate: "Check Date",
  checkNo: "Check No.",
  checkStatus: "Check Status",
  particulars: "Remarks",
  partyCode: "Party Code",
  partyName: "Party Name",
  refId: "Reference No",
  responsibilityCenter: "Responsibility Center",
  vatType: "VAT Type",
  debit: "Debit",
  credit: "Credit",
};

export const DefaultDisbursementEntryColumnWidths: Record<DisbursementEntryColumnId, number> = {
  accountCode: 160,
  accountName: 260,
  atcCode: 140,
  checkDate: 150,
  checkNo: 180,
  checkStatus: 160,
  credit: 160,
  debit: 160,
  particulars: 320,
  partyCode: 150,
  partyName: 220,
  refId: 160,
  responsibilityCenter: 220,
  vatType: 150,
};

export const AccountingPartyFallbackValuePrefix = "entry-party:";
export const CashInHandAccountCode = "1001111";
export const CashInHandAccountName = "Cash in Hand";
export const InputVatAccountCode = "2010002011";
export const InputVatAccountName = "Input VAT";
export const ExpandedWithholdingTaxAccountCode = "2010002002";
export const ExpandedWithholdingTaxAccountName = "Expanded Withholding Tax";
export const MultiCheckColumnIds = new Set<string>(["checkNo", "checkStatus", "checkDate"]);
