import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  AdvancesToSuppliersActionMode,
  AdvancesToSuppliersActionTab,
  AdvancesToSuppliersConfirmationAction,
  AdvancesToSuppliersFormStatus,
  AdvancesToSuppliersPaymentType,
  AdvancesToSuppliersStatus,
} from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export const AdvancesToSuppliersLink = getModuleRoute("ATS");
export const AdvancesToSuppliersAddLink = `${AdvancesToSuppliersLink}/add`;
export const getAdvancesToSuppliersEditLink = (recordId: string) => `${AdvancesToSuppliersLink}/edit/${recordId}`;
export const getAdvancesToSuppliersViewLink = (recordId: string) => `${AdvancesToSuppliersLink}/view/${recordId}`;

export const AdvancesToSuppliersActionModes = {
  Add: "add",
  Edit: "edit",
  View: "view",
} as const satisfies Record<string, AdvancesToSuppliersActionMode>;
export const AdvancesToSuppliersStorageKey = "cash-disbursement-advances-to-suppliers-records";
export const AdvancesToSuppliersPaginationStorageKey = "cash-disbursement-advances-to-suppliers-table";

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
  Cancelled: "Cancelled",
  Disapproved: "Disapproved",
  Draft: "Draft",
  ForApproval: "For Approval",
  Open: "Open",
  Posted: "Posted",
} as const satisfies Record<string, AdvancesToSuppliersFormStatus>;

export const AdvancesToSuppliersRecordStatuses = [
  AdvancesToSuppliersStatuses.Draft,
  AdvancesToSuppliersStatuses.ForApproval,
  AdvancesToSuppliersStatuses.Posted,
  AdvancesToSuppliersStatuses.Disapproved,
  AdvancesToSuppliersStatuses.Cancelled,
] as const satisfies readonly AdvancesToSuppliersStatus[];

export const EditableAdvancesToSuppliersStatuses: readonly AdvancesToSuppliersStatus[] = [
  AdvancesToSuppliersStatuses.Draft,
  AdvancesToSuppliersStatuses.Disapproved,
];

export const AdvancesToSuppliersAllStatusFilter = "all";

export const AdvancesToSuppliersStatusFilterOptions = [
  { label: "All statuses", value: AdvancesToSuppliersAllStatusFilter },
  { label: "Draft", value: AdvancesToSuppliersStatuses.Draft },
  { label: "For Approval", value: AdvancesToSuppliersStatuses.ForApproval },
  { label: "Posted", value: AdvancesToSuppliersStatuses.Posted },
  { label: "Disapproved", value: AdvancesToSuppliersStatuses.Disapproved },
  { label: "Cancelled", value: AdvancesToSuppliersStatuses.Cancelled },
] as const;

export const AdvancesToSuppliersStatusFilters = [AdvancesToSuppliersAllStatusFilter, ...AdvancesToSuppliersRecordStatuses] as const;

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
  return EditableAdvancesToSuppliersStatuses.includes(status);
}
