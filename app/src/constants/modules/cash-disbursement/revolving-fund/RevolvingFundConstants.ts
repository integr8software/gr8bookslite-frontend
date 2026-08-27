import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  RevolvingFundActionTab,
  RevolvingFundConfirmationAction,
  RevolvingFundAccountingColumnId,
  RevolvingFundEntryTab,
  RevolvingFundItemColumnId,
  RevolvingFundStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export const RevolvingFundLink = getModuleRoute("RF");
export const RevolvingFundAddLink = `${RevolvingFundLink}/add`;
export const getRevolvingFundEditLink = (recordId: string) => `${RevolvingFundLink}/edit/${recordId}`;
export const getRevolvingFundViewLink = (recordId: string) => `${RevolvingFundLink}/view/${recordId}`;
export const RevolvingFundStorageKey = "cash-disbursement-revolving-fund-records";
export const RevolvingFundPaginationStorageKey = "cash-disbursement-revolving-fund-table";
export const RevolvingFundTransactionPrefix = "RF";
export const RevolvingFundCopyFromSources = ["Disbursement Voucher"] as const;
export const RevolvingFundColumnLabels = {
  transactionNo: "Fund No.",
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
export const RevolvingFundDefaultVisibleColumnIds = ["transactionNo", "documentDate", "partyName", "amount", "status", "actions"] as const;
export const RevolvingFundDefaultColumnVisibility = Object.fromEntries(
  Object.keys(RevolvingFundColumnLabels).map((columnId) => [
    columnId,
    RevolvingFundDefaultVisibleColumnIds.includes(columnId as (typeof RevolvingFundDefaultVisibleColumnIds)[number]),
  ]),
);
export const RevolvingFundStatuses = {
  cancelled: "Cancelled",
  disapproved: "Disapproved",
  draft: "Draft",
  forApproval: "For Approval",
  open: "Open",
  posted: "Posted",
} as const;
export const RevolvingFundConfirmationDialogTitles: Record<RevolvingFundConfirmationAction, string> = {
  save: "Save Revolving Fund?",
  draft: "Save Revolving Fund as Draft?",
  approve: "Approve Revolving Fund?",
  disapprove: "Disapprove Revolving Fund?",
  cancel: "Cancel Revolving Fund?",
};
export const RevolvingFundConfirmationDialogConfirmLabels: Record<RevolvingFundConfirmationAction, string> = {
  save: "Save and Submit",
  draft: "Save as Draft",
  approve: "Approve",
  disapprove: "Disapprove",
  cancel: "Cancel",
};
export const RevolvingFundRecordStatuses = [
  "Posted",
  "For Approval",
  "Draft",
  "Disapproved",
  "Cancelled",
] as const satisfies readonly RevolvingFundStatus[];
export const RevolvingFundStatusOptions = ["All", ...RevolvingFundRecordStatuses] as const;
export const RevolvingFundActionTabs: { id: RevolvingFundActionTab; label: string }[] = [
  { id: "details", label: "Fund Details" },
  { id: "attachments", label: "File Attachments" },
];
export const RevolvingFundEntryTabs: { id: RevolvingFundEntryTab; label: string }[] = [
  { id: "items", label: "Items" },
  { id: "accounting", label: "Accounting Entries" },
];
export const RevolvingFundAccountingEntryTab: RevolvingFundEntryTab = "accounting";
export const RevolvingFundDefaultItemColumnIds: RevolvingFundItemColumnId[] = [
  "date",
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
  "orNo",
];
export const RevolvingFundDefaultVisibleItemColumnIds: RevolvingFundItemColumnId[] = [
  "date",
  "supplierName",
  "amount",
  "vatType",
  "ewtCode",
];
export const RevolvingFundItemColumnLabels: Record<RevolvingFundItemColumnId, string> = {
  date: "Date",
  supplierCode: "Supplier Code",
  supplierName: "Supplier Name",
  orNo: "Reference No.",
  tinNo: "TIN No.",
  remarks: "Remarks",
  amount: "Gross Amount",
  type: "Type",
  vatType: "VAT Type",
  vatPercent: "VAT Rate",
  vatAmount: "VAT Amount",
  ewtCode: "EWT Code",
  ewtPercent: "EWT Rate",
  ewtAmount: "EWT Amount",
  netAmount: "NET Amount",
  grossAmount: "Gross Amount",
  responsibilityCenterCode: "Responsibility Center Code",
  responsibilityCenterName: "Responsibility Center",
};
export const RevolvingFundItemColumnWidths: Record<RevolvingFundItemColumnId, number> = {
  date: 140,
  supplierCode: 190,
  supplierName: 230,
  orNo: 190,
  tinNo: 150,
  remarks: 240,
  amount: 185,
  type: 140,
  vatType: 175,
  vatPercent: 160,
  vatAmount: 175,
  ewtCode: 175,
  ewtPercent: 160,
  ewtAmount: 175,
  netAmount: 180,
  grossAmount: 185,
  responsibilityCenterCode: 250,
  responsibilityCenterName: 240,
};
export const RevolvingFundProtectedItemColumnIds = new Set<RevolvingFundItemColumnId>(["supplierName", "amount"]);
export const RevolvingFundDefaultAccountingColumnIds: RevolvingFundAccountingColumnId[] = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "remarks",
];
export const RevolvingFundAccountingColumnLabels: Record<RevolvingFundAccountingColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  debit: "Debit",
  credit: "Credit",
  partyCode: "Supplier Code",
  partyName: "Supplier Name",
  remarks: "Remarks",
};
export const RevolvingFundAccountingColumnWidths: Record<RevolvingFundAccountingColumnId, number> = {
  accountCode: 175,
  accountTitle: 240,
  debit: 150,
  credit: 150,
  partyCode: 190,
  partyName: 230,
  remarks: 260,
};
export const RevolvingFundProtectedAccountingColumnIds = new Set<RevolvingFundAccountingColumnId>(["accountCode", "debit", "credit"]);
export const RevolvingFundEntryInputClassName =
  "h-10 w-full min-w-0 border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 read-only:bg-darknavy/[0.03] read-only:text-darknavy";
export const RevolvingFundPartyOptions: AppAdvancedDropdownOption[] = [
  { label: "E000102", name: "Raymark B. Arsicolo", value: "E000102" },
  { label: "E000117", name: "Maria L. Dela Cruz", value: "E000117" },
  { label: "E000145", name: "Jose P. Santos", value: "E000145" },
];
export const RevolvingFundSupplierOptions: AppAdvancedDropdownOption[] = [
  { label: "V100006", name: "All4U Restaurant", value: "V100006" },
  { label: "S000041", name: "Pacific Office Solutions, Inc.", value: "S000041" },
  { label: "S000058", name: "Metro Industrial Trading", value: "S000058" },
  { label: "S000073", name: "Northstar Equipment Supply", value: "S000073" },
];
export const RevolvingFundAccountOptions: AppAdvancedDropdownOption[] = [
  { label: "101-200", name: "Revolving Fund", value: "101-200" },
  { label: "101-210", name: "Cash on Hand", value: "101-210" },
];
export const RevolvingFundProjectOptions: AppAdvancedDropdownOption[] = [
  { label: "PRJ-001", name: "Main Office Operations", value: "PRJ-001" },
  { label: "PRJ-002", name: "Branch Expansion", value: "PRJ-002" },
];
export const RevolvingFundResponsibilityCenterLookupOptions: AppAdvancedDropdownOption[] = [
  { label: "RC-ADM", name: "Administration", value: "RC-ADM" },
  { label: "RC-OPS", name: "Operations", value: "RC-OPS" },
  { label: "RC-SAL", name: "Sales", value: "RC-SAL" },
];
export const RevolvingFundEntryTypeOptions: AppAdvancedDropdownOption[] = [
  { name: "Expense", value: "Expense" },
  { name: "Asset", value: "Asset" },
  { name: "Other", value: "Other" },
];
export const RevolvingFundEntryVatTypeOptions: AppAdvancedDropdownOption[] = [
  { label: "", name: "VAT (12%)", selectedDetails: "VAT (12%)", value: "VAT 12%" },
  { label: "", name: "Zero Rated (0%)", selectedDetails: "Zero Rated (0%)", value: "Zero Rated" },
  { label: "", name: "Exempt (0%)", selectedDetails: "Exempt (0%)", value: "Exempt" },
];
export const RevolvingFundEntryEwtCodeOptions: AppAdvancedDropdownOption[] = [
  { description: "Professional Fees - 10%", label: "", name: "W10 (10%)", selectedDetails: "W10 (10%)", value: "W10" },
  { description: "Professional Fees - 5%", label: "", name: "W05 (5%)", selectedDetails: "W05 (5%)", value: "W05" },
  { description: "Goods - 1%", label: "", name: "WV01 (1%)", selectedDetails: "WV01 (1%)", value: "WV01" },
  { description: "Services - 2%", label: "", name: "WV02 (2%)", selectedDetails: "WV02 (2%)", value: "WV02" },
];
export const RevolvingFundResponsibilityCenterOptions: AppAdvancedDropdownOption[] = [
  { label: "RC-ADM", name: "Administration", value: "RC-ADM" },
  { label: "RC-OPS", name: "Operations", value: "RC-OPS" },
  { label: "RC-SAL", name: "Sales", value: "RC-SAL" },
];

export function canEditRevolvingFund(status: RevolvingFundStatus) {
  return (
    status === RevolvingFundStatuses.draft || status === RevolvingFundStatuses.forApproval || status === RevolvingFundStatuses.disapproved
  );
}
export const RevolvingFundEntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
