import type { JournalVoucherStatus } from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";

export const JournalVoucherHref = "/general-journal/journal-voucher";

export const JournalVoucherTablePaginationStorageKey =
  "general-journal.journal-voucher";

export const JournalVoucherStatusOptions: JournalVoucherStatus[] = [
  "Draft",
  "Approved",
  "Disapproved",
  "Posted",
  "Cancelled",
];

export const JournalVoucherStatusFilters = [
  "all",
  "Draft",
  "Approved",
  "Disapproved",
  "Posted",
  "Cancelled",
] as const;

export const JournalVoucherStatusFilterOptions =
  JournalVoucherStatusFilters.map((status) => ({
    label: status === "all" ? "All" : status,
    value: status,
  }));

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

export type JournalVoucherLineColumnId =
  (typeof JournalVoucherLineColumnIds)[number];

export const JournalVoucherProtectedLineColumnIds =
  new Set<JournalVoucherLineColumnId>([
    "accountCode",
    "accountTitle",
    "debit",
    "credit",
  ]);

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
  refNo: "Ref No.",
  vatType: "VAT Type",
  atcCode: "ATC Code",
  debit: "Debit",
  credit: "Credit",
};

export const JournalVoucherLineColumnWidths: Record<
  JournalVoucherLineColumnId,
  number
> = {
  accountCode: 160,
  accountTitle: 240,
  particulars: 320,
  partyCode: 150,
  partyName: 220,
  responsibilityCenter: 210,
  refNo: 160,
  vatType: 150,
  atcCode: 140,
  debit: 160,
  credit: 160,
};
