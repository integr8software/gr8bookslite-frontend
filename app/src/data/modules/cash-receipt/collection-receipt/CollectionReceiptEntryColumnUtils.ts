import {
  calculateCollectionReceiptCwtAmount,
  calculateCollectionReceiptNetOfVat,
  calculateCollectionReceiptTotalReceived,
  calculateCollectionReceiptVatAmount,
  formatCollectionReceiptAmount,
} from "@/app/src/data/modules/cash-receipt/collection-receipt/CollectionReceiptData";
import type { CollectionReceiptLineEntry } from "@/app/src/types/modules/cash-receipt/collection-receipt/CollectionReceiptTypes";
import {
  CollectionReceiptAccountingColumnIds,
  CollectionReceiptCollectionColumnIds,
  type CollectionReceiptAccountingColumnId,
  type CollectionReceiptCollectionColumnId,
} from "@/app/src/constants/modules/cash-receipt/collection-receipt/CollectionReceiptEntryColumns";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

export function isCollectionReceiptCollectionColumnId(columnId: string): columnId is CollectionReceiptCollectionColumnId {
  return CollectionReceiptCollectionColumnIds.includes(columnId as CollectionReceiptCollectionColumnId);
}

export function isCollectionReceiptAccountingColumnId(columnId: string): columnId is CollectionReceiptAccountingColumnId {
  return CollectionReceiptAccountingColumnIds.includes(columnId as CollectionReceiptAccountingColumnId);
}

export function calculateCollectionColumnFitWidth({
  columnId,
  columnLabels,
  rows,
}: {
  columnId: CollectionReceiptCollectionColumnId;
  columnLabels: Record<CollectionReceiptCollectionColumnId, string>;
  rows: CollectionReceiptLineEntry[];
}) {
  const headerWidth = estimateTextWidth(columnLabels[columnId], 76);
  const contentWidth = rows.reduce(
    (currentWidth, row) => Math.max(currentWidth, estimateTextWidth(getCollectionExportCell(row, columnId), 24)),
    50,
  );

  return Math.max(headerWidth, contentWidth);
}

export function calculateAccountingColumnFitWidth({
  columnId,
  columnLabels,
  rows,
}: {
  columnId: CollectionReceiptAccountingColumnId;
  columnLabels: Record<CollectionReceiptAccountingColumnId, string>;
  rows: CollectionReceiptLineEntry[];
}) {
  const headerWidth = estimateTextWidth(columnLabels[columnId], 76);
  const contentWidth = rows.reduce(
    (currentWidth, row) => Math.max(currentWidth, estimateTextWidth(getAccountingExportCell(row, columnId), 24)),
    50,
  );

  return Math.max(headerWidth, contentWidth);
}

export function moveColumnId<TColumnId extends string>(columnOrder: TColumnId[], fromColumnId: TColumnId, toColumnId: TColumnId) {
  const fromIndex = columnOrder.indexOf(fromColumnId);
  const toIndex = columnOrder.indexOf(toColumnId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return columnOrder;
  }

  const nextOrder = [...columnOrder];
  const [movedColumn] = nextOrder.splice(fromIndex, 1);

  nextOrder.splice(toIndex, 0, movedColumn);
  return nextOrder;
}

export function updateVisibleColumnIds<TColumnId extends string>(
  visibleColumnIds: TColumnId[],
  columnOrder: TColumnId[],
  columnId: TColumnId,
  isVisible: boolean,
) {
  if (isVisible) {
    const nextVisibleIds = new Set([...visibleColumnIds, columnId]);

    return columnOrder.filter((currentColumnId) => nextVisibleIds.has(currentColumnId));
  }

  if (visibleColumnIds.length <= 1) {
    return visibleColumnIds;
  }

  return visibleColumnIds.filter((currentColumnId) => currentColumnId !== columnId);
}

function getCollectionExportCell(entry: CollectionReceiptLineEntry, columnId: CollectionReceiptCollectionColumnId) {
  switch (columnId) {
    case "netOfVat":
      return formatCollectionReceiptAmount(calculateCollectionReceiptNetOfVat(entry));
    case "vatAmount":
      return formatCollectionReceiptAmount(calculateCollectionReceiptVatAmount(entry));
    case "cwtAmount":
      return formatCollectionReceiptAmount(calculateCollectionReceiptCwtAmount(entry));
    case "totalReceived":
      return formatCollectionReceiptAmount(calculateCollectionReceiptTotalReceived(entry));
    default:
      return String(entry[columnId] ?? "");
  }
}

function getAccountingExportCell(entry: CollectionReceiptLineEntry, columnId: CollectionReceiptAccountingColumnId) {
  return String(entry[columnId] ?? "");
}

function estimateTextWidth(value: string, padding: number) {
  return clampColumnWidth(value.trim().length * 7.5 + padding);
}
