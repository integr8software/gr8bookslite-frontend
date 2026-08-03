import type {
  BeginningBalanceUploaderColumn,
  BeginningBalanceUploaderField,
} from "@/app/src/types/modules/beginning-balance-uploader/BeginningBalanceUploaderTypes";

export const BeginningBalanceUploaderHref = "/others/beginning-balance-uploader";

export const BeginningBalanceUploaderTablePaginationStorageKey =
  "others.beginning-balance-uploader";

export const BeginningBalanceUploaderRowBatchOptions = [
  1,
  2,
  5,
  10,
  15,
  20,
  50,
  100,
  1000,
] as const;

export const BeginningBalanceUploaderCurrencyOptions = [
  { name: "Philippine Peso (PHP)", value: "PHP" },
  { name: "US Dollar (USD)", value: "USD" },
  { name: "Euro (EUR)", value: "EUR" },
  { name: "Japanese Yen (JPY)", value: "JPY" },
] as const;

export const BeginningBalanceUploaderColumns: BeginningBalanceUploaderColumn[] = [
  { field: "accntCode", label: "Account Code", placeholder: "Auto-filled" },
  {
    field: "accntTitle",
    label: "Account Title",
    placeholder: "Select account title",
  },
  { field: "partyCode", label: "Party Code *", placeholder: "Auto-filled" },
  { field: "partyName", label: "Party Name *", placeholder: "Select party name" },
  { field: "particulars", label: "Particulars *", placeholder: "Opening balance" },
  {
    field: "debit",
    label: "Debit",
    placeholder: "0.00",
    align: "right",
    inputMode: "decimal",
  },
  {
    field: "credit",
    label: "Credit",
    placeholder: "0.00",
    align: "right",
    inputMode: "decimal",
  },
];

export const BeginningBalanceUploaderFields =
  BeginningBalanceUploaderColumns.map((column) => column.field);

export const BeginningBalanceUploaderPageCopy = {
  title: "Beginning Balance Uploader",
  description:
    "Enter opening transaction balances in a spreadsheet-style grid.",
  entriesTitle: "Details",
  entriesDescription:
    "Select accounts and parties, or paste columns and rows copied from Excel.",
  headerTitle: "Header",
} as const;

export const BeginningBalanceUploaderActionCopy = {
  add: {
    title: "Add Beginning Balance",
    description:
      "Prepare the opening balance header and balanced accounting details before saving.",
  },
  edit: {
    title: "Edit Beginning Balance",
    description:
      "Update the opening balance header and accounting details before saving.",
  },
  view: {
    title: "View Beginning Balance",
    description:
      "Review the opening balance header, accounting details, and posting status.",
  },
} as const;

export function getBeginningBalanceUploaderColumnIndex(
  field: BeginningBalanceUploaderField,
) {
  return BeginningBalanceUploaderColumns.findIndex(
    (column) => column.field === field,
  );
}
