import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import type {
  AccountingEntry,
  AccountingEntryAmount,
  AccountingEntryColumnId,
} from "@/app/src/types/shared/accounting/AccountingEntryTypes";
import { toAccountingEntryAmount } from "@/app/src/ui/shared/accounting-entry/AccountingEntryTotals";

export type AccountingEntryRowFactory<TRow extends AccountingEntry> = () => TRow;

export function getAccountingEntryAmountUpdates<TRow extends AccountingEntry>(
  row: TRow,
  columnId: Extract<AccountingEntryColumnId, "debit" | "credit">,
  value: AccountingEntryAmount,
): Partial<Omit<TRow, "id">> {
  const oppositeColumnId = columnId === "debit" ? "credit" : "debit";
  const amount = toAccountingEntryAmount(value);

  return {
    [columnId]: amount,
    [oppositeColumnId]: amount > 0 ? 0 : row[oppositeColumnId],
  } as Partial<Omit<TRow, "id">>;
}

export function createAccountingEntryRows<TRow extends AccountingEntry>(count: number, createRow: AccountingEntryRowFactory<TRow>) {
  return Array.from({ length: count }, createRow);
}

export function duplicateAccountingEntryRow<TRow extends AccountingEntry>(
  rows: TRow[],
  rowId: string,
  createRow: AccountingEntryRowFactory<TRow>,
) {
  const index = rows.findIndex((row) => row.id === rowId);
  const row = rows[index];

  if (!row) return rows;

  const nextRows = [...rows];
  nextRows.splice(index + 1, 0, { ...row, id: createRow().id });
  return nextRows;
}

export function insertAccountingEntryRow<TRow extends AccountingEntry>(
  rows: TRow[],
  rowId: string,
  position: "above" | "below",
  createRow: AccountingEntryRowFactory<TRow>,
) {
  const index = rows.findIndex((row) => row.id === rowId);

  if (index < 0) return rows;

  const nextRows = [...rows];
  nextRows.splice(position === "above" ? index : index + 1, 0, createRow());
  return nextRows;
}

export function moveAccountingEntryRow<TRow extends AccountingEntry>(rows: TRow[], fromRowId: string, toRowId: string) {
  const fromIndex = rows.findIndex((row) => row.id === fromRowId);
  const toIndex = rows.findIndex((row) => row.id === toRowId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return rows;

  const nextRows = [...rows];
  const [movedRow] = nextRows.splice(fromIndex, 1);

  if (!movedRow) return rows;

  nextRows.splice(toIndex, 0, movedRow);
  return nextRows;
}

export function removeAccountingEntryRow<TRow extends AccountingEntry>(
  rows: TRow[],
  rowId: string,
  createRow: AccountingEntryRowFactory<TRow>,
) {
  const nextRows = rows.filter((row) => row.id !== rowId);
  return nextRows.length > 0 ? nextRows : [createRow()];
}

export function clearAccountingEntryRows<TRow extends AccountingEntry>(
  rows: TRow[],
  action: ModuleDataEntryClearAction,
  createRow: AccountingEntryRowFactory<TRow>,
) {
  if (action === "all") return [createRow()];

  const nextRows = rows.filter((row) => !shouldClearAccountingEntry(row, action));
  return nextRows.length > 0 ? nextRows : [createRow()];
}

export function shouldClearAccountingEntry<TRow extends AccountingEntry>(row: TRow, action: Exclude<ModuleDataEntryClearAction, "all">) {
  const hasData = accountingEntryHasData(row);

  if (action === "with-data") return hasData;
  if (action === "incomplete") return hasData && !accountingEntryIsComplete(row);
  return !hasData;
}

export function accountingEntryHasData<TRow extends AccountingEntry>(row: TRow) {
  return Boolean(
    row.accountCode ||
    row.accountTitle ||
    row.partyCode ||
    row.partyName ||
    row.particulars ||
    row.vatType ||
    row.atcCode ||
    row.responsibilityCenter ||
    row.refNo ||
    toAccountingEntryAmount(row.debit) ||
    toAccountingEntryAmount(row.credit),
  );
}

export function accountingEntryIsComplete<TRow extends AccountingEntry>(row: TRow) {
  return (
    Boolean(row.accountCode || row.accountTitle) && (toAccountingEntryAmount(row.debit) > 0 || toAccountingEntryAmount(row.credit) > 0)
  );
}
