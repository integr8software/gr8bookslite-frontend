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

export const PettyCashFundReplenishmentLink = getModuleRoute("PCFR");
export const PettyCashFundReplenishmentAddLink = `${PettyCashFundReplenishmentLink}/add`;
export const getPettyCashFundReplenishmentEditLink = (recordId: string) => `${PettyCashFundReplenishmentLink}/edit/${recordId}`;
export const getPettyCashFundReplenishmentViewLink = (recordId: string) => `${PettyCashFundReplenishmentLink}/view/${recordId}`;
export const PettyCashFundReplenishmentStorageKey = "cash-disbursement-petty-cash-fund-replenishment-records";
export const PettyCashFundReplenishmentPaginationStorageKey = "cash-disbursement-petty-cash-fund-replenishment-table";
export const PettyCashFundReplenishmentTransactionPrefix = "PCFR";
export const PettyCashFundReplenishmentConfirmationDialogTitles: Record<PettyCashFundReplenishmentConfirmationAction, string> = {
  save: "Save Petty Cash Fund Replenishment?",
  draft: "Save Petty Cash Fund Replenishment as Draft?",
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
  transactionNo: "Fund Replenishment No.",
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
  actions: TransactionOverviewColumnWidths.actions,
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
  "Posted",
  "For Approval",
  "Draft",
  "Disapproved",
  "Cancelled",
] as const satisfies readonly PettyCashFundReplenishmentStatus[];
export const PettyCashFundReplenishmentStatusOptions = ["All", ...PettyCashFundReplenishmentRecordStatuses] as const;
export const PettyCashFundReplenishmentActionTabs: {
  id: PettyCashFundReplenishmentActionTab;
  label: string;
}[] = [
  { id: "details", label: "Replenishment Details" },
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
  "supplierCode",
  "supplierName",
  "amount",
  "vatType",
  "vatPercent",
  "vatAmount",
  "ewtCode",
  "ewtPercent",
  "ewtAmount",
  "netAmount",
  "responsibilityCenterCode",
  "responsibilityCenterName",
  "remarks",
];
export const PettyCashFundReplenishmentDefaultVisibleEntryColumnIds: PettyCashFundReplenishmentEntryColumnId[] = [
  "pettyCashDate",
  "pettyCashNo",
  "supplierName",
  "amount",
  "vatType",
  "ewtCode",
];
export const PettyCashFundReplenishmentEntryColumnLabels: Record<PettyCashFundReplenishmentEntryColumnId, string> = {
  pettyCashDate: "Petty Cash Date",
  pettyCashNo: "Petty Cash No.",
  supplierCode: "Supplier Code",
  supplierName: "Supplier Name",
  amount: "Gross Amount",
  netAmount: "NET Amount",
  vatType: "VAT Type",
  vatPercent: "VAT Rate",
  vatAmount: "VAT Amount",
  ewtCode: "EWT Code",
  ewtPercent: "EWT Rate",
  ewtAmount: "EWT Amount",
  responsibilityCenterCode: "Responsibility Center Code",
  responsibilityCenterName: "Responsibility Center",
  remarks: "Remarks",
};
export const PettyCashFundReplenishmentEntryColumnWidths: Record<PettyCashFundReplenishmentEntryColumnId, number> = {
  pettyCashDate: 160,
  pettyCashNo: 160,
  supplierCode: 150,
  supplierName: 200,
  amount: 150,
  netAmount: 140,
  vatType: 140,
  vatPercent: 125,
  vatAmount: 140,
  ewtCode: 140,
  ewtPercent: 125,
  ewtAmount: 140,
  responsibilityCenterCode: 230,
  responsibilityCenterName: 200,
  remarks: 220,
};
export const PettyCashFundReplenishmentProtectedEntryColumnIds = new Set<PettyCashFundReplenishmentEntryColumnId>([
  "supplierName",
  "amount",
]);
export const PettyCashFundReplenishmentAccountingColumnOrder: PettyCashFundReplenishmentAccountingColumnId[] = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "remarks",
];
export const PettyCashFundReplenishmentAccountingColumnLabels: Record<PettyCashFundReplenishmentAccountingColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  debit: "Debit",
  credit: "Credit",
  partyCode: "Supplier Code",
  partyName: "Supplier Name",
  remarks: "Remarks",
};
export const PettyCashFundReplenishmentAccountingColumnWidths: Record<PettyCashFundReplenishmentAccountingColumnId, number> = {
  accountCode: 140,
  accountTitle: 220,
  debit: 140,
  credit: 140,
  partyCode: 140,
  partyName: 200,
  remarks: 260,
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
export const PettyCashFundReplenishmentSupplierOptions: AppAdvancedDropdownOption[] = [
  { label: "V100006", name: "All4U Restaurant", value: "V100006" },
  { label: "S000041", name: "Pacific Office Solutions, Inc.", value: "S000041" },
  { label: "S000058", name: "Metro Industrial Trading", value: "S000058" },
  { label: "S000073", name: "Northstar Equipment Supply", value: "S000073" },
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
export const PettyCashFundReplenishmentEntryVatTypeOptions: AppAdvancedDropdownOption[] = [
  { label: "", name: "VAT (12%)", selectedDetails: "VAT (12%)", value: "VAT 12%" },
  { label: "", name: "Zero Rated (0%)", selectedDetails: "Zero Rated (0%)", value: "Zero Rated" },
  { label: "", name: "Exempt (0%)", selectedDetails: "Exempt (0%)", value: "Exempt" },
];
export const PettyCashFundReplenishmentEntryEwtCodeOptions: AppAdvancedDropdownOption[] = [
  { description: "Professional Fees - 10%", label: "", name: "W10 (10%)", selectedDetails: "W10 (10%)", value: "W10" },
  { description: "Professional Fees - 5%", label: "", name: "W05 (5%)", selectedDetails: "W05 (5%)", value: "W05" },
  { description: "Goods - 1%", label: "", name: "WV01 (1%)", selectedDetails: "WV01 (1%)", value: "WV01" },
  { description: "Services - 2%", label: "", name: "WV02 (2%)", selectedDetails: "WV02 (2%)", value: "WV02" },
];

export function canEditPettyCashFundReplenishment(status: PettyCashFundReplenishmentStatus) {
  return (
    status === PettyCashFundReplenishmentStatuses.draft ||
    status === PettyCashFundReplenishmentStatuses.forApproval ||
    status === PettyCashFundReplenishmentStatuses.disapproved
  );
}
