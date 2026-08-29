import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  RevolvingFundReplenishmentActionTab,
  RevolvingFundReplenishmentConfirmationAction,
  RevolvingFundReplenishmentAccountingColumnId,
  RevolvingFundReplenishmentEntryColumnId,
  RevolvingFundReplenishmentEntryTab,
  RevolvingFundReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";

export const RevolvingFundReplenishmentLink = getModuleRoute("RFR");
export const RevolvingFundReplenishmentAddLink = `${RevolvingFundReplenishmentLink}/add`;
export const getRevolvingFundReplenishmentEditLink = (recordId: string) => `${RevolvingFundReplenishmentLink}/edit/${recordId}`;
export const getRevolvingFundReplenishmentViewLink = (recordId: string) => `${RevolvingFundReplenishmentLink}/view/${recordId}`;
export const RevolvingFundReplenishmentStorageKey = "cash-disbursement-revolving-fund-replenishment-records";
export const RevolvingFundReplenishmentPaginationStorageKey = "cash-disbursement-revolving-fund-replenishment-table";
export const RevolvingFundReplenishmentTransactionPrefix = "RFR";
export const RevolvingFundReplenishmentConfirmationDialogTitles: Record<RevolvingFundReplenishmentConfirmationAction, string> = {
  save: "Save Revolving Fund Replenishment?",
  draft: "Save Revolving Fund Replenishment as Draft?",
  approve: "Approve Revolving Fund Replenishment?",
  disapprove: "Disapprove Revolving Fund Replenishment?",
  cancel: "Cancel Revolving Fund Replenishment?",
};
export const RevolvingFundReplenishmentConfirmationDialogConfirmLabels: Record<RevolvingFundReplenishmentConfirmationAction, string> = {
  save: "Save and Submit",
  draft: "Save as Draft",
  approve: "Approve",
  disapprove: "Disapprove",
  cancel: "Cancel",
};
export const RevolvingFundReplenishmentColumnLabels = {
  transactionNo: "Fund Replenishment No.",
  documentDate: "Document Date",
  partyCode: "Party Code",
  partyName: "Party Name",
  accountCode: "Default Account Code",
  accountTitle: "Default Account Title",
  currency: "Currency",
  exchangeRate: "Exchange Rate",
  amount: "Total Amount",
  remarks: "Remarks",
  createdBy: "Created By",
  createdAt: "Date Created",
  updatedBy: "Updated By",
  updatedAt: "Date Modified",
  status: "Status",
  actions: "Actions",
} as const;
export const RevolvingFundReplenishmentOverviewColumnWidths: Record<keyof typeof RevolvingFundReplenishmentColumnLabels, number> = {
  transactionNo: TransactionOverviewColumnWidths.transactionNumber,
  documentDate: TransactionOverviewColumnWidths.documentDate,
  partyCode: TransactionOverviewColumnWidths.partyCode,
  partyName: TransactionOverviewColumnWidths.partyName,
  accountCode: TransactionOverviewColumnWidths.accountCode,
  accountTitle: TransactionOverviewColumnWidths.accountTitle,
  currency: TransactionOverviewColumnWidths.currency,
  exchangeRate: TransactionOverviewColumnWidths.exchangeRate,
  amount: TransactionOverviewColumnWidths.amount,
  remarks: TransactionOverviewColumnWidths.remarks,
  createdBy: TransactionOverviewColumnWidths.auditUser,
  createdAt: TransactionOverviewColumnWidths.auditDate,
  updatedBy: TransactionOverviewColumnWidths.auditUser,
  updatedAt: TransactionOverviewColumnWidths.auditDate,
  status: TransactionOverviewColumnWidths.status,
  actions: TransactionOverviewColumnWidths.actions,
};
export const RevolvingFundReplenishmentDefaultVisibleColumnIds = [
  "transactionNo",
  "documentDate",
  "partyName",
  "amount",
  "status",
  "actions",
] as const;
export const RevolvingFundReplenishmentDefaultColumnVisibility = Object.fromEntries(
  Object.keys(RevolvingFundReplenishmentColumnLabels).map((columnId) => [
    columnId,
    RevolvingFundReplenishmentDefaultVisibleColumnIds.includes(
      columnId as (typeof RevolvingFundReplenishmentDefaultVisibleColumnIds)[number],
    ),
  ]),
);
export const RevolvingFundReplenishmentStatuses = {
  cancelled: "Cancelled",
  disapproved: "Disapproved",
  draft: "Draft",
  forApproval: "For Approval",
  open: "Open",
  posted: "Posted",
} as const;
export const RevolvingFundReplenishmentRecordStatuses = [
  "Posted",
  "For Approval",
  "Draft",
  "Disapproved",
  "Cancelled",
] as const satisfies readonly RevolvingFundReplenishmentStatus[];
export const RevolvingFundReplenishmentStatusOptions = ["All", ...RevolvingFundReplenishmentRecordStatuses] as const;
export const RevolvingFundReplenishmentActionTabs: {
  id: RevolvingFundReplenishmentActionTab;
  label: string;
}[] = [
  { id: "details", label: "Replenishment Details" },
  { id: "attachments", label: "File Attachments" },
];
export const RevolvingFundReplenishmentEntryTabs: { id: RevolvingFundReplenishmentEntryTab; label: string }[] = [
  { id: "vouchers", label: "Revolving Fund Entries" },
  { id: "accounting", label: "Accounting Entries" },
];
export const RevolvingFundReplenishmentEntryInputClassName =
  "h-10 w-full min-w-0 border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 read-only:bg-darknavy/[0.03] read-only:text-darknavy";
export const RevolvingFundReplenishmentEntryColumnOrder: RevolvingFundReplenishmentEntryColumnId[] = [
  "revolvingFundDate",
  "revolvingFundNo",
  "supplierCode",
  "supplierName",
  "amount",
  "vatType",
  "vatPercent",
  "vatAmount",
  "netAmount",
  "ewtCode",
  "ewtPercent",
  "ewtAmount",
  "disburseAmount",
  "responsibilityCenterCode",
  "responsibilityCenterName",
  "particulars",
];
export const RevolvingFundReplenishmentDefaultVisibleEntryColumnIds: RevolvingFundReplenishmentEntryColumnId[] = [
  "revolvingFundDate",
  "revolvingFundNo",
  "supplierName",
  "amount",
  "disburseAmount",
];
export const RevolvingFundReplenishmentEntryColumnLabels: Record<RevolvingFundReplenishmentEntryColumnId, string> = {
  revolvingFundDate: "Revolving Fund Date",
  revolvingFundNo: "Revolving Fund No.",
  supplierCode: "Supplier Code",
  supplierName: "Supplier Name",
  amount: "Gross Amount",
  netAmount: "NET Amount",
  vatType: "VAT Type",
  vatPercent: "VAT Rate",
  vatAmount: "VAT Amount",
  ewtCode: "EWT Code",
  ewtPercent: "EWT Rate",
  ewtAmount: "EWT Amount",
  disburseAmount: "Disburse Amount",
  responsibilityCenterCode: "Responsibility Center Code",
  responsibilityCenterName: "Responsibility Center",
  particulars: "Particulars",
};
export const RevolvingFundReplenishmentEntryColumnWidths: Record<RevolvingFundReplenishmentEntryColumnId, number> = {
  revolvingFundDate: 230,
  revolvingFundNo: 230,
  supplierCode: 190,
  supplierName: 230,
  amount: 185,
  netAmount: 180,
  vatType: 175,
  vatPercent: 160,
  vatAmount: 175,
  ewtCode: 175,
  ewtPercent: 160,
  ewtAmount: 175,
  disburseAmount: 165,
  responsibilityCenterCode: 250,
  responsibilityCenterName: 240,
  particulars: 240,
};
export const RevolvingFundReplenishmentProtectedEntryColumnIds = new Set<RevolvingFundReplenishmentEntryColumnId>([
  "supplierName",
  "amount",
]);
export const RevolvingFundReplenishmentAccountingColumnOrder: RevolvingFundReplenishmentAccountingColumnId[] = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "particulars",
];
export const RevolvingFundReplenishmentAccountingColumnLabels: Record<RevolvingFundReplenishmentAccountingColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  debit: "Debit",
  credit: "Credit",
  partyCode: "Supplier Code",
  partyName: "Supplier Name",
  particulars: "Particulars",
};
export const RevolvingFundReplenishmentAccountingColumnWidths: Record<RevolvingFundReplenishmentAccountingColumnId, number> = {
  accountCode: 175,
  accountTitle: 240,
  debit: 150,
  credit: 150,
  partyCode: 190,
  partyName: 230,
  particulars: 260,
};
export const RevolvingFundReplenishmentProtectedAccountingColumnIds = new Set<RevolvingFundReplenishmentAccountingColumnId>([
  "accountCode",
  "debit",
  "credit",
]);
export const RevolvingFundReplenishmentPartyOptions: AppAdvancedDropdownOption[] = [
  { label: "E000102", name: "Raymark B. Arsicolo", value: "E000102" },
  { label: "E000117", name: "Maria L. Dela Cruz", value: "E000117" },
  { label: "E000145", name: "Jose P. Santos", value: "E000145" },
];
export const RevolvingFundReplenishmentSupplierOptions: AppAdvancedDropdownOption[] = [
  { label: "V100006", name: "All4U Restaurant", value: "V100006" },
  { label: "S000041", name: "Pacific Office Solutions, Inc.", value: "S000041" },
  { label: "S000058", name: "Metro Industrial Trading", value: "S000058" },
  { label: "S000073", name: "Northstar Equipment Supply", value: "S000073" },
];
export const RevolvingFundReplenishmentAccountOptions: AppAdvancedDropdownOption[] = [
  { label: "101-200", name: "Revolving Fund", value: "101-200" },
  { label: "101-210", name: "Cash on Hand", value: "101-210" },
];
export const RevolvingFundReplenishmentProjectOptions: AppAdvancedDropdownOption[] = [
  { label: "PRJ-001", name: "Main Office Operations", value: "PRJ-001" },
  { label: "PRJ-002", name: "Branch Expansion", value: "PRJ-002" },
];
export const RevolvingFundReplenishmentResponsibilityCenterOptions: AppAdvancedDropdownOption[] = [
  { label: "RC-ADM", name: "Administration", value: "RC-ADM" },
  { label: "RC-OPS", name: "Operations", value: "RC-OPS" },
  { label: "RC-SAL", name: "Sales", value: "RC-SAL" },
];
export const RevolvingFundReplenishmentEntryVatTypeOptions: AppAdvancedDropdownOption[] = [
  { label: "", name: "VAT (12%)", selectedDetails: "VAT (12%)", value: "VAT 12%" },
  { label: "", name: "Zero Rated (0%)", selectedDetails: "Zero Rated (0%)", value: "Zero Rated" },
  { label: "", name: "Exempt (0%)", selectedDetails: "Exempt (0%)", value: "Exempt" },
];
export const RevolvingFundReplenishmentEntryEwtCodeOptions: AppAdvancedDropdownOption[] = [
  { description: "Professional Fees - 10%", label: "", name: "W10 (10%)", selectedDetails: "W10 (10%)", value: "W10" },
  { description: "Professional Fees - 5%", label: "", name: "W05 (5%)", selectedDetails: "W05 (5%)", value: "W05" },
  { description: "Goods - 1%", label: "", name: "WV01 (1%)", selectedDetails: "WV01 (1%)", value: "WV01" },
  { description: "Services - 2%", label: "", name: "WV02 (2%)", selectedDetails: "WV02 (2%)", value: "WV02" },
];

export function canEditRevolvingFundReplenishment(status: RevolvingFundReplenishmentStatus) {
  return (
    status === RevolvingFundReplenishmentStatuses.draft ||
    status === RevolvingFundReplenishmentStatuses.forApproval ||
    status === RevolvingFundReplenishmentStatuses.disapproved
  );
}
