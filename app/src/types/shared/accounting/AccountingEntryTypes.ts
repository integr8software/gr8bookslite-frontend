export type AccountingEntryAmount = number | string;

export type AccountingEntry = {
  id: string;
  accountId?: number | string;
  accountCode: string;
  accountTitle: string;
  debit: AccountingEntryAmount;
  credit: AccountingEntryAmount;
  partyCode: string;
  partyName: string;
  particulars: string;
  vatType: string;
  atcCode: string;
  responsibilityCenter: string;
  refNo: string;
};

export type AccountingEntryColumnId =
  | "accountCode"
  | "accountTitle"
  | "atcCode"
  | "credit"
  | "debit"
  | "partyCode"
  | "partyName"
  | "particulars"
  | "refNo"
  | "responsibilityCenter"
  | "vatType";

export type AccountingEntryUpdate<TRow extends AccountingEntry> = (rowId: string, updates: Partial<Omit<TRow, "id">>) => void;

export type AccountingEntryTotals = {
  debit: number;
  credit: number;
  difference: number;
  isBalanced: boolean;
};
