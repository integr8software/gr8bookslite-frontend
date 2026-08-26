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
  { id: "details", label: "Revolving Fund Details" },
  { id: "attachments", label: "File Attachments" },
];
export const RevolvingFundEntryTabs: { id: RevolvingFundEntryTab; label: string }[] = [
  { id: "items", label: "Items" },
  { id: "accounting", label: "Accounting Entries" },
];
export const RevolvingFundAccountingEntryTab: RevolvingFundEntryTab = "accounting";
export const RevolvingFundDefaultItemColumnIds: RevolvingFundItemColumnId[] = [
  "date",
  "payeeCode",
  "payeeName",
  "orNo",
  "tinNo",
  "remarks",
  "amount",
  "netAmount",
  "vatAmount",
  "type",
  "vatType",
  "vatable",
  "vatInclusive",
  "grossAmount",
  "responsibilityCenter",
];
export const RevolvingFundItemColumnLabels: Record<RevolvingFundItemColumnId, string> = {
  date: "Date",
  payeeCode: "Payee Code",
  payeeName: "Payee",
  orNo: "OR No.",
  tinNo: "TIN No.",
  remarks: "Remarks",
  amount: "Amount",
  netAmount: "Net Amount",
  vatAmount: "VAT Amount",
  type: "Type",
  vatType: "VAT Type",
  vatable: "VATable",
  vatInclusive: "VATInc",
  grossAmount: "Gross Amount",
  responsibilityCenter: "Responsibility Center",
};
export const RevolvingFundItemColumnWidths: Record<RevolvingFundItemColumnId, number> = {
  date: 130,
  payeeCode: 125,
  payeeName: 190,
  orNo: 120,
  tinNo: 140,
  remarks: 220,
  amount: 125,
  netAmount: 125,
  vatAmount: 125,
  type: 130,
  vatType: 130,
  vatable: 110,
  vatInclusive: 110,
  grossAmount: 130,
  responsibilityCenter: 180,
};
export const RevolvingFundProtectedItemColumnIds = new Set<RevolvingFundItemColumnId>(["date", "amount"]);
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
  partyCode: "Party Code",
  partyName: "Party Name",
  remarks: "Remarks",
};
export const RevolvingFundAccountingColumnWidths: Record<RevolvingFundAccountingColumnId, number> = {
  accountCode: 135,
  accountTitle: 210,
  debit: 125,
  credit: 125,
  partyCode: 130,
  partyName: 190,
  remarks: 220,
};
export const RevolvingFundProtectedAccountingColumnIds = new Set<RevolvingFundAccountingColumnId>(["accountCode", "debit", "credit"]);
export const RevolvingFundEntryInputClassName =
  "h-10 w-full min-w-0 border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 read-only:bg-darknavy/[0.03] read-only:text-darknavy";
export const RevolvingFundPartyOptions: AppAdvancedDropdownOption[] = [
  { label: "E000102", name: "Raymark B. Arsicolo", value: "E000102" },
  { label: "E000117", name: "Maria L. Dela Cruz", value: "E000117" },
  { label: "E000145", name: "Jose P. Santos", value: "E000145" },
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
  { name: "VAT 12%", value: "VAT 12%" },
  { name: "Zero Rated", value: "Zero Rated" },
  { name: "Exempt", value: "Exempt" },
];
export const RevolvingFundResponsibilityCenterOptions: AppAdvancedDropdownOption[] = [
  { label: "RC-ADM", name: "Administration", value: "Administration" },
  { label: "RC-OPS", name: "Operations", value: "Operations" },
  { label: "RC-SAL", name: "Sales", value: "Sales" },
];

export function canEditRevolvingFund(status: RevolvingFundStatus) {
  return (
    status === RevolvingFundStatuses.draft || status === RevolvingFundStatuses.forApproval || status === RevolvingFundStatuses.disapproved
  );
}
export const RevolvingFundEntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
