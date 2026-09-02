import {
  calculateProvisionalReceiptCwtAmount,
  calculateProvisionalReceiptNetOfVat,
  calculateProvisionalReceiptTotalReceived,
  calculateProvisionalReceiptVatAmount,
  formatProvisionalReceiptAmount,
} from "@/app/src/data/modules/cash-receipt/provisional-receipt/ProvisionalReceiptData";
import type { ProvisionalReceiptLineEntry } from "@/app/src/types/modules/cash-receipt/provisional-receipt/ProvisionalReceiptTypes";
import {
  ProvisionalReceiptAccountingColumnIds,
  ProvisionalReceiptCollectionColumnIds,
  type ProvisionalReceiptAccountingColumnId,
  type ProvisionalReceiptCollectionColumnId,
} from "@/app/src/constants/modules/cash-receipt/provisional-receipt/ProvisionalReceiptEntryColumns";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

export function isProvisionalReceiptCollectionColumnId(columnId: string): columnId is ProvisionalReceiptCollectionColumnId {
  return ProvisionalReceiptCollectionColumnIds.includes(columnId as ProvisionalReceiptCollectionColumnId);
}

export function isProvisionalReceiptAccountingColumnId(columnId: string): columnId is ProvisionalReceiptAccountingColumnId {
  return ProvisionalReceiptAccountingColumnIds.includes(columnId as ProvisionalReceiptAccountingColumnId);
}

export function calculateCollectionColumnFitWidth({
  columnId,
  columnLabels,
  rows,
}: {
  columnId: ProvisionalReceiptCollectionColumnId;
  columnLabels: Record<ProvisionalReceiptCollectionColumnId, string>;
  rows: ProvisionalReceiptLineEntry[];
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
  columnId: ProvisionalReceiptAccountingColumnId;
  columnLabels: Record<ProvisionalReceiptAccountingColumnId, string>;
  rows: ProvisionalReceiptLineEntry[];
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

function getCollectionExportCell(entry: ProvisionalReceiptLineEntry, columnId: ProvisionalReceiptCollectionColumnId) {
  switch (columnId) {
    case "netOfVat":
      return formatProvisionalReceiptAmount(calculateProvisionalReceiptNetOfVat(entry));
    case "vatAmount":
      return formatProvisionalReceiptAmount(calculateProvisionalReceiptVatAmount(entry));
    case "cwtAmount":
      return formatProvisionalReceiptAmount(calculateProvisionalReceiptCwtAmount(entry));
    case "totalReceived":
      return formatProvisionalReceiptAmount(calculateProvisionalReceiptTotalReceived(entry));
    default:
      return String(entry[columnId] ?? "");
  }
}

function getAccountingExportCell(entry: ProvisionalReceiptLineEntry, columnId: ProvisionalReceiptAccountingColumnId) {
  return String(entry[columnId] ?? "");
}

function estimateTextWidth(value: string, padding: number) {
  return clampColumnWidth(value.trim().length * 7.5 + padding);
}
