import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type { DebitMemoStatus } from "@/app/src/types/modules/general-journal/debit-memo/DebitMemoTypes";

export const DebitMemoHref = MODULE_ROUTE_MAP.DM;

export const DebitMemoTablePaginationStorageKey = "general-journal.debit-memo";

export const DebitMemoTableColumns = [
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

export const DebitMemoTablePreferencesStorageKey =
  "gr8booksneo:debit-memo:table-preferences";
export const DebitMemoTablePreferencesModuleKey = "general-journal:debit-memo";
export const DebitMemoDefaultColumnOrder = DebitMemoTableColumns.map((column) =>
  "key" in column ? column.key : "actions",
);
export const DebitMemoDefaultColumnVisibility: VisibilityState = {};
export const DebitMemoDefaultSorting: SortingState = [
  { id: "documentDate", desc: true },
];

export const DebitMemoStatusOptions: DebitMemoStatus[] = [
  "Draft",
  "For Approval",
  "Posted",
  "Disapproved",
  "Cancelled",
];

export const DebitMemoStatusFilters = ["all", ...DebitMemoStatusOptions] as const;

export const DebitMemoStatusFilterOptions = DebitMemoStatusFilters.map((status) => ({
  label: status === "all" ? "All" : status,
  value: status,
}));

export function canEditDebitMemoStatus(status: DebitMemoStatus) {
  return status === "Draft" || status === "For Approval";
}

export function canApproveDebitMemoStatus(status: DebitMemoStatus) {
  return status === "For Approval" || status === "Posted";
}

export function canDisapproveDebitMemoStatus(status: DebitMemoStatus) {
  return status === "For Approval" || status === "Disapproved";
}

export function canCancelDebitMemoStatus(status: DebitMemoStatus) {
  return status === "Draft" || status === "For Approval" || status === "Cancelled";
}

export const DebitMemoCurrencyOptions = ["PHP", "USD", "EUR", "JPY"] as const;

export const DebitMemoActionCopy = {
  add: {
    title: "Create New Debit Memo",
    description: "Record a Debit Memo with balanced accounting entries.",
  },
  edit: {
    title: "Edit Debit Memo",
    description: "Update Debit Memo header details and accounting entries.",
  },
  view: {
    title: "View Debit Memo",
    description: "Review Debit Memo header details and accounting entries.",
  },
} as const;

export const DebitMemoPurchaseTaxCodeQuery = {
  transactionType: "Purchases",
} as const;

export const DebitMemoAccountingColumnIds = [
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

export const DebitMemoAccountingProtectedColumnIds = new Set<string>([
  "accountTitle",
  "debit",
  "credit",
]);

export const DebitMemoAccountingDefaultVisibleColumnIds = [
  "accountTitle",
  "debit",
  "credit",
  "particulars",
] as const;

export const DebitMemoAccountingColumnLabels = {
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

export const DebitMemoAccountingColumnWidths = {
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

