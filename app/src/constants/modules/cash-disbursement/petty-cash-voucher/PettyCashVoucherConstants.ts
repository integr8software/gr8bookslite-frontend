import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  PettyCashVoucherActionMode,
  PettyCashVoucherActionTab,
  PettyCashVoucherAccountingColumnId,
  PettyCashVoucherConfirmationAction,
  PettyCashVoucherEntryTab,
  PettyCashVoucherFormStatus,
  PettyCashVoucherItemColumnId,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";

export const PettyCashVoucherLink = getModuleRoute("PCV");
export const PettyCashVoucherAddLink = `${PettyCashVoucherLink}/add`;
export const getPettyCashVoucherEditLink = (recordId: string) => `${PettyCashVoucherLink}/edit/${recordId}`;
export const getPettyCashVoucherViewLink = (recordId: string) => `${PettyCashVoucherLink}/view/${recordId}`;

export const PettyCashVoucherActionModes = {
  Add: "add",
  Edit: "edit",
  View: "view",
} as const satisfies Record<string, PettyCashVoucherActionMode>;
export const PettyCashVoucherStorageKey = "cash-disbursement-petty-cash-voucher-records";
export const PettyCashVoucherPaginationStorageKey = "cash-disbursement-petty-cash-voucher-table";
export const PettyCashVoucherCopyFromSources = ["Petty Cash Voucher"] as const;
export const PettyCashVoucherColumnLabels = {
  transactionNo: "PCV No.",
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
export const PettyCashVoucherDefaultVisibleColumnIds = [
  "transactionNo",
  "documentDate",
  "partyName",
  "amount",
  "disburseAmount",
  "status",
  "actions",
] as const;
export const PettyCashVoucherDefaultColumnVisibility = Object.fromEntries(
  Object.keys(PettyCashVoucherColumnLabels).map((columnId) => [
    columnId,
    PettyCashVoucherDefaultVisibleColumnIds.includes(columnId as (typeof PettyCashVoucherDefaultVisibleColumnIds)[number]),
  ]),
);
export const PettyCashVoucherStatuses = {
  Cancelled: "Cancelled",
  Disapproved: "Disapproved",
  Draft: "Draft",
  ForApproval: "For Approval",
  Open: "Open",
  Posted: "Posted",
} as const satisfies Record<string, PettyCashVoucherFormStatus>;
export const PettyCashVoucherConfirmationDialogTitles: Record<PettyCashVoucherConfirmationAction, string> = {
  save: "Save Petty Cash Voucher?",
  draft: "Save Petty Cash Voucher as Draft?",
  approve: "Approve Petty Cash Voucher?",
  disapprove: "Disapprove Petty Cash Voucher?",
  cancel: "Cancel Petty Cash Voucher?",
};
export const PettyCashVoucherConfirmationDialogConfirmLabels: Record<PettyCashVoucherConfirmationAction, string> = {
  save: "Save and Submit",
  draft: "Save as Draft",
  approve: "Approve",
  disapprove: "Disapprove",
  cancel: "Cancel",
};
export const PettyCashVoucherRecordStatuses = [
  PettyCashVoucherStatuses.Posted,
  PettyCashVoucherStatuses.ForApproval,
  PettyCashVoucherStatuses.Draft,
  PettyCashVoucherStatuses.Disapproved,
  PettyCashVoucherStatuses.Cancelled,
] as const satisfies readonly PettyCashVoucherStatus[];

export const EditablePettyCashVoucherStatuses: readonly PettyCashVoucherStatus[] = [
  PettyCashVoucherStatuses.Draft,
  PettyCashVoucherStatuses.Disapproved,
];
export const PettyCashVoucherAllStatusFilter = "all";

export const PettyCashVoucherStatusFilterOptions = [
  { label: "All statuses", value: PettyCashVoucherAllStatusFilter },
  { label: "Draft", value: PettyCashVoucherStatuses.Draft },
  { label: "For Approval", value: PettyCashVoucherStatuses.ForApproval },
  { label: "Posted", value: PettyCashVoucherStatuses.Posted },
  { label: "Disapproved", value: PettyCashVoucherStatuses.Disapproved },
  { label: "Cancelled", value: PettyCashVoucherStatuses.Cancelled },
] as const;
export const PettyCashVoucherStatusFilters = [PettyCashVoucherAllStatusFilter, ...PettyCashVoucherRecordStatuses] as const;
export const PettyCashVoucherActionTabs: { id: PettyCashVoucherActionTab; label: string }[] = [
  { id: "details", label: "Fund Details" },
  { id: "attachments", label: "File Attachments" },
];
export const PettyCashVoucherEntryTabs: { id: PettyCashVoucherEntryTab; label: string }[] = [
  { id: "items", label: "Items" },
  { id: "accounting", label: "Accounting Entries" },
];
export const PettyCashVoucherAccountingEntryTab: PettyCashVoucherEntryTab = "accounting";
export const PettyCashVoucherDefaultItemColumnIds: PettyCashVoucherItemColumnId[] = [
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
export const PettyCashVoucherDefaultVisibleItemColumnIds: PettyCashVoucherItemColumnId[] = ["date", "supplierName", "amount", "disburseAmount"];
export const PettyCashVoucherItemColumnLabels: Record<PettyCashVoucherItemColumnId, string> = {
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
  netAmount: "Net of VAT",
  ewtCode: "EWT Code",
  ewtPercent: "EWT %",
  ewtAmount: "EWT Amount",
  disburseAmount: "Total Disbursed",
  grossAmount: "Gross Amount",
  responsibilityCenterCode: "Responsibility Center Code",
  responsibilityCenterName: "Responsibility Center",
};
export const PettyCashVoucherItemColumnWidths: Record<PettyCashVoucherItemColumnId, number> = {
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
export const PettyCashVoucherProtectedItemColumnIds = new Set<PettyCashVoucherItemColumnId>(["supplierName", "amount"]);
export const PettyCashVoucherDefaultAccountingColumnIds: PettyCashVoucherAccountingColumnId[] = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "particulars",
];
export const PettyCashVoucherAccountingColumnLabels: Record<PettyCashVoucherAccountingColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  debit: "Debit",
  credit: "Credit",
  partyCode: "Supplier Code",
  partyName: "Supplier Name",
  particulars: "Particulars",
};
export const PettyCashVoucherAccountingColumnWidths: Record<PettyCashVoucherAccountingColumnId, number> = {
  accountCode: 175,
  accountTitle: 240,
  debit: 150,
  credit: 150,
  partyCode: 190,
  partyName: 230,
  particulars: 260,
};
export const PettyCashVoucherProtectedAccountingColumnIds = new Set<PettyCashVoucherAccountingColumnId>(["accountCode", "debit", "credit"]);

export function canEditPettyCashVoucher(status: PettyCashVoucherStatus) {
  return EditablePettyCashVoucherStatuses.includes(status);
}
