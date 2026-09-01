import {
  calculateAcknowledgementReceiptCwtAmount,
  calculateAcknowledgementReceiptNetOfVat,
  calculateAcknowledgementReceiptTotalReceived,
  calculateAcknowledgementReceiptVatAmount,
  formatAcknowledgementReceiptAmount,
} from "@/app/src/data/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptData";
import type { AcknowledgementReceiptLineEntry } from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";
import {
  AcknowledgementReceiptAccountingColumnIds,
  AcknowledgementReceiptCollectionColumnIds,
  type AcknowledgementReceiptAccountingColumnId,
  type AcknowledgementReceiptCollectionColumnId,
} from "@/app/src/constants/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptEntryColumns";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

export function isAcknowledgementReceiptCollectionColumnId(columnId: string): columnId is AcknowledgementReceiptCollectionColumnId {
  return AcknowledgementReceiptCollectionColumnIds.includes(columnId as AcknowledgementReceiptCollectionColumnId);
}

export function isAcknowledgementReceiptAccountingColumnId(columnId: string): columnId is AcknowledgementReceiptAccountingColumnId {
  return AcknowledgementReceiptAccountingColumnIds.includes(columnId as AcknowledgementReceiptAccountingColumnId);
}

export function calculateCollectionColumnFitWidth({
  columnId,
  columnLabels,
  rows,
}: {
  columnId: AcknowledgementReceiptCollectionColumnId;
  columnLabels: Record<AcknowledgementReceiptCollectionColumnId, string>;
  rows: AcknowledgementReceiptLineEntry[];
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
  columnId: AcknowledgementReceiptAccountingColumnId;
  columnLabels: Record<AcknowledgementReceiptAccountingColumnId, string>;
  rows: AcknowledgementReceiptLineEntry[];
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

function getCollectionExportCell(entry: AcknowledgementReceiptLineEntry, columnId: AcknowledgementReceiptCollectionColumnId) {
  switch (columnId) {
    case "netOfVat":
      return formatAcknowledgementReceiptAmount(calculateAcknowledgementReceiptNetOfVat(entry));
    case "vatAmount":
      return formatAcknowledgementReceiptAmount(calculateAcknowledgementReceiptVatAmount(entry));
    case "cwtAmount":
      return formatAcknowledgementReceiptAmount(calculateAcknowledgementReceiptCwtAmount(entry));
    case "totalReceived":
      return formatAcknowledgementReceiptAmount(calculateAcknowledgementReceiptTotalReceived(entry));
    default:
      return String(entry[columnId] ?? "");
  }
}

function getAccountingExportCell(entry: AcknowledgementReceiptLineEntry, columnId: AcknowledgementReceiptAccountingColumnId) {
  return String(entry[columnId] ?? "");
}

function estimateTextWidth(value: string, padding: number) {
  return clampColumnWidth(value.trim().length * 7.5 + padding);
}
