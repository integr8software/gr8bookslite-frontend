import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  PettyCashReplenishmentActionTab,
  PettyCashReplenishmentConfirmationAction,
  PettyCashReplenishmentAccountingColumnId,
  PettyCashReplenishmentEntryColumnId,
  PettyCashReplenishmentEntryTab,
  PettyCashReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";

export const PettyCashReplenishmentLink = getModuleRoute("PCR");
export const PettyCashReplenishmentAddLink = `${PettyCashReplenishmentLink}/add`;
export const getPettyCashReplenishmentEditLink = (recordId: string) => `${PettyCashReplenishmentLink}/edit/${recordId}`;
export const getPettyCashReplenishmentViewLink = (recordId: string) => `${PettyCashReplenishmentLink}/view/${recordId}`;
export const PettyCashReplenishmentStorageKey = "cash-disbursement-petty-cash-replenishment-records";
export const PettyCashReplenishmentPaginationStorageKey = "cash-disbursement-petty-cash-replenishment-table";
export const PettyCashReplenishmentTransactionPrefix = "PCR";
export const PettyCashReplenishmentConfirmationDialogTitles: Record<PettyCashReplenishmentConfirmationAction, string> = {
  save: "Save Petty Cash Replenishment?",
  draft: "Save Petty Cash Replenishment as Draft?",
  approve: "Approve Petty Cash Replenishment?",
  disapprove: "Disapprove Petty Cash Replenishment?",
  cancel: "Cancel Petty Cash Replenishment?",
};
export const PettyCashReplenishmentConfirmationDialogConfirmLabels: Record<PettyCashReplenishmentConfirmationAction, string> = {
  save: "Save and Submit",
  draft: "Save as Draft",
  approve: "Approve",
  disapprove: "Disapprove",
  cancel: "Cancel",
};
export const PettyCashReplenishmentColumnLabels = {
  transactionNo: "Replenishment No.",
  documentDate: "Document Date",
  partyCode: "Party Code",
  partyName: "Party Name",
  accountCode: "Default Account Code",
  accountTitle: "Default Account Title",
  currency: "Currency",
  exchangeRate: "Exchange Rate",
  amount: "Total Amount",
  disburseAmount: "Disburse Amount",
  remarks: "Remarks",
  createdBy: "Created By",
  createdAt: "Date Created",
  updatedBy: "Updated By",
  updatedAt: "Date Modified",
  status: "Status",
  actions: "Actions",
} as const;
export const PettyCashReplenishmentOverviewColumnWidths: Record<keyof typeof PettyCashReplenishmentColumnLabels, number> = {
  transactionNo: TransactionOverviewColumnWidths.transactionNumber,
  documentDate: TransactionOverviewColumnWidths.documentDate,
  partyCode: TransactionOverviewColumnWidths.partyCode,
  partyName: TransactionOverviewColumnWidths.partyName,
  accountCode: TransactionOverviewColumnWidths.accountCode,
  accountTitle: TransactionOverviewColumnWidths.accountTitle,
  currency: TransactionOverviewColumnWidths.currency,
  exchangeRate: TransactionOverviewColumnWidths.exchangeRate,
  amount: TransactionOverviewColumnWidths.amount,
  disburseAmount: TransactionOverviewColumnWidths.amount,
  remarks: TransactionOverviewColumnWidths.remarks,
  createdBy: TransactionOverviewColumnWidths.auditUser,
  createdAt: TransactionOverviewColumnWidths.auditDate,
  updatedBy: TransactionOverviewColumnWidths.auditUser,
  updatedAt: TransactionOverviewColumnWidths.auditDate,
  status: TransactionOverviewColumnWidths.status,
  actions: TransactionOverviewColumnWidths.actions,
};
export const PettyCashReplenishmentDefaultVisibleColumnIds = [
  "transactionNo",
  "documentDate",
  "partyName",
  "amount",
  "disburseAmount",
  "status",
  "actions",
] as const;
export const PettyCashReplenishmentDefaultColumnVisibility = Object.fromEntries(
  Object.keys(PettyCashReplenishmentColumnLabels).map((columnId) => [
    columnId,
    PettyCashReplenishmentDefaultVisibleColumnIds.includes(
      columnId as (typeof PettyCashReplenishmentDefaultVisibleColumnIds)[number],
    ),
  ]),
);
export const PettyCashReplenishmentStatuses = {
  cancelled: "Cancelled",
  disapproved: "Disapproved",
  draft: "Draft",
  forApproval: "For Approval",
  open: "Open",
  posted: "Posted",
} as const;
export const PettyCashReplenishmentRecordStatuses = [
  "Posted",
  "For Approval",
  "Draft",
  "Disapproved",
  "Cancelled",
] as const satisfies readonly PettyCashReplenishmentStatus[];
export const PettyCashReplenishmentStatusOptions = ["All", ...PettyCashReplenishmentRecordStatuses] as const;
export const PettyCashReplenishmentActionTabs: {
  id: PettyCashReplenishmentActionTab;
  label: string;
}[] = [
  { id: "details", label: "Replenishment Details" },
  { id: "attachments", label: "File Attachments" },
];
export const PettyCashReplenishmentEntryTabs: { id: PettyCashReplenishmentEntryTab; label: string }[] = [
  { id: "vouchers", label: "Petty Cash Voucher Entries" },
  { id: "accounting", label: "Accounting Entries" },
];
export const PettyCashReplenishmentEntryInputClassName =
  "h-10 w-full min-w-0 border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 read-only:bg-darknavy/[0.03] read-only:text-darknavy";
export const PettyCashReplenishmentEntryColumnOrder: PettyCashReplenishmentEntryColumnId[] = [
  "pettyCashDate",
  "pettyCashNo",
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
];
export const PettyCashReplenishmentDefaultVisibleEntryColumnIds: PettyCashReplenishmentEntryColumnId[] = [
  "pettyCashDate",
  "pettyCashNo",
  "supplierName",
  "amount",
  "disburseAmount",
];
export const PettyCashReplenishmentEntryColumnLabels: Record<PettyCashReplenishmentEntryColumnId, string> = {
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
  disburseAmount: "Disburse Amount",
  responsibilityCenterCode: "Responsibility Center Code",
  responsibilityCenterName: "Responsibility Center",
  particulars: "Particulars",
};
export const PettyCashReplenishmentEntryColumnWidths: Record<PettyCashReplenishmentEntryColumnId, number> = {
  pettyCashDate: 200,
  pettyCashNo: 200,
  supplierCode: 190,
  supplierName: 230,
  amount: 185,
  netAmount: 180,
  vatType: 175,
  vatPercent: 160,
  vatAmount: 175,
  ewtCode: 175,
  ewtPercent: 160,
  ewtAmount: 175,
  disburseAmount: 165,
  responsibilityCenterCode: 250,
  responsibilityCenterName: 240,
  particulars: 240,
};
export const PettyCashReplenishmentProtectedEntryColumnIds = new Set<PettyCashReplenishmentEntryColumnId>([
  "supplierName",
  "amount",
]);
export const PettyCashReplenishmentAccountingColumnOrder: PettyCashReplenishmentAccountingColumnId[] = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "particulars",
];
export const PettyCashReplenishmentAccountingColumnLabels: Record<PettyCashReplenishmentAccountingColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  debit: "Debit",
  credit: "Credit",
  partyCode: "Supplier Code",
  partyName: "Supplier Name",
  particulars: "Particulars",
};
export const PettyCashReplenishmentAccountingColumnWidths: Record<PettyCashReplenishmentAccountingColumnId, number> = {
  accountCode: 175,
  accountTitle: 240,
  debit: 150,
  credit: 150,
  partyCode: 190,
  partyName: 230,
  particulars: 260,
};
export const PettyCashReplenishmentProtectedAccountingColumnIds = new Set<PettyCashReplenishmentAccountingColumnId>([
  "accountCode",
  "debit",
  "credit",
]);
export const PettyCashReplenishmentPartyOptions: AppAdvancedDropdownOption[] = [
  { label: "E000102", name: "Raymark B. Arsicolo", value: "E000102" },
  { label: "E000117", name: "Maria L. Dela Cruz", value: "E000117" },
  { label: "E000145", name: "Jose P. Santos", value: "E000145" },
];
export const PettyCashReplenishmentSupplierOptions: AppAdvancedDropdownOption[] = [
  { label: "V100006", name: "All4U Restaurant", value: "V100006" },
  { label: "S000041", name: "Pacific Office Solutions, Inc.", value: "S000041" },
  { label: "S000058", name: "Metro Industrial Trading", value: "S000058" },
  { label: "S000073", name: "Northstar Equipment Supply", value: "S000073" },
];
export const PettyCashReplenishmentAccountOptions: AppAdvancedDropdownOption[] = [
  { label: "101-200", name: "Petty Cash Fund", value: "101-200" },
  { label: "101-210", name: "Cash on Hand", value: "101-210" },
];
export const PettyCashReplenishmentProjectOptions: AppAdvancedDropdownOption[] = [
  { label: "PRJ-001", name: "Main Office Operations", value: "PRJ-001" },
  { label: "PRJ-002", name: "Branch Expansion", value: "PRJ-002" },
];
export const PettyCashReplenishmentResponsibilityCenterOptions: AppAdvancedDropdownOption[] = [
  { label: "RC-ADM", name: "Administration", value: "RC-ADM" },
  { label: "RC-OPS", name: "Operations", value: "RC-OPS" },
  { label: "RC-SAL", name: "Sales", value: "RC-SAL" },
];
export const PettyCashReplenishmentEntryVatTypeOptions: AppAdvancedDropdownOption[] = [
  { label: "", name: "VAT (12%)", selectedDetails: "VAT (12%)", value: "VAT 12%" },
  { label: "", name: "Zero Rated (0%)", selectedDetails: "Zero Rated (0%)", value: "Zero Rated" },
  { label: "", name: "Exempt (0%)", selectedDetails: "Exempt (0%)", value: "Exempt" },
];
export const PettyCashReplenishmentEntryEwtCodeOptions: AppAdvancedDropdownOption[] = [
  { description: "Professional Fees - 10%", label: "", name: "W10 (10%)", selectedDetails: "W10 (10%)", value: "W10" },
  { description: "Professional Fees - 5%", label: "", name: "W05 (5%)", selectedDetails: "W05 (5%)", value: "W05" },
  { description: "Goods - 1%", label: "", name: "WV01 (1%)", selectedDetails: "WV01 (1%)", value: "WV01" },
  { description: "Services - 2%", label: "", name: "WV02 (2%)", selectedDetails: "WV02 (2%)", value: "WV02" },
];

export function canEditPettyCashReplenishment(status: PettyCashReplenishmentStatus) {
  return (
    status === PettyCashReplenishmentStatuses.draft ||
    status === PettyCashReplenishmentStatuses.forApproval ||
    status === PettyCashReplenishmentStatuses.disapproved
  );
}
