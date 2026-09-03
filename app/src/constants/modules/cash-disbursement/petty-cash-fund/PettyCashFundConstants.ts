import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  PettyCashFundActionMode,
  PettyCashFundActionTab,
  PettyCashFundAccountingColumnId,
  PettyCashFundConfirmationAction,
  PettyCashFundEntryTab,
  PettyCashFundFormStatus,
  PettyCashFundItemColumnId,
  PettyCashFundStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";

export const PettyCashFundLink = getModuleRoute("PCF");
export const PettyCashFundAddLink = `${PettyCashFundLink}/add`;
export const getPettyCashFundEditLink = (recordId: string) => `${PettyCashFundLink}/edit/${recordId}`;
export const getPettyCashFundViewLink = (recordId: string) => `${PettyCashFundLink}/view/${recordId}`;

export const PettyCashFundActionModes = {
  Add: "add",
  Edit: "edit",
  View: "view",
} as const satisfies Record<string, PettyCashFundActionMode>;
export const PettyCashFundStorageKey = "cash-disbursement-petty-cash-fund-records";
export const PettyCashFundPaginationStorageKey = "cash-disbursement-petty-cash-fund-table";
export const PettyCashFundCopyFromSources = ["Petty Cash Voucher"] as const;
export const PettyCashFundColumnLabels = {
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
export const PettyCashFundDefaultVisibleColumnIds = [
  "transactionNo",
  "documentDate",
  "partyName",
  "amount",
  "disburseAmount",
  "status",
  "actions",
] as const;
export const PettyCashFundDefaultColumnVisibility = Object.fromEntries(
  Object.keys(PettyCashFundColumnLabels).map((columnId) => [
    columnId,
    PettyCashFundDefaultVisibleColumnIds.includes(columnId as (typeof PettyCashFundDefaultVisibleColumnIds)[number]),
  ]),
);
export const PettyCashFundStatuses = {
  Cancelled: "Cancelled",
  Disapproved: "Disapproved",
  Draft: "Draft",
  ForApproval: "For Approval",
  Open: "Open",
  Posted: "Posted",
} as const satisfies Record<string, PettyCashFundFormStatus>;
export const PettyCashFundConfirmationDialogTitles: Record<PettyCashFundConfirmationAction, string> = {
  save: "Save Petty Cash Fund?",
  draft: "Save Petty Cash Fund as Draft?",
  approve: "Approve Petty Cash Fund?",
  disapprove: "Disapprove Petty Cash Fund?",
  cancel: "Cancel Petty Cash Fund?",
};
export const PettyCashFundConfirmationDialogConfirmLabels: Record<PettyCashFundConfirmationAction, string> = {
  save: "Save and Submit",
  draft: "Save as Draft",
  approve: "Approve",
  disapprove: "Disapprove",
  cancel: "Cancel",
};
export const PettyCashFundRecordStatuses = [
  PettyCashFundStatuses.Draft,
  PettyCashFundStatuses.ForApproval,
  PettyCashFundStatuses.Posted,
  PettyCashFundStatuses.Disapproved,
  PettyCashFundStatuses.Cancelled,
] as const satisfies readonly PettyCashFundStatus[];
export const EditablePettyCashFundStatuses: readonly PettyCashFundStatus[] = [
  PettyCashFundStatuses.Draft,
  PettyCashFundStatuses.Disapproved,
];
export const PettyCashFundAllStatusFilter = "all";
export const PettyCashFundStatusFilterOptions = [
  { label: "All statuses", value: PettyCashFundAllStatusFilter },
  { label: "Draft", value: PettyCashFundStatuses.Draft },
  { label: "For Approval", value: PettyCashFundStatuses.ForApproval },
  { label: "Posted", value: PettyCashFundStatuses.Posted },
  { label: "Disapproved", value: PettyCashFundStatuses.Disapproved },
  { label: "Cancelled", value: PettyCashFundStatuses.Cancelled },
] as const;
export const PettyCashFundStatusFilters = [PettyCashFundAllStatusFilter, ...PettyCashFundRecordStatuses] as const;
export const PettyCashFundActionTabs: { id: PettyCashFundActionTab; label: string }[] = [
  { id: "details", label: "Fund Details" },
  { id: "attachments", label: "File Attachments" },
];
export const PettyCashFundEntryTabs: { id: PettyCashFundEntryTab; label: string }[] = [
  { id: "items", label: "Items" },
  { id: "accounting", label: "Accounting Entries" },
];
export const PettyCashFundAccountingEntryTab: PettyCashFundEntryTab = "accounting";
export const PettyCashFundDefaultItemColumnIds: PettyCashFundItemColumnId[] = [
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
export const PettyCashFundDefaultVisibleItemColumnIds: PettyCashFundItemColumnId[] = ["date", "supplierName", "amount", "disburseAmount"];
export const PettyCashFundItemColumnLabels: Record<PettyCashFundItemColumnId, string> = {
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
export const PettyCashFundItemColumnWidths: Record<PettyCashFundItemColumnId, number> = {
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
export const PettyCashFundProtectedItemColumnIds = new Set<PettyCashFundItemColumnId>(["supplierName", "amount"]);
export const PettyCashFundDefaultAccountingColumnIds: PettyCashFundAccountingColumnId[] = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "particulars",
];
export const PettyCashFundAccountingColumnLabels: Record<PettyCashFundAccountingColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  debit: "Debit",
  credit: "Credit",
  partyCode: "Supplier Code",
  partyName: "Supplier Name",
  particulars: "Particulars",
};
export const PettyCashFundAccountingColumnWidths: Record<PettyCashFundAccountingColumnId, number> = {
  accountCode: 175,
  accountTitle: 240,
  debit: 150,
  credit: 150,
  partyCode: 190,
  partyName: 230,
  particulars: 260,
};
export const PettyCashFundProtectedAccountingColumnIds = new Set<PettyCashFundAccountingColumnId>(["accountCode", "debit", "credit"]);

export function canEditPettyCashFund(status: PettyCashFundStatus) {
  return EditablePettyCashFundStatuses.includes(status);
}
