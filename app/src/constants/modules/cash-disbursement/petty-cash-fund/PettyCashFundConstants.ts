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
  amount: "Total Amount",
  remarks: "Remarks",
  createdBy: "Created By",
  createdAt: "Date Created",
  updatedBy: "Updated By",
  updatedAt: "Date Modified",
  status: "Status",
  actions: "Actions",
} as const;
export const PettyCashFundDefaultVisibleColumnIds = ["transactionNo", "documentDate", "partyName", "amount", "status", "actions"] as const;
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
  { id: "details", label: "Petty Cash Fund Details" },
  { id: "attachments", label: "File Attachments" },
];
export const PettyCashFundEntryTabs: { id: PettyCashFundEntryTab; label: string }[] = [
  { id: "items", label: "Items" },
  { id: "accounting", label: "Accounting Entries" },
];
export const PettyCashFundAccountingEntryTab: PettyCashFundEntryTab = "accounting";
export const PettyCashFundDefaultItemColumnIds: PettyCashFundItemColumnId[] = [
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
export const PettyCashFundItemColumnLabels: Record<PettyCashFundItemColumnId, string> = {
  date: "Date",
  payeeCode: "Payee Code",
  payeeName: "Supplier Name",
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
export const PettyCashFundItemColumnWidths: Record<PettyCashFundItemColumnId, number> = {
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
export const PettyCashFundProtectedItemColumnIds = new Set<PettyCashFundItemColumnId>(["date", "amount"]);
export const PettyCashFundDefaultAccountingColumnIds: PettyCashFundAccountingColumnId[] = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "remarks",
];
export const PettyCashFundAccountingColumnLabels: Record<PettyCashFundAccountingColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  debit: "Debit",
  credit: "Credit",
  partyCode: "Party Code",
  partyName: "Supplier Name",
  remarks: "Remarks",
};
export const PettyCashFundAccountingColumnWidths: Record<PettyCashFundAccountingColumnId, number> = {
  accountCode: 135,
  accountTitle: 210,
  debit: 125,
  credit: 125,
  partyCode: 130,
  partyName: 190,
  remarks: 220,
};
export const PettyCashFundProtectedAccountingColumnIds = new Set<PettyCashFundAccountingColumnId>(["accountCode", "debit", "credit"]);
export const PettyCashFundEntryInputClassName =
  "h-10 w-full min-w-0 border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 read-only:bg-darknavy/[0.03] read-only:text-darknavy";
export const PettyCashFundPartyOptions: AppAdvancedDropdownOption[] = [
  { label: "E000102", name: "Raymark B. Arsicolo", value: "E000102" },
  { label: "E000117", name: "Maria L. Dela Cruz", value: "E000117" },
  { label: "E000145", name: "Jose P. Santos", value: "E000145" },
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
  { name: "VAT 12%", value: "VAT 12%" },
  { name: "Zero Rated", value: "Zero Rated" },
  { name: "Exempt", value: "Exempt" },
];
export const PettyCashFundResponsibilityCenterOptions: AppAdvancedDropdownOption[] = [
  { label: "RC-ADM", name: "Administration", value: "Administration" },
  { label: "RC-OPS", name: "Operations", value: "Operations" },
  { label: "RC-SAL", name: "Sales", value: "Sales" },
];

export function canEditPettyCashFund(status: PettyCashFundStatus) {
  return (
    status === PettyCashFundStatuses.draft || status === PettyCashFundStatuses.forApproval || status === PettyCashFundStatuses.disapproved
  );
}
export const PettyCashFundEntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
