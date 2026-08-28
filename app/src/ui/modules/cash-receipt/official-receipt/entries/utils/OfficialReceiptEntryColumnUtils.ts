import {
  calculateOfficialReceiptCwtAmount,
  calculateOfficialReceiptNetOfVat,
  calculateOfficialReceiptTotalReceived,
  calculateOfficialReceiptVatAmount,
  formatOfficialReceiptAmount,
} from "@/app/src/data/modules/cash-receipt/official-receipt/OfficialReceiptData";
import type { OfficialReceiptLineEntry } from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";
import {
  OfficialReceiptAccountingColumnIds,
  OfficialReceiptCollectionColumnIds,
  type OfficialReceiptAccountingColumnId,
  type OfficialReceiptCollectionColumnId,
} from "@/app/src/constants/modules/cash-receipt/official-receipt/OfficialReceiptEntryColumns";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

export function isOfficialReceiptCollectionColumnId(
  columnId: string,
): columnId is OfficialReceiptCollectionColumnId {
  return OfficialReceiptCollectionColumnIds.includes(
    columnId as OfficialReceiptCollectionColumnId,
  );
}

export function isOfficialReceiptAccountingColumnId(
  columnId: string,
): columnId is OfficialReceiptAccountingColumnId {
  return OfficialReceiptAccountingColumnIds.includes(
    columnId as OfficialReceiptAccountingColumnId,
  );
}

export function calculateCollectionColumnFitWidth({
  columnId,
  columnLabels,
  rows,
}: {
  columnId: OfficialReceiptCollectionColumnId;
  columnLabels: Record<OfficialReceiptCollectionColumnId, string>;
  rows: OfficialReceiptLineEntry[];
}) {
  const headerWidth = estimateTextWidth(columnLabels[columnId], 76);
  const contentWidth = rows.reduce(
    (currentWidth, row) =>
      Math.max(
        currentWidth,
        estimateTextWidth(getCollectionExportCell(row, columnId), 24),
      ),
    50,
  );

  return Math.max(headerWidth, contentWidth);
}

export function calculateAccountingColumnFitWidth({
  columnId,
  columnLabels,
  rows,
}: {
  columnId: OfficialReceiptAccountingColumnId;
  columnLabels: Record<OfficialReceiptAccountingColumnId, string>;
  rows: OfficialReceiptLineEntry[];
}) {
  const headerWidth = estimateTextWidth(columnLabels[columnId], 76);
  const contentWidth = rows.reduce(
    (currentWidth, row) =>
      Math.max(
        currentWidth,
        estimateTextWidth(getAccountingExportCell(row, columnId), 24),
      ),
    50,
  );

  return Math.max(headerWidth, contentWidth);
}

export function moveColumnId<TColumnId extends string>(
  columnOrder: TColumnId[],
  fromColumnId: TColumnId,
  toColumnId: TColumnId,
) {
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

    return columnOrder.filter((currentColumnId) =>
      nextVisibleIds.has(currentColumnId),
    );
  }

  if (visibleColumnIds.length <= 1) {
    return visibleColumnIds;
  }

  return visibleColumnIds.filter((currentColumnId) => currentColumnId !== columnId);
}

function getCollectionExportCell(
  entry: OfficialReceiptLineEntry,
  columnId: OfficialReceiptCollectionColumnId,
) {
  switch (columnId) {
    case "netOfVat":
      return formatOfficialReceiptAmount(calculateOfficialReceiptNetOfVat(entry));
    case "vatAmount":
      return formatOfficialReceiptAmount(calculateOfficialReceiptVatAmount(entry));
    case "cwtAmount":
      return formatOfficialReceiptAmount(calculateOfficialReceiptCwtAmount(entry));
    case "totalReceived":
      return formatOfficialReceiptAmount(calculateOfficialReceiptTotalReceived(entry));
    default:
      return String(entry[columnId] ?? "");
  }
}

function getAccountingExportCell(
  entry: OfficialReceiptLineEntry,
  columnId: OfficialReceiptAccountingColumnId,
) {
  return String(entry[columnId] ?? "");
}

function estimateTextWidth(value: string, padding: number) {
  return clampColumnWidth(value.trim().length * 7.5 + padding);
}

