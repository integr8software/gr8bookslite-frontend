import { shouldClearEntry } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingEntryData";
import type { DisbursementLineEntry } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export function createDisbursementEntryRows(count: number, createRow: () => DisbursementLineEntry) {
  return Array.from({ length: count }, createRow);
}

export function insertDisbursementEntryRow(
  rows: DisbursementLineEntry[],
  rowId: string,
  position: "above" | "below",
  createRow: () => DisbursementLineEntry,
) {
  const rowIndex = rows.findIndex((row) => row.id === rowId);
  const insertIndex = rowIndex < 0 ? rows.length : rowIndex + (position === "below" ? 1 : 0);
  const nextRows = [...rows];

  nextRows.splice(insertIndex, 0, createRow());
  return nextRows;
}

export function duplicateDisbursementEntryRow(rows: DisbursementLineEntry[], rowId: string, createId: () => string) {
  const rowIndex = rows.findIndex((row) => row.id === rowId);
  const row = rows[rowIndex];

  if (!row) {
    return rows;
  }

  const nextRows = [...rows];
  nextRows.splice(rowIndex + 1, 0, { ...row, id: createId() });
  return nextRows;
}

export function moveDisbursementEntryRow(rows: DisbursementLineEntry[], fromRowId: string, toRowId: string) {
  const fromIndex = rows.findIndex((row) => row.id === fromRowId);
  const toIndex = rows.findIndex((row) => row.id === toRowId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return rows;
  }

  const nextRows = [...rows];
  const [movedRow] = nextRows.splice(fromIndex, 1);

  if (!movedRow) {
    return rows;
  }

  nextRows.splice(toIndex, 0, movedRow);
  return nextRows;
}

export function removeDisbursementEntryRow(rows: DisbursementLineEntry[], rowId: string) {
  return rows.filter((row) => row.id !== rowId);
}

export function clearDisbursementEntryRows(rows: DisbursementLineEntry[], action: ModuleDataEntryClearAction) {
  if (action === "all") {
    return [];
  }

  return rows.filter((row) => !shouldClearEntry(row, action));
}
