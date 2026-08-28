import type {
  DisbursementAccountingGridColumnId,
  DisbursementEntryColumnId,
  DisbursementEntryView,
  ExpenseEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export const DisbursementVoucherLineEntriesField = "lineEntries";
export const DisbursementVoucherExpenseEntryView: DisbursementEntryView = "expense";

export const DisbursementVoucherAccountingDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

export const DisbursementAccountingDebitColumnId: DisbursementAccountingGridColumnId = "debit";
export const DisbursementAccountingCreditColumnId: DisbursementAccountingGridColumnId = "credit";
export const DisbursementAccountingAmountColumnIds = new Set<DisbursementAccountingGridColumnId>([
  DisbursementAccountingDebitColumnId,
  DisbursementAccountingCreditColumnId,
]);

export const DisbursementAccountingWorksheetBorderColorArgb = "FFE5E7EB";

export const DisbursementAccountingPdfGridLayout = {
  hLineColor: () => "#E5E7EB",
  hLineWidth: () => 0.6,
  paddingBottom: () => 0,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  vLineColor: () => "#E5E7EB",
  vLineWidth: () => 0.6,
};

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

export const DefaultVisibleExpenseEntryColumnOrder: ExpenseEntryColumnId[] = [
  "partyName",
  "expenseType",
  "amount",
  "disburseAmount",
];

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
  accountCode: 160,
  accountName: 210,
  credit: 140,
  debit: 140,
  particulars: 260,
  taxRate: 125,
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
  disbursementCode: "Disbursement Code",
  expenseType: "Disbursement Type",
  amount: "Gross Amount",
  checkDate: "Check Date",
  checkNo: "Check No.",
  checkStatus: "Check Status",
  netAmount: "Net Amount",
  vatCode: "VAT Type",
  vatPercent: "VAT Rate",
  vatAmount: "VAT Amount",
  ewtCode: "EWT Code",
  ewtPercent: "EWT Rate",
  ewtAmount: "EWT Amount",
  disburseAmount: "Disburse Amount",
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
  vatCode: 160,
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

export const DefaultDisbursementEntryColumnOrder: DisbursementEntryColumnId[] = [
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

export const DefaultVisibleDisbursementEntryColumnOrder: DisbursementEntryColumnId[] = [
  "partyName",
  "accountName",
  "debit",
  "credit",
  "vatType",
  "ewtCode",
];

export const ProtectedDisbursementEntryColumnIds = new Set<DisbursementEntryColumnId>(["accountName", "debit", "credit"]);

export const DisbursementEntryColumnLabels: Record<DisbursementEntryColumnId, string> = {
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

export const DefaultDisbursementEntryColumnWidths: Record<DisbursementEntryColumnId, number> = {
  partyCode: 155,
  partyName: 220,
  accountCode: 205,
  accountName: 220,
  debit: 135,
  credit: 135,
  vatType: 160,
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
export const InputVatAccountCode = "2010002011";
export const InputVatAccountName = "Input VAT";
export const ExpandedWithholdingTaxAccountCode = "2010002002";
export const ExpandedWithholdingTaxAccountName = "Expanded Withholding Tax";
export const MultiCheckColumnIds = new Set<string>(["checkNo", "checkStatus", "checkDate"]);

export const DisbursementVoucherDetailTablePreferencesStorageKey = "gr8books:disbursement-voucher:detail-table-preferences";
export const DisbursementVoucherAccountingTablePreferencesStorageKey = "gr8books:disbursement-voucher:accounting-table-preferences";
