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
  "remarks",
  "responsibilityCenter",
  "refId",
  "checkNo",
  "checkStatus",
  "checkDate",
];

export const DefaultVisibleExpenseEntryColumnOrder: ExpenseEntryColumnId[] = [
  "expenseType",
  "amount",
  "vatCode",
  "ewtCode",
  "totalAmountDue",
  "partyName",
  "remarks",
  "refId",
];

export const ProtectedExpenseEntryColumnIds = new Set<ExpenseEntryColumnId>(["expenseType", "amount"]);

export const DisbursementAccountingGridTaxRateOptions = ["0%", "1%", "2%", "5%", "12%"];

export const DefaultDisbursementAccountingGridColumnOrder: DisbursementAccountingGridColumnId[] = [
  "accountCode",
  "accountName",
  "remarks",
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
  remarks: "Remarks",
  taxRate: "Tax Rate",
};

export const DefaultDisbursementAccountingGridColumnWidths: Record<DisbursementAccountingGridColumnId, number> = {
  accountCode: 160,
  accountName: 210,
  credit: 140,
  debit: 140,
  remarks: 260,
  taxRate: 125,
};

export const DisbursementAccountingImportTemplateHeaders = ["Account Code", "Account Name", "Remarks", "Tax Rate", "Debit", "Credit"];

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
  remarks: 44,
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
  remarks: "Remarks",
  refId: "Reference No",
  responsibilityCenter: "Responsibility Center",
};

export const DefaultExpenseEntryColumnWidths: Record<ExpenseEntryColumnId, number> = {
  expenseType: 200,
  amount: 135,
  checkDate: 135,
  checkNo: 150,
  checkStatus: 145,
  netAmount: 130,
  vatCode: 160,
  vatPercent: 95,
  vatAmount: 120,
  ewtCode: 175,
  ewtPercent: 95,
  ewtAmount: 120,
  totalAmountDue: 145,
  partyCode: 130,
  partyName: 220,
  remarks: 260,
  responsibilityCenter: 190,
  refId: 150,
};

export const DefaultDisbursementEntryColumnOrder: DisbursementEntryColumnId[] = [
  "accountCode",
  "accountName",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "remarks",
  "vatType",
  "atcCode",
  "responsibilityCenter",
  "refId",
  "checkNo",
  "checkStatus",
  "checkDate",
];

export const DefaultVisibleDisbursementEntryColumnOrder: DisbursementEntryColumnId[] = ["accountName", "debit", "credit", "remarks"];

export const ProtectedDisbursementEntryColumnIds = new Set<DisbursementEntryColumnId>(["accountName", "debit", "credit"]);

export const DisbursementEntryColumnLabels: Record<DisbursementEntryColumnId, string> = {
  accountCode: "Account Code",
  accountName: "Account Title",
  atcCode: "EWT Code",
  checkDate: "Check Date",
  checkNo: "Check No.",
  checkStatus: "Check Status",
  remarks: "Remarks",
  partyCode: "Party Code",
  partyName: "Party Name",
  refId: "Reference No",
  responsibilityCenter: "Responsibility Center",
  vatType: "VAT Type",
  debit: "Debit",
  credit: "Credit",
};

export const DefaultDisbursementEntryColumnWidths: Record<DisbursementEntryColumnId, number> = {
  accountCode: 140,
  accountName: 220,
  atcCode: 120,
  checkDate: 135,
  checkNo: 150,
  checkStatus: 145,
  credit: 140,
  debit: 140,
  remarks: 260,
  partyCode: 130,
  partyName: 190,
  refId: 140,
  responsibilityCenter: 190,
  vatType: 130,
};

export const AccountingPartyFallbackValuePrefix = "entry-party:";
export const InputVatAccountCode = "2010002011";
export const InputVatAccountName = "Input VAT";
export const ExpandedWithholdingTaxAccountCode = "2010002002";
export const ExpandedWithholdingTaxAccountName = "Expanded Withholding Tax";
export const MultiCheckColumnIds = new Set<string>(["checkNo", "checkStatus", "checkDate"]);
