export type AccountingEntryAmount = number | string;

export type AccountingEntry = {
  id: string;
  accountId?: number | string;
  accountCode: string;
  accountTitle?: string;
  accountName?: string;
  debit: AccountingEntryAmount;
  credit: AccountingEntryAmount;
  partyCode?: string;
  partyName?: string;
  particulars?: string;
  remarks?: string;
  vatType?: string;
  atcCode?: string;
  responsibilityCenter?: string;
  refNo?: string;
  refId?: string;
  responsibilityCenterCode?: string;
  checkNo?: string;
  checkStatus?: string;
  checkDate?: string;
};

export type AccountingEntryColumnId =
  | "accountCode"
  | "accountTitle"
  | "accountName"
  | "atcCode"
  | "credit"
  | "debit"
  | "partyCode"
  | "partyName"
  | "particulars"
  | "remarks"
  | "refNo"
  | "refId"
  | "responsibilityCenter"
  | "responsibilityCenterCode"
  | "vatType"
  | "checkNo"
  | "checkStatus"
  | "checkDate";

export type AccountingEntryUpdate<TRow extends AccountingEntry> = (rowId: string, updates: Partial<Omit<TRow, "id">>) => void;

export type AccountingEntryTotals = {
  debit: number;
  credit: number;
  difference: number;
  isBalanced: boolean;
};
