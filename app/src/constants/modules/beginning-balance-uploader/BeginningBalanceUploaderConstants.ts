import type {
  BeginningBalanceUploaderColumn,
  BeginningBalanceUploaderField,
} from "@/app/src/types/modules/beginning-balance-uploader/BeginningBalanceUploaderTypes";

export const BeginningBalanceUploaderHref = "/beginning-balance-uploader";

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

export const BeginningBalanceUploaderColumns: BeginningBalanceUploaderColumn[] = [
  { field: "date", label: "date", type: "date" },
  { field: "refType", label: "ref type", placeholder: "BB" },
  { field: "refTransId", label: "ref transid", placeholder: "01" },
  { field: "accntCode", label: "account code", placeholder: "100001" },
  {
    field: "accntTitle",
    label: "account title",
    placeholder: "Accounts Receivable",
  },
  { field: "partyCode", label: "party code", placeholder: "Party Code" },
  { field: "partyName", label: "party name", placeholder: "Party Name" },
  {
    field: "debit",
    label: "debit",
    placeholder: "0.00",
    align: "right",
    inputMode: "decimal",
  },
  {
    field: "credit",
    label: "credit",
    placeholder: "0.00",
    align: "right",
    inputMode: "decimal",
  },
  { field: "refNo", label: "ref. no", placeholder: "Reference No." },
];

export const BeginningBalanceUploaderFields =
  BeginningBalanceUploaderColumns.map((column) => column.field);

export const BeginningBalanceUploaderPageCopy = {
  title: "Beginning Balance",
  description:
    "Enter opening transaction balances in a spreadsheet-style grid.",
  entriesTitle: "Entries",
  entriesDescription: "Copy rows from Excel and paste into any starting cell.",
  headerTitle: "Header",
} as const;

export function getBeginningBalanceUploaderColumnIndex(
  field: BeginningBalanceUploaderField,
) {
  return BeginningBalanceUploaderColumns.findIndex(
    (column) => column.field === field,
  );
}
