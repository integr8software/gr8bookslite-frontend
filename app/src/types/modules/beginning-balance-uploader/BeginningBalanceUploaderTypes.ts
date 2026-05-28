import type { ClipboardEvent } from "react";

export type BeginningBalanceUploaderField =
  | "date"
  | "refType"
  | "refTransId"
  | "accntCode"
  | "accntTitle"
  | "partyCode"
  | "partyName"
  | "debit"
  | "credit"
  | "refNo";

export type BeginningBalanceUploaderRow = Record<
  BeginningBalanceUploaderField,
  string
> & {
  id: number;
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

export type BeginningBalanceUploaderPasteHandler = (
  event: ClipboardEvent<HTMLInputElement>,
  startRowIndex: number,
  startField: BeginningBalanceUploaderField,
) => void;
