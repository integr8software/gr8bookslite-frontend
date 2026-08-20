import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import { CashDisbursementOverviewActionColumnWidth } from "@/app/src/constants/modules/cash-disbursement/CashDisbursementConstants";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  AdvancesToSuppliersActionTab,
  AdvancesToSuppliersConfirmationAction,
  AdvancesToSuppliersStatus,
} from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export const AdvancesToSuppliersLink = getModuleRoute("ATS");
export const AdvancesToSuppliersAddLink = `${AdvancesToSuppliersLink}/add`;
export const getAdvancesToSuppliersEditLink = (recordId: string) => `${AdvancesToSuppliersLink}/edit/${recordId}`;
export const getAdvancesToSuppliersViewLink = (recordId: string) => `${AdvancesToSuppliersLink}/view/${recordId}`;
export const AdvancesToSuppliersStorageKey = "cash-disbursement-advances-to-suppliers-records";
export const AdvancesToSuppliersPaginationStorageKey = "cash-disbursement-advances-to-suppliers-table";
export const AdvancesToSuppliersTransactionPrefix = "ATS";
export const AdvancesToSuppliersColumnLabels = {
  transactionNo: "Advances to Suppliers No.",
  documentDate: "Document Date",
  partyCode: "Party Code",
  partyName: "Party Name",
  accountCode: "Default Account Code",
  accountTitle: "Default Account Title",
  amount: "Total Amount",
  remarks: "Remarks",
  createdBy: "Created By",
  createdAt: "Date Created",
  updatedBy: "Updated By",
  updatedAt: "Date Modified",
  status: "Status",
  actions: "Actions",
} as const;
export const AdvancesToSuppliersOverviewColumnWidths: Record<keyof typeof AdvancesToSuppliersColumnLabels, number> = {
  transactionNo: TransactionOverviewColumnWidths.transactionNumber,
  documentDate: TransactionOverviewColumnWidths.documentDate,
  partyCode: TransactionOverviewColumnWidths.partyCode,
  partyName: TransactionOverviewColumnWidths.partyName,
  accountCode: TransactionOverviewColumnWidths.accountCode,
  accountTitle: TransactionOverviewColumnWidths.accountTitle,
  amount: TransactionOverviewColumnWidths.amount,
  remarks: TransactionOverviewColumnWidths.remarks,
  createdBy: TransactionOverviewColumnWidths.auditUser,
  createdAt: TransactionOverviewColumnWidths.auditDate,
  updatedBy: TransactionOverviewColumnWidths.auditUser,
  updatedAt: TransactionOverviewColumnWidths.auditDate,
  status: TransactionOverviewColumnWidths.status,
  actions: CashDisbursementOverviewActionColumnWidth,
};
export const AdvancesToSuppliersDefaultVisibleColumnIds = [
  "transactionNo",
  "documentDate",
  "partyName",
  "amount",
  "status",
  "actions",
] as const;
export const AdvancesToSuppliersDefaultColumnVisibility = Object.fromEntries(
  Object.keys(AdvancesToSuppliersColumnLabels).map((columnId) => [
    columnId,
    AdvancesToSuppliersDefaultVisibleColumnIds.includes(columnId as (typeof AdvancesToSuppliersDefaultVisibleColumnIds)[number]),
  ]),
);
export const AdvancesToSuppliersStatuses = {
  cancelled: "Cancelled",
  disapproved: "Disapproved",
  draft: "Draft",
  forApproval: "For Approval",
  open: "Open",
  posted: "Posted",
} as const;
export const AdvancesToSuppliersRecordStatuses = [
  "Posted",
  "For Approval",
  "Draft",
  "Disapproved",
  "Cancelled",
] as const satisfies readonly AdvancesToSuppliersStatus[];
export const AdvancesToSuppliersStatusOptions = ["All", ...AdvancesToSuppliersRecordStatuses] as const;
export const AdvancesToSuppliersConfirmationDialogTitles: Record<AdvancesToSuppliersConfirmationAction, string> = {
  save: "Save Advances to Supplier?",
  draft: "Save as Draft?",
  approve: "Approve Advances to Supplier?",
  disapprove: "Disapprove Advances to Supplier?",
  cancel: "Cancel Advances to Supplier?",
};
export const AdvancesToSuppliersConfirmationDialogConfirmLabels: Record<AdvancesToSuppliersConfirmationAction, string> = {
  save: "Save and Submit",
  draft: "Save as Draft",
  approve: "Approve",
  disapprove: "Disapprove",
  cancel: "Cancel",
};
export const AdvancesToSuppliersActionTabs: {
  id: AdvancesToSuppliersActionTab;
  label: string;
}[] = [
  { id: "details", label: "Advances to Suppliers Details" },
  { id: "attachments", label: "File Attachments" },
];
export const AdvancesToSuppliersPartyOptions: AppAdvancedDropdownOption[] = [
  { label: "S000041", name: "Pacific Office Solutions, Inc.", value: "S000041" },
  { label: "S000058", name: "Metro Industrial Trading", value: "S000058" },
  { label: "S000073", name: "Northstar Equipment Supply", value: "S000073" },
];
export const AdvancesToSuppliersAccountOptions: AppAdvancedDropdownOption[] = [
  { label: "104-100", name: "Advances to Suppliers", value: "104-100" },
  { label: "104-110", name: "Supplier Deposits", value: "104-110" },
];
export const AdvancesToSuppliersProjectOptions: AppAdvancedDropdownOption[] = [
  { label: "PRJ-001", name: "Main Office Operations", value: "PRJ-001" },
  { label: "PRJ-002", name: "Branch Expansion", value: "PRJ-002" },
];
export const AdvancesToSuppliersResponsibilityCenterOptions: AppAdvancedDropdownOption[] = [
  { label: "RC-PUR", name: "Purchasing", value: "RC-PUR" },
  { label: "RC-OPS", name: "Operations", value: "RC-OPS" },
  { label: "RC-ADM", name: "Administration", value: "RC-ADM" },
];

export function canEditAdvancesToSuppliers(status: AdvancesToSuppliersStatus) {
  return ["Draft", "For Approval", "Disapproved"].includes(status);
}
