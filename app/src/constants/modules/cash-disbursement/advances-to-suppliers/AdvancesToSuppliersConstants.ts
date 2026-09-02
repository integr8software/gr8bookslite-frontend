import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  AdvancesToSuppliersActionTab,
  AdvancesToSuppliersConfirmationAction,
  AdvancesToSuppliersPaymentType,
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
  transactionNo: "Advances To Suppliers No.",
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
export const AdvancesToSuppliersOverviewColumnWidths: Record<keyof typeof AdvancesToSuppliersColumnLabels, number> = {
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
export const AdvancesToSuppliersPaymentTypeOptions = [
  "Percentage",
  "Fixed Amount",
] as const satisfies readonly AdvancesToSuppliersPaymentType[];
export const AdvancesToSuppliersPaymentTypeDropdownOptions: AppAdvancedDropdownOption[] = [
  { label: "Percentage", name: "Percentage", value: "Percentage" },
  { label: "Fixed Amount", name: "Fixed Amount", value: "Fixed Amount" },
];
export const AdvancesToSuppliersConfirmationDialogTitles: Record<AdvancesToSuppliersConfirmationAction, string> = {
  save: "Save Advances to Suppliers?",
  draft: "Save Advances to Suppliers as Draft?",
  approve: "Approve Advances to Suppliers?",
  disapprove: "Disapprove Advances to Suppliers?",
  cancel: "Cancel Advances to Suppliers?",
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
export function canEditAdvancesToSuppliers(status: AdvancesToSuppliersStatus) {
  return (
    status === AdvancesToSuppliersStatuses.draft ||
    status === AdvancesToSuppliersStatuses.disapproved
  );
}
