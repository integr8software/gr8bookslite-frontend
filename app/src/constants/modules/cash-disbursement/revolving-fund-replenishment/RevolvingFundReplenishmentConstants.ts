import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  RevolvingFundReplenishmentActionMode,
  RevolvingFundReplenishmentActionTab,
  RevolvingFundReplenishmentAccountingColumnId,
  RevolvingFundReplenishmentConfirmationAction,
  RevolvingFundReplenishmentEntryColumnId,
  RevolvingFundReplenishmentEntryTab,
  RevolvingFundReplenishmentFormStatus,
  RevolvingFundReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";

export const RevolvingFundReplenishmentLink = getModuleRoute("RFR");
export const RevolvingFundReplenishmentAddLink = `${RevolvingFundReplenishmentLink}/add`;
export const getRevolvingFundReplenishmentEditLink = (recordId: string) => `${RevolvingFundReplenishmentLink}/edit/${recordId}`;
export const getRevolvingFundReplenishmentViewLink = (recordId: string) => `${RevolvingFundReplenishmentLink}/view/${recordId}`;

export const RevolvingFundReplenishmentActionModes = {
  Add: "add",
  Edit: "edit",
  View: "view",
} as const satisfies Record<string, RevolvingFundReplenishmentActionMode>;
export const RevolvingFundReplenishmentStorageKey = "cash-disbursement-revolving-fund-replenishment-records";
export const RevolvingFundReplenishmentPaginationStorageKey = "cash-disbursement-revolving-fund-replenishment-table";
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
  disburseAmount: "Total Disbursed",
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
  disburseAmount: TransactionOverviewColumnWidths.amount,
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
  "disburseAmount",
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
  Cancelled: "Cancelled",
  Disapproved: "Disapproved",
  Draft: "Draft",
  ForApproval: "For Approval",
  Open: "Open",
  Posted: "Posted",
} as const satisfies Record<string, RevolvingFundReplenishmentFormStatus>;
export const RevolvingFundReplenishmentRecordStatuses = [
  RevolvingFundReplenishmentStatuses.Draft,
  RevolvingFundReplenishmentStatuses.ForApproval,
  RevolvingFundReplenishmentStatuses.Posted,
  RevolvingFundReplenishmentStatuses.Disapproved,
  RevolvingFundReplenishmentStatuses.Cancelled,
] as const satisfies readonly RevolvingFundReplenishmentStatus[];
export const EditableRevolvingFundReplenishmentStatuses: readonly RevolvingFundReplenishmentStatus[] = [
  RevolvingFundReplenishmentStatuses.Draft,
  RevolvingFundReplenishmentStatuses.Disapproved,
];
export const RevolvingFundReplenishmentAllStatusFilter = "all";
export const RevolvingFundReplenishmentStatusFilterOptions = [
  { label: "All statuses", value: RevolvingFundReplenishmentAllStatusFilter },
  { label: "Draft", value: RevolvingFundReplenishmentStatuses.Draft },
  { label: "For Approval", value: RevolvingFundReplenishmentStatuses.ForApproval },
  { label: "Posted", value: RevolvingFundReplenishmentStatuses.Posted },
  { label: "Disapproved", value: RevolvingFundReplenishmentStatuses.Disapproved },
  { label: "Cancelled", value: RevolvingFundReplenishmentStatuses.Cancelled },
] as const;
export const RevolvingFundReplenishmentStatusFilters = [
  RevolvingFundReplenishmentAllStatusFilter,
  ...RevolvingFundReplenishmentRecordStatuses,
] as const;
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
  vatPercent: "VAT %",
  vatAmount: "VAT Amount",
  ewtCode: "EWT Code",
  ewtPercent: "EWT %",
  ewtAmount: "EWT Amount",
  disburseAmount: "Total Disbursed",
  responsibilityCenterCode: "Responsibility Center Code",
  responsibilityCenterName: "Responsibility Center",
  particulars: "Particulars",
};
export const RevolvingFundReplenishmentEntryColumnWidths: Record<RevolvingFundReplenishmentEntryColumnId, number> = {
  revolvingFundDate: 200,
  revolvingFundNo: 200,
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

export function canEditRevolvingFundReplenishment(status: RevolvingFundReplenishmentStatus) {
  return EditableRevolvingFundReplenishmentStatuses.includes(status);
}
