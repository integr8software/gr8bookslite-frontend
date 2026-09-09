import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type {
  JournalVoucherLineColumnId,
  JournalVoucherStatus,
} from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";

export const JournalVoucherHref = "/general-journal/journal-voucher";

export const JournalVoucherTablePaginationStorageKey = "general-journal.journal-voucher";

export const JournalVoucherTableColumns = [
  {
    key: "transactionNo",
    label: "Voucher No.",
    className: "w-[12rem]",
  },
  {
    key: "documentDate",
    label: "Document Date",
    className: "w-[11rem]",
  },
  {
    key: "remarks",
    label: "Remarks",
    className: "w-[22rem]",
  },
  {
    key: "currencyType",
    label: "Currency",
    className: "w-[8rem]",
  },
  {
    key: "totalDebit",
    label: "Debit",
    className: "w-[11rem] text-right",
  },
  {
    key: "totalCredit",
    label: "Credit",
    className: "w-[11rem] text-right",
  },
  {
    key: "status",
    label: "Status",
    className: "w-[9rem]",
  },
  {
    label: "Actions",
    className: "w-[9rem] text-center",
  },
] as const;

export const JournalVoucherTablePreferencesStorageKey = "gr8booksneo:general-journal-journal-voucher:table-preferences";
export const JournalVoucherTablePreferencesModuleKey = "general-journal:journal-voucher";
export const JournalVoucherDefaultColumnOrder = JournalVoucherTableColumns.map((column) => ("key" in column ? column.key : "actions"));
export const JournalVoucherDefaultColumnVisibility: VisibilityState = {};
export const JournalVoucherDefaultSorting: SortingState = [{ id: "documentDate", desc: true }];

export const JournalVoucherStatusOptions: JournalVoucherStatus[] = ["Posted", "For Approval", "Draft", "Disapproved", "Cancelled"];

export const JournalVoucherStatusFilters = ["all", "Posted", "For Approval", "Draft", "Disapproved", "Cancelled"] as const;

export const JournalVoucherStatusFilterOptions = JournalVoucherStatusFilters.map((status) => ({
  label: status === "all" ? "All" : status,
  value: status,
}));

export function canEditJournalVoucherStatus(status: JournalVoucherStatus) {
  return status === "Draft" || status === "For Approval";
}

export function canApproveJournalVoucherStatus(status: JournalVoucherStatus) {
  return status === "For Approval" || status === "Posted";
}

export function canDisapproveJournalVoucherStatus(status: JournalVoucherStatus) {
  return status === "For Approval" || status === "Disapproved";
}

export function canCancelJournalVoucherStatus(status: JournalVoucherStatus) {
  return status === "Draft" || status === "For Approval" || status === "Cancelled";
}

export const JournalVoucherCurrencyOptions = ["PHP", "USD", "EUR", "JPY"] as const;

export const JournalVoucherActionCopy = {
  add: {
    title: "Create New Journal Voucher",
    description: "Encode the voucher header and balanced debit and credit entries.",
  },
  edit: {
    title: "Edit Journal Voucher",
    description: "Update voucher remarks, currency details, document date, and journal lines.",
  },
  view: {
    title: "View Journal Voucher",
    description: "Review voucher details, entry totals, and posting readiness.",
  },
} as const;

export const JournalVoucherLineColumnIds = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "particulars",
  "vatType",
  "atcCode",
  "responsibilityCenter",
  "refNo",
] as const;

export const JournalVoucherProtectedLineColumnIds = new Set<JournalVoucherLineColumnId>(["accountTitle", "debit", "credit"]);

export const JournalVoucherLineDefaultVisibleColumnIds = JournalVoucherLineColumnIds.filter((columnId) => columnId !== "partyCode");

export const JournalVoucherLineColumnLabels: Record<JournalVoucherLineColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  particulars: "Particulars",
  partyCode: "Party Code",
  partyName: "Party Name",
  responsibilityCenter: "Responsibility Center",
  refNo: "Reference No",
  vatType: "VAT Type",
  atcCode: "EWT Code",
  debit: "Debit",
  credit: "Credit",
};

export const JournalVoucherLineColumnWidths: Record<JournalVoucherLineColumnId, number> = {
  accountCode: 160,
  accountTitle: 260,
  debit: 160,
  credit: 160,
  partyCode: 150,
  partyName: 220,
  particulars: 320,
  vatType: 190,
  atcCode: 210,
  responsibilityCenter: 220,
  refNo: 160,
};

export const JournalVoucherBaseCurrencyCode = "PHP";

export const JournalVoucherInputVatTaxType = "INPUT VAT";
export const JournalVoucherOutputVatTaxType = "OUTPUT VAT";
export const JournalVoucherEwtTaxType = "EWT";
export const JournalVoucherCwtTaxType = "CWT";

export const JournalVoucherDefaultStatus = ["ACTIVE"] as const;
