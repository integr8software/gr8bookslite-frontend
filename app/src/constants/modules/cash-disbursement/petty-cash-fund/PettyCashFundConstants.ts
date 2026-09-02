import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  PettyCashFundActionTab,
  PettyCashFundConfirmationAction,
  PettyCashFundAccountingColumnId,
  PettyCashFundEntryTab,
  PettyCashFundItemColumnId,
  PettyCashFundStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export const PettyCashFundLink = getModuleRoute("PCF");
export const PettyCashFundAddLink = `${PettyCashFundLink}/add`;
export const getPettyCashFundEditLink = (recordId: string) => `${PettyCashFundLink}/edit/${recordId}`;
export const getPettyCashFundViewLink = (recordId: string) => `${PettyCashFundLink}/view/${recordId}`;
export const PettyCashFundStorageKey = "cash-disbursement-petty-cash-fund-records";
export const PettyCashFundPaginationStorageKey = "cash-disbursement-petty-cash-fund-table";
export const PettyCashFundTransactionPrefix = "PCF";
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
  disburseAmount: "Disburse Amount",
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
  cancelled: "Cancelled",
  disapproved: "Disapproved",
  draft: "Draft",
  forApproval: "For Approval",
  open: "Open",
  posted: "Posted",
} as const;
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
  "Posted",
  "For Approval",
  "Draft",
  "Disapproved",
  "Cancelled",
] as const satisfies readonly PettyCashFundStatus[];
export const PettyCashFundStatusOptions = ["All", ...PettyCashFundRecordStatuses] as const;
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
export const PettyCashFundDefaultVisibleItemColumnIds: PettyCashFundItemColumnId[] = [
  "date",
  "supplierName",
  "amount",
  "disburseAmount",
];
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
  vatPercent: "VAT Rate",
  vatAmount: "VAT Amount",
  netAmount: "NET Amount",
  ewtCode: "EWT Code",
  ewtPercent: "EWT Rate",
  ewtAmount: "EWT Amount",
  disburseAmount: "Disburse Amount",
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
export const PettyCashFundEntryInputClassName =
  "h-10 w-full min-w-0 border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 read-only:bg-darknavy/[0.03] read-only:text-darknavy";
export const PettyCashFundPartyOptions: AppAdvancedDropdownOption[] = [
  { label: "E000102", name: "Raymark B. Arsicolo", value: "E000102" },
  { label: "E000117", name: "Maria L. Dela Cruz", value: "E000117" },
  { label: "E000145", name: "Jose P. Santos", value: "E000145" },
];
export const PettyCashFundSupplierOptions: AppAdvancedDropdownOption[] = [
  { label: "V100006", name: "All4U Restaurant", value: "V100006" },
  { label: "S000041", name: "Pacific Office Solutions, Inc.", value: "S000041" },
  { label: "S000058", name: "Metro Industrial Trading", value: "S000058" },
  { label: "S000073", name: "Northstar Equipment Supply", value: "S000073" },
];
export const PettyCashFundAccountOptions: AppAdvancedDropdownOption[] = [
  { label: "101-200", name: "Petty Cash Fund", value: "101-200" },
  { label: "101-210", name: "Cash on Hand", value: "101-210" },
];
export const PettyCashFundProjectOptions: AppAdvancedDropdownOption[] = [
  { label: "PRJ-001", name: "Main Office Operations", value: "PRJ-001" },
  { label: "PRJ-002", name: "Branch Expansion", value: "PRJ-002" },
];
export const PettyCashFundResponsibilityCenterLookupOptions: AppAdvancedDropdownOption[] = [
  { label: "RC-ADM", name: "Administration", value: "RC-ADM" },
  { label: "RC-OPS", name: "Operations", value: "RC-OPS" },
  { label: "RC-SAL", name: "Sales", value: "RC-SAL" },
];
export const PettyCashFundEntryTypeOptions: AppAdvancedDropdownOption[] = [
  { name: "Expense", value: "Expense" },
  { name: "Asset", value: "Asset" },
  { name: "Other", value: "Other" },
];
export const PettyCashFundEntryVatTypeOptions: AppAdvancedDropdownOption[] = [
  { label: "", name: "VAT (12%)", selectedDetails: "VAT (12%)", value: "VAT 12%" },
  { label: "", name: "Zero Rated (0%)", selectedDetails: "Zero Rated (0%)", value: "Zero Rated" },
  { label: "", name: "Exempt (0%)", selectedDetails: "Exempt (0%)", value: "Exempt" },
];
export const PettyCashFundEntryEwtCodeOptions: AppAdvancedDropdownOption[] = [
  { description: "Professional Fees - 10%", label: "", name: "W10 (10%)", selectedDetails: "W10 (10%)", value: "W10" },
  { description: "Professional Fees - 5%", label: "", name: "W05 (5%)", selectedDetails: "W05 (5%)", value: "W05" },
  { description: "Goods - 1%", label: "", name: "WV01 (1%)", selectedDetails: "WV01 (1%)", value: "WV01" },
  { description: "Services - 2%", label: "", name: "WV02 (2%)", selectedDetails: "WV02 (2%)", value: "WV02" },
];
export const PettyCashFundResponsibilityCenterOptions: AppAdvancedDropdownOption[] = [
  { label: "RC-ADM", name: "Administration", value: "RC-ADM" },
  { label: "RC-OPS", name: "Operations", value: "RC-OPS" },
  { label: "RC-SAL", name: "Sales", value: "RC-SAL" },
];

export function canEditPettyCashFund(status: PettyCashFundStatus) {
  return status === PettyCashFundStatuses.draft || status === PettyCashFundStatuses.disapproved;
}
export const PettyCashFundEntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
