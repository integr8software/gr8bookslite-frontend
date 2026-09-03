import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  PettyCashReplenishmentActionMode,
  PettyCashReplenishmentActionTab,
  PettyCashReplenishmentAccountingColumnId,
  PettyCashReplenishmentConfirmationAction,
  PettyCashReplenishmentEntryColumnId,
  PettyCashReplenishmentEntryTab,
  PettyCashReplenishmentFormStatus,
  PettyCashReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";

export const PettyCashReplenishmentLink = getModuleRoute("PCR");
export const PettyCashReplenishmentAddLink = `${PettyCashReplenishmentLink}/add`;
export const getPettyCashReplenishmentEditLink = (recordId: string) => `${PettyCashReplenishmentLink}/edit/${recordId}`;
export const getPettyCashReplenishmentViewLink = (recordId: string) => `${PettyCashReplenishmentLink}/view/${recordId}`;

export const PettyCashReplenishmentActionModes = {
  Add: "add",
  Edit: "edit",
  View: "view",
} as const satisfies Record<string, PettyCashReplenishmentActionMode>;
export const PettyCashReplenishmentStorageKey = "cash-disbursement-petty-cash-replenishment-records";
export const PettyCashReplenishmentPaginationStorageKey = "cash-disbursement-petty-cash-replenishment-table";
export const PettyCashReplenishmentConfirmationDialogTitles: Record<PettyCashReplenishmentConfirmationAction, string> = {
  save: "Save Petty Cash Replenishment?",
  draft: "Save Petty Cash Replenishment as Draft?",
  approve: "Approve Petty Cash Replenishment?",
  disapprove: "Disapprove Petty Cash Replenishment?",
  cancel: "Cancel Petty Cash Replenishment?",
};
export const PettyCashReplenishmentConfirmationDialogConfirmLabels: Record<PettyCashReplenishmentConfirmationAction, string> = {
  save: "Save and Submit",
  draft: "Save as Draft",
  approve: "Approve",
  disapprove: "Disapprove",
  cancel: "Cancel",
};
export const PettyCashReplenishmentColumnLabels = {
  transactionNo: "Replenishment No.",
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
export const PettyCashReplenishmentOverviewColumnWidths: Record<keyof typeof PettyCashReplenishmentColumnLabels, number> = {
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
export const PettyCashReplenishmentDefaultVisibleColumnIds = [
  "transactionNo",
  "documentDate",
  "partyName",
  "amount",
  "disburseAmount",
  "status",
  "actions",
] as const;
export const PettyCashReplenishmentDefaultColumnVisibility = Object.fromEntries(
  Object.keys(PettyCashReplenishmentColumnLabels).map((columnId) => [
    columnId,
    PettyCashReplenishmentDefaultVisibleColumnIds.includes(columnId as (typeof PettyCashReplenishmentDefaultVisibleColumnIds)[number]),
  ]),
);
export const PettyCashReplenishmentStatuses = {
  Cancelled: "Cancelled",
  Disapproved: "Disapproved",
  Draft: "Draft",
  ForApproval: "For Approval",
  Open: "Open",
  Posted: "Posted",
} as const satisfies Record<string, PettyCashReplenishmentFormStatus>;
export const PettyCashReplenishmentRecordStatuses = [
  PettyCashReplenishmentStatuses.Draft,
  PettyCashReplenishmentStatuses.ForApproval,
  PettyCashReplenishmentStatuses.Posted,
  PettyCashReplenishmentStatuses.Disapproved,
  PettyCashReplenishmentStatuses.Cancelled,
] as const satisfies readonly PettyCashReplenishmentStatus[];
export const EditablePettyCashReplenishmentStatuses: readonly PettyCashReplenishmentStatus[] = [
  PettyCashReplenishmentStatuses.Draft,
  PettyCashReplenishmentStatuses.Disapproved,
];
export const PettyCashReplenishmentAllStatusFilter = "all";
export const PettyCashReplenishmentStatusFilterOptions = [
  { label: "All statuses", value: PettyCashReplenishmentAllStatusFilter },
  { label: "Draft", value: PettyCashReplenishmentStatuses.Draft },
  { label: "For Approval", value: PettyCashReplenishmentStatuses.ForApproval },
  { label: "Posted", value: PettyCashReplenishmentStatuses.Posted },
  { label: "Disapproved", value: PettyCashReplenishmentStatuses.Disapproved },
  { label: "Cancelled", value: PettyCashReplenishmentStatuses.Cancelled },
] as const;
export const PettyCashReplenishmentStatusFilters = [
  PettyCashReplenishmentAllStatusFilter,
  ...PettyCashReplenishmentRecordStatuses,
] as const;
export const PettyCashReplenishmentActionTabs: {
  id: PettyCashReplenishmentActionTab;
  label: string;
}[] = [
  { id: "details", label: "Replenishment Details" },
  { id: "attachments", label: "File Attachments" },
];
export const PettyCashReplenishmentEntryTabs: { id: PettyCashReplenishmentEntryTab; label: string }[] = [
  { id: "vouchers", label: "Petty Cash Voucher Entries" },
  { id: "accounting", label: "Accounting Entries" },
];
export const PettyCashReplenishmentEntryColumnOrder: PettyCashReplenishmentEntryColumnId[] = [
  "pettyCashDate",
  "pettyCashNo",
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
export const PettyCashReplenishmentDefaultVisibleEntryColumnIds: PettyCashReplenishmentEntryColumnId[] = [
  "pettyCashDate",
  "pettyCashNo",
  "supplierName",
  "amount",
  "disburseAmount",
];
export const PettyCashReplenishmentEntryColumnLabels: Record<PettyCashReplenishmentEntryColumnId, string> = {
  pettyCashDate: "Petty Cash Date",
  pettyCashNo: "Petty Cash No.",
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
export const PettyCashReplenishmentEntryColumnWidths: Record<PettyCashReplenishmentEntryColumnId, number> = {
  pettyCashDate: 200,
  pettyCashNo: 200,
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
export const PettyCashReplenishmentProtectedEntryColumnIds = new Set<PettyCashReplenishmentEntryColumnId>(["supplierName", "amount"]);
export const PettyCashReplenishmentAccountingColumnOrder: PettyCashReplenishmentAccountingColumnId[] = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "particulars",
];
export const PettyCashReplenishmentAccountingColumnLabels: Record<PettyCashReplenishmentAccountingColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  debit: "Debit",
  credit: "Credit",
  partyCode: "Supplier Code",
  partyName: "Supplier Name",
  particulars: "Particulars",
};
export const PettyCashReplenishmentAccountingColumnWidths: Record<PettyCashReplenishmentAccountingColumnId, number> = {
  accountCode: 175,
  accountTitle: 240,
  debit: 150,
  credit: 150,
  partyCode: 190,
  partyName: 230,
  particulars: 260,
};
export const PettyCashReplenishmentProtectedAccountingColumnIds = new Set<PettyCashReplenishmentAccountingColumnId>([
  "accountCode",
  "debit",
  "credit",
]);

export function canEditPettyCashReplenishment(status: PettyCashReplenishmentStatus) {
  return EditablePettyCashReplenishmentStatuses.includes(status);
}
