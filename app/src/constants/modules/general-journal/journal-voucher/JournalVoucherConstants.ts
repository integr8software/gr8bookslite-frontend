import type { JournalVoucherStatus } from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";

export const JournalVoucherHref = "/general-journal/journal-voucher";

export const JournalVoucherTablePaginationStorageKey =
  "general-journal.journal-voucher";

export const JournalVoucherStatusOptions: JournalVoucherStatus[] = [
  "Draft",
  "For Approval",
  "Posted",
  "Disapproved",
  "Cancelled",
];

export const JournalVoucherStatusFilters = [
  "all",
  "Draft",
  "For Approval",
  "Posted",
  "Disapproved",
  "Cancelled",
] as const;

export const JournalVoucherStatusFilterOptions =
  JournalVoucherStatusFilters.map((status) => ({
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

export const JournalVoucherCurrencyOptions = [
  "PHP",
  "USD",
  "EUR",
  "JPY",
] as const;

export const JournalVoucherVatTypeOptions = [
  "VATable",
  "VAT Exempt",
  "Zero Rated",
  "Non-VAT",
] as const;

export const JournalVoucherActionCopy = {
  add: {
    title: "Create New Journal Voucher",
    description:
      "Encode the voucher header and balanced debit and credit entries.",
  },
  edit: {
    title: "Edit Journal Voucher",
    description:
      "Update voucher remarks, currency details, document date, and journal lines.",
  },
  view: {
    title: "View Journal Voucher",
    description:
      "Review voucher details, entry totals, and posting readiness.",
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

export type JournalVoucherLineColumnId =
  (typeof JournalVoucherLineColumnIds)[number];

export const JournalVoucherProtectedLineColumnIds =
  new Set<JournalVoucherLineColumnId>([
    "accountTitle",
    "debit",
    "credit",
  ]);

export const JournalVoucherLineDefaultVisibleColumnIds = [
  "accountTitle",
  "debit",
  "credit",
  "partyName",
  "particulars",
  "responsibilityCenter",
] as const satisfies readonly JournalVoucherLineColumnId[];

export const JournalVoucherLineColumnLabels: Record<
  JournalVoucherLineColumnId,
  string
> = {
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

export const JournalVoucherLineColumnWidths: Record<
  JournalVoucherLineColumnId,
  number
> = {
  accountCode: 160,
  accountTitle: 260,
  debit: 160,
  credit: 160,
  partyCode: 150,
  partyName: 220,
  particulars: 320,
  vatType: 150,
  atcCode: 140,
  responsibilityCenter: 220,
  refNo: 160,
};
