export type BeginningBalanceUploaderField =
  | "accntCode"
  | "accntTitle"
  | "partyCode"
  | "partyName"
  | "particulars"
  | "debit"
  | "credit";

export type BeginningBalanceUploaderRow = Record<
  BeginningBalanceUploaderField,
  string
> & {
  id: string;
};

export type BeginningBalanceUploaderColumn = {
  field: BeginningBalanceUploaderField;
  label: string;
  placeholder?: string;
  align?: "left" | "right";
  inputMode?: "decimal";
  type?: "date" | "text";
};

export type BeginningBalanceUploaderTotals = {
  debit: number;
  credit: number;
  variance: number;
};

export type BeginningBalanceUploaderActionMode = "add" | "edit" | "view";

export type BeginningBalanceUploaderStatus = "Draft" | "Posted";

export type BeginningBalanceUploaderFormValues = {
  currencyRate: string;
  currencyType: string;
  documentDate: string;
  remarks: string;
  rows: BeginningBalanceUploaderRow[];
  transactionNumber: string;
};

export type BeginningBalanceUploaderRecord = BeginningBalanceUploaderFormValues & {
  createdAt: string;
  id: string;
  status: BeginningBalanceUploaderStatus;
  updatedAt: string;
};
