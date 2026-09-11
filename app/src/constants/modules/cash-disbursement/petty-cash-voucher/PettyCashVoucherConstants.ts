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
export const PettyCashVoucherDetailTablePreferencesStorageKey = "gr8books:petty-cash-voucher:detail-table-preferences";
export const PettyCashVoucherAccountingTablePreferencesStorageKey = "gr8books:petty-cash-voucher:accounting-table-preferences";
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
  { id: "details", label: "Voucher Details" },
  { id: "attachments", label: "File Attachments" },
];
export const PettyCashVoucherEntryTabs: { id: PettyCashVoucherEntryTab; label: string }[] = [
  { id: "items", label: "Fund Details" },
  { id: "accounting", label: "Accounting Entries" },
];
export const PettyCashVoucherAccountingEntryTab: PettyCashVoucherEntryTab = "accounting";
export const PettyCashVoucherDefaultItemColumnIds: PettyCashVoucherItemColumnId[] = [
  "disbursementType",
  "particulars",
  "amount",
  "supplierCode",
  "supplierName",
  "vatType",
  "vatPercent",
  "netAmount",
  "vatAmount",
  "date",
  "ewtCode",
  "ewtPercent",
  "ewtAmount",
  "disburseAmount",
  "responsibilityCenterCode",
  "responsibilityCenterName",
  "orNo",
  "tinNo",
  "grossAmount",
];
export const PettyCashVoucherDefaultVisibleItemColumnIds: PettyCashVoucherItemColumnId[] = [
  "disbursementType",
  "particulars",
  "amount",
  "supplierName",
  "disburseAmount",
];
export const PettyCashVoucherItemColumnLabels: Record<PettyCashVoucherItemColumnId, string> = {
  disbursementType: "Disbursement Type",
  particulars: "Particulars",
  amount: "Gross Amount",
  supplierCode: "Supplier Code",
  supplierName: "Supplier Name",
  vatType: "VAT Type",
  vatPercent: "VAT %",
  netAmount: "Net of VAT",
  vatAmount: "VAT Amount",
  date: "Date",
  ewtCode: "ATC",
  ewtPercent: "ATC %",
  ewtAmount: "EWT Amount",
  responsibilityCenterCode: "Responsibility Center Code",
  responsibilityCenterName: "Responsibility Center",
  orNo: "Reference No.",
  tinNo: "TIN No.",
  type: "Disbursement Type",
  disburseAmount: "Total Disbursed",
  grossAmount: "Gross Amount",
};
export const PettyCashVoucherItemColumnWidths: Record<PettyCashVoucherItemColumnId, number> = {
  disbursementType: 220,
  particulars: 240,
  amount: 170,
  supplierCode: 190,
  supplierName: 230,
  vatType: 175,
  vatPercent: 120,
  netAmount: 160,
  vatAmount: 160,
  date: 140,
  ewtCode: 175,
  ewtPercent: 120,
  ewtAmount: 160,
  responsibilityCenterCode: 220,
  responsibilityCenterName: 240,
  orNo: 190,
  tinNo: 150,
  type: 220,
  disburseAmount: 165,
  grossAmount: 185,
};
export const PettyCashVoucherProtectedItemColumnIds = new Set<PettyCashVoucherItemColumnId>([
  "disbursementType",
  "particulars",
  "amount",
  "supplierName",
  "disburseAmount",
]);
export const PettyCashVoucherDefaultAccountingColumnIds: PettyCashVoucherAccountingColumnId[] = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "particulars",
];
export const PettyCashVoucherDefaultVisibleAccountingColumnIds: PettyCashVoucherAccountingColumnId[] = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
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
export const PettyCashVoucherProtectedAccountingColumnIds = new Set<PettyCashVoucherAccountingColumnId>([
  "accountTitle",
  "debit",
  "credit",
  "particulars",
]);

export function canEditPettyCashVoucher(status: PettyCashVoucherStatus) {
  return EditablePettyCashVoucherStatuses.includes(status);
}
