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
  draft: "Save as Draft?",
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
  transactionNo: "RFR No.",
  documentDate: "RFR Date",
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
export const RevolvingFundReplenishmentOverviewColumnWidths: Record<keyof typeof RevolvingFundReplenishmentColumnLabels, number> = {
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
  { id: "details", label: "Revolving Fund Replenishment Details" },
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
  "accountCode",
  "accountTitle",
  "totalAmount",
  "netAmount",
  "vatAmount",
  "remarks",
];
export const RevolvingFundReplenishmentEntryColumnLabels: Record<RevolvingFundReplenishmentEntryColumnId, string> = {
  revolvingFundDate: "RF Date",
  revolvingFundNo: "RF No.",
  accountCode: "Account Code",
  accountTitle: "Account Title",
  totalAmount: "Total Amount",
  netAmount: "Net Amount",
  vatAmount: "VAT Amount",
  remarks: "Remarks",
};
export const RevolvingFundReplenishmentEntryColumnWidths: Record<RevolvingFundReplenishmentEntryColumnId, number> = {
  revolvingFundDate: 135,
  revolvingFundNo: 155,
  accountCode: 140,
  accountTitle: 220,
  totalAmount: 140,
  netAmount: 140,
  vatAmount: 140,
  remarks: 260,
};
export const RevolvingFundReplenishmentProtectedEntryColumnIds = new Set<RevolvingFundReplenishmentEntryColumnId>([
  "revolvingFundDate",
  "revolvingFundNo",
]);
export const RevolvingFundReplenishmentAccountingColumnOrder: RevolvingFundReplenishmentAccountingColumnId[] = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "remarks",
];
export const RevolvingFundReplenishmentAccountingColumnLabels: Record<RevolvingFundReplenishmentAccountingColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  debit: "Debit",
  credit: "Credit",
  partyCode: "Party Code",
  partyName: "Party Name",
  remarks: "Remarks",
};
export const RevolvingFundReplenishmentAccountingColumnWidths: Record<RevolvingFundReplenishmentAccountingColumnId, number> = {
  accountCode: 140,
  accountTitle: 220,
  debit: 140,
  credit: 140,
  partyCode: 140,
  partyName: 200,
  remarks: 260,
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
export const RevolvingFundReplenishmentAccountOptions: AppAdvancedDropdownOption[] = [
  { label: "101-200", name: "Revolving Fund Fund", value: "101-200" },
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

export function canEditRevolvingFundReplenishment(status: RevolvingFundReplenishmentStatus) {
  return ["Draft", "For Approval", "Disapproved"].includes(status);
}
