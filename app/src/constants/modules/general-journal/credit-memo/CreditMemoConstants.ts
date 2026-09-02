import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type { CreditMemoStatus } from "@/app/src/types/modules/general-journal/credit-memo/CreditMemoTypes";

export const CreditMemoHref = MODULE_ROUTE_MAP.CM;

export const CreditMemoTablePaginationStorageKey = "general-journal.credit-memo";

export const CreditMemoTableColumns = [
  {
    key: "transactionNo",
    label: "Memo No.",
    className: "w-[12rem]",
  },
  {
    key: "documentDate",
    label: "Document Date",
    className: "w-[11rem]",
  },
  {
    key: "partyName",
    label: "Party Name",
    className: "w-[18rem]",
  },
  {
    key: "referenceNo",
    label: "Reference No.",
    className: "w-[12rem]",
  },
  {
    key: "remarks",
    label: "Remarks",
    className: "w-[18rem]",
  },
  {
    key: "amount",
    label: "Amount",
    className: "w-[11rem] text-right",
  },
  {
    key: "currency",
    label: "Currency",
    className: "w-[8rem]",
  },
  {
    key: "status",
    label: "Status",
    className: "w-[10rem]",
  },
  {
    label: "Actions",
    className: "w-[9rem] text-center",
  },
] as const;

export const CreditMemoTablePreferencesStorageKey =
  "gr8booksneo:credit-memo:table-preferences";
export const CreditMemoTablePreferencesModuleKey = "general-journal:credit-memo";
export const CreditMemoDefaultColumnOrder = CreditMemoTableColumns.map((column) =>
  "key" in column ? column.key : "actions",
);
export const CreditMemoDefaultColumnVisibility: VisibilityState = {};
export const CreditMemoDefaultSorting: SortingState = [
  { id: "documentDate", desc: true },
];

export const CreditMemoStatusOptions: CreditMemoStatus[] = [
  "Draft",
  "For Approval",
  "Posted",
  "Disapproved",
  "Cancelled",
];

export const CreditMemoStatusFilters = ["all", ...CreditMemoStatusOptions] as const;

export const CreditMemoStatusFilterOptions = CreditMemoStatusFilters.map((status) => ({
  label: status === "all" ? "All" : status,
  value: status,
}));

export function canEditCreditMemoStatus(status: CreditMemoStatus) {
  return status === "Draft" || status === "For Approval";
}

export function canApproveCreditMemoStatus(status: CreditMemoStatus) {
  return status === "For Approval" || status === "Posted";
}

export function canDisapproveCreditMemoStatus(status: CreditMemoStatus) {
  return status === "For Approval" || status === "Disapproved";
}

export function canCancelCreditMemoStatus(status: CreditMemoStatus) {
  return status === "Draft" || status === "For Approval" || status === "Cancelled";
}

export const CreditMemoCurrencyOptions = ["PHP", "USD", "EUR", "JPY"] as const;

export const CreditMemoActionCopy = {
  add: {
    title: "Create New Credit Memo",
    description: "Record a credit memo with balanced accounting entries.",
  },
  edit: {
    title: "Edit Credit Memo",
    description: "Update credit memo header details and accounting entries.",
  },
  view: {
    title: "View Credit Memo",
    description: "Review credit memo header details and accounting entries.",
  },
} as const;

export const CreditMemoPurchaseTaxCodeQuery = {
  transactionType: "Purchases",
} as const;

export const CreditMemoAccountingColumnIds = [
  "accountCode",
  "accountTitle",
  "particulars",
  "debit",
  "credit",
  "vatType",
  "atcCode",
  "partyCode",
  "partyName",
  "responsibilityCenter",
  "refNo",
] as const;

export const CreditMemoAccountingProtectedColumnIds = new Set<string>([
  "accountTitle",
  "debit",
  "credit",
]);

export const CreditMemoAccountingDefaultVisibleColumnIds = [
  "accountTitle",
  "debit",
  "credit",
  "particulars",
] as const;

export const CreditMemoAccountingColumnLabels = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  particulars: "Particulars",
  debit: "Debit",
  credit: "Credit",
  vatType: "VAT Type",
  atcCode: "ATC Code",
  partyCode: "Party Code",
  partyName: "Party Name",
  responsibilityCenter: "Responsibility Center",
  refNo: "Ref No.",
} as const;

export const CreditMemoAccountingColumnWidths = {
  accountCode: 160,
  accountTitle: 260,
  particulars: 320,
  debit: 160,
  credit: 160,
  vatType: 150,
  atcCode: 140,
  partyCode: 150,
  partyName: 220,
  responsibilityCenter: 220,
  refNo: 160,
} as const;

