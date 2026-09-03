import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  RevolvingFundActionMode,
  RevolvingFundActionTab,
  RevolvingFundAccountingColumnId,
  RevolvingFundConfirmationAction,
  RevolvingFundEntryTab,
  RevolvingFundFormStatus,
  RevolvingFundItemColumnId,
  RevolvingFundStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";

export const RevolvingFundLink = getModuleRoute("RF");
export const RevolvingFundAddLink = `${RevolvingFundLink}/add`;
export const getRevolvingFundEditLink = (recordId: string) => `${RevolvingFundLink}/edit/${recordId}`;
export const getRevolvingFundViewLink = (recordId: string) => `${RevolvingFundLink}/view/${recordId}`;

export const RevolvingFundActionModes = {
  Add: "add",
  Edit: "edit",
  View: "view",
} as const satisfies Record<string, RevolvingFundActionMode>;
export const RevolvingFundStorageKey = "cash-disbursement-revolving-fund-records";
export const RevolvingFundPaginationStorageKey = "cash-disbursement-revolving-fund-table";
export const RevolvingFundCopyFromSources = ["Disbursement Voucher"] as const;
export const RevolvingFundColumnLabels = {
  transactionNo: "Fund No.",
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
export const RevolvingFundDefaultVisibleColumnIds = [
  "transactionNo",
  "documentDate",
  "partyName",
  "amount",
  "disburseAmount",
  "status",
  "actions",
] as const;
export const RevolvingFundDefaultColumnVisibility = Object.fromEntries(
  Object.keys(RevolvingFundColumnLabels).map((columnId) => [
    columnId,
    RevolvingFundDefaultVisibleColumnIds.includes(columnId as (typeof RevolvingFundDefaultVisibleColumnIds)[number]),
  ]),
);
export const RevolvingFundStatuses = {
  Cancelled: "Cancelled",
  Disapproved: "Disapproved",
  Draft: "Draft",
  ForApproval: "For Approval",
  Open: "Open",
  Posted: "Posted",
} as const satisfies Record<string, RevolvingFundFormStatus>;
export const RevolvingFundConfirmationDialogTitles: Record<RevolvingFundConfirmationAction, string> = {
  save: "Save Revolving Fund?",
  draft: "Save Revolving Fund as Draft?",
  approve: "Approve Revolving Fund?",
  disapprove: "Disapprove Revolving Fund?",
  cancel: "Cancel Revolving Fund?",
};
export const RevolvingFundConfirmationDialogConfirmLabels: Record<RevolvingFundConfirmationAction, string> = {
  save: "Save and Submit",
  draft: "Save as Draft",
  approve: "Approve",
  disapprove: "Disapprove",
  cancel: "Cancel",
};
export const RevolvingFundRecordStatuses = [
  RevolvingFundStatuses.Draft,
  RevolvingFundStatuses.ForApproval,
  RevolvingFundStatuses.Posted,
  RevolvingFundStatuses.Disapproved,
  RevolvingFundStatuses.Cancelled,
] as const satisfies readonly RevolvingFundStatus[];
export const EditableRevolvingFundStatuses: readonly RevolvingFundStatus[] = [
  RevolvingFundStatuses.Draft,
  RevolvingFundStatuses.Disapproved,
];
export const RevolvingFundAllStatusFilter = "all";
export const RevolvingFundStatusFilterOptions = [
  { label: "All statuses", value: RevolvingFundAllStatusFilter },
  { label: "Draft", value: RevolvingFundStatuses.Draft },
  { label: "For Approval", value: RevolvingFundStatuses.ForApproval },
  { label: "Posted", value: RevolvingFundStatuses.Posted },
  { label: "Disapproved", value: RevolvingFundStatuses.Disapproved },
  { label: "Cancelled", value: RevolvingFundStatuses.Cancelled },
] as const;
export const RevolvingFundStatusFilters = [RevolvingFundAllStatusFilter, ...RevolvingFundRecordStatuses] as const;
export const RevolvingFundActionTabs: { id: RevolvingFundActionTab; label: string }[] = [
  { id: "details", label: "Fund Details" },
  { id: "attachments", label: "File Attachments" },
];
export const RevolvingFundEntryTabs: { id: RevolvingFundEntryTab; label: string }[] = [
  { id: "items", label: "Items" },
  { id: "accounting", label: "Accounting Entries" },
];
export const RevolvingFundAccountingEntryTab: RevolvingFundEntryTab = "accounting";
export const RevolvingFundDefaultItemColumnIds: RevolvingFundItemColumnId[] = [
  "date",
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
  "orNo",
];
export const RevolvingFundDefaultVisibleItemColumnIds: RevolvingFundItemColumnId[] = ["date", "supplierName", "amount", "disburseAmount"];
export const RevolvingFundItemColumnLabels: Record<RevolvingFundItemColumnId, string> = {
  date: "Date",
  supplierCode: "Supplier Code",
  supplierName: "Supplier Name",
  orNo: "Reference No.",
  tinNo: "TIN No.",
  particulars: "Particulars",
  amount: "Gross Amount",
  type: "Type",
  vatType: "VAT Type",
  vatPercent: "VAT %",
  vatAmount: "VAT Amount",
  netAmount: "NET Amount",
  ewtCode: "EWT Code",
  ewtPercent: "EWT %",
  ewtAmount: "EWT Amount",
  disburseAmount: "Total Disbursed",
  grossAmount: "Gross Amount",
  responsibilityCenterCode: "Responsibility Center Code",
  responsibilityCenterName: "Responsibility Center",
};
export const RevolvingFundItemColumnWidths: Record<RevolvingFundItemColumnId, number> = {
  date: 140,
  supplierCode: 190,
  supplierName: 230,
  orNo: 190,
  tinNo: 150,
  particulars: 240,
  amount: 185,
  type: 140,
  vatType: 175,
  vatPercent: 160,
  vatAmount: 175,
  netAmount: 180,
  ewtCode: 175,
  ewtPercent: 160,
  ewtAmount: 175,
  disburseAmount: 165,
  grossAmount: 185,
  responsibilityCenterCode: 250,
  responsibilityCenterName: 240,
};
export const RevolvingFundProtectedItemColumnIds = new Set<RevolvingFundItemColumnId>(["supplierName", "amount"]);
export const RevolvingFundDefaultAccountingColumnIds: RevolvingFundAccountingColumnId[] = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "particulars",
];
export const RevolvingFundAccountingColumnLabels: Record<RevolvingFundAccountingColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  debit: "Debit",
  credit: "Credit",
  partyCode: "Supplier Code",
  partyName: "Supplier Name",
  particulars: "Particulars",
};
export const RevolvingFundAccountingColumnWidths: Record<RevolvingFundAccountingColumnId, number> = {
  accountCode: 175,
  accountTitle: 240,
  debit: 150,
  credit: 150,
  partyCode: 190,
  partyName: 230,
  particulars: 260,
};
export const RevolvingFundProtectedAccountingColumnIds = new Set<RevolvingFundAccountingColumnId>(["accountCode", "debit", "credit"]);

export function canEditRevolvingFund(status: RevolvingFundStatus) {
  return EditableRevolvingFundStatuses.includes(status);
}
