import type { PurchaseOrderAccountingEntry, PurchaseOrderItem } from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

export function shouldClearPurchaseOrderAccountingEntry(
  entry: PurchaseOrderAccountingEntry,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  const hasData =
    entry.accountCode.trim() !== "" ||
    entry.accountTitle.trim() !== "" ||
    entry.partyCode.trim() !== "" ||
    entry.partyName.trim() !== "" ||
    entry.particulars.trim() !== "" ||
    entry.vatType.trim() !== "" ||
    entry.atcCode.trim() !== "" ||
    entry.responsibilityCenter.trim() !== "" ||
    entry.refNo.trim() !== "" ||
    entry.debit > 0 ||
    entry.credit > 0;

  if (action === "with-data") return hasData;
  if (action === "incomplete") return hasData && !entry.accountTitle.trim();
  return !hasData;
}

export function duplicateEntryRow<TRow extends { id: string }>(rows: TRow[], rowId: string, createId: () => string) {
  const rowIndex = rows.findIndex((row) => row.id === rowId);
  const row = rows[rowIndex];
  if (!row) return rows;
  const nextRows = [...rows];
  nextRows.splice(rowIndex + 1, 0, { ...row, id: createId() });
  return nextRows;
}

export function insertEntryRow<TRow extends { id: string }>(
  rows: TRow[],
  rowId: string,
  position: "above" | "below",
  createRow: () => TRow,
) {
  const rowIndex = rows.findIndex((row) => row.id === rowId);
  const insertIndex = rowIndex < 0 ? rows.length : rowIndex + (position === "below" ? 1 : 0);
  const nextRows = [...rows];
  nextRows.splice(insertIndex, 0, createRow());
  return nextRows;
}

export function moveEntryRow<TRow extends { id: string }>(rows: TRow[], fromRowId: string, toRowId: string) {
  const fromIndex = rows.findIndex((row) => row.id === fromRowId);
  const toIndex = rows.findIndex((row) => row.id === toRowId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return rows;
  const nextRows = [...rows];
  const [movedRow] = nextRows.splice(fromIndex, 1);
  if (!movedRow) return rows;
  nextRows.splice(toIndex, 0, movedRow);
  return nextRows;
}

export function removeEntryRow<TRow extends { id: string }>(rows: TRow[], rowId: string, createFallbackRow: () => TRow) {
  const nextRows = rows.filter((row) => row.id !== rowId);
  return nextRows.length > 0 ? nextRows : [createFallbackRow()];
}

export function normalizePurchaseOrderEntry(entry: PurchaseOrderItem): PurchaseOrderItem {
  return {
    ...entry,
    cost: Number(entry.cost) || 0,
    discountAmount: Number(entry.discountAmount) || 0,
    discountRate: Number(entry.discountRate) || 0,
    freightCost: Number(entry.freightCost) || 0,
    prQuantity: Number(entry.prQuantity) || 0,
    quantity: Number(entry.quantity) || 0,
    rateDelivery: Number(entry.rateDelivery) || 0,
    vatAmount: Number(entry.vatAmount) || 0,
  };
}

export function shouldClearPurchaseOrderEntry(entry: PurchaseOrderItem, action: Exclude<ModuleDataEntryClearAction, "all">) {
  const hasData = purchaseOrderEntryHasData(entry);

  if (action === "with-data") return hasData;
  if (action === "incomplete") return hasData && !purchaseOrderEntryIsComplete(entry);

  return !hasData;
}

function purchaseOrderEntryHasData(entry: PurchaseOrderItem) {
  return Boolean(
    entry.itemCode.trim() ||
    entry.barcode.trim() ||
    entry.itemName.trim() ||
    entry.lotNo.trim() ||
    entry.itemCategory.trim() ||
    entry.color.trim() ||
    entry.brand.trim() ||
    entry.size.trim() ||
    entry.model.trim() ||
    entry.responsibilityCenter.trim() ||
    entry.budgetCode.trim() ||
    entry.linePrNo.trim() ||
    entry.canvassNo.trim() ||
    Number(entry.quantity) ||
    Number(entry.prQuantity) ||
    Number(entry.rateDelivery) ||
    Number(entry.cost),
  );
}

function purchaseOrderEntryIsComplete(entry: PurchaseOrderItem) {
  return Boolean(
    entry.itemCode.trim() && entry.itemName.trim() && entry.uom.trim() && Number(entry.quantity) >= 0 && Number(entry.cost) >= 0,
  );
}
