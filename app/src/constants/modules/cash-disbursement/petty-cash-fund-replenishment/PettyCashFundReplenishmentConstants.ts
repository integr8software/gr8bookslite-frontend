import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  PettyCashFundReplenishmentActionTab,
  PettyCashFundReplenishmentConfirmationAction,
  PettyCashFundReplenishmentAccountingColumnId,
  PettyCashFundReplenishmentEntryColumnId,
  PettyCashFundReplenishmentEntryTab,
  PettyCashFundReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import { CashDisbursementOverviewActionColumnWidth } from "@/app/src/constants/modules/cash-disbursement/CashDisbursementConstants";

export const PettyCashFundReplenishmentLink = getModuleRoute("PCFR");
export const PettyCashFundReplenishmentAddLink = `${PettyCashFundReplenishmentLink}/add`;
export const getPettyCashFundReplenishmentEditLink = (recordId: string) => `${PettyCashFundReplenishmentLink}/edit/${recordId}`;
export const getPettyCashFundReplenishmentViewLink = (recordId: string) => `${PettyCashFundReplenishmentLink}/view/${recordId}`;
export const PettyCashFundReplenishmentStorageKey = "cash-disbursement-petty-cash-fund-replenishment-records";
export const PettyCashFundReplenishmentPaginationStorageKey = "cash-disbursement-petty-cash-fund-replenishment-table";
export const PettyCashFundReplenishmentTransactionPrefix = "PCFR";
export const PettyCashFundReplenishmentConfirmationDialogTitles: Record<PettyCashFundReplenishmentConfirmationAction, string> = {
  save: "Save Petty Cash Fund Replenishment?",
  draft: "Save as Draft?",
  approve: "Approve Petty Cash Fund Replenishment?",
  disapprove: "Disapprove Petty Cash Fund Replenishment?",
  cancel: "Cancel Petty Cash Fund Replenishment?",
};
export const PettyCashFundReplenishmentConfirmationDialogConfirmLabels: Record<PettyCashFundReplenishmentConfirmationAction, string> = {
  save: "Save and Submit",
  draft: "Save as Draft",
  approve: "Approve",
  disapprove: "Disapprove",
  cancel: "Cancel",
};
export const PettyCashFundReplenishmentColumnLabels = {
  transactionNo: "Petty Cash Fund Replenishment No.",
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
export const PettyCashFundReplenishmentOverviewColumnWidths: Record<keyof typeof PettyCashFundReplenishmentColumnLabels, number> = {
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
export const PettyCashFundReplenishmentDefaultVisibleColumnIds = [
  "transactionNo",
  "documentDate",
  "partyName",
  "amount",
  "status",
  "actions",
] as const;
export const PettyCashFundReplenishmentDefaultColumnVisibility = Object.fromEntries(
  Object.keys(PettyCashFundReplenishmentColumnLabels).map((columnId) => [
    columnId,
    PettyCashFundReplenishmentDefaultVisibleColumnIds.includes(
      columnId as (typeof PettyCashFundReplenishmentDefaultVisibleColumnIds)[number],
    ),
  ]),
);
export const PettyCashFundReplenishmentStatuses = {
  cancelled: "Cancelled",
  disapproved: "Disapproved",
  draft: "Draft",
  forApproval: "For Approval",
  open: "Open",
  posted: "Posted",
} as const;
export const PettyCashFundReplenishmentRecordStatuses = [
  "Draft",
  "For Approval",
  "Posted",
  "Disapproved",
  "Cancelled",
] as const satisfies readonly PettyCashFundReplenishmentStatus[];
export const PettyCashFundReplenishmentStatusOptions = ["All", ...PettyCashFundReplenishmentRecordStatuses] as const;
export const PettyCashFundReplenishmentActionTabs: {
  id: PettyCashFundReplenishmentActionTab;
  label: string;
}[] = [
  { id: "details", label: "Petty Cash Fund Replenishment Details" },
  { id: "attachments", label: "File Attachments" },
];
export const PettyCashFundReplenishmentEntryTabs: { id: PettyCashFundReplenishmentEntryTab; label: string }[] = [
  { id: "vouchers", label: "Petty Cash Voucher Entries" },
  { id: "accounting", label: "Accounting Entries" },
];
export const PettyCashFundReplenishmentEntryInputClassName =
  "h-10 w-full min-w-0 border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 read-only:bg-darknavy/[0.03] read-only:text-darknavy";
export const PettyCashFundReplenishmentEntryColumnOrder: PettyCashFundReplenishmentEntryColumnId[] = [
  "pettyCashDate",
  "pettyCashNo",
  "accountCode",
  "accountTitle",
  "totalAmount",
  "netAmount",
  "vatAmount",
  "remarks",
];
export const PettyCashFundReplenishmentEntryColumnLabels: Record<PettyCashFundReplenishmentEntryColumnId, string> = {
  pettyCashDate: "Petty Cash Date",
  pettyCashNo: "Petty Cash No.",
  accountCode: "Account Code",
  accountTitle: "Account Title",
  totalAmount: "Total Amount",
  netAmount: "Net Amount",
  vatAmount: "VAT Amount",
  remarks: "Remarks",
};
export const PettyCashFundReplenishmentEntryColumnWidths: Record<PettyCashFundReplenishmentEntryColumnId, number> = {
  pettyCashDate: 150,
  pettyCashNo: 180,
  accountCode: 160,
  accountTitle: 260,
  totalAmount: 160,
  netAmount: 160,
  vatAmount: 160,
  remarks: 320,
};
export const PettyCashFundReplenishmentProtectedEntryColumnIds = new Set<PettyCashFundReplenishmentEntryColumnId>([
  "pettyCashDate",
  "pettyCashNo",
]);
export const PettyCashFundReplenishmentAccountingColumnOrder: PettyCashFundReplenishmentAccountingColumnId[] = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "particulars",
];
export const PettyCashFundReplenishmentAccountingColumnLabels: Record<PettyCashFundReplenishmentAccountingColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  debit: "Debit",
  credit: "Credit",
  partyCode: "Party Code",
  partyName: "Party Name",
  particulars: "Particulars",
};
export const PettyCashFundReplenishmentAccountingColumnWidths: Record<PettyCashFundReplenishmentAccountingColumnId, number> = {
  accountCode: 160,
  accountTitle: 260,
  debit: 160,
  credit: 160,
  partyCode: 160,
  partyName: 240,
  particulars: 320,
};
export const PettyCashFundReplenishmentProtectedAccountingColumnIds = new Set<PettyCashFundReplenishmentAccountingColumnId>([
  "accountCode",
  "debit",
  "credit",
]);
export const PettyCashFundReplenishmentPartyOptions: AppAdvancedDropdownOption[] = [
  { label: "E000102", name: "Raymark B. Arsicolo", value: "E000102" },
  { label: "E000117", name: "Maria L. Dela Cruz", value: "E000117" },
  { label: "E000145", name: "Jose P. Santos", value: "E000145" },
];
export const PettyCashFundReplenishmentAccountOptions: AppAdvancedDropdownOption[] = [
  { label: "101-200", name: "Petty Cash Fund", value: "101-200" },
  { label: "101-210", name: "Cash on Hand", value: "101-210" },
];
export const PettyCashFundReplenishmentProjectOptions: AppAdvancedDropdownOption[] = [
  { label: "PRJ-001", name: "Main Office Operations", value: "PRJ-001" },
  { label: "PRJ-002", name: "Branch Expansion", value: "PRJ-002" },
];
export const PettyCashFundReplenishmentResponsibilityCenterOptions: AppAdvancedDropdownOption[] = [
  { label: "RC-ADM", name: "Administration", value: "RC-ADM" },
  { label: "RC-OPS", name: "Operations", value: "RC-OPS" },
  { label: "RC-SAL", name: "Sales", value: "RC-SAL" },
];

export function canEditPettyCashFundReplenishment(status: PettyCashFundReplenishmentStatus) {
  return ["Draft", "For Approval", "Disapproved"].includes(status);
}
